/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, ChangeEvent, useEffect } from 'react';
import { ClipboardList, Camera, AlertTriangle, Search, Info, CheckCircle2, X, Sparkles, Wand2, Loader2, RefreshCw } from 'lucide-react';
import { PurchaseTransaction, QualityRecord } from '../../types';
import { formatKg } from '../../utils/calculations';

interface QualityViewProps {
  purchases: PurchaseTransaction[];
  onUpdateQuality: (trxId: string, record: QualityRecord) => void;
}

export default function QualityView({ purchases, onUpdateQuality }: QualityViewProps) {
  const [selectedTrxId, setSelectedTrxId] = useState('');
  const [showGradingForm, setShowGradingForm] = useState(false);

  // Quality grading states
  const [ripe, setRipe] = useState<number>(85);
  const [unripe, setUnripe] = useState<number>(5);
  const [overripe, setOverripe] = useState<number>(4);
  const [rotten, setRotten] = useState<number>(1);
  const [emptyBunch, setEmptyBunch] = useState<number>(2);
  const [dirt, setDirt] = useState<number>(2);
  const [moisture, setMoisture] = useState<number>(1.0);
  const [looseFruit, setLooseFruit] = useState<number>(150);
  const [notes, setNotes] = useState('');
  
  // Real image upload state with base64 for Gemini
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);

  // AI suggestion response state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  // Auto calculation logic for Indonesian TBS sorting standard:
  // Penalty points: 
  // - Unripe > 5%: 1% deduction per 2% unripe
  // - Rotten > 2%: 1.5% deduction per 1% rotten
  // - Empty bunch > 2%: 2% deduction per 1% empty bunch
  // - Dirt > 2%: 1% deduction per 1% dirt
  // - Moisture > 1%: 1% deduction per 1% moisture
  const calcUnripeDeduction = unripe > 5 ? Math.round((unripe - 5) / 2) : 0;
  const calcRottenDeduction = rotten > 2 ? (rotten - 2) * 1.5 : 0;
  const calcEmptyBunchDeduction = emptyBunch > 2 ? (emptyBunch - 2) * 2.0 : 0;
  const calcDirtDeduction = dirt > 2 ? (dirt - 2) * 1.0 : 0;
  const calcMoistureDeduction = moisture > 1 ? (moisture - 1) * 1.0 : 0;
  const autoDeductionPercent = Math.min(20, Math.round((2.0 + calcUnripeDeduction + calcRottenDeduction + calcEmptyBunchDeduction + calcDirtDeduction + calcMoistureDeduction) * 10) / 10);

  // Automatic Grade Assignment
  let autoGrade: 'A' | 'B' | 'C' | 'Reject' = 'A';
  if (ripe < 70 || rotten > 10 || emptyBunch > 10) {
    autoGrade = 'Reject';
  } else if (ripe < 80 || unripe > 15 || emptyBunch > 5) {
    autoGrade = 'C';
  } else if (ripe < 85 || unripe > 10) {
    autoGrade = 'B';
  }

  // Calculate Historical Defect Patterns for the current transaction's supplier
  const currentTrx = purchases.find(p => p.id === selectedTrxId);
  const supplierHistory = purchases.filter(p => 
    p.supplierId === currentTrx?.supplierId && 
    p.transactionStatus === 'Completed' && 
    p.qualityRecord !== undefined
  );

  const historicalPatterns = {
    totalPastDeliveries: supplierHistory.length,
    averageRipe: supplierHistory.length ? Math.round(supplierHistory.reduce((acc, p) => acc + (p.qualityRecord?.ripePercent || 0), 0) / supplierHistory.length) : 85,
    averageUnripe: supplierHistory.length ? Math.round(supplierHistory.reduce((acc, p) => acc + (p.qualityRecord?.unripePercent || 0), 0) / supplierHistory.length) : 5,
    averageOverripe: supplierHistory.length ? Math.round(supplierHistory.reduce((acc, p) => acc + (p.qualityRecord?.overripePercent || 0), 0) / supplierHistory.length) : 4,
    averageRotten: supplierHistory.length ? Math.round(supplierHistory.reduce((acc, p) => acc + (p.qualityRecord?.rottenPercent || 0), 0) / supplierHistory.length) : 1,
    averageEmptyBunch: supplierHistory.length ? Math.round(supplierHistory.reduce((acc, p) => acc + (p.qualityRecord?.emptyBunchPercent || 0), 0) / supplierHistory.length) : 2,
    averageDeduction: supplierHistory.length ? Math.round(supplierHistory.reduce((acc, p) => acc + (p.qualityRecord?.deductionPercent || 0), 0) / supplierHistory.length) : 2.0,
  };

  // Call the server-side API endpoint for Gemini suggestion
  const handleGetAiSuggestion = async () => {
    setIsAiLoading(true);
    setAiExplanation(null);
    try {
      const response = await fetch('/api/quality-grading-suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64,
          mimeType: imageMime,
          historicalPatterns: historicalPatterns,
          notes: notes
        })
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi asisten AI');
      }

      const result = await response.json();
      
      // Auto-populate form fields based on AI suggestions
      setRipe(result.ripePercent ?? 85);
      setUnripe(result.unripePercent ?? 5);
      setOverripe(result.overripePercent ?? 4);
      setRotten(result.rottenPercent ?? 1);
      setEmptyBunch(result.emptyBunchPercent ?? 2);
      setDirt(result.dirtPercent ?? 2);
      setMoisture(result.moisturePercent ?? 1.0);
      setLooseFruit(result.looseFruitKg ?? 150);
      setAiExplanation(result.explanation ?? 'Asisten AI menyarankan parameter sortasi di atas berdasarkan analisis data timbangan.');
    } catch (err: any) {
      console.error(err);
      alert('Error saat menghubungi AI: ' + (err.message || err));
    } finally {
      setIsAiLoading(false);
    }
  };

  // Simulation Presets for testing image analyzer in browser iframe
  const handleLoadSamplePhoto = (type: 'premium' | 'unripe' | 'overripe') => {
    let dummyBase64 = '';
    let dummyViewUrl = '';
    
    if (type === 'premium') {
      // 1x1 orange-red dot as representation
      dummyBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
      dummyViewUrl = 'https://images.unsplash.com/photo-1594007802410-b99caed0c9eb?auto=format&fit=crop&q=80&w=400';
    } else if (type === 'unripe') {
      // 1x1 green-ish dot representation
      dummyBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      dummyViewUrl = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400';
    } else {
      // 1x1 dark-brown representation
      dummyBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWGGoBwACvAF8bU0m3gAAAABJRU5ErkJggg==';
      dummyViewUrl = 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&q=80&w=400';
    }

    setSelectedImage(dummyViewUrl);
    setImageBase64(dummyBase64);
    setImageMime('image/png');
    setAiExplanation(`Foto sampel ${type === 'premium' ? 'matang premium' : type === 'unripe' ? 'mentah' : 'terlalu matang'} dimuat. Silakan klik "Dapatkan Saran AI" untuk menganalisis!`);
  };

  // List of purchases with pending or completed quality sorting
  const activeInspectionTrxs = purchases.filter(p => p.transactionStatus !== 'Cancelled');

  const handleSelectTrx = (trxId: string) => {
    setSelectedTrxId(trxId);
    const trx = purchases.find(p => p.id === trxId);
    if (trx && trx.qualityRecord) {
      // pre-populate existing
      const qr = trx.qualityRecord;
      setRipe(qr.ripePercent);
      setUnripe(qr.unripePercent);
      setOverripe(qr.overripePercent);
      setRotten(qr.rottenPercent);
      setEmptyBunch(qr.emptyBunchPercent);
      setDirt(qr.dirtPercent);
      setMoisture(qr.moisturePercent);
      setLooseFruit(qr.looseFruitKg);
      setNotes(qr.notes || '');
    } else if (trx) {
      // populate defaults based on weight
      setRipe(85);
      setUnripe(5);
      setOverripe(4);
      setRotten(1);
      setEmptyBunch(2);
      setDirt(2);
      setMoisture(1);
      setLooseFruit(Math.round(trx.netWeight * 0.02) || 100);
      setNotes('');
    }
    setAiExplanation(null);
    setSelectedImage(null);
    setImageBase64(null);
    setImageMime(null);
    setShowGradingForm(true);
  };

  const handleSaveGrading = () => {
    if (!selectedTrxId) return;

    const newRecord: QualityRecord = {
      ripePercent: ripe,
      unripePercent: unripe,
      overripePercent: overripe,
      rottenPercent: rotten,
      emptyBunchPercent: emptyBunch,
      dirtPercent: dirt,
      moisturePercent: moisture,
      looseFruitKg: looseFruit,
      grade: autoGrade,
      deductionPercent: autoDeductionPercent,
      notes: notes || 'Pemeriksaan sortasi kualitas RAM.'
    };

    onUpdateQuality(selectedTrxId, newRecord);
    setShowGradingForm(false);
    setSelectedTrxId('');
    setSelectedImage(null);
    setImageBase64(null);
    setImageMime(null);
    setAiExplanation(null);
  };

  const handleMockImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(URL.createObjectURL(file));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        const parts = base64Data.split(',');
        if (parts.length === 2) {
          setImageBase64(parts[1]);
          setImageMime(file.type);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Page Header */}
      <div className="border-b border-[#E6EBDD] pb-5">
        <h2 className="text-xl md:text-2xl font-black text-[#102018]">Pemeriksaan Kualitas & Sortasi TBS</h2>
        <p className="text-xs text-[#66736B] mt-1">
          Melakukan sampling buah sawit yang dibongkar untuk menghitung potongan kualitas bruto harian dengan asisten rekomendasi AI jembatan timbang.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Transaction list awaiting sorting */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-[#E6EBDD] shadow-sm space-y-4">
          <div className="border-b border-[#E6EBDD] pb-2">
            <h3 className="font-extrabold text-sm text-emerald-950">Daftar Nota Pembelian Aktif</h3>
            <p className="text-[10px] text-[#66736B]">Pilih nomor nota untuk menginput atau memperbarui data sortasi kualitas buah</p>
          </div>

          <div className="space-y-2.5 max-h-120 overflow-y-auto pr-1">
            {activeInspectionTrxs.map(p => (
              <button
                key={p.id}
                onClick={() => handleSelectTrx(p.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                  selectedTrxId === p.id 
                    ? 'bg-[#123C2B] text-white border-transparent shadow-md' 
                    : 'bg-[#F7FAF3] hover:bg-[#E6EBDD]/20 border-[#E6EBDD] text-[#102018]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                    <span>{p.id}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-sans font-bold ${
                      p.qualityRecord 
                        ? (selectedTrxId === p.id ? 'bg-white/20 text-[#C6F24A]' : 'bg-emerald-100 text-emerald-800')
                        : (selectedTrxId === p.id ? 'bg-red-500/30 text-red-200' : 'bg-red-50 border border-red-100 text-red-800')
                     }`}>
                      {p.qualityRecord ? `Grade ${p.qualityRecord.grade} (${p.qualityRecord.deductionPercent}%)` : 'Belum Disortir'}
                    </span>
                  </div>
                  <span className={`text-[10px] block mt-1 ${selectedTrxId === p.id ? 'text-white/60' : 'text-[#66736B]'}`}>
                    Netto TBS: {formatKg(p.netWeight)}
                  </span>
                </div>
                <ClipboardList className={`w-4 h-4 ${selectedTrxId === p.id ? 'text-[#C6F24A]' : 'text-emerald-800/60'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Grading Interactive Form */}
        <div className="lg:col-span-8">
          {!showGradingForm ? (
            <div className="bg-white rounded-3xl p-12 border border-[#E6EBDD] shadow-sm text-center flex flex-col items-center justify-center h-full min-h-80">
              <ClipboardList className="w-12 h-12 text-[#1F6B4A]/30 mb-4" />
              <h4 className="font-bold text-base text-[#102018]">Belum Ada Nota Terpilih</h4>
              <p className="text-xs text-[#66736B] max-w-sm mt-1">
                Silakan pilih salah satu nomor nota di sebelah kiri untuk mulai melakukan pemeriksaan grading sortasi kelapa sawit secara real-time.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#E6EBDD] shadow-md space-y-6 animate-fadeIn">
              {/* Form Header */}
              <div className="flex justify-between items-center border-b border-[#E6EBDD] pb-3">
                <div>
                  <span className="bg-[#123C2B] text-white font-mono text-xs font-bold px-3 py-1 rounded-xl">
                    SORTIR NOTA: {selectedTrxId}
                  </span>
                  <span className="text-xs text-[#66736B] block mt-1">
                    Isi sampling persentase kriteria buah sawit yang diturunkan.
                  </span>
                </div>
                <button
                  onClick={() => setShowGradingForm(false)}
                  className="text-[#66736B] hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* AI ASSISTED COPILOT BANNER */}
              <div className="bg-gradient-to-r from-emerald-950 to-[#123C2B] border border-emerald-800 rounded-2xl p-4 text-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-emerald-900 rounded-xl shrink-0 border border-emerald-700">
                    <Sparkles className="w-5 h-5 text-[#C6F24A]" />
                  </div>
                  <div className="text-left space-y-0.5">
                    <span className="text-[9px] bg-[#C6F24A] text-emerald-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Asisten Sortasi AI
                    </span>
                    <h4 className="font-black text-xs md:text-sm">Rekomendasi Grade & Sampling Kualitas</h4>
                    <p className="text-[10px] text-white/70 max-w-lg">
                      Menganalisis foto unggahan muatan truk dan histori defect supplier ({currentTrx?.supplierId}) untuk mengestimasi kriteria buah sawit dan persentase potongan otomatis.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={handleGetAiSuggestion}
                    disabled={isAiLoading}
                    className="bg-[#C6F24A] hover:bg-[#b5e03b] text-[#123C2B] font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isAiLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5" />
                    )}
                    {isAiLoading ? 'Menganalisis...' : 'Dapatkan Saran AI'}
                  </button>
                </div>
              </div>

              {/* AI Explanation Chat Bubble */}
              {aiExplanation && (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs text-emerald-950 text-left space-y-1">
                  <span className="font-bold text-[10px] text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Catatan Justifikasi AI:
                  </span>
                  <p className="leading-relaxed text-[#102018]">{aiExplanation}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Defect percentage Sliders */}
                <div className="md:col-span-8 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950">KRITERIA BUAH & DEFECT PENALTY</h4>
                  
                  {/* Ripe Bunch Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-emerald-800 font-bold">Buah Matang (Ripe %)</span>
                      <span className="font-mono">{ripe}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={ripe}
                      onChange={(e) => setRipe(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#E6EBDD] rounded-lg appearance-none cursor-pointer accent-emerald-800"
                    />
                  </div>

                  {/* Unripe Bunch Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-red-600 font-bold">Buah Mentah (Unripe %) - Penalty &gt; 5%</span>
                      <span className="font-mono">{unripe}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={unripe}
                      onChange={(e) => setUnripe(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#E6EBDD] rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                  </div>

                  {/* Overripe Bunch Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-amber-600 font-bold">Terlalu Matang (Overripe %)</span>
                      <span className="font-mono">{overripe}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={overripe}
                      onChange={(e) => setOverripe(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#E6EBDD] rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Rotten bunch */}
                    <div>
                      <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                        Buah Busuk (Rotten %)
                      </label>
                      <input
                        type="number"
                        value={rotten}
                        onChange={(e) => setRotten(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2 text-xs font-bold font-mono focus:outline-none focus:border-[#1F6B4A]"
                      />
                    </div>
                    {/* Empty bunch */}
                    <div>
                      <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                        Tandan Kosong (%)
                      </label>
                      <input
                        type="number"
                        value={emptyBunch}
                        onChange={(e) => setEmptyBunch(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2 text-xs font-bold font-mono focus:outline-none focus:border-[#1F6B4A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {/* Dirt/Long stalk */}
                    <div>
                      <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                        Sampah (%)
                      </label>
                      <input
                        type="number"
                        value={dirt}
                        onChange={(e) => setDirt(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2 text-xs font-bold font-mono focus:outline-none focus:border-[#1F6B4A]"
                      />
                    </div>
                    {/* Moisture % */}
                    <div>
                      <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                        Kadar Air (Moisture %)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={moisture}
                        onChange={(e) => setMoisture(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2 text-xs font-bold font-mono focus:outline-none focus:border-[#1F6B4A]"
                      />
                    </div>
                    {/* Loose fruit kg */}
                    <div>
                      <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                        Brondolan (kg)
                      </label>
                      <input
                        type="number"
                        value={looseFruit}
                        onChange={(e) => setLooseFruit(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2 text-xs font-bold font-mono focus:outline-none focus:border-[#1F6B4A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                      Catatan Sortasi Tambahan
                    </label>
                    <input
                      type="text"
                      value={notes}
                      placeholder="Contoh: Tangkai dipotong habis di lokasi, tumpukan rapi"
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
                    />
                  </div>
                </div>

                {/* Grading Summary Box & Upload UI */}
                <div className="md:col-span-4 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950">OUTPUT KUALITAS TBS</h4>

                  {/* Grade Card */}
                  <div className="bg-[#F7FAF3] p-4 rounded-2xl border border-[#E6EBDD] text-center space-y-2">
                    <span className="text-[10px] text-[#66736B] uppercase font-bold tracking-wider block">Kategori Grade</span>
                    <span className={`text-4xl font-black block font-sans ${
                      autoGrade === 'A' ? 'text-emerald-700' :
                      autoGrade === 'B' ? 'text-blue-600' :
                      autoGrade === 'C' ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {autoGrade}
                    </span>
                    <span className="text-[10px] text-[#66736B] block">Formula Otomatis Rampalm OS</span>
                  </div>

                  {/* Deduction Box */}
                  <div className="bg-[#123C2B] p-4 rounded-2xl text-white text-center space-y-1">
                    <span className="text-[10px] text-[#C6F24A] font-bold block uppercase tracking-wider">Potongan Berat Total</span>
                    <div className="text-3xl font-black font-mono">{autoDeductionPercent}%</div>
                    <span className="text-[9px] text-white/50 block">Mempengaruhi slip kasir saat bayar</span>
                  </div>

                  {/* Mock Photo upload */}
                  <div className="border border-dashed border-[#E6EBDD] rounded-2xl p-4 text-center space-y-3 bg-white">
                    <span className="text-[10px] text-[#66736B] uppercase font-bold block">Dokumentasi Sortasi</span>
                    {selectedImage ? (
                      <div className="space-y-2">
                        <div className="relative rounded-xl overflow-hidden max-h-24 border border-[#E6EBDD]">
                          <img src={selectedImage} alt="TBS sorting" className="w-full h-24 object-cover" />
                          <button
                            onClick={() => {
                              setSelectedImage(null);
                              setImageBase64(null);
                              setImageMime(null);
                            }}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-sm"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-800 block">Gambar Berhasil Dimuat</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="cursor-pointer border border-[#E6EBDD] hover:bg-emerald-50 text-[#123C2B] p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                          <Camera className="w-4 h-4 text-emerald-800" />
                          Ambil Foto/Upload
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleMockImageUpload}
                            className="hidden"
                          />
                        </label>

                        {/* Presets simulation row */}
                        <div className="flex justify-center gap-1 pt-1 border-t border-[#E6EBDD]/50">
                          <button 
                            type="button"
                            onClick={() => handleLoadSamplePhoto('premium')}
                            className="text-[8px] bg-[#F7FAF3] border border-[#E6EBDD] hover:bg-emerald-50 text-emerald-800 font-bold px-1.5 py-1 rounded"
                          >
                            Sampel A
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleLoadSamplePhoto('unripe')}
                            className="text-[8px] bg-[#F7FAF3] border border-[#E6EBDD] hover:bg-emerald-50 text-emerald-800 font-bold px-1.5 py-1 rounded"
                          >
                            Sampel C
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleLoadSamplePhoto('overripe')}
                            className="text-[8px] bg-[#F7FAF3] border border-[#E6EBDD] hover:bg-emerald-50 text-emerald-800 font-bold px-1.5 py-1 rounded"
                          >
                            Sampel Low
                          </button>
                        </div>
                      </div>
                    )}
                    <span className="text-[8px] text-[#66736B] block leading-snug">
                      *Gunakan Sampel A/C/Low untuk mensimulasikan jepretan kamera timbangan secara langsung di browser.
                    </span>
                  </div>

                  {/* Save button */}
                  <button
                    onClick={handleSaveGrading}
                    className="w-full bg-[#C6F24A] text-[#123C2B] hover:bg-[#b5e03b] font-black text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 animate-fadeIn"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Simpan Data Sortasi
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
