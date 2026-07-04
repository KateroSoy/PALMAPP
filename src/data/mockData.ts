/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Supplier,
  Farmer,
  Vehicle,
  Driver,
  PalmOilMill,
  Employee,
  PurchaseTransaction,
  ShipmentRecord,
  ExpenseRecord,
  AuditLog,
  NotificationItem,
  User
} from '../types';

export const initialSuppliers: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'Budi Sawit Mandiri',
    phone: '0812-7456-1122',
    address: 'Jl. Lintas Timur KM 45, Pangkalan Kerinci, Riau',
    bankName: 'BRI',
    bankAccountNumber: '0124-01-023456-50-1',
    status: 'Active'
  },
  {
    id: 'SUP-002',
    name: 'Koperasi Tani Makmur',
    phone: '0813-6523-9988',
    address: 'Desa Suka Maju, Siak, Riau',
    bankName: 'Bank Mandiri',
    bankAccountNumber: '108-00-1234567-8',
    status: 'Active'
  },
  {
    id: 'SUP-003',
    name: 'CV TBS Jaya',
    phone: '0811-9876-5432',
    address: 'Kec. Tapung Hilir, Kampar, Riau',
    bankName: 'BNI',
    bankAccountNumber: '089-123456-7',
    status: 'Active'
  },
  {
    id: 'SUP-004',
    name: 'Haji Rahmat Saputra',
    phone: '0852-6633-1122',
    address: 'Ujung Batu, Rokan Hulu, Riau',
    bankName: 'BSI',
    bankAccountNumber: '711-2345-678',
    status: 'Active'
  },
  {
    id: 'SUP-005',
    name: 'Kelompok Tani Sawit Harapan (Non-Aktif)',
    phone: '0812-3344-5566',
    address: 'Desa Rimbo Bujang, Tebo, Jambi',
    bankName: 'BRI',
    bankAccountNumber: '0155-01-998877-50-2',
    status: 'Inactive'
  }
];

export const initialFarmers: Farmer[] = [
  {
    id: 'FRM-001',
    name: 'Sutrisno',
    plantationLocation: 'Kavling 12 Desa Suka Maju',
    areaSize: 4.5,
    relatedSupplierId: 'SUP-002',
    phone: '0812-6677-8899',
    status: 'Active'
  },
  {
    id: 'FRM-002',
    name: 'Heri Kusuma',
    plantationLocation: 'Sektor B Tapung Hulu',
    areaSize: 8.0,
    relatedSupplierId: 'SUP-003',
    phone: '0813-4455-6677',
    status: 'Active'
  },
  {
    id: 'FRM-003',
    name: 'Supardi',
    plantationLocation: 'Dusun Makmur RT 04',
    areaSize: 2.0,
    relatedSupplierId: 'SUP-002',
    phone: '0852-7788-9900',
    status: 'Active'
  },
  {
    id: 'FRM-004',
    name: 'Sudirman',
    plantationLocation: 'Sp 4 Rimbo Jaya',
    areaSize: 12.5,
    relatedSupplierId: 'SUP-001',
    phone: '0821-1234-5678',
    status: 'Active'
  }
];

export const initialVehicles: Vehicle[] = [
  {
    id: 'BM 8123 TK',
    plateNumber: 'BM 8123 TK',
    vehicleType: 'Colt Diesel Canter',
    capacity: 8000,
    defaultDriverId: 'DRV-001',
    status: 'Active'
  },
  {
    id: 'BK 4412 SA',
    plateNumber: 'BK 4412 SA',
    vehicleType: 'Colt Diesel Ragasa',
    capacity: 7500,
    defaultDriverId: 'DRV-002',
    status: 'Active'
  },
  {
    id: 'BA 7099 JP',
    plateNumber: 'BA 7099 JP',
    vehicleType: 'Fuso Fighter',
    capacity: 15000,
    defaultDriverId: 'DRV-003',
    status: 'Active'
  },
  {
    id: 'BM 9012 AA',
    plateNumber: 'BM 9012 AA',
    vehicleType: 'L300 Pick-Up',
    capacity: 2500,
    defaultDriverId: 'DRV-004',
    status: 'Active'
  }
];

