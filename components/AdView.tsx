import React, { useState } from 'react';
import { AdAnalysis } from '../types';
import AdEditorView from './AdEditorView';

interface AdViewProps {
  result: AdAnalysis;
  imageData: string;
  onBack: () => void;
  onSave: (updatedResult: AdAnalysis, newImageData?: string) => void;
  onPublish?: (analysis: AdAnalysis, images: string[]) => void;
}

const AdView: React.FC<AdViewProps> = ({ result, imageData, onBack, onSave, onPublish }) => {
  const [currentImages, setCurrentImages] = useState<string[]>([imageData]);

  const handleSave = (updatedResult: AdAnalysis, newImageData?: string) => {
    if (newImageData) {
      setCurrentImages([newImageData]);
    }
    onSave(updatedResult, newImageData);
  };

  const handlePublish = () => {
    if (onPublish) {
      onPublish(result, currentImages);
    }
  };

  return (
    <AdEditorView
      analysis={result}
      imageData={imageData}
      onSave={handleSave}
      onCancel={onBack}
      onPublish={onPublish ? handlePublish : undefined}
    />
  );
};

export default AdView;