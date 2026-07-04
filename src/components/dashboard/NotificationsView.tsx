/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Bell, ShieldAlert, Key, Settings, Sparkles, Check, Trash } from 'lucide-react';

export default function NotificationsView() {
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', title: 'Kalibrasi Tera Jembatan Timbang Mendekati Batas', desc: 'Kalibrasi Tera resmi Dinas Metrologi Siak akan kedaluwarsa dalam 12 hari (Jatuh tempo 10 Juli 2026). Segera ajukan permohonan tera ulang.', date: 'Baru saja', read: false },
    { id: 2, type: 'info', title: 'Stokpile TBS Mendekati Kapasitas Maksimum', desc: 'Stok terkumpul di loading bay RAM mencapai 48.250 kg. Harap segera koordinasikan truk fuso untuk pengiriman fasa malam ke PKS Nusantara Sejahtera.', date: '30 menit lalu', read: false },
    { id: 3, type: 'success', title: 'Pembayaran DO SHP-201 Telah Dicairkan oleh PKS', desc: 'PKS Nusantara Sejahtera telah mentransfer dana pelunasan Surat Jalan SHP-201 senilai Rp 42.180.000 ke rekening BRI RAM.', date: '2 jam lalu', read: true },
    { id: 4, type: 'danger', title: 'Peringatan Margin Tipis: Kenaikan Harga Beli', desc: 'Selisih rata-rata harga beli supplier dan harga kontrak jual PKS saat ini menyempit di bawah Rp 300/kg. Disarankan melakukan rapat penetapan potongan timbangan.', date: '1 hari lalu', read: true }
  ]);

  const handleMarkAllRead = () => {
    setAlerts(alerts.map(a => ({ ...a, read: true })));
  };

  const handleDeleteAlert = (id: number) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#E6EBDD] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#102018]">Pemberitahuan Sistem & Notifikasi</h2>
          <p className="text-xs text-[#66736B] mt-1">
            Notifikasi kritis mengenai batas timbangan, perubahan margin laba harian, dan pengingat tera berkala.
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="bg-[#123C2B] text-white hover:bg-emerald-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          Tandai Semua Sudah Dibaca
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Notifications List */}
        <div className="lg:col-span-8 space-y-3">
          {alerts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E6EBDD] p-12 text-center text-[#66736B]">
              <Bell className="w-10 h-10 mx-auto text-emerald-800/20 mb-3" />
              Tidak ada pemberitahuan baru saat ini.
            </div>
          ) : (
            alerts.map(a => (
              <div
                key={a.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                  a.read 
                    ? 'bg-white border-[#E6EBDD] opacity-75' 
                    : 'bg-emerald-50/40 border-emerald-100 shadow-sm'
                }`}
              >
                <div className={`p-2 rounded-xl text-xs font-black ${
                  a.type === 'warning' ? 'bg-amber-100 text-amber-800' :
                  a.type === 'danger' ? 'bg-red-100 text-red-800' :
                  a.type === 'success' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-[#102018]">{a.title}</h4>
                    <span className="text-[10px] text-[#66736B] font-mono">{a.date}</span>
                  </div>
                  <p className="text-xs text-[#66736B] leading-relaxed">{a.desc}</p>
                </div>

                <button
                  onClick={() => handleDeleteAlert(a.id)}
                  className="text-[#66736B] hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors self-center"
                  title="Hapus"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Sidebar settings alerts */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E6EBDD] p-5 shadow-sm space-y-4 h-fit text-left">
          <h3 className="font-extrabold text-sm text-[#102018] border-b border-[#E6EBDD] pb-2 flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-emerald-800" />
            Konfigurasi Ambang Alert
          </h3>

          <div className="space-y-4 text-xs font-semibold text-[#102018]/80">
            <div>
              <label className="block mb-1">Ambang Stok Kritis (kg)</label>
              <input
                type="number"
                defaultValue={45000}
                className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none"
              />
              <span className="text-[10px] text-[#66736B] block mt-1 font-normal">Kirim alert jika FFB di loading bay melebihi kapasitas</span>
            </div>

            <div>
              <label className="block mb-1">Ambang Margin Minimum (Rp/kg)</label>
              <input
                type="number"
                defaultValue={300}
                className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none"
              />
              <span className="text-[10px] text-[#66736B] block mt-1 font-normal">Alert jika selisih harga beli dan kontrak jual PKS terlalu kecil</span>
            </div>

            <button
              onClick={() => alert('Konfigurasi ambang alert berhasil disimpan!')}
              className="w-full bg-[#123C2B] text-[#C6F24A] hover:bg-emerald-950 font-black text-xs py-2.5 rounded-xl transition-all"
            >
              Simpan Ambang Pemberitahuan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
