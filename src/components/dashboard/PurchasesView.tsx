/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Papa from 'papaparse';
import {
  Plus,
  Search,
  Printer,
  Ban,
  FileText,
  Scale,
  Percent,
  Calculator,
  X,
  User,
  CheckCircle2,
  Trash2,
  Download,
  AlertTriangle,
  WifiOff,
  Clock
} from 'lucide-react';
import { PurchaseTransaction, Supplier, Farmer, Vehicle, Driver, User as AuthUser } from '../../types';
import {
  formatRupiah,
  formatKg,
  calculateNetWeight,
  calculateGrossAmount,
  calculateDeductionAmount,
  calculateFinalAmount
} from '../../utils/calculations';
import ReceiptQRCode from './ReceiptQRCode';

interface PurchasesViewProps {
  purchases: PurchaseTransaction[];
  suppliers: Supplier[];
  farmers: Farmer[];
  vehicles: Vehicle[];
  drivers: Driver[];
  currentUser: AuthUser;
  onAddPurchase: (trx: PurchaseTransaction) => void;
  onCancelPurchase: (id: string, reason: string) => void;
  autoOpenForm?: boolean;
  onFormClose?: () => void;
}

const purchaseSchema = z.object({
  supplierId: z.string().min(1, 'Supplier wajib dipilih'),
  farmerId: z.string().optional(),
  vehicleId: z.string().min(1, 'Kendaraan wajib dipilih'),
  driverId: z.string().min(1, 'Supir wajib dipilih'),
  grossWeight: z.coerce.number({ message: 'Bruto harus berupa angka' }).positive('Bruto harus lebih besar dari 0'),
  tareWeight: z.coerce.number({ message: 'Tara harus berupa angka' }).positive('Tara harus lebih besar dari 0'),
  purchasePricePerKg: z.coerce.number({ message: 'Harga beli harus berupa angka' }).nonnegative('Harga tidak boleh negatif'),
  deductionPercentage: z.coerce.number({ message: 'Potongan persen harus berupa angka' }).nonnegative('Potongan persen tidak boleh negatif'),
  otherDeduction: z.coerce.number({ message: 'Potongan lain harus berupa angka' }).nonnegative('Potongan tidak boleh negatif'),
  notes: z.string().optional()
}).refine(data => data.grossWeight > data.tareWeight, {
  message: 'Berat bruto harus lebih besar dari tara!',
  path: ['tareWeight']
});

interface PurchaseFormData {
  supplierId: string;
  farmerId?: string;
  vehicleId: string;
  driverId: string;
  grossWeight: number;
  tareWeight: number;
  purchasePricePerKg: number;
  deductionPercentage: number;
  otherDeduction: number;
  notes?: string;
}

