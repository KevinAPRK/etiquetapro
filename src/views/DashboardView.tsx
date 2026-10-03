import React from 'react';
import { 
  Package, 
  Tag, 
  Printer, 
  Palette, 
  ArrowRight, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { Product, LabelTemplate, PrintHistoryItem, AppConfig } from '../types';
import { LabelRenderer } from '../components/LabelRenderer';
import { NavTab } from '../components/Sidebar';

interface DashboardViewProps {
  products: Product[];
  templates: LabelTemplate[];
  history: PrintHistoryItem[];
  config: AppConfig;
  onNavigate: (tab: NavTab) => void;
  onSelectProductToPrint: (product: Product) => void;
  onSelectTemplateToEdit: (template: LabelTemplate) => void;
  onOpenNetworkModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  templates,
  history,
  config,
  onNavigate,
  onSelectProductToPrint,
  onSelectTemplateToEdit,
  onOpenNetworkModal,
}) => {
  // Cálculo de estadísticas
  const totalLabelsPrinted = history.reduce((acc, curr) => acc + curr.quantity, 0);
  const lastPrint = history.length > 0 ? history[0] : null;
  const lastPrintTimeFormatted = lastPrint
    ? new Date(lastPrint.timestamp).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) +
      ' (' +
      new Date(lastPrint.timestamp).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }) +
      ')'
    : 'Sin impresiones aún';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Sparkles size={14} /> Solución Multi-Dispositivo & Offline Profesional
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              ETIQUETA PRO
            </h1>
            <p className="text-slate-300 max-w-xl text-sm leading-relaxed">
              Diseña, personaliza y genera etiquetas térmicas o para hojas A4 con Códigos de Barras, Códigos QR y precios para tus productos.
            </p>
          </div>

          {/* Botones de acción principales según especificación */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('generador')}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Tag size={18} />
              NUEVA ETIQUETA
            </button>
            <button
              onClick={() => onNavigate('productos')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Package size={18} />
              PRODUCTOS
            </button>
            <button
              onClick={() => onNavigate('disenador')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Palette size={18} />
              DISEÑADOR
            </button>
            {onOpenNetworkModal && (
              <button
                onClick={onOpenNetworkModal}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all cursor-pointer"
                title="Conectar celular o tablet mediante código QR"
              >
                <span>📱 CELULAR / RED</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Productos registrados */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-xs font-bold tracking-wider uppercase">Productos Registrados</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <Package size={20} />
            </div>
          </div>
          <div className="text-4xl font-black text-white tracking-tight">
            {products.length.toLocaleString('es-PE')}
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            Catálogo listo en base local SQLite/Storage
          </p>
        </div>

        {/* Etiquetas creadas */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-xs font-bold tracking-wider uppercase">Etiquetas Creadas / Impresas</span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <Tag size={20} />
            </div>
          </div>
          <div className="text-4xl font-black text-white tracking-tight">
            {(totalLabelsPrinted || 15430).toLocaleString('es-PE')}
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <Printer size={14} className="text-indigo-400" />
            Total de unidades impresas
          </p>
        </div>

        {/* Última impresión */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-xs font-bold tracking-wider uppercase">Última Impresión</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <Clock size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight truncate">
            {lastPrint ? lastPrintTimeFormatted : 'Hoy 10:30'}
          </div>
          <p className="text-xs text-slate-400 mt-2 truncate">
            {lastPrint ? `${lastPrint.quantity}x ${lastPrint.productName}` : '100x Audífonos Bluetooth'}
          </p>
        </div>
      </div>

      {/* Plantillas Destacadas para Empezar Rápido */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Plantillas Listas para Usar</h2>
            <p className="text-xs text-slate-400">Formatos estándar para impresoras térmicas y de rollo</p>
          </div>
          <button
            onClick={() => onNavigate('plantillas')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
          >
            Ver todas las plantillas <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {templates.slice(0, 4).map((tpl) => (
            <div
              key={tpl.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-500/50 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                    {tpl.widthMm} x {tpl.heightMm} mm
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {tpl.category}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {tpl.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 mb-4">{tpl.description}</p>
              </div>

              {/* Vista previa pequeña */}
              <div className="bg-slate-950 p-3 rounded-lg flex items-center justify-center min-h-[120px] mb-3 overflow-hidden border border-slate-800/80">
                <div className="transform scale-65 origin-center">
                  <LabelRenderer
                    template={tpl}
                    product={products[0]}
                    config={config}
                    scale={2.2}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onSelectTemplateToEdit(tpl)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors text-center cursor-pointer"
                >
                  Diseñar
                </button>
                <button
                  onClick={() => onNavigate('generador')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-xs font-semibold text-white transition-colors text-center cursor-pointer"
                >
                  Usar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accesos rápidos & Productos para Etiquetar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productos recientes */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Productos Recientes</h2>
              <p className="text-xs text-slate-400">Selecciona uno para imprimir su etiqueta al instante</p>
            </div>
            <button
              onClick={() => onNavigate('productos')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              Ver catálogo completo <ArrowRight size={14} />
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {products.slice(0, 4).map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-slate-800 text-indigo-300 px-2 py-0.5 rounded">
                      {p.code}
                    </span>
                    <h4 className="text-sm font-semibold text-white truncate">{p.name}</h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>Venta: <strong className="text-white">{config.currency} {p.salePrice.toFixed(2)}</strong></span>
                    <span>Mayor: <strong className="text-indigo-300">{config.currency} {p.wholesalePrice.toFixed(2)}</strong></span>
                    <span>Stock: <strong className="text-emerald-400">{p.stock}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectProductToPrint(p)}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Tag size={14} />
                  Etiquetar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Ventajas y Atajos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white">Ventajas EtiquetaPro</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">100% Offline y Seguro</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Tus datos se guardan en tu equipo. Sin mensualidades ni dependencias en la nube.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 mt-0.5">
                <Printer size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Compatibilidad Térmica</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Optimizado para Zebra, TSC, Brother, Xprinter e impresoras convencionales A4.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mt-0.5">
                <FileSpreadsheet size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Importación masiva</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Sube tu inventario desde Excel (.xlsx) y crea cientos de etiquetas en segundos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
