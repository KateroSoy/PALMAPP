/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertCircle, 
  RefreshCw, 
  HelpCircle, 
  Send, 
  LineChart, 
  Briefcase, 
  Calendar, 
  Layers,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  ReferenceLine 
} from 'recharts';
import { PurchaseTransaction } from '../../types';
import { formatRupiah } from '../../utils/calculations';

interface MarketIntelligenceViewProps {
  purchases: PurchaseTransaction[];
  isOnline: boolean;
}

interface CompetitorData {
  id: string;
  name: string;
  distance: string;
  currentPrice: number;
  change: 'up' | 'down' | 'flat';
  changeVal: number;
}

export default function MarketIntelligenceView({ purchases, isOnline }: MarketIntelligenceViewProps) {
  // Region Selector
  const [selectedRegion, setSelectedRegion] = useState<'Riau' | 'Sumut' | 'Kaltim'>('Riau');
  // AI State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiReport, setAiReport] = useState<{
    marketSentiment: string;
    suggestedFfbBuyPrice: number;
    suggestedFfbSellPrice: number;
    recommendedMargin: number;
    strategicTactic: string;
    detailedAnalysis: string;
    forecast: { period: string; trend: 'BULLISH' | 'BEARISH' | 'STABLE'; desc: string }[];
  } | null>(null);

  // Chat/Analysis Log state
  const [marketAnalysisQuery, setMarketAnalysisQuery] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: 'Halo! Saya Asisten Analis Pasar Rampalm. Beritahu saya kendala harga atau pasokan TBS di daerah Anda, dan saya akan memberikan rekomendasi harga beli agar RAM Anda tetap kompetitif dan profit maksimal.',
      time: 'Baru saja'
    }
  ]);

  // Initial State Preset for fast demo / Offline
  const demoReport = {
    marketSentiment: 'Konsolidasi Positif (Bullish Lembut)',
    suggestedFfbBuyPrice: 2450,
    suggestedFfbSellPrice: 2780,
    recommendedMargin: 330,
    strategicTactic: 'Naikkan harga beli Rp20/kg untuk mengamankan pasokan TBS dari petani loyal menjelang curah hujan tinggi minggu depan.',
    detailedAnalysis: 'Indeks Crude Palm Oil (CPO) global terpantau menguat di level Rp12.800/kg. Hal ini didorong oleh peningkatan permintaan biodiesel domestik serta perlambatan produksi di beberapa sentra perkebunan akibat curah hujan yang tidak menentu. Di tingkat wilayah Riau, rata-rata kompetitor menetapkan harga Rp2.420 - Rp2.460/kg. Untuk menjaga loyalitas supplier, disarankan mematok harga beli stabil di Rp2.450/kg guna memikat volume TBS matang grade A.',
    forecast: [
      { period: 'Minggu Depan', trend: 'BULLISH' as const, desc: 'CPO diprediksi menguat seiring penurunan stok pelabuhan.' },
      { period: 'Bulan Depan', trend: 'STABLE' as const, desc: 'Pasokan TBS pulih perlahan, fluktuasi harga mereda.' },
      { period: 'Kuartal Depan', trend: 'BEARISH' as const, desc: 'Memasuki puncak panen raya, harga cenderung terkoreksi turun.' }
    ]
  };

  // Pre-seed default report on first render if empty
  if (!aiReport) {
    setAiReport(demoReport);
  }

  // Simulated Market Indices depending on Region
  const getRegionalIndices = () => {
    switch (selectedRegion) {
      case 'Sumut':
        return {
          cpoIndex: 12950,
          cpoChange: '+1.2%',
          avgFfbBuy: 2480,
          avgFfbSell: 2820,
          volTrend: 'Stabil',
          competitors: [
            { id: 'C1', name: 'RAM Berkah Sawit', distance: '3.2 km', currentPrice: 2470, change: 'up', changeVal: 15 },
            { id: 'C2', name: 'UD. Tunas Jaya', distance: '5.8 km', currentPrice: 2490, change: 'down', changeVal: 10 },
            { id: 'C3', name: 'RAM Maju Bersama', distance: '8.4 km', currentPrice: 2460, change: 'flat', changeVal: 0 }
          ] as CompetitorData[]
        };
      case 'Kaltim':
        return {
          cpoIndex: 12400,
          cpoChange: '-0.5%',
          avgFfbBuy: 2320,
          avgFfbSell: 2650,
          volTrend: 'Menurun (Efek Trek)',
          competitors: [
            { id: 'C1', name: 'RAM Borneo Mandiri', distance: '12.0 km', currentPrice: 2310, change: 'down', changeVal: 20 },
            { id: 'C2', name: 'Koperasi Sawit Etam', distance: '15.5 km', currentPrice: 2340, change: 'up', changeVal: 10 },
            { id: 'C3', name: 'UD. Kutai Indah', distance: '22.1 km', currentPrice: 2320, change: 'flat', changeVal: 0 }
          ] as CompetitorData[]
        };
      case 'Riau':
      default:
        return {
          cpoIndex: 12820,
          cpoChange: '+0.8%',
          avgFfbBuy: 2440,
          avgFfbSell: 2770,
          volTrend: 'Meningkat (Panen Stabil)',
          competitors: [
            { id: 'C1', name: 'RAM Sentosa Riau', distance: '2.5 km', currentPrice: 2430, change: 'up', changeVal: 10 },
            { id: 'C2', name: 'UD. Harapan Tani', distance: '4.1 km', currentPrice: 2450, change: 'up', changeVal: 25 },
            { id: 'C3', name: 'RAM Sawit Makmur', distance: '6.7 km', currentPrice: 2420, change: 'flat', changeVal: 0 }
          ] as CompetitorData[]
        };
    }
  };

  const currentMarket = getRegionalIndices();

  // Price Trend Chart over the last 6 months (Simulated)
  const trendData = [
    { name: 'Jan 26', CPO: 12200, FFBBuy: 2280, FFBSell: 2580 },
    { name: 'Feb 26', CPO: 12400, FFBBuy: 2310, FFBSell: 2610 },
    { name: 'Mar 26', CPO: 12100, FFBBuy: 2250, FFBSell: 2540 },
    { name: 'Apr 26', CPO: 12600, FFBBuy: 2380, FFBSell: 2680 },
    { name: 'Mei 26', CPO: 12750, FFBBuy: 2410, FFBSell: 2720 },
    { name: 'Jun 26', CPO: currentMarket.cpoIndex, FFBBuy: currentMarket.avgFfbBuy, FFBSell: currentMarket.avgFfbSell }
  ];

  // Call API for dynamic Market suggestions
  const handleGenerateMarketReport = async (promptOverride?: string) => {
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/market-intelligence-suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          region: selectedRegion,
          cpoIndex: currentMarket.cpoIndex,
          competitors: currentMarket.competitors,
          customQuery: promptOverride || customPrompt,
          isOffline: !isOnline
        })
      });

      if (!response.ok) {
        throw new Error('Gagal memuat rekomendasi harga AI.');
      }

      const result = await response.json();
      setAiReport(result);
      
      // If customized, add to chat
      if (promptOverride) {
        setChatLog(prev => [
          ...prev,
          {
            sender: 'ai',
            text: result.detailedAnalysis || 'Rekomendasi harga baru telah dikalkulasi berdasarkan masukan Anda.',
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err: any) {
      console.error(err);
      // Fallback
      setAiReport(demoReport);
    } finally {
      setIsAiLoading(false);
      setCustomPrompt('');
    }
  };

  const handleSendChat = () => {
    if (!marketAnalysisQuery.trim()) return;
    
    const userMsg = marketAnalysisQuery;
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    setChatLog(prev => [...prev, { sender: 'user', text: userMsg, time: timeStr }]);
    setMarketAnalysisQuery('');
    
    // Call AI suggestion with custom chat prompt
    handleGenerateMarketReport(userMsg);
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn font-sans">
      
      {/* 1. Header & Configuration Selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E6EBDD] pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#102018] flex items-center gap-2">
            AI Market & Pricing Intelligence
            <span className="bg-[#C6F24A]/20 text-[#123C2B] border border-[#C6F24A]/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-800" /> Advanced
            </span>
          </h2>
          <p className="text-xs text-[#66736B] mt-1">
            Pantau pergerakan harga CPO global, harga beli kompetitor terdekat, dan rekomendasi margin laba RAM sawit Anda secara real-time.
          </p>
        </div>

        {/* Region & Refresh block */}
        <div className="flex items-center gap-2.5">
          <label className="text-xs font-bold text-[#66736B]">Wilayah Analisis:</label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as any)}
            className="bg-white border border-[#E6EBDD] rounded-xl px-3 py-1.5 text-xs font-bold text-[#102018] outline-none focus:border-[#123C2B] transition-all"
          >
            <option value="Riau">Riau (Sentra Utama)</option>
            <option value="Sumut">Sumatera Utara</option>
            <option value="Kaltim">Kalimantan Timur</option>
          </select>

          <button
            onClick={() => handleGenerateMarketReport()}
            disabled={isAiLoading}
            className="bg-[#123C2B] hover:bg-emerald-900 text-[#C6F24A] font-black p-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isAiLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* 2. THREE KEY REAL-TIME INDICES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Index A: CPO Global Index */}
        <div className="bg-white border border-[#E6EBDD] rounded-3xl p-5 shadow-xs hover:border-[#C6F24A] transition-all">
          <div className="flex justify-between items-start text-xs border-b border-gray-100 pb-2.5">
            <span className="text-[#66736B] font-bold">Indeks CPO Domestik</span>
            <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold ${
              currentMarket.cpoChange.startsWith('+') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
            }`}>
              {currentMarket.cpoChange} hari ini
            </span>
          </div>
          <div className="pt-3.5 space-y-1">
            <span className="text-3xl font-black font-mono text-emerald-950 block">
              {formatRupiah(currentMarket.cpoIndex)}
            </span>
            <span className="text-[10px] text-[#66736B] block">
              Konversi nilai dasar CPO per kilogram di KPBN (Kharisma Pemasaran Bersama Nusantara)
            </span>
          </div>
        </div>

        {/* Index B: Regional Average Buy Price */}
        <div className="bg-white border border-[#E6EBDD] rounded-3xl p-5 shadow-xs hover:border-[#C6F24A] transition-all">
          <div className="flex justify-between items-start text-xs border-b border-gray-100 pb-2.5">
            <span className="text-[#66736B] font-bold">Rata-rata Harga Beli TBS</span>
            <span className="bg-emerald-50 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
              Kompilasi RAM Sawit
            </span>
          </div>
          <div className="pt-3.5 space-y-1">
            <span className="text-3xl font-black font-mono text-emerald-950 block">
              {formatRupiah(currentMarket.avgFfbBuy)}
            </span>
            <span className="text-[10px] text-[#66736B] block">
              Harga pembelian rata-rata TBS grade A di tingkat pengepul regional {selectedRegion}
            </span>
          </div>
        </div>

        {/* Index C: Target Selling Price at Palm Oil Mill (PKS) */}
        <div className="bg-white border border-[#E6EBDD] rounded-3xl p-5 shadow-xs hover:border-[#C6F24A] transition-all">
          <div className="flex justify-between items-start text-xs border-b border-gray-100 pb-2.5">
            <span className="text-[#66736B] font-bold">Rata-rata Harga Jual PKS</span>
            <span className="bg-[#C6F24A]/20 text-[#123C2B] text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
              Pabrik Kelapa Sawit
            </span>
          </div>
          <div className="pt-3.5 space-y-1">
            <span className="text-3xl font-black font-mono text-emerald-950 block">
              {formatRupiah(currentMarket.avgFfbSell)}
            </span>
            <span className="text-[10px] text-[#66736B] block">
              Target nominal terima TBS di Paving Bay pabrik kelapa sawit terdekat
            </span>
          </div>
        </div>

      </div>

      {/* 3. GEMINI DYNAMIC MARKET ADVISORY & RECHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* MODULE LEFT: AI STRATEGIC REPORT CARD */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Advisor Panel */}
          <div className="bg-gradient-to-br from-[#102018] to-[#123C2B] text-white p-6 rounded-3xl border border-[#C6F24A]/15 shadow-xl space-y-5 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-80 h-80 bg-[#C6F24A]/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="bg-[#C6F24A] text-[#123C2B] p-1.5 rounded-xl">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight text-[#C6F24A]">Rampalm Pricing Advisor</h3>
                  <p className="text-[10px] text-emerald-300">Rekomendasi taktis berbasis komputasi AI Gemini</p>
                </div>
              </div>
              <span className="text-[9px] bg-white/10 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full">
                Sentimen: {aiReport?.marketSentiment || 'Stabil'}
              </span>
            </div>

            {/* Core suggested pricing values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                <span className="text-[10px] text-emerald-300/80 block font-bold uppercase tracking-wider">Saran Harga Beli RAM</span>
                <span className="text-xl font-black font-mono text-[#C6F24A]">{formatRupiah(aiReport?.suggestedFfbBuyPrice || 2450)}</span>
                <span className="text-[9px] text-white/50 block mt-0.5">per kilogram TBS matang</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                <span className="text-[10px] text-emerald-300/80 block font-bold uppercase tracking-wider">Estimasi Harga Jual PKS</span>
                <span className="text-xl font-black font-mono text-white">{formatRupiah(aiReport?.suggestedFfbSellPrice || 2780)}</span>
                <span className="text-[9px] text-white/50 block mt-0.5">ke gerbang pabrik terdekat</span>
              </div>
              <div className="bg-white/5 border border-[#C6F24A]/20 p-3.5 rounded-2xl bg-emerald-950/20">
                <span className="text-[10px] text-emerald-300 block font-bold uppercase tracking-wider">Rekomendasi Margin Bersih</span>
                <span className="text-xl font-black font-mono text-[#C6F24A]">{formatRupiah(aiReport?.recommendedMargin || 330)} / kg</span>
                <span className="text-[9px] text-white/50 block mt-0.5">Batas aman penyusutan & untung</span>
              </div>
            </div>

            {/* Strategic Recommended Tactic */}
            <div className="bg-[#C6F24A]/10 border border-[#C6F24A]/20 p-4 rounded-2xl text-xs space-y-1">
              <span className="font-black text-[#C6F24A] uppercase tracking-wider block text-[10px]">Langkah Taktis Pemilik RAM:</span>
              <p className="text-[#E6EBDD] font-medium leading-relaxed">
                {aiReport?.strategicTactic}
              </p>
            </div>

            {/* Detailed narrative analysis */}
            <div className="text-xs text-[#E6EBDD]/80 leading-relaxed space-y-2 border-t border-white/10 pt-4">
              <span className="font-bold text-white block uppercase tracking-wider text-[10px]">Analisis Pasar Mendalam:</span>
              <p className="font-normal">
                {aiReport?.detailedAnalysis}
              </p>
            </div>

            {/* Three periods forecast */}
            <div className="pt-2">
              <span className="font-bold text-white block uppercase tracking-wider text-[10px] mb-2.5">Proyeksi Tren Harga TBS:</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {aiReport?.forecast.map((f, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 p-2.5 rounded-xl text-xs">
                    <div className="flex justify-between items-center font-bold mb-1">
                      <span className="text-white">{f.period}</span>
                      <span className={`text-[8px] px-1.5 py-0.2 rounded font-black font-mono ${
                        f.trend === 'BULLISH' ? 'bg-emerald-500/20 text-emerald-300' :
                        f.trend === 'BEARISH' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {f.trend}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/60 leading-normal">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ask custom prompt input to rerun */}
            <div className="pt-2 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Sesuaikan kondisi (misal: 'Ada kelangkaan truk bensin lokal...')"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 flex-1 outline-none focus:border-[#C6F24A] transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerateMarketReport();
                }}
              />
              <button
                onClick={() => handleGenerateMarketReport()}
                disabled={isAiLoading}
                className="bg-[#C6F24A] hover:bg-lime-400 text-[#123C2B] font-black px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isAiLoading ? 'Memproses...' : 'Terapkan'}
              </button>
            </div>
          </div>

          {/* Recharts Price Comparison graph over months */}
          <div className="bg-white border border-[#E6EBDD] rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-[#102018]">Grafik Komparasi Nilai CPO vs TBS</h3>
                <p className="text-[10px] text-[#66736B]">Rasio pergerakan indeks dasar CPO terhadap margin beli-jual sawit harian</p>
              </div>
              <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full font-mono">Periode Smt-I 2026</span>
            </div>

            <div className="h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFfbBuy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#123C2B" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#123C2B" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorFfbSell" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C6F24A" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C6F24A" stopOpacity={0.0}/>
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
                  <Area type="monotone" name="Harga Jual PKS" dataKey="FFBSell" stroke="#C6F24A" strokeWidth={3} fill="url(#colorFfbSell)" />
                  <Area type="monotone" name="Harga Beli RAM" dataKey="FFBBuy" stroke="#123C2B" strokeWidth={2.5} fill="url(#colorFfbBuy)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* MODULE RIGHT: LOCAL COMPETITOR PRICING & CLIMATIC CYCLE */}
        <div className="space-y-6">

          {/* Competitor Price Monitor list */}
          <div className="bg-white border border-[#E6EBDD] rounded-3xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-sm text-[#102018]">Radar Kompetitor Terdekat</h3>
              <p className="text-[10px] text-[#66736B]">Perbandingan harga beli per kilogram TBS di radius operasional</p>
            </div>

            <div className="space-y-2.5">
              {currentMarket.competitors.map((comp) => {
                const isUnder = comp.currentPrice < (aiReport?.suggestedFfbBuyPrice || 2450);

                return (
                  <div key={comp.id} className="bg-[#F7FAF3] rounded-2xl p-3 border border-[#E6EBDD]/50 flex items-center justify-between text-xs transition-all hover:bg-white hover:border-[#C6F24A]">
                    <div className="text-left space-y-0.5">
                      <span className="font-bold text-[#102018] block">{comp.name}</span>
                      <span className="text-[10px] text-[#66736B] block">Jarak: {comp.distance}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black block text-[#102018]">{formatRupiah(comp.currentPrice)}</span>
                      {comp.change === 'up' ? (
                        <span className="text-[9px] text-emerald-700 font-bold flex items-center justify-end gap-0.5 font-mono">
                          ▲ +{comp.changeVal}
                        </span>
                      ) : comp.change === 'down' ? (
                        <span className="text-[9px] text-red-600 font-bold flex items-center justify-end gap-0.5 font-mono">
                          ▼ -{comp.changeVal}
                        </span>
                      ) : (
                        <span className="text-[9px] text-[#66736B] font-bold block font-mono">
                          ● Stabil
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-emerald-50 text-emerald-900 text-[10px] p-3 rounded-2xl border border-emerald-100/60 leading-relaxed text-left">
              <span className="font-bold block mb-0.5">💡 Rekomendasi Radar:</span>
              Harga Anda <span className="font-black text-emerald-950">{(aiReport?.suggestedFfbBuyPrice || 2450) >= currentMarket.competitors[1].currentPrice ? 'Unggul/Lebih Tinggi' : 'Kompetitif'}</span> dibanding rata-rata sekitar. Ini mempermudah Anda menarik pasokan TBS melimpah.
            </div>
          </div>

          {/* Seasonal Harvest Advisory */}
          <div className="bg-white border border-[#E6EBDD] rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <Calendar className="w-4 h-4 text-[#123C2B]" />
              <h3 className="font-extrabold text-sm text-[#102018]">Kalender Musim Panen (Trek)</h3>
            </div>

            <div className="space-y-3.5 text-xs text-left">
              {/* Peak Season Row */}
              <div className="border-l-2 border-emerald-600 pl-3 py-1 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#123C2B]">Musim Puncak (Agustus - November)</span>
                  <span className="text-[8px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.2 rounded font-mono">HIGH VOL</span>
                </div>
                <p className="text-[10px] text-[#66736B] leading-normal">
                  TBS melimpah ruah di perkebunan. Margin keuntungan disarankan diperlebar (harga beli diturunkan perlahan) karena PKS memiliki waktu tunggu bongkar muat yang sangat panjang.
                </p>
              </div>

              {/* Low Season Row */}
              <div className="border-l-2 border-amber-500 pl-3 py-1 space-y-1 bg-amber-50/20 rounded-r-xl">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-800">Musim Trek (Maret - Juni)</span>
                  <span className="text-[8px] bg-amber-100 text-amber-800 font-black px-1.5 py-0.2 rounded font-mono font-bold">LOW VOL</span>
                </div>
                <p className="text-[10px] text-[#66736B] leading-normal">
                  Produksi kelapa sawit merosot tajam. Perebutan buah sawit antar RAM sangat ketat. Berikan harga beli premium atau bonus insentif bagi petani dengan tonase di atas 5 Ton.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Chat Analyst helper */}
          <div className="bg-white border border-[#E6EBDD] rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 min-h-80">
            <div className="border-b border-gray-100 pb-2.5 flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-800" />
                <h4 className="font-extrabold text-xs text-[#102018]">Konsultasi Harga Cepat</h4>
              </div>
              <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded">Gemini-3.5</span>
            </div>

            {/* Log list scrollbar */}
            <div className="flex-1 overflow-y-auto space-y-3 max-h-48 pr-1 text-xs">
              {chatLog.map((chat, idx) => (
                <div key={idx} className={`flex flex-col ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-2.5 rounded-2xl max-w-[90%] leading-relaxed ${
                    chat.sender === 'user' 
                      ? 'bg-[#123C2B] text-[#C6F24A] font-medium rounded-br-none' 
                      : 'bg-[#F7FAF3] text-[#102018] border border-[#E6EBDD] rounded-bl-none'
                  }`}>
                    {chat.text}
                  </div>
                  <span className="text-[8px] text-[#66736B] mt-1 px-1 font-mono">{chat.time}</span>
                </div>
              ))}
            </div>

            {/* Input send bar */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
              <input
                type="text"
                value={marketAnalysisQuery}
                onChange={(e) => setMarketAnalysisQuery(e.target.value)}
                placeholder="Tanya perihal harga..."
                className="bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-1.5 text-xs text-[#102018] placeholder-[#66736B] flex-1 outline-none focus:border-[#123C2B] transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendChat();
                }}
              />
              <button
                onClick={handleSendChat}
                className="bg-[#123C2B] hover:bg-emerald-900 text-white p-2 rounded-xl transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
