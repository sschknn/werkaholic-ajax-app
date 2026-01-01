import React, { useState, useEffect, useRef } from 'react';
import { AdAnalysis } from '../types';
import { Copy, Check, TrendingUp, Tag, Share2, ArrowLeft, ExternalLink, ShoppingBag, FileDown, Archive, Pencil, Save, X, Cloud, Loader2, Plus, Image as ImageIcon, Trash2, RotateCw, Wand2, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { jsPDF } from "jspdf";
import JSZip from "jszip";

interface ResultViewProps {
  result: AdAnalysis;
  images: string[];
  onBack: () => void;
  onSave?: (updatedResult: AdAnalysis, updatedImages?: string[]) => void;
}

const ResultView: React.FC<ResultViewProps> = ({ result, images, onBack, onSave }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingAd, setIsCreatingAd] = useState(false);
  
  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<AdAnalysis>(result);
  
  // Image State
  const [localImages, setLocalImages] = useState<string[]>(images);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorImage, setEditorImage] = useState<string | null>(null);
  const [editorRotation, setEditorRotation] = useState(0);
  const [editorBrightness, setEditorBrightness] = useState(100); // %
  const [editorContrast, setEditorContrast] = useState(100); // %
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-save State
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const lastSavedData = useRef<string>(JSON.stringify(result) + JSON.stringify(images));

  // Sync editData/images when result props change
  useEffect(() => {
    if (!isEditing) {
      setEditData(result);
      setLocalImages(images);
      lastSavedData.current = JSON.stringify(result) + JSON.stringify(images);
    }
  }, [result, images, isEditing]);

  // Auto-save Logic
  useEffect(() => {
    if (!isEditing || !onSave) return;

    const currentDataString = JSON.stringify(editData) + JSON.stringify(localImages);
    
    // Don't save if nothing changed since last save
    if (currentDataString === lastSavedData.current) return;

    setSaveStatus('saving');

    const timer = setTimeout(() => {
      onSave(editData, localImages);
      lastSavedData.current = currentDataString;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 2000);

    return () => clearTimeout(timer);
  }, [editData, localImages, isEditing, onSave]);

  const toggleEdit = () => {
    if (isEditing) {
      // Revert
      setEditData(result);
      setLocalImages(images);
      setSaveStatus('idle');
    }
    setIsEditing(!isEditing);
  };

  const handleManualSave = () => {
    if (onSave) {
      onSave(editData, localImages);
      lastSavedData.current = JSON.stringify(editData) + JSON.stringify(localImages);
    }
    setIsEditing(false);
    setSaveStatus('idle');
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // --- Image Handling ---

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if(reader.result) {
            setLocalImages(prev => [...prev, reader.result as string]);
            // Auto save triggers via effect if in editing mode, 
            // but if we allow adding images outside edit mode, we should trigger save.
            // Currently assuming Edit mode is NOT required to add images (User convenience)
            if(!isEditing && onSave) {
                // Trigger immediate save if not in edit mode
                const updated = [...localImages, reader.result as string];
                onSave(editData, updated);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDeleteImage = (index: number) => {
    if(window.confirm("Bild löschen?")) {
      const updated = localImages.filter((_, i) => i !== index);
      setLocalImages(updated);
      if(selectedImageIndex >= updated.length) setSelectedImageIndex(Math.max(0, updated.length - 1));
      
      if(!isEditing && onSave) {
         onSave(editData, updated);
      }
    }
  };

  const handleSetMainImage = (index: number) => {
    if (index === 0) return;
    const updated = [...localImages];
    const temp = updated[0];
    updated[0] = updated[index];
    updated[index] = temp;
    setLocalImages(updated);
    setSelectedImageIndex(0);
    
    if(!isEditing && onSave) {
        onSave(editData, updated);
    }
  };

  // --- Image Editor ---

  const openEditor = () => {
    setEditorImage(localImages[selectedImageIndex]);
    setEditorRotation(0);
    setEditorBrightness(100);
    setEditorContrast(100);
    setIsEditorOpen(true);
  };

  const saveEditedImage = () => {
    if (canvasRef.current) {
        const newDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
        const updated = [...localImages];
        updated[selectedImageIndex] = newDataUrl;
        setLocalImages(updated);
        
        if(!isEditing && onSave) {
            onSave(editData, updated);
        }
        setIsEditorOpen(false);
    }
  };

  // Draw image to canvas with transformations
  useEffect(() => {
    if (isEditorOpen && editorImage && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = editorImage;
        img.onload = () => {
            // Calculate new dimensions based on rotation
            if (editorRotation % 180 !== 0) {
                canvas.width = img.height;
                canvas.height = img.width;
            } else {
                canvas.width = img.width;
                canvas.height = img.height;
            }

            if (ctx) {
                ctx.filter = `brightness(${editorBrightness}%) contrast(${editorContrast}%)`;
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate((editorRotation * Math.PI) / 180);
                ctx.drawImage(img, -img.width / 2, -img.height / 2);
            }
        };
    }
  }, [isEditorOpen, editorImage, editorRotation, editorBrightness, editorContrast]);

  // --- Exports ---

  const handleKleinanzeigenExport = async () => {
    const sourceData = isEditing ? editData : result;
    const fullDescription = `${sourceData.description}\n\nZustand: ${sourceData.condition}\n\n${sourceData.keywords.map(k => `#${k}`).join(' ')}`;

    // Copy logic...
    if (navigator.clipboard && navigator.clipboard.writeText) {
       navigator.clipboard.writeText(fullDescription);
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    
    // Create ad text and save to Firestore
    const adText = `${sourceData.title}\n\n${sourceData.description}\n\nZustand: ${sourceData.condition}\n\nPreis: ${sourceData.price_estimate}\n\n${sourceData.keywords.map(k => `#${k}`).join(' ')}`;
    
    // Save to Firestore if user is authenticated (this would need to be passed as prop)
    // For now, just open the platform
    window.open('https://www.kleinanzeigen.de/p-anzeige-aufgeben.html', '_blank');
  };

  const handleCreateAd = async () => {
    setIsCreatingAd(true);
    try {
      const sourceData = isEditing ? editData : result;
      const adText = `${sourceData.title}\n\n${sourceData.description}\n\nZustand: ${sourceData.condition}\n\nPreis: ${sourceData.price_estimate}\n\n${sourceData.keywords.map(k => `#${k}`).join(' ')}`;
      
      // Copy to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(adText);
      }
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // Open Kleinanzeigen platform
      window.open('https://www.kleinanzeigen.de/p-anzeige-aufgeben.html', '_blank');
    } catch (error) {
      console.error('Error creating ad:', error);
    } finally {
      setIsCreatingAd(false);
    }
  };

  const handlePdfExport = () => {
    const sourceData = isEditing ? editData : result;
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // ... (Header and Title code same as before) ...
      const colorPrimary = [37, 99, 235]; 
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Werkaholic AI Exposé", margin, 17);
      
      let currentY = 40;
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      const titleLines = doc.splitTextToSize(sourceData.title, contentWidth);
      doc.text(titleLines, margin, currentY);
      currentY += (titleLines.length * 9) + 5;

      // Add ALL images to PDF (Grid if multiple)
      const maxImgHeight = localImages.length > 1 ? 60 : 85;
      
      // Main Image
      try {
        const img = localImages[0];
        const imgProps = doc.getImageProperties(img);
        const imgRatio = imgProps.width / imgProps.height;
        let drawWidth = contentWidth;
        let drawHeight = contentWidth / imgRatio;

        if (drawHeight > maxImgHeight) {
           drawHeight = maxImgHeight;
           drawWidth = drawHeight * imgRatio;
        }
        const xOffset = margin + (contentWidth - drawWidth) / 2;
        doc.addImage(img, 'JPEG', xOffset, currentY, drawWidth, drawHeight, undefined, 'FAST');
        currentY += drawHeight + 10;
      } catch (e) {}

      // Add secondary images as small strip if exist
      if (localImages.length > 1) {
         const thumbSize = 25;
         let thumbX = margin;
         for (let i = 1; i < Math.min(localImages.length, 5); i++) {
            try {
                doc.addImage(localImages[i], 'JPEG', thumbX, currentY, thumbSize, thumbSize, undefined, 'FAST');
                thumbX += thumbSize + 5;
            } catch(e) {}
         }
         currentY += thumbSize + 10;
      }

      // ... (Rest of PDF logic: Info Box, Desc, Keywords) ...
      // Info Box
      const boxHeight = 24;
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, currentY, contentWidth, boxHeight, 3, 3, 'FD');
      
      // Simple text for brevity in this snippet
      doc.setFontSize(10);
      doc.setTextColor(0,0,0);
      doc.text(`${sourceData.price_estimate} | ${sourceData.condition} | ${sourceData.category}`, margin + 5, currentY + 15);
      currentY += boxHeight + 10;

      // Desc
      doc.setFont("helvetica", "normal");
      doc.text(doc.splitTextToSize(sourceData.description, contentWidth), margin, currentY);
      
      doc.save(`${sourceData.title.substring(0, 10)}_Expose.pdf`);
    } catch (error) {
      console.error("PDF Fail", error);
      alert("Fehler bei PDF Erstellung");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleZipExport = async () => {
    const sourceData = isEditing ? editData : result;
    setIsGenerating(true);
    try {
      const zip = new JSZip();
      const folderName = sourceData.title.substring(0, 20).replace(/[^a-z0-9]/gi, '_');
      const folder = zip.folder(folderName);

      if (folder) {
        folder.file("anzeige.txt", sourceData.description);
        
        // Add ALL images
        localImages.forEach((img, idx) => {
             const imgData = img.split(',')[1];
             folder.file(`bild_${idx + 1}.jpg`, imgData, {base64: true});
        });

        const content = await zip.generateAsync({type:"blob"});
        const url = window.URL.createObjectURL(content as Blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${folderName}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      alert("Fehler beim ZIP Export");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 animate-fade-in pb-20 md:pb-0 transition-colors relative">
      
      {/* Toast */}
      {showToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-fade-in">
          <Check className="w-5 h-5 text-green-400" />
          <p className="font-bold text-sm">Text kopiert!</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-4 py-4 border-b dark:border-slate-800 sticky top-0 z-10 flex items-center justify-between shadow-sm transition-colors">
        <button onClick={onBack} className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium">
          <ArrowLeft className="w-5 h-5 mr-1" />
          Zurück
        </button>
        <div className="flex items-center gap-3">
           {isEditing && (
             <div className="flex items-center gap-2 mr-2 text-xs font-medium transition-all">
               {saveStatus === 'saving' && <span className="text-slate-400 flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-1"/>Speichert...</span>}
               {saveStatus === 'saved' && <span className="text-green-500 flex items-center"><Cloud className="w-3 h-3 mr-1"/>Gespeichert</span>}
             </div>
           )}

           {!isEditing ? (
             <button onClick={toggleEdit} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 font-medium text-sm transition-colors">
               <Pencil className="w-4 h-4" />
               <span className="hidden sm:inline">Bearbeiten</span>
             </button>
           ) : (
             <div className="flex items-center gap-2">
                <button onClick={toggleEdit} className="p-2 text-slate-400"><X className="w-5 h-5" /></button>
                <button onClick={handleManualSave} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"><Save className="w-4 h-4" />Fertig</button>
             </div>
           )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto w-full grid md:grid-cols-2 gap-8">
        
        {/* Left Column: Image Gallery & Editor */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-3 border border-slate-100 dark:border-slate-700/50">
                {/* Main Image Stage */}
                <div className="relative group rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 aspect-square md:aspect-[4/3]">
                    <img src={localImages[selectedImageIndex]} alt="Main" className="w-full h-full object-contain" />
                    
                    <button 
                        onClick={openEditor}
                        className="absolute top-3 right-3 bg-black/60 hover:bg-blue-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md"
                        title="Bild bearbeiten"
                    >
                        <Wand2 className="w-5 h-5" />
                    </button>
                    
                    {localImages.length > 1 && (
                       <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full text-white text-xs backdrop-blur-md">
                         {selectedImageIndex + 1} / {localImages.length}
                       </div>
                    )}
                </div>

                {/* Thumbnail Strip */}
                <div className="mt-3 grid grid-cols-5 gap-2">
                    {localImages.map((img, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedImageIndex === idx ? 'border-blue-500' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        >
                            <img src={img} className="w-full h-full object-cover" />
                            {isEditing && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteImage(idx); }}
                                  className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded shadow-sm hover:bg-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                            )}
                             {/* Make Main Button (if not main) */}
                             {isEditing && idx !== 0 && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleSetMainImage(idx); }}
                                  className="absolute bottom-0.5 left-0.5 bg-blue-500 text-white px-1 py-0.5 rounded text-[8px] hover:bg-blue-600"
                                >
                                  MAIN
                                </button>
                            )}
                        </div>
                    ))}
                    
                    {/* Add Image Button */}
                    <div 
                       onClick={() => fileInputRef.current?.click()}
                       className="aspect-square rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900/50"
                    >
                       <Plus className="w-6 h-6 mb-1" />
                       <span className="text-[10px] font-medium">Add</span>
                    </div>
                    <input 
                       type="file" 
                       multiple 
                       accept="image/*" 
                       ref={fileInputRef} 
                       className="hidden" 
                       onChange={handleAddImage}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-100 dark:border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Marktintelligenz
                </h3>
                <div className="w-full">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Geschätzter Preis</p>
                    {isEditing ? (
                        <input 
                        type="text" 
                        value={editData.price_estimate}
                        onChange={(e) => setEditData({...editData, price_estimate: e.target.value})}
                        className="w-full text-2xl font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    ) : (
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{result.price_estimate}</p>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column: Generated Ad Content */}
        <div className="space-y-6">
            
            {/* Title Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Titel & Details</span>
                    {!isEditing && (
                      <button 
                          onClick={() => copyToClipboard(result.title, 'title')}
                          className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1"
                      >
                          {copiedField === 'title' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Kopieren
                      </button>
                    )}
                </div>
                <div className="p-6">
                    {isEditing ? (
                      <div className="space-y-3">
                         <input 
                            type="text" 
                            value={editData.title}
                            onChange={(e) => setEditData({...editData, title: e.target.value})}
                            className="w-full text-lg font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                         />
                         <div className="grid grid-cols-2 gap-3">
                            <input 
                                placeholder="Zustand"
                                type="text" 
                                value={editData.condition}
                                onChange={(e) => setEditData({...editData, condition: e.target.value})}
                                className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <input 
                                placeholder="Kategorie"
                                type="text" 
                                value={editData.category}
                                onChange={(e) => setEditData({...editData, category: e.target.value})}
                                className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                         </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-lg font-medium text-slate-900 dark:text-white">{result.title}</p>
                        <div className="flex gap-2 mt-3">
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded uppercase">
                                {result.condition}
                            </span>
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded uppercase">
                                {result.category}
                            </span>
                        </div>
                      </>
                    )}
                </div>
            </div>

            {/* Description Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Beschreibung</span>
                    {!isEditing && (
                      <button 
                          onClick={() => copyToClipboard(result.description, 'desc')}
                          className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1"
                      >
                          {copiedField === 'desc' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Kopieren
                      </button>
                    )}
                </div>
                <div className="p-6">
                    {isEditing ? (
                       <textarea 
                          value={editData.description}
                          onChange={(e) => setEditData({...editData, description: e.target.value})}
                          className="w-full min-h-[250px] text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                       />
                    ) : (
                      <div className="prose prose-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">
                          {result.description}
                      </div>
                    )}
                </div>
            </div>

            {/* Keywords */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Tag className="w-4 h-4" /> Suchbegriffe
                    </span>
                    {!isEditing && (
                      <button 
                          onClick={() => copyToClipboard(result.keywords.map(k => `#${k}`).join(' '), 'tags')}
                          className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1"
                      >
                          {copiedField === 'tags' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Kopieren
                      </button>
                    )}
                </div>
                <div className="p-6">
                    {isEditing ? (
                        <textarea 
                           value={editData.keywords.join(', ')}
                           onChange={(e) => setEditData({...editData, keywords: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})}
                           className="w-full min-h-[60px] text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                          {result.keywords.map((keyword, idx) => (
                              <span key={idx} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-sm">
                                  #{keyword}
                              </span>
                          ))}
                      </div>
                    )}
                </div>
            </div>
            
            {/* Actions */}
            <div className="space-y-3 pb-24 md:pb-0">
              <button
                  onClick={handleCreateAd}
                  disabled={isCreatingAd}
                  className="w-full py-4 bg-[#86d52f] hover:bg-[#75bf25] disabled:bg-gray-400 text-slate-900 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-[0.98] transition-transform"
              >
                  {isCreatingAd ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Erstelle Inserat...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-6 h-6" />
                      Inserat erstellen
                    </>
                  )}
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={handlePdfExport} disabled={isGenerating || isEditing} className="py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <FileDown className="w-5 h-5 text-red-500" /> PDF Exposé
                 </button>
                 <button onClick={handleZipExport} disabled={isGenerating || isEditing} className="py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <Archive className="w-5 h-5 text-amber-500" /> ZIP Paket
                 </button>
              </div>
            </div>
        </div>
      </div>

      {/* --- Sticky Footer Action Bar (Mobile Only) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t dark:border-slate-800 p-4 shadow-2xl z-20">
         <button 
              onClick={handleKleinanzeigenExport}
              className="w-full py-3 bg-[#86d52f] text-slate-900 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
          >
              <ShoppingBag className="w-5 h-5" />
              Inserieren
          </button>
      </div>

      {/* --- Image Editor Modal --- */}
      {isEditorOpen && editorImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fade-in">
           <div className="bg-slate-900 w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                 <h3 className="text-white font-semibold flex items-center gap-2"><Wand2 className="w-4 h-4 text-blue-400"/> Bild bearbeiten</h3>
                 <button onClick={() => setIsEditorOpen(false)} className="text-slate-400 hover:text-white"><X className="w-6 h-6"/></button>
              </div>
              
              <div className="flex-1 bg-black relative flex items-center justify-center p-4 min-h-[300px]">
                 <canvas ref={canvasRef} className="max-w-full max-h-[50vh] object-contain" />
              </div>

              <div className="p-6 bg-slate-900 border-t border-slate-800 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-xs text-slate-400 mb-2 flex justify-between">
                         <span>Helligkeit</span> <span>{editorBrightness}%</span>
                       </label>
                       <input 
                         type="range" min="50" max="150" value={editorBrightness}
                         onChange={(e) => setEditorBrightness(parseInt(e.target.value))}
                         className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                       />
                    </div>
                    <div>
                       <label className="text-xs text-slate-400 mb-2 flex justify-between">
                         <span>Kontrast</span> <span>{editorContrast}%</span>
                       </label>
                       <input 
                         type="range" min="50" max="150" value={editorContrast}
                         onChange={(e) => setEditorContrast(parseInt(e.target.value))}
                         className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                       />
                    </div>
                 </div>

                 <div className="flex items-center justify-between pt-2">
                    <button 
                       onClick={() => setEditorRotation(prev => (prev + 90) % 360)}
                       className="flex flex-col items-center gap-1 text-slate-300 hover:text-white"
                    >
                       <div className="p-2 bg-slate-800 rounded-full"><RotateCw className="w-5 h-5" /></div>
                       <span className="text-[10px]">Drehen</span>
                    </button>
                    
                    <button 
                       onClick={saveEditedImage}
                       className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2"
                    >
                       <Check className="w-5 h-5" />
                       Speichern
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default ResultView;