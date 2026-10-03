import React, { useState } from 'react';
import { 
  Printer, 
  FileDown, 
  CheckSquare, 
  Square, 
  Layers, 
  Sliders, 
  Sparkles,
  Search,
  Check
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import { Product, LabelTemplate, AppConfig } from '../types';
import { LabelRenderer } from '../components/LabelRenderer';

interface PrintBatchViewProps {
  products: Product[];
  templates: LabelTemplate[];
  config: AppConfig;
  onRecordPrint: (item: any) => void;
}

interface BatchItem {
  productId: string;
  quantity: number;
}

export const PrintBatchView: React.FC<PrintBatchViewProps> = ({
  products,
  templates,
  config,
  onRecordPrint,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [selectedPrinter, setSelectedPrinter] = useState<string>(config.defaultPrinter);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [batchItems, setBatchItems] = useState<BatchItem[]>(
    products.slice(0, 3).map((p) => ({ productId: p.id, quantity: 10 }))
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const toggleProductInBatch = (product: Product) => {
    const exists = batchItems.find((b) => b.productId === product.id);
    if (exists) {
      setBatchItems(batchItems.filter((b) => b.productId !== product.id));
    } else {
      setBatchItems([...batchItems, { productId: product.id, quantity: 10 }]);
    }
  };

  const updateItemQty = (productId: string, qty: number) => {
    setBatchItems(
      batchItems.map((b) => (b.productId === productId ? { ...b, quantity: Math.max(1, qty) } : b))
    );
  };

  const totalLabels = batchItems.reduce((acc, curr) => acc + curr.quantity, 0);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrintBatch = () => {
    if (batchItems.length === 0 || !selectedTemplate) {
      alert('Selecciona al menos un producto para imprimir.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Por favor habilita las ventanas emergentes en tu navegador.');
      return;
    }

    let allPagesHtml = '';
    batchItems.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) return;
      const el = document.getElementById(`batch-preview-${prod.id}`);
      const content = el?.innerHTML || '';
      for (let i = 0; i < item.quantity; i++) {
        allPagesHtml += `
          <div class="page" style="page-break-after: always; display: flex; align-items: center; justify-content: center; width: ${selectedTemplate.widthMm}mm; height: ${selectedTemplate.heightMm}mm;">
            ${content}
          </div>
        `;
      }
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impresión en Lote - ${selectedTemplate.name}</title>
          <style>
            @page {
              size: ${selectedTemplate.widthMm}mm ${selectedTemplate.heightMm}mm;
              margin: 0;
            }
            body { margin: 0; padding: 0; background: #fff; }
            .label-box { box-shadow: none !important; border: none !important; }
          </style>
        </head>
        <body>
          ${allPagesHtml}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();

    onRecordPrint({
      productName: `Lote de ${batchItems.length} productos`,
      productCode: 'LOTE-VARIOS',
      templateName: selectedTemplate.name,
      quantity: totalLabels,
      dimensions: `${selectedTemplate.widthMm}x${selectedTemplate.heightMm}mm`,
      status: 'completado',
    });

    confetti({ particleCount: 80, spread: 70 });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Printer className="text-indigo-400" />
          Impresión Profesional & En Lote
        </h1>
        <p className="text-xs text-slate-400">
          Configura tu impresora térmica (Zebra, TSC, Brother, Epson) e imprime múltiples productos en una sola tanda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Panel Configuración & Selección */}
        <div className="lg:col-span-7 space-y-6">
          {/* Parámetros de Impresora */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders size={16} className="text-indigo-400" />
              Configuración de Salida
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Impresora de Destino
                </label>
                <select
                  value={selectedPrinter}
                  onChange={(e) => setSelectedPrinter(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Zebra GK420 / ZD Series">Zebra GK420 / ZD Series</option>
                  <option value="TSC TE200 / DA210">TSC TE200 / DA210</option>
                  <option value="Brother QL Series">Brother QL Series</option>
                  <option value="Xprinter XP-420B">Xprinter XP-420B</option>
                  <option value="Epson TM-T20 / TM Series">Epson TM Series</option>
                  <option value="Impresora Estándar Windows">Impresora Estándar Windows</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Plantilla / Medida
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.widthMm}x{t.heightMm}mm)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Selección de Productos para el Lote */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Productos Seleccionados ({batchItems.length})
                </h2>
                <p className="text-xs text-slate-400">Total acumulado: {totalLabels} etiquetas</p>
              </div>

              <div className="relative w-48">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrar..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white"
                />
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
              {filteredProducts.map((p) => {
                const inBatch = batchItems.find((b) => b.productId === p.id);
                return (
                  <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div
                      onClick={() => toggleProductInBatch(p)}
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    >
                      {inBatch ? (
                        <CheckSquare size={18} className="text-indigo-400 shrink-0" />
                      ) : (
                        <Square size={18} className="text-slate-600 shrink-0" />
                      )}
                      <div className="truncate">
                        <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {p.code} | {config.currency} {p.salePrice.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {inBatch && (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-slate-400">Copias:</span>
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={inBatch.quantity}
                          onChange={(e) => updateItemQty(p.id, parseInt(e.target.value) || 1)}
                          className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-bold"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel Resumen y Ejecución */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Resumen del Lote
            </h2>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Impresora seleccionada:</span>
                <span className="font-semibold text-white">{selectedPrinter}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Formato de papel:</span>
                <span className="font-mono text-indigo-400">
                  {selectedTemplate.widthMm} × {selectedTemplate.heightMm} mm
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total de productos distintos:</span>
                <span className="font-semibold text-white">{batchItems.length} ítems</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-700 font-bold">
                <span>Total de Etiquetas a Imprimir:</span>
                <span className="text-base text-emerald-400">{totalLabels} un.</span>
              </div>
            </div>

            {/* Muestra de los elementos ocultos para renderizado de impresión */}
            <div className="hidden">
              {batchItems.map((item) => {
                const p = products.find((prod) => prod.id === item.productId);
                if (!p) return null;
                return (
                  <div key={p.id} id={`batch-preview-${p.id}`}>
                    <LabelRenderer
                      template={selectedTemplate}
                      product={p}
                      config={config}
                      scale={3.5}
                    />
                  </div>
                );
              })}
            </div>

            {/* Botón de Impresión Masiva */}
            <button
              onClick={handlePrintBatch}
              disabled={batchItems.length === 0}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Printer size={20} />
              ENVIAR LOTE A IMPRESORA ({totalLabels} ETIQUETAS)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
