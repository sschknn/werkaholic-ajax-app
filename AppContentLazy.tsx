import React, { useState, Suspense } from 'react';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { PaymentModal } from './components/PaymentModal';
import { ShareModal } from './components/ShareModal';
import { Layout } from './components/Layout';
import { AdAnalysis } from './types';
import { generatePDFReport, generateBulkPDFReport } from './utils/pdfGenerator';
import { NotificationContainer } from './components/NotificationContainer';
import { FeedbackModal } from './components/FeedbackModal';
import { useNotifications } from './contexts/NotificationContext';
import Loading from './components/Loading';

// Lazy loading der View-Komponenten für bessere Performance
const Dashboard = React.lazy(() => import('./components/DashboardView'));
const ScannerView = React.lazy(() => import('./components/ScannerView'));
const HistoryView = React.lazy(() => import('./components/HistoryView'));
const SettingsView = React.lazy(() => import('./components/SettingsView'));

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { addNotification, sendPushNotification } = useNotifications();
  const [currentView, setCurrentView] = useState('dashboard');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<AdAnalysis | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AdAnalysis[]>([]);

  const handleAnalysisComplete = (result: AdAnalysis, image: string) => {
    setAnalysisResults(prev => [result, ...prev]);
    console.log('Analysis completed:', result);

    // Show success notification
    addNotification({
      type: 'success',
      title: 'Analyse erfolgreich!',
      message: `${result.title} wurde erfolgreich analysiert.`,
      action: {
        label: 'Ansehen',
        onClick: () => setCurrentView('history')
      }
    });

    // Send push notification if permission granted
    sendPushNotification('Werkaholic AI', {
      body: `${result.title} - ${result.price_estimate}`,
      icon: '/favicon.ico',
      badge: '/favicon.ico'
    });
  };

  const handleCancel = () => {
    // Handle cancel if needed
  };

  const clearResults = () => {
    setAnalysisResults([]);
  };

  const openShareModal = (result: AdAnalysis) => {
    setSelectedResult(result);
    setShowShareModal(true);
  };

  const handleShare = async (result: AdAnalysis, platform?: string) => {
    const shareText = `Werkaholic AI Analyse: ${result.title}\nGeschätzter Wert: ${result.price_estimate}\nZustand: ${result.condition}\nKategorie: ${result.category}\n\nAnalysiert mit KI: ${result.description}`;
    const shareUrl = window.location.href;

    if (platform) {
      // Platform-specific sharing
      const encodedText = encodeURIComponent(shareText);
      const encodedUrl = encodeURIComponent(shareUrl);

      let shareLink = '';

      switch (platform) {
        case 'facebook':
          shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
          break;
        case 'twitter':
          shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
          break;
        case 'whatsapp':
          shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
          break;
        case 'email':
          shareLink = `mailto:?subject=Werkaholic%20AI%20-%20${encodeURIComponent(result.title)}&body=${encodedText}`;
          break;
        default:
          break;
      }

      if (shareLink) {
        window.open(shareLink, '_blank', 'width=600,height=400');
        setShowShareModal(false);
        return;
      }
    }

    // Native share API or fallback
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Werkaholic AI - ${result.title}`,
          text: shareText,
          url: shareUrl,
        });
        setShowShareModal(false);
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        alert('Ergebnis in Zwischenablage kopiert!');
        setShowShareModal(false);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      alert('Ergebnis in Zwischenablage kopiert!');
      setShowShareModal(false);
    }
  };

  const downloadResult = async (result: AdAnalysis) => {
    try {
      await generatePDFReport(result);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to JSON download
      const dataStr = JSON.stringify(result, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analyse.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const downloadBulkReport = async () => {
    if (analysisResults.length === 0) return;

    try {
      await generateBulkPDFReport(analysisResults);
    } catch (error) {
      console.error('Error generating bulk PDF:', error);
      // Fallback to JSON download
      const dataStr = JSON.stringify(analysisResults, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `werkaholic_ai_sammelbericht_${new Date().toISOString().split('T')[0]}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  if (loading) {
    return <Loading message="Authentifizierung läuft..." />;
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-8">Werkaholic AI</h1>
            <p className="text-slate-400 mb-8">KI-gestützte Werbeanalyse</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg"
            >
              Jetzt starten
            </button>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  const renderCurrentView = () => {
    const viewProps = {
      analysisResults,
      onAnalysisComplete: handleAnalysisComplete,
      onCancel: handleCancel,
      onClearResults: clearResults,
      onShareResult: openShareModal,
      onDownloadResult: downloadResult,
      onDownloadBulkReport: downloadBulkReport,
      onFeedbackClick: () => setShowFeedbackModal(true),
    };

    switch (currentView) {
      case 'dashboard':
        return (
          <Suspense fallback={<Loading message="Dashboard wird geladen..." />}>
            <Dashboard {...viewProps} />
          </Suspense>
        );
      case 'scanner':
        return (
          <Suspense fallback={<Loading message="Scanner wird vorbereitet..." />}>
            <ScannerView 
              onAnalysisComplete={handleAnalysisComplete} 
              onCancel={handleCancel} 
            />
          </Suspense>
        );
      case 'history':
        return (
          <Suspense fallback={<Loading message="Verlauf wird geladen..." />}>
            <HistoryView
              analysisResults={analysisResults}
              onClearResults={clearResults}
              onShareResult={openShareModal}
              onDownloadResult={downloadResult}
            />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<Loading message="Einstellungen werden geladen..." />}>
            <SettingsView onFeedbackClick={() => setShowFeedbackModal(true)} />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<Loading message="Dashboard wird geladen..." />}>
            <Dashboard {...viewProps} />
          </Suspense>
        );
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderCurrentView()}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          console.log('Payment successful!');
        }}
      />

      {selectedResult && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          result={selectedResult}
          onShare={handleShare}
        />
      )}

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      <NotificationContainer />
    </Layout>
  );
};

export default AppContent;