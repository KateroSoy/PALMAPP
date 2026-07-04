/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Scale, Cpu, Play, Search, Clock, FileText, AlertCircle, RefreshCw, Key } from 'lucide-react';
import { PurchaseTransaction, Vehicle, Driver } from '../../types';
import { formatKg } from '../../utils/calculations';

interface WeighingViewProps {
  purchases: PurchaseTransaction[];
  vehicles: Vehicle[];
  drivers: Driver[];
  onCompleteTara: (trxId: string, tareWeight: number) => void;
  autoSelectFirst?: boolean;
  onFormClose?: () => void;
}

export default function WeighingView({
  purchases,
  vehicles,
  drivers,
  onCompleteTara,
  autoSelectFirst,
  onFormClose
}: WeighingViewProps) {
  const [search, setSearch] = useState('');
  const [selectedTrxId, setSelectedTrxId] = useState('');
  const [inputTare, setInputTare] = useState<number>(0);
  const [scaleMode, setScaleMode] = useState<'Manual' | 'Auto-Simulate'>('Manual');
  const [scaleReading, setScaleReading] = useState(0);

  // Filter for transactions that are drafts (uncompleted weighing, typically awaiting Tare)
  const pendingTaraTrxs = purchases.filter(p => p.transactionStatus === 'Draft' || !p.tareWeight);
  const completedWeighingTrxs = purchases.filter(p => p.transactionStatus === 'Completed' && p.tareWeight > 0);

  // Auto-select first pending transaction on quick action trigger
  useEffect(() => {
    if (autoSelectFirst) {
      const firstPending = pendingTaraTrxs[0];
      if (firstPending) {
        setSelectedTrxId(firstPending.id);
        setScaleMode('Auto-Simulate');
      }
      if (onFormClose) {
        onFormClose();
      }
    }
  }, [autoSelectFirst, pendingTaraTrxs, onFormClose]);

  // Simulate a fluctuating weighbridge scale harian (Rampalm OS telemetry feel)
  useEffect(() => {
    if (scaleMode === 'Auto-Simulate') {
      const interval = setInterval(() => {
        // Fluctuates around a common truck empty weight (e.g. 3,100 to 3,300 kg)
        const base = 3200;
        const randomFluctuate = Math.floor(Math.random() * 50) - 25;
        setScaleReading(base + randomFluctuate);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setScaleReading(0);
    }
  }, [scaleMode]);

  const handleApplySimulatedWeight = () => {
    if (scaleReading > 0) {
      setInputTare(scaleReading);
    }
  };

  const handleSaveTara = () => {
    if (!selectedTrxId) {
      alert('Pilih transaksi supir terlebih dahulu!');
      return;
    }
    if (inputTare <= 0) {
      alert('Timbangan Tara harus bernilai positif!');
      return;
    }

    const matchedTrx = purchases.find(p => p.id === selectedTrxId);
    if (matchedTrx && inputTare >= matchedTrx.grossWeight) {
      alert('Peringatan: Berat Tara tidak boleh lebih besar atau sama dengan berat Bruto kotor!');
      return;
    }

    onCompleteTara(selectedTrxId, inputTare);
    setSelectedTrxId('');
    setInputTare(0);
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Weighbridge Header */}
      <div className="border-b border-[#E6EBDD] pb-5">
        <h2 className="text-xl md:text-2xl font-black text-[#102018]">Modul Jembatan Timbang (Weighbridge)</h2>
        <p className="text-xs text-[#66736B] mt-1">
          Dikhususkan untuk operator jembatan timbang RAM. Memproses penimbangan tara kosong kendaraan setelah bongkar TBS.
        </p>
      </div>

      {/* Grid: Scale Telemetry & Complete Tara Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Telemetry Scale Panel */}
        <div className="lg:col-span-7 bg-[#102018] rounded-3xl p-5 md:p-6 text-white border border-[#C6F24A]/20 shadow-xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C6F24A]/5 blur-2xl rounded-full"></div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#C6F24A]" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">Sensor Telemetri Timbangan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/50">Mode Timbangan:</span>
              <button
                onClick={() => setScaleMode(scaleMode === 'Manual' ? 'Auto-Simulate' : 'Manual')}
                className={`text-[9px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                  scaleMode === 'Auto-Simulate' 
                    ? 'bg-[#C6F24A] text-[#123C2B] border-transparent font-black' 
                    : 'bg-white/5 border-white/20 text-white/80'
                }`}
              >
                {scaleMode === 'Auto-Simulate' ? 'SIMULATOR ACTIVE' : 'MANUAL KEYIN'}
              </button>
            </div>
          </div>

          {/* Big Digital LED Weight Display */}
          <div className="bg-[#152920] border border-white/5 rounded-2xl p-6 text-center font-mono">
            <span className="text-[10px] text-white/40 block text-left mb-1">INDOCATOR SCALE READING (KG)</span>
            <div className="text-4xl md:text-5xl font-black tracking-widest text-[#C6F24A] flex items-center justify-center gap-3">
              {scaleMode === 'Auto-Simulate' ? (
                <span>{scaleReading.toLocaleString('id-ID')}</span>
              ) : (
                <span className="text-white/30">00.000</span>
              )}
              <span className="text-xs text-white/60 font-sans tracking-normal font-bold">KG</span>
            </div>
            {scaleMode === 'Auto-Simulate' && (
              <button
                onClick={handleApplySimulatedWeight}
                className="mt-4 bg-[#C6F24A] hover:bg-[#b5e03b] text-[#123C2B] font-black text-[10px] px-4 py-1.5 rounded-lg transition-all shadow-sm block mx-auto uppercase tracking-wider"
              >
                Terapkan Berat Live ke Tara
              </button>
            )}
          </div>

          {/* Device diagnostics */}
          <div className="grid grid-cols-3 gap-3 text-[10px] text-white/60 font-mono">
            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
              <span className="text-white/40 block">API HARDWARE:</span>
              <span className="text-yellow-500 font-bold">COM-OFFLINE</span>
            </div>
            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
              <span className="text-white/40 block">BAUD RATE:</span>
              <span>9600 bps</span>
            </div>
            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
              <span className="text-white/40 block">CALIBRATION:</span>
              <span className="text-emerald-400 font-bold">VERIFIED</span>
            </div>
          </div>

          <p className="text-[10px] text-white/40 leading-relaxed italic">
            *Rampalm OS siap disambungkan dengan indikator timbangan digital merk Avery Weigh-Tronix, Rinstrum, Kubota, atau CAS melalui konektor RS232-to-Ethernet (Tersedia di Enterprise).
          </p>
        </div>

        {/* Process Tara Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 md:p-6 border border-[#E6EBDD] shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4 text-left">
            <h3 className="font-extrabold text-base text-emerald-950 pb-2 border-b border-[#E6EBDD] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-800" />
              Selesaikan Timbang Tara
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                Pilih Truk (Menunggu Tara) <span className="text-red-500">*</span>
              </label>
              {pendingTaraTrxs.length === 0 ? (
                <div className="bg-emerald-50 text-emerald-950 text-xs p-3 rounded-xl border border-emerald-100 italic">
                  Tidak ada truk pembawa TBS yang sedang mengantre di RAM / membongkar muatan saat ini.
                </div>
              ) : (
                <select
                  value={selectedTrxId}
                  onChange={(e) => setSelectedTrxId(e.target.value)}
                  className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-[#1F6B4A]"
                >
                  <option value="">-- Pilih Truk Antrean --</option>
                  {pendingTaraTrxs.map(p => {
                    const matchedDriver = drivers.find(d => d.id === p.driverId);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.id} - {p.vehicleId} ({matchedDriver?.name || p.driverId}) - Bruto: {formatKg(p.grossWeight)}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {selectedTrxId && (
              <div className="bg-yellow-50/50 p-3 rounded-xl border border-yellow-100 text-[11px] text-[#102018]/80 space-y-1 font-mono">
                <span className="font-bold text-yellow-800 uppercase block font-sans mb-1">DETAIL BRUTO KENDARAAN</span>
                <div>Nota: {selectedTrxId}</div>
                <div>Bruto Masuk: {formatKg(purchases.find(p => p.id === selectedTrxId)?.grossWeight || 0)}</div>
                <div>Tanggal Masuk: {new Date(purchases.find(p => p.id === selectedTrxId)?.date || '').toLocaleTimeString()}</div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                Input Berat Tara Kendaraan (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={inputTare || ''}
                placeholder="Contoh: 3100"
                onChange={(e) => setInputTare(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2.5 text-sm font-bold font-mono focus:outline-none focus:border-[#1F6B4A]"
              />
              <span className="text-[10px] text-[#66736B] block mt-1">Berat kosong kendaraan setelah muatan TBS dibongkar</span>
            </div>
          </div>

          <button
            onClick={handleSaveTara}
            disabled={!selectedTrxId || inputTare <= 0}
            className={`w-full font-black text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
              selectedTrxId && inputTare > 0
                ? 'bg-[#123C2B] text-white hover:bg-emerald-950'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
            }`}
          >
            Selesaikan Penimbangan & Catat Netto
          </button>
        </div>

      </div>

      {/* Weighing queue / list */}
      <div className="bg-white rounded-2xl border border-[#E6EBDD] p-5 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-emerald-950 border-b border-[#E6EBDD] pb-3">
          Arsip Rekaman Timbangan Jembatan Hari Ini
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E6EBDD] text-[#66736B] font-bold bg-[#F7FAF3]">
                <th className="py-2.5 px-3">Nota No.</th>
                <th className="py-2.5 px-3">Kendaraan</th>
                <th className="py-2.5 px-3">Supir</th>
                <th className="py-2.5 px-3 text-right">Berat Bruto (Kotor)</th>
                <th className="py-2.5 px-3 text-right">Berat Tara (Kosong)</th>
                <th className="py-2.5 px-3 text-right">Netto Bersih (TBS)</th>
                <th className="py-2.5 px-3 text-center">Petugas Operator</th>
                <th className="py-2.5 px-3 text-center">Sinyal Validasi</th>
              </tr>
            </thead>
            <tbody>
              {completedWeighingTrxs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#66736B]">
                    Belum ada penimbangan yang selesai tara harian.
                  </td>
                </tr>
              ) : (
                completedWeighingTrxs.map(w => {
                  const matchedDriver = drivers.find(d => d.id === w.driverId);
                  return (
                    <tr key={w.id} className="border-b border-[#E6EBDD] hover:bg-[#F7FAF3]/40 transition-colors">
                      <td className="py-3 px-3 font-bold font-mono text-emerald-950">{w.id}</td>
                      <td className="py-3 px-3 font-mono">{w.vehicleId}</td>
                      <td className="py-3 px-3 font-semibold">{matchedDriver?.name || w.driverId}</td>
                      <td className="py-3 px-3 text-right font-mono text-[#66736B]">{formatKg(w.grossWeight)}</td>
                      <td className="py-3 px-3 text-right font-mono text-[#66736B]">{formatKg(w.tareWeight)}</td>
                      <td className="py-3 px-3 text-right font-black font-mono text-emerald-800">{formatKg(w.netWeight)}</td>
                      <td className="py-3 px-3 text-center text-[#66736B]">{w.operatorName}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                          ✓ TIMBANGAN_VALID
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
