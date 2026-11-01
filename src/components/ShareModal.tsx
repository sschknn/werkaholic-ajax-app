import React, { useState } from 'react';

export const ShareModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [text, setText] = useState('');

  const handleShare = () => {
    if (!text) return;
    navigator.share ? navigator.share({ text }) : alert('Text to share: ' + text);
    setText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl p-8 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-white mb-6">Teilen</h2>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholderLink="Link zum Produkt teilen"
          className="w-full p-3 border rounded mb-4 h-24 resize-none focus:outline-none focus:border-blue-500"
        />
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold"
          >
            Teilen
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-3 rounded-xl font-bold"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};
