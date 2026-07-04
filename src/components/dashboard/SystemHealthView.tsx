/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ShieldCheck, HardDrive, Cpu, Radio, RefreshCw, AlertCircle, ArrowUpRight, Activity } from 'lucide-react';

export default function SystemHealthView() {
  const [diagnosing, setDiagnosing] = useState(false);
  const [lastCheck, setLastCheck] = useState<string>(() => new Date().toLocaleTimeString('id-ID'));
  const [scaleDrift, setScaleDrift] = useState<number>(0);
  const [latency, setLatency] = useState<number>(14);
  const [syncBacklog, setSyncBacklog] = useState<number>(0);
  const [rawScaleData, setRawScaleData] = useState<string>('[ST,GS,+000000kg]');

  // Simulate continuous real-time data stream from hardware serial COM port
  useEffect(() => {
    const interval = setInterval(() => {
      // Slight fluctuation in communication latency
      setLatency(prev => {
        const drift = Math.floor(Math.random() * 5) - 2;
        return Math.max(8, Math.min(30, prev + drift));
      });

      // Generate random scale raw string representing active continuous transmission
      const weights = ['18240', '17950', '00000', '05430', '12050', '21900'];
      const randomWeight = weights[Math.floor(Math.random() * weights.length)];
      setRawScaleData(`[ST,GS,+0${randomWeight}kg\\r\\n]`);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const runDiagnostics = () => {
    setDiagnosing(true);
    setTimeout(() => {
      setDiagnosing(false);
      setLastCheck(new Date().toLocaleTimeString('id-ID'));
      setSyncBacklog(0);
      setScaleDrift(0);
    }, 2000);
  };

  return (
    <div id="system-health-section" className="bg-white rounded-2xl p-5 border border-[#E6EBDD] shadow-sm space-y-4 text-left">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6EBDD] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-800 animate-pulse" />
            <h3 className="font-extrabold text-sm md:text-base text-emerald-950">Monitoring Koneksi & Hardware (System Health)</h3>
          </div>
          <p className="text-[11px] text-[#66736B] mt-0.5">Real-time status jembatan timbang digital, cadangan internet & sinkronisasi database cloud.</p>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={diagnosing}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#F7FAF3] hover:bg-[#E6EBDD] disabled:opacity-50 text-emerald-950 font-bold text-xs rounded-xl border border-[#E6EBDD] transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-800 ${diagnosing ? 'animate-spin' : ''}`} />
          <span>{diagnosing ? 'Memeriksa...' : 'Uji Diagnostik'}</span>
        </button>
      </div>

      {/* Connection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Jembatan Timbang Digital */}
        <div className="bg-[#F7FAF3] border border-[#E6EBDD] p-4 rounded-2xl space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-[#66736B] uppercase font-bold tracking-wider block">Weighbridge Connection</span>
                <span className="font-extrabold text-xs text-emerald-950">Avery ZM510 (COM3)</span>
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
              ● ONLINE
            </span>
          </div>

          <div className="space-y-1.5 text-[10px] font-mono text-[#66736B] border-t border-[#E6EBDD]/60 pt-2">
            <div className="flex justify-between">
              <span>Baud Rate:</span>
              <span className="font-bold text-emerald-950">9600 bps</span>
            </div>
            <div className="flex justify-between">
              <span>Serial Stream:</span>
              <span className="font-bold text-[#1F6B4A] bg-white border border-[#E6EBDD] px-1.5 py-0.5 rounded text-[9px]">
                {diagnosing ? '[SCANNING_PORT...]' : rawScaleData}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Kalibrasi Uji:</span>
              <span className="font-bold text-emerald-950">Sah (BMKG s.d Mar 2027)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Database Backup Sync */}
        <div className="bg-[#F7FAF3] border border-[#E6EBDD] p-4 rounded-2xl space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-lime-100 text-lime-950 rounded-xl">
                <HardDrive className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-[#66736B] uppercase font-bold tracking-wider block">Database Mirroring</span>
                <span className="font-extrabold text-xs text-emerald-950">GCS Sync Bucket (Jakarta)</span>
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-lime-200 text-lime-950">
              ● AKTIF SYNC
            </span>
          </div>

          <div className="space-y-1.5 text-[10px] font-mono text-[#66736B] border-t border-[#E6EBDD]/60 pt-2">
            <div className="flex justify-between">
              <span>Mode Sync:</span>
              <span className="font-bold text-emerald-950">Transactional WAL</span>
            </div>
            <div className="flex justify-between">
              <span>Antrean Buffer:</span>
              <span className={`font-bold ${syncBacklog > 0 ? 'text-red-600 animate-pulse' : 'text-emerald-950'}`}>
                {diagnosing ? 'Scanning...' : `${syncBacklog} berkas pending`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Backup Terakhir:</span>
              <span className="font-bold text-emerald-950">{diagnosing ? 'Syncing...' : '4 mnt lalu'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Internet Latency */}
        <div className="bg-[#F7FAF3] border border-[#E6EBDD] p-4 rounded-2xl space-y-3 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                <Radio className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-[#66736B] uppercase font-bold tracking-wider block">Network Provider</span>
                <span className="font-extrabold text-xs text-emerald-950">Indihome Biz (Primary)</span>
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800">
              ● TERKONEKSI
            </span>
          </div>

          <div className="space-y-1.5 text-[10px] font-mono text-[#66736B] border-t border-[#E6EBDD]/60 pt-2">
            <div className="flex justify-between">
              <span>Latensi Ping:</span>
              <span className="font-bold text-emerald-950">{diagnosing ? 'Testing...' : `${latency} ms`}</span>
            </div>
            <div className="flex justify-between">
              <span>Backup Link:</span>
              <span className="font-bold text-[#1F6B4A] inline-flex items-center gap-0.5">
                4G LTE Telkomsel (Standby)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Packet Loss:</span>
              <span className="font-bold text-emerald-950">0.00%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Status Bar */}
      <div className="bg-[#F7FAF3] border border-[#E6EBDD] p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#66736B]">
          <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" />
          <span>
            Pemeriksaan Otomatis Terakhir: <strong className="text-emerald-950">{lastCheck}</strong> (Semua sistem dalam kondisi optimal).
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-950 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg">
          <span>KONDISI ALAT:</span>
          <span>100% AMAN & OPERASIONAL</span>
        </div>
      </div>
    </div>
  );
}
