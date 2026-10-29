import React, { useState, useRef } from 'react';
import { ContentItem } from '../types.ts';
import {
  Folder,
  FolderOpen,
  FileText,
  Video as VideoIcon,
  HelpCircle,
  Upload,
  Plus,
  Download,
  Eye,
  Trash2,
  ChevronRight,
  X,
  FileCheck,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { uploadAcademyFile, formatBytes } from '../lib/supabase.ts';

interface ContentLibraryPanelProps {
  content: ContentItem[];
  isAdmin?: boolean;
  customFolders?: string[];
  onAddCustomFolder?: (folder: string) => void;
  onOpenSecurePdf?: (item: ContentItem) => void;
  onUploadContent: (item: {
    title: string;
    folderName: string;
    subfolderName: string;
    fileType: 'pdf' | 'video' | 'quiz' | 'doc';
    fileSize: string;
    details?: string;
    fileUrl?: string;
    fileName?: string;
  }) => void;
  onDeleteContent: (id: string) => void;
}

export const ContentLibraryPanel: React.FC<ContentLibraryPanelProps> = ({
  content,
  isAdmin = false,
  customFolders = ['Class 10 Maths', 'Class 9 Science', 'Class 8 English', 'Assignments', 'Sample Papers'],
  onAddCustomFolder,
  onOpenSecurePdf,
  onUploadContent,
  onDeleteContent
}) => {
  // Compute all unique folders dynamically from content items + customFolders
  const allFolderNames = Array.from(
    new Set([
      ...customFolders,
      ...content.map((c) => c.folderName)
    ])
  );

  const [activeFolder, setActiveFolder] = useState<string>(allFolderNames[0] || 'Class 10 Maths');
  const [activeSubfolder, setActiveSubfolder] = useState<string>('All');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);

  // New folder inline creation
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const [newFolderNameInput, setNewFolderNameInput] = useState('');

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFolder, setUploadFolder] = useState(allFolderNames[0] || 'Class 10 Maths');
  const [isCustomUploadFolder, setIsCustomUploadFolder] = useState(false);
  const [customUploadFolderInput, setCustomUploadFolderInput] = useState('');
  const [uploadSubfolder, setUploadSubfolder] = useState('');
  const [uploadType, setUploadType] = useState<'pdf' | 'video' | 'quiz' | 'doc'>('pdf');
  const [uploadSize, setUploadSize] = useState('2.4 MB');
  const [uploadDetails, setUploadDetails] = useState('');

  // Real File Input State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const folders = allFolderNames.map((name) => ({ id: name, name }));

  const subfoldersMap: Record<string, string[]> = {
    'Class 10 Maths': [
      'Chapter 1: Real Numbers',
      'Chapter 2: Polynomials',
      'Chapter 8: Trigonometry'
    ],
    'Class 9 Science': [
      'Chapter 1: Matter in Our Surroundings',
      'Chapter 2: Motion & Force'
    ],
    'Assignments': [
      'Class 10 Weekly Homework',
      'Class 9 Science Lab Reports'
    ]
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadSize(formatBytes(file.size));
    
    // Auto-fill title if empty
    if (!uploadTitle.trim()) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      setUploadTitle(nameWithoutExt);
    }

    // Auto-detect file type
    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith('.pdf')) {
      setUploadType('pdf');
    } else if (lowerName.endsWith('.mp4') || lowerName.endsWith('.webm') || lowerName.endsWith('.mkv')) {
      setUploadType('video');
    } else if (lowerName.endsWith('.doc') || lowerName.endsWith('.docx') || lowerName.endsWith('.txt')) {
      setUploadType('doc');
    }
  };

  const handleSaveUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    let fileUrl = '';
    let fileName = selectedFile ? selectedFile.name : `${uploadTitle.replace(/\s+/g, '_')}.${uploadType === 'pdf' ? 'pdf' : 'doc'}`;

    let finalFolder = isCustomUploadFolder && customUploadFolderInput.trim() ? customUploadFolderInput.trim() : uploadFolder;

    if (isCustomUploadFolder && customUploadFolderInput.trim() && onAddCustomFolder) {
      onAddCustomFolder(customUploadFolderInput.trim());
    }

    if (selectedFile) {
      setIsUploading(true);
      setUploadProgress(50);
      try {
        const uploadResult = await uploadAcademyFile(selectedFile, finalFolder.toLowerCase().replace(/\s+/g, '-'));
        setUploadProgress(100);
        fileUrl = uploadResult.fileUrl;
        fileName = uploadResult.fileName;
      } catch (err) {
        console.warn('Storage upload fallback triggered:', err);
        fileUrl = URL.createObjectURL(selectedFile);
      } finally {
        setIsUploading(false);
      }
    }

    onUploadContent({
      title: uploadTitle.trim(),
      folderName: finalFolder,
      subfolderName: uploadSubfolder.trim() || 'General Chapter',
      fileType: uploadType,
      fileSize: uploadSize,
      details: uploadDetails || 'Uploaded by teacher for revision.',
      fileUrl,
      fileName
    });

    setUploadTitle('');
    setUploadDetails('');
    setUploadSubfolder('');
    setIsCustomUploadFolder(false);
    setCustomUploadFolderInput('');
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploadOpen(false);
  };

  const handleDownloadFile = (item: ContentItem) => {
    if (item.fileUrl) {
      const link = document.createElement('a');
      link.href = item.fileUrl;
      link.download = item.fileName || `${item.title.replace(/\s+/g, '_')}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Preparing offline bundle download for: ${item.title}`);
    }
  };

  const currentSubfolders = subfoldersMap[activeFolder] || [];
  const currentFiles = content.filter(
    (c) => c.folderName === activeFolder && (!activeSubfolder || c.subfolderName === activeSubfolder)
  );

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Content & Study Material Repository
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse NCERT solutions, chapter formula sheets, assignments, and test quizzes for Anushree Academy students
          </p>
        </div>

        {isAdmin && (
          <div>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-teal-800 hover:bg-teal-900 text-white shadow-md shadow-teal-900/15 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New Material (File Picker)</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Folder Management Surface */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-teal-100 dark:border-slate-800 shadow-[0_2px_12px_rgba(15,118,110,0.06)]">
        
        {/* Course Folders Navigation */}
        <div className="flex flex-wrap items-center gap-2.5 pb-6 border-b border-teal-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-2">
            Subject Folders:
          </span>
          {folders.map((f) => {
            const isSelected = activeFolder === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFolder(f.id);
                  const firstSub = subfoldersMap[f.id]?.[0] || 'All';
                  setActiveSubfolder(firstSub);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-800 text-white shadow-sm shadow-teal-900/20'
                    : 'bg-teal-50/70 dark:bg-slate-800 text-teal-900 dark:text-teal-200 hover:bg-teal-100/70 dark:hover:bg-slate-700 border border-teal-100 dark:border-slate-700'
                }`}
              >
                {isSelected ? (
                  <FolderOpen className="w-4 h-4 text-amber-300" />
                ) : (
                  <Folder className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                )}
                <span>{f.name}</span>
              </button>
            );
          })}

          {/* Dynamic Folder Creation - Strictly for Admin */}
          {isAdmin && (
            isCreatingNewFolder ? (
              <div className="flex items-center gap-1.5 bg-teal-50 dark:bg-slate-800 p-1 rounded-xl border border-teal-300 dark:border-teal-700">
                <input
                  type="text"
                  autoFocus
                  placeholder="Folder name (e.g. Class 11)"
                  value={newFolderNameInput}
                  onChange={(e) => setNewFolderNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newFolderNameInput.trim()) {
                        if (onAddCustomFolder) onAddCustomFolder(newFolderNameInput.trim());
                        setActiveFolder(newFolderNameInput.trim());
                        setNewFolderNameInput('');
                        setIsCreatingNewFolder(false);
                      }
                    } else if (e.key === 'Escape') {
                      setIsCreatingNewFolder(false);
                    }
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg border border-teal-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newFolderNameInput.trim()) {
                      if (onAddCustomFolder) onAddCustomFolder(newFolderNameInput.trim());
                      setActiveFolder(newFolderNameInput.trim());
                      setNewFolderNameInput('');
                      setIsCreatingNewFolder(false);
                    }
                  }}
                  className="px-2.5 py-1 bg-teal-800 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingNewFolder(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsCreatingNewFolder(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border border-dashed border-teal-400 dark:border-teal-700 text-teal-800 dark:text-teal-300 bg-teal-50/50 dark:bg-slate-800 hover:bg-teal-100 cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                <span>+ New Folder</span>
              </button>
            )
          )}
        </div>

        {/* Subfolder and File Area */}
        <div className="pt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Subfolder Directory List (Left Column) */}
          <div className="lg:col-span-1 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
              Chapters / Units
            </span>

            {currentSubfolders.map((sub) => {
              const isSelected = activeSubfolder === sub;
              const subCount = content.filter(
                (c) => c.folderName === activeFolder && c.subfolderName === sub
              ).length;

              return (
                <button
                  key={sub}
                  onClick={() => setActiveSubfolder(sub)}
                  className={`w-full text-left p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-teal-100/70 dark:bg-teal-950 text-teal-950 dark:text-teal-200 border border-teal-200 dark:border-teal-800 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <span className="truncate pr-2">{sub}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      isSelected
                        ? 'bg-teal-800 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {subCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Files Grid (Right Column) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {activeSubfolder || activeFolder} ({currentFiles.length} resources)
              </span>
            </div>

            {currentFiles.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-teal-100 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-850">
                <FileText className="w-10 h-10 text-teal-300 mx-auto mb-3" />
                <p className="text-[11px] text-slate-400 mt-1">
                  {isAdmin ? 'Upload PDF notes, chapter question banks, or assignment sheets' : 'Study materials will appear here once uploaded by the academy.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentFiles.map((file) => {
                  return (
                    <div
                      key={file.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-teal-100 dark:border-slate-700 hover:border-teal-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {file.fileType === 'pdf' ? (
                              <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300 border border-red-100 dark:border-red-900">
                                <FileText className="w-5 h-5" />
                              </div>
                            ) : file.fileType === 'video' ? (
                              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300 border border-teal-100 dark:border-teal-900">
                                <VideoIcon className="w-5 h-5" />
                              </div>
                            ) : file.fileType === 'quiz' ? (
                              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900">
                                <HelpCircle className="w-5 h-5" />
                              </div>
                            ) : (
                              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                                <FileSpreadsheet className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {file.fileType}
                              </span>
                              <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                                {file.fileSize}
                              </span>
                            </div>
                          </div>

                          {isAdmin && (
                            <button
                              onClick={() => onDeleteContent(file.id)}
                              className="text-slate-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                              title="Delete resource"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <h4 className="font-extrabold text-slate-800 dark:text-white text-xs line-clamp-2 leading-relaxed">
                          {file.title}
                        </h4>

                        {file.details && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-normal">
                            {file.details}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {file.uploadedAt}
                        </span>

                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {file.fileType === 'pdf' && onOpenSecurePdf && (
                            <button
                              onClick={() => onOpenSecurePdf(file)}
                              className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Anti-leak watermarked secure reader"
                            >
                              <Eye className="w-3 h-3 text-teal-700 dark:text-teal-400" />
                              <span>Secure Read</span>
                            </button>
                          )}

                          <button
                            onClick={() => setPreviewItem(file)}
                            className="px-2.5 py-1 rounded-lg text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-700 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Preview</span>
                          </button>

                          <button
                            onClick={() => handleDownloadFile(file)}
                            className="px-2.5 py-1 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* File Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-teal-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-teal-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-teal-600"></span>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base truncate max-w-md">
                  {previewItem.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 space-y-4">
              <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-slate-800/80 border border-teal-100 dark:border-slate-700 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">Category:</span>
                  <span className="font-bold text-teal-900 dark:text-teal-200">{previewItem.folderName} / {previewItem.subfolderName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">File Type:</span>
                  <span className="uppercase font-bold text-slate-800 dark:text-white">{previewItem.fileType}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">Size:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{previewItem.fileSize}</span>
                </div>
                {previewItem.fileName && (
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="font-semibold">Original File:</span>
                    <span className="font-mono text-teal-700 dark:text-teal-300 truncate max-w-[200px]">{previewItem.fileName}</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs">
                <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">Content Summary:</p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {previewItem.details || 'Includes step-by-step NCERT solutions, theory explanation, formula charts, and exam-focused drills.'}
                </p>
              </div>

              {previewItem.fileType === 'quiz' && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-100 dark:border-emerald-800 text-xs space-y-2">
                  <p className="font-bold text-emerald-900 dark:text-emerald-300">Quiz Sample Question (Q1 of 15):</p>
                  <p className="text-emerald-800 dark:text-emerald-200 font-medium">"If two positive integers a and b are written as a = x³y² and b = xy³, where x, y are prime numbers, then HCF(a, b) is:"</p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <span className="p-2 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-emerald-200 dark:border-emerald-700 font-mono">A. xy</span>
                    <span className="p-2 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-bold border border-emerald-300 dark:border-emerald-700 font-mono">B. xy² (Correct)</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-teal-100 dark:border-slate-800">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadFile(previewItem)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download / Open File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload New Content Modal strictly guarded with isAdmin and Real File Picker */}
      {isUploadOpen && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-teal-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-teal-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                  Upload Notes & Assignments
                </h3>
                <p className="text-xs text-teal-700 dark:text-teal-300 font-medium">
                  Supabase & Cloud Storage Upload with Real File Picker
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setIsUploadOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpload} className="space-y-4 mt-4 text-xs">
              
              {/* Real File Picker Dropzone */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select File from Computer / Device <span className="text-red-500">*</span>
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileSelect(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-5 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-teal-600 bg-teal-50 dark:bg-slate-800'
                      : selectedFile
                      ? 'border-teal-400 bg-teal-50/50 dark:bg-slate-800'
                      : 'border-slate-200 dark:border-slate-700 hover:border-teal-400 bg-slate-50/60 dark:bg-slate-800/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.png,.jpg,.jpeg,.mp4"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />

                  {selectedFile ? (
                    <div className="space-y-1">
                      <div className="w-10 h-10 rounded-xl bg-teal-700 text-white mx-auto flex items-center justify-center">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <p className="font-extrabold text-teal-900 dark:text-teal-200 text-xs truncate max-w-xs mx-auto">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-teal-700 dark:text-teal-400 font-mono">
                        {formatBytes(selectedFile.size)} • Click to change file
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-8 h-8 text-teal-600 dark:text-teal-400 mx-auto mb-1" />
                      <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                        Click to browse file or drag & drop here
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Supports PDF, Word Documents (.doc, .docx), Quizzes, Videos
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Resource Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 8 Trigonometry - Solved Examples & NCERT Notes"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Folder / Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomUploadFolder(!isCustomUploadFolder)}
                      className="text-[10px] text-teal-700 dark:text-teal-400 font-extrabold hover:underline cursor-pointer"
                    >
                      {isCustomUploadFolder ? '← List' : '+ Custom Folder'}
                    </button>
                  </div>
                  {isCustomUploadFolder ? (
                    <input
                      type="text"
                      placeholder="e.g. Class 11 Chemistry"
                      value={customUploadFolderInput}
                      onChange={(e) => setCustomUploadFolderInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-teal-300 dark:border-teal-700 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-teal-50/50 dark:bg-slate-800 dark:text-white text-xs font-semibold"
                    />
                  ) : (
                    <select
                      value={uploadFolder}
                      onChange={(e) => {
                        if (e.target.value === '__add_custom__') {
                          setIsCustomUploadFolder(true);
                        } else {
                          setUploadFolder(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium text-xs"
                    >
                      {folders.map((f) => (
                        <option key={f.id} value={f.name} className="dark:bg-slate-800 dark:text-white">{f.name}</option>
                      ))}
                      <option value="__add_custom__" className="dark:bg-slate-800 dark:text-teal-300">+ Add New / Custom Folder...</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    File Type
                  </label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium"
                  >
                    <option value="pdf" className="dark:bg-slate-800 dark:text-white">PDF Document</option>
                    <option value="video" className="dark:bg-slate-800 dark:text-white">Recorded Video Lecture</option>
                    <option value="quiz" className="dark:bg-slate-800 dark:text-white">Interactive Quiz</option>
                    <option value="doc" className="dark:bg-slate-800 dark:text-white">Notes Sheet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chapter / Subfolder Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 8: Trigonometry"
                  value={uploadSubfolder}
                  onChange={(e) => setUploadSubfolder(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Student Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Key concepts covered, preparation advice, and assignment submission deadlines."
                  value={uploadDetails}
                  onChange={(e) => setUploadDetails(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              {isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-teal-800 dark:text-teal-300 font-bold">
                    <span>Uploading to Supabase / Storage...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-teal-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Uploading File...' : 'Upload & Save Resource'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
