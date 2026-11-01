import { useCallback } from 'react';

export interface UseShareOptions {
  addNotification: (note: any) => void;
}

export const useShare = ({ addNotification }: UseShareOptions) => {
  const shareResult = useCallback((result: any) => {
    const shareText = `${result.title} - ${result.price_estimate}`;
    addNotification({
      type: 'success',
      title: 'Ergebnis geteilt',
      message: shareText,
    });
  }, [addNotification]);

  return { shareResult };
};
