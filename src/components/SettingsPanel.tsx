import React, { useState, useEffect } from 'react';
import { AcademySettings, DigitalCertificate, AcademicTarget } from '../types.ts';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Save,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Award,
  Sparkles,
  Eye,
  FileCheck,
  ExternalLink,
  Target,
  Plus,
  Trash2,
  X,
  CreditCard,
  Layers,
  FileText
} from 'lucide-react';
import { CertificateModal } from './CertificateModal.tsx';
import { uploadAcademyFile } from '../lib/supabase.ts';

interface SettingsPanelProps {
  academy: AcademySettings;
  certificates?: DigitalCertificate[];
  onUpdateAcademy: (settings: Partial<AcademySettings>) => void;
  onClose?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  academy,
  certificates = [],
  onUpdateAcademy,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'payments' | 'targets' | 'certificates'>('general');

  // Form states
  const [name, setName] = useState(academy.name || 'Achiever Academy');
  const [tagline, setTagline] = useState(academy.tagline || 'Excellence in Coaching & Board Preparations');
  const [address, setAddress] = useState(academy.address || '402, Knowledge Park III, Greater Noida, UP, India');
  const [phone, setPhone] = useState(academy.phone || '+91 98765 43210');
  const [email, setEmail] = useState(academy.email || 'admissions@achieveracademy.edu');
  const [upiId, setUpiId] = useState(academy.upiId || 'achieveracademy@okaxis');
  const [accountNumber, setAccountNumber] = useState(academy.accountNumber || '91987654321098');
  const [ifscCode, setIfscCode] = useState(academy.ifscCode || 'AXIS0002134');
  const [accountHolderName, setAccountHolderName] = useState(academy.accountHolderName || 'Achiever Academy Private Limited');

  // Certificate Metadata
  const [certificateTitle, setCertificateTitle] = useState('Certificate of Academic Excellence');
  const [signatoryName, setSignatoryName] = useState('Dr. S. K. Sharma');
  const [signatoryDesignation, setSignatoryDesignation] = useState('Academic Director & Dean');

  // Dynamic Academic Targets State
  const [targets, setTargets] = useState<AcademicTarget[]>([]);
  const [isLoadingTargets, setIsLoadingTargets] = useState(false);
  const [newTargetName, setNewTargetName] = useState('');
  const [newTargetCategory, setNewTargetCategory] = useState<'Engineering' | 'Medical' | 'Foundation' | 'Board Exams' | 'Olympiad'>('Engineering');
  const [newTargetGrade, setNewTargetGrade] = useState('Class 11 & 12');
  const [newTargetDesc, setNewTargetDesc] = useState('');

  // Certificate Live Preview Modal
  const [previewCert, setPreviewCert] = useState<DigitalCertificate | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Status notification
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load dynamic targets from backend API
  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    setIsLoadingTargets(true);
    try {
      const res = await fetch('/api/academic/options');
      const data = await res.json();
      if (data.targets && Array.isArray(data.targets)) {
        setTargets(data.targets);
      } else {
        // Fallback default targets
        setTargets([
          { id: 't-1', name: 'JEE Main & Advanced', category: 'Engineering', grade: 'Class 11 & 12', description: 'IIT Entrance & Top Engineering Institutes' },
          { id: 't-2', name: 'NEET-UG Medical', category: 'Medical', grade: 'Class 11 & 12', description: 'AIIMS & Government Medical Colleges' },
          { id: 't-3', name: 'CBSE Class 12 Boards', category: 'Board Exams', grade: 'Class 12', description: 'Centum Score Mastery & Practical Prep' },
          { id: 't-4', name: 'Foundation Class 10 (NTSE/Boards)', category: 'Foundation', grade: 'Class 10', description: 'Early Competitive Edge & Board Excellence' },
          { id: 't-5', name: 'Foundation Class 9 Olympiads', category: 'Olympiad', grade: 'Class 9', description: 'NSO, IMO & Regional Science Olympiads' }
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch targets:', err);
    } finally {
      setIsLoadingTargets(false);
    }
  };

  const handleAddTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTargetName.trim()) return;

    const newTarget: AcademicTarget = {
      id: `target-${Date.now()}`,
      name: newTargetName.trim(),
      category: newTargetCategory,
      grade: newTargetGrade.trim(),
      description: newTargetDesc.trim() || `${newTargetCategory} competitive pathway`
    };

    setTargets((prev) => [...prev, newTarget]);

    try {
      await fetch('/api/academic/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: newTarget })
      });
    } catch (err) {
      console.error('Failed to save academic target:', err);
    }

