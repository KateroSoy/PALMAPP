/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Play, ChevronRight, ChevronLeft, X, CheckCircle, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';

interface OnboardingTourProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setTriggerPurchaseForm: (val: boolean) => void;
  setShowShortcutGuide: (val: boolean) => void;
  onComplete: () => void;
}

export default function OnboardingTour({
  activeTab,
  setActiveTab,
  setTriggerPurchaseForm,
  setShowShortcutGuide,
  onComplete
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Selamat Datang di RamPalm OS! 🌴',
      description: 'Halo! Selamat datang di dashboard operasional jembatan timbang kelapa sawit digital Anda. Mari kita mulai tur singkat 5 langkah untuk mengenal fitur-fitur utama sistem.',
      action: () => {
        setActiveTab('overview');
        setTriggerPurchaseForm(false);
        setShowShortcutGuide(false);
      },
      targetLabel: 'Dashboard Ringkasan'
    },
    {
      title: 'Sistem Health & Keandalan Timbangan ⚡',
      description: 'Di dashboard utama, sekarang terdapat panel "System Health" real-time. Ini melacak detak jantung jembatan timbang digital (serial COM/RS-232), status sinkronisasi backup database cloud, dan internet cadangan Anda secara instan.',
      action: () => {
        setActiveTab('overview');
        // Smooth scroll to the system health section if needed
        const el = document.getElementById('system-health-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
      targetLabel: 'Widget Status Hardware'
    },
    {
      title: 'Formulir Transaksi Pembelian TBS ✍️',
      description: 'Ini adalah tempat mencatat timbangan truk sawit masuk. Kami telah otomatis mengaktifkan formulir input pembelian agar Anda dapat langsung melihat kolom pengisian No Polisi, Supplier, dan berat Bruto.',
      action: () => {
        setActiveTab('purchases');
        setTriggerPurchaseForm(true); // Automatically open the form to show the user
        setShowShortcutGuide(false);
      },
      targetLabel: 'Mulai Timbang Masuk'
    },
    {
      title: 'Alat Filter & Ekspor Laporan Sawit 📊',
      description: 'Modul laporan kami dilengkapi filter pencarian supplier, tanggal timbang, dan kalkulasi otomatis. Di sini kasir dapat mengekspor rekap timbangan harian ke CSV atau cetak PDF resmi.',
      action: () => {
        setActiveTab('reports');
        setTriggerPurchaseForm(false);
        setShowShortcutGuide(false);
      },
      targetLabel: 'Filter Laporan Periode'
    },
    {
      title: 'Akses Kilat Keyboard Shortcuts ⌨️',
      description: 'Untuk kecepatan operator di puncak sibuk lalu lintas truk sawit, kami menyediakan pintasan global. Kami telah membuka panduan shortcuts agar Anda dapat langsung melihat tombol pintas seperti Ctrl+N atau Ctrl+K.',
      action: () => {
        setActiveTab('overview');
        setTriggerPurchaseForm(false);
        setShowShortcutGuide(true); // Automatically open the shortcut helper modal
      },
      targetLabel: 'Akses Kilat Operator'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      steps[nextStep].action();
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      steps[prevStep].action();
    }
  };

  const handleClose = () => {
    // Clean up any open modals triggered during walkthrough
    setTriggerPurchaseForm(false);
    setShowShortcutGuide(false);
    setActiveTab('overview');
    onComplete();
  };

  const current = steps[currentStep];

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-[360px] bg-emerald-950 text-white rounded-3xl border-2 border-[#C6F24A]/40 shadow-2xl p-5 space-y-4 animate-slideInRight text-left overflow-hidden">
      {/* Decorative gradient light */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#C6F24A]/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-900 pb-2 relative z-10">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#C6F24A] animate-pulse" />
          <span className="text-[10px] uppercase tracking-wider font-black text-[#C6F24A]">
            Panduan Interaktif RamPalm (Langkah {currentStep + 1} dari {steps.length})
          </span>
        </div>
        <button
          onClick={handleClose}
          className="text-[#E6EBDD]/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all cursor-pointer"
          title="Tutup Panduan"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Step Info */}
      <div className="space-y-2 relative z-10">
        <div className="inline-block bg-[#C6F24A]/10 text-[#C6F24A] text-[9px] font-bold px-2 py-0.5 rounded-md border border-[#C6F24A]/20">
          Target: {current.targetLabel}
        </div>
        <h4 className="font-extrabold text-sm text-white leading-tight">
          {current.title}
        </h4>
        <p className="text-xs text-[#E6EBDD]/80 leading-relaxed font-normal">
          {current.description}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-emerald-900/50 rounded-full h-1 relative z-10">
        <div
          className="bg-[#C6F24A] h-1 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-1 relative z-10">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition-all border ${
            currentStep === 0
              ? 'opacity-40 cursor-not-allowed border-transparent text-gray-500'
              : 'border-emerald-800 text-white hover:bg-white/5 cursor-pointer'
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Kembali</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-1 text-[11px] font-bold bg-[#C6F24A] text-[#123C2B] hover:bg-[#b5e03b] px-3.5 py-1.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer font-sans"
        >
          <span>{currentStep === steps.length - 1 ? 'Selesai' : 'Lanjut'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
