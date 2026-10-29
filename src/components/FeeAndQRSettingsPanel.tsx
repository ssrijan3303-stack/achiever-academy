import React, { useState } from 'react';
import { PaymentSettings, FeeRecord } from '../types.ts';
import {
  QrCode,
  CreditCard,
  Building,
  Save,
  Check,
  Upload,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  Receipt,
  Copy
} from 'lucide-react';

interface FeeAndQRSettingsPanelProps {
  paymentSettings: PaymentSettings;
  feeRecords: FeeRecord[];
  onUpdateSettings: (settings: Partial<PaymentSettings>) => void;
}

export const FeeAndQRSettingsPanel: React.FC<FeeAndQRSettingsPanelProps> = ({
  paymentSettings,
  feeRecords,
  onUpdateSettings
}) => {
  const [upiId, setUpiId] = useState(paymentSettings.upiId);
  const [accountHolderName, setAccountHolderName] = useState(paymentSettings.accountHolderName);
  const [bankName, setBankName] = useState(paymentSettings.bankName);
  const [accountNumber, setAccountNumber] = useState(paymentSettings.accountNumber);
  const [ifscCode, setIfscCode] = useState(paymentSettings.ifscCode);
  const [qrCodeUrl, setQrCodeUrl] = useState(paymentSettings.qrCodeUrl);
  const [instructions, setInstructions] = useState(paymentSettings.instructions);
  
  const [saved, setSaved] = useState(false);
  const [customQrInput, setCustomQrInput] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      upiId: upiId.trim(),
      accountHolderName: accountHolderName.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim(),
      qrCodeUrl: qrCodeUrl.trim(),
      instructions: instructions.trim()
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const handleRegenerateQR = () => {
    const newQr = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=upi://pay?pa=${encodeURIComponent(
      upiId.trim()
    )}&pn=${encodeURIComponent(accountHolderName.trim())}&cu=INR`;
    setQrCodeUrl(newQr);
  };

  const handleApplyCustomQr = () => {
    if (customQrInput.trim()) {
      setQrCodeUrl(customQrInput.trim());
      setCustomQrInput('');
    }
  };

  // Preset sample QR presets for demonstration
  const handlePresetQR = (preset: string) => {
    if (preset === 'gpay') {
      setUpiId('anushreeacademy.gpay@okaxis');
    } else if (preset === 'phonepe') {
      setUpiId('9876543210@ybl');
    } else {
      setUpiId('anushreeacademy@paytm');
    }
    const newQr = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=upi://pay?pa=${encodeURIComponent(
      preset === 'gpay' ? 'anushreeacademy.gpay@okaxis' : preset === 'phonepe' ? '9876543210@ybl' : 'anushreeacademy@paytm'
    )}&pn=${encodeURIComponent(accountHolderName.trim())}&cu=INR`;
    setQrCodeUrl(newQr);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          Payment Gateway & QR Code Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure official academy UPI payment QR codes, bank accounts, and view student fee receipts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-teal-100 dark:border-slate-800 shadow-[0_2px_12px_rgba(15,118,110,0.06)]">
          <form onSubmit={handleSave} className="space-y-5 text-xs">
            
            <div className="flex items-center gap-3 pb-4 border-b border-teal-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Official UPI & Bank Account Details
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Displayed on every enrolled student's Fee Payment portal
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary UPI ID / VPA
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. anushreeacademy@sbi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none font-mono font-bold text-teal-900 dark:text-teal-300"
                  />
                </div>
                <div className="flex gap-1.5 mt-1.5 text-[10px]">
                  <span className="text-slate-400">Presets:</span>
                  <button type="button" onClick={() => handlePresetQR('gpay')} className="text-teal-700 dark:text-teal-400 hover:underline font-semibold cursor-pointer">GPay</button>
                  <button type="button" onClick={() => handlePresetQR('phonepe')} className="text-teal-700 dark:text-teal-400 hover:underline font-semibold cursor-pointer">PhonePe</button>
                  <button type="button" onClick={() => handlePresetQR('paytm')} className="text-teal-700 dark:text-teal-400 hover:underline font-semibold cursor-pointer">Paytm</button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Account Beneficiary Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Anushree Academy Educational Trust"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  placeholder="State Bank of India"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  placeholder="389201948201"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  placeholder="SBIN0004210"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Direct QR Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={qrCodeUrl}
                  onChange={(e) => setQrCodeUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Instructions for Students
              </label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-teal-100 dark:border-slate-800">
              {saved && (
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  QR & Payment settings updated globally!
                </span>
              )}
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRegenerateQR}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-50 dark:bg-slate-800 hover:bg-teal-100 dark:hover:bg-slate-700 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate QR</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-teal-800 hover:bg-teal-900 text-white shadow-md shadow-teal-900/15 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Payment Settings</span>
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* Right Col: Live Active QR Code Preview */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-teal-100 dark:border-slate-800 shadow-[0_2px_12px_rgba(15,118,110,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-teal-50 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span>Live Student Payment QR</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Active in App
              </span>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-gradient-to-b from-teal-50/60 to-white dark:from-slate-800/60 dark:to-slate-900 rounded-2xl border-2 border-dashed border-teal-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
              <div className="w-48 h-48 bg-white p-2 rounded-xl shadow-md border border-slate-200 flex items-center justify-center">
                <img
                  src={qrCodeUrl}
                  alt="Official UPI QR Code"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback generator if custom URL fails
                    (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=upi://pay?pa=${encodeURIComponent(
                      upiId
                    )}&pn=Anushree%20Academy`;
                  }}
                />
              </div>

              <div className="mt-3">
                <p className="text-xs font-bold text-slate-800 dark:text-white">{accountHolderName}</p>
                <p className="text-[11px] font-mono font-semibold text-teal-800 dark:text-teal-300 mt-0.5 bg-teal-100/70 dark:bg-teal-950/60 px-2 py-0.5 rounded inline-block">
                  {upiId}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Supported by GPay, PhonePe, Paytm, BHIM, Mobikwik
                </p>
              </div>
            </div>

            {/* Upload Custom QR input */}
            <div className="mt-4 pt-3 border-t border-teal-50 dark:border-slate-800">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Paste Custom QR Image URL (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://..."
                  value={customQrInput}
                  onChange={(e) => setCustomQrInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomQr}
                  className="px-3 py-1.5 bg-teal-800 text-white font-bold text-xs rounded-xl hover:bg-teal-900 cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-teal-50/60 dark:bg-slate-800/80 rounded-xl border border-teal-100 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
            <span>Students scan this QR code directly inside their student dashboard to pay batch tuition.</span>
          </div>
        </div>

      </div>

      {/* Bottom Section: Recent Student Online Fee Payments */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-teal-100 dark:border-slate-800 shadow-[0_2px_12px_rgba(15,118,110,0.06)]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-teal-50 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-700 dark:text-teal-400" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Recent Online Fee Transactions & Receipts
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">{feeRecords.length} verified records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-teal-50/70 dark:bg-slate-800/80 border-b border-teal-100 dark:border-slate-800 text-teal-900 dark:text-teal-300 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Receipt No</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment Mode</th>
                <th className="px-4 py-3">Transaction / UTR Ref</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-50 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {feeRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-teal-50/30 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-teal-900 dark:text-teal-300">
                    {rec.receiptNumber}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    {rec.studentName}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {rec.batchName}
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-800 dark:text-emerald-400">
                    ₹{rec.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                      {rec.paymentMode}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {rec.transactionRef}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {rec.date}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <Check className="w-3 h-3" />
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
