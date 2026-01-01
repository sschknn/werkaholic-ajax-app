import { useState } from 'react';
import { AdAnalysis } from '../types';

export const useModals = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAdView, setShowAdView] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<AdAnalysis | null>(null);
  const [selectedAdImage, setSelectedAdImage] = useState<string>('');
  const [selectedPlatformImages, setSelectedPlatformImages] = useState<string[]>([]);

  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);

  const openPaymentModal = () => setShowPaymentModal(true);
  const closePaymentModal = () => setShowPaymentModal(false);

  const openShareModal = (result: AdAnalysis) => {
    setSelectedResult(result);
    setShowShareModal(true);
  };
  const closeShareModal = () => {
    setShowShareModal(false);
    setSelectedResult(null);
  };

  const openFeedbackModal = () => setShowFeedbackModal(true);
  const closeFeedbackModal = () => setShowFeedbackModal(false);

  const openAdView = (result: AdAnalysis, imageData: string = '') => {
    console.log('🔄 Open AdView called for result:', result.title);
    setSelectedResult(result);
    setSelectedAdImage(imageData);
    setShowAdView(true);
    console.log('✅ AdView opened');
  };

  const closeAdView = () => {
    setShowAdView(false);
    setSelectedResult(null);
    setSelectedAdImage('');
  };

  const openPlatformModal = (result: AdAnalysis, images: string[] = []) => {
    setSelectedResult(result);
    setSelectedPlatformImages(images);
    setShowPlatformModal(true);
  };

  const closePlatformModal = () => {
    setShowPlatformModal(false);
    setSelectedResult(null);
    setSelectedPlatformImages([]);
  };

  return {
    // States
    showAuthModal,
    showPaymentModal,
    showShareModal,
    showFeedbackModal,
    showAdView,
    showPlatformModal,
    selectedResult,
    selectedAdImage,
    selectedPlatformImages,

    // Actions
    openAuthModal,
    closeAuthModal,
    openPaymentModal,
    closePaymentModal,
    openShareModal,
    closeShareModal,
    openFeedbackModal,
    closeFeedbackModal,
    openAdView,
    closeAdView,
    openPlatformModal,
    closePlatformModal,
  };
};