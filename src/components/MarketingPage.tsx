/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Leaf,
  Scale,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Database,
  Truck,
  Wallet,
  Clock,
  ClipboardList,
  Users,
  Building,
  ArrowRight,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { formatRupiah, formatKg } from '../utils/calculations';

interface MarketingPageProps {
  onLoginClick: () => void;
  onDemoClick: (role?: string) => void;
}

export default function MarketingPage({ onLoginClick, onDemoClick }: MarketingPageProps) {
  // Profit Calculator State
  const [tbsMasuk, setTbsMasuk] = useState<number>(10000); // 10 ton
  const [hargaBeli, setHargaBeli] = useState<number>(2150);
  const [potonganPersen, setPotonganPersen] = useState<number>(4.0);
  const [tbsKirim, setTbsKirim] = useState<number>(9800);
  const [hargaJual, setHargaJual] = useState<number>(2850);
  const [biayaOperasional, setBiayaOperasional] = useState<number>(500000);

  // Live calculation values
  const nettoBeli = Math.max(0, tbsMasuk * (1 - potonganPersen / 100));
  const totalBayarSupplier = nettoBeli * hargaBeli;
  const revenueShipment = tbsKirim * hargaJual;
  const estimasiProfit = revenueShipment - totalBayarSupplier - biayaOperasional;
  const marginPersen = revenueShipment > 0 ? (estimasiProfit / revenueShipment) * 100 : 0;

  // FAQ state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'Apakah bisa dipakai tanpa tim IT khusus?',
      a: 'Sangat bisa! Rampalm OS adalah sistem berbasis cloud (SaaS) yang sudah siap pakai. Anda hanya perlu mendaftar, membuat akun untuk karyawan Anda, dan langsung bisa menggunakannya melalui web browser di HP, tablet, atau laptop tanpa instalasi rumit.'
    },
    {
      q: 'Apakah bisa mencetak nota pembelian untuk supir/petani?',
      a: 'Ya, sistem kami menyediakan fitur cetak nota timbang dan struk pembayaran instan dalam format mini-thermal yang ramah perangkat printer bluetooth maupun printer kantor biasa.'
    },
    {
      q: 'Bagaimana jika kami ingin memasukkan timbangan secara manual terlebih dahulu?',
      a: 'Sistem mendukung penuh penginputan berat Bruto dan Tara secara manual oleh operator timbang. Operator cukup mengetik angka timbangan fisik ke dalam form pembelian TBS.'
    },
    {
      q: 'Apakah sistem ini bisa diintegrasikan dengan timbangan digital fisik di masa depan?',
      a: 'Sangat bisa! Rampalm OS dirancang dengan API-ready yang siap disambungkan ke modul serial-to-ethernet/USB timbangan jembatan (weighbridge) Anda sehingga angka timbang bruto/tara bisa langsung terisi otomatis.'
    },
    {
      q: 'Apakah kami bisa mengekspor laporan keuangan & tonase ke Excel?',
      a: 'Ya, seluruh tabel transaksi harian, laporan bulanan, rincian supplier, data sortir kualitas, hingga rekap kas operasional dapat diunduh langsung dalam format Excel (.xlsx) atau PDF sekali klik.'
    },
    {
      q: 'Apakah data supplier, harga beli, dan rahasia profit kami aman?',
      a: 'Sangat aman. Data Anda disimpan di server terenkripsi dengan backup harian otomatis. Selain itu, Anda dapat membatasi hak akses (Role-Based Access Control) sehingga Operator atau Kasir tidak bisa melihat margin keuntungan dan total profit bulanan Anda.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F7FAF3] text-[#102018] font-sans">
      {/* 1. Navbar */}
      <nav id="navbar" className="sticky top-0 z-50 bg-[#123C2B]/90 backdrop-blur-md border-b border-[#E6EBDD]/10 text-white py-4 px-6 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-[#C6F24A] text-[#123C2B] p-2 rounded-xl flex items-center justify-center shadow-md">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight block leading-none">Rampalm<span className="text-[#C6F24A]">OS</span></span>
              <span className="text-[9px] uppercase tracking-wider text-[#C6F24A] font-semibold">RAM Management</span>
            </div>
          </div>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#fitur" className="hover:text-[#C6F24A] transition-colors">Produk & Fitur</a>
            <a href="#workflow" className="hover:text-[#C6F24A] transition-colors">Alur Kerja</a>
            <a href="#kalkulator" className="hover:text-[#C6F24A] transition-colors">Simulasi Profit</a>
            <a href="#roles" className="hover:text-[#C6F24A] transition-colors">Hak Akses</a>
            <a href="#harga" className="hover:text-[#C6F24A] transition-colors">Harga</a>
            <a href="#faq" className="hover:text-[#C6F24A] transition-colors">FAQ</a>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <button
              id="btn-nav-login"
              onClick={onLoginClick}
              className="px-4 py-2 text-sm font-semibold hover:text-[#C6F24A] transition-colors"
            >
              Masuk
            </button>
            <button
              id="btn-nav-demo"
              onClick={() => onDemoClick()}
              className="bg-[#C6F24A] text-[#123C2B] hover:bg-[#b5e03b] px-5 py-2 rounded-full text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              Coba Demo Instan
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section id="hero" className="relative pt-16 pb-24 md:pt-24 md:pb-32 px-6 overflow-hidden bg-gradient-to-b from-[#123C2B] to-[#1a503a] text-white">
        {/* Subtle mesh pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(198,242,74,0.4),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            <div className="inline-flex items-center gap-2 bg-[#1f6b4a]/50 border border-[#E6EBDD]/20 px-3 py-1.5 rounded-full text-xs font-semibold text-[#C6F24A] mb-6 w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              Satu Sistem Untuk Semua Kebutuhan RAM Sawit Anda
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
              Kelola RAM Kelapa Sawit dari Timbangan sampai <span className="text-[#C6F24A] underline decoration-wavy">Profit</span>.
            </h1>
            <p className="text-base md:text-lg text-[#E6EBDD]/90 leading-relaxed mb-8 max-w-2xl">
              Rampalm OS membantu pemilik RAM mencatat pembelian TBS, timbang kendaraan, cek kualitas, stok, pengiriman ke PKS, pembayaran supplier, biaya operasional, dan laporan profit secara cepat, akurat, dan transparan.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                id="btn-hero-demo"
                onClick={() => onDemoClick()}
                className="bg-[#C6F24A] text-[#123C2B] hover:bg-[#b5e03b] font-bold px-8 py-4 rounded-full text-center shadow-lg hover:shadow-[#C6F24A]/20 transition-all flex items-center justify-center gap-2 group"
              >
                Coba Demo Interaktif
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#fitur"
                className="border border-white/30 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-full text-center transition-all flex items-center justify-center"
              >
                Lihat Fitur Utama
              </a>
            </div>

            {/* Quick value props */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10 text-xs text-[#E6EBDD]/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C6F24A]" />
                <span>Netto otomatis & akurat</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C6F24A]" />
                <span>Stok Real-time</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#C6F24A]" />
                <span>Laporan profit instan</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#C6F24A]" />
                <span>Audit aman & terkontrol</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="relative bg-[#102018] rounded-3xl p-5 border border-white/10 shadow-2xl overflow-hidden">
              {/* Header inside mockup */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 text-xs text-[#66736B]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  <span className="ml-2 font-mono text-[10px] text-white/40">Rampalm OS - LIVE VIEW</span>
                </div>
                <span className="bg-[#123C2B] text-[#C6F24A] px-2 py-0.5 rounded-full font-bold">Demo Mode</span>
              </div>

              {/* Mockup Dashboard Content */}
              <div className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-[10px] text-white/50 block">TBS Dibeli Hari Ini</span>
                    <span className="text-sm font-bold text-white block">12.850 kg</span>
                    <span className="text-[9px] text-emerald-400 block mt-1">↑ 12% dari kemarin</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-[10px] text-white/50 block">Stok Saat Ini di RAM</span>
                    <span className="text-sm font-bold text-[#C6F24A] block">11.200 kg</span>
                    <span className="text-[9px] text-white/40 block mt-1">Sisa kapasitas: 88,8 ton</span>
                  </div>
                </div>

                <div className="bg-[#123C2B] rounded-xl p-4 border border-[#C6F24A]/10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-[#C6F24A]/80 font-semibold uppercase tracking-wider">Estimasi Profit Hari Ini</span>
                    <span className="bg-[#C6F24A]/20 text-[#C6F24A] text-[9px] px-1.5 py-0.5 rounded font-mono">LIVE REPORT</span>
                  </div>
                  <div className="text-xl font-black text-white">{formatRupiah(4850000)}</div>
                  <div className="flex justify-between text-[9px] text-white/60 mt-2 border-t border-white/10 pt-2">
                    <span>Bruto Beli: 12.850 kg</span>
                    <span>Kirim ke PKS: 14.800 kg</span>
                  </div>
                </div>

                {/* Micro chart preview */}
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-white/60">Tren Masuk TBS 5 Hari Terakhir</span>
                    <span className="text-[9px] text-white/40">Tonase (Ton)</span>
                  </div>
                  <div className="flex items-end justify-between h-14 pt-2 px-1">
                    {[3.2, 5.4, 4.8, 8.5, 12.85].map((val, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1 w-[15%]">
                        <div 
                          className="w-full rounded-t bg-gradient-to-t from-[#1F6B4A] to-[#C6F24A] transition-all" 
                          style={{ height: `${(val / 14) * 100}%` }}
                        ></div>
                        <span className="text-[8px] font-mono text-white/40">{val}t</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supplier pending payments */}
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-white/60 font-semibold">Timbangan TBS Terakhir</span>
                    <span className="text-[8px] text-yellow-500 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded">PENDING TARA</span>
                  </div>
                  <div className="text-[11px] space-y-2 font-mono">
                    <div className="flex justify-between text-white/80 border-b border-white/5 pb-1">
                      <span>BM 8123 TK - Budi S.</span>
                      <span className="text-white font-bold">Bruto: 8.200 kg</span>
                    </div>
                    <div className="flex justify-between text-white/40">
                      <span>Sortasi: Bambang K.</span>
                      <span className="text-yellow-400">Potongan: 3.0%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background accent glow inside mockup */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#C6F24A]/20 blur-3xl rounded-full"></div>
            </div>

            {/* Floating Info Pill 1 */}
            <div className="absolute -top-4 -left-6 bg-white text-[#102018] p-3 rounded-2xl shadow-lg border border-[#E6EBDD] flex items-center gap-3 animate-bounce">
              <div className="bg-emerald-100 p-2 rounded-xl text-emerald-700">
                <Scale className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[9px] text-[#66736B] block">Potongan Kualitas</span>
                <span className="text-xs font-bold font-mono">Auto Potong %</span>
              </div>
            </div>

            {/* Floating Info Pill 2 */}
            <div className="absolute -bottom-6 -right-4 bg-white text-[#102018] p-3 rounded-2xl shadow-lg border border-[#E6EBDD] flex items-center gap-3">
              <div className="bg-lime-100 p-2 rounded-xl text-lime-800">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[9px] text-[#66736B] block">Sisa Kas RAM</span>
                <span className="text-xs font-bold font-mono">{formatRupiah(84950000)}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Trust Section */}
      <section className="bg-white py-12 px-6 border-b border-[#E6EBDD]">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-[#66736B] font-bold mb-8">
            Dibuat untuk operasional RAM yang butuh cepat, rapi, dan minim selisih data
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
            <div className="flex items-center gap-1.5 font-bold text-lg text-emerald-950">
              <Building className="w-5 h-5 text-emerald-800" />
              RAM Mandiri Riau
            </div>
            <div className="flex items-center gap-1.5 font-bold text-lg text-emerald-950">
              <Leaf className="w-5 h-5 text-emerald-800" />
              TBS Jaya Abadi
            </div>
            <div className="flex items-center gap-1.5 font-bold text-lg text-emerald-950">
              <Scale className="w-5 h-5 text-emerald-800" />
              Sawit Berkah Kampar
            </div>
            <div className="flex items-center gap-1.5 font-bold text-lg text-emerald-950">
              <Building className="w-5 h-5 text-emerald-800" />
              PKS Partner Lestari
            </div>
            <div className="flex items-center gap-1.5 font-bold text-lg text-emerald-950">
              <Leaf className="w-5 h-5 text-emerald-800" />
              Koperasi Sawit Makmur
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pain Points Section */}
      <section className="py-20 px-6 bg-[#F7FAF3]">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-emerald-700 font-bold uppercase text-xs tracking-widest mb-3">MASALAH LAPANGAN</div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#102018] mb-4">
            Masalah RAM bukan hanya timbang. Masalahnya data yang tercecer.
          </h2>
          <p className="text-[#66736B] max-w-2xl mx-auto mb-16">
            Menjalankan RAM kelapa sawit membutuhkan kecepatan di jembatan timbang, tetapi pencatatan manual di kertas seringkali merugikan kasir, pemilik, dan menyebabkan selisih timbangan dengan Pabrik Kelapa Sawit (PKS).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {[
              {
                title: 'Catatan Manual Rawan Hilang',
                desc: 'Nota timbang robek, basah, atau terselip membuat rekapitulasi akhir bulan hancur dan rentan manipulasi data supir.'
              },
              {
                title: 'Hitung Netto & Potongan Sering Keliru',
                desc: 'Kasir lelah menghitung potongan bruto/tara secara manual menggunakan kalkulator, berisiko merugikan margin pembelian.'
              },
              {
                title: 'Stok Masuk & Keluar Tidak Sinkron',
                desc: 'Owner tidak tahu pasti berapa tonase TBS yang tertimbun di lapangan RAM harian sebelum diangkut fuso ke PKS.'
              },
              {
                title: 'Pembayaran Supplier Sulit Dilacak',
                desc: 'Kerap terjadi pembayaran ganda atau lupa bayar karena bon timbangan yang belum dibayar terpisah-pisah di laci meja.'
              },
              {
                title: 'Profit Harian Tidak Terlihat Jelas',
                desc: 'Butuh berhari-hari untuk menghitung margin keuntungan karena pengeluaran operasional (gaji, solar) terpisah dari data TBS.'
              },
              {
                title: 'Laporan Sangat Lama Dibuat',
                desc: 'Ketika owner membutuhkan data historis tonase supplier, operator harus membongkar ratusan tumpukan bon lama.'
              }
            ].map((p, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-[#E6EBDD] hover:border-emerald-300 shadow-sm transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 mb-4">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-[#102018] mb-2">{p.title}</h3>
                  <p className="text-sm text-[#66736B] leading-relaxed">{p.desc}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-[#E6EBDD] text-xs text-red-500 font-semibold uppercase tracking-wider">
                  Diatasi oleh Rampalm OS
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Features Section */}
      <section id="fitur" className="py-20 px-6 bg-white border-t border-b border-[#E6EBDD]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#1F6B4A] font-bold uppercase text-xs tracking-widest block mb-3">FITUR PLATFORM</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#102018]">
              Satu Platform untuk Seluruh Alur Bisnis RAM Anda
            </h2>
            <p className="text-[#66736B] mt-4">
              Semua alur mulai dari penimbangan truk masuk, sortir kualitas buah, kontrol stok di tempat, pengiriman ke PKS, pelunasan kas, hingga audit log karyawan terintegrasi rapi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Pembelian TBS Multi-Supplier',
                desc: 'Catat transaksi FFB langsung berelasi ke supplier terdaftar, kelompok tani, atau petani mandiri.',
                icon: <Leaf className="w-5 h-5 text-emerald-800" />,
                metric: 'Multi-Supplier'
              },
              {
                title: 'Timbang Bruto & Tara',
                desc: 'Input timbangan kendaraan saat masuk penuh dan saat pulang kosong. Netto terhitung instan.',
                icon: <Scale className="w-5 h-5 text-emerald-800" />,
                metric: 'Kalkulator Netto'
              },
              {
                title: 'Cek Kualitas & Sortasi',
                desc: 'Input persentase buah mentah, busuk, sampah, dan tangkai panjang untuk menghitung potongan harga otomatis.',
                icon: <ClipboardList className="w-5 h-5 text-emerald-800" />,
                metric: 'Deduction %'
              },
              {
                title: 'Real-time Inventory Stock',
                desc: 'Stok RAM otomatis bertambah dari pembelian dan berkurang ketika truk fuso melakukan pengiriman ke PKS.',
                icon: <Database className="w-5 h-5 text-emerald-800" />,
                metric: 'FIFO Ready'
              },
              {
                title: 'Shipment ke PKS & Harga Jual',
                desc: 'Pantau pengiriman tonase TBS yang dikirim ke berbagai PKS relasi dengan patokan harga jual harian.',
                icon: <Truck className="w-5 h-5 text-emerald-800" />,
                metric: 'Delivery Notes'
              },
              {
                title: 'Kasir & Pembayaran Cepat',
                desc: 'Pilihan bayar tunai (cash) langsung atau rekap transfer. Dilengkapi sistem cicilan/pembayaran parsial.',
                icon: <Wallet className="w-5 h-5 text-emerald-800" />,
                metric: 'Settle Cash/TF'
              },
              {
                title: 'Pencatatan Biaya Operasional',
                desc: 'Masukkan biaya harian seperti bensin supir, uang bongkar buruh, listrik, oli jembatan timbang.',
                icon: <DollarSign className="w-5 h-5 text-emerald-800" />,
                metric: 'Kategori Biaya'
              },
              {
                title: 'Laporan Profit Rugi Instan',
                desc: 'Ketahui laba kotor, bersih, dan margin operasional harian atau bulanan secara visual tanpa excel.',
                icon: <TrendingUp className="w-5 h-5 text-emerald-800" />,
                metric: 'Auto Margins'
              },
              {
                title: 'Audit Log Karyawan Mandiri',
                desc: 'Semua riwayat pengubahan data timbangan atau penghapusan transaksi dicatat lengkap demi mencegah kecurangan.',
                icon: <ShieldCheck className="w-5 h-5 text-emerald-800" />,
                metric: 'Read-Only Log'
              }
            ].map((f, idx) => (
              <div key={idx} className="bg-[#F7FAF3] rounded-2xl p-6 border border-[#E6EBDD] hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#C6F24A] text-[#123C2B] flex items-center justify-center font-bold">
                      {f.icon}
                    </div>
                    <span className="bg-emerald-800/10 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {f.metric}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-[#102018] mb-2">{f.title}</h3>
                  <p className="text-sm text-[#66736B] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Workflow Section */}
      <section id="workflow" className="py-20 px-6 bg-[#F7FAF3]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#1F6B4A] font-bold uppercase text-xs tracking-widest block mb-3">ALUR OPERASIONAL</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#102018]">
              Workflow Halus dari Supir Datang Sampai Profit Terhitung
            </h2>
            <p className="text-[#66736B] mt-4">
              Bagaimana Rampalm OS merevolusi operasional harian di jembatan timbang Anda secara bertahap.
            </p>
          </div>

          {/* Timeline steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { step: '01', title: 'Timbang Bruto', desc: 'Supir supplier datang, kendaraan bermuatan TBS ditimbang di jembatan timbang (Bruto).' },
              { step: '02', title: 'Sortasi & Bongkar', desc: 'Quality Checker menyortir persentase kematangan buah TBS, kemudian buah dibongkar di RAM.' },
              { step: '03', title: 'Timbang Tara', desc: 'Kendaraan yang sudah kosong ditimbang kembali (Tara). Sistem menghitung Netto otomatis.' },
              { step: '04', title: 'Kasir & Bayar', desc: 'Kasir langsung memproses slip pembayaran sesuai netto, harga beli, dan potongan kualitas.' },
              { step: '05', title: 'Kirim & Profit', desc: 'TBS dimuat ke fuso, dikirim ke PKS dengan harga jual. Owner melihat estimasi profit harian.' }
            ].map((s, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-[#E6EBDD] relative shadow-sm">
                <div className="text-4xl font-black text-[#C6F24A] absolute top-4 right-4">{s.step}</div>
                <div className="w-8 h-8 rounded-full bg-[#123C2B] text-white flex items-center justify-center text-xs font-bold mb-4">
                  {idx + 1}
                </div>
                <h3 className="font-bold text-base text-[#102018] mb-2">{s.title}</h3>
                <p className="text-xs text-[#66736B] leading-relaxed">{s.desc}</p>

                {/* Arrow connector for desktop */}
                {idx < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-20 text-[#1F6B4A]/40">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Profit Calculator Section */}
      <section id="kalkulator" className="py-20 px-6 bg-white border-t border-b border-[#E6EBDD]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[#1F6B4A] font-bold uppercase text-xs tracking-widest block mb-3">SIMULATOR BISNIS</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#102018]">
              Simulasi Profit RAM Kelapa Sawit
            </h2>
            <p className="text-sm text-[#66736B] mt-2">
              Geser nilai atau ketik untuk melihat bagaimana tonase, harga beli, potongan sortir, dan biaya operasional mempengaruhi laba harian Anda secara live.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Input fields */}
            <div className="lg:col-span-7 bg-[#F7FAF3] rounded-3xl p-6 md:p-8 border border-[#E6EBDD] space-y-6">
              <h3 className="font-bold text-lg text-[#102018] flex items-center gap-2 pb-4 border-b border-[#E6EBDD]">
                <Scale className="w-5 h-5 text-emerald-800" />
                Input Data Pembelian & Penjualan
              </h3>

              <div className="space-y-4">
                {/* Inputs Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#102018]/80 mb-1">
                      Berat Bruto TBS Masuk (kg)
                    </label>
                    <input
                      type="number"
                      value={tbsMasuk}
                      onChange={(e) => setTbsMasuk(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-white border border-[#E6EBDD] rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:border-[#1F6B4A]"
                    />
                    <span className="text-[10px] text-[#66736B] block mt-1">Sama dengan {tbsMasuk / 1000} Tonase kotor</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#102018]/80 mb-1">
                      Harga Beli TBS dari Petani (Rp/kg)
                    </label>
                    <input
                      type="number"
                      value={hargaBeli}
                      onChange={(e) => setHargaBeli(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-white border border-[#E6EBDD] rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:border-[#1F6B4A]"
                    />
                    <span className="text-[10px] text-[#66736B] block mt-1">Rata-rata saat ini: Rp 1.900 - Rp 2.300</span>
                  </div>
                </div>

                {/* Inputs Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#102018]/80 mb-1">
                      Rata-rata Potongan Kualitas (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="0.5"
                        value={potonganPersen}
                        onChange={(e) => setPotonganPersen(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-[#E6EBDD] rounded-lg appearance-none cursor-pointer accent-[#123C2B]"
                      />
                      <span className="font-mono text-xs font-bold w-12 text-right">{potonganPersen}%</span>
                    </div>
                    <span className="text-[10px] text-[#66736B] block mt-1">Potongan buah mentah/tangkai panjang</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#102018]/80 mb-1">
                      Biaya Operasional Harian (Rp)
                    </label>
                    <input
                      type="number"
                      value={biayaOperasional}
                      onChange={(e) => setBiayaOperasional(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-white border border-[#E6EBDD] rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:border-[#1F6B4A]"
                    />
                    <span className="text-[10px] text-[#66736B] block mt-1">Gaji buruh bongkar + solar + listrik</span>
                  </div>
                </div>

                {/* Inputs Row 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E6EBDD]/50">
                  <div>
                    <label className="block text-xs font-semibold text-[#102018]/80 mb-1">
                      Berat TBS Dikirim ke PKS (kg)
                    </label>
                    <input
                      type="number"
                      value={tbsKirim}
                      onChange={(e) => setTbsKirim(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-white border border-[#E6EBDD] rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:border-[#1F6B4A]"
                    />
                    <span className="text-[10px] text-[#66736B] block mt-1">Berat terhitung di jembatan timbang PKS</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#102018]/80 mb-1">
                      Harga Jual ke PKS (Rp/kg)
                    </label>
                    <input
                      type="number"
                      value={hargaJual}
                      onChange={(e) => setHargaJual(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-white border border-[#E6EBDD] rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:border-[#1F6B4A]"
                    />
                    <span className="text-[10px] text-[#66736B] block mt-1">Harga kontrak PKS: Rp 2.600 - Rp 3.000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results visual output */}
            <div className="lg:col-span-5 bg-[#123C2B] rounded-3xl p-6 md:p-8 text-white flex flex-col justify-between shadow-xl relative overflow-hidden border border-[#C6F24A]/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C6F24A]/10 blur-2xl rounded-full"></div>
              
              <div>
                <span className="text-xs uppercase tracking-widest text-[#C6F24A] font-bold block mb-1">HASIL KALKULASI</span>
                <h3 className="text-lg font-bold mb-6 text-[#E6EBDD]">Estimasi Keuntungan Bersih</h3>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-[#E6EBDD]/60 block">Netto Pembelian (setelah potongan sortir):</span>
                    <span className="text-sm font-bold font-mono">{formatKg(nettoBeli)} ({nettoBeli / 1000} ton)</span>
                  </div>

                  <div>
                    <span className="text-xs text-[#E6EBDD]/60 block">Total Pembayaran ke Supplier:</span>
                    <span className="text-sm font-bold font-mono text-red-300">{formatRupiah(totalBayarSupplier)}</span>
                  </div>

                  <div>
                    <span className="text-xs text-[#E6EBDD]/60 block">Pendapatan Pengiriman ke PKS:</span>
                    <span className="text-sm font-bold font-mono text-emerald-300">{formatRupiah(revenueShipment)}</span>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <span className="text-xs text-[#C6F24A] uppercase tracking-wider block mb-1 font-bold">Laba Bersih RAM</span>
                    <span className="text-3xl font-black text-white font-mono block leading-none">
                      {formatRupiah(estimasiProfit)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-[#C6F24A]/20 text-[#C6F24A] text-xs font-bold px-2 py-0.5 rounded-full mt-2">
                      Margin Keuntungan: {marginPersen.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10">
                <p className="text-[10px] text-[#E6EBDD]/60 leading-relaxed mb-4">
                  *Kalkulasi ini adalah simulasi berdasarkan model matematika standar. Rampalm OS membantu Anda memantau angka riil setiap hari berdasarkan slip timbangan asli yang divalidasi.
                </p>
                <button
                  onClick={() => onDemoClick()}
                  className="w-full bg-[#C6F24A] text-[#123C2B] hover:bg-[#b5e03b] py-3 rounded-xl text-center text-xs font-bold transition-all"
                >
                  Coba Input Transaksi Riil di Demo Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Role-Based Access Section */}
      <section id="roles" className="py-20 px-6 bg-[#F7FAF3]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#1F6B4A] font-bold uppercase text-xs tracking-widest block mb-3">KEAMANAN & KONTROL</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#102018]">
              Pembagian Tugas yang Jelas, Mencegah Kebocoran Kas
            </h2>
            <p className="text-[#66736B] mt-4">
              Kurangi risiko manipulasi timbangan oleh operator atau kesalahan kasir dengan role-based access control yang ketat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                role: 'Owner (Pemilik)',
                desc: 'Akses penuh ke semua modul. Dapat memantau profit, tonase, harga jual PKS, pengeluaran operasional secara real-time dari HP.',
                features: ['Dashboard Profitabilitas', 'Laporan Keuangan', 'Setting Harga Jual']
              },
              {
                role: 'Manager (Pengelola)',
                desc: 'Mengawasi aktivitas harian jembatan timbang, menyetujui (approve) koreksi timbangan, memantau laporan stock movement.',
                features: ['Persetujuan Koreksi', 'Laporan Tonase', 'Daftar Log Audit']
              },
              {
                role: 'Operator Timbangan',
                desc: 'Difokuskan pada kecepatan input. Hanya bisa menginput data truk masuk, plat nomor, berat bruto, dan timbang tara.',
                features: ['Input Bruto & Tara', 'Print Nota Timbang', 'Keyboard-Friendly Form']
              },
              {
                role: 'Cashier (Kasir)',
                desc: 'Akses pembayaran ke supplier/petani berdasarkan nota timbang tervalidasi. Mencatat biaya bensin supir, solar, dan operasional.',
                features: ['Pembayaran Parsial/Lunas', 'Catat Pengeluaran Kas', 'Rekap Bon Pending']
              },
              {
                role: 'Quality Checker (Sortir)',
                desc: 'Bertugas melakukan sampling TBS yang dibongkar. Menginput grade buah (A, B, C) serta persentase sampah dan buah mentah.',
                features: ['Grading Sortasi', 'Input Potongan Kualitas', 'Upload Foto Sortir']
              },
              {
                role: 'Admin Utama',
                desc: 'Mengelola database master supplier, daftar kendaraan, data supir, user login karyawan, backup database, dan cetak struk.',
                features: ['Registrasi Master Data', 'Manajemen Akun User', 'Backup Database Harian']
              }
            ].map((r, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-[#E6EBDD] hover:border-emerald-300 shadow-sm transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <Users className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-lg text-[#102018]">{r.role}</h3>
                  </div>
                  <p className="text-xs text-[#66736B] leading-relaxed mb-6">{r.desc}</p>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#102018]/50 uppercase tracking-widest mb-2">Fitur Utama Role:</div>
                  <div className="space-y-1">
                    {r.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-[#102018]/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C6F24A]"></span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Pricing Section */}
      <section id="harga" className="py-20 px-6 bg-white border-t border-b border-[#E6EBDD]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#1F6B4A] font-bold uppercase text-xs tracking-widest block mb-3">PAKET BERLANGGANAN</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#102018]">
              Investasi Cerdas untuk Bisnis yang Rapih
            </h2>
            <p className="text-[#66736B] mt-4">
              Pilih paket yang sesuai dengan kapasitas timbangan dan jumlah cabang RAM kelapa sawit Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Starter Plan */}
            <div className="bg-[#F7FAF3] rounded-3xl p-6 md:p-8 border border-[#E6EBDD] flex flex-col justify-between">
              <div>
                <span className="bg-emerald-800/10 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Starter RAM
                </span>
                <div className="mt-4 mb-2">
                  <span className="text-3xl font-extrabold text-[#102018]">Rp 1.500.000</span>
                  <span className="text-xs text-[#66736B] block">Setup awal di lokasi</span>
                </div>
                <p className="text-xs text-[#66736B] mb-6">
                  Cocok untuk pemilik RAM mandiri dengan kapasitas di bawah 15 ton per hari.
                </p>
                <div className="border-t border-[#E6EBDD] pt-6 space-y-3">
                  {[
                    'Untuk 1 lokasi RAM',
                    'Dashboard Timbangan dasar',
                    'Input Bruto & Tara manual',
                    'Manajemen Supplier',
                    'Cetak Struk Nota via USB'
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="text-[#16A34A] font-bold">✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onDemoClick('Operator')}
                className="w-full border border-[#123C2B] text-[#123C2B] hover:bg-[#123C2B] hover:text-white font-bold py-3 px-4 rounded-xl text-xs mt-8 transition-all"
              >
                Coba Demo Starter
              </button>
            </div>

            {/* Pro Plan (Most popular) */}
            <div className="bg-[#123C2B] rounded-3xl p-6 md:p-8 text-white flex flex-col justify-between border-2 border-[#C6F24A] shadow-xl relative scale-105">
              <div className="absolute top-4 right-4 bg-[#C6F24A] text-[#123C2B] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                Paling Populer
              </div>
              <div>
                <span className="bg-[#C6F24A]/20 text-[#C6F24A] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Pro RAM
                </span>
                <div className="mt-4 mb-2">
                  <span className="text-3xl font-extrabold text-white">Rp 3.500.000</span>
                  <span className="text-xs text-[#E6EBDD]/70 block">Setup awal lengkap</span>
                </div>
                <p className="text-xs text-[#E6EBDD]/80 mb-6">
                  Untuk bisnis RAM profesional yang membutuhkan audit keuangan dan laporan profit otomatis.
                </p>
                <div className="border-t border-white/10 pt-6 space-y-3">
                  {[
                    'Semua fitur Starter',
                    'Modul Keuangan & Pembayaran Kasir',
                    'Audit Log Aktivitas Karyawan',
                    'Laporan Profit Rugi Harian',
                    'Template Print Nota Kustom',
                    'Ekspor Laporan PDF & Excel'
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="text-[#C6F24A] font-bold">✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onDemoClick('Owner')}
                className="w-full bg-[#C6F24A] text-[#123C2B] hover:bg-[#b5e03b] font-bold py-3 px-4 rounded-xl text-xs mt-8 transition-all shadow-md"
              >
                Coba Demo Pro
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-[#F7FAF3] rounded-3xl p-6 md:p-8 border border-[#E6EBDD] flex flex-col justify-between">
              <div>
                <span className="bg-emerald-800/10 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Enterprise RAM
                </span>
                <div className="mt-4 mb-2">
                  <span className="text-3xl font-extrabold text-[#102018]">Custom / Nego</span>
                  <span className="text-xs text-[#66736B] block">Sesuai kebutuhan integrasi</span>
                </div>
                <p className="text-xs text-[#66736B] mb-6">
                  Solusi korporat untuk multi-cabang RAM atau integrasi otomatis jembatan timbang digital.
                </p>
                <div className="border-t border-[#E6EBDD] pt-6 space-y-3">
                  {[
                    'Multi-Cabang RAM (Multi-Branch)',
                    'Integrasi Hardware Timbangan Digital',
                    'Koneksi CCTV Jembatan Timbang',
                    'Backup Cloud Advanced',
                    'Prioritas Support Lapangan 24/7'
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="text-[#16A34A] font-bold">✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onDemoClick('Admin')}
                className="w-full border border-[#123C2B] text-[#123C2B] hover:bg-[#123C2B] hover:text-white font-bold py-3 px-4 rounded-xl text-xs mt-8 transition-all"
              >
                Hubungi Kami (Demo Admin)
              </button>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-xs text-[#66736B]">
              *Harga di atas dapat disesuaikan berdasarkan volume operasional bulanan Anda dan tingkat integrasi perangkat jembatan timbang fisik.
            </p>
          </div>
        </div>
      </section>

      {/* 10. Testimonials Section */}
      <section className="py-20 px-6 bg-[#F7FAF3]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#1F6B4A] font-bold uppercase text-xs tracking-widest block mb-3">TESTIMONIAL PELANGGAN</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#102018]">
              Dipercaya oleh Pemilik RAM Sawit di Sumatera & Kalimantan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: '“Sebelumnya laporan harian kami pakai Excel, operator pusing, kasir sering selisih ratusan ribu rupiah. Sekarang dengan Rampalm OS, stok real-time dan pembayaran supplier jauh lebih jelas.”',
                author: 'H. Junaidi',
                role: 'Pemilik RAM Mandiri (Kampar, Riau)'
              },
              {
                quote: '“Operator timbang saya sangat suka karena aplikasinya cepat dipelajari. Cukup ketik plat nomor, bruto, tara, sisa hitungan netto dan rupiah langsung terbit. Kerja timbang jadi 2 kali lebih cepat.”',
                author: 'Sutopo',
                role: 'Pengelola Timbangan TBS Suka Maju (Katingan, Kalteng)'
              },
              {
                quote: '“Sebagai owner yang jarang di lokasi RAM, saya sekarang bisa tenang memantau profit harian langsung dari handphone di kota. Kasir tidak bisa manipulasi lagi karena log auditnya rapi.”',
                author: 'Ibu Listiawati',
                role: 'Investor RAM Sawit Berkah (Sergai, Sumut)'
              }
            ].map((t, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-[#E6EBDD] flex flex-col justify-between shadow-sm">
                <p className="text-sm italic text-[#66736B] leading-relaxed mb-6">
                  {t.quote}
                </p>
                <div>
                  <h4 className="font-bold text-sm text-[#102018]">{t.author}</h4>
                  <p className="text-[11px] text-[#66736B]">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. FAQ Section */}
      <section id="faq" className="py-20 px-6 bg-white border-t border-[#E6EBDD]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#1F6B4A] font-bold uppercase text-xs tracking-widest block mb-3">FAQ</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#102018]">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-[#E6EBDD] rounded-2xl overflow-hidden transition-all">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-6 py-4 bg-[#F7FAF3] hover:bg-[#E6EBDD]/20 flex items-center justify-between transition-colors focus:outline-none"
                >
                  <span className="font-bold text-sm md:text-base text-[#102018]">
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-[#66736B] transform transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 py-4 bg-white text-xs md:text-sm text-[#66736B] leading-relaxed border-t border-[#E6EBDD]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Final CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-t from-[#102018] to-[#123C2B] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(198,242,74,0.3),transparent_60%)]"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <Scale className="w-12 h-12 text-[#C6F24A] mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Siapkan RAM Anda untuk Operasional Digital Bebas Selisih
          </h2>
          <p className="text-[#E6EBDD]/80 mb-8 text-sm md:text-base max-w-xl mx-auto">
            Hentikan pemborosan waktu karena hitungan manual dan rekap bon yang hilang. Kendalikan profit jembatan timbang Anda secara aman sekarang juga.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={() => onDemoClick()}
              className="bg-[#C6F24A] text-[#123C2B] hover:bg-[#b5e03b] font-bold px-8 py-4 rounded-xl shadow-lg transition-all"
            >
              Masuk ke Demo Dashboard
            </button>
            <button
              onClick={onLoginClick}
              className="border border-white/20 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-xl transition-all"
            >
              Log In Akun RAM Anda
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#102018] text-[#66736B] py-12 px-6 border-t border-white/5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-[#C6F24A] text-[#123C2B] p-1.5 rounded-lg flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm">Rampalm OS</span>
          </div>
          <p className="text-center md:text-right">
            © 2026 Rampalm OS. Semua Hak Cipta Dilindungi. Sistem Manajemen RAM Kelapa Sawit Berstandar Industri.
          </p>
        </div>
      </footer>
    </div>
  );
}