export const initialDrivers: Driver[] = [
  {
    id: 'DRV-001',
    name: 'Andi Saputra',
    phone: '0813-1122-3344',
    address: 'Pangkalan Kerinci, Riau',
    status: 'Active'
  },
  {
    id: 'DRV-002',
    name: 'Rudi Hartono',
    phone: '0812-4455-6677',
    address: 'Sorek, Pelalawan, Riau',
    status: 'Active'
  },
  {
    id: 'DRV-003',
    name: 'Joko Prasetyo',
    phone: '0853-9988-7766',
    address: 'Bangkinang, Kampar, Riau',
    status: 'Active'
  },
  {
    id: 'DRV-004',
    name: 'Mulyadi',
    phone: '0822-8877-6655',
    address: 'Ujung Batu, Riau',
    status: 'Active'
  }
];

export const initialMills: PalmOilMill[] = [
  {
    id: 'PKS-001',
    name: 'PKS Nusantara Sejahtera',
    companyName: 'PT Nusantara Agro Sawit',
    address: 'Kawasan Industri Siak, Desa Rawa Makmur, Siak',
    contactPerson: 'Pak Hendro (Manager Procurement)',
    phone: '0811-3322-1100',
    defaultSellingPrice: 2850,
    status: 'Active'
  },
  {
    id: 'PKS-002',
    name: 'PKS Agro Lestari',
    companyName: 'PT Agro Lestari Riau',
    address: 'Jl. Lintas Pekanbaru-Duri KM 72, Pinggir, Bengkalis',
    contactPerson: 'Ibu Desi (Timbangan & Kualitas PKS)',
    phone: '0812-5544-3322',
    defaultSellingPrice: 2900,
    status: 'Active'
  },
  {
    id: 'PKS-003',
    name: 'PKS Mitra Sawit',
    companyName: 'PT Mitra Sawit Indonesia',
    address: 'Kecamatan Tapung Hilir, Kampar, Riau',
    contactPerson: 'Pak Gunawan (Admin TBS)',
    phone: '0813-7766-5544',
    defaultSellingPrice: 2880,
    status: 'Active'
  }
];

export const initialEmployees: Employee[] = [
  {
    id: 'EMP-001',
    name: 'Rian Hidayat',
    role: 'Operator Timbangan',
    phone: '0812-9900-1122',
    address: 'Pangkalan Kerinci',
    status: 'Active'
  },
  {
    id: 'EMP-002',
    name: 'Siti Rahma',
    role: 'Kasir & Keuangan',
    phone: '0813-8899-0011',
    address: 'Desa Suka Maju',
    status: 'Active'
  },
  {
    id: 'EMP-003',
    name: 'Bambang Kusuma',
    role: 'Quality Checker / Sortasi',
    phone: '0852-7766-5544',
    address: 'Sorek',
    status: 'Active'
  }
];

export const initialUsers: User[] = [
  {
    id: 'USR-001',
    name: 'H. Suherman',
    email: 'owner@rampalm.com',
    role: 'Owner',
    phone: '0811-1234-567',
    status: 'Active'
  },
  {
    id: 'USR-002',
    name: 'Rahmat Effendi',
    email: 'manager@rampalm.com',
    role: 'Manager',
    phone: '0812-2345-678',
    status: 'Active'
  },
  {
    id: 'USR-003',
    name: 'Rian Hidayat',
    email: 'operator@rampalm.com',
    role: 'Operator',
    phone: '0812-9900-1122',
    status: 'Active'
  },
  {
    id: 'USR-004',
    name: 'Siti Rahma',
    email: 'cashier@rampalm.com',
    role: 'Cashier',
    phone: '0813-8899-0011',
    status: 'Active'
  },
  {
    id: 'USR-005',
    name: 'Bambang Kusuma',
    email: 'quality@rampalm.com',
    role: 'Quality Checker',
    phone: '0852-7766-5544',
    status: 'Active'
  },
  {
    id: 'USR-006',
    name: 'Admin Utama',
    email: 'admin@rampalm.com',
    role: 'Admin',
    phone: '0812-0000-1111',
    status: 'Active'
  }
];

