/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Wallet, Plus, Search, DollarSign, ArrowUpRight, ArrowDownRight, Printer, AlertCircle, CheckCircle2, X, Fuel, Users, Truck, Calendar } from 'lucide-react';
import { PurchaseTransaction, Supplier, ExpenseRecord, FinanceRecord } from '../../types';
import { formatRupiah, formatKg } from '../../utils/calculations';

interface FinanceViewProps {
  purchases: PurchaseTransaction[];
  suppliers: Supplier[];
  expenses: ExpenseRecord[];
  onAddExpense: (exp: ExpenseRecord) => void;
  onSettlePayment: (trxId: string, status: 'Partially Paid' | 'Paid') => void;
}

export default function FinanceView({
  purchases,
  suppliers,
  expenses,
  onAddExpense,
  onSettlePayment
}: FinanceViewProps) {
  const [activeTab, setActiveTab] = useState<'payments' | 'expenses' | 'cashflow'>('payments');
  const [search, setSearch] = useState('');
  
  // Expense Form state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState<'Fuel' | 'Salary' | 'Maintenance' | 'Electricity' | 'Office cost' | 'Loading/unloading cost' | 'Transport cost' | 'Others'>('Fuel');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseNotes, setExpenseNotes] = useState('');
  const [recipient, setRecipient] = useState('');

  // Fuel specific sub-fields
  const [fuelLiters, setFuelLiters] = useState<number | ''>('');
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState<number | ''>('');
  const [fuelVehicleId, setFuelVehicleId] = useState<string>('');

  // Salary / Labor / Staff specific sub-fields
  const [laborCount, setLaborCount] = useState<number | ''>('');
  const [laborDays, setLaborDays] = useState<number | ''>('');
  const [laborRate, setLaborRate] = useState<number | ''>('');
  const [laborRole, setLaborRole] = useState<string>('');

  // Settle Payment State
  const [settleTrx, setSettleTrx] = useState<PurchaseTransaction | null>(null);
  const [settleMethod, setSettleMethod] = useState<'Cash' | 'Transfer'>('Cash');

  // Filter lists based on tab
  const pendingPayments = purchases.filter(p => p.paymentStatus !== 'Paid' && p.transactionStatus !== 'Cancelled');
  const completedPayments = purchases.filter(p => p.paymentStatus === 'Paid' && p.transactionStatus !== 'Cancelled');

  const handleCreateExpense = () => {
    let finalAmount = expenseAmount;
    let finalNotes = expenseNotes;

    if (expenseCategory === 'Fuel') {
      if (!fuelLiters || !fuelPricePerLiter) {
        alert('Mohon isi jumlah liter dan harga per liter solar!');
        return;
      }
      finalAmount = Number(fuelLiters) * Number(fuelPricePerLiter);
      finalNotes = `[Solar: ${fuelLiters} L @ ${formatRupiah(Number(fuelPricePerLiter))}] Nopol: ${fuelVehicleId || '-'} | ${expenseNotes}`;
    } else if (expenseCategory === 'Salary') {
      if (!laborDays || !laborRate) {
        alert('Mohon isi jumlah hari kerja dan tarif harian buruh!');
        return;
      }
      const count = laborCount || 1;
      finalAmount = Number(count) * Number(laborDays) * Number(laborRate);
      finalNotes = `[Tenaga Kerja: ${count} org x ${laborDays} hari @ ${formatRupiah(Number(laborRate))}] Peran: ${laborRole || '-'} | ${expenseNotes}`;
    }

    if (finalAmount <= 0 || !recipient || !finalNotes) {
      alert('Mohon isi semua data biaya: Penerima, Nominal/Sub-fields, dan Catatan!');
      return;
    }

    const nextExpId = `EXP-${300 + expenses.length + 1}`;
    const newExp: ExpenseRecord = {
      id: nextExpId,
      date: new Date().toISOString(),
      category: expenseCategory,
      amount: finalAmount,
      notes: finalNotes,
      recipientName: recipient
    };

    onAddExpense(newExp);
    
    // reset
    setExpenseAmount(0);
    setExpenseNotes('');
    setRecipient('');
    setFuelLiters('');
    setFuelPricePerLiter('');
    setFuelVehicleId('');
    setLaborCount('');
    setLaborDays('');
    setLaborRate('');
    setLaborRole('');
    setShowExpenseForm(false);
  };

  const handleConfirmSettle = (status: 'Partially Paid' | 'Paid') => {
    if (settleTrx) {
      onSettlePayment(settleTrx.id, status);
      setSettleTrx(null);
    }
  };

  // Cash flow reconciliation list
  // Merging Purchases, Expenses, and (Simulated) Revenues into a single timeline ledger
  const rawCashFlow: any[] = [];
  
  // 1. Add Completed Purchases as Cash outflow
  purchases.forEach(p => {
    if (p.transactionStatus !== 'Cancelled') {
      const sup = suppliers.find(s => s.id === p.supplierId);
      const paidAmt = p.paymentStatus === 'Paid' ? p.finalAmount : (p.paymentStatus === 'Partially Paid' ? 3000000 : 0);
      if (paidAmt > 0) {
        rawCashFlow.push({
          date: p.date,
          type: 'Keluar (Bayar Supplier)',
          reference: p.id,
          description: `Bayar TBS ke ${sup?.name || p.supplierId}`,
          amount: -paidAmt,
          method: 'Cash/Transfer'
        });
      }
    }
  });

  // 2. Add Expenses as Cash outflow
  expenses.forEach(e => {
    rawCashFlow.push({
      date: e.date,
      type: 'Keluar (Biaya Operasional)',
      reference: e.id,
      description: `[${e.category}] ${e.notes} ke ${e.recipientName}`,
      amount: -e.amount,
      method: 'Cash'
    });
  });

  // 3. Add Simulated Shipment revenues as Cash inflow
  // For realism, let's assume received shipments are settled instantly by the mills
  rawCashFlow.push({
    date: '2026-06-27T14:30:00Z',
    type: 'Masuk (Revenue PKS)',
    reference: 'SHP-201',
    description: 'Pelunasan timbangan PKS Nusantara Sejahtera',
    amount: 42180000,
    method: 'Transfer'
  });

  const sortedCashFlow = rawCashFlow.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculations for total cash flows
  const totalInflow = rawCashFlow.filter(c => c.amount > 0).reduce((acc, curr) => acc + curr.amount, 0);
  const totalOutflow = Math.abs(rawCashFlow.filter(c => c.amount < 0).reduce((acc, curr) => acc + curr.amount, 0));
  const netCashBalance = totalInflow - totalOutflow;

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#E6EBDD] pb-5">
        <h2 className="text-xl md:text-2xl font-black text-[#102018]">Manajemen Keuangan & Kasir</h2>
        <p className="text-xs text-[#66736B] mt-1">
          Memproses kas masuk/keluar harian, menyortir pembayaran supplier, mencatat biaya pengeluaran solar/buruh, dan memantau cash flow kasir.
        </p>
      </div>

      {/* Cash Register Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E6EBDD] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#66736B] block">Total Pendapatan Terbayar PKS</span>
            <span className="text-xl font-bold font-mono text-emerald-700 block mt-1">{formatRupiah(totalInflow || 42180000)}</span>
          </div>
          <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E6EBDD] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#66736B] block">Total Pengeluaran Kas (Settle + Biaya)</span>
            <span className="text-xl font-bold font-mono text-red-600 block mt-1">{formatRupiah(totalOutflow)}</span>
          </div>
          <div className="bg-red-50 text-red-600 p-3 rounded-xl">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E6EBDD] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#66736B] block">Estimasi Saldo Kas Bersih</span>
            <span className="text-xl font-bold font-mono text-emerald-950 block mt-1">{formatRupiah(netCashBalance)}</span>
          </div>
          <div className="bg-lime-100 text-[#123C2B] p-3 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Navigation Tabs */}
      <div className="flex border-b border-[#E6EBDD]">
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'payments' ? 'border-[#123C2B] text-[#123C2B]' : 'border-transparent text-[#66736B] hover:text-[#102018]'
          }`}
        >
          Pembayaran Supplier
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'expenses' ? 'border-[#123C2B] text-[#123C2B]' : 'border-transparent text-[#66736B] hover:text-[#102018]'
          }`}
        >
          Biaya Operasional ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab('cashflow')}
          className={`px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'cashflow' ? 'border-[#123C2B] text-[#123C2B]' : 'border-transparent text-[#66736B] hover:text-[#102018]'
          }`}
        >
          Buku Arus Kas (Ledger)
        </button>
      </div>

      {/* TAB CONTENT: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Pending payments cards */}
          <div className="bg-white rounded-2xl border border-[#E6EBDD] p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Daftar Bon Supir / Supplier Belum Lunas ({pendingPayments.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E6EBDD] text-[#66736B] font-bold bg-[#F7FAF3]">
                    <th className="py-2.5 px-3">Nota No.</th>
                    <th className="py-2.5 px-3">Tanggal Timbang</th>
                    <th className="py-2.5 px-3">Nama Supplier</th>
                    <th className="py-2.5 px-3 font-mono">Truk / Supir</th>
                    <th className="py-2.5 px-3 text-right">Netto (kg)</th>
                    <th className="py-2.5 px-3 text-right">Total Timbangan (Rp)</th>
                    <th className="py-2.5 px-3 text-center">Status Pembayaran</th>
                    <th className="py-2.5 px-3 text-center">Aksi Pelunasan</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-[#66736B]">
                        Semua bon supplier telah terbayar lunas harian. Kerja bagus!
                      </td>
                    </tr>
                  ) : (
                    pendingPayments.map(p => {
                      const sup = suppliers.find(s => s.id === p.supplierId);
                      return (
                        <tr key={p.id} className="border-b border-[#E6EBDD] hover:bg-red-50/10 transition-colors">
                          <td className="py-3 px-3 font-bold font-mono text-emerald-950">{p.id}</td>
                          <td className="py-3 px-3 text-[#66736B]">
                            {new Date(p.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3 px-3 font-bold">{sup ? sup.name : p.supplierId}</td>
                          <td className="py-3 px-3 text-[#66736B] font-mono">{p.vehicleId}</td>
                          <td className="py-3 px-3 text-right font-bold font-mono">{formatKg(p.netWeight)}</td>
                          <td className="py-3 px-3 text-right font-black font-mono text-red-600">{formatRupiah(p.finalAmount)}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="bg-red-100 text-red-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                              BELUM LUNAS
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => setSettleTrx(p)}
                              className="bg-emerald-800 hover:bg-emerald-950 text-white font-black text-[10px] px-3 py-1.5 rounded-lg shadow-xs transition-all"
                            >
                              Bayar Supplier
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Completed payment logs */}
          <div className="bg-white rounded-2xl border border-[#E6EBDD] p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-emerald-950">Arsip Pengeluaran Kasir Terakhir (Lunas)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E6EBDD] text-[#66736B] font-bold bg-[#F7FAF3]">
                    <th className="py-2.5 px-3">Nota No.</th>
                    <th className="py-2.5 px-3">Tanggal Timbang</th>
                    <th className="py-2.5 px-3">Nama Supplier</th>
                    <th className="py-2.5 px-3 text-right">Netto (kg)</th>
                    <th className="py-2.5 px-3 text-right">Harga (Rp/kg)</th>
                    <th className="py-2.5 px-3 text-right">Potongan Rp</th>
                    <th className="py-2.5 px-3 text-right">Total Terbayar Lunas</th>
                    <th className="py-2.5 px-3 text-center">Petugas Kasir</th>
                  </tr>
                </thead>
                <tbody>
                  {completedPayments.map(p => {
                    const sup = suppliers.find(s => s.id === p.supplierId);
                    return (
                      <tr key={p.id} className="border-b border-[#E6EBDD] hover:bg-[#F7FAF3]/40 transition-colors">
                        <td className="py-3 px-3 font-bold font-mono text-emerald-950">{p.id}</td>
                        <td className="py-3 px-3 text-[#66736B]">
                          {new Date(p.date).toLocaleDateString('id-ID')}
                        </td>
                        <td className="py-3 px-3 font-semibold">{sup ? sup.name : p.supplierId}</td>
                        <td className="py-3 px-3 text-right font-mono text-[#66736B]">{formatKg(p.netWeight)}</td>
                        <td className="py-3 px-3 text-right font-mono text-[#66736B]">{formatRupiah(p.purchasePricePerKg)}</td>
                        <td className="py-3 px-3 text-right font-mono text-red-600">-{formatRupiah(p.deductionAmount)}</td>
                        <td className="py-3 px-3 text-right font-black font-mono text-emerald-800">{formatRupiah(p.finalAmount)}</td>
                        <td className="py-3 px-3 text-center text-emerald-800 font-bold">✓ Siti Rahma</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E6EBDD] p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[#E6EBDD]/50 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-emerald-950">Biaya Operasional Lapangan RAM</h3>
                <p className="text-[11px] text-[#66736B]">Catat pengeluaran harian seperti bensin, maintenance timbangan, uang makan buruh, dsb.</p>
              </div>
              {!showExpenseForm && (
                <button
                  onClick={() => setShowExpenseForm(true)}
                  className="bg-[#123C2B] hover:bg-[#1f6b4a] text-white font-bold text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C6F24A]" />
                  Tambah Biaya Operasional
                </button>
              )}
            </div>

            {showExpenseForm && (
              <div className="bg-[#F7FAF3] rounded-2xl border border-[#E6EBDD] p-5 space-y-4 animate-fadeIn text-left">
                {/* Row 1: Category, Recipient & Overall Amount */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#102018]/80 mb-1">Kategori Biaya</label>
                    <select
                      value={expenseCategory}
                      onChange={(e: any) => {
                        setExpenseCategory(e.target.value);
                        // Reset amounts if category changes
                        setExpenseAmount(0);
                      }}
                      className="w-full bg-white border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
                    >
                      <option value="Fuel">Solar / Bensin</option>
                      <option value="Salary">Gaji / Uang Harian (Buruh)</option>
                      <option value="Maintenance">Maintenance Timbangan</option>
                      <option value="Electricity">Listrik / Air</option>
                      <option value="Office cost">Kertas Struk / ATK</option>
                      <option value="Loading/unloading cost">Uang Bongkar Muat</option>
                      <option value="Transport cost">Ongkos Angkut Truk</option>
                      <option value="Others">Pengeluaran Lain-lain</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#102018]/80 mb-1">Penerima Kas</label>
                    <input
                      type="text"
                      value={recipient}
                      placeholder="Contoh: Pak Supandi (Supir)"
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full bg-white border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#102018]/80 mb-1">
                      Nominal Pengeluaran (Rp)
                      {(expenseCategory === 'Fuel' || expenseCategory === 'Salary') && (
                        <span className="text-[10px] text-emerald-800 font-semibold ml-1">(Kalkulasi otomatis)</span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={expenseAmount || ''}
                      placeholder="Contoh: 150000"
                      readOnly={expenseCategory === 'Fuel' || expenseCategory === 'Salary'}
                      onChange={(e) => {
                        if (expenseCategory !== 'Fuel' && expenseCategory !== 'Salary') {
                          setExpenseAmount(Math.max(0, parseInt(e.target.value) || 0));
                        }
                      }}
                      className={`w-full border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none focus:border-[#1F6B4A] ${
                        (expenseCategory === 'Fuel' || expenseCategory === 'Salary') ? 'bg-emerald-50 text-emerald-950 font-black' : 'bg-white text-[#102018]'
                      }`}
                    />
                  </div>
                </div>

                {/* Row 2: Conditional category fields */}
                {expenseCategory === 'Fuel' && (
                  <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
                    <div>
                      <label className="block text-[11px] font-bold text-[#123C2B] mb-1 flex items-center gap-1">
                        <Fuel className="w-3.5 h-3.5 text-emerald-800" />
                        Jumlah Liter Solar
                      </label>
                      <input
                        type="number"
                        placeholder="Contoh: 50"
                        value={fuelLiters}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0);
                          setFuelLiters(val);
                          if (val !== '' && fuelPricePerLiter !== '') {
                            setExpenseAmount(Number(val) * Number(fuelPricePerLiter));
                          }
                        }}
                        className="w-full bg-white border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#123C2B] mb-1 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-800" />
                        Harga per Liter (Rp)
                      </label>
                      <input
                        type="number"
                        placeholder="Contoh: 13500"
                        value={fuelPricePerLiter}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0);
                          setFuelPricePerLiter(val);
                          if (fuelLiters !== '' && val !== '') {
                            setExpenseAmount(Number(fuelLiters) * Number(val));
                          }
                        }}
                        className="w-full bg-white border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#123C2B] mb-1 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-emerald-800" />
                        Nopol / Plat Kendaraan
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: BM 8123 TK"
                        value={fuelVehicleId}
                        onChange={(e) => setFuelVehicleId(e.target.value.toUpperCase())}
                        className="w-full bg-white border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
                      />
                    </div>
                  </div>
                )}

                {expenseCategory === 'Salary' && (
                  <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 animate-fadeIn">
                    <div>
                      <label className="block text-[11px] font-bold text-[#123C2B] mb-1 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-emerald-800" />
                        Jumlah Pekerja (Orang)
                      </label>
                      <input
                        type="number"
                        placeholder="Contoh: 3"
                        value={laborCount}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1);
                          setLaborCount(val);
                          const days = laborDays || 1;
                          const rate = laborRate || 0;
                          if (days !== '' && rate !== '') {
                            setExpenseAmount(Number(val || 1) * Number(days) * Number(rate));
                          }
                        }}
                        className="w-full bg-white border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#123C2B] mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-800" />
                        Jumlah Hari Kerja
                      </label>
                      <input
                        type="number"
                        placeholder="Contoh: 2"
                        value={laborDays}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0);
                          setLaborDays(val);
                          const count = laborCount || 1;
                          const rate = laborRate || 0;
                          if (val !== '' && rate !== '') {
                            setExpenseAmount(Number(count) * Number(val) * Number(rate));
                          }
                        }}
                        className="w-full bg-white border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#123C2B] mb-1 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-800" />
                        Tarif / Gaji per Hari (Rp)
                      </label>
                      <input
                        type="number"
                        placeholder="Contoh: 120000"
                        value={laborRate}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0);
                          setLaborRate(val);
                          const count = laborCount || 1;
                          const days = laborDays || 1;
                          if (days !== '' && val !== '') {
                            setExpenseAmount(Number(count) * Number(days) * Number(val));
                          }
                        }}
                        className="w-full bg-white border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#123C2B] mb-1 flex items-center gap-1">
                        Posisi / Peran Buruh
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Tukang Bongkar Muat"
                        value={laborRole}
                        onChange={(e) => setLaborRole(e.target.value)}
                        className="w-full bg-white border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
                      />
                    </div>
                  </div>
                )}

                {/* Row 3: Notes & Action Buttons */}
                <div className="flex flex-col sm:flex-row items-end gap-4 pt-1">
                  <div className="flex-1 w-full">
                    <label className="block text-[11px] font-bold text-[#102018]/80 mb-1">Catatan Keterangan Tambahan</label>
                    <input
                      type="text"
                      value={expenseNotes}
                      placeholder="Contoh: Pengisian BBM solar atau rincian tambahan pengerjaan"
                      onChange={(e) => setExpenseNotes(e.target.value)}
                      className="w-full bg-white border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleCreateExpense}
                      className="flex-1 sm:flex-none bg-[#123C2B] hover:bg-[#1f6b4a] text-[#C6F24A] font-black text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all whitespace-nowrap"
                    >
                      Simpan Pengeluaran
                    </button>
                    <button
                      onClick={() => {
                        setShowExpenseForm(false);
                        // Reset states
                        setFuelLiters('');
                        setFuelPricePerLiter('');
                        setFuelVehicleId('');
                        setLaborCount('');
                        setLaborDays('');
                        setLaborRate('');
                        setLaborRole('');
                        setExpenseAmount(0);
                        setExpenseNotes('');
                        setRecipient('');
                      }}
                      className="bg-white hover:bg-red-50 text-red-600 border border-[#E6EBDD] px-3.5 py-2.5 rounded-xl transition-all"
                      title="Batal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E6EBDD] text-[#66736B] font-bold bg-[#F7FAF3]">
                    <th className="py-2.5 px-3">Kode Biaya</th>
                    <th className="py-2.5 px-3">Tanggal Transaksi</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Catatan Pengeluaran</th>
                    <th className="py-2.5 px-3">Penerima Uang</th>
                    <th className="py-2.5 px-3 text-right">Nominal Pengeluaran</th>
                    <th className="py-2.5 px-3 text-center">Status Kas</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-[#66736B]">
                        Belum ada pengeluaran operasional hari ini.
                      </td>
                    </tr>
                  ) : (
                    expenses.map(e => (
                      <tr key={e.id} className="border-b border-[#E6EBDD] hover:bg-[#F7FAF3]/40 transition-colors">
                        <td className="py-3 px-3 font-bold font-mono text-red-950">{e.id}</td>
                        <td className="py-3 px-3 text-[#66736B]">
                          {new Date(e.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-3 font-bold">
                          <span className="bg-red-50 text-red-800 px-2 py-0.5 rounded text-[10px]">
                            {e.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#66736B]">{e.notes}</td>
                        <td className="py-3 px-3 font-semibold">{e.recipientName}</td>
                        <td className="py-3 px-3 text-right font-black font-mono text-red-600">{formatRupiah(e.amount)}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                            ✓ CASH_OUT_OK
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CASHFLOW */}
      {activeTab === 'cashflow' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E6EBDD] p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-emerald-950 border-b border-[#E6EBDD] pb-3">Buku Besar Rekonsiliasi Kas (Ledger Timeline)</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E6EBDD] text-[#66736B] font-bold bg-[#F7FAF3]">
                    <th className="py-2.5 px-3">Tanggal / Waktu</th>
                    <th className="py-2.5 px-3">Modul Alur</th>
                    <th className="py-2.5 px-3">Uraian Transaksi</th>
                    <th className="py-2.5 px-3">Nomor Ref</th>
                    <th className="py-2.5 px-3">Metode Bayar</th>
                    <th className="py-2.5 px-3 text-right">Debit (Inflow)</th>
                    <th className="py-2.5 px-3 text-right">Kredit (Outflow)</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCashFlow.map((flow, idx) => (
                    <tr key={idx} className="border-b border-[#E6EBDD] hover:bg-[#F7FAF3]/40 transition-colors">
                      <td className="py-3 px-3 text-[#66736B] font-mono">
                        {new Date(flow.date).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          flow.amount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-50 text-red-800'
                        }`}>
                          {flow.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold">{flow.description}</td>
                      <td className="py-3 px-3 font-mono text-emerald-950 font-bold">{flow.reference}</td>
                      <td className="py-3 px-3 font-mono text-[#66736B]">{flow.method}</td>
                      <td className="py-3 px-3 text-right font-black font-mono text-emerald-800">
                        {flow.amount > 0 ? formatRupiah(flow.amount) : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-black font-mono text-red-600">
                        {flow.amount < 0 ? formatRupiah(Math.abs(flow.amount)) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SETTLE PAYMENT DIALOG MODAL */}
      {settleTrx && (
        <div className="fixed inset-0 z-50 bg-[#102018]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-[#E6EBDD] shadow-2xl space-y-4 text-left animate-zoomIn">
            <div className="flex justify-between items-center border-b border-[#E6EBDD] pb-3">
              <span className="font-extrabold text-sm text-emerald-950 flex items-center gap-1">
                <Wallet className="w-4 h-4 text-emerald-800" />
                Settle / Pelunasan TBS
              </span>
              <button
                onClick={() => setSettleTrx(null)}
                className="text-[#66736B] hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div>Nota No: <span className="font-bold">{settleTrx.id}</span></div>
              <div>Supplier: <span className="font-bold">{suppliers.find(s => s.id === settleTrx.supplierId)?.name || settleTrx.supplierId}</span></div>
              <div>Netto TBS: <span className="font-bold">{formatKg(settleTrx.netWeight)}</span></div>
              <div className="border-t border-[#E6EBDD] pt-2 flex justify-between text-sm font-bold">
                <span>Total Tagihan:</span>
                <span className="text-red-600 font-black">{formatRupiah(settleTrx.finalAmount)}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-[#102018]/80 mb-1">Metode Settle</label>
                <select
                  value={settleMethod}
                  onChange={(e: any) => setSettleMethod(e.target.value)}
                  className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
                >
                  <option value="Cash">Cash (Uang Tunai Kantor)</option>
                  <option value="Transfer">Bank Transfer (BRI/BNI/Mandiri)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleConfirmSettle('Paid')}
                  className="bg-[#123C2B] text-white hover:bg-emerald-950 font-bold text-xs py-2.5 rounded-xl transition-all"
                >
                  Bayar Lunas (100%)
                </button>
                <button
                  onClick={() => handleConfirmSettle('Partially Paid')}
                  className="bg-[#C6F24A] text-[#123C2B] hover:bg-[#b5e03b] font-bold text-xs py-2.5 rounded-xl transition-all"
                >
                  Bayar Sebagian (Cicil)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
