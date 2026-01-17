import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface GoogleAdsProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: boolean;
  className?: string;
}

export const GoogleAds: React.FC<GoogleAdsProps> = ({
  slot,
  format = 'auto',
  responsive = true,
  className = ''
}) => {
  const { user, checkSubscription } = useAuth();
  const [isProUser, setIsProUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProStatus = async () => {
      try {
        if (user) {
          try {
            const sub = await checkSubscription(user.uid);
            setIsProUser(sub.plan === 'pro');
          } catch (error) {
            console.error('Fehler beim Prüfen des Abos:', error);
            setIsProUser(false);
          }
        } else {
          setIsProUser(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkProStatus();
  }, [user, checkSubscription]);

  useEffect(() => {
    if (!isLoading && !isProUser && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense Fehler:', err);
      }
    }
  }, [isLoading, isProUser]);

  // Keine Anzeigen für Pro-Nutzer
  if (isProUser) {
    return null;
  }

  // Keine Anzeigen für Gast-Nutzer (nur authentifizierte Nutzer mit Free-Plan)
  if (!user) {
    return null;
  }

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3967890602156036"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
};

// Declare global AdSense
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default GoogleAds;