export const initialPurchases: PurchaseTransaction[] = [
  {
    id: 'TRX-101',
    date: '2026-06-27T09:15:00Z',
    supplierId: 'SUP-001',
    farmerId: 'FRM-004',
    vehicleId: 'BM 8123 TK',
    driverId: 'DRV-001',
    grossWeight: 8450,
    tareWeight: 3250,
    netWeight: 5200,
    purchasePricePerKg: 2150,
    grossAmount: 11180000,
    deductionPercentage: 3.5,
    deductionAmount: 391300,
    otherDeduction: 50000, // Biaya bongkar
    finalAmount: 10738700,
    paymentStatus: 'Paid',
    transactionStatus: 'Completed',
    operatorName: 'Rian Hidayat',
    cashierName: 'Siti Rahma',
    qualityRecord: {
      ripePercent: 88,
      unripePercent: 4,
      overripePercent: 3,
      rottenPercent: 1,
      emptyBunchPercent: 2,
      dirtPercent: 2,
      moisturePercent: 1,
      looseFruitKg: 150,
      grade: 'A',
      deductionPercent: 3.5,
      notes: 'Buah cukup bagus, brondolan lumayan banyak.'
    }
  },
  {
    id: 'TRX-102',
    date: '2026-06-27T11:40:00Z',
    supplierId: 'SUP-002',
    farmerId: 'FRM-001',
    vehicleId: 'BK 4412 SA',
    driverId: 'DRV-002',
    grossWeight: 7800,
    tareWeight: 3100,
    netWeight: 4700,
    purchasePricePerKg: 2120,
    grossAmount: 9964000,
    deductionPercentage: 5.0,
    deductionAmount: 498200,
    otherDeduction: 0,
    finalAmount: 9465800,
    paymentStatus: 'Paid',
    transactionStatus: 'Completed',
    operatorName: 'Rian Hidayat',
    cashierName: 'Siti Rahma',
    qualityRecord: {
      ripePercent: 80,
      unripePercent: 10,
      overripePercent: 5,
      rottenPercent: 2,
      emptyBunchPercent: 1,
      dirtPercent: 2,
      moisturePercent: 2,
      looseFruitKg: 80,
      grade: 'B',
      deductionPercent: 5.0,
      notes: 'Banyak buah mentah dari kavling.'
    }
  },
  {
    id: 'TRX-103',
    date: '2026-06-28T08:30:00Z',
    supplierId: 'SUP-003',
    farmerId: 'FRM-002',
    vehicleId: 'BA 7099 JP',
    driverId: 'DRV-003',
    grossWeight: 14500,
    tareWeight: 4200,
    netWeight: 10300,
    purchasePricePerKg: 2180,
    grossAmount: 22454000,
    deductionPercentage: 4.0,
    deductionAmount: 898160,
    otherDeduction: 100000, // Bongkar fuso
    finalAmount: 21455840,
    paymentStatus: 'Unpaid',
    transactionStatus: 'Completed',
    operatorName: 'Rian Hidayat',
    qualityRecord: {
      ripePercent: 85,
      unripePercent: 5,
      overripePercent: 4,
      rottenPercent: 1,
      emptyBunchPercent: 3,
      dirtPercent: 2,
      moisturePercent: 1,
      looseFruitKg: 350,
      grade: 'A',
      deductionPercent: 4.0,
      notes: 'Volume besar. Ada sedikit tandan kosong.'
    }
  },
  {
    id: 'TRX-104',
    date: '2026-06-28T09:45:00Z',
    supplierId: 'SUP-001',
    farmerId: 'FRM-004',
    vehicleId: 'BM 9012 AA',
    driverId: 'DRV-004',
    grossWeight: 4800,
    tareWeight: 2100,
    netWeight: 2700,
    purchasePricePerKg: 2150,
    grossAmount: 5805000,
    deductionPercentage: 2.0,
    deductionAmount: 116100,
    otherDeduction: 30000,
    finalAmount: 5658900,
    paymentStatus: 'Partially Paid',
    transactionStatus: 'Completed',
    operatorName: 'Rian Hidayat',
    cashierName: 'Siti Rahma',
    qualityRecord: {
      ripePercent: 92,
      unripePercent: 2,
      overripePercent: 2,
      rottenPercent: 0,
      emptyBunchPercent: 1,
      dirtPercent: 1,
      moisturePercent: 1,
      looseFruitKg: 110,
      grade: 'A',
      deductionPercent: 2.0,
      notes: 'Kualitas buah prima.'
    }
  },
  {
    id: 'TRX-105',
    date: '2026-06-28T10:15:00Z',
    supplierId: 'SUP-004',
    vehicleId: 'BM 8123 TK',
    driverId: 'DRV-001',
    grossWeight: 8200,
    tareWeight: 3250,
    netWeight: 4950,
    purchasePricePerKg: 2140,
    grossAmount: 10593000,
    deductionPercentage: 3.0,
    deductionAmount: 317790,
    otherDeduction: 50000,
    finalAmount: 10225210,
    paymentStatus: 'Unpaid',
    transactionStatus: 'Draft',
    operatorName: 'Rian Hidayat',
    qualityRecord: {
      ripePercent: 86,
      unripePercent: 4,
      overripePercent: 4,
      rottenPercent: 1,
      emptyBunchPercent: 2,
      dirtPercent: 3,
      moisturePercent: 1,
      looseFruitKg: 100,
      grade: 'A',
      deductionPercent: 3.0,
      notes: 'Menunggu tara kendaraaan.'
    }
  }
];

