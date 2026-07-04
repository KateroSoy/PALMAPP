/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Settings, Save, Database, Printer, Building, ShieldAlert, Sparkles, FileText, Check } from 'lucide-react';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<'profile' | 'receipt' | 'backup'>('profile');
  const [backingUp, setBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

  // Profile State
  const [ramName, setRamName] = useState('RAM KELAPA SAWIT SEJAHTERA SIALANG');
  const [ramAddress, setRamAddress] = useState('Jl. Lintas Timur KM 82, Sorek Satu, Siak, Riau');
  const [ramNpwp, setRamNpwp] = useState('01.234.567.8-901.000');
  const [ownerPhone, setOwnerPhone] = useState('0812-7654-3210');

  // Receipt template states
  const [receiptHeader, setReceiptHeader] = useState('RAM SAWIT SEJAHTERA - NOTA TIMBANGAN');
  const [receiptFooter, setReceiptFooter] = useState('Terima kasih atas kerja samanya. Harap simpan nota ini untuk penagihan pelunasan.');
  const [terms, setTerms] = useState('1. Potongan timbangan didasarkan pada sortasi ramp.\n2. Pembayaran bon supir dilayani mulai pukul 08:00 s/d 17:00.');

  const handleBackup = () => {
    setBackingUp(true);
    setBackupSuccess(false);
    setTimeout(() => {
      setBackingUp(false);
      setBackupSuccess(true);
      setTimeout(() => setBackupSuccess(false), 3000);
    }, 2000);
  };

  const handleSaveSettings = () => {
    alert('Sukses! Pengaturan konfigurasi RAM berhasil disimpan di cloud server.');
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#E6EBDD] pb-5 flex justify-between items-center">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#102018]">Pengaturan Sistem (Settings)</h2>
          <p className="text-xs text-[#66736B] mt-1">
            Mengatur identitas RAM, kustomisasi cetak struk jembatan timbangan, dan backup data transaksi harian.
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="bg-[#123C2B] text-white hover:bg-emerald-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
        >
          <Save className="w-4 h-4 text-[#C6F24A]" />
          Simpan Semua
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E6EBDD]">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'profile' ? 'border-[#123C2B] text-[#123C2B]' : 'border-transparent text-[#66736B] hover:text-[#102018]'
          }`}
        >
          Profil RAM & Pajak
        </button>
        <button
          onClick={() => setActiveTab('receipt')}
          className={`px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'receipt' ? 'border-[#123C2B] text-[#123C2B]' : 'border-transparent text-[#66736B] hover:text-[#102018]'
          }`}
        >
          Kustomisasi Struk Nota
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'backup' ? 'border-[#123C2B] text-[#123C2B]' : 'border-transparent text-[#66736B] hover:text-[#102018]'
          }`}
        >
          Database Backup & Restore
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-[#E6EBDD] p-5 md:p-6 shadow-sm max-w-2xl space-y-4">
          <h3 className="font-extrabold text-sm text-[#102018] border-b border-[#E6EBDD]/50 pb-2 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-emerald-800" />
            Informasi Legal Badan Usaha RAM
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-[#102018]/80">
            <div>
              <label className="block mb-1">Nama RAM Kelapa Sawit</label>
              <input
                type="text"
                value={ramName}
                onChange={(e) => setRamName(e.target.value)}
                className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block mb-1">Nomor NPWP Badan Usaha / Pemilik</label>
              <input
                type="text"
                value={ramNpwp}
                onChange={(e) => setRamNpwp(e.target.value)}
                className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block mb-1">Alamat Resmi RAM (Siak / Sorek)</label>
              <input
                type="text"
                value={ramAddress}
                onChange={(e) => setRamAddress(e.target.value)}
                className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block mb-1">Telepon Pemilik / Pengelola</label>
              <input
                type="text"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RECEIPT */}
      {activeTab === 'receipt' && (
        <div className="bg-white rounded-2xl border border-[#E6EBDD] p-5 md:p-6 shadow-sm max-w-2xl space-y-4">
          <h3 className="font-extrabold text-sm text-[#102018] border-b border-[#E6EBDD]/50 pb-2 flex items-center gap-1.5">
            <Printer className="w-4 h-4 text-emerald-800" />
            Konfigurasi Kop & Kaki Struk Printer Thermal
          </h3>

          <div className="space-y-4 text-xs font-semibold text-[#102018]/80">
            <div>
              <label className="block mb-1">Kop / Header Struk Timbangan</label>
              <input
                type="text"
                value={receiptHeader}
                onChange={(e) => setReceiptHeader(e.target.value)}
                className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block mb-1">Catatan Kaki (Footer Struk)</label>
              <input
                type="text"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block mb-1">Syarat & Ketentuan Timbangan RAM</label>
              <textarea
                rows={4}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none font-sans"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-2xl border border-[#E6EBDD] p-5 md:p-6 shadow-sm max-w-2xl space-y-4">
          <h3 className="font-extrabold text-sm text-[#102018] border-b border-[#E6EBDD]/50 pb-2 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-emerald-800" />
            Ekspor & Pemulihan Basis Data (Backup SQL)
          </h3>

          <div className="space-y-4 text-xs font-semibold text-[#102018]/80">
            <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
              <div className="text-left space-y-1">
                <span className="font-extrabold text-[#102018]">Keamanan Backup Berkala</span>
                <p className="text-[11px] text-[#66736B] leading-relaxed">
                  Kami merekomendasikan untuk melakukan backup database harian sebelum tutup buku kasir, guna mengantisipasi kehilangan data jika browser di-clear cache atau mengalami gangguan koneksi.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleBackup}
                disabled={backingUp}
                className="bg-[#123C2B] text-white hover:bg-emerald-950 font-bold px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                {backingUp ? 'Mengekspor Database...' : 'Backup Database Sekarang (SQL Dump)'}
              </button>
              
              <button
                onClick={() => alert('Pilih file SQL backup untuk dikembalikan...')}
                className="bg-white hover:bg-emerald-50 text-emerald-950 border border-[#E6EBDD] font-bold px-4 py-2.5 rounded-xl transition-all"
              >
                Restore Database
              </button>
            </div>

            {backingUp && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-pulse font-mono">
                <span>Dumping schema.ts tables, mockData.ts models, audit log events... COMPRESSING TO ZIP</span>
              </div>
            )}

            {backupSuccess && (
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-extrabold flex items-center gap-2">
                <Check className="w-4 h-4" />
                Backup database sukses! File 'rampalmos_backup_20260628.sql' berhasil diunduh.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
