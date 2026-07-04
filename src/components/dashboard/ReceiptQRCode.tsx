/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { PurchaseTransaction, Supplier } from '../../types';
import { formatRupiah, formatKg } from '../../utils/calculations';
import { Smartphone, CheckCircle, Info, Copy, Check, ExternalLink } from 'lucide-react';

interface ReceiptQRCodeProps {
  purchase: PurchaseTransaction;
  supplierName: string;
}

export default function ReceiptQRCode({ purchase, supplierName }: ReceiptQRCodeProps) {
  const [copied, setCopied] = useState(false);

  // Generate a mock validation payload
  const verificationPayload = `--- NOTA TIMBANG TERVERIFIKASI RAMPALM OS ---
No Nota      : ${purchase.id}
Tanggal      : ${new Date(purchase.date).toLocaleString('id-ID')}
Supplier     : ${supplierName}
Plat No      : ${purchase.vehicleId}
Bruto        : ${formatKg(purchase.grossWeight)}
Tara         : ${formatKg(purchase.tareWeight)}
Netto Bersih : ${formatKg(purchase.netWeight)}
Harga per Kg : ${formatRupiah(purchase.purchasePricePerKg)}
Potongan %   : ${purchase.deductionPercentage}%
Total Bayar  : ${formatRupiah(purchase.finalAmount)}
Operator     : ${purchase.operatorName}
---------------------------------------------
Sistem Sertifikasi Timbangan RAM Sawit Lestari`;

  // Dynamic QR Code generation using qrserver API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(verificationPayload)}&color=12-60-43&bgcolor=247-250-243`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(verificationPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#F7FAF3] border border-[#E6EBDD] rounded-2xl p-4 space-y-4 text-center">
      <div className="flex items-center justify-center gap-2 text-emerald-950 font-black text-xs uppercase tracking-wider">
        <Smartphone className="w-4 h-4 text-emerald-800" />
        <span>Verifikasi Digital Pelanggan</span>
      </div>

      {/* QR Code Frame */}
      <div className="relative inline-block bg-white p-3 rounded-2xl border border-[#E6EBDD] shadow-sm">
        <img
          src={qrCodeUrl}
          alt={`QR Code Verifikasi ${purchase.id}`}
          className="w-44 h-44 mx-auto transition-transform hover:scale-105 duration-200"
          referrerPolicy="no-referrer"
        />
        <div className="absolute -bottom-1 -right-1 bg-[#C6F24A] text-[#123C2B] p-1 rounded-lg text-[9px] font-bold shadow-xs">
          QR CODE
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-[11px] font-extrabold text-emerald-950">
          Scan QR Code untuk Verifikasi Nota
        </p>
        <p className="text-[10px] text-[#66736B] leading-relaxed max-w-xs mx-auto">
          Minta supir atau supplier scan QR ini dengan kamera HP untuk menyimpan salinan timbangan digital secara instan.
        </p>
      </div>

      {/* Utility Actions */}
      <div className="flex items-center justify-center gap-2 pt-1 border-t border-[#E6EBDD]/60">
        <button
          onClick={handleCopyText}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white hover:bg-emerald-50 border border-[#E6EBDD] text-emerald-950 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-700" />
              <span>Salin Teks Nota</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-[#66736B]" />
              <span>Salin Teks Nota</span>
            </>
          )}
        </button>
      </div>

      {/* Verification Badge */}
      <div className="bg-white border border-[#E6EBDD] rounded-xl p-2.5 text-left text-[10px] space-y-1 font-mono text-[#66736B]">
        <div className="flex items-center gap-1.5 text-emerald-950 font-bold border-b border-[#E6EBDD] pb-1 mb-1 font-sans">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Status: Terverifikasi RamPalm OS</span>
        </div>
        <div className="flex justify-between">
          <span>ID Nota:</span>
          <span className="font-bold text-emerald-950">{purchase.id}</span>
        </div>
        <div className="flex justify-between">
          <span>Netto Bersih:</span>
          <span className="font-bold text-emerald-950">{formatKg(purchase.netWeight)}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Nilai:</span>
          <span className="font-bold text-emerald-950">{formatRupiah(purchase.finalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