    setNewTargetName('');
    setNewTargetDesc('');
  };

  const handleDeleteTarget = async (targetId: string) => {
    setTargets((prev) => prev.filter((t) => t.id !== targetId));
    try {
      await fetch(`/api/academic/options?id=${targetId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Failed to delete target:', err);
    }
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAcademy({
      name,
      tagline,
      address,
      phone,
      email
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSavePayments = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAcademy({
      upiId,
      accountNumber,
      ifscCode,
      accountHolderName
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleOpenSampleCertificatePreview = () => {
    const sampleCertificate: DigitalCertificate = {
      id: 'cert-sample-preview',
      studentId: 'sample-student',
      studentName: 'Rahul Verma (Sample)',
      batchId: 'sample-batch',
      batchName: 'JEE Advanced Elite Droppers',
      courseTitle: `${name} Advanced Mastery Program`,
      completionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      certificateNumber: 'AA-FSDB-RK4579',
      verificationCode: 'AA-FSDB-RK4579',
      grade: 'Distinction (A+)',
      status: 'active',
      issuedBy: signatoryName,
      verificationUrl: `https://achieveracademy.edu/verify/AA-FSDB-RK4579`
    };
    setPreviewCert(sampleCertificate);
    setIsPreviewModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header with Universal Close Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-teal-100 dark:border-slate-800 shadow-sm relative">
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close Settings Panel"
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                Admin Control & Academy Settings
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage institution branding, UPI QR codes, academic targets, and verified digital certificates
              </p>
            </div>
          </div>
        </div>

        {savedSuccess && (
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved Successfully!</span>
          </span>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-teal-100 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-teal-800 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-teal-100 dark:border-slate-800 hover:bg-teal-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>General Branding</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'payments'
              ? 'bg-teal-800 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-teal-100 dark:border-slate-800 hover:bg-teal-50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Fee & QR Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('targets')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'targets'
              ? 'bg-teal-800 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-teal-100 dark:border-slate-800 hover:bg-teal-50'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Dynamic Academic Targets ({targets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'certificates'
              ? 'bg-teal-800 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-teal-100 dark:border-slate-800 hover:bg-teal-50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Certificates & Verification Logs</span>
        </button>
      </div>

      {/* TAB 1: General Branding */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-teal-100 dark:border-slate-800 shadow-sm space-y-5">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-700" />
            <span>Institution Profile & Contact Details</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Academy Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tagline / Motto
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Helpline Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Admissions Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Campus Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save General Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Fee & QR Settings */}
      {activeTab === 'payments' && (
        <form onSubmit={handleSavePayments} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-teal-100 dark:border-slate-800 shadow-sm space-y-5">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-teal-700" />
            <span>UPI QR Code & Bank Transfer Settings</span>
          </h2>
          <p className="text-xs text-slate-500">
            This UPI VPA and Bank details are used dynamically to generate real-time Bharat QR payment codes on student fee checkout screens.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Merchant UPI ID (VPA) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., achieveracademy@okaxis"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Account Holder / Merchant Name *
              </label>
              <input
                type="text"
                required
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bank Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bank IFSC Code
              </label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Fee & QR Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Dynamic Academic Targets Manager */}
      {activeTab === 'targets' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-teal-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-teal-700" />
                  <span>Dynamic Academic Targets & Exam Goals</span>
                </h2>
                <p className="text-xs text-slate-500">
                  These academic target options populate dynamically in the Student Registration form and Batch Target categorizations.
                </p>
              </div>
            </div>

            {/* Add Target Form with manual text inputs */}
            <form onSubmit={handleAddTarget} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                + Add Custom Target Exam / Grade Stream
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Target Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., NDA / Defence Services Entrance"
                    value={newTargetName}
                    onChange={(e) => setNewTargetName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Category Stream *
                  </label>
                  <select
                    value={newTargetCategory}
                    onChange={(e) => setNewTargetCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Engineering">Engineering (JEE/BITSAT)</option>
                    <option value="Medical">Medical (NEET-UG/AIIMS)</option>
                    <option value="Board Exams">Board Exams (CBSE/ICSE)</option>
                    <option value="Foundation">Foundation (Class 8-10)</option>
                    <option value="Olympiad">Olympiad & NTSE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Applicable Grades
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Class 11 & 12"
                    value={newTargetGrade}
                    onChange={(e) => setNewTargetGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Brief Description
                </label>
                <input
                  type="text"
                  placeholder="e.g., Comprehensive syllabus coverage with mock tests and physical training guidance"
                  value={newTargetDesc}
                  onChange={(e) => setNewTargetDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Target to Database</span>
                </button>
              </div>
            </form>

            {/* Existing Targets Table */}
            <div className="divide-y divide-teal-50 dark:divide-slate-800 border-t border-teal-100 dark:border-slate-800 mt-4">
              {targets.map((target) => (
                <div key={target.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {target.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                        {target.category}
                      </span>
                      {target.grade && (
                        <span className="text-xs text-slate-400 font-medium">({target.grade})</span>
                      )}
                    </div>
                    {target.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{target.description}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteTarget(target.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    title="Delete Academic Target"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Certificate Metadata & Verification Logs */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          {/* Certificate Metadata Settings & Live Preview Button */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-teal-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Digital Certificate Template & Verification Controls</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Custom cream/gold official certificate design featuring tamper-proof database verification codes and QR scans.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenSampleCertificatePreview}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Eye className="w-4 h-4" />
                <span>View Certificate Live Preview</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Certificate Header Title
                </label>
                <input
                  type="text"
                  value={certificateTitle}
                  onChange={(e) => setCertificateTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Signatory Name
                </label>
                <input
                  type="text"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Signatory Designation
                </label>
                <input
                  type="text"
                  value={signatoryDesignation}
                  onChange={(e) => setSignatoryDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Issued Certificates Tracking Log */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-teal-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <span>Issued Certificates Verification Log ({certificates.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Database record of all digital credentials issued to graduating students with instant verification codes.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-teal-50/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold uppercase tracking-wider border-b border-teal-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Batch / Course</th>
                    <th className="py-3 px-3">Verification Code</th>
                    <th className="py-3 px-3">Issue Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-50 dark:divide-slate-800 font-medium">
                  {certificates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No certificates have been issued yet. Issue certificates upon 100% curriculum completion.
                      </td>
                    </tr>
                  ) : (
                    certificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-teal-50/40 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                          {cert.studentName}
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                          {cert.batchName}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-teal-800 dark:text-teal-300">
                          {cert.verificationCode || cert.certificateNumber || 'AA-FSDB-RK4579'}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {cert.completionDate || 'Recent'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Verified Active
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setPreviewCert(cert);
                              setIsPreviewModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-slate-800 hover:bg-teal-100 dark:hover:bg-slate-700 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Official Light-Themed Certificate Modal Preview with Prominent "X" Button */}
      <CertificateModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        certificate={previewCert}
        isSamplePreview={previewCert?.id === 'cert-sample-preview'}
      />
    </div>
  );
};
