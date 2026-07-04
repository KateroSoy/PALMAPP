/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Scale,
  Truck,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  RefreshCw,
  Coins
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { PurchaseTransaction, ShipmentRecord, Supplier, ExpenseRecord, User } from '../../types';
import { formatRupiah, formatKg, formatTon } from '../../utils/calculations';

interface DashboardProps {
  purchases: PurchaseTransaction[];
  shipments: ShipmentRecord[];
  suppliers: Supplier[];
  expenses: ExpenseRecord[];
  currentStock: number;
  currentUser: User;
  isOnline: boolean;
  onPayTransaction: (trxId: string) => void;
  onTriggerToast: (message: string, type: 'success' | 'warning' | 'info') => void;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({
  purchases,
  shipments,
  suppliers,
  expenses,
  currentStock,
  currentUser,
  isOnline,
  onPayTransaction,
  onTriggerToast,
  onNavigate
}: DashboardProps) {
  // Filter and calculation states
  const [stockCapacityLimit] = useState<number>(100000); // 100 Tons capacity limit
  const [profitTimeframe, setProfitTimeframe] = useState<'today' | 'all'>('all');

  // --- 1. STOCK LEVEL CALCULATION & INSIGHTS ---
  const stockPercentage = Math.min(100, Math.round((currentStock / stockCapacityLimit) * 100));
  
  // Calculate today's incoming (bought) and outgoing (shipped)
  const todayPurchases = purchases.filter(p => p.date.startsWith('2026-06-28') && p.transactionStatus !== 'Cancelled');
  const todayShipments = shipments.filter(s => s.date.startsWith('2026-06-28') && s.status !== 'Cancelled');

  const incomingTodayWeight = todayPurchases.reduce((sum, p) => sum + p.netWeight, 0);
  const outgoingTodayWeight = todayShipments.reduce((sum, s) => sum + s.shipmentWeight, 0);

  // --- 2. PENDING TRANSACTIONS TRACKING ---
  // A transaction is pending if it's either:
  // a) Draft state (needs checkout/final weight)
  // b) Offline pending sync
  // c) Unpaid/partially paid Completed status
  const pendingTransactionsList = purchases.filter(p => 
    p.transactionStatus === 'Draft' || 
    p.isOfflinePending || 
    (p.transactionStatus === 'Completed' && p.paymentStatus !== 'Paid')
  );

  const draftCount = purchases.filter(p => p.transactionStatus === 'Draft').length;
  const offlinePendingCount = purchases.filter(p => p.isOfflinePending).length;
  const unpaidCount = purchases.filter(p => p.transactionStatus === 'Completed' && p.paymentStatus !== 'Paid').length;

  // --- 3. PROFIT OVERVIEW ENGINE ---
  // Calculate values either for "Today" (simulated 2026-06-28) or "All Time"
  const getFinancials = () => {
    let filteredPurchases = purchases.filter(p => p.transactionStatus === 'Completed');
    let filteredShipments = shipments.filter(s => s.status !== 'Cancelled');
    let filteredExpenses = expenses;

    if (profitTimeframe === 'today') {
      const todayPrefix = '2026-06-28';
      filteredPurchases = filteredPurchases.filter(p => p.date.startsWith(todayPrefix));
      filteredShipments = filteredShipments.filter(s => s.date.startsWith(todayPrefix));
      filteredExpenses = filteredExpenses.filter(e => e.date.startsWith(todayPrefix));
    }

    const totalRevenue = filteredShipments.reduce((sum, s) => sum + s.revenue, 0);
    const totalCOGS = filteredPurchases.reduce((sum, p) => sum + p.finalAmount, 0);
    const totalOpEx = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalCOGS - totalOpEx;
    const marginPercent = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    return {
      revenue: totalRevenue,
      cogs: totalCOGS,
      opex: totalOpEx,
      profit: netProfit,
      margin: marginPercent
    };
  };

  const financials = getFinancials();

  // Mini Chart data comparing Revenue vs Expenditure over dates
  const uniqueDates = Array.from(new Set([
    ...purchases.map(p => p.date.split('T')[0]),
    ...shipments.map(s => s.date.split('T')[0])
  ]))
    .filter(d => d.startsWith('2026-06'))
    .sort()
    .slice(-5); // last 5 active operational days

  const trendData = uniqueDates.map(dateStr => {
    const dayPurchases = purchases.filter(p => p.date.startsWith(dateStr) && p.transactionStatus === 'Completed');
    const dayShipments = shipments.filter(s => s.date.startsWith(dateStr) && s.status !== 'Cancelled');
    const dayExpenses = expenses.filter(e => e.date.startsWith(dateStr));

    const revenue = dayShipments.reduce((sum, s) => sum + s.revenue, 0);
    const cost = dayPurchases.reduce((sum, p) => sum + p.finalAmount, 0) + dayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = revenue - cost;

    const formattedDate = new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

    return {
      name: formattedDate,
      Pendapatan: revenue,
      Biaya: cost,
      Profit: profit
    };
  });

  return (
    <div className="space-y-6 text-left animate-fadeIn font-sans">
      
      {/* 1. Header & Quick Alert Band */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-[#102018] to-[#123C2B] text-white p-6 rounded-3xl border border-[#C6F24A]/15 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#C6F24A]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 relative z-10">
          <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
            Rampalm Dashboard 
            <span className="text-xs bg-[#C6F24A] text-[#123C2B] font-bold px-2 py-0.5 rounded-full uppercase">Active</span>
          </h1>
          <p className="text-xs text-[#E6EBDD]/70 max-w-xl">
            Selamat bekerja, <span className="text-[#C6F24A] font-bold">{currentUser.name}</span> ({currentUser.role}). Ringkasan status stok, transaksi pending, dan profitabilitas RAM Anda siap dipantau.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 border border-white/5 px-4 py-2 rounded-2xl text-xs font-mono shrink-0">
          <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`}></div>
          <span className="font-bold text-[#E6EBDD]">
            {isOnline ? '🌐 Koneksi Cloud Aktif' : '📶 Mode Lokal Offline'}
          </span>
        </div>
      </div>

      {/* 2. THREE KEY METRIC MODULES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* MODULE A: CURRENT STOCK LEVELS */}
        <div id="stock-level-widget" className="bg-white border border-[#E6EBDD] rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md hover:border-[#C6F24A] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#E6EBDD]/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-50 text-emerald-800 p-2 rounded-xl">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#102018]">Level Stok TBS</h3>
                <p className="text-[10px] text-[#66736B]">Volume timbunan kelapa sawit di RAM</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Kapasitas: 100 Ton
            </span>
          </div>

          <div className="space-y-4">
            {/* Main Weight display */}
            <div className="text-center py-2 bg-[#F7FAF3] rounded-2xl border border-[#E6EBDD]/40">
              <span className="text-3xl font-black font-mono text-emerald-950 block">
                {formatKg(currentStock)}
              </span>
              <span className="text-[11px] text-[#66736B] font-bold uppercase tracking-wider block mt-0.5">
                ≈ {formatTon(currentStock)}
              </span>
            </div>

            {/* Capacity Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#66736B]">Utilitas Kapasitas</span>
                <span className={stockPercentage > 85 ? 'text-red-600' : stockPercentage > 60 ? 'text-amber-600' : 'text-emerald-700'}>
                  {stockPercentage}%
                </span>
              </div>
              <div className="w-full h-3 bg-[#E6EBDD]/40 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    stockPercentage > 85 ? 'bg-red-500' : stockPercentage > 60 ? 'bg-amber-400' : 'bg-emerald-800'
                  }`}
                  style={{ width: `${stockPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Quick Status Insights */}
            <div className="text-xs space-y-2 pt-1">
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-[#66736B]">Masuk Hari Ini:</span>
                <span className="font-bold text-emerald-800">+{formatKg(incomingTodayWeight)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-[#66736B]">Keluar Hari Ini:</span>
                <span className="font-bold text-amber-700">-{formatKg(outgoingTodayWeight)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#66736B]">Sisa Penyimpanan:</span>
                <span className="font-mono font-bold text-emerald-950">
                  {formatKg(stockCapacityLimit - currentStock)} ({formatTon(stockCapacityLimit - currentStock)})
                </span>
              </div>
            </div>
          </div>

          {/* Stock warnings */}
          {stockPercentage > 85 ? (
            <div className="bg-red-50 border border-red-200 text-red-900 text-[10px] p-2.5 rounded-xl flex items-start gap-2 animate-pulse mt-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <span className="font-bold block">🚨 Stok Mendekati Batas!</span>
                Segera jadwalkan pengiriman (shipment) ke Pabrik Kelapa Sawit (PKS) terdekat guna menghindari kelebihan muatan.
              </div>
            </div>
          ) : stockPercentage < 15 ? (
            <div className="bg-amber-50 border border-amber-100 text-amber-900 text-[10px] p-2.5 rounded-xl flex items-start gap-2 mt-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold block">💡 Stok Menipis</span>
                Ramp sawit hampir kosong. Anda dapat menaikkan harga beli per kg untuk memikat supplier/petani memasukkan TBS.
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50/50 border border-emerald-100 text-emerald-900 text-[10px] p-2.5 rounded-xl flex items-start gap-2 mt-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold block text-emerald-950">Stok Stabil</span>
                Kondisi volume sawit dalam rentang aman operasional harian.
              </div>
            </div>
          )}
        </div>

        {/* MODULE B: PENDING TRANSACTIONS PANELS */}
        <div id="pending-transactions-widget" className="bg-white border border-[#E6EBDD] rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md hover:border-[#C6F24A] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#E6EBDD]/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="bg-amber-50 text-amber-800 p-2 rounded-xl">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#102018]">Transaksi Pending</h3>
                <p className="text-[10px] text-[#66736B]">Proses tertunda yang membutuhkan aksi cepat</p>
              </div>
            </div>
            <span className="text-[10px] font-black font-mono text-white bg-red-600 px-2 py-0.5 rounded-full animate-pulse">
              {pendingTransactionsList.length} Antrean
            </span>
          </div>

          {/* Metrics of pending processes */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#F7FAF3] border border-[#E6EBDD]/30 p-2 rounded-2xl text-center">
              <span className="block text-lg font-black font-mono text-emerald-950">{draftCount}</span>
              <span className="text-[9px] text-[#66736B] block font-bold uppercase">Draft</span>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-2 rounded-2xl text-center">
              <span className="block text-lg font-black font-mono text-amber-800">{offlinePendingCount}</span>
              <span className="text-[9px] text-[#66736B] block font-bold uppercase">Offline</span>
            </div>
            <div className="bg-red-50 border border-red-100 p-2 rounded-2xl text-center">
              <span className="block text-lg font-black font-mono text-red-700">{unpaidCount}</span>
              <span className="text-[9px] text-[#66736B] block font-bold uppercase">Belum Lunas</span>
            </div>
          </div>

          {/* Quick List scrollbar */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 flex-1 mt-1">
            {pendingTransactionsList.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#66736B]">
                Tidak ada transaksi pending. Semua alur kerja beroperasi lancar!
              </div>
            ) : (
              pendingTransactionsList.map((p) => {
                const sup = suppliers.find(s => s.id === p.supplierId);
                const outstanding = p.finalAmount;

                return (
                  <div key={p.id} className="bg-[#F7FAF3] rounded-xl p-2.5 border border-[#E6EBDD] flex items-center justify-between gap-2 text-xs">
                    <div className="text-left space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold font-mono text-emerald-950">{p.id}</span>
                        {p.isOfflinePending && (
                          <span className="bg-amber-100 text-amber-800 text-[8px] px-1 py-0.2 rounded font-black">OFFLINE</span>
                        )}
                        {p.transactionStatus === 'Draft' && (
                          <span className="bg-emerald-100 text-emerald-800 text-[8px] px-1 py-0.2 rounded font-black">TARA</span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#66736B] block font-medium">
                        {sup ? sup.name : p.supplierId} • {p.vehicleId}
                      </span>
                    </div>
                    
                    {/* Context Action Button */}
                    {p.transactionStatus === 'Draft' ? (
                      <button
                        onClick={() => onNavigate('weighing')}
                        className="bg-[#123C2B] text-[#C6F24A] font-bold text-[9px] px-2 py-1 rounded-lg hover:bg-emerald-900 transition-all cursor-pointer"
                      >
                        Timbang Tara
                      </button>
                    ) : p.paymentStatus !== 'Paid' ? (
                      <button
                        onClick={() => {
                          onPayTransaction(p.id);
                          onTriggerToast(`Pembayaran nota ${p.id} senilai ${formatRupiah(outstanding)} berhasil dilunasi!`, 'success');
                        }}
                        className="bg-emerald-700 text-white font-bold text-[9px] px-2 py-1 rounded-lg hover:bg-emerald-800 transition-all cursor-pointer"
                      >
                        Bayar Lunas
                      </button>
                    ) : (
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">Ready</span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <button
            onClick={() => onNavigate('purchases')}
            className="w-full text-center text-xs font-bold text-[#123C2B] hover:underline bg-[#F7FAF3] border border-[#E6EBDD] py-2 rounded-xl active:scale-95 transition-all mt-1"
          >
            Lihat Modul Pembelian TBS
          </button>
        </div>

        {/* MODULE C: BRIEF PROFIT OVERVIEW */}
        <div id="profit-overview-widget" className="bg-white border border-[#E6EBDD] rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md hover:border-[#C6F24A] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#E6EBDD]/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="bg-[#C6F24A]/20 text-[#123C2B] p-2 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#102018]">Ringkasan Laba Bersih</h3>
                <p className="text-[10px] text-[#66736B]">Kalkulasi margin pendapatan harian/akumulatif</p>
              </div>
            </div>
            
            {/* Timeframe switcher */}
            <div className="flex bg-[#F7FAF3] border border-[#E6EBDD] p-0.5 rounded-lg text-[9px] font-bold">
              <button
                onClick={() => setProfitTimeframe('today')}
                className={`px-2 py-1 rounded-md transition-all ${profitTimeframe === 'today' ? 'bg-[#123C2B] text-white shadow-xs' : 'text-[#66736B] hover:text-[#102018]'}`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => setProfitTimeframe('all')}
                className={`px-2 py-1 rounded-md transition-all ${profitTimeframe === 'all' ? 'bg-[#123C2B] text-white shadow-xs' : 'text-[#66736B] hover:text-[#102018]'}`}
              >
                Semua
              </button>
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Main Profit display */}
            <div className="text-left bg-gradient-to-br from-[#F7FAF3] to-emerald-50/30 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-black text-[#66736B] tracking-wider block">Net Profit Estimasi</span>
                <span className={`text-2xl font-mono font-black ${financials.profit >= 0 ? 'text-emerald-800' : 'text-red-700'}`}>
                  {formatRupiah(financials.profit)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-black text-[#66736B] tracking-wider block">Margin Laba</span>
                <span className={`text-lg font-mono font-black px-2.5 py-0.5 rounded-lg inline-block ${financials.margin >= 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {financials.margin}%
                </span>
              </div>
            </div>

            {/* Financial breakdown stats */}
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="space-y-0.5 border-r border-gray-100">
                <span className="text-[#66736B] block text-[10px]">Pendapatan:</span>
                <span className="font-bold font-mono text-emerald-950 block">{formatRupiah(financials.revenue)}</span>
                <span className="text-[9px] text-[#66736B] block">Dari Pengiriman PKS</span>
              </div>
              <div className="space-y-0.5 border-r border-gray-100 pl-1">
                <span className="text-[#66736B] block text-[10px]">Belanja TBS:</span>
                <span className="font-bold font-mono text-red-600 block">-{formatRupiah(financials.cogs)}</span>
                <span className="text-[9px] text-[#66736B] block">Dari Timbangan Beli</span>
              </div>
              <div className="space-y-0.5 pl-1">
                <span className="text-[#66736B] block text-[10px]">Biaya OpEx:</span>
                <span className="font-bold font-mono text-amber-700 block">-{formatRupiah(financials.opex)}</span>
                <span className="text-[9px] text-[#66736B] block">Gaji/BBM/Listrik</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('finance')}
            className="w-full text-center text-xs font-bold text-[#123C2B] hover:underline bg-[#F7FAF3] border border-[#E6EBDD] py-2 rounded-xl active:scale-95 transition-all mt-1"
          >
            Buka Modul Keuangan & Arus Kas
          </button>
        </div>

      </div>

      {/* 3. CHART & ANALYTICS PREVIEW ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Large Chart: Operational Margin Comparison */}
        <div className="lg:col-span-2 bg-white border border-[#E6EBDD] rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E6EBDD]/60 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-[#102018]">Visualisasi Arus Laba Rugi</h3>
              <p className="text-xs text-[#66736B]">Tren perbandingan nominal Pendapatan, Biaya Total, dan Laba Bersih</p>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full font-mono">5 Hari Terakhir</span>
          </div>

          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C6F24A" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#C6F24A" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#123C2B" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#123C2B" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6EBDD" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#66736B', fontSize: 10, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#66736B', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip
                  formatter={(value: any) => [formatRupiah(Number(value)), '']}
                  contentStyle={{
                    backgroundColor: '#102018',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="Pendapatan" stroke="#123C2B" strokeWidth={2} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="Biaya" stroke="#b91c1c" strokeWidth={1} strokeDasharray="3 3" fill="none" />
                <Area type="monotone" dataKey="Profit" stroke="#1F6B4A" strokeWidth={3} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Small Widgets: Tonnage and Speed KPIs */}
        <div className="bg-white border border-[#E6EBDD] rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="border-b border-[#E6EBDD]/60 pb-3">
            <h3 className="font-extrabold text-sm text-[#102018]">Efisiensi & Rasio RAM</h3>
            <p className="text-[10px] text-[#66736B]">Indikator kecepatan proses timbangan dan distribusi</p>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-around">
            
            {/* KPI 1: Average Process time per Truck */}
            <div className="flex items-center gap-3 bg-[#F7FAF3] p-3 rounded-2xl border border-[#E6EBDD]/40">
              <div className="bg-emerald-800 text-white p-2 rounded-xl">
                <Clock className="w-4 h-4 text-[#C6F24A]" />
              </div>
              <div className="text-left">
                <span className="text-[9px] text-[#66736B] uppercase font-bold tracking-wider block">Durasi Timbang Rata-rata</span>
                <span className="text-sm font-black font-mono text-emerald-950">14,2 Menit</span>
                <span className="text-[9px] text-emerald-700 block font-semibold">1,5 menit lebih cepat dari bulan lalu</span>
              </div>
            </div>

            {/* KPI 2: Shrinkage Loss Ratio */}
            <div className="flex items-center gap-3 bg-[#F7FAF3] p-3 rounded-2xl border border-[#E6EBDD]/40">
              <div className="bg-emerald-800 text-white p-2 rounded-xl">
                <Coins className="w-4 h-4 text-[#C6F24A]" />
              </div>
              <div className="text-left">
                <span className="text-[9px] text-[#66736B] uppercase font-bold tracking-wider block">Penyusutan Berat (Beli vs Jual)</span>
                <span className="text-sm font-black font-mono text-emerald-950">0,85%</span>
                <span className="text-[9px] text-emerald-700 block font-semibold">Sangat Baik (Batas toleransi maks 1,5%)</span>
              </div>
            </div>

            {/* KPI 3: Supplier Loyalty */}
            <div className="flex items-center gap-3 bg-[#F7FAF3] p-3 rounded-2xl border border-[#E6EBDD]/40">
              <div className="bg-emerald-800 text-white p-2 rounded-xl">
                <TrendingUp className="w-4 h-4 text-[#C6F24A]" />
              </div>
              <div className="text-left">
                <span className="text-[9px] text-[#66736B] uppercase font-bold tracking-wider block">Rasio Pengiriman Berulang</span>
                <span className="text-sm font-black font-mono text-emerald-950">92%</span>
                <span className="text-[9px] text-emerald-700 block font-semibold">Supplier loyal aktif mengirim TBS reguler</span>
              </div>
            </div>

          </div>

          <div className="bg-emerald-50 text-emerald-900 text-[10px] p-2.5 rounded-xl text-left border border-emerald-100">
            <span className="font-bold block">💡 Optimasi Penyusutan</span>
            Gunakan grading kualitas yang presisi untuk meminimalisasi kerugian penyusutan air saat TBS diangkut ke PKS.
          </div>
        </div>

      </div>

    </div>
  );
}
