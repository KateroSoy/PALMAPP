/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Building,
  Truck,
  UserCheck,
  MapPin,
  Leaf,
  X
} from 'lucide-react';
import { Supplier, Farmer, Vehicle, Driver, PalmOilMill, Employee, PurchaseTransaction, ShipmentRecord } from '../../types';
import { formatRupiah, formatKg } from '../../utils/calculations';

interface MasterDataViewProps {
  suppliers: Supplier[];
  farmers: Farmer[];
  vehicles: Vehicle[];
  drivers: Driver[];
  mills: PalmOilMill[];
  employees: Employee[];
  purchases: PurchaseTransaction[];
  shipments: ShipmentRecord[];
  
  // Update functions passed from top
  onAddSupplier: (record: Supplier) => void;
  onUpdateSupplier: (record: Supplier) => void;
  onDeleteSupplier: (id: string) => void;

  onAddFarmer: (record: Farmer) => void;
  onUpdateFarmer: (record: Farmer) => void;
  onDeleteFarmer: (id: string) => void;

  onAddVehicle: (record: Vehicle) => void;
  onUpdateVehicle: (record: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;

  onAddDriver: (record: Driver) => void;
  onUpdateDriver: (record: Driver) => void;
  onDeleteDriver: (id: string) => void;

  onAddMill: (record: PalmOilMill) => void;
  onUpdateMill: (record: PalmOilMill) => void;
  onDeleteMill: (id: string) => void;

  onAddEmployee: (record: Employee) => void;
  onUpdateEmployee: (record: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  autoOpenForm?: 'supplier' | null;
  onFormClose?: () => void;
}

export default function MasterDataView({
  suppliers,
  farmers,
  vehicles,
  drivers,
  mills,
  employees,
  purchases,
  shipments,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
  onAddFarmer,
  onUpdateFarmer,
  onDeleteFarmer,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  onAddDriver,
  onUpdateDriver,
  onDeleteDriver,
  onAddMill,
  onUpdateMill,
  onDeleteMill,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  autoOpenForm,
  onFormClose
}: MasterDataViewProps) {
  const [subTab, setSubTab] = useState<'suppliers' | 'farmers' | 'vehicles' | 'drivers' | 'mills' | 'employees'>('suppliers');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form input states
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [supplierBank, setSupplierBank] = useState('');
  const [supplierAcc, setSupplierAcc] = useState('');

  // Auto-open supplier form when requested
  useEffect(() => {
    if (autoOpenForm === 'supplier') {
      setSubTab('suppliers');
      // Reset state fields
      setSupplierName('');
      setSupplierPhone('');
      setSupplierAddress('');
      setSupplierBank('');
      setSupplierAcc('');
      setShowAddForm(true);
      if (onFormClose) {
        onFormClose();
      }
    }
  }, [autoOpenForm, onFormClose]);

  const [farmerName, setFarmerName] = useState('');
  const [farmerLoc, setFarmerLoc] = useState('');
  const [farmerArea, setFarmerArea] = useState<number>(0);
  const [farmerSup, setFarmerSup] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');

  const [vehPlate, setVehPlate] = useState('');
  const [vehType, setVehType] = useState('');
  const [vehCap, setVehCap] = useState<number>(0);
  const [vehDriver, setVehDriver] = useState('');

  const [drvName, setDrvName] = useState('');
  const [drvPhone, setDrvPhone] = useState('');
  const [drvAddress, setDrvAddress] = useState('');

  const [millName, setMillName] = useState('');
  const [millCompany, setMillCompany] = useState('');
  const [millAddress, setMillAddress] = useState('');
  const [millContact, setMillContact] = useState('');
  const [millPhone, setMillPhone] = useState('');
  const [millPrice, setMillPrice] = useState<number>(2850);

  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('Operator Timbangan');
  const [empPhone, setEmpPhone] = useState('');
  const [empAddress, setEmpAddress] = useState('');

  const handleCreateSupplier = () => {
    if (!supplierName || !supplierPhone || !supplierAddress) {
      alert('Nama, Telepon, dan Alamat wajib diisi!');
      return;
    }
    const id = `SUP-00${suppliers.length + 1}`;
    onAddSupplier({
      id,
      name: supplierName,
      phone: supplierPhone,
      address: supplierAddress,
      bankName: supplierBank || 'BRI',
      bankAccountNumber: supplierAcc || '-',
      status: 'Active'
    });
    setSupplierName('');
    setSupplierPhone('');
    setSupplierAddress('');
    setSupplierBank('');
    setSupplierAcc('');
    setShowAddForm(false);
  };

  const handleDeleteSupplierVerify = (id: string) => {
    // Check if supplier is referenced in any purchase transaction
    const isReferenced = purchases.some(p => p.supplierId === id);
    if (isReferenced) {
      alert(`Gagal menghapus! Supplier ini (${id}) telah memiliki riwayat transaksi timbangan TBS yang terdaftar. Anda hanya dapat menonaktifkan statusnya agar tidak muncul di form baru.`);
      return;
    }
    onDeleteSupplier(id);
  };

  const handleCreateFarmer = () => {
    if (!farmerName || !farmerSup) {
      alert('Nama petani dan relasi supplier wajib diisi!');
      return;
    }
    const id = `FRM-00${farmers.length + 1}`;
    onAddFarmer({
      id,
      name: farmerName,
      plantationLocation: farmerLoc || 'Lahan Sawit',
      areaSize: farmerArea,
      relatedSupplierId: farmerSup,
      phone: farmerPhone || '-',
      status: 'Active'
    });
    setFarmerName('');
    setFarmerLoc('');
    setFarmerArea(0);
    setFarmerSup('');
    setFarmerPhone('');
    setShowAddForm(false);
  };

  const handleCreateVehicle = () => {
    if (!vehPlate || !vehType) {
      alert('Nomor plat dan tipe kendaraan wajib diisi!');
      return;
    }
    onAddVehicle({
      id: vehPlate,
      plateNumber: vehPlate,
      vehicleType: vehType,
      capacity: vehCap,
      defaultDriverId: vehDriver,
      status: 'Active'
    });
    setVehPlate('');
    setVehType('');
    setVehCap(0);
    setVehDriver('');
    setShowAddForm(false);
  };

  const handleCreateDriver = () => {
    if (!drvName || !drvPhone) {
      alert('Nama supir dan telepon wajib diisi!');
      return;
    }
    const id = `DRV-00${drivers.length + 1}`;
    onAddDriver({
      id,
      name: drvName,
      phone: drvPhone,
      address: drvAddress || '-',
      status: 'Active'
    });
    setDrvName('');
    setDrvPhone('');
    setDrvAddress('');
    setShowAddForm(false);
  };

  const handleCreateMill = () => {
    if (!millName || !millCompany || !millPrice) {
      alert('Nama PKS, Nama PT, dan Harga jual wajib diisi!');
      return;
    }
    const id = `PKS-00${mills.length + 1}`;
    onAddMill({
      id,
      name: millName,
      companyName: millCompany,
      address: millAddress || '-',
      contactPerson: millContact || '-',
      phone: millPhone || '-',
      defaultSellingPrice: millPrice,
      status: 'Active'
    });
    setMillName('');
    setMillCompany('');
    setMillAddress('');
    setMillContact('');
    setMillPhone('');
    setShowAddForm(false);
  };

  const handleCreateEmployee = () => {
    if (!empName || !empPhone) {
      alert('Nama karyawan dan telepon wajib diisi!');
      return;
    }
    const id = `EMP-00${employees.length + 1}`;
    onAddEmployee({
      id,
      name: empName,
      role: empRole,
      phone: empPhone,
      address: empAddress || '-',
      status: 'Active'
    });
    setEmpName('');
    setEmpPhone('');
    setEmpAddress('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6EBDD] pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#102018]">Basis Data Master (Master Data)</h2>
          <p className="text-xs text-[#66736B] mt-1">
            Mengatur data registrasi supplier, petani mandiri, armada kendaraan truk fuso, nomor supir, serta kontrak harga pabrik PKS relasi.
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-[#123C2B] hover:bg-[#1f6b4a] text-white font-bold px-4 py-2.5 rounded-xl text-xs md:text-sm shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto transition-all"
          >
            <Plus className="w-4 h-4 text-[#C6F24A]" />
            Registrasi Master Baru
          </button>
        )}
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex flex-wrap border-b border-[#E6EBDD]">
        {[
          { key: 'suppliers', label: 'Supplier/Agen' },
          { key: 'farmers', label: 'Petani Kebun' },
          { key: 'vehicles', label: 'Armada Truk' },
          { key: 'drivers', label: 'Driver/Supir' },
          { key: 'mills', label: 'Kontrak PKS' },
          { key: 'employees', label: 'Karyawan RAM' }
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setSubTab(t.key as any);
              setSearch('');
              setShowAddForm(false);
            }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              subTab === t.key ? 'border-[#123C2B] text-[#123C2B]' : 'border-transparent text-[#66736B] hover:text-[#102018]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* FORM: REGISTRASI BARU */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-[#E6EBDD] p-5 shadow-md animate-fadeIn space-y-4">
          <div className="flex justify-between items-center border-b border-[#E6EBDD] pb-2">
            <h3 className="font-extrabold text-sm text-emerald-950 uppercase">Registrasi {subTab} Baru</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-[#66736B] hover:text-red-500 p-1 rounded-full hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
            {/* SUPPLIER FORM FIELDS */}
            {subTab === 'suppliers' && (
              <>
                <div>
                  <label className="block mb-1 text-[#102018]/80">Nama Agen/Supplier *</label>
                  <input
                    type="text"
                    placeholder="Contoh: CV TBS Makmur"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#102018]/80">No. Telepon / HP *</label>
                  <input
                    type="text"
                    placeholder="Contoh: 0812-3456-789"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#102018]/80">Nama Bank Pelunasan</label>
                  <input
                    type="text"
                    placeholder="Contoh: BRI / Bank Mandiri"
                    value={supplierBank}
                    onChange={(e) => setSupplierBank(e.target.value)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#102018]/80">Nomor Rekening Bank</label>
                  <input
                    type="text"
                    placeholder="Contoh: 0123-01-02-34"
                    value={supplierAcc}
                    onChange={(e) => setSupplierAcc(e.target.value)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block mb-1 text-[#102018]/80">Alamat Kantor/Pengepul *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Desa Sorek, Kampar"
                    value={supplierAddress}
                    onChange={(e) => setSupplierAddress(e.target.value)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
              </>
            )}

            {/* FARMER FORM FIELDS */}
            {subTab === 'farmers' && (
              <>
                <div>
                  <label className="block mb-1 text-[#102018]/80">Nama Petani Sawit *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pak Sutarno"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#102018]/80">No. Telepon</label>
                  <input
                    type="text"
                    placeholder="Contoh: 0812-7766-55"
                    value={farmerPhone}
                    onChange={(e) => setFarmerPhone(e.target.value)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#102018]/80">Supplier Penampung (Relasi) *</label>
                  <select
                    value={farmerSup}
                    onChange={(e) => setFarmerSup(e.target.value)}
                    className="w-full bg-white border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  >
                    <option value="">-- Pilih Supplier Relasi --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-[#102018]/80">Lokasi Kebun Hektar</label>
                  <input
                    type="text"
                    placeholder="Desa Suka Maju"
                    value={farmerLoc}
                    onChange={(e) => setFarmerLoc(e.target.value)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#102018]/80">Luas Kebun (Hektar)</label>
                  <input
                    type="number"
                    value={farmerArea || ''}
                    placeholder="Contoh: 4"
                    onChange={(e) => setFarmerArea(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
              </>
            )}

            {/* VEHICLES FORM FIELDS */}
            {subTab === 'vehicles' && (
              <>
                <div>
                  <label className="block mb-1 text-[#102018]/80">Nomor Plat Truk *</label>
                  <input
                    type="text"
                    placeholder="Contoh: BM 8123 TK"
                    value={vehPlate}
                    onChange={(e) => setVehPlate(e.target.value.toUpperCase())}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#102018]/80">Tipe Karoseri *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Colt Diesel Canter 120PS"
                    value={vehType}
                    onChange={(e) => setVehType(e.target.value)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#102018]/80">Kapasitas Muatan (kg)</label>
                  <input
                    type="number"
                    value={vehCap || ''}
                    placeholder="Contoh: 8000"
                    onChange={(e) => setVehCap(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#102018]/80">Supir Standar (Default)</label>
                  <select
                    value={vehDriver}
                    onChange={(e) => setVehDriver(e.target.value)}
                    className="w-full bg-white border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  >
                    <option value="">-- Pilih Supir --</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* DRIVERS FORM */}
            {subTab === 'drivers' && (
              <>
                <div>
                  <label className="block mb-1 text-[#102018]/80">Nama Supir Kendaraan *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rudi Hartono"
                    value={drvName}
                    onChange={(e) => setDrvName(e.target.value)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#102018]/80">No. HP Aktif *</label>
                  <input
                    type="text"
                    placeholder="0812-4455-6677"
                    value={drvPhone}
                    onChange={(e) => setDrvPhone(e.target.value)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#102018]/80">Alamat Rumah</label>
                  <input
                    type="text"
                    placeholder="Sorek"
                    value={drvAddress}
                    onChange={(e) => setDrvAddress(e.target.value)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
              </>
            )}

            {/* MILLS FORM */}
            {subTab === 'mills' && (
              <>
                <div>
                  <label className="block mb-1 text-[#102018]/80">Nama Pabrik Kelapa Sawit (PKS) *</label>
                  <input
                    type="text"
                    placeholder="Contoh: PKS Nusantara Sejahtera"
                    value={millName}
                    onChange={(e) => setMillName(e.target.value)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#102018]/80">Nama Perseroan (PT) *</label>
                  <input
                    type="text"
                    placeholder="Contoh: PT Agro Nusantara"
                    value={millCompany}
                    onChange={(e) => setMillCompany(e.target.value)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#102018]/80">Kontrak Harga Beli PKS (Rp/kg) *</label>
                  <input
                    type="number"
                    value={millPrice}
                    onChange={(e) => setMillPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#102018]/80">Contact Person PKS</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pak Hendro"
                    value={millContact}
                    onChange={(e) => setMillContact(e.target.value)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#102018]/80">No. Telp Kantor PKS</label>
                  <input
                    type="text"
                    placeholder="0811-3322-11"
                    value={millPhone}
                    onChange={(e) => setMillPhone(e.target.value)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#102018]/80">Alamat Pabrik PKS</label>
                  <input
                    type="text"
                    placeholder="Kawasan Industri Siak"
                    value={millAddress}
                    onChange={(e) => setMillAddress(e.target.value)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
              </>
            )}

            {/* EMPLOYEES FORM */}
            {subTab === 'employees' && (
              <>
                <div>
                  <label className="block mb-1 text-[#102018]/80">Nama Lengkap Karyawan *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Siti Rahma"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#102018]/80">No. HP Aktif *</label>
                  <input
                    type="text"
                    placeholder="0813-8899-0011"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#102018]/80">Tugas / Jabatan *</label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                    className="w-full bg-white border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
                  >
                    <option value="Operator Timbangan">Operator Timbangan</option>
                    <option value="Kasir & Keuangan">Kasir & Keuangan</option>
                    <option value="Quality Checker / Sortasi">Quality Checker / Sortasi</option>
                    <option value="Keamanan / Security">Keamanan / Security</option>
                  </select>
                </div>
              </>
            )}

            {/* Trigger submission buttons */}
            <div className="sm:col-span-3 flex justify-end gap-3 pt-4 border-t border-[#E6EBDD]/50">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 hover:bg-gray-100 rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (subTab === 'suppliers') handleCreateSupplier();
                  if (subTab === 'farmers') handleCreateFarmer();
                  if (subTab === 'vehicles') handleCreateVehicle();
                  if (subTab === 'drivers') handleCreateDriver();
                  if (subTab === 'mills') handleCreateMill();
                  if (subTab === 'employees') handleCreateEmployee();
                }}
                className="bg-[#123C2B] text-white hover:bg-emerald-950 px-5 py-2 rounded-xl transition-all font-bold shadow-md"
              >
                Simpan Registrasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH BAR & DATATABLES */}
      <div className="bg-white rounded-2xl border border-[#E6EBDD] p-5 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#66736B] absolute left-3 top-3" />
          <input
            type="text"
            placeholder={`Cari database di tab ${subTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
          />
        </div>

        {/* 1. SUPPLIERS LIST */}
        {subTab === 'suppliers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E6EBDD] text-[#66736B] font-bold bg-[#F7FAF3]">
                  <th className="py-2.5 px-3">ID Supplier</th>
                  <th className="py-2.5 px-3">Nama Agen/Supplier</th>
                  <th className="py-2.5 px-3">No. Telp</th>
                  <th className="py-2.5 px-3">Lokasi Kantor</th>
                  <th className="py-2.5 px-3">Pelunasan Bank</th>
                  <th className="py-2.5 px-3">No. Rekening</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(s => (
                  <tr key={s.id} className="border-b border-[#E6EBDD] hover:bg-[#F7FAF3]/40 transition-colors">
                    <td className="py-3 px-3 font-bold font-mono text-emerald-950">{s.id}</td>
                    <td className="py-3 px-3 font-semibold">{s.name}</td>
                    <td className="py-3 px-3 text-[#66736B] font-mono">{s.phone}</td>
                    <td className="py-3 px-3 text-[#66736B]">{s.address}</td>
                    <td className="py-3 px-3 font-bold text-emerald-950">{s.bankName}</td>
                    <td className="py-3 px-3 text-[#66736B] font-mono">{s.bankAccountNumber}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        s.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {s.status === 'Active' ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleDeleteSupplierVerify(s.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Supplier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. FARMERS LIST */}
        {subTab === 'farmers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E6EBDD] text-[#66736B] font-bold bg-[#F7FAF3]">
                  <th className="py-2.5 px-3">ID Petani</th>
                  <th className="py-2.5 px-3">Nama Petani</th>
                  <th className="py-2.5 px-3">No. Telp</th>
                  <th className="py-2.5 px-3">Lokasi Lahan</th>
                  <th className="py-2.5 px-3 text-right font-mono">Luas Lahan</th>
                  <th className="py-2.5 px-3">Supplier Relasi</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {farmers.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).map(f => {
                  const s = suppliers.find(item => item.id === f.relatedSupplierId);
                  return (
                    <tr key={f.id} className="border-b border-[#E6EBDD] hover:bg-[#F7FAF3]/40 transition-colors">
                      <td className="py-3 px-3 font-bold font-mono text-emerald-950">{f.id}</td>
                      <td className="py-3 px-3 font-semibold">{f.name}</td>
                      <td className="py-3 px-3 text-[#66736B] font-mono">{f.phone}</td>
                      <td className="py-3 px-3 text-[#66736B]">{f.plantationLocation}</td>
                      <td className="py-3 px-3 text-right font-bold font-mono">{f.areaSize} Hektar</td>
                      <td className="py-3 px-3 font-bold text-emerald-800">{s ? s.name : f.relatedSupplierId}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[9px] font-bold">
                          {f.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onDeleteFarmer(f.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. VEHICLES LIST */}
        {subTab === 'vehicles' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E6EBDD] text-[#66736B] font-bold bg-[#F7FAF3]">
                  <th className="py-2.5 px-3">Nomor Plat</th>
                  <th className="py-2.5 px-3">Tipe Karoseri</th>
                  <th className="py-2.5 px-3 text-right">Kapasitas Maks</th>
                  <th className="py-2.5 px-3">Supir Default</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.filter(v => v.plateNumber.toLowerCase().includes(search.toLowerCase())).map(v => {
                  const d = drivers.find(item => item.id === v.defaultDriverId);
                  return (
                    <tr key={v.id} className="border-b border-[#E6EBDD] hover:bg-[#F7FAF3]/40 transition-colors">
                      <td className="py-3 px-3 font-bold font-mono text-emerald-950">{v.plateNumber}</td>
                      <td className="py-3 px-3 text-[#66736B]">{v.vehicleType}</td>
                      <td className="py-3 px-3 text-right font-bold font-mono">{formatKg(v.capacity)}</td>
                      <td className="py-3 px-3 font-semibold text-emerald-800">{d ? d.name : '-'}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[9px] font-bold">
                          {v.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onDeleteVehicle(v.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. DRIVERS LIST */}
        {subTab === 'drivers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E6EBDD] text-[#66736B] font-bold bg-[#F7FAF3]">
                  <th className="py-2.5 px-3">ID Supir</th>
                  <th className="py-2.5 px-3">Nama Supir</th>
                  <th className="py-2.5 px-3 font-mono">No. Telepon</th>
                  <th className="py-2.5 px-3">Alamat Tinggal</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {drivers.filter(d => d.name.toLowerCase().includes(search.toLowerCase())).map(d => (
                  <tr key={d.id} className="border-b border-[#E6EBDD] hover:bg-[#F7FAF3]/40 transition-colors">
                    <td className="py-3 px-3 font-bold font-mono text-emerald-950">{d.id}</td>
                    <td className="py-3 px-3 font-semibold">{d.name}</td>
                    <td className="py-3 px-3 font-mono text-[#66736B]">{d.phone}</td>
                    <td className="py-3 px-3 text-[#66736B]">{d.address}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[9px] font-bold">
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onDeleteDriver(d.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. MILLS LIST */}
        {subTab === 'mills' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E6EBDD] text-[#66736B] font-bold bg-[#F7FAF3]">
                  <th className="py-2.5 px-3">ID PKS</th>
                  <th className="py-2.5 px-3">Nama Pabrik Kelapa Sawit</th>
                  <th className="py-2.5 px-3">Nama PT Perseroan</th>
                  <th className="py-2.5 px-3 text-right">Harga Kontrak Beli (Rp/kg)</th>
                  <th className="py-2.5 px-3">Alamat Pabrik PKS</th>
                  <th className="py-2.5 px-3">Contact Person PKS</th>
                  <th className="py-2.5 px-3 text-center">Status Kontrak</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {mills.filter(m => m.name.toLowerCase().includes(search.toLowerCase())).map(m => (
                  <tr key={m.id} className="border-b border-[#E6EBDD] hover:bg-[#F7FAF3]/40 transition-colors">
                    <td className="py-3 px-3 font-bold font-mono text-emerald-950">{m.id}</td>
                    <td className="py-3 px-3 font-bold text-emerald-800">{m.name}</td>
                    <td className="py-3 px-3 text-[#66736B]">{m.companyName}</td>
                    <td className="py-3 px-3 text-right font-black font-mono text-emerald-700">{formatRupiah(m.defaultSellingPrice)}</td>
                    <td className="py-3 px-3 text-[#66736B]">{m.address}</td>
                    <td className="py-3 px-3 text-[#66736B]">
                      <div>{m.contactPerson}</div>
                      <div className="text-[10px] font-mono">{m.phone}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[9px] font-bold">
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onDeleteMill(m.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. EMPLOYEES LIST */}
        {subTab === 'employees' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E6EBDD] text-[#66736B] font-bold bg-[#F7FAF3]">
                  <th className="py-2.5 px-3">ID Pegawai</th>
                  <th className="py-2.5 px-3">Nama Pegawai</th>
                  <th className="py-2.5 px-3 font-mono">No. Telepon</th>
                  <th className="py-2.5 px-3">Role / Tugas</th>
                  <th className="py-2.5 px-3">Alamat</th>
                  <th className="py-2.5 px-3 text-center">Status Kerja</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase())).map(e => (
                  <tr key={e.id} className="border-b border-[#E6EBDD] hover:bg-[#F7FAF3]/40 transition-colors">
                    <td className="py-3 px-3 font-bold font-mono text-emerald-950">{e.id}</td>
                    <td className="py-3 px-3 font-semibold">{e.name}</td>
                    <td className="py-3 px-3 font-mono text-[#66736B]">{e.phone}</td>
                    <td className="py-3 px-3 font-bold text-emerald-800">{e.role}</td>
                    <td className="py-3 px-3 text-[#66736B]">{e.address}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[9px] font-bold">
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onDeleteEmployee(e.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