export const initialShipments: ShipmentRecord[] = [
  {
    id: 'SHP-201',
    date: '2026-06-27T14:30:00Z',
    millId: 'PKS-001',
    vehicleId: 'BA 7099 JP',
    driverId: 'DRV-003',
    shipmentWeight: 14800,
    sellingPricePerKg: 2850,
    revenue: 42180000,
    status: 'Received',
    deliveryNoteNumber: 'DN-262701',
    notes: 'Diterima utuh tanpa penalti berat di PKS Nusantara.'
  },
  {
    id: 'SHP-202',
    date: '2026-06-28T07:15:00Z',
    millId: 'PKS-002',
    vehicleId: 'BA 7099 JP',
    driverId: 'DRV-003',
    shipmentWeight: 12500,
    sellingPricePerKg: 2900,
    revenue: 36250000,
    status: 'Shipped',
    deliveryNoteNumber: 'DN-262801',
    notes: 'Truk sedang di jalan menuju Bengkalis.'
  },
  {
    id: 'SHP-203',
    date: '2026-06-28T11:00:00Z',
    millId: 'PKS-003',
    vehicleId: 'BM 8123 TK',
    driverId: 'DRV-001',
    shipmentWeight: 7500,
    sellingPricePerKg: 2880,
    revenue: 21600000,
    status: 'Draft',
    deliveryNoteNumber: 'DN-262802',
    notes: 'Sedang loading buah ke bak truk.'
  }
];

