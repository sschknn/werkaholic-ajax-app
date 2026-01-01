// Lazy Loading für PDF-Generierung und andere schwere Libraries
import { AdAnalysis } from '../types';

// Lazy import der PDF Libraries
let pdfLib: any = null;
let html2canvasLib: any = null;
let jszipLib: any = null;

const loadPDFLibraries = async () => {
  if (!pdfLib) {
    console.log('Loading PDF libraries...');
    const [{ jsPDF }, html2canvas, JSZip] = await Promise.all([
      import('jspdf'),
      import('html2canvas'),
      import('jszip')
    ]);
    
    pdfLib = { jsPDF };
    html2canvasLib = html2canvas;
    jszipLib = JSZip;
    
    console.log('PDF libraries loaded successfully');
  }
  
  return { pdfLib, html2canvasLib, jszipLib };
};

// Optimierte PDF-Generierung mit Lazy Loading
export const generatePDFReport = async (result: AdAnalysis): Promise<void> => {
  try {
    const { pdfLib, html2canvasLib } = await loadPDFLibraries();
    const { jsPDF } = pdfLib;
    
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Header
    pdf.setFontSize(20);
    pdf.setTextColor(59, 130, 246); // Blue color
    pdf.text('Werkaholic AI - Analysebericht', 20, 30);
    
    // Product Info
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text(result.title, 20, 50);
    
    pdf.setFontSize(12);
    pdf.text(`Kategorie: ${result.category}`, 20, 70);
    pdf.text(`Zustand: ${result.condition}`, 20, 85);
    pdf.text(`Geschätzter Wert: ${result.price_estimate}`, 20, 100);
    
    // Description
    pdf.setFontSize(10);
    const splitDescription = pdf.splitTextToSize(result.description, pageWidth - 40);
    pdf.text(splitDescription, 20, 120);
    
    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Generiert am: ${new Date().toLocaleDateString('de-DE')}`, 20, pageHeight - 20);
    pdf.text('Powered by Werkaholic AI', pageWidth - 60, pageHeight - 20);
    
    // Save PDF
    const fileName = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analyse.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Optimierte Bulk PDF-Generierung mit Progress Tracking
export const generateBulkPDFReport = async (results: AdAnalysis[]): Promise<void> => {
  if (results.length === 0) return;
  
  try {
    const { pdfLib, jszipLib } = await loadPDFLibraries();
    const { jsPDF } = pdfLib;
    const JSZip = jszipLib;
    
    const zip = new JSZip();
    const totalReports = results.length;
    let completedReports = 0;
    
    // Progress callback
    const onProgress = (current: number, total: number) => {
      const progress = Math.round((current / total) * 100);
      console.log(`PDF Generation Progress: ${progress}%`);
    };
    
    // Generate PDFs in batches to avoid memory issues
    const batchSize = 5;
    for (let i = 0; i < results.length; i += batchSize) {
      const batch = results.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (result, index) => {
        try {
          const pdf = new jsPDF();
          const pageWidth = pdf.internal.pageSize.getWidth();
          
          // Header
          pdf.setFontSize(20);
          pdf.setTextColor(59, 130, 246);
          pdf.text('Werkaholic AI - Analysebericht', 20, 30);
          
          // Product Info
          pdf.setFontSize(16);
          pdf.setTextColor(0, 0, 0);
          pdf.text(result.title, 20, 50);
          
          pdf.setFontSize(12);
          pdf.text(`Kategorie: ${result.category}`, 20, 70);
          pdf.text(`Zustand: ${result.condition}`, 20, 85);
          pdf.text(`Geschätzter Wert: ${result.price_estimate}`, 20, 100);
          
          // Description
          pdf.setFontSize(10);
          const splitDescription = pdf.splitTextToSize(result.description, pageWidth - 40);
          pdf.text(splitDescription, 20, 120);
          
          // Footer
          pdf.setFontSize(8);
          pdf.setTextColor(128, 128, 128);
          pdf.text(`Generiert am: ${new Date().toLocaleDateString('de-DE')}`, 20, 280);
          pdf.text('Powered by Werkaholic AI', pageWidth - 60, 280);
          
          const fileName = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analyse.pdf`;
          const pdfBlob = pdf.output('blob');
          
          completedReports++;
          onProgress(completedReports, totalReports);
          
          return { fileName, blob: pdfBlob };
        } catch (error) {
          console.error(`Error generating PDF for ${result.title}:`, error);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      // Add successful PDFs to zip
      batchResults.forEach(result => {
        if (result) {
          zip.file(result.fileName, result.blob);
        }
      });
    }
    
    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(zipBlob);
    
    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = `werkaholic_ai_sammelbericht_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(zipUrl);
    
    console.log(`Bulk PDF generation completed: ${completedReports}/${totalReports} reports`);
    
  } catch (error) {
    console.error('Error generating bulk PDF:', error);
    throw error;
  }
};

// Lazy Loading für HTML2Canvas mit Caching
export const captureElementAsImage = async (element: HTMLElement): Promise<string> => {
  try {
    const { html2canvasLib } = await loadPDFLibraries();
    const html2canvas = html2canvasLib;
    
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight
    });
    
    return canvas.toDataURL('image/png', 1.0);
  } catch (error) {
    console.error('Error capturing element:', error);
    throw error;
  }
};

// Performance-optimierte Screenshot-Funktion
export const generatePerformanceReport = async (element: HTMLElement): Promise<Blob> => {
  try {
    const imageDataURL = await captureElementAsImage(element);
    
    // Convert to blob for better performance
    const response = await fetch(imageDataURL);
    const blob = await response.blob();
    
    return blob;
  } catch (error) {
    console.error('Error generating performance report:', error);
    throw error;
  }
};

// Memory management für große PDFs
export const clearPDFCache = () => {
  pdfLib = null;
  html2canvasLib = null;
  jszipLib = null;
  console.log('PDF cache cleared');
};

// Preload PDF libraries im Hintergrund
export const preloadPDFLibraries = () => {
  // Preload in idle time
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      loadPDFLibraries().catch(console.error);
    });
  } else {
    // Fallback für Browser ohne requestIdleCallback
    setTimeout(() => {
      loadPDFLibraries().catch(console.error);
    }, 1000);
  }
};

// Bundle size tracking
export const trackPDFBundleSize = async () => {
  if (process.env.NODE_ENV === 'production') {
    try {
      await loadPDFLibraries();
      
      // Calculate approximate bundle size
      const scriptElements = Array.from(document.scripts);
      const pdfScripts = scriptElements.filter(script => 
        script.src.includes('jspdf') || 
        script.src.includes('html2canvas') || 
        script.src.includes('jszip')
      );
      
      const totalSize = pdfScripts.reduce((total, script) => {
        // This is an approximation - in real implementation you'd track actual transfer sizes
        return total + (script.src.includes('jspdf') ? 150000 : script.src.includes('html2canvas') ? 80000 : 60000);
      }, 0);
      
      console.log(`PDF Libraries Bundle Size: ${(totalSize / 1024).toFixed(2)}KB`);
    } catch (error) {
      console.error('Error tracking PDF bundle size:', error);
    }
  }
};