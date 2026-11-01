import React, { useState, Suspense } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { AuthModal } from '@components/ui/AuthModal';
import { PaymentModal } from '@components/ui/PaymentModal';
import { ShareModal } from '@components/ui/ShareModal';
import { Layout } from '@components/ui/Layout';
import { AdAnalysis } from '@types';
import { generatePDFReport, generateBulkPDFReport } from '@utils/pdfGenerator';
import { NotificationContainer } from '@components/ui/NotificationContainer';
import { FeedbackModal } from '@components/ui/FeedbackModal';
import { useNotifications } from '@hooks/useNotifications';
import Loading from '@components/ui/Loading';

// Lazy loading der View-Komponenten für bessere Performance
const Dashboard = React.lazy(() => import('@components/DashboardView'));
