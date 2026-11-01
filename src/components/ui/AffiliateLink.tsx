import React from 'react';

export const AffiliateLink: React.FC<{ code: string; price: number }> = ({ code, price }) => {
  const commission = price * 0.02;
  const netPrice = price - commission;

  return (
    <div className="affiliate-box">
      <p>
        <strong>Jetzt kaufen und mich unterstützen:</strong>
      </p>
      <p>
        Nutze den Code: <strong>{code}</strong>
      </p>
      <p>
        Provision: <strong>{commission.toFixed(2)}€</strong> von
        {price.toFixed(2)}€
      </p>
      <a
        href={`https://werkaholic.ai?affiliate=${code}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-affiliate"
      >
        Über diesen Link kaufen
      </a>
    </div>
  );
};