import React, { useState } from 'react';

export const FeedbackModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    // TODO: Send feedback to backend
    console.log('Feedback:', { rating, comment });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl p-8 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-white mb-6">Feedback</h2>
        <div className="mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setRating(i + 1)}
              className={`${rating > i ? 'text-yellow-500' : 'text-slate-500'} on-hover:text-yellow-400 cursor-pointer p-2`}
            >
              ★
            </button>
          ))}
        </div>
        <textarea
          placeholder="Ihre Kommentare..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="w-full p-3 border rounded mb-4 h-24 resize-none focus:outline-none focus:border-blue-500"
        />
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold"
          >
            Absenden
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
