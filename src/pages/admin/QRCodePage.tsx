import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { restaurantsApi } from '../../api/restaurants';

export default function QRCodePage() {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const slug = user?.restaurant?.slug;
  const restaurantId = user?.restaurantId;
  const menuUrl = `${window.location.origin}/menu/${slug}`;

  const handleDownload = async () => {
    if (!restaurantId) return;
    setDownloading(true);
    try {
      const blob = await restaurantsApi.getQRCode(restaurantId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${slug}-qr.png`; a.click();
      URL.revokeObjectURL(url);
    } catch { alert('QR code yuklab olishda xatolik'); }
    finally { setDownloading(false); }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">QR Code</h1>
        <p className="text-gray-400 text-sm mt-0.5">Menyuingizni QR kod orqali ulashing</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* QR Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">QR Kod</p>

          {/* QR frame */}
          <div className="relative p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-inner mb-5">
            <div className="absolute top-3 left-3 w-5 h-5 border-l-3 border-t-3 border-orange-500 rounded-tl-lg" />
            <div className="absolute top-3 right-3 w-5 h-5 border-r-3 border-t-3 border-orange-500 rounded-tr-lg" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-l-3 border-b-3 border-orange-500 rounded-bl-lg" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-r-3 border-b-3 border-orange-500 rounded-br-lg" />
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=${encodeURIComponent(menuUrl)}`}
              alt="QR Code"
              className="w-48 h-48"
            />
          </div>

          {/* Restaurant name */}
          <p className="font-bold text-gray-900 text-center">{user?.restaurant?.name}</p>
          <p className="text-orange-500 text-xs mt-1 font-medium">/menu/{slug}</p>
        </div>

        {/* Actions Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Harakatlar</p>

          {/* URL box */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1 font-medium">Menyu havolasi</p>
            <p className="text-xs text-gray-600 font-mono break-all">{menuUrl}</p>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading || !restaurantId}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-sm shadow-orange-500/30 hover:shadow-md hover:shadow-orange-500/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {downloading ? 'Yuklanmoqda...' : 'PNG yuklab olish'}
          </button>

          <button
            onClick={handleCopy}
            className={`w-full flex items-center justify-center gap-2 border py-3 rounded-xl font-semibold text-sm transition-all ${
              copied
                ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Nusxalandi!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Havolani nusxalash
              </>
            )}
          </button>

          <Link
            to={menuUrl}
            className="w-full flex items-center justify-center gap-2 border border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Menuni ochish
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-blue-700">
          Menu yangilansa ham QR code va havola <strong>o'zgarmaydi</strong>. Bir marta chop etib doim ishlataverasiz.
        </p>
      </div>
    </div>
  );
}
