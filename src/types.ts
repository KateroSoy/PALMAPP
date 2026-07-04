/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Owner' | 'Manager' | 'Operator' | 'Cashier' | 'Quality Checker' | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  status: 'Active' | 'Inactive';
}

export interface Supplier {
  id: string; // SUP-001 etc.
  name: string;
  phone: string;
  address: string;
  bankName: string;
  bankAccountNumber: string;
  status: 'Active' | 'Inactive';
}

export interface Farmer {
  id: string; // FRM-001 etc.
  name: string;
  plantationLocation: string;
  areaSize: number; // in hectares
  relatedSupplierId: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

export interface Vehicle {
  id: string; // Plate Number, e.g., BM 8123 TK
  plateNumber: string;
  vehicleType: string; // Colt Diesel, Fuso, Tronton, etc.
  capacity: number; // in kg
  defaultDriverId: string;
  status: 'Active' | 'Inactive';
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
}

export interface PalmOilMill {
  id: string; // PKS-001 etc.
  name: string;
  companyName: string;
  address: string;
  contactPerson: string;
  phone: string;
  defaultSellingPrice: number; // Rp per kg
  status: 'Active' | 'Inactive';
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
}

export interface QualityRecord {
  ripePercent: number; // Buah Matang
  unripePercent: number; // Buah Mentah
  overripePercent: number; // Buah Terlalu Matang
  rottenPercent: number; // Buah Busuk
  emptyBunchPercent: number; // Tandan Kosong
  dirtPercent: number; // Sampah / Tangkai Panjang
  moisturePercent: number; // Air
  looseFruitKg: number; // Brondolan (kg)
  grade: 'A' | 'B' | 'C' | 'Reject';
  deductionPercent: number; // Total potongan %
  notes?: string;
}

export interface PurchaseTransaction {
  id: string; // TRX-001 etc.
  date: string; // ISO date string
  supplierId: string;
  farmerId?: string;
  vehicleId: string;
  driverId: string;
  grossWeight: number; // Berat Kotor (kg)
  tareWeight: number; // Berat Kosong Kendaraan (kg)
  netWeight: number; // Berat Bersih (kg) = Gross - Tare
  purchasePricePerKg: number; // Harga Beli Rp/kg
  grossAmount: number; // Bruto Rp = Net * Price
  deductionPercentage: number; // Potongan Kualitas (%)
  deductionAmount: number; // Potongan Kualitas (Rp) = Gross * %
  otherDeduction: number; // Potongan Lainnya (Rp)
  finalAmount: number; // Netto Bayar (Rp) = GrossAmount - DeductionAmount - OtherDeduction
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid';
  transactionStatus: 'Draft' | 'Completed' | 'Cancelled';
  cancelReason?: string;
  operatorName: string;
  cashierName?: string;
  qualityRecord?: QualityRecord;
  isWeightAnomaly?: boolean;
  anomalyDeviation?: number;
  isOfflinePending?: boolean;
}

export interface ShipmentRecord {
  id: string; // SHP-001 etc.
  date: string;
  millId: string;
  vehicleId: string;
  driverId: string;
  shipmentWeight: number; // Tonase Kirim (kg)
  sellingPricePerKg: number; // Harga Jual ke PKS Rp/kg
  revenue: number; // Total Pendapatan = Weight * Price
  status: 'Draft' | 'Shipped' | 'Received' | 'Cancelled';
  deliveryNoteNumber: string;
  notes?: string;
}

export interface InventoryMovement {
  id: string;
  date: string;
  type: 'Purchase' | 'Shipment' | 'Adjustment_In' | 'Adjustment_Out' | 'Cancel_Reverse';
  referenceId: string; // TRX-001 or SHP-001 etc.
  quantity: number; // change in kg (positive or negative)
  resultingStock: number; // stock after this movement (kg)
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: 'Fuel' | 'Salary' | 'Maintenance' | 'Electricity' | 'Office cost' | 'Loading/unloading cost' | 'Transport cost' | 'Others';
  amount: number;
  notes: string;
  recipientName: string;
}

export interface FinanceRecord {
  id: string;
  date: string;
  type: 'Payment_Supplier' | 'Expense' | 'Revenue_Shipment';
  referenceId: string; // TRX-001, EXP-001, SHP-001 etc.
  amount: number; // positive for revenue, negative for payment/expense
  paymentMethod: 'Cash' | 'Transfer';
  notes: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  module: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
  ipAddress: string;
}

export interface NotificationItem {
  id: string;
  type: 'Pending_Payment' | 'Low_Stock' | 'Shipment_Ready' | 'Cancelled_Transaction' | 'Failed_Transaction' | 'Daily_Summary';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}
