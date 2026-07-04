/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Papa from 'papaparse';
import { FileText, Download, Calendar, Search, Filter, Printer, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { PurchaseTransaction, ShipmentRecord, Supplier, PalmOilMill } from '../../types';
import { formatRupiah, formatKg, formatTon } from '../../utils/calculations';

interface ReportsViewProps {
  purchases: PurchaseTransaction[];
  shipments: ShipmentRecord[];
  suppliers: Supplier[];
  mills: PalmOilMill[];
}

export default function ReportsView({
  purchases,
  shipments,
  suppliers,
  mills
}: ReportsViewProps) {
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterMill, setFilterMill] = useState('');
  const [startDate, setStartDate] = useState('2026-06-27');
  const [endDate, setEndDate] = useState('2026-06-28');
  const [exporting, setExporting] = useState<string | null>(null);

  // Filter logic
  const filteredPurchases = purchases.filter(p => {
    const isSupplierMatch = !filterSupplier || p.supplierId === filterSupplier;
    const dateStr = p.date.split('T')[0];
    const isDateMatch = dateStr >= startDate && dateStr <= endDate;
    return isSupplierMatch && isDateMatch && p.transactionStatus !== 'Cancelled';
  });

  const filteredShipments = shipments.filter(s => {
    const isMillMatch = !filterMill || s.millId === filterMill;
    const dateStr = s.date.split('T')[0];
    const isDateMatch = dateStr >= startDate && dateStr <= endDate;
    return isMillMatch && isDateMatch && s.status !== 'Cancelled';
  });

  // Calculate Aggregations
  const totalPurchaseWeight = filteredPurchases.reduce((acc, curr) => acc + curr.netWeight, 0);
  const totalPurchaseCost = filteredPurchases.reduce((acc, curr) => acc + curr.finalAmount, 0);

  const totalShipmentWeight = filteredShipments.reduce((acc, curr) => acc + curr.shipmentWeight, 0);
  const totalShipmentRevenue = filteredShipments.reduce((acc, curr) => acc + curr.revenue, 0);

  // Average buying price / selling price
  const avgBuyPrice = filteredPurchases.length > 0 ? Math.round(totalPurchaseCost / totalPurchaseWeight) : 0;
  const avgSellPrice = filteredShipments.length > 0 ? Math.round(totalShipmentRevenue / totalShipmentWeight) : 0;

  const totalGrossMargin = totalShipmentRevenue - totalPurchaseCost;

  const generateCSV = (reportName: string, headers: string[], rows: string[][]) => {
    const csvContent = Papa.unparse({
      fields: headers,
      data: rows
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${reportName.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = (reportName: string, htmlContent: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Popup terblokir! Silakan aktifkan izin popup untuk mengunduh PDF.");
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportName} - ${startDate} s.d ${endDate}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; }
              @page { size: auto; margin: 15mm; }
            }
            body { font-family: system-ui, -apple-system, sans-serif; color: #1f2937; }
          </style>
        </head>
        <body class="p-6 bg-white" onload="window.print(); window.close();">
          <div class="max-w-6xl mx-auto">
            <!-- Header -->
            <div class="flex justify-between items-start border-b-2 border-emerald-800 pb-4 mb-6">
              <div>
                <h1 class="text-2xl font-black tracking-tight text-emerald-950">RAM PALM OS</h1>
                <p class="text-xs text-gray-500 font-mono">LAPORAN MANAJEMEN RAM & TIMBANGAN SAWIT</p>
              </div>
              <div class="text-right text-xs">
                <div class="font-bold text-gray-800">Periode: ${startDate} s.d ${endDate}</div>
                <div class="text-gray-500">Tanggal Cetak: ${new Date().toLocaleString('id-ID')}</div>
              </div>
            </div>

            <!-- Title -->
            <div class="text-center mb-6">
              <h2 class="text-lg font-bold text-gray-800 uppercase tracking-wide">${reportName}</h2>
              <p class="text-xs text-gray-500 mt-1">Dicetak sebagai salinan resmi arsip RAM harian.</p>
            </div>

            ${htmlContent}

            <!-- Signatures -->
            <div class="grid grid-cols-2 gap-8 pt-12 mt-12 border-t border-gray-100">
              <div class="text-center">
                <p class="text-xs text-gray-500 mb-16">Dipersiapkan oleh, Kasir / Admin</p>
                <div class="w-40 border-b border-gray-400 mx-auto"></div>
                <p class="text-xs font-bold text-gray-800 mt-1">Staf Operasional RAM</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-gray-500 mb-16">Disetujui & Diverifikasi oleh, Owner</p>
                <div class="w-40 border-b border-gray-400 mx-auto"></div>
                <p class="text-xs font-bold text-gray-800 mt-1">Pemilik RAM Sawit</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportOverallCSV = () => {
    const headers = ["ID", "Tipe Aktivitas", "Tanggal", "Pihak Relasi (Supplier/PKS)", "Berat Netto/Kirim (kg)", "Harga (Rp/kg)", "Total (Rp)", "Status"];
    const rows = [
      ...filteredPurchases.map(p => {
        const sup = suppliers.find(s => s.id === p.supplierId);
        return [
          p.id,
          "PEMBELIAN TBS",
          p.date.split('T')[0],
          sup ? sup.name : p.supplierId,
          p.netWeight.toString(),
          p.purchasePricePerKg.toString(),
          p.finalAmount.toString(),
          p.transactionStatus
        ];
      }),
      ...filteredShipments.map(s => {
        const m = mills.find(item => item.id === s.millId);
        return [
          s.id,
          "PENGIRIMAN PKS",
          s.date.split('T')[0],
          m ? m.name : s.millId,
          s.shipmentWeight.toString(),
          s.sellingPricePerKg.toString(),
          s.revenue.toString(),
          s.status
        ];
      })
    ];

    generateCSV("Ledger_RAM_Gabungan", headers, rows);
  };

  const handleExportOverallPDF = () => {
    const trPurchases = filteredPurchases.map(p => {
      const sup = suppliers.find(s => s.id === p.supplierId);
      return `
        <tr class="border-b text-[10px]">
          <td class="py-1.5 px-2 font-mono">${p.id}</td>
          <td class="py-1.5 px-2 font-semibold">${sup ? sup.name : p.supplierId}</td>
          <td class="py-1.5 px-2 text-right font-mono">${formatKg(p.netWeight)}</td>
          <td class="py-1.5 px-2 text-right font-mono">${formatRupiah(p.finalAmount)}</td>
        </tr>
      `;
    }).join('');

    const trShipments = filteredShipments.map(s => {
      const m = mills.find(item => item.id === s.millId);
      return `
        <tr class="border-b text-[10px]">
          <td class="py-1.5 px-2 font-mono">${s.id}</td>
          <td class="py-1.5 px-2 font-semibold">${m ? m.name : s.millId}</td>
          <td class="py-1.5 px-2 text-right font-mono">${formatKg(s.shipmentWeight)}</td>
          <td class="py-1.5 px-2 text-right font-mono">${formatRupiah(s.revenue)}</td>
        </tr>
      `;
    }).join('');

    const html = `
      <div class="mb-6">
        <h3 class="text-sm font-extrabold uppercase text-emerald-950 mb-3 border-b pb-1">1. Rekapitulasi Neraca Laba Rugi</h3>
        <div class="grid grid-cols-4 gap-4 mb-6">
          <div class="bg-gray-50 p-3 rounded-lg border">
            <span class="text-[9px] uppercase font-bold text-gray-500 block">VOLUME BELI TBS</span>
            <span class="text-xs font-mono font-bold text-gray-800">${formatKg(totalPurchaseWeight)}</span>
          </div>
          <div class="bg-gray-50 p-3 rounded-lg border">
            <span class="text-[9px] uppercase font-bold text-gray-500 block">VOLUME JUAL PKS</span>
            <span class="text-xs font-mono font-bold text-gray-800">${formatKg(totalShipmentWeight)}</span>
          </div>
          <div class="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <span class="text-[9px] uppercase font-bold text-emerald-800 block">TOTAL BIAYA BELI</span>
            <span class="text-xs font-mono font-extrabold text-emerald-900">${formatRupiah(totalPurchaseCost)}</span>
          </div>
          <div class="bg-emerald-900 p-3 rounded-lg text-white">
            <span class="text-[9px] uppercase font-bold text-emerald-300 block">ESTIMASI OMSET & MARGIN</span>
            <span class="text-xs font-mono font-black">${formatRupiah(totalGrossMargin)}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div>
          <h4 class="text-xs font-black uppercase text-emerald-900 mb-2 border-b pb-1">Rincian Transaksi Pembelian</h4>
          <table class="w-full text-[10px] text-left border">
            <thead>
              <tr class="bg-gray-100 font-bold">
                <th class="p-1 px-2">Nota</th>
                <th class="p-1 px-2">Supplier</th>
                <th class="p-1 px-2 text-right">Netto</th>
                <th class="p-1 px-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${trPurchases || '<tr><td colspan="4" class="text-center py-4 text-gray-400">Tidak ada data</td></tr>'}
            </tbody>
          </table>
        </div>

        <div>
          <h4 class="text-xs font-black uppercase text-emerald-900 mb-2 border-b pb-1">Rincian Pengiriman Pabrik PKS</h4>
          <table class="w-full text-[10px] text-left border">
            <thead>
              <tr class="bg-gray-100 font-bold">
                <th class="p-1 px-2">Kirim ID</th>
                <th class="p-1 px-2">PKS</th>
                <th class="p-1 px-2 text-right">Berat</th>
                <th class="p-1 px-2 text-right">Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              ${trShipments || '<tr><td colspan="4" class="text-center py-4 text-gray-400">Tidak ada data</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;

    generatePDF("Ringkasan_Laporan_Kinerja_Sistem_RAM", html);
  };

  const handleExport = (type: 'Excel' | 'PDF', reportName: string) => {
    setExporting(`${reportName} (${type})`);
    
    setTimeout(() => {
      try {
        if (reportName === 'Laporan Pembelian Harian') {
          const headers = [
            "Nota No", "Tanggal", "Supplier", "Plat Kendaraan", "Bruto (kg)", "Tara (kg)", "Netto (kg)", "Harga (Rp/kg)", "Potongan (%)", "Potongan Lain (Rp)", "Total Pembayaran (Rp)", "Status"
          ];
          const rows = filteredPurchases.map(p => {
            const sup = suppliers.find(s => s.id === p.supplierId);
            return [
              p.id,
              p.date.split('T')[0],
              sup ? sup.name : p.supplierId,
              p.vehicleId,
              p.grossWeight.toString(),
              p.tareWeight.toString(),
              p.netWeight.toString(),
              p.purchasePricePerKg.toString(),
              p.deductionPercentage.toString(),
              p.otherDeduction.toString(),
              p.finalAmount.toString(),
              p.transactionStatus
            ];
          });

          if (type === 'Excel') {
            generateCSV(reportName, headers, rows);
          } else {
            const trRows = filteredPurchases.map(p => {
              const sup = suppliers.find(s => s.id === p.supplierId);
              return `
                <tr class="border-b text-[11px]">
                  <td class="py-2 px-2 font-mono">${p.id}</td>
                  <td class="py-2 px-2">${p.date.split('T')[0]}</td>
                  <td class="py-2 px-2 font-semibold">${sup ? sup.name : p.supplierId}</td>
                  <td class="py-2 px-2 font-mono">${p.vehicleId}</td>
                  <td class="py-2 px-2 text-right font-mono">${formatKg(p.grossWeight)}</td>
                  <td class="py-2 px-2 text-right font-mono">${formatKg(p.tareWeight)}</td>
                  <td class="py-2 px-2 text-right font-bold font-mono text-emerald-900">${formatKg(p.netWeight)}</td>
                  <td class="py-2 px-2 text-right font-mono">${formatRupiah(p.purchasePricePerKg)}</td>
                  <td class="py-2 px-2 text-right font-mono text-red-600">${p.deductionPercentage}%</td>
                  <td class="py-2 px-2 text-right font-black font-mono text-emerald-950">${formatRupiah(p.finalAmount)}</td>
                </tr>
              `;
            }).join('');

            const html = `
              <div class="mb-4 text-xs font-semibold text-gray-700">
                <p>Filter Supplier: ${filterSupplier ? suppliers.find(s=>s.id===filterSupplier)?.name || filterSupplier : 'Semua Supplier'}</p>
              </div>
              <table class="w-full text-xs text-left border border-gray-200">
                <thead>
                  <tr class="bg-gray-100 font-bold border-b text-gray-700">
                    <th class="py-2 px-2">Nota No</th>
                    <th class="py-2 px-2">Tanggal</th>
                    <th class="py-2 px-2">Supplier</th>
                    <th class="py-2 px-2">Kendaraan</th>
                    <th class="py-2 text-right px-2">Bruto</th>
                    <th class="py-2 text-right px-2">Tara</th>
                    <th class="py-2 text-right px-2">Netto</th>
                    <th class="py-2 text-right px-2">Harga</th>
                    <th class="py-2 text-right px-2">Pot. %</th>
                    <th class="py-2 text-right px-2">Total Bayar</th>
                  </tr>
                </thead>
                <tbody>
                  ${trRows || '<tr><td colspan="10" class="text-center py-4 text-gray-400">Tidak ada data pembelian TBS pada rentang filter ini.</td></tr>'}
                  <tr class="bg-emerald-50/50 font-bold border-t border-emerald-900 text-emerald-950">
                    <td colspan="4" class="py-3 px-2">TOTAL REKAPITULASI</td>
                    <td class="py-3 px-2 text-right font-mono"></td>
                    <td class="py-3 px-2 text-right font-mono"></td>
                    <td class="py-3 px-2 text-right font-mono">${formatKg(totalPurchaseWeight)}</td>
                    <td class="py-3 px-2 text-right font-mono"></td>
                    <td class="py-3 px-2 text-right font-mono"></td>
                    <td class="py-3 px-2 text-right font-mono">${formatRupiah(totalPurchaseCost)}</td>
                  </tr>
                </tbody>
              </table>
            `;
            generatePDF(reportName, html);
          }
        } 
        else if (reportName === 'Laporan Kualitas / Sortasi') {
          const headers = [
            "Nota No", "Tanggal", "Supplier", "Netto (kg)", "Masak (%)", "Mentah (%)", "Overripe (%)", "Busuk (%)", "Tangkai Panjang (%)", "Sampah (%)", "Brondolan (kg)", "Grade", "Potongan (%)"
          ];
          const rows = filteredPurchases.map(p => {
            const sup = suppliers.find(s => s.id === p.supplierId);
            const qr = p.qualityRecord || { ripePercent: 85, unripePercent: 5, overripePercent: 4, rottenPercent: 1, emptyBunchPercent: 2, dirtPercent: 2, looseFruitKg: 0, grade: 'A', deductionPercent: 3 };
            return [
              p.id,
              p.date.split('T')[0],
              sup ? sup.name : p.supplierId,
              p.netWeight.toString(),
              qr.ripePercent.toString(),
              qr.unripePercent.toString(),
              qr.overripePercent.toString(),
              qr.rottenPercent.toString(),
              qr.emptyBunchPercent.toString(),
              qr.dirtPercent.toString(),
              qr.looseFruitKg.toString(),
              qr.grade,
              qr.deductionPercent.toString()
            ];
          });

          if (type === 'Excel') {
            generateCSV(reportName, headers, rows);
          } else {
            const trRows = filteredPurchases.map(p => {
              const sup = suppliers.find(s => s.id === p.supplierId);
              const qr = p.qualityRecord || { ripePercent: 85, unripePercent: 5, overripePercent: 4, rottenPercent: 1, emptyBunchPercent: 2, dirtPercent: 2, looseFruitKg: 0, grade: 'A', deductionPercent: 3 };
              return `
                <tr class="border-b text-[11px]">
                  <td class="py-2 px-2 font-mono">${p.id}</td>
                  <td class="py-2 px-2 font-semibold">${sup ? sup.name : p.supplierId}</td>
                  <td class="py-2 px-2 text-right font-mono">${formatKg(p.netWeight)}</td>
                  <td class="py-2 px-2 text-center text-emerald-800 font-bold">${qr.ripePercent}%</td>
                  <td class="py-2 px-2 text-center text-red-600">${qr.unripePercent}%</td>
                  <td class="py-2 px-2 text-center text-amber-600">${qr.overripePercent}%</td>
                  <td class="py-2 px-2 text-center text-red-700">${qr.rottenPercent}%</td>
                  <td class="py-2 px-2 text-center">${qr.dirtPercent}%</td>
                  <td class="py-2 px-2 text-right font-mono">${formatKg(qr.looseFruitKg)}</td>
                  <td class="py-2 px-2 text-center font-bold text-emerald-950">${qr.grade}</td>
                  <td class="py-2 px-2 text-center font-bold text-red-700 font-mono">${qr.deductionPercent}%</td>
                </tr>
              `;
            }).join('');

            const html = `
              <table class="w-full text-xs text-left border border-gray-200">
                <thead>
                  <tr class="bg-gray-100 font-bold border-b text-gray-700">
                    <th class="py-2 px-2">Nota No</th>
                    <th class="py-2 px-2">Supplier</th>
                    <th class="py-2 text-right px-2">Netto</th>
                    <th class="py-2 text-center px-2">Masak</th>
                    <th class="py-2 text-center px-2">Mentah</th>
                    <th class="py-2 text-center px-2">Lewat Masak</th>
                    <th class="py-2 text-center px-2">Busuk</th>
                    <th class="py-2 text-center px-2">Sampah</th>
                    <th class="py-2 text-right px-2">Brondolan</th>
                    <th class="py-2 text-center px-2">Grade</th>
                    <th class="py-2 text-center px-2">Pot. %</th>
                  </tr>
                </thead>
                <tbody>
                  ${trRows || '<tr><td colspan="11" class="text-center py-4 text-gray-400">Tidak ada data kualitas TBS pada rentang filter ini.</td></tr>'}
                </tbody>
              </table>
            `;
            generatePDF(reportName, html);
          }
        }
        else if (reportName === 'Laporan Pengiriman PKS') {
          const headers = [
            "ID Pengiriman", "Tanggal", "Pabrik PKS", "No Plat Kendaraan", "Supir", "No Surat Jalan", "Berat Kirim (kg)", "Berat PKS Netto (kg)", "Harga Jual (Rp/kg)", "Total Pendapatan (Rp)", "Susut (kg)", "Status"
          ];
          const rows = filteredShipments.map(s => {
            const m = mills.find(item => item.id === s.millId);
            return [
              s.id,
              s.date.split('T')[0],
              m ? m.name : s.millId,
              s.vehicleId,
              s.driverId,
              s.deliveryNoteNumber,
              s.shipmentWeight.toString(),
              s.shipmentWeight.toString(),
              s.sellingPricePerKg.toString(),
              s.revenue.toString(),
              '0',
              s.status
            ];
          });

          if (type === 'Excel') {
            generateCSV(reportName, headers, rows);
          } else {
            const trRows = filteredShipments.map(s => {
              const m = mills.find(item => item.id === s.millId);
              return `
                <tr class="border-b text-[11px]">
                  <td class="py-2 px-2 font-mono font-bold">${s.id}</td>
                  <td class="py-2 px-2">${s.date.split('T')[0]}</td>
                  <td class="py-2 px-2 font-semibold">${m ? m.name : s.millId}</td>
                  <td class="py-2 px-2 font-mono">${s.vehicleId}</td>
                  <td class="py-2 px-2 font-mono">${s.deliveryNoteNumber}</td>
                  <td class="py-2 px-2 text-right font-mono">${formatKg(s.shipmentWeight)}</td>
                  <td class="py-2 px-2 text-right font-mono">${formatKg(s.shipmentWeight)}</td>
                  <td class="py-2 px-2 text-right font-mono">${formatRupiah(s.sellingPricePerKg)}</td>
                  <td class="py-2 px-2 text-right font-black font-mono text-emerald-950">${formatRupiah(s.revenue)}</td>
                  <td class="py-2 px-2 text-center text-red-600 font-mono">0 kg</td>
                </tr>
              `;
            }).join('');

            const html = `
              <table class="w-full text-xs text-left border border-gray-200">
                <thead>
                  <tr class="bg-gray-100 font-bold border-b text-gray-700">
                    <th class="py-2 px-2">ID Kirim</th>
                    <th class="py-2 px-2">Tanggal</th>
                    <th class="py-2 px-2">Pabrik PKS</th>
                    <th class="py-2 px-2">Kendaraan</th>
                    <th class="py-2 px-2">No. S/J</th>
                    <th class="py-2 text-right px-2">Berat Kirim</th>
                    <th class="py-2 text-right px-2">Berat PKS</th>
                    <th class="py-2 text-right px-2">Harga Jual</th>
                    <th class="py-2 text-right px-2">Pendapatan</th>
                    <th class="py-2 text-center px-2">Susut</th>
                  </tr>
                </thead>
                <tbody>
                  ${trRows || '<tr><td colspan="10" class="text-center py-4 text-gray-400">Tidak ada data pengiriman PKS pada rentang filter ini.</td></tr>'}
                  <tr class="bg-emerald-50/50 font-bold border-t border-emerald-900 text-emerald-950">
                    <td colspan="5" class="py-3 px-2">TOTAL REKAPITULASI PENGIRIMAN</td>
                    <td class="py-3 px-2 text-right font-mono">${formatKg(totalShipmentWeight)}</td>
                    <td class="py-3 px-2 text-right font-mono"></td>
                    <td class="py-3 px-2 text-right font-mono"></td>
                    <td class="py-3 px-2 text-right font-mono">${formatRupiah(totalShipmentRevenue)}</td>
                    <td class="py-3 px-2 text-center font-mono"></td>
                  </tr>
                </tbody>
              </table>
            `;
            generatePDF(reportName, html);
          }
        }
        else if (reportName === 'Laporan Kas & Pengeluaran') {
          const headers = ["ID Transaksi", "Tanggal", "Tipe Kas", "Uraian Deskripsi / Supplier", "Dana Keluar (Rp)", "Status"];
          
          const cashFlowRows: string[][] = [];
          filteredPurchases.forEach(p => {
            const sup = suppliers.find(s => s.id === p.supplierId);
            const sName = sup ? sup.name : p.supplierId;
            cashFlowRows.push([
              p.id,
              p.date.split('T')[0],
              "HPP Pembelian TBS",
              `Pembayaran pembelian TBS kelapa sawit ke supplier: ${sName}`,
              p.finalAmount.toString(),
              p.paymentStatus === 'Paid' ? 'LUNAS' : 'BELUM BAYAR'
            ]);
            if (p.otherDeduction > 0) {
              cashFlowRows.push([
                `EXP-${p.id}`,
                p.date.split('T')[0],
                "Upah Bongkar & Sortir",
                `Ongkos upah bongkar kendaraan supir ${p.vehicleId}`,
                p.otherDeduction.toString(),
                "CASH / LUNAS"
              ]);
            }
          });

          if (type === 'Excel') {
            generateCSV(reportName, headers, cashFlowRows);
          } else {
            const trRows = cashFlowRows.map(row => {
              return `
                <tr class="border-b text-[11px]">
                  <td class="py-2 px-2 font-mono font-bold">${row[0]}</td>
                  <td class="py-2 px-2">${row[1]}</td>
                  <td class="py-2 px-2 font-bold text-gray-700">${row[2]}</td>
                  <td class="py-2 px-2 text-gray-600">${row[3]}</td>
                  <td class="py-2 px-2 text-right font-black font-mono text-emerald-950">${formatRupiah(parseInt(row[4]))}</td>
                  <td class="py-2 px-2 text-center font-bold text-xs">${row[5]}</td>
                </tr>
              `;
            }).join('');

            const totalCashSpent = cashFlowRows.reduce((acc, row) => acc + parseInt(row[4]), 0);

            const html = `
              <table class="w-full text-xs text-left border border-gray-200">
                <thead>
                  <tr class="bg-gray-100 font-bold border-b text-gray-700">
                    <th class="py-2 px-2">ID Ref</th>
                    <th class="py-2 px-2">Tanggal</th>
                    <th class="py-2 px-2">Kategori Kas</th>
                    <th class="py-2 px-2">Uraian / Deskripsi Pengeluaran</th>
                    <th class="py-2 text-right px-2">Jumlah Keluar</th>
                    <th class="py-2 text-center px-2">Status Kas</th>
                  </tr>
                </thead>
                <tbody>
                  ${trRows || '<tr><td colspan="6" class="text-center py-4 text-gray-400">Tidak ada pengeluaran kas pada rentang filter ini.</td></tr>'}
                  <tr class="bg-red-50 font-bold border-t border-red-900 text-red-950">
                    <td colspan="4" class="py-3 px-2">TOTAL ALOKASI DANA KELUAR (OUTFLOW)</td>
                    <td class="py-3 px-2 text-right font-mono">${formatRupiah(totalCashSpent)}</td>
                    <td class="py-3 px-2 text-center font-mono">-</td>
                  </tr>
                </tbody>
              </table>
            `;
            generatePDF(reportName, html);
          }
        }
        else if (reportName === 'Laporan Neraca Profit Rugi') {
          const dailyMap: { [date: string]: { buyWeight: number; buyCost: number; sellWeight: number; sellRevenue: number } } = {};
          
          filteredPurchases.forEach(p => {
            const dateStr = p.date.split('T')[0];
            if (!dailyMap[dateStr]) dailyMap[dateStr] = { buyWeight: 0, buyCost: 0, sellWeight: 0, sellRevenue: 0 };
            dailyMap[dateStr].buyWeight += p.netWeight;
            dailyMap[dateStr].buyCost += p.finalAmount;
          });

          filteredShipments.forEach(s => {
            const dateStr = s.date.split('T')[0];
            if (!dailyMap[dateStr]) dailyMap[dateStr] = { buyWeight: 0, buyCost: 0, sellWeight: 0, sellRevenue: 0 };
            dailyMap[dateStr].sellWeight += s.shipmentWeight;
            dailyMap[dateStr].sellRevenue += s.revenue;
          });

          const dates = Object.keys(dailyMap).sort();
          const headers = [
            "Tanggal", "Volume Beli (kg)", "Biaya Pembelian (Rp)", "Volume Jual (kg)", "Omset Penjualan (Rp)", "Keuntungan Kotor (Rp)", "Spread Margin per kg (Rp)"
          ];
          const rows = dates.map(d => {
            const item = dailyMap[d];
            const profit = item.sellRevenue - item.buyCost;
            const buyAvg = item.buyWeight > 0 ? Math.round(item.buyCost / item.buyWeight) : 0;
            const sellAvg = item.sellWeight > 0 ? Math.round(item.sellRevenue / item.sellWeight) : 0;
            const spread = sellAvg - buyAvg;
            return [
              d,
              item.buyWeight.toString(),
              item.buyCost.toString(),
              item.sellWeight.toString(),
              item.sellRevenue.toString(),
              profit.toString(),
              spread.toString()
            ];
          });

          if (type === 'Excel') {
            generateCSV(reportName, headers, rows);
          } else {
            const trRows = dates.map(d => {
              const item = dailyMap[d];
              const profit = item.sellRevenue - item.buyCost;
              const buyAvg = item.buyWeight > 0 ? Math.round(item.buyCost / item.buyWeight) : 0;
              const sellAvg = item.sellWeight > 0 ? Math.round(item.sellRevenue / item.sellWeight) : 0;
              const spread = sellAvg - buyAvg;
              return `
                <tr class="border-b text-[11px]">
                  <td class="py-2.5 px-3 font-mono font-bold">${d}</td>
                  <td class="py-2.5 px-3 text-right font-mono">${formatKg(item.buyWeight)}</td>
                  <td class="py-2.5 px-3 text-right font-mono text-red-600">${formatRupiah(item.buyCost)}</td>
                  <td class="py-2.5 px-3 text-right font-mono">${formatKg(item.sellWeight)}</td>
                  <td class="py-2.5 px-3 text-right font-mono text-emerald-800">${formatRupiah(item.sellRevenue)}</td>
                  <td class="py-2.5 px-3 text-right font-black font-mono text-emerald-950">${formatRupiah(profit)}</td>
                  <td class="py-2.5 px-3 text-center font-mono font-bold ${spread > 0 ? 'text-emerald-700' : 'text-red-700'}">${formatRupiah(spread)}</td>
                </tr>
              `;
            }).join('');

            const html = `
              <table class="w-full text-xs text-left border border-gray-200">
                <thead>
                  <tr class="bg-gray-100 font-bold border-b text-gray-700">
                    <th class="py-2.5 px-3">Tanggal Ledger</th>
                    <th class="py-2.5 text-right px-3">Vol Beli (kg)</th>
                    <th class="py-2.5 text-right px-3">Biaya Beli (HPP)</th>
                    <th class="py-2.5 text-right px-3">Vol Jual (kg)</th>
                    <th class="py-2.5 text-right px-3">Omset Penjualan</th>
                    <th class="py-2.5 text-right px-3">Laba Kotor Est.</th>
                    <th class="py-2.5 text-center px-3">Spread Margin / kg</th>
                  </tr>
                </thead>
                <tbody>
                  ${trRows || '<tr><td colspan="7" class="text-center py-4 text-gray-400">Tidak ada ledger penjualan/pembelian untuk analisis neraca.</td></tr>'}
                  <tr class="bg-emerald-800 font-bold border-t text-white">
                    <td class="py-3 px-3">NERACA AGREGAT BERSIH</td>
                    <td class="py-3 px-3 text-right font-mono">${formatKg(totalPurchaseWeight)}</td>
                    <td class="py-3 px-3 text-right font-mono">${formatRupiah(totalPurchaseCost)}</td>
                    <td class="py-3 px-3 text-right font-mono">${formatKg(totalShipmentWeight)}</td>
                    <td class="py-3 px-3 text-right font-mono">${formatRupiah(totalShipmentRevenue)}</td>
                    <td class="py-3 px-3 text-right font-mono">${formatRupiah(totalGrossMargin)}</td>
                    <td class="py-3 px-3 text-center font-mono">${formatRupiah(avgSellPrice - avgBuyPrice)}</td>
                  </tr>
                </tbody>
              </table>
            `;
            generatePDF(reportName, html);
          }
        }
        else if (reportName === 'Laporan Kinerja Supplier') {
          const supplierMap: { [supId: string]: { trxCount: number; weight: number; cost: number; sumDeductions: number } } = {};
          
          filteredPurchases.forEach(p => {
            if (!supplierMap[p.supplierId]) {
              supplierMap[p.supplierId] = { trxCount: 0, weight: 0, cost: 0, sumDeductions: 0 };
            }
            supplierMap[p.supplierId].trxCount++;
            supplierMap[p.supplierId].weight += p.netWeight;
            supplierMap[p.supplierId].cost += p.finalAmount;
            supplierMap[p.supplierId].sumDeductions += p.deductionPercentage;
          });

          const headers = [
            "ID Supplier", "Nama Supplier", "No Telepon", "Bank", "No Rekening", "Jumlah Transaksi", "Total Tonase TBS (kg)", "Total Transaksi (Rp)", "Rata-rata Potongan (%)"
          ];
          const rows = Object.keys(supplierMap).map(supId => {
            const item = supplierMap[supId];
            const supObj = suppliers.find(s => s.id === supId);
            return [
              supId,
              supObj ? supObj.name : supId,
              supObj ? supObj.phone : '-',
              supObj ? supObj.bankName : '-',
              supObj ? supObj.bankAccountNumber : '-',
              item.trxCount.toString(),
              item.weight.toString(),
              item.cost.toString(),
              (item.sumDeductions / item.trxCount).toFixed(1)
            ];
          });

          if (type === 'Excel') {
            generateCSV(reportName, headers, rows);
          } else {
            const trRows = Object.keys(supplierMap).map(supId => {
              const item = supplierMap[supId];
              const supObj = suppliers.find(s => s.id === supId);
              return `
                <tr class="border-b text-[11px]">
                  <td class="py-2.5 px-3 font-mono font-bold text-emerald-950">${supId}</td>
                  <td class="py-2.5 px-3 font-bold">${supObj ? supObj.name : supId}</td>
                  <td class="py-2.5 px-3 text-gray-600">${supObj ? supObj.phone : '-'}</td>
                  <td class="py-2.5 px-3 font-mono">${supObj ? `${supObj.bankName} - ${supObj.bankAccountNumber}` : '-'}</td>
                  <td class="py-2.5 px-3 text-center font-mono font-bold text-gray-800">${item.trxCount} x</td>
                  <td class="py-2.5 px-3 text-right font-mono font-bold">${formatKg(item.weight)}</td>
                  <td class="py-2.5 px-3 text-right font-black font-mono text-emerald-900">${formatRupiah(item.cost)}</td>
                  <td class="py-2.5 px-3 text-center font-mono text-red-600">${(item.sumDeductions / item.trxCount).toFixed(1)}%</td>
                </tr>
              `;
            }).join('');

            const html = `
              <table class="w-full text-xs text-left border border-gray-200">
                <thead>
                  <tr class="bg-gray-100 font-bold border-b text-gray-700">
                    <th class="py-2.5 px-3">Supplier ID</th>
                    <th class="py-2.5 px-3">Nama Supplier</th>
                    <th class="py-2.5 px-3">Kontak WA</th>
                    <th class="py-2.5 px-3">Rekening Pembayaran</th>
                    <th class="py-2.5 text-center px-3">Freq Kirim</th>
                    <th class="py-2.5 text-right px-3">Total Tonase TBS</th>
                    <th class="py-2.5 text-right px-3">Total Nilai TBS (Rp)</th>
                    <th class="py-2.5 text-center px-3">Rata-rata Potongan</th>
                  </tr>
                </thead>
                <tbody>
                  ${trRows || '<tr><td colspan="8" class="text-center py-4 text-gray-400">Tidak ada aktivitas supplier pada rentang filter ini.</td></tr>'}
                </tbody>
              </table>
            `;
            generatePDF(reportName, html);
          }
        }
      } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan teknis saat mengompilasi laporan.");
      } finally {
        setExporting(null);
      }
    }, 1200);
  };

  const reportCards = [
    { title: 'Laporan Pembelian Harian', desc: 'Rekap harian berat bruto, tara, netto, dan harga per supplier.', category: 'Pembelian' },
    { title: 'Laporan Kualitas / Sortasi', desc: 'Data lengkap persentase buah mentah, busuk, sampah & potongan.', category: 'Kualitas' },
    { title: 'Laporan Pengiriman PKS', desc: 'Rekap tonase kirim, harga jual, dan penerimaan surat jalan.', category: 'Shipment' },
    { title: 'Laporan Kas & Pengeluaran', desc: 'Buku rekap kas keluar, bensin, upah bongkar, dan kas harian.', category: 'Keuangan' },
    { title: 'Laporan Neraca Profit Rugi', desc: 'Analisis laba kotor harian & bulanan beserta grafik margin.', category: 'Keuangan' },
    { title: 'Laporan Kinerja Supplier', desc: 'Peringkat volume tonase dan loyalitas pengiriman supplier.', category: 'Master' }
  ];

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#E6EBDD] pb-5">
        <h2 className="text-xl md:text-2xl font-black text-[#102018]">Pusat Analisis & Laporan RAM</h2>
        <p className="text-xs text-[#66736B] mt-1">
          Kompilasi tonase pembelian, sortir kualitas, pengiriman PKS, pengeluaran kasir, serta kalkulasi margin keuntungan RAM secara akurat.
        </p>
      </div>

      {/* Interactive Filters Panel */}
      <div className="bg-white rounded-2xl border border-[#E6EBDD] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E6EBDD]/60 pb-3">
          <h3 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-800" />
            Filter Kustom Laporan
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportOverallCSV}
              type="button"
              title="Export Ledger Gabungan Pembelian & Pengiriman"
              className="bg-white hover:bg-emerald-50 text-[#123C2B] border border-[#E6EBDD] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-emerald-800" />
              <span>Export Ledger CSV</span>
            </button>
            <button
              onClick={handleExportOverallPDF}
              type="button"
              title="Cetak Ringkasan Eksekutif RAM"
              className="bg-[#123C2B] hover:bg-emerald-950 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 text-[#C6F24A]" />
              <span>Cetak Ringkasan PDF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
          <div>
            <label className="block text-[#102018]/80 mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:border-[#1F6B4A]"
            />
          </div>

          <div>
            <label className="block text-[#102018]/80 mb-1">Tanggal Selesai</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:border-[#1F6B4A]"
            />
          </div>

          <div>
            <label className="block text-[#102018]/80 mb-1">Filter Supplier</label>
            <select
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
              className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:border-[#1F6B4A]"
            >
              <option value="">Semua Supplier</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#102018]/80 mb-1">Filter Pabrik PKS</label>
            <select
              value={filterMill}
              onChange={(e) => setFilterMill(e.target.value)}
              className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:border-[#1F6B4A]"
            >
              <option value="">Semua Pabrik PKS</option>
              {mills.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Aggregated Totals Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#F7FAF3] p-4 rounded-xl border border-[#E6EBDD]">
          <span className="text-[10px] uppercase font-bold text-[#66736B]">CUMULATIVE BOUGHT TONNAGE</span>
          <span className="text-lg font-black block mt-0.5 text-emerald-950 font-mono">{formatKg(totalPurchaseWeight)}</span>
          <span className="text-[10px] text-[#66736B] block">Beli Cost: {formatRupiah(totalPurchaseCost)}</span>
        </div>
        <div className="bg-[#F7FAF3] p-4 rounded-xl border border-[#E6EBDD]">
          <span className="text-[10px] uppercase font-bold text-[#66736B]">CUMULATIVE SHIPPED TONNAGE</span>
          <span className="text-lg font-black block mt-0.5 text-emerald-950 font-mono">{formatKg(totalShipmentWeight)}</span>
          <span className="text-[10px] text-[#66736B] block">Jual Rev: {formatRupiah(totalShipmentRevenue)}</span>
        </div>
        <div className="bg-[#F7FAF3] p-4 rounded-xl border border-[#E6EBDD]">
          <span className="text-[10px] uppercase font-bold text-[#66736B]">AVG PRICE SPREAD / KG</span>
          <span className="text-lg font-black block mt-0.5 text-emerald-950 font-mono">
            {avgSellPrice > 0 ? formatRupiah(avgSellPrice - avgBuyPrice) : 'Rp 0'}
          </span>
          <span className="text-[10px] text-[#66736B] block">Avg Jual: {formatRupiah(avgSellPrice)} | Beli: {formatRupiah(avgBuyPrice)}</span>
        </div>
        <div className="bg-[#123C2B] p-4 rounded-xl text-white">
          <span className="text-[10px] uppercase font-bold text-[#C6F24A]">ESTIMATED GROSS MARGIN</span>
          <span className="text-lg font-black block mt-0.5 font-mono text-white">{formatRupiah(totalGrossMargin)}</span>
          <span className="text-[10px] text-white/60 block">Berdasarkan surat jalan & slip valid</span>
        </div>
      </div>

      {/* List of reports category shortcut cards */}
      <div className="bg-white rounded-2xl border border-[#E6EBDD] p-5 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-emerald-950 border-b border-[#E6EBDD] pb-3">Pilih Jenis Laporan Eksport</h3>
        
        {exporting && (
          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-900 animate-pulse">
            <span className="flex items-center gap-2 font-bold">
              <RefreshCw className="w-4 h-4 text-emerald-700 animate-spin" />
              Sedang mengkompilasi data untuk {exporting}... Mohon tunggu.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportCards.map((rc, idx) => (
            <div key={idx} className="border border-[#E6EBDD] rounded-xl p-4 bg-[#F7FAF3] hover:border-emerald-300 transition-all flex flex-col justify-between">
              <div>
                <span className="bg-emerald-800/10 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  {rc.category}
                </span>
                <h4 className="font-bold text-sm text-[#102018] mt-2">{rc.title}</h4>
                <p className="text-[11px] text-[#66736B] mt-1 leading-relaxed">
                  {rc.desc}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#E6EBDD]/60 text-xs">
                <button
                  disabled={!!exporting}
                  onClick={() => handleExport('Excel', rc.title)}
                  className="bg-white hover:bg-emerald-50 text-[#123C2B] border border-[#E6EBDD] px-2.5 py-1.5 rounded-lg font-bold flex-1 flex items-center justify-center gap-1 transition-all"
                >
                  <Download className="w-3 h-3 text-emerald-800" />
                  Excel
                </button>
                <button
                  disabled={!!exporting}
                  onClick={() => handleExport('PDF', rc.title)}
                  className="bg-[#123C2B] hover:bg-emerald-950 text-white px-2.5 py-1.5 rounded-lg font-bold flex-1 flex items-center justify-center gap-1 transition-all"
                >
                  <FileText className="w-3 h-3 text-[#C6F24A]" />
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
