import React, { useRef, useState } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  Database, 
  RefreshCcw, 
  CheckCircle2, 
  AlertTriangle,
  FolderArchive
} from 'lucide-react';
import { StorageService } from '../services/storage';

interface BackupViewProps {
  onDataRestored: () => void;
}

export const BackupView: React.FC<BackupViewProps> = ({ onDataRestored }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCreateBackup = () => {
    const backupJson = StorageService.createBackupData();
    const today = new Date();
    const dateFormatted = `${String(today.getDate()).padStart(2, '0')}_${String(
      today.getMonth() + 1
    ).padStart(2, '0')}_${today.getFullYear()}`;
    const filename = `backup_etiquetapro_${dateFormatted}.json`;

    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSuccessMsg(`Copia de seguridad "${filename}" descargada con éxito.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const ok = StorageService.restoreBackupData(text);
        if (ok) {
          onDataRestored();
          alert('¡Copia de seguridad restaurada correctamente con todos tus productos y diseños!');
        } else {
          alert('El archivo no tiene una estructura válida de respaldo.');
        }
      } catch (err) {
        alert('Ocurrió un error al procesar el archivo de copia de seguridad.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const currentProducts = StorageService.getProducts();
  const currentTemplates = StorageService.getTemplates();
  const currentHistory = StorageService.getHistory();

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="text-emerald-400" />
          Copias de Seguridad (Backup)
        </h1>
        <p className="text-xs text-slate-400">
          Respalda todos tus productos, diseños personalizados, historial y configuración en un archivo seguro para llevar a otra computadora o restaurar en cualquier momento.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Estado actual de la base de datos */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Database size={16} className="text-indigo-400" />
          Estado de la Base de Datos Local
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
            <div className="text-slate-400 text-xs">Productos Registrados</div>
            <div className="text-2xl font-black text-white mt-1">{currentProducts.length}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
            <div className="text-slate-400 text-xs">Plantillas & Diseños</div>
            <div className="text-2xl font-black text-indigo-400 mt-1">{currentTemplates.length}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
            <div className="text-slate-400 text-xs">Registros de Historial</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{currentHistory.length}</div>
          </div>
        </div>
      </div>

      {/* Opciones de Backup y Restauración */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Crear Backup */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="p-3 w-fit rounded-xl bg-indigo-500/10 text-indigo-400 mb-4">
              <Download size={24} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Crear Copia de Seguridad</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Descarga un archivo seguro con todos tus productos, precios, plantillas personalizadas y configuraciones comerciales.
            </p>
          </div>

          <button
            onClick={handleCreateBackup}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <FolderArchive size={16} />
            CREAR BACKUP AHORA
          </button>
        </div>

        {/* Restaurar Backup */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 mb-4">
              <Upload size={24} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Restaurar Copia de Seguridad</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Carga un archivo de respaldo generado previamente para recuperar tus datos o transferir el catálogo a otra computadora.
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleRestoreFile}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Upload size={16} />
            SELECCIONAR ARCHIVO DE RESPALDO
          </button>
        </div>
      </div>
    </div>
  );
};
