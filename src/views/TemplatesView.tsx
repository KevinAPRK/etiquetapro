import React, { useRef } from 'react';
import { 
  FileText, 
  Plus, 
  Upload, 
  Download, 
  Edit, 
  Trash2, 
  Copy, 
  Sparkles,
  Tag
} from 'lucide-react';
import { LabelTemplate, Product, AppConfig } from '../types';
import { LabelRenderer } from '../components/LabelRenderer';

interface TemplatesViewProps {
  templates: LabelTemplate[];
  sampleProduct: Product;
  config: AppConfig;
  onEditTemplate: (template: LabelTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onDuplicateTemplate: (template: LabelTemplate) => void;
  onImportTemplate: (template: LabelTemplate) => void;
  onNewTemplate: () => void;
  onUseInGenerator: (template: LabelTemplate) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  templates,
  sampleProduct,
  config,
  onEditTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
  onImportTemplate,
  onNewTemplate,
  onUseInGenerator,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = (tpl: LabelTemplate) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tpl, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${tpl.name.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.name && json.elements && Array.isArray(json.elements)) {
          const newTpl: LabelTemplate = {
            ...json,
            id: 'tpl-imp-' + Date.now(),
            createdAt: new Date().toISOString(),
          };
          onImportTemplate(newTpl);
          alert('¡Plantilla importada con éxito!');
        } else {
          alert('El archivo no contiene un formato válido de plantilla EtiquetaPro.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="text-indigo-400" />
            Sistema de Plantillas
          </h1>
          <p className="text-xs text-slate-400">
            Administra tus diseños guardados o crea nuevas medidas para tus productos ({templates.length} plantillas).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Upload size={15} /> Importar Plantilla JSON
          </button>
          <button
            onClick={onNewTemplate}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus size={16} /> CREAR PLANTILLA
          </button>
        </div>
      </div>

      {/* Grid de Plantillas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {tpl.widthMm} × {tpl.heightMm} mm
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 uppercase font-semibold">
                  {tpl.category || 'personalizado'}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">{tpl.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                {tpl.description || 'Diseño de etiqueta'}
              </p>
            </div>

            {/* Vista previa viva */}
            <div className="bg-slate-950 p-4 rounded-xl flex items-center justify-center min-h-[160px] my-2 overflow-hidden border border-slate-800/80 shadow-inner">
              <div className="transform scale-80 origin-center">
                <LabelRenderer
                  template={tpl}
                  product={sampleProduct}
                  config={config}
                  scale={2.6}
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditTemplate(tpl)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Editar en Diseñador"
                >
                  <Edit size={15} />
                </button>
                <button
                  onClick={() => onDuplicateTemplate(tpl)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Duplicar Plantilla"
                >
                  <Copy size={15} />
                </button>
                <button
                  onClick={() => handleExportJSON(tpl)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Exportar archivo .json"
                >
                  <Download size={15} />
                </button>
                {!tpl.isPreset && (
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar la plantilla "${tpl.name}"?`)) {
                        onDeleteTemplate(tpl.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white transition-all cursor-pointer"
                    title="Eliminar plantilla"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              <button
                onClick={() => onUseInGenerator(tpl)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Tag size={14} /> Usar Plantilla
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
