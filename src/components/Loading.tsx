import React from 'react';

const Loading: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-slate-800 rounded-2xl p-8 text-center">
        <div className="spinner animate-spin w-16 h-16 mx-auto mb-4 border-4 border-white border-t-transparent"></div>
        <p className="text-white">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
