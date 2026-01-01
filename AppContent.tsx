import React, { useState, Suspense } from 'react';
import { useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { PaymentModal } from './components/PaymentModal';
import { ShareModal } from './components/ShareModal';
import { Layout } from './components/Layout';
import { AdAnalysis } from './types';
import { NotificationContainer } from './components/NotificationContainer';
import { FeedbackModal } from './components/FeedbackModal';
import OnboardingModal from './components/OnboardingModal';
import PlatformModal from './components/PlatformModal';
import { useNotifications } from './contexts/NotificationContext';
import { useOnboarding } from './contexts/OnboardingContext';
import Loading from './components/Loading';
import { VIEWS, ViewType } from './utils/constants';
import { useShare } from './hooks/useShare';
import { useDownloads } from './hooks/useDownloads';
import { useModals } from './hooks/useModals';
import { FirestoreService } from './services/firestoreService';
import { HistoryItem } from './types';

// Lazy loading der View-Komponenten für bessere Performance
const AnalyticsDashboard = React.lazy(() => import('./components/AnalyticsDashboard'));
const ScannerView = React.lazy(() => import('./components/ScannerView'));
const MarketplaceView = React.lazy(() => import('./components/MarketplaceView'));
const HistoryView = React.lazy(() => import('./components/HistoryView'));
const ComparisonView = React.lazy(() => import('./components/ComparisonView'));
const BatchView = React.lazy(() => import('./components/BatchView'));
const SettingsView = React.lazy(() => import('./components/SettingsView'));
const AdView = React.lazy(() => import('./components/AdView'));

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { addNotification, sendPushNotification } = useNotifications();
  const { showOnboardingModal, setShowOnboardingModal, completeStep } = useOnboarding();
  const [currentView, setCurrentView] = useState<ViewType>(VIEWS.DASHBOARD);
  const [analysisResults, setAnalysisResults] = useState<AdAnalysis[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Custom hooks for better separation of concerns
  const modals = useModals();
  const { shareResult } = useShare({ addNotification });
  const {
    downloadResult,
    downloadBulkReport,
    downloadKleinanzeigenZIP,
    openKleinanzeige,
  } = useDownloads({ addNotification });

  const handleAnalysisComplete = (result: AdAnalysis, image: string) => {
    setAnalysisResults(prev => [result, ...prev]);
    console.log('Analysis completed:', result);

    // Complete onboarding step for first scan
    if (analysisResults.length === 0) {
      completeStep('first_scan');
    }

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
    setCurrentView(VIEWS.DASHBOARD);
  };

  const clearResults = () => {
    setAnalysisResults([]);
  };

  const saveAdResult = (updatedResult: AdAnalysis) => {
    // Update the result in the analysisResults array
    setAnalysisResults(prev =>
      prev.map(result =>
        result.title === updatedResult.title ? updatedResult : result
      )
    );
  };

  const handleOnboardingClose = () => {
    setShowOnboardingModal(false);
  };

  // Load persistent data when user changes
  React.useEffect(() => {
    const loadUserData = async () => {
      if (user?.uid) {
        setIsLoadingHistory(true);
        try {
          // Migrate old localStorage data if needed
          await FirestoreService.migrateLocalData(user.uid);

          // Load user's history from Firestore
          const history = await FirestoreService.getUserHistory(user.uid);
          setHistoryItems(history);

          // Convert history items to analysis results for backward compatibility
          const analyses = history.map(item => ({
            ...item.analysis,
            id: item.id,
            image: item.image,
          }));
          setAnalysisResults(analyses);

          console.log(`Loaded ${history.length} history items from Firestore`);
        } catch (error) {
          console.error('Failed to load user data:', error);
          addNotification({
            type: 'error',
            title: 'Fehler beim Laden',
            message: 'Ihre Daten konnten nicht geladen werden.',
          });
        } finally {
          setIsLoadingHistory(false);
        }
      } else {
        // Clear data when user logs out
        setHistoryItems([]);
        setAnalysisResults([]);
      }
    };

    loadUserData();
  }, [user?.uid, addNotification]);

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
              onClick={modals.openAuthModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg"
            >
              Jetzt starten
            </button>
          </div>
        </div>
        <AuthModal
          isOpen={modals.showAuthModal}
          onClose={modals.closeAuthModal}
        />
      </>
    );
  }

  const viewComponents = {
    dashboard: AnalyticsDashboard,
    scanner: ScannerView,
    marketplace: MarketplaceView,
    history: HistoryView,
    comparison: ComparisonView,
    batch: BatchView,
    settings: SettingsView,
  };

  const viewProps = {
    dashboard: {
      analysisResults,
      onDownloadBulkReport: downloadBulkReport,
      onDownloadKleinanzeigenZIP: downloadKleinanzeigenZIP,
      onAnalysisComplete: handleAnalysisComplete,
      onOpenKleinanzeige: openKleinanzeige,
      onNavigateToComparison: () => setCurrentView(VIEWS.COMPARISON),
    },
    scanner: {
      onAnalysisComplete: handleAnalysisComplete,
      onCancel: handleCancel,
    },
    marketplace: {
      analysisResults,
      onCreateAd: modals.openAdView,
      onViewAd: modals.openAdView,
    },
    history: {
      analysisResults,
      historyItems,
      onClearResults: clearResults,
      onShareResult: modals.openShareModal,
      onDownloadResult: downloadResult,
      onOpenResult: modals.openAdView,
      isLoading: isLoadingHistory,
    },
    comparison: {
      analysisResults,
      onBack: () => setCurrentView(VIEWS.DASHBOARD),
    },
    batch: {
      onAnalysisComplete: (results: AdAnalysis[]) => {
        setAnalysisResults(prev => [...results, ...prev]);
        addNotification({
          type: 'success',
          title: 'Batch-Analyse abgeschlossen',
          message: `${results.length} Analysen wurden hinzugefügt.`,
        });
      },
    },
    settings: {
      onFeedbackClick: modals.openFeedbackModal,
    },
  };

  const renderCurrentView = () => {
    const ViewComponent = viewComponents[currentView] || AnalyticsDashboard;
    const props = viewProps[currentView] || viewProps.dashboard;

    return <ViewComponent {...props} />;
  };

  return (
    <>
      <OnboardingModal
        isOpen={showOnboardingModal && !!user}
        onClose={handleOnboardingClose}
      />

      <Layout currentView={currentView} onViewChange={setCurrentView} analysisResults={analysisResults}>
        {renderCurrentView()}

        <PaymentModal
          isOpen={modals.showPaymentModal}
          onClose={modals.closePaymentModal}
          onSuccess={() => {
            console.log('Payment successful!');
          }}
        />

        {modals.selectedResult && (
          <ShareModal
            isOpen={modals.showShareModal}
            onClose={modals.closeShareModal}
            result={modals.selectedResult}
            onShare={shareResult}
          />
        )}

        <FeedbackModal
          isOpen={modals.showFeedbackModal}
          onClose={modals.closeFeedbackModal}
        />

        {modals.selectedResult && (
          <PlatformModal
            isOpen={modals.showPlatformModal}
            onClose={modals.closePlatformModal}
            analysis={modals.selectedResult}
            images={modals.selectedPlatformImages}
          />
        )}

        <NotificationContainer />
      </Layout>

      {/* AdView - Full screen overlay */}
      {modals.showAdView && modals.selectedResult && (
        <Suspense fallback={<Loading message="Inserat wird geladen..." />}>
          <AdView
            result={modals.selectedResult}
            imageData={modals.selectedAdImage}
            onBack={modals.closeAdView}
            onSave={saveAdResult}
            onPublish={modals.openPlatformModal}
          />
        </Suspense>
      )}

      {/* Debug: Show AdView trigger button if no results exist */}
      {analysisResults.length === 0 && (
        <div className="fixed bottom-5 right-5 z-[9999]">
          <button
            onClick={() => {
              // Create a test result for debugging
              const testResult = {
                item_detected: true,
                title: "Test Inserat",
                price_estimate: "99€",
                condition: "Gut",
                category: "Elektronik",
                description: "Dies ist ein Test-Inserat für Debugging-Zwecke.",
                keywords: ["test", "debug", "inserat"],
                reasoning: "Test-Daten für Debugging"
              };
              modals.openAdView(testResult, '');
            }}
            className="px-5 py-2.5 bg-blue-600 text-white border-none rounded-lg cursor-pointer hover:bg-blue-700"
          >
            🐛 Debug: AdView öffnen
          </button>
        </div>
      )}
    </>
  );
};

export default AppContent;