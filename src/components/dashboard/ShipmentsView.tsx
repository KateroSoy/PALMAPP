/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Truck, Search, Plus, Printer, CheckCircle, Eye, AlertTriangle, FileText, X } from 'lucide-react';
import { ShipmentRecord, PalmOilMill, Vehicle, Driver } from '../../types';
import { formatRupiah, formatKg } from '../../utils/calculations';

interface ShipmentsViewProps {
  shipments: ShipmentRecord[];
  mills: PalmOilMill[];
  vehicles: Vehicle[];
  drivers: Driver[];
  currentStock: number;
  onAddShipment: (shp: ShipmentRecord) => void;
  onUpdateShipmentStatus: (shpId: string, status: 'Draft' | 'Shipped' | 'Received' | 'Cancelled') => void;
}

export default function ShipmentsView({
  shipments,
  mills,
  vehicles,
  drivers,
  currentStock,
  onAddShipment,
  onUpdateShipmentStatus
}: ShipmentsViewProps) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDeliveryNote, setShowDeliveryNote] = useState<ShipmentRecord | null>(null);

  // Form states
  const [millId, setMillId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [shipmentWeight, setShipmentWeight] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(2850);
  const [notes, setNotes] = useState('');

  const revenue = shipmentWeight * sellingPrice;

  const activeMills = mills.filter(m => m.status === 'Active');
  const activeVehicles = vehicles.filter(v => v.status === 'Active');
  const activeDrivers = drivers.filter(d => d.status === 'Active');

  const handleMillChange = (mId: string) => {
    setMillId(mId);
    const mill = mills.find(item => item.id === mId);
    if (mill) {
      setSellingPrice(mill.defaultSellingPrice);
    }
  };

  const handleVehicleChange = (vId: string) => {
    setVehicleId(vId);
    const v = vehicles.find(item => item.id === vId);
    if (v && v.defaultDriverId) {
      setDriverId(v.defaultDriverId);
    }
  };

  const handleCreateShipment = (status: 'Draft' | 'Shipped') => {
    if (!millId || !vehicleId || !driverId || shipmentWeight <= 0) {
      alert('Mohon isi semua data wajib: Pabrik PKS, Kendaraan, Supir, dan Tonase Kirim!');
      return;
    }

    if (shipmentWeight > currentStock) {
      alert(`Gagal! Tonase Kirim (${formatKg(shipmentWeight)}) melebihi total stok yang tersedia di RAM saat ini (${formatKg(currentStock)}). Harap turunkan berat muatan atau input transaksi pembelian TBS terlebih dahulu!`);
      return;
    }

    const nextShpId = `SHP-${200 + shipments.length + 1}`;
    const nextDnNumber = `DN-2628${(shipments.length + 1).toString().padStart(2, '0')}`;

    const newShp: ShipmentRecord = {
      id: nextShpId,
      date: new Date().toISOString(),
      millId,
      vehicleId,
      driverId,
      shipmentWeight,
      sellingPricePerKg: sellingPrice,
      revenue,
      status,
      deliveryNoteNumber: nextDnNumber,
      notes: notes || 'Pengiriman TBS standar.'
    };

    onAddShipment(newShp);
    
    // reset form
    setMillId('');
    setVehicleId('');
    setDriverId('');
    setShipmentWeight(0);
    setNotes('');
    setShowForm(false);

    if (status === 'Shipped') {
      setShowDeliveryNote(newShp);
    }
  };

  // Filter shipments
  const filteredShipments = shipments.filter(s => {
    const mill = mills.find(m => m.id === s.millId);
    const millName = mill ? mill.name.toLowerCase() : '';
    const term = search.toLowerCase();
    return s.id.toLowerCase().includes(term) ||
           s.deliveryNoteNumber.toLowerCase().includes(term) ||
           millName.includes(term);
  });

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6EBDD] pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#102018]">Shipment & Pengiriman TBS ke PKS</h2>
          <p className="text-xs text-[#66736B] mt-1">
            Mencatat tonase buah yang dimuat dari stockpile RAM dan diangkut dengan truk fuso menuju berbagai Pabrik Kelapa Sawit (PKS) relasi.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#123C2B] hover:bg-[#1f6b4a] text-white font-bold px-4 py-2.5 rounded-xl text-xs md:text-sm shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto transition-all"
          >
            <Plus className="w-4 h-4 text-[#C6F24A]" />
            Buat Pengiriman Baru
          </button>
        )}
      </div>

      {/* Warning current stockpile limit */}
      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#C6F24A] text-[#123C2B] p-2 rounded-xl flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Ketersediaan Stokpile TBS saat ini:</span>
            <span className="text-xl font-black text-emerald-950 font-mono block mt-0.5">{formatKg(currentStock)}</span>
          </div>
        </div>
        <div className="text-right text-xs text-[#66736B]">
          *Truk fuso pengiriman ke PKS tidak boleh mengangkut melebihi total persediaan stockpile.
        </div>
      </div>

      {/* CREATE SHIPMENT FORM */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#E6EBDD] p-5 md:p-6 shadow-md space-y-5 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-[#E6EBDD] pb-3">
            <h3 className="font-extrabold text-lg text-emerald-950 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-800" />
              Buat Surat Jalan Pengiriman PKS Baru
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-[#66736B] hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field 1: Mill destination */}
              <div>
                <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                  Pilih Pabrik PKS Tujuan <span className="text-red-500">*</span>
                </label>
                <select
                  value={millId}
                  onChange={(e) => handleMillChange(e.target.value)}
                  className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
                >
                  <option value="">-- Pilih Pabrik Kelapa Sawit --</option>
                  {activeMills.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.companyName})</option>
                  ))}
                </select>
              </div>

              {/* Field 2: Shipment weight */}
              <div>
                <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                  Tonase Kirim (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 14500"
                  value={shipmentWeight || ''}
                  onChange={(e) => setShipmentWeight(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2 text-xs font-bold font-mono focus:outline-none focus:border-[#1F6B4A]"
                />
                {shipmentWeight > currentStock && (
                  <span className="text-[10px] text-red-600 font-bold block mt-1">
                    ⚠️ Melebihi stok RAM yang tersedia ({formatKg(currentStock)})!
                  </span>
                )}
              </div>

              {/* Field 3: Vehicle */}
              <div>
                <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                  Kendaraan Pengangkut <span className="text-red-500">*</span>
                </label>
                <select
                  value={vehicleId}
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
                >
                  <option value="">-- Pilih Truk Pengirim --</option>
                  {activeVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.plateNumber} - {v.vehicleType}</option>
                  ))}
                </select>
              </div>

              {/* Field 4: Driver */}
              <div>
                <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                  Supir Pengantar <span className="text-red-500">*</span>
                </label>
                <select
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
                >
                  <option value="">-- Pilih Supir --</option>
                  {activeDrivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#102018]/80 mb-1">
                  Catatan Pengiriman (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pengiriman DO No. 5, buah sortiran rapi, dll."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
                />
              </div>
            </div>

            {/* Calculations Panel */}
            <div className="lg:col-span-4 bg-[#123C2B] rounded-2xl p-5 text-white flex flex-col justify-between border border-[#C6F24A]/20 shadow-inner">
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#C6F24A] border-b border-white/10 pb-2 mb-2">
                  ESTIMASI PENJUALAN PKS
                </h4>
                <div className="space-y-2 font-mono text-xs text-left">
                  <div className="flex justify-between">
                    <span className="font-sans text-white/60">Tonase Kirim:</span>
                    <span className="font-bold">{formatKg(shipmentWeight)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-white/60">Harga Kontrak Jual PKS:</span>
                    <span className="font-bold">{formatRupiah(sellingPrice)}/kg</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between text-sm text-[#C6F24A]">
                    <span className="font-sans font-bold">Estimasi Pendapatan:</span>
                    <span className="font-black">{formatRupiah(revenue)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-8">
                <button
                  onClick={() => handleCreateShipment('Shipped')}
                  disabled={shipmentWeight <= 0 || shipmentWeight > currentStock}
                  className={`w-full font-black text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                    shipmentWeight > 0 && shipmentWeight <= currentStock
                      ? 'bg-[#C6F24A] text-[#123C2B] hover:bg-[#b5e03b]'
                      : 'bg-white/10 text-white/30 cursor-not-allowed shadow-none'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Kirim & Print Surat Jalan (DO)
                </button>
                <button
                  onClick={() => handleCreateShipment('Draft')}
                  className="w-full bg-white/5 text-white/80 hover:bg-white/15 font-bold text-xs py-2.5 rounded-xl transition-all"
                >
                  Simpan Draft Surat Jalan
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SHIPMENT LIST TABLE */}
      <div className="bg-white rounded-2xl border border-[#E6EBDD] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#66736B] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari berdasarkan No. DO / Surat Jalan, supir, atau nama pabrik PKS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
            />
          </div>
          <div className="text-xs text-[#66736B] font-medium font-mono">
            Total Pengiriman: {filteredShipments.length} DO
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E6EBDD] text-[#66736B] font-bold bg-[#F7FAF3]">
                <th className="py-2.5 px-3">Kode Kirim</th>
                <th className="py-2.5 px-3">No. Surat Jalan (DO)</th>
                <th className="py-2.5 px-3">Tanggal Pengiriman</th>
                <th className="py-2.5 px-3">PKS Penerima</th>
                <th className="py-2.5 px-3">Kendaraan / Supir</th>
                <th className="py-2.5 px-3 text-right">Tonase Kirim</th>
                <th className="py-2.5 px-3 text-right">Estimasi Jual (Rp/kg)</th>
                <th className="py-2.5 px-3 text-right">Estimasi Pendapatan</th>
                <th className="py-2.5 px-3 text-center">Status Kirim</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-[#66736B]">
                    Tidak ada transaksi pengiriman TBS ke PKS.
                  </td>
                </tr>
              ) : (
                filteredShipments.map(s => {
                  const m = mills.find(mill => mill.id === s.millId);
                  const d = drivers.find(driver => driver.id === s.driverId);
                  return (
                    <tr key={s.id} className="border-b border-[#E6EBDD] hover:bg-[#F7FAF3]/40 transition-colors">
                      <td className="py-3 px-3 font-bold font-mono text-emerald-950">{s.id}</td>
                      <td className="py-3 px-3 font-semibold font-mono text-emerald-800">{s.deliveryNoteNumber}</td>
                      <td className="py-3 px-3 text-[#66736B]">
                        {new Date(s.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-3 font-bold">{m ? m.name : s.millId}</td>
                      <td className="py-3 px-3 text-[#66736B]">
                        <div>{s.vehicleId}</div>
                        <div className="text-[10px]">{d ? d.name : s.driverId}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-bold font-mono">{formatKg(s.shipmentWeight)}</td>
                      <td className="py-3 px-3 text-right font-mono text-[#66736B]">{formatRupiah(s.sellingPricePerKg)}</td>
                      <td className="py-3 px-3 text-right font-black font-mono text-emerald-800">{formatRupiah(s.revenue)}</td>
                      <td className="py-3 px-3 text-center">
                        <select
                          value={s.status}
                          onChange={(e) => onUpdateShipmentStatus(s.id, e.target.value as any)}
                          className={`text-[10px] font-bold px-2 py-1 rounded focus:outline-none border border-transparent ${
                            s.status === 'Received' ? 'bg-emerald-100 text-emerald-800' :
                            s.status === 'Shipped' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                            s.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Shipped">Sedang Dikirim (Shipped)</option>
                          <option value="Received">Diterima PKS (Received)</option>
                          <option value="Cancelled">Batal (Cancelled)</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setShowDeliveryNote(s)}
                          className="p-1 rounded bg-[#F7FAF3] border border-[#E6EBDD] text-emerald-950 hover:bg-emerald-50 hover:border-emerald-300 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
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

      {/* MODAL: DELIVERY NOTE PREVIEW */}
      {showDeliveryNote && (
        <div className="fixed inset-0 z-50 bg-[#102018]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E6EBDD] shadow-2xl space-y-4 text-left animate-zoomIn">
            <div className="flex justify-between items-center border-b border-[#E6EBDD] pb-3">
              <span className="text-xs font-bold text-emerald-950 font-mono flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-800" />
                SURAT JALAN PENGANTAR (DELIVERY NOTE)
              </span>
              <button
                onClick={() => setShowDeliveryNote(null)}
                className="text-[#66736B] hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated letterhead DO */}
            <div id="delivery-note-print-content" className="bg-[#fcfdfa] border border-[#E6EBDD] p-5 rounded-xl font-mono text-xs text-[#102018] space-y-4 shadow-inner">
              <div className="flex justify-between items-start border-b border-[#E6EBDD] pb-3">
                <div className="text-left space-y-0.5">
                  <span className="font-bold text-sm block">RAMPALM OS SAWIT</span>
                  <span className="text-[9px] text-[#66736B] block">Siak, Riau, Indonesia</span>
                </div>
                <div className="text-right text-[10px] space-y-0.5">
                  <span className="font-bold block text-emerald-800">SURAT JALAN DO</span>
                  <span className="font-bold block">{showDeliveryNote.deliveryNoteNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[10px] border-b border-[#E6EBDD]/50 pb-3">
                <div className="space-y-1">
                  <span className="text-[#66736B] block font-sans">Dikirim Kepada:</span>
                  <span className="font-bold block">
                    {mills.find(m => m.id === showDeliveryNote.millId)?.name || showDeliveryNote.millId}
                  </span>
                  <span className="text-[9px] text-[#66736B] block leading-snug">
                    {mills.find(m => m.id === showDeliveryNote.millId)?.address}
                  </span>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[#66736B] block font-sans">Tanggal Pengiriman:</span>
                  <span className="font-bold block">
                    {new Date(showDeliveryNote.date).toLocaleDateString('id-ID')}
                  </span>
                  <span className="text-[9px] block">
                    Supir: {drivers.find(d => d.id === showDeliveryNote.driverId)?.name || showDeliveryNote.driverId}
                  </span>
                  <span className="text-[9px] block">
                    Kendaraan: {showDeliveryNote.vehicleId}
                  </span>
                </div>
              </div>

              <div className="py-2 font-bold text-xs space-y-2 border-b border-dashed border-[#E6EBDD]">
                <div className="flex justify-between font-sans">
                  <span>URAIAN MUATAN:</span>
                  <span>TBS KELAPA SAWIT (FFB)</span>
                </div>
                <div className="flex justify-between font-mono text-[#123C2B]">
                  <span>TONASE BERAT (RAM):</span>
                  <span>{formatKg(showDeliveryNote.shipmentWeight)}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[9px] pt-8 font-sans">
                <div className="space-y-8">
                  <span>Supir Pengantar,</span>
                  <div className="border-b border-black w-20 mx-auto"></div>
                </div>
                <div className="space-y-8">
                  <span>Petugas RAM,</span>
                  <div className="border-b border-black w-20 mx-auto"></div>
                </div>
                <div className="space-y-8">
                  <span>Penerima PKS,</span>
                  <div className="border-b border-black w-20 mx-auto"></div>
                </div>
              </div>

              <div className="text-center text-[8px] text-[#66736B] pt-4 border-t border-[#E6EBDD] italic">
                *Harap pastikan slip timbangan jembatan PKS dilampirkan kembali ketika penagihan invoice.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  const printContent = document.getElementById('delivery-note-print-content');
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
                  setShowDeliveryNote(null);
                }}
                className="bg-[#123C2B] text-white hover:bg-emerald-950 font-bold text-xs py-2.5 px-4 rounded-xl transition-all"
              >
                Cetak Surat Jalan
              </button>
              <button
                onClick={() => setShowDeliveryNote(null)}
                className="bg-[#F7FAF3] hover:bg-[#E6EBDD] text-[#102018] font-semibold text-xs py-2.5 px-4 rounded-xl border border-[#E6EBDD] transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