export const initialExpenses: ExpenseRecord[] = [
  {
    id: 'EXP-301',
    date: '2026-06-27T17:00:00Z',
    category: 'Salary',
    amount: 350000,
    notes: 'Uang harian buruh bongkar muat (3 orang)',
    recipientName: 'Ujang dkk'
  },
  {
    id: 'EXP-302',
    date: '2026-06-28T06:00:00Z',
    category: 'Fuel',
    amount: 450000,
    notes: 'Solar Truk BA 7099 JP kirim ke PKS Lestari',
    recipientName: 'Andi Saputra'
  },
  {
    id: 'EXP-303',
    date: '2026-06-28T09:00:00Z',
    category: 'Maintenance',
    amount: 250000,
    notes: 'Ganti oli timbangan portable & pelumasan sensor',
    recipientName: 'Teknisi Timbangan Mandiri'
  },
  {
    id: 'EXP-304',
    date: '2026-06-28T10:30:00Z',
    category: 'Office cost',
    amount: 120000,
    notes: 'Pembelian kertas struk timbang thermal & ATK kantor',
    recipientName: 'Toko ATK Abadi'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'AUD-001',
    userId: 'USR-003',
    userName: 'Rian Hidayat',
    role: 'Operator',
    action: 'CREATE_TRANSACTION',
    module: 'Pembelian TBS',
    newValue: 'Membuat transaksi TRX-103 supplier CV TBS Jaya, Bruto: 14.500 kg',
    timestamp: '2026-06-28T08:30:00Z',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'AUD-002',
    userId: 'USR-003',
    userName: 'Rian Hidayat',
    role: 'Operator',
    action: 'UPDATE_WEIGHING',
    module: 'Timbangan',
    oldValue: 'Gross: 14.500 kg',
    newValue: 'Tare: 4.200 kg, Netto Otomatis: 10.300 kg',
    timestamp: '2026-06-28T08:45:00Z',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'AUD-003',
    userId: 'USR-005',
    userName: 'Bambang Kusuma',
    role: 'Quality Checker',
    action: 'INPUT_SORTASI',
    module: 'Quality Check',
    newValue: 'Input grade A, potongan 4.0% untuk TRX-103',
    timestamp: '2026-06-28T08:55:00Z',
    ipAddress: '192.168.1.105'
  },
  {
    id: 'AUD-004',
    userId: 'USR-004',
    userName: 'Siti Rahma',
    role: 'Cashier',
    action: 'PAYMENT_PARTIAL',
    module: 'Finance & Pembayaran',
    oldValue: 'Belum Dibayar (Rp 5.658.900)',
    newValue: 'Bayar Sebagian (Rp 3.000.000) untuk TRX-104',
    timestamp: '2026-06-28T09:45:00Z',
    ipAddress: '192.168.1.103'
  },
  {
    id: 'AUD-005',
    userId: 'USR-002',
    userName: 'Rahmat Effendi',
    role: 'Manager',
    action: 'CREATE_SHIPMENT',
    module: 'Shipment ke PKS',
    newValue: 'Membuat DO baru SHP-203 ke PKS Mitra Sawit, Target: 7.500 kg',
    timestamp: '2026-06-28T11:00:00Z',
    ipAddress: '192.168.1.101'
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'NOT-001',
    type: 'Pending_Payment',
    title: 'Pembayaran Belum Lunas',
    message: 'Transaksi TRX-103 CV TBS Jaya sebesar Rp 21.455.840 membutuhkan pelunasan kasir.',
    timestamp: '2026-06-28T08:55:00Z',
    isRead: false
  },
  {
    id: 'NOT-002',
    type: 'Low_Stock',
    title: 'Stok RAM Menipis',
    message: 'Stok TBS saat ini hanya tinggal 1.350 kg. Dibutuhkan pembelian lebih lanjut untuk memenuhi target kirim ke PKS Lestari.',
    timestamp: '2026-06-28T07:30:00Z',
    isRead: false
  },
  {
    id: 'NOT-003',
    type: 'Shipment_Ready',
    title: 'Truk Siap Berangkat',
    message: 'Shipment SHP-202 dengan supir Joko Prasetyo telah selesai dimuat dan siap diberangkatkan.',
    timestamp: '2026-06-28T07:15:00Z',
    isRead: true
  },
  {
    id: 'NOT-004',
    type: 'Cancelled_Transaction',
    title: 'Transaksi Draft Dihapus',
    message: 'Transaksi pembelian manual dengan nomor draft TRX-100 dibatalkan oleh Operator Rian Hidayat.',
    timestamp: '2026-06-27T16:45:00Z',
    isRead: true
  }
];
