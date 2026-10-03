import React from 'react';
import { History, Trash2, Printer, CheckCircle, Clock } from 'lucide-react';
import { PrintHistoryItem } from '../types';

interface HistoryViewProps {
  history: PrintHistoryItem[];
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onClearHistory }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="text-indigo-400" />
            Historial de Impresiones
          </h1>
          <p className="text-xs text-slate-400">
            Registro cronológico de todas las etiquetas generadas e impresas ({history.length} trabajos).
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              if (confirm('¿Deseas vaciar el historial de impresiones?')) {
                onClearHistory();
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600/20 text-slate-300 hover:text-rose-400 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Trash2 size={14} /> Vaciar Historial
          </button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/70 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Plantilla / Medida</th>
                <th className="py-3 px-4 text-center">Cantidad</th>
                <th className="py-3 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Clock size={32} className="mx-auto text-slate-600 mb-2" />
                    No hay registros de impresión en el historial todavía.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {new Date(item.timestamp).toLocaleString('es-PE')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">{item.productName}</td>
                    <td className="py-3 px-4 font-mono text-indigo-300">{item.productCode}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {item.templateName} ({item.dimensions})
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-white">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                        {item.quantity} un.
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle size={13} /> {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
