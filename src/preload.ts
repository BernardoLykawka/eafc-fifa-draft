import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI, Player, DraftState } from './types';

const electronAPI: ElectronAPI = {
  loadCSV: (version: string | null) => ipcRenderer.invoke('load-csv', version),
  saveDraft: (state: DraftState) => ipcRenderer.invoke('save-draft', state),
  loadDraft: () => ipcRenderer.invoke('load-draft'),
  clearDraft: () => ipcRenderer.invoke('clear-draft'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