export default function PurchasesView({
  purchases,
  suppliers,
  farmers,
  vehicles,
  drivers,
  currentUser,
  onAddPurchase,
  onCancelPurchase,
  autoOpenForm,
  onFormClose
}: PurchasesViewProps) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showReceipt, setShowReceipt] = useState<PurchaseTransaction | null>(null);
  const [cancelModalTrx, setCancelModalTrx] = useState<PurchaseTransaction | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Setup React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema) as any,
    defaultValues: {
      supplierId: '',
      farmerId: '',
      vehicleId: '',
      driverId: '',
      grossWeight: 0,
      tareWeight: 0,
      purchasePricePerKg: 2150,
      deductionPercentage: 3.0,
      otherDeduction: 0,
      notes: ''
    }
  });

  // Handle auto-opening the purchase transaction form from Quick Action floating menu
  useEffect(() => {
    if (autoOpenForm) {
      reset({
        supplierId: '',
        farmerId: '',
        vehicleId: '',
        driverId: '',
        grossWeight: 0,
        tareWeight: 0,
        purchasePricePerKg: 2150,
        deductionPercentage: 3.0,
        otherDeduction: 0,
        notes: ''
      });
      setShowForm(true);
      if (onFormClose) {
        onFormClose();
      }
    }
  }, [autoOpenForm, reset, onFormClose]);

  // Watch fields for automatic calculations
  const watchedSupplierId = watch('supplierId');
  const watchedGrossWeight = watch('grossWeight') || 0;
  const watchedTareWeight = watch('tareWeight') || 0;
  const watchedPurchasePricePerKg = watch('purchasePricePerKg') || 0;
  const watchedDeductionPercentage = watch('deductionPercentage') || 0;
  const watchedOtherDeduction = watch('otherDeduction') || 0;

  // Real-time calculated values
  const netWeight = Math.max(0, watchedGrossWeight - watchedTareWeight);
  const grossAmount = netWeight * watchedPurchasePricePerKg;
  const deductionAmount = Math.round(grossAmount * (watchedDeductionPercentage / 100));
  const finalAmount = Math.max(0, grossAmount - deductionAmount - watchedOtherDeduction);

  const activeSuppliers = suppliers.filter(s => s.status === 'Active');
  const activeFarmers = farmers.filter(f => f.status === 'Active' && (!watchedSupplierId || f.relatedSupplierId === watchedSupplierId));
  const activeVehicles = vehicles.filter(v => v.status === 'Active');
  const activeDrivers = drivers.filter(d => d.status === 'Active');

  // Trigger when vehicle changes to pre-populate default driver
  const handleVehicleChange = (vId: string) => {
    setValue('vehicleId', vId);
    const v = vehicles.find(item => item.id === vId);
    if (v && v.defaultDriverId) {
      setValue('driverId', v.defaultDriverId);
    }
  };

  // Helper for Weight Anomaly Detection (detects > 35% deviation from historical averages)
  const getSupplierAnomaly = (sId: string, currentNet: number) => {
    if (!sId || currentNet <= 0) return { isAnomaly: false, avgWeight: 0, deviation: 0, isFallback: false };
    
    // Find previous completed transactions for this supplier
    const supTrxs = purchases.filter(
      p => p.supplierId === sId && p.transactionStatus === 'Completed' && p.netWeight > 0
    );

    if (supTrxs.length < 2) {
      // Fallback: If net weight exceeds normal capacity of standard Colt Diesel (> 10,000 kg), flag it!
      const isExtreme = currentNet > 10000;
      return { 
        isAnomaly: isExtreme, 
        avgWeight: 6000, 
        deviation: isExtreme ? Math.round(((currentNet - 6000) / 6000) * 100) : 0,
        isFallback: true
      };
    }

    const sum = supTrxs.reduce((acc, curr) => acc + curr.netWeight, 0);
    const avg = sum / supTrxs.length;
    const diff = currentNet - avg;
    const deviationPercentage = (diff / avg) * 100;

    // Threshold of anomaly: > 35% deviation (higher or lower)
    const isAnomaly = Math.abs(deviationPercentage) > 35;
    return {
      isAnomaly,
      avgWeight: Math.round(avg),
      deviation: Math.round(deviationPercentage),
      isFallback: false
    };
  };

  const anomalyStatus = getSupplierAnomaly(watchedSupplierId, netWeight);

  const onSubmit = (data: PurchaseFormData, status: 'Draft' | 'Completed') => {
    const nextTrxId = `TRX-${100 + purchases.length + 1}`;
    
    const anomalyCheck = getSupplierAnomaly(data.supplierId, netWeight);
    
    const newTrx: PurchaseTransaction = {
      id: nextTrxId,
      date: new Date().toISOString(),
      supplierId: data.supplierId,
      farmerId: data.farmerId || undefined,
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      grossWeight: data.grossWeight,
      tareWeight: data.tareWeight,
      netWeight,
      purchasePricePerKg: data.purchasePricePerKg,
      grossAmount,
      deductionPercentage: data.deductionPercentage,
      deductionAmount,
      otherDeduction: data.otherDeduction,
      finalAmount,
      paymentStatus: 'Unpaid',
      transactionStatus: status,
      operatorName: currentUser.name,
      isWeightAnomaly: anomalyCheck.isAnomaly,
      anomalyDeviation: anomalyCheck.deviation,
      qualityRecord: {
        ripePercent: 85,
        unripePercent: 5,
        overripePercent: 4,
        rottenPercent: 1,
        emptyBunchPercent: 2,
        dirtPercent: 2,
        moisturePercent: 1,
        looseFruitKg: Math.round(netWeight * 0.02),
        grade: 'A',
        deductionPercent: data.deductionPercentage,
        notes: data.notes || 'Pencatatan timbangan dasar.'
      }
    };

    onAddPurchase(newTrx);
    reset({
      supplierId: '',
      farmerId: '',
      vehicleId: '',
      driverId: '',
      grossWeight: 0,
      tareWeight: 0,
      purchasePricePerKg: 2150,
      deductionPercentage: 3.0,
      otherDeduction: 0,
      notes: ''
    });
    setShowForm(false);
    
    // Show print receipt preview immediately if completed
    if (status === 'Completed') {
      setShowReceipt(newTrx);
    }
  };

  const handleCreateTransaction = (status: 'Draft' | 'Completed') => {
    handleSubmit((data) => onSubmit(data, status))();
  };

  const handleCancelSubmit = () => {
    if (!cancelReason.trim()) {
      alert('Alasan pembatalan harus diisi!');
      return;
    }
    if (cancelModalTrx) {
      onCancelPurchase(cancelModalTrx.id, cancelReason);
      setCancelModalTrx(null);
      setCancelReason('');
    }
  };

  // Filter purchases
  const filteredPurchases = purchases.filter(p => {
    const sup = suppliers.find(s => s.id === p.supplierId);
    const supName = sup ? sup.name.toLowerCase() : '';
    const term = search.toLowerCase();
    return p.id.toLowerCase().includes(term) ||
           p.vehicleId.toLowerCase().includes(term) ||
           supName.includes(term);
  });

  const handleExportCSV = () => {
    const headers = [
      "Nota No", 
      "Tanggal & Waktu", 
      "ID Supplier", 
      "Nama Supplier", 
      "Plat Kendaraan", 
      "Bruto (kg)", 
      "Tara (kg)", 
      "Netto (kg)", 
      "Harga Beli (Rp/kg)", 
      "Potongan (%)", 
      "Potongan Lain (Rp)", 
      "Total Bayar (Rp)", 
      "Status Transaksi", 
      "Status Pembayaran", 
      "Catatan"
    ];

    const rows = filteredPurchases.map(p => {
      const sup = suppliers.find(s => s.id === p.supplierId);
      const supplierName = sup ? sup.name : p.supplierId;
      const formattedDate = new Date(p.date).toLocaleString('id-ID');
      return [
        p.id,
        formattedDate,
        p.supplierId,
        supplierName,
        p.vehicleId,
        p.grossWeight.toString(),
        p.tareWeight.toString(),
        p.netWeight.toString(),
        p.purchasePricePerKg.toString(),
        p.deductionPercentage.toString(),
        p.otherDeduction.toString(),
        p.finalAmount.toString(),
        p.transactionStatus,
        p.paymentStatus,
        p.qualityRecord?.notes || ''
      ];
    });

    const csvContent = Papa.unparse({
      fields: headers,
      data: rows
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Transaksi_Pembelian_TBS_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const totalBruto = filteredPurchases.reduce((acc, curr) => acc + curr.grossWeight, 0);
    const totalTara = filteredPurchases.reduce((acc, curr) => acc + curr.tareWeight, 0);
    const totalNetto = filteredPurchases.reduce((acc, curr) => acc + curr.netWeight, 0);
    const totalBayar = filteredPurchases.reduce((acc, curr) => acc + curr.finalAmount, 0);

    const tableRows = filteredPurchases.map(p => {
      const sup = suppliers.find(s => s.id === p.supplierId);
      const supplierName = sup ? sup.name : p.supplierId;
      const formattedDate = new Date(p.date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      return `
        <tr class="border-b border-gray-200 hover:bg-gray-50 text-[11px]">
          <td class="py-2 px-3 font-mono font-bold">${p.id}</td>
          <td class="py-2 px-3">${formattedDate}</td>
          <td class="py-2 px-3 font-semibold">${supplierName}</td>
          <td class="py-2 px-3 font-mono">${p.vehicleId}</td>
          <td class="py-2 px-3 text-right font-mono">${formatKg(p.grossWeight)}</td>
          <td class="py-2 px-3 text-right font-mono">${formatKg(p.tareWeight)}</td>
          <td class="py-2 px-3 text-right font-bold font-mono text-emerald-900">${formatKg(p.netWeight)}</td>
          <td class="py-2 px-3 text-right font-mono font-bold">${formatRupiah(p.finalAmount)}</td>
          <td class="py-2 px-3 text-center">
            <span class="px-2 py-0.5 rounded text-[9px] font-bold ${
              p.transactionStatus === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
              p.transactionStatus === 'Draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }">
              ${p.transactionStatus}
            </span>
          </td>
          <td class="py-2 px-3 text-center">
            <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${
              p.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
              p.paymentStatus === 'Partially Paid' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
            }">
              ${p.paymentStatus}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <div class="max-w-6xl mx-auto">
        <!-- Logo and Header -->
        <div class="flex justify-between items-start border-b-2 border-emerald-800 pb-4 mb-6">
          <div>
            <h1 class="text-2xl font-black tracking-tight text-emerald-950">RAM PALM OS</h1>
            <p class="text-xs text-gray-500 font-mono">REKAPITULASI PEMBELIAN TBS (TANDAN BUAH SEGAR)</p>
          </div>
          <div class="text-right text-xs">
            <div class="font-bold text-gray-800">Tanggal Cetak: ${new Date().toLocaleString('id-ID')}</div>
            <div class="text-gray-500">Dicetak oleh: ${currentUser.name}</div>
          </div>
        </div>

        <!-- Title of Report -->
        <div class="text-center mb-6">
          <h2 class="text-lg font-bold text-gray-800 uppercase tracking-wide">Laporan Transaksi Pembelian TBS</h2>
          <p class="text-xs text-gray-500 mt-1">Status Laporan: Aktif | Total: ${filteredPurchases.length} Records</p>
        </div>

        <!-- Aggregate Summary Cards -->
        <div class="grid grid-cols-4 gap-4 mb-6">
          <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <span class="text-[9px] uppercase font-bold text-gray-500 block">TOTAL BRUTO (MASUK)</span>
            <span class="text-sm font-bold block mt-0.5 font-mono">${formatKg(totalBruto)}</span>
          </div>
          <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <span class="text-[9px] uppercase font-bold text-gray-500 block">TOTAL TARA (KOSONG)</span>
            <span class="text-sm font-bold block mt-0.5 font-mono">${formatKg(totalTara)}</span>
          </div>
          <div class="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            <span class="text-[9px] uppercase font-bold text-emerald-800 block">TOTAL NETTO BERSIH</span>
            <span class="text-sm font-extrabold block mt-0.5 font-mono text-emerald-900">${formatKg(totalNetto)}</span>
          </div>
          <div class="bg-emerald-900 p-3 rounded-xl text-white">
            <span class="text-[9px] uppercase font-bold text-emerald-300 block">TOTAL PEMBAYARAN TBS</span>
            <span class="text-sm font-black block mt-0.5 font-mono">${formatRupiah(totalBayar)}</span>
          </div>
        </div>

        <!-- Detailed Table -->
        <table class="w-full text-xs text-left border-collapse border border-gray-200 mb-8">
          <thead>
            <tr class="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
              <th class="py-2 px-3">Nota No.</th>
              <th class="py-2 px-3">Tanggal</th>
              <th class="py-2 px-3">Supplier</th>
              <th class="py-2 px-3">Kendaraan</th>
              <th class="py-2 text-right px-3">Bruto (kg)</th>
              <th class="py-2 text-right px-3">Tara (kg)</th>
              <th class="py-2 text-right px-3">Netto (kg)</th>
              <th class="py-2 text-right px-3">Total Bayar</th>
              <th class="py-2 text-center px-3">Status</th>
              <th class="py-2 text-center px-3">Bayar</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <!-- Signatures Area -->
        <div class="grid grid-cols-2 gap-8 pt-12 mt-12 border-t border-gray-100">
          <div class="text-center">
            <p class="text-xs text-gray-500 mb-16">Dibuat oleh, Operator / Kasir</p>
            <div class="w-48 border-b border-gray-400 mx-auto"></div>
            <p class="text-xs font-bold text-gray-800 mt-1">${currentUser.name}</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-gray-500 mb-16">Disetujui oleh, Owner / Pimpinan RAM</p>
            <div class="w-48 border-b border-gray-400 mx-auto"></div>
            <p class="text-xs font-bold text-gray-800 mt-1">_______________________</p>
          </div>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Popup terblokir! Silakan aktifkan izin popup untuk mengunduh PDF.");
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Transaksi Pembelian TBS - ${new Date().toISOString().slice(0,10)}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; }
              @page { size: auto; margin: 20mm; }
            }
            body { font-family: system-ui, -apple-system, sans-serif; color: #1f2937; }
          </style>
        </head>
        <body class="p-6 bg-white" onload="window.print(); window.close();">
          ${htmlContent}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6EBDD] pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#102018]">Penerimaan & Pembelian TBS</h2>
          <p className="text-xs text-[#66736B] mt-1">
            Mencatat kendaraan masuk, grading sortasi, penimbangan tara kosong, dan perhitungan netto otomatis harian.
          </p>
        </div>
        {!showForm && (
          <button
            id="btn-add-purchase"
            onClick={() => {
              reset();
              setShowForm(true);
            }}
            className="bg-[#123C2B] hover:bg-[#1f6b4a] text-white font-bold px-4 py-2.5 rounded-xl text-xs md:text-sm shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto transition-all"
          >
            <Plus className="w-4 h-4 text-[#C6F24A]" />
            Transaksi Timbang Baru
          </button>
        )}
      </div>

      {/* CREATE TRANSACTION FORM CONTAINER */}
      {showForm && (
        <form onSubmit={(e) => e.preventDefault()} className="bg-white rounded-2xl border border-[#E6EBDD] p-5 md:p-6 shadow-md space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#E6EBDD] pb-3">
            <h3 className="font-extrabold text-lg text-emerald-950 flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#1F6B4A]" />
              Formulir Timbangan Kelapa Sawit Baru
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-[#66736B] hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Columns */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field 1: Supplier */}
              <div>
                <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                  Supplier / Agen TBS <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('supplierId', {
                    onChange: () => setValue('farmerId', '')
                  })}
                  className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
                >
                  <option value="">-- Pilih Supplier --</option>
                  {activeSuppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                  ))}
                </select>
                {errors.supplierId && (
                  <p className="text-[10px] text-red-600 font-extrabold mt-1">{errors.supplierId.message}</p>
                )}
              </div>

              {/* Field 2: Farmer (Optional) */}
              <div>
                <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                  Petani Asal (Opsional)
                </label>
                <select
                  {...register('farmerId')}
                  className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
                >
                  <option value="">-- Pilih Petani Relasi --</option>
                  {activeFarmers.map(f => (
                    <option key={f.id} value={f.id}>{f.name} - {f.plantationLocation}</option>
                  ))}
                </select>
              </div>

              {/* Field 3: Vehicle */}
              <div>
                <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                  Nomor Plat Kendaraan <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('vehicleId', {
                    onChange: (e) => handleVehicleChange(e.target.value)
                  })}
                  className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
                >
                  <option value="">-- Pilih Nomor Plat --</option>
                  {activeVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.plateNumber} - {v.vehicleType}</option>
                  ))}
                </select>
                {errors.vehicleId && (
                  <p className="text-[10px] text-red-600 font-extrabold mt-1">{errors.vehicleId.message}</p>
                )}
              </div>

              {/* Field 4: Driver */}
              <div>
                <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                  Supir Pembawa <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('driverId')}
                  className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
                >
                  <option value="">-- Pilih Supir --</option>
                  {activeDrivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {errors.driverId && (
                  <p className="text-[10px] text-red-600 font-extrabold mt-1">{errors.driverId.message}</p>
                )}
              </div>

              {/* Tonnage Weights Box */}
              <div className="sm:col-span-2 bg-[#F7FAF3] rounded-2xl p-4 border border-[#E6EBDD] grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-emerald-950 mb-1">
                    Berat Bruto / Masuk (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 8450"
                    {...register('grossWeight', { valueAsNumber: true })}
                    className="w-full bg-white border border-[#E6EBDD] rounded-xl px-4 py-2.5 text-sm font-bold font-mono focus:outline-none focus:border-[#1F6B4A]"
                  />
                  <span className="text-[10px] text-[#66736B] block mt-1">Berat total truk + muatan TBS</span>
                  {errors.grossWeight && (
                    <p className="text-[10px] text-red-600 font-extrabold mt-1">{errors.grossWeight.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black text-emerald-950 mb-1">
                    Berat Tara / Kosong (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 3250"
                    {...register('tareWeight', { valueAsNumber: true })}
                    className="w-full bg-white border border-[#E6EBDD] rounded-xl px-4 py-2.5 text-sm font-bold font-mono focus:outline-none focus:border-[#1F6B4A]"
                  />
                  <span className="text-[10px] text-[#66736B] block mt-1">Berat truk setelah TBS dibongkar</span>
                  {errors.tareWeight && (
                    <p className="text-[10px] text-red-600 font-extrabold mt-1">{errors.tareWeight.message}</p>
                  )}
                </div>
              </div>

              {/* Pricing & Deductions Box */}
              <div className="sm:col-span-2 bg-[#F7FAF3] rounded-2xl p-4 border border-[#E6EBDD] grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                    Harga Beli TBS (Rp/kg)
                  </label>
                  <input
                    type="number"
                    {...register('purchasePricePerKg', { valueAsNumber: true })}
                    className="w-full bg-white border border-[#E6EBDD] rounded-xl px-4 py-2.5 text-xs font-bold font-mono focus:outline-none focus:border-[#1F6B4A]"
                  />
                  {errors.purchasePricePerKg && (
                    <p className="text-[10px] text-red-600 font-extrabold mt-1">{errors.purchasePricePerKg.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                    Potongan Kualitas (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    {...register('deductionPercentage', { valueAsNumber: true })}
                    className="w-full bg-white border border-[#E6EBDD] rounded-xl px-4 py-2.5 text-xs font-bold font-mono focus:outline-none focus:border-[#1F6B4A]"
                  />
                  {errors.deductionPercentage && (
                    <p className="text-[10px] text-red-600 font-extrabold mt-1">{errors.deductionPercentage.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                    Potongan Lain (Rp) - Bongkar
                  </label>
                  <input
                    type="number"
                    {...register('otherDeduction', { valueAsNumber: true })}
                    className="w-full bg-white border border-[#E6EBDD] rounded-xl px-4 py-2.5 text-xs font-bold font-mono focus:outline-none focus:border-[#1F6B4A]"
                  />
                  {errors.otherDeduction && (
                    <p className="text-[10px] text-red-600 font-extrabold mt-1">{errors.otherDeduction.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                  Catatan Timbangan (Opsional)
                </label>
                <textarea
                  {...register('notes')}
                  placeholder="Contoh: Buah tangkai panjang, brondolan bagus, atau potong muatan dsb."
                  className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A] h-16"
                ></textarea>
              </div>
            </div>

            {/* Calculations Panel */}
            <div className="lg:col-span-4 bg-[#123C2B] rounded-2xl p-5 text-white flex flex-col justify-between border border-[#C6F24A]/20 shadow-inner">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#C6F24A] border-b border-white/10 pb-2 mb-4">
                  REKAP TIMBANG & BAYAR
                </h4>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-white/60 font-sans">Bruto:</span>
                    <span className="font-bold">{formatKg(watchedGrossWeight)}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-white/60 font-sans">Tara:</span>
                    <span className="font-bold">{formatKg(watchedTareWeight)}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2 text-sm">
                    <span className="text-[#C6F24A] font-bold font-sans">Netto Bersih:</span>
                    <span className="text-[#C6F24A] font-extrabold">{formatKg(netWeight)}</span>
                  </div>

                  {anomalyStatus.isAnomaly && (
                    <div className="bg-amber-500/15 border border-amber-500/50 p-2.5 rounded-xl space-y-1 my-2 text-[10px] text-amber-200 font-sans leading-normal">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-bounce" />
                        <span>⚠️ Terdeteksi Anomali Berat!</span>
                      </div>
                      <p>
                        Netto ({formatKg(netWeight)}) menyimpang <span className="font-bold text-[#C6F24A]">{anomalyStatus.deviation > 0 ? `+${anomalyStatus.deviation}%` : `${anomalyStatus.deviation}%`}</span> dari rata-rata historis supplier ({formatKg(anomalyStatus.avgWeight)}).
                      </p>
                      <p className="text-[9px] text-white/50">
                        Pastikan plat nomor, muatan, dan kestabilan jembatan timbang sudah benar guna mencegah kecurangan (fraud).
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-white/60 font-sans">Bruto Beli:</span>
                    <span className="font-bold">{formatRupiah(grossAmount)}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1 text-red-300">
                    <span className="font-sans text-white/60">Potongan Kualitas:</span>
                    <span className="font-bold">-{formatRupiah(deductionAmount)} ({watchedDeductionPercentage}%)</span>
                  </div>
                  {watchedOtherDeduction > 0 && (
                    <div className="flex justify-between border-b border-white/5 pb-1 text-red-300">
                      <span className="font-sans text-white/60">Bongkar / Lainnya:</span>
                      <span className="font-bold">-{formatRupiah(watchedOtherDeduction)}</span>
                    </div>
                  )}

                  <div className="pt-4 mt-2 border-t border-white/20">
                    <span className="text-xs text-white/60 block font-sans">Total Bayar ke Supplier:</span>
                    <span className="text-2xl font-black text-white">{formatRupiah(finalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-8">
                <button
                  type="button"
                  onClick={() => handleCreateTransaction('Completed')}
                  className="w-full bg-[#C6F24A] text-[#123C2B] hover:bg-[#b5e03b] font-black text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Selesai & Print Slip
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateTransaction('Draft')}
                  className="w-full bg-white/10 text-white hover:bg-white/20 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Simpan Sebagai Draft Timbang
                </button>
                <div className="text-[10px] text-white/50 leading-snug text-center">
                  *Operator: {currentUser.name} (Tercatat di audit log)
                </div>
              </div>
            </div>
          </div>
        </form>
      )}


      {/* TRANSACTION TABLE SEARCH & LIST */}
      <div className="bg-white rounded-2xl border border-[#E6EBDD] p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#66736B] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari berdasarkan nomor nota, kendaraan, atau nama supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              type="button"
              className="bg-white hover:bg-emerald-50 text-[#123C2B] border border-[#E6EBDD] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-emerald-800" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              type="button"
              className="bg-[#123C2B] hover:bg-emerald-950 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 text-[#C6F24A]" />
              <span>Export PDF</span>
            </button>
            <div className="text-xs text-[#66736B] font-medium font-mono lg:ml-2">
              Ditemukan: {filteredPurchases.length} transaksi
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E6EBDD] text-[#66736B] font-bold bg-[#F7FAF3]">
                <th className="py-2.5 px-3">Nota No.</th>
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">Supplier</th>
                <th className="py-2.5 px-3 font-mono">Kendaraan</th>
                <th className="py-2.5 px-3 text-right">Bruto (kg)</th>
                <th className="py-2.5 px-3 text-right">Tara (kg)</th>
                <th className="py-2.5 px-3 text-right">Netto (kg)</th>
                <th className="py-2.5 px-3 text-right">Total Bayar</th>
                <th className="py-2.5 px-3 text-center">Status Transaksi</th>
                <th className="py-2.5 px-3 text-center">Bayar</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-[#66736B]">
                    Tidak ada transaksi pembelian TBS ditemukan. Silakan tambahkan transaksi baru.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => {
                  const sup = suppliers.find(s => s.id === p.supplierId);
                  return (
                    <tr key={p.id} className={`border-b border-[#E6EBDD] hover:bg-[#F7FAF3]/40 transition-colors ${
                      p.transactionStatus === 'Cancelled' ? 'opacity-50 line-through bg-red-50/20' : ''
                    }`}>
                      <td className="py-3 px-3 font-bold font-mono text-emerald-950">{p.id}</td>
                      <td className="py-3 px-3 text-[#66736B]">
                        {new Date(p.date).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-3 font-semibold">{sup ? sup.name : p.supplierId}</td>
                      <td className="py-3 px-3 font-mono text-[#66736B]">{p.vehicleId}</td>
                      <td className="py-3 px-3 text-right font-mono text-[#66736B]">{formatKg(p.grossWeight)}</td>
                      <td className="py-3 px-3 text-right font-mono text-[#66736B]">{formatKg(p.tareWeight)}</td>
                      <td className="py-3 px-3 text-right font-bold font-mono">
                        {(() => {
                          const isRowAnomaly = p.isWeightAnomaly || (sup ? getSupplierAnomaly(p.supplierId, p.netWeight).isAnomaly : false);
                          return (
                            <>
                              <div className="flex items-center justify-end gap-1.5">
                                {isRowAnomaly && (
                                  <AlertTriangle 
                                    className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" 
                                    title="Anomali Berat Terdeteksi!" 
                                  />
                                )}
                                <span>{formatKg(p.netWeight)}</span>
                              </div>
                              {isRowAnomaly && (
                                <span className="block text-[8px] text-amber-600 font-extrabold text-right font-sans">
                                  ⚠️ ANOMALI
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-3 text-right font-black font-mono">{formatRupiah(p.finalAmount)}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.transactionStatus === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          p.transactionStatus === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {p.transactionStatus === 'Completed' ? 'Selesai' :
                           p.transactionStatus === 'Draft' ? 'Draft' : 'Batal'}
                        </span>
                        {p.isOfflinePending && (
                          <span className="block text-[8px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-1 py-0.5 rounded-md mt-1 animate-pulse" title="Tersimpan lokal, menanti internet online untuk sinkronisasi">
                            ⏳ Pending Sync
                          </span>
                        )}
                        {p.cancelReason && (
                          <span className="block text-[8px] text-red-600 italic font-medium mt-0.5">
                            Ket: {p.cancelReason}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                          p.paymentStatus === 'Partially Paid' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {p.paymentStatus === 'Paid' ? 'Lunas' :
                           p.paymentStatus === 'Partially Paid' ? 'Cicil' : 'Belum'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setShowReceipt(p)}
                            title="Print Slip Nota"
                            className="p-1 rounded bg-[#F7FAF3] border border-[#E6EBDD] text-emerald-950 hover:bg-emerald-50 hover:border-emerald-300 transition-all"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {p.transactionStatus !== 'Cancelled' && (
                            <button
                              onClick={() => setCancelModalTrx(p)}
                              title="Batalkan Transaksi"
                              className="p-1 rounded bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 transition-all"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: PRINT RECEIPT PREVIEW (NOT TIMBANG) */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 bg-[#102018]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 border border-[#E6EBDD] shadow-2xl space-y-4 text-left animate-zoomIn">
            <div className="flex justify-between items-center border-b border-[#E6EBDD] pb-3">
              <span className="text-xs font-bold text-emerald-950 font-mono">DETAIL TRANSAKSI & VERIFIKASI DIGITAL</span>
              <button
                onClick={() => setShowReceipt(null)}
                className="text-[#66736B] hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Simulated mini-thermal receipt layout */}
              <div id="receipt-print-content" className="bg-[#fcfdfa] border border-[#E6EBDD] p-4 rounded-xl font-mono text-xs text-[#102018] space-y-4 shadow-inner">
                <div className="text-center border-b border-[#E6EBDD] pb-2 space-y-0.5">
                  <span className="font-bold text-sm block">RAMPALM OS SAWIT</span>
                  <span className="text-[9px] text-[#66736B] block">Lintas Riau, Kec. Siak, Riau</span>
                  <span className="text-[9px] text-[#66736B] block">Telp: 0812-7456-1122</span>
                </div>

                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span>Nota No:</span>
                    <span className="font-bold">{showReceipt.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span>{new Date(showReceipt.date).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Supplier:</span>
                    <span className="font-bold">
                      {suppliers.find(s => s.id === showReceipt.supplierId)?.name || showReceipt.supplierId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kendaraan:</span>
                    <span>{showReceipt.vehicleId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Supir:</span>
                    <span>{drivers.find(d => d.id === showReceipt.driverId)?.name || showReceipt.driverId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operator:</span>
                    <span>{showReceipt.operatorName}</span>
                  </div>
                </div>

                <div className="border-t border-b border-dashed border-[#E6EBDD] py-2 space-y-1 font-bold text-[10px]">
                  <div className="flex justify-between">
                    <span>BRUTO (Kotor):</span>
                    <span>{formatKg(showReceipt.grossWeight)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TARA (Kosong):</span>
                    <span>{formatKg(showReceipt.tareWeight)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-950 text-xs">
                    <span>NETTO BERSIH:</span>
                    <span>{formatKg(showReceipt.netWeight)}</span>
                  </div>
                </div>

                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span>Harga per kg:</span>
                    <span>{formatRupiah(showReceipt.purchasePricePerKg)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Bruto Rp:</span>
                    <span>{formatRupiah(showReceipt.grossAmount)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Potongan Kualitas ({showReceipt.deductionPercentage}%):</span>
                    <span>-{formatRupiah(showReceipt.deductionAmount)}</span>
                  </div>
                  {showReceipt.otherDeduction > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Bongkar / Lainnya:</span>
                      <span>-{formatRupiah(showReceipt.otherDeduction)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-black border-t border-[#E6EBDD] pt-1.5 mt-1">
                    <span>TOTAL BAYAR:</span>
                    <span>{formatRupiah(showReceipt.finalAmount)}</span>
                  </div>
                </div>

                <div className="text-center text-[8px] text-[#66736B] pt-3 border-t border-[#E6EBDD] space-y-1 font-sans">
                  <p>Terima kasih atas kerja samanya.</p>
                  <p>Simpan nota ini sebagai bukti timbangan sah.</p>
                  <p className="font-bold text-emerald-900 font-mono">Rampalm OS - Terpercaya</p>
                </div>
              </div>

              {/* Digital Verification QR Code component */}
              <ReceiptQRCode
                purchase={showReceipt}
                supplierName={suppliers.find(s => s.id === showReceipt.supplierId)?.name || showReceipt.supplierId}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  const printContent = document.getElementById('receipt-print-content');
                  if (printContent) {
                    let printArea = document.getElementById('print-area');
                    if (!printArea) {
                      printArea = document.createElement('div');
                      printArea.id = 'print-area';
                      document.body.appendChild(printArea);
                    }
                    printArea.className = 'thermal-roll';
                    printArea.innerHTML = printContent.innerHTML;
                    window.print();
                  }
                  setShowReceipt(null);
                }}
                className="bg-[#123C2B] text-white hover:bg-emerald-950 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
              >
                Cetak Slip Thermal
              </button>
              <button
                onClick={() => setShowReceipt(null)}
                className="bg-[#F7FAF3] hover:bg-[#E6EBDD] text-[#102018] font-semibold text-xs py-2.5 rounded-xl border border-[#E6EBDD] transition-all cursor-pointer text-center"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CANCEL TRANSACTION MODAL */}
      {cancelModalTrx && (
        <div className="fixed inset-0 z-50 bg-[#102018]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E6EBDD] shadow-2xl space-y-4 text-left animate-zoomIn">
            <h3 className="font-extrabold text-lg text-red-600">Batalkan Transaksi Pembelian TBS</h3>
            <p className="text-xs text-[#66736B] leading-relaxed">
              Anda akan membatalkan transaksi <span className="font-bold text-emerald-950">{cancelModalTrx.id}</span>. Tindakan ini tidak dapat diurungkan, stok RAM akan berkurang kembali, dan log audit akan mencatat tindakan Anda.
            </p>

            <div>
              <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                Alasan Pembatalan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Salah input berat tara / salah pilih supplier"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => {
                  setCancelModalTrx(null);
                  setCancelReason('');
                }}
                className="px-4 py-2 text-xs font-semibold hover:bg-gray-100 rounded-xl transition-all"
              >
                Kembali
              </button>
              <button
                onClick={handleCancelSubmit}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md"
              >
                Batalkan Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
