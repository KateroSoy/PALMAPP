/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Coins,
  Scale,
  ClipboardList,
  Truck,
  Wallet,
  BarChart3,
  Database,
  Shield,
  History,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  User,
  Activity,
  UserCheck,
  Zap,
  Plus,
  PlusCircle,
  Keyboard,
  Info,
  X,
  Sparkles
} from 'lucide-react';

// Import sub-views
import DashboardOverview from './dashboard/DashboardOverview';
import Dashboard from './dashboard/Dashboard';
import PurchasesView from './dashboard/PurchasesView';
import WeighingView from './dashboard/WeighingView';
import QualityView from './dashboard/QualityView';
import ShipmentsView from './dashboard/ShipmentsView';
import FinanceView from './dashboard/FinanceView';
import ReportsView from './dashboard/ReportsView';
import MasterDataView from './dashboard/MasterDataView';
import UserManagementView from './dashboard/UserManagementView';
import AuditLogView from './dashboard/AuditLogView';
import NotificationsView from './dashboard/NotificationsView';
import SettingsView from './dashboard/SettingsView';
import InventoryView from './dashboard/InventoryView';
import OnboardingTour from './dashboard/OnboardingTour';
import MarketIntelligenceView from './dashboard/MarketIntelligenceView';

// Import Mock Initial Data
import {
  initialPurchases,
  initialShipments,
  initialSuppliers,
  initialFarmers,
  initialVehicles,
  initialDrivers,
  initialMills,
  initialExpenses,
  initialEmployees
} from '../data/mockData';

import { PurchaseTransaction, ShipmentRecord, Supplier, Farmer, Vehicle, Driver, PalmOilMill, ExpenseRecord, Employee, QualityRecord, User as AuthUser } from '../types';

interface AppShellProps {
  onLogout: () => void;
}

