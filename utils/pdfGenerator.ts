import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { AdAnalysis } from '../types';

export const generatePDFReport = async (result: AdAnalysis, imageData?: string): Promise<Blob> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Enhanced color scheme
  const primaryColor = [59, 130, 246]; // Blue
  const secondaryColor = [107, 114, 128]; // Gray
  const accentColor = [16, 185, 129]; // Green
  const darkColor = [31, 41, 55]; // Dark gray
  const lightColor = [243, 244, 246]; // Light gray

  // Enhanced header with gradient effect
  // Create gradient background using multiple rectangles
  for (let i = 0; i < 40; i++) {
    const alpha = (40 - i) / 40;
    const r = Math.round(59 + (99 - 59) * alpha);
    const g = Math.round(130 + (102 - 130) * alpha);
    const b = Math.round(246 + (139 - 246) * alpha);
    pdf.setFillColor(r, g, b);
    pdf.rect(0, i, pageWidth, 1, 'F');
  }

  // Logo/Brand with shadow effect
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  // Shadow
  pdf.setTextColor(0, 0, 0, 0.3);
  pdf.text('WERKAHOLIC AI', 21, 26);
  // Main text
  pdf.setTextColor(255, 255, 255);
  pdf.text('WERKAHOLIC AI', 20, 25);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('KI-gestützte Werbeanalyse', 20, 32);

  // Report title
  yPosition = 60;
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Analyse-Bericht', 20, yPosition);

  // Date
  pdf.setFontSize(10);
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  pdf.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, pageWidth - 60, yPosition);

  yPosition += 20;

  // Product Image (if available)
  if (imageData) {
    try {
      // Convert base64 to image and add to PDF
      const img = new Image();
      img.src = imageData;

      await new Promise((resolve) => {
        img.onload = () => {
          const imgWidth = 80;
          const imgHeight = (img.height * imgWidth) / img.width;
          pdf.addImage(img, 'JPEG', pageWidth - 100, yPosition - 15, imgWidth, imgHeight);
          resolve(void 0);
        };
        img.onerror = () => resolve(void 0);
      });
    } catch (error) {
      console.error('Error adding image to PDF:', error);
    }
  }

  // Enhanced Product Details Section with better styling
  // Background with subtle gradient
  for (let i = 0; i < 70; i++) {
    const alpha = (70 - i) / 70;
    const r = Math.round(248 + (255 - 248) * alpha);
    const g = Math.round(250 + (255 - 250) * alpha);
    const b = Math.round(252 + (255 - 252) * alpha);
    pdf.setFillColor(r, g, b);
    pdf.rect(20, yPosition + i, pageWidth - 40, 1, 'F');
  }

  // Section border
  pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.setLineWidth(0.5);
  pdf.rect(20, yPosition, pageWidth - 40, 70, 'S');

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('📦 Produkt-Details', 25, yPosition + 12);

  yPosition += 20;

  // Product Title with icon
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  pdf.text('🏷️ Produkt:', 25, yPosition);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  const titleLines = pdf.splitTextToSize(result.title, 110);
  pdf.text(titleLines, 65, yPosition);

  yPosition += 12;

  // Value Estimate with enhanced styling
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  pdf.text('💰 Geschätzter Wert:', 25, yPosition);
  // Highlight box for price
  pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.rect(75, yPosition - 4, 40, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text(result.price_estimate, 80, yPosition + 1);
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);

  yPosition += 12;

  // Condition and Category in two columns
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  pdf.text('🔧 Zustand:', 25, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(result.condition, 60, yPosition);

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  pdf.text('📂 Kategorie:', pageWidth / 2 + 10, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(result.category, pageWidth / 2 + 45, yPosition);

  yPosition += 30;

  // Enhanced Analysis Section
  pdf.setFillColor(255, 255, 255);
  pdf.rect(20, yPosition, pageWidth - 40, 85, 'F');
  // Border with accent color
  pdf.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.setLineWidth(1);
  pdf.rect(20, yPosition, pageWidth - 40, 85, 'S');

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('🤖 KI-Analyse & Bewertung', 25, yPosition + 12);

  yPosition += 20;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  const descriptionLines = pdf.splitTextToSize(result.description, pageWidth - 50);
  pdf.text(descriptionLines, 25, yPosition);

  // Add reasoning highlight box
  if (result.reasoning) {
    yPosition += descriptionLines.length * 5 + 5;
    pdf.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
    pdf.rect(25, yPosition - 2, pageWidth - 50, 12, 'F');
    pdf.setFontSize(9);
    pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    pdf.setFont('helvetica', 'italic');
    const reasoningText = `💡 ${result.reasoning}`;
    const reasoningLines = pdf.splitTextToSize(reasoningText, pageWidth - 60);
    pdf.text(reasoningLines, 30, yPosition + 3);
  }

  yPosition += descriptionLines.length * 5 + 20;

  // Enhanced Keywords Section
  if (result.keywords && result.keywords.length > 0) {
    yPosition += 90; // Space after analysis section

    // Keywords background with pattern
    pdf.setFillColor(248, 250, 252);
    pdf.rect(20, yPosition, pageWidth - 40, 35, 'F');

    // Decorative border
    pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setLineWidth(0.5);
    pdf.rect(20, yPosition, pageWidth - 40, 35, 'S');

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    pdf.text('🏷️ Schlüsselwörter & Tags', 25, yPosition + 10);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const keywordsText = result.keywords.join(' • ');
    const keywordLines = pdf.splitTextToSize(keywordsText, pageWidth - 60);
    pdf.text(keywordLines, 25, yPosition + 20);
  }

  // Enhanced Footer with better styling
  const footerY = pageHeight - 25;
  pdf.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
  pdf.rect(0, footerY - 5, pageWidth, 25, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('🎯 Werkaholic AI - KI-gestützte Werbeanalyse', pageWidth / 2, footerY + 2, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(200, 200, 200);
  pdf.text('www.werkaholic.ai | Generiert am ' + new Date().toLocaleDateString('de-DE'), pageWidth / 2, footerY + 10, { align: 'center' });

  // Return the PDF as blob
  return pdf.output('blob');
};

export const generateBulkPDFReport = async (results: AdAnalysis[]): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = 20;

  // Header
  pdf.setFillColor(59, 130, 246);
  pdf.rect(0, 0, pageWidth, 40, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('WERKAHOLIC AI', 20, 25);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Sammelbericht - KI-Analysen', 20, 32);

  yPosition = 60;

  // Summary
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Analyse-Bericht (${results.length} Produkte)`, 20, yPosition);

  pdf.setFontSize(10);
  pdf.setTextColor(107, 114, 128);
  pdf.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, pageWidth - 60, yPosition);

  yPosition += 30;

  // Statistics
  const totalValue = results.reduce((sum, item) => {
    const value = parseFloat(item.price_estimate.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    return sum + value;
  }, 0);
  const avgValue = totalValue / results.length;

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Zusammenfassung:', 20, yPosition);
  yPosition += 10;

  pdf.setFont('helvetica', 'normal');
  pdf.text(`Gesamtprodukte: ${results.length}`, 25, yPosition);
  yPosition += 8;
  pdf.text(`Gesamtwert: ${totalValue.toFixed(2)}€`, 25, yPosition);
  yPosition += 8;
  pdf.text(`Durchschnittswert: ${avgValue.toFixed(2)}€`, 25, yPosition);

  yPosition += 30;

  // Individual products
  results.forEach((result, index) => {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFillColor(248, 250, 252);
    pdf.rect(20, yPosition, pageWidth - 40, 40, 'F');

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${index + 1}. ${result.title}`, 25, yPosition + 8);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Wert: ${result.price_estimate} | Zustand: ${result.condition} | Kategorie: ${result.category}`, 25, yPosition + 18);

    if (result.description.length > 100) {
      const desc = result.description.substring(0, 100) + '...';
      pdf.text(desc, 25, yPosition + 28);
    } else {
      pdf.text(result.description, 25, yPosition + 28);
    }

    yPosition += 50;
  });

  // Footer
  const footerY = pdf.internal.pageSize.getHeight() - 20;
  pdf.setFontSize(8);
  pdf.setTextColor(107, 114, 128);
  pdf.text('Generiert von Werkaholic AI - www.werkaholic.ai', pageWidth / 2, footerY, { align: 'center' });

  const fileName = `werkaholic_ai_sammelbericht_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

export const generateKleinanzeigePDF = async (result: AdAnalysis, imageData?: string): Promise<Blob> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  let yPosition = 30;

  // Header
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('KLEINANZEIGE', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 20;

  // Product Image
  if (imageData) {
    try {
      const img = new Image();
      img.src = imageData;

      await new Promise((resolve) => {
        img.onload = () => {
          const imgWidth = 100;
          const imgHeight = (img.height * imgWidth) / img.width;
          pdf.addImage(img, 'JPEG', (pageWidth - imgWidth) / 2, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 20;
          resolve(void 0);
        };
        img.onerror = () => {
          yPosition += 20;
          resolve(void 0);
        };
      });
    } catch (error) {
      console.error('Error adding image to PDF:', error);
      yPosition += 20;
    }
  }

  // Product Title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  const titleLines = pdf.splitTextToSize(result.title, pageWidth - 40);
  pdf.text(titleLines, 20, yPosition);
  yPosition += titleLines.length * 7 + 10;

  // Price
  pdf.setFontSize(24);
  pdf.setTextColor(16, 185, 129); // Green
  pdf.text(result.price_estimate, 20, yPosition);
  pdf.setTextColor(0, 0, 0);
  yPosition += 20;

  // Details
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Zustand: ${result.condition}`, 20, yPosition);
  yPosition += 8;
  pdf.text(`Kategorie: ${result.category}`, 20, yPosition);
  yPosition += 15;

  // Description
  pdf.setFontSize(11);
  const descLines = pdf.splitTextToSize(result.description, pageWidth - 40);
  pdf.text(descLines, 20, yPosition);
  yPosition += descLines.length * 5 + 20;

  // Contact Info
  pdf.setFontSize(10);
  pdf.setTextColor(107, 114, 128);
  pdf.text('Interesse? Kontaktieren Sie mich!', 20, yPosition);
  yPosition += 8;
  pdf.text('Telefon: [Ihre Telefonnummer]', 20, yPosition);
  yPosition += 8;
  pdf.text('E-Mail: [Ihre E-Mail-Adresse]', 20, yPosition);

  // Footer
  const footerY = pageHeight - 20;
  pdf.setFontSize(8);
  pdf.setTextColor(107, 114, 128);
  pdf.text('Generiert von Werkaholic AI', pageWidth / 2, footerY, { align: 'center' });

  return pdf.output('blob');
};

export const generateKleinanzeigenZIP = async (results: AdAnalysis[]): Promise<void> => {
  const zip = new JSZip();

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const pdfBlob = await generateKleinanzeigePDF(result);
    const fileName = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_kleinanzeige.pdf`;
    zip.file(fileName, pdfBlob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `werkaholic_ai_kleinanzeigen_${new Date().toISOString().split('T')[0]}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToCSV = (results: AdAnalysis[]): void => {
  const headers = ['Titel', 'Preis', 'Zustand', 'Kategorie', 'Beschreibung', 'Schlüsselwörter', 'Erstellt'];
  const csvContent = [
    headers.join(','),
    ...results.map(result => [
      `"${result.title.replace(/"/g, '""')}"`,
      `"${result.price_estimate}"`,
      `"${result.condition}"`,
      `"${result.category}"`,
      `"${result.description.replace(/"/g, '""')}"`,
      `"${result.keywords?.join('; ') || ''}"`,
      `"${result.createdAt || new Date().toISOString()}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `werkaholic_ai_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToJSON = (results: AdAnalysis[]): void => {
  const jsonContent = JSON.stringify(results, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `werkaholic_ai_export_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};