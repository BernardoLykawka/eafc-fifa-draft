import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import started from 'electron-squirrel-startup';
import Store from 'electron-store';
import Papa from 'papaparse';
import type { Player, DraftState } from './types';

const store = new Store();

if (started) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(__dirname, '../../public/icon_novo.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.maximize();

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
};

ipcMain.handle('load-csv', async (_, version: string | null) => {
  // In production, CSV is in resources folder; in dev, it's in public folder
  const csvPath = app.isPackaged
    ? path.join(process.resourcesPath, 'public/male_players.csv')
    : path.join(__dirname, '../../public/male_players.csv'); 


  if (!csvPath) {
    const errorMsg = 'CSV file path is invalid.';
    console.error(errorMsg);
    return Promise.reject(new Error(errorMsg));
  }
  
  return new Promise<Player[]>((resolve, reject) => {
    try {
      const fileContent = fs.readFileSync(csvPath!, 'utf-8');
      
      Papa.parse<any>(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          let players: Player[] = results.data
            .filter((row: any) => row && row.player_id)
            .map((row: any) => ({
              player_id: row.player_id,
              fifa_version: row.fifa_version ? row.fifa_version.trim() : '',
              fifa_update: row.fifa_update || '',
              short_name: row.short_name || '',
              long_name: row.long_name || '',
              player_positions: row.player_positions || '',
              overall: parseInt(row.overall) || 0,
              potential: parseInt(row.potential) || 0,
              age: parseInt(row.age) || 0,
              height_cm: parseInt(row.height_cm) || 0,
              club_name: row.club_name || '',
              nationality_name: row.nationality_name || '',
              preferred_foot: row.preferred_foot || '',
              skill_moves: parseInt(row.skill_moves) || 0,
            } as Player));
          
          
          if (version !== null) {
            const beforeFilter = players.length;
            players = players.filter((p) => p.fifa_version === version);
          }
      
          const playersByName = new Map<string, Player>();
          players.forEach((p) => {
            if (!p.short_name) return;
            const existing = playersByName.get(p.short_name);
            if (!existing || p.overall > existing.overall) {
              playersByName.set(p.short_name, p);
            }
          });
          
          const uniquePlayers = Array.from(playersByName.values())
            .sort((a, b) => b.overall - a.overall);
          
          resolve(uniquePlayers);
        },
        error: (error: any) => {
          console.error('Papa parse error:', error);
          reject(error);
        },
      });
    } catch (error) {
      console.error('Error reading CSV:', error);
      reject(error);
    }
  });
});

ipcMain.handle('save-draft', async (_, state: DraftState) => {
  store.set('draftState', state);
});

ipcMain.handle('load-draft', async () => {
  return store.get('draftState', null) as DraftState | null;
});

ipcMain.handle('clear-draft', async () => {
  store.delete('draftState');
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
