import { useEffect } from 'react';
import type { DraftState } from '../types';

interface UseDraftPersistenceParams {
  draftActive: boolean;
  draftState: DraftState;
  onRestore: (state: DraftState) => void;
}

export const useDraftPersistence = ({
  draftActive,
  draftState,
  onRestore,
}: UseDraftPersistenceParams) => {
  // Load saved draft on mount
  useEffect(() => {
    const loadSavedDraft = async () => {
      const savedState = await window.electronAPI.loadDraft();
      if (savedState && savedState.draftActive) {
        const shouldRestore = confirm(
          'We found a saved draft. Do you want to continue from where you left off?'
        );
        if (shouldRestore) {
          onRestore(savedState);
        } else {
          await window.electronAPI.clearDraft();
        }
      }
    };
    loadSavedDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save draft state
  useEffect(() => {
    if (draftActive && draftState.teams.length > 0) {
      window.electronAPI.saveDraft(draftState);
    }
  }, [draftActive, draftState]);

  const clearDraft = async () => {
    await window.electronAPI.clearDraft();
  };

  return { clearDraft };
};
