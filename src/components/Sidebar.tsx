import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  Palette, 
  FileText, 
  Printer, 
  History, 
  Settings, 
  ShieldCheck,
  Smartphone,
  Wifi
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'productos' 
  | 'generador' 
  | 'disenador' 
  | 'plantillas' 
  | 'impresion' 
  | 'historial' 
  | 'configuracion' 
  | 'backup';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  productsCount: number;
  onOpenNetworkModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onSelectTab, 
  productsCount, 
  onOpenNetworkModal 
}) => {
  const menuItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
    { id: 'generador', label: 'Generador Rápido', icon: <Tag size={19} /> },
    { id: 'disenador', label: 'Diseñador Visual', icon: <Palette size={19} />, badge: 'Canva' },
    { id: 'productos', label: 'Catálogo Productos', icon: <Package size={19} />, badge: productsCount },
    { id: 'plantillas', label: 'Plantillas Guardadas', icon: <FileText size={19} /> },
    { id: 'impresion', label: 'Impresión en Lote', icon: <Printer size={19} /> },
    { id: 'historial', label: 'Historial', icon: <History size={19} /> },
    { id: 'backup', label: 'Copia de Seguridad', icon: <ShieldCheck size={19} /> },
    { id: 'configuracion', label: 'Configuración', icon: <Settings size={19} /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen select-none shrink-0 no-print">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Tag size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-bold text-white tracking-wide">ETIQUETA PRO</h1>
            <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">v1.0</span>
          </div>
          <p className="text-xs text-slate-400">Diseño & Impresión Profesional</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-indigo-700/60 text-indigo-100'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Botón Conectar Celular / Red Wi-Fi */}
      <div className="px-3 pb-2">
        <button
          onClick={onOpenNetworkModal}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-indigo-600/30 hover:from-indigo-600 hover:to-purple-600 border border-indigo-500/40 text-indigo-200 hover:text-white text-xs font-bold transition-all shadow-md cursor-pointer group"
        >
          <Smartphone size={16} className="text-indigo-400 group-hover:text-white transition-colors" />
          <span>Conectar Celular / Wi-Fi</span>
        </button>
      </div>

      {/* Network Status & Quick Info */}
      <div className="p-3.5 m-3 mt-0 rounded-xl bg-slate-800/60 border border-slate-700/60">
        <div className="flex items-center gap-2 mb-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-400">Red Multi-Dispositivo</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Sincronización en tiempo real activa entre computadoras y celulares.
        </p>
      </div>
    </aside>
  );
};
