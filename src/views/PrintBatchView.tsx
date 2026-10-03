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
  Check,
  Grid
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
  const [printMode, setPrintMode] = useState<'sheet' | 'thermal'>('sheet');
  const [paperSize, setPaperSize] = useState<'a4' | 'letter'>('a4');
  const [marginMm, setMarginMm] = useState<number>(5);
  const [gapMm, setGapMm] = useState<number>(2);
  const [showCutGuides, setShowCutGuides] = useState<boolean>(true);
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

  // Dimensiones del papel para distribución
  const paperDimensions: Record<'a4' | 'letter', { width: number; height: number; name: string }> = {
    a4: { width: 210, height: 297, name: 'A4' },
    letter: { width: 215.9, height: 279.4, name: 'Carta' },
  };

  const currentSheet = paperDimensions[paperSize] || paperDimensions.a4;
  const labelW = selectedTemplate ? selectedTemplate.widthMm : 50;
  const labelH = selectedTemplate ? selectedTemplate.heightMm : 30;

  const usableW = Math.max(10, currentSheet.width - 2 * marginMm);
  const usableH = Math.max(10, currentSheet.height - 2 * marginMm);

  const autoColumns = Math.max(1, Math.floor((usableW + gapMm) / (labelW + gapMm)));
  const autoRows = Math.max(1, Math.floor((usableH + gapMm) / (labelH + gapMm)));
  const labelsPerSheet = autoColumns * autoRows;
  const totalSheetsNeeded = Math.ceil(totalLabels / labelsPerSheet);
  const savedSheets = Math.max(0, totalLabels - totalSheetsNeeded);

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

    const allLabels: string[] = [];
    batchItems.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) return;
      const el = document.getElementById(`batch-preview-${prod.id}`);
      const content = el?.innerHTML || '';
      for (let i = 0; i < item.quantity; i++) {
        allLabels.push(content);
      }
    });

    let contentHtml = '';
    if (printMode === 'thermal') {
      for (let i = 0; i < allLabels.length; i++) {
        const isLast = i === allLabels.length - 1;
        contentHtml += `
          <div class="thermal-label-page" style="
            width: ${selectedTemplate.widthMm}mm;
            height: ${selectedTemplate.heightMm}mm;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            box-sizing: border-box;
            ${!isLast ? 'page-break-after: always; break-after: page;' : 'page-break-after: auto; break-after: auto;'}
          ">
            <div style="width: ${selectedTemplate.widthMm}mm; height: ${selectedTemplate.heightMm}mm; overflow: hidden; display: flex; align-items: center; justify-content: center;">
              ${allLabels[i]}
            </div>
          </div>
        `;
      }
    } else {
      // Modo distribución inteligente en Hoja A4 / Carta
      let labelsRemaining = allLabels.length;
      let currentIndex = 0;

      while (labelsRemaining > 0) {
        const labelsInThisSheet = Math.min(labelsRemaining, labelsPerSheet);
        const isLastSheet = labelsRemaining <= labelsPerSheet;

        let sheetLabelsHtml = '';
        for (let l = 0; l < labelsInThisSheet; l++) {
          sheetLabelsHtml += `
            <div class="sheet-label-item" style="
              width: ${labelW}mm;
              height: ${labelH}mm;
              box-sizing: border-box;
              overflow: hidden;
              position: relative;
              ${showCutGuides ? 'border: 0.5px dashed #cbd5e1;' : ''}
            ">
              ${allLabels[currentIndex + l]}
            </div>
          `;
        }

        contentHtml += `
          <div class="sheet-page" style="
            width: ${currentSheet.width}mm;
            height: ${currentSheet.height}mm;
            padding: ${marginMm}mm;
            box-sizing: border-box;
            overflow: hidden;
            background: #ffffff;
            display: grid;
            grid-template-columns: repeat(${autoColumns}, ${labelW}mm);
            grid-template-rows: repeat(${autoRows}, ${labelH}mm);
            gap: ${gapMm}mm;
            justify-content: start;
            align-content: start;
            ${!isLastSheet ? 'page-break-after: always; break-after: page;' : 'page-break-after: auto; break-after: auto;'}
          ">
            ${sheetLabelsHtml}
          </div>
        `;

        currentIndex += labelsInThisSheet;
        labelsRemaining -= labelsInThisSheet;
      }
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impresión en Lote - ${selectedTemplate.name}</title>
          <style>
            @page {
              size: ${printMode === 'thermal' ? `${selectedTemplate.widthMm}mm ${selectedTemplate.heightMm}mm` : `${paperSize} portrait`};
              margin: 0;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background: #fff;
              font-family: Arial, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .sheet-page {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .sheet-label-item {
              width: ${labelW}mm !important;
              height: ${labelH}mm !important;
              page-break-inside: avoid;
              break-inside: avoid;
              overflow: hidden;
              position: relative;
              box-sizing: border-box;
            }
            .sheet-label-item > .label-box,
            .thermal-label-page > .label-box {
              width: 100% !important;
              height: 100% !important;
              position: relative !important;
              overflow: hidden !important;
              box-shadow: none !important;
              border: none !important;
              background-color: #fff !important;
            }
            img {
              width: 100% !important;
              height: 100% !important;
              max-width: 100% !important;
              max-height: 100% !important;
              object-fit: contain !important;
              display: block !important;
            }
            canvas {
              max-width: 100% !important;
              max-height: 100% !important;
              object-fit: contain !important;
              display: block !important;
            }
          </style>
        </head>
        <body>
          ${contentHtml}
          <script>
            window.onload = function() {
              var imgs = Array.from(document.images);
              if (imgs.length === 0) {
                window.focus();
                window.print();
                setTimeout(function() { window.close(); }, 700);
                return;
              }
              var pending = imgs.length;
              function onOneDone() {
                pending--;
                if (pending <= 0) {
                  window.focus();
                  window.print();
                  setTimeout(function() { window.close(); }, 700);
                }
              }
              imgs.forEach(function(img) {
                if (img.complete) {
                  onOneDone();
                } else {
                  img.addEventListener('load', onOneDone);
                  img.addEventListener('error', onOneDone);
                }
              });
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
      dimensions: printMode === 'sheet'
        ? `${currentSheet.name} (${autoColumns}x${autoRows}=${labelsPerSheet}/hoja)`
        : `${selectedTemplate.widthMm}x${selectedTemplate.heightMm}mm (Térmica)`,
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
                  <option value="Canon G3070 / Inyección A4">Canon G3070 / Inyección A4</option>
                  <option value="Epson EcoTank / Serie L (A4)">Epson EcoTank (A4)</option>
                  <option value="HP DeskJet / LaserJet (A4)">HP DeskJet / LaserJet (A4)</option>
                  <option value="Zebra GK420 / ZD Series">Zebra GK420 / ZD Series</option>
                  <option value="TSC TE200 / DA210">TSC TE200 / DA210</option>
                  <option value="Brother QL Series">Brother QL Series</option>
                  <option value="Xprinter XP-420B">Xprinter XP-420B</option>
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

            {/* Modo de Impresión para Lote */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Modo de Salida
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPrintMode('sheet')}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    printMode === 'sheet'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers size={18} className={printMode === 'sheet' ? 'text-indigo-400' : ''} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold flex items-center gap-1.5">
                      Hoja A4 / Carta
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                        Ahorro
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Para Canon, Epson, HP. Agrupa el lote en hojas.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintMode('thermal')}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    printMode === 'thermal'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Printer size={18} className={printMode === 'thermal' ? 'text-indigo-400' : ''} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold">Rollo Térmico (1x1)</div>
                    <div className="text-[10px] text-slate-400">Zebra, TSC, Brother</div>
                  </div>
                </button>
              </div>

              {printMode === 'sheet' && (
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="grid grid-cols-3 gap-2.5 text-xs">
                    <div>
                      <label className="text-slate-400 text-[11px] block mb-1">Papel</label>
                      <select
                        value={paperSize}
                        onChange={(e) => setPaperSize(e.target.value as any)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                      >
                        <option value="a4">A4 (210×297)</option>
                        <option value="letter">Carta</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 text-[11px] block mb-1">Margen (mm)</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={marginMm}
                        onChange={(e) => setMarginMm(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[11px] block mb-1">Espacio (mm)</label>
                      <input
                        type="number"
                        min="0"
                        max="15"
                        value={gapMm}
                        onChange={(e) => setGapMm(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center"
                      />
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center justify-between">
                    <span>
                      📐 <strong>{labelsPerSheet} etiquetas</strong> por hoja {currentSheet.name} ({autoColumns}x{autoRows})
                    </span>
                    <span className="font-semibold text-emerald-400">
                      Total: {totalSheetsNeeded} hoja(s)
                    </span>
                  </div>
                </div>
              )}
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
              {filteredProducts.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No hay productos para mostrar. Agrega productos en el módulo Productos para imprimir por lote.
                </div>
              ) : (
                filteredProducts.map((p) => {
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
              })
            )}
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
            <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', visibility: 'visible', pointerEvents: 'none', zIndex: -1 }}>
              {batchItems.map((item) => {
                const p = products.find((prod) => prod.id === item.productId);
                if (!p) return null;
                return (
                  <div key={p.id} id={`batch-preview-${p.id}`}>
                    <LabelRenderer
                      template={selectedTemplate}
                      product={p}
                      config={config}
                      scale={3.78}
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
