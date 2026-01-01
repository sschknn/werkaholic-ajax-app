import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Play, Pause, Download, FileText, BarChart3, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui';
import { Button } from './ui/Button';
import { AdAnalysis, BatchJob, BatchResult, BatchQueueItem } from '../types';
import { useNotifications } from '../contexts/NotificationContext';

interface BatchViewProps {
  onAnalysisComplete?: (results: AdAnalysis[]) => void;
}

const BatchView: React.FC<BatchViewProps> = ({ onAnalysisComplete }) => {
  const { addNotification } = useNotifications();
  const [isDragOver, setIsDragOver] = useState(false);
  const [queue, setQueue] = useState<BatchQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJob, setCurrentJob] = useState<BatchJob | null>(null);
  const [completedJobs, setCompletedJobs] = useState<BatchJob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const fileList = e.dataTransfer.files;
    const files: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.type.startsWith('image/')) {
        files.push(file);
      }
    }

    if (files.length === 0) {
      addNotification({
        type: 'error',
        title: 'Ungültige Dateien',
        message: 'Bitte nur Bilddateien hochladen.',
      });
      return;
    }

    addImagesToQueue(files);
  }, []);

  const addImagesToQueue = (files: File[]) => {
    const newItems: BatchQueueItem[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      image: file,
      imageName: file.name,
      status: 'queued',
      progress: 0,
    }));

    setQueue(prev => [...prev, ...newItems]);

    addNotification({
      type: 'success',
      title: 'Bilder hinzugefügt',
      message: `${files.length} Bilder zur Warteschlange hinzugefügt.`,
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      addImagesToQueue(Array.from(files));
    }
  };

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const startBatchProcessing = async () => {
    if (queue.length === 0) return;

    setIsProcessing(true);
    const jobId = `batch-${Date.now()}`;
    const newJob: BatchJob = {
      id: jobId,
      name: `Batch-Analyse ${new Date().toLocaleString('de-DE')}`,
      status: 'processing',
      createdAt: new Date().toISOString(),
      totalImages: queue.length,
      processedImages: 0,
      results: [],
    };

    setCurrentJob(newJob);

    // Simulate batch processing with parallel processing
    const concurrency = 3; // Process 3 images simultaneously
    const chunks = [];
    for (let i = 0; i < queue.length; i += concurrency) {
      chunks.push(queue.slice(i, i + concurrency));
    }

    for (const chunk of chunks) {
      await Promise.all(chunk.map(async (item) => {
        await processImage(item, jobId);
      }));
    }

    // Complete job
    const completedJob = {
      ...newJob,
      status: 'completed' as const,
      completedAt: new Date().toISOString(),
      processedImages: queue.length,
    };

    setCurrentJob(null);
    setCompletedJobs(prev => [completedJob, ...prev]);
    setIsProcessing(false);
    setQueue([]);

    addNotification({
      type: 'success',
      title: 'Batch-Analyse abgeschlossen',
      message: `${queue.length} Bilder erfolgreich analysiert.`,
    });

    if (onAnalysisComplete) {
      onAnalysisComplete(completedJob.results.map(r => r.analysis!).filter(Boolean));
    }
  };

  const processImage = async (item: BatchQueueItem, jobId: string): Promise<void> => {
    return new Promise((resolve) => {
      // Update status to processing
      setQueue(prev => prev.map(q =>
        q.id === item.id ? { ...q, status: 'processing' as const, progress: 10 } : q
      ));

      // Simulate processing time
      setTimeout(() => {
        setQueue(prev => prev.map(q =>
          q.id === item.id ? { ...q, progress: 50 } : q
        ));

        setTimeout(() => {
          // Mock analysis result
          const mockResult: AdAnalysis = {
            item_detected: true,
            title: `Analysiertes Produkt aus ${item.imageName}`,
            price_estimate: `${Math.floor(Math.random() * 200) + 50}€`,
            condition: ['Neu', 'Gut', 'Gebraucht'][Math.floor(Math.random() * 3)],
            category: 'Elektronik',
            description: `KI-Analyse von ${item.imageName}`,
            keywords: ['test', 'batch', 'analyse'],
            reasoning: 'Automatisch generierte Analyse',
          };

          setQueue(prev => prev.map(q =>
            q.id === item.id ? {
              ...q,
              status: 'completed' as const,
              progress: 100,
              result: mockResult
            } : q
          ));

          // Update job progress
          setCurrentJob(prev => prev ? {
            ...prev,
            processedImages: prev.processedImages + 1,
            results: [...prev.results, {
              id: item.id,
              image: item.image instanceof File ? URL.createObjectURL(item.image) : item.image,
              imageName: item.imageName,
              status: 'completed',
              analysis: mockResult,
              processingTime: 2000,
            }]
          } : null);

          resolve();
        }, 1000);
      }, 500);
    });
  };

  const exportToCSV = () => {
    if (!currentJob && completedJobs.length === 0) return;

    const results = currentJob ? currentJob.results : completedJobs[0]?.results || [];
    if (results.length === 0) return;

    const csvContent = [
      ['Dateiname', 'Titel', 'Preis', 'Zustand', 'Kategorie', 'Beschreibung'].join(','),
      ...results.map(r => [
        r.imageName,
        r.analysis?.title || '',
        r.analysis?.price_estimate || '',
        r.analysis?.condition || '',
        r.analysis?.category || '',
        r.analysis?.description || '',
      ].map(field => `"${field.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `batch-analyse-${Date.now()}.csv`;
    link.click();
  };

  const exportToExcel = () => {
    // For now, use CSV export - in a real app, you'd use a library like xlsx
    exportToCSV();
    addNotification({
      type: 'info',
      title: 'Excel-Export',
      message: 'Excel-Export wird als CSV bereitgestellt.',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Batch-Analyse
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Mehrere Bilder gleichzeitig analysieren und vergleichen
        </p>
      </div>

      {/* Upload Area */}
      <Card variant="glass" className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              isDragOver
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-semibold mb-2">
              Bilder hier ablegen oder klicken zum Auswählen
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Unterstützt JPG, PNG, GIF und WebP
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Bilder für Batch-Analyse auswählen"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="primary"
              size="lg"
            >
              Bilder auswählen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Queue Management */}
      {queue.length > 0 && (
        <Card variant="glass" className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Warteschlange ({queue.length})</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  onClick={clearQueue}
                  variant="outline"
                  size="sm"
                  disabled={isProcessing}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Leeren
                </Button>
                <Button
                  onClick={startBatchProcessing}
                  variant="primary"
                  size="sm"
                  disabled={isProcessing}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {item.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {item.status === 'processing' && <Clock className="w-5 h-5 text-blue-500 animate-spin" />}
                    {item.status === 'failed' && <AlertCircle className="w-5 h-5 text-red-500" />}
                    {item.status === 'queued' && <div className="w-5 h-5 rounded-full bg-slate-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.imageName}</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => removeFromQueue(item.id)}
                    variant="ghost"
                    size="sm"
                    disabled={isProcessing}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Job Progress */}
      {currentJob && (
        <Card variant="glass" className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Aktuelle Batch-Analyse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>{currentJob.processedImages} / {currentJob.totalImages} Bilder</span>
                <span>{Math.round((currentJob.processedImages / currentJob.totalImages) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(currentJob.processedImages / currentJob.totalImages) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Jobs */}
      {completedJobs.length > 0 && (
        <Card variant="glass" className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Abgeschlossene Analysen</CardTitle>
              <div className="flex space-x-2">
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  CSV Export
                </Button>
                <Button onClick={exportToExcel} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Excel Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedJobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{job.name}</h4>
                    <span className="text-sm text-slate-500">
                      {new Date(job.createdAt).toLocaleString('de-DE')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {job.processedImages} Bilder analysiert
                  </p>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {job.results.slice(0, 6).map((result) => (
                      <div key={result.id} className="bg-slate-50 dark:bg-slate-800 rounded p-3">
                        <p className="text-sm font-medium truncate">{result.imageName}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {result.analysis?.price_estimate}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BatchView;