export default function AppShell({ onLogout }: AppShellProps) {
  // Shared States (Seeded with realistic data and persisted in LocalStorage)
  const [purchases, setPurchases] = useState<PurchaseTransaction[]>(() => {
    const cached = localStorage.getItem('rampalm_purchases');
    return cached ? JSON.parse(cached) : initialPurchases;
  });
  const [shipments, setShipments] = useState<ShipmentRecord[]>(initialShipments);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [farmers, setFarmers] = useState<Farmer[]>(initialFarmers);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [mills, setMills] = useState<PalmOilMill[]>(initialMills);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(initialExpenses);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);

  // Network Offline Connection Manager (intermittent connectivity support)
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [offlineQueue, setOfflineQueue] = useState<PurchaseTransaction[]>(() => {
    const cached = localStorage.getItem('rampalm_offline_queue');
    return cached ? JSON.parse(cached) : [];
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Sync purchases state with LocalStorage
  useEffect(() => {
    localStorage.setItem('rampalm_purchases', JSON.stringify(purchases));
  }, [purchases]);

  // Sync offline queue with LocalStorage
  useEffect(() => {
    localStorage.setItem('rampalm_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Listen to browser network changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerToast('Koneksi internet terdeteksi! Memulai sinkronisasi otomatis...', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      triggerToast('Koneksi internet terputus! Beralih ke Mode Offline Lokal.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Background cloud synchronization queue when connection goes online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0 && !isSyncing) {
      setIsSyncing(true);
      triggerToast(`Menyinkronkan ${offlineQueue.length} transaksi tertunda ke server cloud...`, 'info');
      
      const timer = setTimeout(() => {
        // Mark all offline transactions in purchases state as synced (remove isOfflinePending flag)
        setPurchases(prev => prev.map(p => {
          if (p.isOfflinePending) {
            return { ...p, isOfflinePending: false };
          }
          return p;
        }));
        
        setOfflineQueue([]);
        setIsSyncing(false);
        triggerToast('Semua transaksi offline berhasil disinkronisasi dengan server!', 'success');
      }, 3000); // realistic sync lag

      return () => clearTimeout(timer);
    }
  }, [isOnline, offlineQueue.length, isSyncing]);

  // Active View Tab State
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Custom Toast Notifications State
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'warning' | 'info' }[]>([]);

  const triggerToast = (message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Quick Action Trigger States
  const [triggerPurchaseForm, setTriggerPurchaseForm] = useState(false);
  const [triggerSupplierForm, setTriggerSupplierForm] = useState(false);
  const [triggerWeighingSelect, setTriggerWeighingSelect] = useState(false);
  const [showQuickActionMenu, setShowQuickActionMenu] = useState(false);

  // Role Switching State for Live UX Demo
  const [currentUserRole, setCurrentUserRole] = useState<'Owner' | 'Kasir' | 'Operator' | 'Checker'>('Owner');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showShortcutGuide, setShowShortcutGuide] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Auto-trigger onboarding tour for first-time visitors
  useEffect(() => {
    const completed = localStorage.getItem('rampalm_onboarding_completed');
    if (!completed) {
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Global Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering shortcuts if user is currently typing in an input field
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT' ||
        activeEl.getAttribute('contenteditable') === 'true'
      )) {
        if (e.key === 'Escape') {
          (activeEl as HTMLElement).blur();
        }
        return;
      }

      const isMac = navigator.userAgent.indexOf('Mac') !== -1;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const altKey = e.altKey;
      const key = e.key.toLowerCase();

      // Ctrl+N or Alt+N -> New Purchase Transaction
      if ((cmdOrCtrl && key === 'n') || (altKey && key === 'n')) {
        e.preventDefault();
        const roleHasAccess = ['Owner', 'Kasir'].includes(currentUserRole);
        if (roleHasAccess) {
          setActiveTab('purchases');
          setTriggerPurchaseForm(true);
          triggerToast('Membuka Formulir Pembelian TBS Baru (Shortcut)', 'success');
        } else {
          triggerToast(`Peran "${currentUserRole}" tidak diizinkan membuat transaksi baru.`, 'warning');
        }
      }

      // Ctrl+W or Alt+W -> Weighing module
      if ((cmdOrCtrl && key === 'w') || (altKey && key === 'w')) {
        e.preventDefault();
        const roleHasAccess = ['Owner', 'Operator'].includes(currentUserRole);
        if (roleHasAccess) {
          setActiveTab('weighing');
          triggerToast('Membuka Modul Timbangan (Shortcut)', 'info');
        } else {
          triggerToast(`Peran "${currentUserRole}" tidak memiliki akses timbangan.`, 'warning');
        }
      }

      // Ctrl+Q or Alt+Q -> Quality module
      if ((cmdOrCtrl && key === 'q') || (altKey && key === 'q')) {
        e.preventDefault();
        const roleHasAccess = ['Owner', 'Checker'].includes(currentUserRole);
        if (roleHasAccess) {
          setActiveTab('quality');
          triggerToast('Membuka Modul Kualitas / Sortasi (Shortcut)', 'info');
        } else {
          triggerToast(`Peran "${currentUserRole}" tidak memiliki akses kualitas / sortasi.`, 'warning');
        }
      }

      // Ctrl+H or Alt+H -> Home / Overview
      if ((cmdOrCtrl && key === 'h') || (altKey && key === 'h')) {
        e.preventDefault();
        setActiveTab('overview');
        triggerToast('Membuka Dashboard Utama (Shortcut)', 'info');
      }

      // Ctrl+K or Alt+K -> Toggle Shortcuts Guide
      if ((cmdOrCtrl && key === 'k') || (altKey && key === 'k')) {
        e.preventDefault();
        setShowShortcutGuide(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentUserRole]);

  // Construct current user object
  const currentUserObj: AuthUser = {
    id: currentUserRole === 'Owner' ? 'EMP-001' :
        currentUserRole === 'Kasir' ? 'EMP-002' :
        currentUserRole === 'Operator' ? 'EMP-003' : 'EMP-004',
    name: currentUserRole === 'Owner' ? 'H. Suherman' :
          currentUserRole === 'Kasir' ? 'Siti Rahma' :
          currentUserRole === 'Operator' ? 'Budi Santoso' : 'Pandi Sutarman',
    email: `${currentUserRole.toLowerCase()}@rampalmos.com`,
    role: currentUserRole === 'Owner' ? 'Owner' :
          currentUserRole === 'Kasir' ? 'Cashier' :
          currentUserRole === 'Operator' ? 'Operator' : 'Quality Checker',
    phone: '0812-7654-3210',
    status: 'Active'
  };

  // Dynamic FFB stockpile calculation:
  // FFB bought (Netto for completed) minus FFB shipped (shipped or received status)
  const totalFfbBought = purchases
    .filter(p => p.transactionStatus === 'Completed' && p.netWeight > 0)
    .reduce((sum, curr) => sum + curr.netWeight, 0);

  const totalFfbShipped = shipments
    .filter(s => s.status === 'Shipped' || s.status === 'Received')
    .reduce((sum, curr) => sum + curr.shipmentWeight, 0);

  // Safe stock calculation
  const currentStock = Math.max(0, totalFfbBought - totalFfbShipped);

  // CRUD handlers passed to subviews to keep state alive
  const handleAddPurchase = (newTrx: PurchaseTransaction) => {
    if (!isOnline) {
      const offlineTrx = { ...newTrx, isOfflinePending: true };
      setOfflineQueue(prev => [...prev, offlineTrx]);
      setPurchases([offlineTrx, ...purchases]);
      triggerToast('Transaksi disimpan lokal (Offline Mode). Akan disinkronkan saat terhubung kembali!', 'warning');
    } else {
      setPurchases([newTrx, ...purchases]);
    }
  };

  const handleCancelPurchase = (trxId: string, reason: string) => {
    setPurchases(purchases.map(p => p.id === trxId ? { ...p, transactionStatus: 'Cancelled' as const } : p));
  };

  const handleCompleteTara = (trxId: string, tareWeight: number) => {
    setPurchases(purchases.map(p => {
      if (p.id === trxId) {
        const netWeight = Math.max(0, p.grossWeight - tareWeight);
        // calculate values
        const gradingDeduction = p.qualityRecord ? (p.qualityRecord.deductionPercent / 100) * netWeight : 0.02 * netWeight; // 2% default or actual
        const finalWeight = Math.max(0, netWeight - gradingDeduction);
        const finalAmount = Math.round(finalWeight * p.purchasePricePerKg);
        const updatedTrx = {
          ...p,
          tareWeight,
          netWeight,
          deductionAmount: Math.round(gradingDeduction * p.purchasePricePerKg),
          finalAmount,
          transactionStatus: 'Completed' as const,
          isOfflinePending: !isOnline ? true : p.isOfflinePending
        };
        if (!isOnline) {
          setOfflineQueue(prev => {
            const exists = prev.some(item => item.id === trxId);
            if (exists) {
              return prev.map(item => item.id === trxId ? updatedTrx : item);
            }
            return [...prev, updatedTrx];
          });
          triggerToast('Bobot Tara diperbarui & disimpan lokal secara offline!', 'warning');
        }
        return updatedTrx;
      }
      return p;
    }));
  };

  const handleUpdateQuality = (trxId: string, record: QualityRecord) => {
    setPurchases(purchases.map(p => {
      if (p.id === trxId) {
        // Recalculate if Tare already exists
        const deductionPercent = record.deductionPercent;
        if (p.tareWeight > 0) {
          const netWeight = p.grossWeight - p.tareWeight;
          const gradingDeduction = (deductionPercent / 100) * netWeight;
          const finalWeight = Math.max(0, netWeight - gradingDeduction);
          const finalAmount = Math.round(finalWeight * p.purchasePricePerKg);
          return {
            ...p,
            qualityRecord: record,
            deductionAmount: Math.round(gradingDeduction * p.purchasePricePerKg),
            finalAmount
          };
        } else {
          return {
            ...p,
            qualityRecord: record
          };
        }
      }
      return p;
    }));
  };

  const handleAddShipment = (shp: ShipmentRecord) => {
    setShipments([shp, ...shipments]);
  };

  const handleUpdateShipmentStatus = (shpId: string, status: 'Draft' | 'Shipped' | 'Received' | 'Cancelled') => {
    setShipments(shipments.map(s => s.id === shpId ? { ...s, status } : s));
  };

  const handleAddExpense = (exp: ExpenseRecord) => {
    setExpenses([exp, ...expenses]);
  };

  const handleSettlePayment = (trxId: string, status: 'Partially Paid' | 'Paid') => {
    setPurchases(purchases.map(p => p.id === trxId ? { ...p, paymentStatus: status } : p));
  };

  // Define sidebar menu tabs filtered by Role-based accessibility
  const allTabs = [
    { key: 'overview', label: 'Dashboard', icon: LayoutDashboard, roles: ['Owner', 'Kasir', 'Operator', 'Checker'] },
    { key: 'purchases', label: 'Purchases', icon: Coins, roles: ['Owner', 'Kasir'] },
    { key: 'weighing', label: 'Weighing', icon: Scale, roles: ['Owner', 'Operator'] },
    { key: 'quality', label: 'Quality Check', icon: ClipboardList, roles: ['Owner', 'Checker'] },
    { key: 'inventory', label: 'Inventory', icon: Database, roles: ['Owner', 'Kasir', 'Operator', 'Checker'] },
    { key: 'shipments', label: 'Shipments', icon: Truck, roles: ['Owner'] },
    { key: 'finance', label: 'Finance', icon: Wallet, roles: ['Owner', 'Kasir'] },
    { key: 'reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['Owner', 'Kasir'] },
    { key: 'market', label: 'AI Price Predictor', icon: Sparkles, roles: ['Owner', 'Kasir'] },
    { key: 'master', label: 'Master Data', icon: Database, roles: ['Owner', 'Kasir'] },
    { key: 'users', label: 'User Management', icon: Shield, roles: ['Owner'] },
    { key: 'logs', label: 'Audit Trail Logs', icon: History, roles: ['Owner'] },
    { key: 'notifications', label: 'Notifications', icon: Bell, roles: ['Owner', 'Kasir', 'Operator', 'Checker'] },
    { key: 'settings', label: 'Settings', icon: Settings, roles: ['Owner'] }
  ];

  const visibleTabs = allTabs.filter(t => t.roles.includes(currentUserRole));

  // Render the selected sub-view
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Dashboard
            purchases={purchases}
            shipments={shipments}
            suppliers={suppliers}
            expenses={expenses}
            currentStock={currentStock}
            currentUser={currentUserObj}
            isOnline={isOnline}
            onPayTransaction={(id) => handleSettlePayment(id, 'Paid')}
            onTriggerToast={triggerToast}
            onNavigate={(tab) => {
              // Ensure role has access to the destination tab
              const destTab = allTabs.find(t => t.key === tab);
              if (destTab && destTab.roles.includes(currentUserRole)) {
                setActiveTab(tab);
              } else {
                alert(`Peran "${currentUserRole}" tidak memiliki hak akses untuk membuka modul ini.`);
              }
            }}
          />
        );
      case 'purchases':
        return (
          <PurchasesView
            purchases={purchases}
            suppliers={suppliers}
            vehicles={vehicles}
            drivers={drivers}
            farmers={farmers}
            currentUser={currentUserObj}
            onAddPurchase={handleAddPurchase}
            onCancelPurchase={handleCancelPurchase}
            autoOpenForm={triggerPurchaseForm}
            onFormClose={() => setTriggerPurchaseForm(false)}
          />
        );
      case 'weighing':
        return (
          <WeighingView
            purchases={purchases}
            vehicles={vehicles}
            drivers={drivers}
            onCompleteTara={handleCompleteTara}
            autoSelectFirst={triggerWeighingSelect}
            onFormClose={() => setTriggerWeighingSelect(false)}
          />
        );
      case 'quality':
        return (
          <QualityView
            purchases={purchases}
            onUpdateQuality={handleUpdateQuality}
          />
        );
      case 'inventory':
        return (
          <InventoryView
            purchases={purchases}
            shipments={shipments}
            currentStock={currentStock}
          />
        );
      case 'shipments':
        return (
          <ShipmentsView
            shipments={shipments}
            mills={mills}
            vehicles={vehicles}
            drivers={drivers}
            currentStock={currentStock}
            onAddShipment={handleAddShipment}
            onUpdateShipmentStatus={handleUpdateShipmentStatus}
          />
        );
      case 'finance':
        return (
          <FinanceView
            purchases={purchases}
            suppliers={suppliers}
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onSettlePayment={handleSettlePayment}
          />
        );
      case 'reports':
        return (
          <ReportsView
            purchases={purchases}
            shipments={shipments}
            suppliers={suppliers}
            mills={mills}
          />
        );
      case 'market':
        return (
          <MarketIntelligenceView
            purchases={purchases}
            isOnline={isOnline}
          />
        );
      case 'master':
        return (
          <MasterDataView
            suppliers={suppliers}
            farmers={farmers}
            vehicles={vehicles}
            drivers={drivers}
            mills={mills}
            employees={employees}
            purchases={purchases}
            shipments={shipments}
            onAddSupplier={(record) => setSuppliers([...suppliers, record])}
            onUpdateSupplier={(record) => setSuppliers(suppliers.map(s => s.id === record.id ? record : s))}
            onDeleteSupplier={(id) => setSuppliers(suppliers.filter(s => s.id !== id))}
            onAddFarmer={(record) => setFarmers([...farmers, record])}
            onUpdateFarmer={(record) => setFarmers(farmers.map(f => f.id === record.id ? record : f))}
            onDeleteFarmer={(id) => setFarmers(farmers.filter(f => f.id !== id))}
            onAddVehicle={(record) => setVehicles([...vehicles, record])}
            onUpdateVehicle={(record) => setVehicles(vehicles.map(v => v.id === record.id ? record : v))}
            onDeleteVehicle={(id) => setVehicles(vehicles.filter(v => v.id !== id))}
            onAddDriver={(record) => setDrivers([...drivers, record])}
            onUpdateDriver={(record) => setDrivers(drivers.map(d => d.id === record.id ? record : d))}
            onDeleteDriver={(id) => setDrivers(drivers.filter(d => d.id !== id))}
            onAddMill={(record) => setMills([...mills, record])}
            onUpdateMill={(record) => setMills(mills.map(m => m.id === record.id ? record : m))}
            onDeleteMill={(id) => setMills(mills.filter(m => m.id !== id))}
            onAddEmployee={(record) => setEmployees([...employees, record])}
            onUpdateEmployee={(record) => setEmployees(employees.map(e => e.id === record.id ? record : e))}
            onDeleteEmployee={(id) => setEmployees(employees.filter(e => e.id !== id))}
            autoOpenForm={triggerSupplierForm ? 'supplier' : null}
            onFormClose={() => setTriggerSupplierForm(false)}
          />
        );
      case 'users':
        return <UserManagementView employees={employees} />;
      case 'logs':
        return <AuditLogView />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <Dashboard
            purchases={purchases}
            shipments={shipments}
            suppliers={suppliers}
            expenses={expenses}
            currentStock={currentStock}
            currentUser={currentUserObj}
            isOnline={isOnline}
            onPayTransaction={(id) => handleSettlePayment(id, 'Paid')}
            onTriggerToast={triggerToast}
            onNavigate={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF3] flex flex-col md:flex-row font-sans text-[#102018]">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#102018] text-white flex flex-col justify-between p-5 md:fixed md:top-0 md:bottom-0 md:left-0 z-20 border-r border-[#C6F24A]/10">
        <div className="space-y-6">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <div className="bg-[#C6F24A] text-[#123C2B] p-2 rounded-xl flex items-center justify-center font-black">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-black text-sm block tracking-tight">Rampalm OS</span>
              <span className="text-[10px] text-emerald-400 font-bold tracking-widest block font-mono">RAM_SAWIT_ERP</span>
            </div>
          </div>

          {/* User profile identifier (showing active selected switcher role) */}
          <div className="bg-[#152920] border border-white/5 rounded-xl p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-emerald-300 flex items-center justify-center font-black text-xs">
              {currentUserRole[0]}
            </div>
            <div>
              <span className="font-bold text-xs block text-white">
                {currentUserRole === 'Owner' ? 'H. Suherman' :
                 currentUserRole === 'Kasir' ? 'Siti Rahma' :
                 currentUserRole === 'Operator' ? 'Budi Santoso' : 'Pandi Sutarman'}
              </span>
              <span className="text-[9px] text-emerald-400 block font-mono uppercase">{currentUserRole}</span>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
            {visibleTabs.map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    isActive 
                      ? 'bg-[#C6F24A] text-[#123C2B] font-black shadow-md shadow-[#C6F24A]/5' 
                      : 'text-white/75 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#123C2B]' : 'text-emerald-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="pt-4 border-t border-white/10 space-y-3.5">
          <div className="text-[9px] text-white/40 leading-relaxed font-mono">
            <div>SISTEM: VERSI_1.2.0_PROD</div>
            <div>TERA LEVEL: VERIFIED</div>
          </div>
          <button
            onClick={onLogout}
            className="w-full bg-red-600/15 hover:bg-red-600 text-red-200 hover:text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Keluar Aplikasi
          </button>
        </div>
      </aside>

      {/* 2. MAIN APP CONTENT CONTAINER */}
      <div className="flex-1 md:pl-64 flex flex-col">
        {/* Top Header navbar with Role Switcher */}
        <header className="bg-white border-b border-[#E6EBDD] h-16 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          {/* Stock Pile Quick Stats */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-[#66736B] hidden sm:inline">Stok Loading Bay:</span>
            <span className="bg-[#F7FAF3] border border-[#E6EBDD] text-emerald-950 font-bold font-mono px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
              {currentStock.toLocaleString('id-ID')} kg TBS
            </span>
          </div>

          {/* Right Top section: Interactive demo user/role switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Action Floating Menu */}
            <div className="relative">
              <button
                onClick={() => setShowQuickActionMenu(!showQuickActionMenu)}
                className="bg-[#123C2B] hover:bg-[#1c4e3a] text-[#C6F24A] font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer z-30 relative"
              >
                <Zap className="w-3.5 h-3.5 fill-[#C6F24A]" />
                <span>Quick Action</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showQuickActionMenu && (
                <>
                  {/* Backdrop overlay for closing */}
                  <div 
                    className="fixed inset-0 z-20"
                    onClick={() => setShowQuickActionMenu(false)}
                  />
                  
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E6EBDD] rounded-2xl shadow-xl overflow-hidden z-30 py-2 animate-fadeIn text-xs text-left">
                    <div className="px-4 py-1.5 text-[10px] font-bold text-[#66736B]/80 uppercase tracking-widest border-b border-[#E6EBDD] mb-1">
                      Aksi Cepat (Quick Tasks)
                    </div>
                    
                    {/* Action 1: New Purchase Transaction */}
                    <button
                      onClick={() => {
                        setShowQuickActionMenu(false);
                        if (['Owner', 'Kasir'].includes(currentUserRole)) {
                          setTriggerPurchaseForm(true);
                          setActiveTab('purchases');
                        } else {
                          alert(`Peran "${currentUserRole}" tidak diizinkan membuat Transaksi Baru. Ganti peran ke Owner atau Kasir di Demo Role Switcher.`);
                        }
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F7FAF3] transition-colors flex items-center gap-3 font-semibold group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 group-hover:bg-[#C6F24A] text-emerald-800 group-hover:text-[#123C2B] flex items-center justify-center transition-all">
                        <PlusCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-[#102018]">New Transaction</div>
                        <div className="text-[10px] text-[#66736B] font-normal">Buat nota timbang bruto baru</div>
                      </div>
                      {!['Owner', 'Kasir'].includes(currentUserRole) && (
                        <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md font-mono" title="Requires Owner or Kasir role">🔒</span>
                      )}
                    </button>

                    {/* Action 2: Quick Weighing (Weighbridge Tara) */}
                    <button
                      onClick={() => {
                        setShowQuickActionMenu(false);
                        if (['Owner', 'Operator'].includes(currentUserRole)) {
                          setTriggerWeighingSelect(true);
                          setActiveTab('weighing');
                        } else {
                          alert(`Peran "${currentUserRole}" tidak diizinkan memproses Timbangan Tara. Ganti peran ke Owner atau Operator di Demo Role Switcher.`);
                        }
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F7FAF3] transition-colors flex items-center gap-3 font-semibold group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 group-hover:bg-[#C6F24A] text-emerald-800 group-hover:text-[#123C2B] flex items-center justify-center transition-all">
                        <Scale className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-[#102018]">Quick Weighing</div>
                        <div className="text-[10px] text-[#66736B] font-normal">Timbang tara kosong truk bongkar</div>
                      </div>
                      {!['Owner', 'Operator'].includes(currentUserRole) && (
                        <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md font-mono" title="Requires Owner or Operator role">🔒</span>
                      )}
                    </button>

                    {/* Action 3: Add Supplier */}
                    <button
                      onClick={() => {
                        setShowQuickActionMenu(false);
                        if (['Owner', 'Kasir'].includes(currentUserRole)) {
                          setTriggerSupplierForm(true);
                          setActiveTab('master');
                        } else {
                          alert(`Peran "${currentUserRole}" tidak diizinkan mengelola Master Data. Ganti peran ke Owner atau Kasir di Demo Role Switcher.`);
                        }
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F7FAF3] transition-colors flex items-center gap-3 font-semibold group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 group-hover:bg-[#C6F24A] text-emerald-800 group-hover:text-[#123C2B] flex items-center justify-center transition-all">
                        <Database className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-[#102018]">Add Supplier</div>
                        <div className="text-[10px] text-[#66736B] font-normal">Registrasi supplier agen sawit baru</div>
                      </div>
                      {!['Owner', 'Kasir'].includes(currentUserRole) && (
                        <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md font-mono" title="Requires Owner or Kasir role">🔒</span>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Onboarding Tour Trigger */}
            <button
              onClick={() => {
                setShowOnboarding(true);
                setActiveTab('overview');
                setTriggerPurchaseForm(false);
                setShowShortcutGuide(false);
              }}
              className="bg-emerald-50 hover:bg-[#C6F24A] hover:text-[#123C2B] border border-emerald-100 text-emerald-950 font-bold px-3 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Mulai Panduan Aplikasi (Interactive Tour)"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
              <span className="hidden sm:inline">Panduan Walkthrough</span>
            </button>

            {/* Interactive Network status indicator and toggle */}
            <button
              onClick={() => {
                const targetState = !isOnline;
                setIsOnline(targetState);
                if (targetState) {
                  triggerToast('Kembali Online! Memulai sinkronisasi otomatis...', 'success');
                } else {
                  triggerToast('Beralih ke mode Offline Intermiten lokal.', 'warning');
                }
              }}
              className={`border font-bold px-3 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
                isOnline 
                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100 text-emerald-950'
                  : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-950'
              }`}
              title={isOnline ? 'Internet Terkoneksi. Klik untuk simulasi Offline.' : 'Internet Terputus (Simulasi Offline). Klik untuk Kembali Online.'}
            >
              {isOnline ? (
                <>
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  <span>🌐 Online</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                  </span>
                  <span className="animate-pulse">📶 Offline (Ramp Remot)</span>
                  {offlineQueue.length > 0 && (
                    <span className="bg-amber-700 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full ml-1.5 border border-amber-500 animate-pulse">
                      {offlineQueue.length} Pending
                    </span>
                  )}
                </>
              )}
            </button>

            {/* Keyboard Shortcuts Help Trigger */}
            <button
              onClick={() => setShowShortcutGuide(true)}
              className="bg-white hover:bg-[#F7FAF3] border border-[#E6EBDD] text-emerald-950 font-bold p-2.5 rounded-xl text-xs flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Panduan Keyboard Shortcuts (Ctrl+K)"
            >
              <Keyboard className="w-4 h-4 text-emerald-800" />
            </button>

            <span className="text-[10px] text-[#66736B] uppercase font-bold tracking-wider hidden md:inline">Demo Role Switcher:</span>
            
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="bg-[#F7FAF3] hover:bg-[#E6EBDD]/50 border border-[#E6EBDD] text-emerald-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-800" />
                <span>Masuk Sebagai: {currentUserRole}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E6EBDD] rounded-2xl shadow-xl overflow-hidden z-30 py-1 text-xs">
                  {[
                    { key: 'Owner', desc: 'H. Suherman (Akses Penuh)' },
                    { key: 'Kasir', desc: 'Siti Rahma (Timbangan + Kasir)' },
                    { key: 'Operator', desc: 'Budi Santoso (Weighbridge)' },
                    { key: 'Checker', desc: 'Pandi Sutarman (Sortasi)' }
                  ].map(item => (
                    <button
                      key={item.key}
                      onClick={() => {
                        setCurrentUserRole(item.key as any);
                        // reset to overview to prevent accessing forbidden tab
                        setActiveTab('overview');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-[#F7FAF3] transition-colors font-semibold block ${
                        currentUserRole === item.key ? 'text-[#123C2B] bg-[#F7FAF3] font-black' : 'text-[#66736B]'
                      }`}
                    >
                      {item.desc}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Inner View Renderer */}
        <main className="p-5 md:p-8 flex-1">
          {renderContent()}
        </main>
      </div>

      {/* Real-time Toast Notifications Container */}
      <div className="fixed bottom-5 right-5 z-50 space-y-3 max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border text-xs font-bold transition-all duration-300 animate-slideIn ${
              t.type === 'success' 
                ? 'bg-[#123C2B] text-[#C6F24A] border-[#C6F24A]/20' 
                : t.type === 'warning' 
                  ? 'bg-amber-950 text-amber-300 border-amber-800' 
                  : 'bg-emerald-950 text-emerald-100 border-emerald-800'
            }`}
          >
            <span className="text-sm select-none">
              {t.type === 'success' ? '✅' : t.type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <div className="flex-1 leading-normal text-left">{t.message}</div>
            <button 
              onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))} 
              className="text-white/60 hover:text-white font-black ml-2 cursor-pointer focus:outline-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* KEYBOARD SHORTCUTS GUIDE MODAL */}
      {showShortcutGuide && (
        <div className="fixed inset-0 z-50 bg-[#102018]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#E6EBDD] shadow-2xl space-y-5 text-left animate-zoomIn">
            <div className="flex justify-between items-center border-b border-[#E6EBDD] pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-emerald-800 animate-pulse" />
                <h3 className="font-extrabold text-base text-emerald-950">Tombol Pintas (Keyboard Shortcuts)</h3>
              </div>
              <button
                onClick={() => setShowShortcutGuide(false)}
                className="text-[#66736B] hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-[#66736B] leading-relaxed">
                Gunakan pintasan keyboard berikut untuk meningkatkan kecepatan input timbangan di jam sibuk lalu lintas tinggi:
              </p>

              <div className="space-y-2.5">
                {[
                  { keys: ['Ctrl', 'N'], desc: 'Mulai Transaksi Timbang Baru (Bruto)', roles: 'Owner, Kasir' },
                  { keys: ['Ctrl', 'W'], desc: 'Buka Modul Timbangan (Tara Kosong)', roles: 'Owner, Operator' },
                  { keys: ['Ctrl', 'Q'], desc: 'Buka Modul Kualitas / Sortasi Grading', roles: 'Owner, Checker' },
                  { keys: ['Ctrl', 'H'], desc: 'Kembali ke Dashboard Utama', roles: 'Semua Peran' },
                  { keys: ['Ctrl', 'K'], desc: 'Buka / Tutup Panduan Pintasan Ini', roles: 'Semua Peran' },
                ].map((shortcut, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-[#E6EBDD] bg-[#F7FAF3] hover:bg-[#E6EBDD]/25 transition-colors">
                    <div className="space-y-0.5">
                      <span className="font-bold text-xs text-emerald-950 block">{shortcut.desc}</span>
                      <span className="text-[9px] text-[#66736B] font-mono block">Akses: {shortcut.roles}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((k, kIdx) => (
                        <span key={kIdx} className="flex items-center">
                          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-[10px] font-black font-mono shadow-xs text-gray-800">
                            {k}
                          </kbd>
                          {kIdx < shortcut.keys.length - 1 && <span className="text-gray-400 font-mono text-[10px] mx-0.5">+</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                <p className="text-[10px] text-emerald-900 leading-normal">
                  <span className="font-bold">Tips Operator:</span> Anda juga bisa menggunakan tombol <kbd className="px-1 bg-white border border-gray-300 rounded text-[9px] font-mono">Alt</kbd> sebagai pengganti <kbd className="px-1 bg-white border border-gray-300 rounded text-[9px] font-mono">Ctrl</kbd> jika tombol default browser berbenturan. Tekan <kbd className="px-1 bg-white border border-gray-300 rounded text-[9px] font-mono">Esc</kbd> untuk keluar dari input teks apa pun.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowShortcutGuide(false)}
              className="w-full bg-[#123C2B] hover:bg-[#1c4e3a] text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Mengerti & Lanjutkan Pekerjaan
            </button>
          </div>
        </div>
      )}

      {/* INTERACTIVE USER ONBOARDING TOUR */}
      {showOnboarding && (
        <OnboardingTour
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setTriggerPurchaseForm={setTriggerPurchaseForm}
          setShowShortcutGuide={setShowShortcutGuide}
          onComplete={() => {
            setShowOnboarding(false);
            localStorage.setItem('rampalm_onboarding_completed', 'true');
            triggerToast('Panduan walkthrough selesai! Selamat bekerja!', 'success');
          }}
        />
      )}

    </div>
  );
}
