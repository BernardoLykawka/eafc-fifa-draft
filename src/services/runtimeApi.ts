import Papa from 'papaparse';
import type { DraftState, ElectronAPI, Player } from '../types';

const DB_NAME = 'eafc-draft-tool';
const DB_VERSION = 1;
const STORE_NAME = 'drafts';
const DRAFT_KEY = 'draftState';

const mapPlayerRow = (row: Record<string, string>): Player => ({
  player_id: row.player_id,
  fifa_version: row.fifa_version ? row.fifa_version.trim() : '',
  fifa_update: row.fifa_update || '',
  short_name: row.short_name || '',
  long_name: row.long_name || '',
  player_positions: row.player_positions || '',
  overall: parseInt(row.overall, 10) || 0,
  potential: parseInt(row.potential, 10) || 0,
  age: parseInt(row.age, 10) || 0,
  height_cm: parseInt(row.height_cm, 10) || 0,
  club_name: row.club_name || '',
  nationality_name: row.nationality_name || '',
  preferred_foot: row.preferred_foot || '',
  skill_moves: parseInt(row.skill_moves, 10) || 0,
});

const parsePlayers = (csvText: string, version: string | null): Promise<Player[]> =>
  new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        let players = results.data
          .filter((row) => row && row.player_id)
          .map(mapPlayerRow);

        if (version !== null) {
          players = players.filter((player) => player.fifa_version === version);
        }

        const playersByName = new Map<string, Player>();
        players.forEach((player) => {
          if (!player.short_name) return;

          const existing = playersByName.get(player.short_name);
          if (!existing || player.overall > existing.overall) {
            playersByName.set(player.short_name, player);
          }
        });

        resolve(
          Array.from(playersByName.values()).sort(
            (a, b) => b.overall - a.overall
          )
        );
      },
      error: reject,
    });
  });

const openDraftDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const withDraftStore = async <T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
  const db = await openDraftDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = operation(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

const browserApi: ElectronAPI = {
  async loadCSV(version) {
    const response = await fetch(`${import.meta.env.BASE_URL}male_players.csv`);

    if (!response.ok) {
      throw new Error(`Failed to load player database (${response.status})`);
    }

    return parsePlayers(await response.text(), version);
  },

  async saveDraft(state) {
    await withDraftStore('readwrite', (store) => store.put(state, DRAFT_KEY));
  },

  async loadDraft() {
    return withDraftStore<DraftState | null>('readonly', (store) =>
      store.get(DRAFT_KEY)
    );
  },

  async clearDraft() {
    await withDraftStore('readwrite', (store) => store.delete(DRAFT_KEY));
  },
};

const getElectronApi = (): ElectronAPI | undefined =>
  typeof window !== 'undefined' ? window.electronAPI : undefined;

export const runtimeApi: ElectronAPI = {
  loadCSV: (version) => getElectronApi()?.loadCSV(version) ?? browserApi.loadCSV(version),
  saveDraft: (state) => getElectronApi()?.saveDraft(state) ?? browserApi.saveDraft(state),
  loadDraft: () => getElectronApi()?.loadDraft() ?? browserApi.loadDraft(),
  clearDraft: () => getElectronApi()?.clearDraft() ?? browserApi.clearDraft(),
};
