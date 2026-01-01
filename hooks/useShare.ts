import { AdAnalysis } from '../types';
import { SHARE_PLATFORMS, SharePlatform } from '../utils/constants';

interface UseShareProps {
  addNotification: (notification: { type: 'success' | 'error' | 'info'; title: string; message: string }) => void;
}

export const useShare = ({ addNotification }: UseShareProps) => {
  const getShareLink = (platform: SharePlatform, text: string, url: string): string => {
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);

    switch (platform) {
      case SHARE_PLATFORMS.FACEBOOK:
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
      case SHARE_PLATFORMS.TWITTER:
        return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
      case SHARE_PLATFORMS.WHATSAPP:
        return `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
      case SHARE_PLATFORMS.EMAIL:
        return `mailto:?subject=Werkaholic%20AI%20-%20${encodeURIComponent(text.split('\n')[0])}&body=${encodedText}`;
      default:
        return '';
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addNotification({
        type: 'info',
        title: 'In Zwischenablage kopiert',
        message: 'Ergebnis wurde in die Zwischenablage kopiert.'
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      addNotification({
        type: 'error',
        title: 'Fehler',
        message: 'Konnte nicht in Zwischenablage kopieren.'
      });
    }
  };

  const shareResult = async (result: AdAnalysis, platform?: SharePlatform) => {
    const shareText = `Werkaholic AI Analyse: ${result.title}\nGeschätzter Wert: ${result.price_estimate}\nZustand: ${result.condition}\nKategorie: ${result.category}\n\nAnalysiert mit KI: ${result.description}`;
    const shareUrl = window.location.href;

    if (platform) {
      const shareLink = getShareLink(platform, shareText, shareUrl);
      if (shareLink) {
        window.open(shareLink, '_blank', 'width=600,height=400');
        return;
      }
    }

    // Native share API or fallback
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Werkaholic AI - ${result.title}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        await copyToClipboard(shareText);
      }
    } else {
      // Fallback: copy to clipboard
      await copyToClipboard(shareText);
    }
  };

  return { shareResult };
};