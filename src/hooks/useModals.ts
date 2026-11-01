import { useCallback } from 'react';

export const useModals = useCallback(() => {
  const openAuthModal = () => {
    // TODO: Open auth modal
    console.log('Auth modal opened');
  };

  const openShareModal = () => {
    // TODO: Open share modal
    console.log('Share modal opened');
  };

  const closeAllModals = () => {
    // TODO: Close all modals
  };

  return { openAuthModal, openShareModal, closeAllModals };
}, []);
