import React from 'react';
import { Sparkles } from 'lucide-react';
import { Card, CardContent } from './ui';
import Scanner from './Scanner';
import { AdAnalysis } from '../types';

interface ScannerViewProps {
  onAnalysisComplete: (result: AdAnalysis, image: string) => void;
  onCancel: () => void;
}

const ScannerView: React.FC<ScannerViewProps> = ({ onAnalysisComplete, onCancel }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          <Sparkles className="w-8 h-8" />
          <h1 className="text-4xl font-bold">KI-Scanner</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Analysiere Produkte mit fortschrittlicher künstlicher Intelligenz
        </p>
      </div>

      <Card variant="glass" className="max-w-4xl mx-auto">
        <CardContent className="p-0">
          <Scanner
            onAnalysisComplete={onAnalysisComplete}
            onCancel={onCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ScannerView;