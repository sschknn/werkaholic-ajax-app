import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = "Lade..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-white text-xl font-medium">{message}</p>
        <div className="flex items-center justify-center space-x-1">
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          <span className="text-blue-300 text-sm">Optimiere für mobile Geräte...</span>
        </div>
      </div>
    </div>
  );
};

export default Loading;
