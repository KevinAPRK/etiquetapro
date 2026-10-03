import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  Store, 
  DollarSign, 
  Upload, 
  Trash2, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { AppConfig } from '../types';

interface SettingsViewProps {
  config: AppConfig;
  onSaveConfig: (config: AppConfig) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ config, onSaveConfig }) => {
  const [formData, setFormData] = useState<AppConfig>({ ...config });
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Límite de seguridad para evitar congelar localStorage con archivos gigantes (> 4MB)
    if (file.size > 4 * 1024 * 1024) {
      alert('La imagen seleccionada es muy pesada. Por favor selecciona una imagen de menos de 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData((prev) => ({ ...prev, businessLogo: base64 }));
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, businessLogo: undefined }));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="text-indigo-400" />
          Configuración del Sistema
        </h1>
        <p className="text-xs text-slate-400">
          Ajusta los datos de tu empresa, logotipo comercial, símbolos de moneda e impresoras predeterminadas.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={16} />
          Configuración y logotipo guardados correctamente en la base de datos local.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos Comerciales & Logotipo */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Store size={16} className="text-indigo-400" />
            Datos de la Empresa / Negocio
          </h2>

          {/* ÁREA PARA SUBIR EL LOGOTIPO */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <ImageIcon size={15} className="text-indigo-400" />
              Logotipo de tu Negocio / Marca
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Preview Box */}
              <div className="w-32 h-32 rounded-xl bg-white/95 border-2 border-dashed border-indigo-400/40 flex items-center justify-center p-2.5 overflow-hidden shrink-0 shadow-md">
                {formData.businessLogo ? (
                  <img
                    src={formData.businessLogo}
                    alt="Logo Empresa"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-slate-400 flex flex-col items-center">
                    <ImageIcon size={32} className="text-slate-300 mb-1" />
                    <span className="text-[10px] font-medium text-slate-500">Sin Logotipo</span>
                  </div>
                )}
              </div>

              {/* Controles de Subida */}
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <p className="text-xs text-slate-300 font-medium">
                  Personaliza tus etiquetas con tu marca comercial
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Formatos recomendados: <strong className="text-slate-200">PNG transparente, JPG o SVG</strong>. Este logo aparecerá automáticamente en las plantillas y etiquetas cuando agregues el elemento Logo.
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Upload size={14} />
                    {formData.businessLogo ? 'Cambiar Logotipo' : 'Subir Logotipo'}
                  </button>

                  {formData.businessLogo && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre Comercial</label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                placeholder="Mi Negocio o Tienda"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">RUC / NIT / RFC</label>
              <input
                type="text"
                value={formData.businessRUC || ''}
                onChange={(e) => setFormData({ ...formData, businessRUC: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                placeholder="20601234567"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Teléfono / WhatsApp</label>
              <input
                type="text"
                value={formData.businessPhone || ''}
                onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                placeholder="+51 987 654 321"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Dirección</label>
              <input
                type="text"
                value={formData.businessAddress || ''}
                onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                placeholder="Av. Principal 123"
              />
            </div>
          </div>
        </div>

        {/* Moneda y Preferencias de Impresión */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-400" />
            Moneda y Preferencias de Hardware
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Símbolo de Moneda</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
              >
                <option value="S/">S/ (Soles - Perú)</option>
                <option value="$">$ (Dólares / Pesos)</option>
                <option value="€">€ (Euros)</option>
                <option value="MX$">MX$ (Pesos Mexicanos)</option>
                <option value="CLP$">CLP$ (Pesos Chilenos)</option>
                <option value="COP$">COP$ (Pesos Colombianos)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Impresora Térmica Predeterminada
              </label>
              <input
                type="text"
                value={formData.defaultPrinter}
                onChange={(e) => setFormData({ ...formData, defaultPrinter: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                placeholder="Zebra GK420 / TSC"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5"
          >
            <Save size={16} /> GUARDAR CONFIGURACIÓN
          </button>
        </div>
      </form>
    </div>
  );
};
