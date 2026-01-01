import { AdAnalysis } from '../types';
import { generatePDFReport, generateBulkPDFReport, generateKleinanzeigenZIP, generateKleinanzeigePDF } from '../utils/pdfGenerator';

interface UseDownloadsProps {
  addNotification: (notification: { type: 'success' | 'error' | 'info'; title: string; message: string }) => void;
}

export const useDownloads = ({ addNotification }: UseDownloadsProps) => {
  const downloadResult = async (result: AdAnalysis) => {
    try {
      await generatePDFReport(result);
    } catch (error) {
      console.error('Error generating PDF:', error);
      addNotification({
        type: 'error',
        title: 'PDF-Fehler',
        message: 'Das PDF konnte nicht erstellt werden.'
      });
    }
  };

  const downloadBulkReport = async (analysisResults: AdAnalysis[]) => {
    if (analysisResults.length === 0) return;

    try {
      await generateBulkPDFReport(analysisResults);
    } catch (error) {
      console.error('Error generating bulk PDF:', error);
      addNotification({
        type: 'error',
        title: 'PDF-Fehler',
        message: 'Der Sammelbericht konnte nicht erstellt werden.'
      });
    }
  };

  const downloadKleinanzeigenZIP = async (analysisResults: AdAnalysis[]) => {
    if (analysisResults.length === 0) return;

    try {
      await generateKleinanzeigenZIP(analysisResults);
      addNotification({
        type: 'success',
        title: 'ZIP erstellt',
        message: 'Kleinanzeigen-ZIP wurde heruntergeladen.'
      });
    } catch (error) {
      console.error('Error generating Kleinanzeigen ZIP:', error);
      addNotification({
        type: 'error',
        title: 'ZIP-Fehler',
        message: 'Die Kleinanzeigen-ZIP konnte nicht erstellt werden.'
      });
    }
  };

  const openKleinanzeige = async (result: AdAnalysis) => {
    try {
      const pdfBlob = await generateKleinanzeigePDF(result);
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error opening Kleinanzeige PDF:', error);
      addNotification({
        type: 'error',
        title: 'PDF-Fehler',
        message: 'Die Kleinanzeige konnte nicht geöffnet werden.'
      });
    }
  };

  return {
    downloadResult,
    downloadBulkReport,
    downloadKleinanzeigenZIP,
    openKleinanzeige,
  };
};