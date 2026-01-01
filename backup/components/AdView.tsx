import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AdViewProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: boolean;
  className?: string;
}

export const AdView: React.FC<AdViewProps> = ({
  slot,
  format = 'auto',
  responsive = true,
  className = ''
}) => {
  const { user, checkSubscription } = useAuth();
  const [isProUser, setIsProUser] = useState(false);

  useEffect(() => {
    const checkProStatus = async () => {
      if (user) {
        try {
          const sub = await checkSubscription(user.uid);
          setIsProUser(sub.plan === 'pro');
        } catch (error) {
          console.error('Error checking subscription:', error);
          // Show ads if error checking subscription
          setIsProUser(false);
        }
      } else {
        // Show ads for non-logged in users
        setIsProUser(false);
      }
    };
    checkProStatus();
  }, [user, checkSubscription]);

  useEffect(() => {
    if (!isProUser && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [isProUser]);

  // Don't render ads for Pro users
  if (isProUser) {
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
      {/* Fallback for testing */}
      <div style={{ padding: '10px', background: '#f0f0f0', border: '1px solid #ccc', textAlign: 'center', fontSize: '12px' }}>
        Google AdSense Ad - {slot}
      </div>
    </div>
  );
};

// Declare global AdSense
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}