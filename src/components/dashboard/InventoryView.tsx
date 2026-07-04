/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Database, AlertTriangle, ArrowUpRight, ArrowDownRight, Layers, FileText, Settings, BarChart2, LayoutGrid, Container } from 'lucide-react';
import { PurchaseTransaction, ShipmentRecord } from '../../types';
import { formatKg, formatTon } from '../../utils/calculations';

interface InventoryViewProps {
  purchases: PurchaseTransaction[];
  shipments: ShipmentRecord[];
  currentStock: number;
}

export default function InventoryView({ purchases, shipments, currentStock }: InventoryViewProps) {
  const maxCapacity = 100000; // 100 Tons capacity
  const percentCapacity = Math.min(100, (currentStock / maxCapacity) * 100);

  // Filter out real inbound and outbound logs
  const inboundLogs = purchases
    .filter(p => p.transactionStatus === 'Completed')
    .map(p => ({
      id: p.id,
      date: p.date,
      type: 'Inbound (Beli)',
      party: p.supplierId,
      weight: p.netWeight,
      status: 'Stocked'
    }));

  const outboundLogs = shipments
    .filter(s => s.status === 'Shipped' || s.status === 'Received')
    .map(s => ({
      id: s.id,
      date: s.date,
      type: 'Outbound (Kirim)',
      party: s.millId,
      weight: -s.shipmentWeight,
      status: 'Dispatched'
    }));

  const stockHistory = [...inboundLogs, ...outboundLogs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  // Grade Distribution calculations for Warehouse Bays
  const completedPurchases = purchases.filter(p => p.transactionStatus === 'Completed');
  const gradeWeights = { A: 0, B: 0, C: 0, Reject: 0 };
  let totalCommittedWeight = 0;
  
  completedPurchases.forEach(p => {
    const grade = (p.qualityRecord?.grade as 'A' | 'B' | 'C' | 'Reject') || 'A';
    if (gradeWeights[grade] !== undefined) {
      gradeWeights[grade] += p.netWeight;
      totalCommittedWeight += p.netWeight;
    }
  });

  const bayCapacities = {
    A: 40000,
    B: 30000,
    C: 20000,
    Reject: 10000
  };

  const bayStocks = { A: 0, B: 0, C: 0, Reject: 0 };
  if (currentStock > 0) {
    if (totalCommittedWeight === 0) {
      const defaults = { A: 0.6, B: 0.2, C: 0.15, Reject: 0.05 };
      bayStocks.A = Math.round(currentStock * defaults.A);
      bayStocks.B = Math.round(currentStock * defaults.B);
      bayStocks.C = Math.round(currentStock * defaults.C);
      bayStocks.Reject = Math.round(currentStock * defaults.Reject);
    } else {
      let allocated = 0;
      const grades: ('A' | 'B' | 'C' | 'Reject')[] = ['A', 'B', 'C', 'Reject'];
      
      grades.forEach(g => {
        const ratio = gradeWeights[g] / totalCommittedWeight;
        const amt = Math.round(currentStock * ratio);
        bayStocks[g] = amt;
        allocated += amt;
      });

      // Adjust rounding error
      const diff = currentStock - allocated;
      bayStocks.A = Math.max(0, bayStocks.A + diff);
    }
  }

  const bayPercentages = {
    A: Math.min(100, (bayStocks.A / bayCapacities.A) * 100),
    B: Math.min(100, (bayStocks.B / bayCapacities.B) * 100),
    C: Math.min(100, (bayStocks.C / bayCapacities.C) * 100),
    Reject: Math.min(100, (bayStocks.Reject / bayCapacities.Reject) * 100)
  };

  // Helper to determine status and colors
  const getBayStatus = (percent: number) => {
    if (percent === 0) return { label: 'Empty', color: 'text-[#66736B] bg-[#E6EBDD]/50' };
    if (percent < 40) return { label: 'Low', color: 'text-emerald-700 bg-emerald-50 border border-emerald-200' };
    if (percent < 80) return { label: 'Optimal', color: 'text-blue-700 bg-blue-50 border border-blue-200' };
    return { label: 'Full Capacity', color: 'text-red-700 bg-red-50 border border-red-200 animate-pulse' };
  };

  const getBayStyles = (grade: 'A' | 'B' | 'C' | 'Reject') => {
    switch(grade) {
      case 'A': return {
        fillColor: 'from-[#123C2B] to-[#C6F24A]',
        borderColor: 'border-[#123C2B]',
        textAccent: 'text-[#123C2B]',
        lightBg: 'bg-[#F7FAF3]'
      };
      case 'B': return {
        fillColor: 'from-sky-800 to-cyan-400',
        borderColor: 'border-sky-800',
        textAccent: 'text-sky-800',
        lightBg: 'bg-sky-50/40'
      };
      case 'C': return {
        fillColor: 'from-amber-700 to-amber-300',
        borderColor: 'border-amber-700',
        textAccent: 'text-amber-800',
        lightBg: 'bg-amber-50/40'
      };
      case 'Reject': return {
        fillColor: 'from-red-800 to-rose-400',
        borderColor: 'border-red-800',
        textAccent: 'text-red-800',
        lightBg: 'bg-rose-50/40'
      };
    }
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#E6EBDD] pb-5">
        <h2 className="text-xl md:text-2xl font-black text-[#102018]">Inventory & Manajemen Stokpile</h2>
        <p className="text-xs text-[#66736B] mt-1">
          Monitor kapasitas loading bay RAM, segregasi stok berdasarkan kualitas, dan aliran keluar-masuk stockpile secara presisi.
        </p>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: SILO Visualization Gauge & Stats */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E6EBDD] shadow-sm space-y-6">
          <h3 className="font-extrabold text-sm text-[#102018] flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-800" />
            Visualisasi Loading Bay RAM Sawit (Total)
          </h3>

          {/* Visual Tank/Silo style representation */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Storage tank visual */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-40 h-64 bg-[#F7FAF3] border-4 border-[#E6EBDD] rounded-b-[40px] rounded-t-xl overflow-hidden shadow-inner flex flex-col justify-end">
                {/* Gauge lines */}
                <div className="absolute inset-y-0 right-3 flex flex-col justify-between text-[9px] text-[#66736B] font-bold py-4 pointer-events-none z-10">
                  <span>100T</span>
                  <span>75T</span>
                  <span>50T</span>
                  <span>25T</span>
                  <span>0T</span>
                </div>

                {/* Fill block with gradient */}
                <div 
                  className="w-full bg-gradient-to-t from-[#123C2B] to-[#C6F24A] transition-all duration-1000 ease-out flex items-center justify-center text-white font-black text-xs font-mono pb-4"
                  style={{ height: `${percentCapacity}%` }}
                >
                  {percentCapacity > 15 && `${percentCapacity.toFixed(1)}%`}
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#66736B] mt-3">Siluet Kapasitas Fisik</span>
            </div>

            {/* Quantitative stats */}
            <div className="md:col-span-7 space-y-4">
              <div className="bg-[#F7FAF3] p-4 rounded-xl border border-[#E6EBDD]">
                <span className="text-[11px] font-bold text-[#66736B] block uppercase tracking-wider">Total Stok Tersedia</span>
                <span className="text-2xl font-black font-mono text-[#102018] block mt-1">{formatKg(currentStock)}</span>
                <span className="text-xs text-[#123C2B] font-bold mt-0.5 block">{formatTon(currentStock)} TBS Kelapa Sawit</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#F7FAF3] p-3 rounded-xl border border-[#E6EBDD]">
                  <span className="text-[10px] font-semibold text-[#66736B] block">Kapasitas Maks</span>
                  <span className="font-extrabold font-mono text-[#102018] block mt-0.5">100.000 kg</span>
                </div>
                <div className="bg-[#F7FAF3] p-3 rounded-xl border border-[#E6EBDD]">
                  <span className="text-[10px] font-semibold text-[#66736B] block">Sisa Slot Kosong</span>
                  <span className="font-extrabold font-mono text-emerald-800 block mt-0.5">{formatKg(Math.max(0, maxCapacity - currentStock))}</span>
                </div>
              </div>

              {percentCapacity > 85 && (
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold">Stok Hampir Penuh!</span>
                    <p className="text-[11px] text-amber-900 leading-snug mt-0.5">
                      Kapasitas loading bay sudah melampaui 85%. Segera jadwalkan truk fuso tambahan untuk mengirim TBS ke pabrik kelapa sawit (PKS) terdekat.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Mini Stock History Audit Trail */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#E6EBDD] shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-[#102018] flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-800" />
            Aliran Keluar-Masuk Terakhir
          </h3>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {stockHistory.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#66736B]">
                Belum ada mutasi keluar/masuk stok saat ini.
              </div>
            ) : (
              stockHistory.map((log, idx) => (
                <div key={idx} className="bg-[#F7FAF3] p-3 rounded-xl border border-[#E6EBDD] flex items-center justify-between text-xs">
                  <div className="text-left space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold ${log.weight > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>{log.id}</span>
                      <span className="text-[10px] bg-[#E6EBDD]/40 text-[#102018]/80 px-1.5 py-0.5 rounded font-semibold">{log.type}</span>
                    </div>
                    <span className="text-[10px] text-[#66736B] block">Pihak: {log.party}</span>
                  </div>

                  <div className="text-right">
                    <span className={`font-mono font-extrabold text-xs flex items-center justify-end gap-1 ${log.weight > 0 ? 'text-emerald-800' : 'text-red-700'}`}>
                      {log.weight > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {formatKg(Math.abs(log.weight))}
                    </span>
                    <span className="text-[9px] text-[#66736B] font-mono block">
                      {new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Visual Warehouse Segregation Layout Section */}
      <div className="bg-white rounded-2xl p-6 border border-[#E6EBDD] shadow-sm space-y-6">
        <div className="border-b border-[#E6EBDD] pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-sm md:text-base text-[#102018] flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-emerald-800" />
              Tata Letak Segregasi Gudang & Kapasitas Bay Kualitas
            </h3>
            <p className="text-xs text-[#66736B] mt-0.5">
              Peta digital segregasi stockpile untuk mencegah penurunan kualitas (deteriorasi) TBS kelapa sawit sebelum dikirim ke PKS.
            </p>
          </div>
          <div>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-100">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping"></span>
              Peta Segregasi Aktif
            </span>
          </div>
        </div>

        {/* 4 Storage Bays representation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {(['A', 'B', 'C', 'Reject'] as const).map(grade => {
            const cap = bayCapacities[grade];
            const stock = bayStocks[grade];
            const pct = bayPercentages[grade];
            const styles = getBayStyles(grade)!;
            const status = getBayStatus(pct);

            return (
              <div 
                key={grade}
                className={`rounded-2xl border border-[#E6EBDD] p-4 flex flex-col justify-between space-y-4 hover:shadow-md transition-all ${styles.lightBg}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg text-white bg-gradient-to-br ${styles.fillColor}`}>
                      <Container className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-xs text-[#102018]">BAY GRADE {grade}</h4>
                      <span className="text-[9px] text-[#66736B] block">Cap: {formatKg(cap)}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Interactive Visual Silo Layout */}
                <div className="relative w-full h-32 bg-white/80 rounded-xl border border-[#E6EBDD] overflow-hidden shadow-inner flex flex-col justify-end group">
                  {/* Grid Lines inside silo */}
                  <div className="absolute inset-0 flex flex-col justify-between py-2 px-3 pointer-events-none z-10 text-[8px] text-gray-300 font-bold font-mono">
                    <div className="border-b border-dashed border-gray-100 w-full text-right">{formatKg(cap)}</div>
                    <div className="border-b border-dashed border-gray-100 w-full text-right">{formatKg(cap * 0.5)}</div>
                    <div className="w-full text-right">0 kg</div>
                  </div>

                  {/* Liquid/Sand styled gradient fill */}
                  <div 
                    className={`w-full bg-gradient-to-t ${styles.fillColor} transition-all duration-1000 ease-out flex items-center justify-center text-white font-black text-xs font-mono pb-2`}
                    style={{ height: `${pct}%` }}
                  >
                    {pct > 20 && `${pct.toFixed(0)}%`}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-1.5 border-t border-[#E6EBDD]/50 pt-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#66736B] font-medium">Stok Terisi:</span>
                    <span className="font-extrabold font-mono text-[#102018]">{formatKg(stock)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#66736B] font-medium">Sisa Slot:</span>
                    <span className="font-bold font-mono text-[#66736B]">{formatKg(Math.max(0, cap - stock))}</span>
                  </div>

                  {/* Progress bar line */}
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                    <div 
                      className={`h-1.5 rounded-full bg-gradient-to-r ${styles.fillColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Description info */}
                <div className="text-[9px] text-[#66736B] leading-relaxed border-t border-dashed border-[#E6EBDD] pt-2">
                  {grade === 'A' && "Menampung TBS matang sempurna dengan asam lemak bebas rendah."}
                  {grade === 'B' && "Menampung TBS matang standar dengan penyusutan sedang."}
                  {grade === 'C' && "Menampung TBS mentah, lewat matang, atau potongan tinggi."}
                  {grade === 'Reject' && "Segregasi TBS busuk atau tandan kosong sebelum pembuangan harian."}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
