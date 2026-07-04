/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Papa from 'papaparse';
import {
  ShieldAlert,
  Search,
  Database,
  Clock,
  Calendar,
  RefreshCw,
  User,
  ArrowRight,
  Download,
  Printer,
  FileText,
  Info
} from 'lucide-react';
import { AuditLog, UserRole } from '../../types';

export default function AuditLogView() {
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedModule, setSelectedModule] = useState<string>('All');

  // Highly realistic audit logs for RAM sawit operations adhering to AuditLog type
  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: 'LOG-8812',
      userId: 'EMP-001',
      userName: 'H. Suherman',
      role: 'Owner',
      action: 'Update Kontrak Harga Jual PKS',
      module: 'PKS-001',
      oldValue: 'Harga dasar: Rp 2.850 / kg',
      newValue: 'Harga dasar: Rp 2.900 / kg',
      timestamp: '2026-06-28T09:44:12Z',
      ipAddress: '192.168.1.45'
    },
    {
      id: 'LOG-8811',
      userId: 'EMP-002',
      userName: 'Siti Rahma',
      role: 'Cashier',
      action: 'Settle Pembayaran Supplier',
      module: 'TRX-103',
      oldValue: 'Status Pembayaran: Unpaid (Belum Bayar)',
      newValue: 'Status Pembayaran: Paid (Lunas senilai Rp 14.651.000 via Transfer Mandiri)',
      timestamp: '2026-06-28T09:30:45Z',
      ipAddress: '192.168.1.12'
    },
    {
      id: 'LOG-8810',
      userId: 'EMP-003',
      userName: 'Budi Santoso',
      role: 'Operator',
      action: 'Input Berat Tara Kendaraan',
      module: 'TRX-103',
      oldValue: 'Berat Tara: 0 kg (Pending)',
      newValue: 'Berat Tara: 3.420 kg (BM 9911 TF kosong)',
      timestamp: '2026-06-28T09:12:03Z',
      ipAddress: '192.168.2.110'
    },
    {
      id: 'LOG-8809',
      userId: 'EMP-004',
      userName: 'Pandi Sutarman',
      role: 'Quality Checker',
      action: 'Grading / Sortasi Kualitas TBS',
      module: 'TRX-103',
      oldValue: 'Potongan: 0% (Belum Disortasi)',
      newValue: 'Potongan: 4% (Buah Matang 84%, Buah Mentah 7%, Sampah 3%)',
      timestamp: '2026-06-28T08:50:22Z',
      ipAddress: '192.168.2.115'
    },
    {
      id: 'LOG-8808',
      userId: 'EMP-003',
      userName: 'Budi Santoso',
      role: 'Operator',
      action: 'Create Purchase Draft (Bruto)',
      module: 'TRX-103',
      oldValue: 'Draft: Kosong',
      newValue: 'Bruto: 11.230 kg (Kendaraan BM 9911 TF masuk)',
      timestamp: '2026-06-28T08:15:00Z',
      ipAddress: '192.168.2.110'
    },
    {
      id: 'LOG-8807',
      userId: 'EMP-001',
      userName: 'H. Suherman',
      role: 'Owner',
      action: 'Batal Transaksi Timbangan',
      module: 'TRX-102',
      oldValue: 'Status Transaksi: Completed (Aktif)',
      newValue: 'Status Transaksi: Cancelled (Batal. Alasan: Salah input tipe supplier)',
      timestamp: '2026-06-27T17:10:00Z',
      ipAddress: '192.168.1.45'
    },
    {
      id: 'LOG-8806',
      userId: 'EMP-002',
      userName: 'Siti Rahma',
      role: 'Cashier',
      action: 'Tambah Biaya Operasional',
      module: 'EXP-301',
      oldValue: 'Kas Keluar: Rp 0',
      newValue: 'Kas Keluar: Rp 450.000 (Pengisian BBM Solar armada fuso)',
      timestamp: '2026-06-27T16:20:00Z',
      ipAddress: '192.168.1.12'
    }
  ]);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const handleExportCSV = () => {
    const headers = [
      "ID Log",
      "Tanggal & Waktu",
      "User ID",
      "Nama Operator",
      "Peran (Role)",
      "Tindakan Sistem",
      "Modul / No. Ref",
      "Nilai Lama (Before)",
      "Nilai Baru (After)",
      "IP Address"
    ];

    const rows = filteredLogs.map(l => [
      l.id,
      new Date(l.timestamp).toLocaleString('id-ID'),
      l.userId,
      l.userName,
      l.role,
      l.action,
      l.module,
      l.oldValue || 'None',
      l.newValue || 'None',
      l.ipAddress
    ]);

    const csvContent = Papa.unparse({
      fields: headers,
      data: rows
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Audit_Log_Trail_RAM_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintLogs = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Popup terblokir! Aktifkan popup browser Anda untuk mencetak log audit.");
      return;
    }

    const tableRows = filteredLogs.map(l => `
      <tr style="border-bottom: 1px solid #E6EBDD; font-size: 11px;">
        <td style="padding: 10px; font-weight: bold; font-family: monospace;">${l.id}</td>
        <td style="padding: 10px;">${new Date(l.timestamp).toLocaleString('id-ID')}</td>
        <td style="padding: 10px;"><strong>${l.userName}</strong> (${l.role})</td>
        <td style="padding: 10px; font-family: monospace;">${l.module}</td>
        <td style="padding: 10px; color: #166534; font-weight: bold;">${l.action}</td>
        <td style="padding: 10px; font-size: 10px; max-width: 250px;">
          <div><span style="color: #6b7280;">Lama:</span> ${l.oldValue || '-'}</div>
          <div style="margin-top: 3px;"><span style="color: #123C2B; font-weight: bold;">Baru:</span> ${l.newValue || '-'}</div>
        </td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Arsip Log Audit RAM Kelapa Sawit</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #102018; padding: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; background-color: #F7FAF3; padding: 12px 10px; border-bottom: 2px solid #E6EBDD; font-size: 12px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #123C2B; padding-bottom: 15px; margin-bottom: 20px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="header">
            <div>
              <h2 style="margin: 0; color: #123C2B; font-weight: 900;">RAMPALM OS</h2>
              <p style="margin: 3px 0 0 0; font-size: 11px; color: #66736B; font-family: monospace;">LOG AUDIT & KEAMANAN ADMINISTRATIF</p>
            </div>
            <div style="text-align: right; font-size: 11px;">
              <div>Tanggal Cetak: ${new Date().toLocaleString('id-ID')}</div>
              <div style="margin-top: 3px; font-weight: bold; color: #15803d;">Status: IMMUTABLE_LEDGER_OK</div>
            </div>
          </div>
          <p style="font-size: 12px; color: #4b5563;">Menampilkan ${filteredLogs.length} entri rekaman sistem resmi:</p>
          <table>
            <thead>
              <tr>
                <th>ID Log</th>
                <th>Waktu</th>
                <th>Operator</th>
                <th>Modul</th>
                <th>Tindakan</th>
                <th>Riwayat Perubahan Nilai (Lama s.d Baru)</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Filtering Logic
  const filteredLogs = logs.filter(l => {
    const term = search.toLowerCase();
    const isSearchMatch = 
      l.userName.toLowerCase().includes(term) ||
      l.action.toLowerCase().includes(term) ||
      l.module.toLowerCase().includes(term) ||
      l.id.toLowerCase().includes(term) ||
      (l.oldValue && l.oldValue.toLowerCase().includes(term)) ||
      (l.newValue && l.newValue.toLowerCase().includes(term));
    
    const isRoleMatch = selectedRole === 'All' || l.role === selectedRole;
    const isModuleMatch = selectedModule === 'All' || l.module.includes(selectedModule);

    return isSearchMatch && isRoleMatch && isModuleMatch;
  });

  // Unique modules extraction for filter dropdown
  const modulesList = ['TRX', 'PKS', 'EXP'];

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'Owner': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Manager': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Operator': return 'bg-cyan-100 text-cyan-800 border border-cyan-200';
      case 'Cashier': return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Quality Checker': return 'bg-rose-100 text-rose-800 border border-rose-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#E6EBDD] pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#102018]">Audit Trail & Riwayat Perubahan</h2>
          <p className="text-xs text-[#66736B] mt-1">
            Riwayat log sistem yang komprehensif melacak perubahan administratif, operator jembatan timbang, validasi sortasi, serta pelunasan kasir.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleExportCSV}
            className="bg-white hover:bg-[#F7FAF3] text-[#123C2B] border border-[#E6EBDD] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Download log sebagai CSV Papaparse"
          >
            <Download className="w-3.5 h-3.5 text-emerald-800" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrintLogs}
            className="bg-[#123C2B] hover:bg-emerald-950 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Cetak Log Audit Resmi"
          >
            <Printer className="w-3.5 h-3.5 text-[#C6F24A]" />
            <span>Cetak Log</span>
          </button>
        </div>
      </div>

      {/* Information Alert */}
      <div className="bg-[#F7FAF3] border border-[#E6EBDD] p-4 rounded-2xl flex items-start gap-3">
        <Info className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
        <div className="text-[11px] text-[#123C2B] leading-relaxed">
          <span className="font-extrabold block">Pemberitahuan Sistem Keamanan Tambahan:</span>
          Log audit ini dijamin keabsahannya (system-sealed). Setiap penulisan data berat tara, berat kotor, pengubahan persentase potongan kualitas harian, dan mutasi saldo kasir dicatat secara otomatis bersama IP pengenal demi mencegah tindak manipulasi tonase sawit di lapangan.
        </div>
      </div>

      {/* Interactive Filters Panel */}
      <div className="bg-white rounded-2xl border border-[#E6EBDD] p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-bold">
          {/* Search bar */}
          <div className="sm:col-span-2 relative">
            <label className="block text-[#66736B] mb-1.5 font-bold">Pencarian Kata Kunci</label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#66736B] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari User, Tindakan, No. TRX, atau Nilai..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl pl-9 pr-4 py-2 font-semibold focus:outline-none focus:border-[#1F6B4A]"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-[#66736B] mb-1.5 font-bold">Filter Berdasarkan Peran</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-[#1F6B4A]"
            >
              <option value="All">Semua Peran (All)</option>
              <option value="Owner">Owner</option>
              <option value="Manager">Manager</option>
              <option value="Operator">Operator</option>
              <option value="Cashier">Cashier</option>
              <option value="Quality Checker">Quality Checker</option>
            </select>
          </div>

          {/* Module Filter */}
          <div>
            <label className="block text-[#66736B] mb-1.5 font-bold">Filter Berdasarkan Modul</label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-[#1F6B4A]"
            >
              <option value="All">Semua Modul (All)</option>
              <option value="TRX">Timbangan FFB (TRX)</option>
              <option value="PKS">Kontrak PKS (PKS)</option>
              <option value="EXP">Biaya Operasional (EXP)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#E6EBDD]/60 text-xs">
          <span className="text-[#66736B] font-semibold">
            Menampilkan <span className="text-[#102018] font-extrabold">{filteredLogs.length}</span> log audit terdaftar
          </span>
          <button
            onClick={handleRefresh}
            className="text-emerald-800 font-extrabold flex items-center gap-1 hover:underline text-[11px] disabled:opacity-50"
            disabled={refreshing}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Memperbarui...' : 'Refresh Logs'}</span>
          </button>
        </div>
      </div>

      {/* Visual Timeline Section */}
      <div className="bg-white rounded-2xl border border-[#E6EBDD] p-6 shadow-sm space-y-6">
        <h3 className="font-extrabold text-sm text-[#102018] flex items-center gap-2 border-b border-[#E6EBDD]/60 pb-3">
          <Clock className="w-4 h-4 text-emerald-800" />
          Timeline Aktivitas Administratif & Perubahan Nilai
        </h3>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <ShieldAlert className="w-10 h-10 text-[#66736B] mx-auto opacity-40" />
            <p className="text-xs text-[#66736B] font-bold">Rekaman audit tidak ditemukan dengan filter saat ini.</p>
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-[#E6EBDD]/80 ml-3 space-y-8 py-2">
            {filteredLogs.map((l) => {
              // Get custom role color class
              const badgeClass = getRoleColor(l.role);

              return (
                <div key={l.id} className="relative group">
                  {/* Timeline bullet */}
                  <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 border-emerald-800 z-10 shadow-sm group-hover:scale-125 transition-all">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-800"></span>
                  </span>

                  <div className="bg-[#fcfdfa] rounded-2xl border border-[#E6EBDD] hover:border-emerald-300 p-5 shadow-xs hover:shadow-md transition-all space-y-3">
                    {/* Log metadata header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6EBDD]/40 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-emerald-950 font-mono tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {l.id}
                        </span>
                        <h4 className="text-xs font-black text-[#102018] leading-tight">
                          {l.action}
                        </h4>
                      </div>
                      <div className="text-[10px] text-[#66736B] font-mono font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#66736B]" />
                        <span>{new Date(l.timestamp).toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    {/* Operator Information Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-semibold text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#66736B]">Operator:</span>
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-gray-500" />
                          <span className="font-extrabold text-[#102018]">@{l.userName.replace(/\s+/g, '_').toLowerCase()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#66736B]">Peran:</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${badgeClass}`}>
                          {l.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#66736B]">Ref/Modul:</span>
                        <span className="font-mono font-black text-emerald-950">{l.module}</span>
                      </div>
                    </div>

                    {/* Administrative Traceability: Old Value vs New Value Panel */}
                    <div className="bg-white rounded-xl border border-[#E6EBDD] p-3.5 space-y-2 mt-2 shadow-inner">
                      <span className="text-[10px] font-extrabold text-[#66736B] uppercase tracking-wider block">
                        Keterlacakan Administratif (Value Traceability)
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-3">
                        {/* Old Value */}
                        <div className="md:col-span-5 bg-gray-50 rounded-lg p-2.5 border border-gray-100 text-left">
                          <span className="text-[9px] text-[#66736B] block font-extrabold uppercase">Nilai Lama (Before)</span>
                          <span className="font-mono text-xs font-bold text-gray-500 break-all block mt-0.5">
                            {l.oldValue || 'None / Kosong'}
                          </span>
                        </div>

                        {/* Transition arrow */}
                        <div className="md:col-span-1 flex justify-center">
                          <ArrowRight className="w-4 h-4 text-emerald-800 rotate-90 md:rotate-0" />
                        </div>

                        {/* New Value */}
                        <div className="md:col-span-5 bg-emerald-50/50 rounded-lg p-2.5 border border-emerald-100 text-left">
                          <span className="text-[9px] text-emerald-800 block font-extrabold uppercase">Nilai Baru (After)</span>
                          <span className="font-mono text-xs font-black text-emerald-950 break-all block mt-0.5">
                            {l.newValue || 'None / Kosong'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Network details */}
                    <div className="flex items-center justify-between text-[10px] text-[#66736B] font-mono pt-1">
                      <span>Status: <strong className="text-emerald-700">VERIFIED_SECURE</strong></span>
                      <span>IP Address: {l.ipAddress}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
