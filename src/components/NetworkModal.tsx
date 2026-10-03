import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Smartphone, X, Copy, Check, Wifi, Globe, Laptop, ArrowRight } from 'lucide-react';
import { StorageService } from '../services/storage';

interface NetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NetworkModal: React.FC<NetworkModalProps> = ({ isOpen, onClose }) => {
  const [networkUrl, setNetworkUrl] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;

    StorageService.getNetworkInfo().then((info) => {
      const url = info.url || `http://${window.location.hostname}:5173`;
      setNetworkUrl(url);
      setLoading(false);

      QRCode.toDataURL(url, {
        width: 240,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((qr) => setQrDataUrl(qr))
        .catch(console.error);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(networkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Smartphone size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Conectar Celular o Tablet
              </h3>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Servidor de Red Local Activo
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* QR Code and Direct URL */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-white rounded-2xl shadow-xl mb-4 border-4 border-indigo-500/20">
              {loading ? (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                  Cargando QR...
                </div>
              ) : qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Conexión Celular" className="w-48 h-48 object-contain" />
              ) : null}
            </div>

            <p className="text-xs text-slate-300 font-medium">
              Apunta la cámara de tu celular o tablet a este código QR
            </p>

            {/* URL Box */}
            <div className="mt-3 flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 w-full max-w-sm">
              <Globe size={15} className="text-indigo-400 shrink-0" />
              <input
                type="text"
                readOnly
                value={networkUrl}
                className="bg-transparent text-xs font-mono text-white flex-1 outline-none select-all"
              />
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Pasos / Instrucciones */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              ¿Cómo funciona?
            </span>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 mt-0.5">
                <Wifi size={15} />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-white">1. Misma red Wi-Fi:</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Asegúrate de que tu celular o laptop secundaria esté conectado a la misma red Wi-Fi de esta computadora.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 mt-0.5">
                <Laptop size={15} />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-white">2. Base de datos compartida en tiempo real:</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Cualquier producto que registres o etiqueta que crees desde tu teléfono se guardará directamente en esta computadora anfitriona.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/40 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
