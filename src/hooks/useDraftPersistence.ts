import { useEffect } from 'react';
import type { DraftState } from '../types';
import { runtimeApi } from '../services/runtimeApi';

interface UseDraftPersistenceParams {
  draftActive: boolean;
  draftState: DraftState;
}

export const useDraftPersistence = ({
  draftActive,
  draftState,
}: UseDraftPersistenceParams) => {
  useEffect(() => {
    if (draftState.teams.length > 0) {
      runtimeApi.saveDraft(draftState);
    }
  }, [draftState]);

  const clearDraft = async () => {
    await runtimeApi.clearDraft();
  };

  const saveDraft = async () => {
    if (!draftActive && draftState.teams.length === 0) return;

    await runtimeApi.saveDraft(draftState);
  };

  const loadSavedDraft = async () => {
    return runtimeApi.loadDraft();
  };

  return { clearDraft, saveDraft, loadSavedDraft };
};
