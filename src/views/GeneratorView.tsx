import React, { useState } from 'react';
import { 
  Tag, 
  Printer, 
  FileDown, 
  Layers, 
  Settings2, 
  CheckCircle, 
  Sparkles,
  Sliders,
  Maximize2,
  Grid,
  Info,
  Check
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import { Product, LabelTemplate, AppConfig } from '../types';
import { LabelRenderer } from '../components/LabelRenderer';

interface GeneratorViewProps {
  products: Product[];
  templates: LabelTemplate[];
  config: AppConfig;
  initialProduct?: Product | null;
  onRecordPrint: (item: {
    productName: string;
    productCode: string;
    templateName: string;
    quantity: number;
    dimensions: string;
    status: 'completado' | 'cancelado';
  }) => void;
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({
  products,
  templates,
  config,
  initialProduct,
  onRecordPrint,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProduct?.id || products[0]?.id || ''
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(100);
  // Modo de impresión: 'sheet' por defecto para que impresoras como Canon, Epson, HP aprovechen el papel al máximo
  const [printMode, setPrintMode] = useState<'sheet' | 'thermal'>('sheet');
  const [paperSize, setPaperSize] = useState<'a4' | 'letter'>('a4');
  const [marginMm, setMarginMm] = useState<number>(5);
  const [gapMm, setGapMm] = useState<number>(2);
  const [showCutGuides, setShowCutGuides] = useState<boolean>(true);
  const [previewTab, setPreviewTab] = useState<'sheet' | 'single'>('sheet');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const defaultSampleProduct: Product = {
    id: 'sample-p',
    code: '775012345678',
    name: 'Producto de Prueba',
    category: 'Muestra',
    brand: 'Genérica',
    costPrice: 10,
    salePrice: 25.00,
    wholesalePrice: 20.00,
    wholesaleMinQty: 6,
    stock: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0] || defaultSampleProduct;
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Dimensiones del papel
  const paperDimensions: Record<'a4' | 'letter', { width: number; height: number; name: string }> = {
    a4: { width: 210, height: 297, name: 'A4' },
    letter: { width: 215.9, height: 279.4, name: 'Carta' },
  };

  const currentSheet = paperDimensions[paperSize] || paperDimensions.a4;
  const labelW = selectedTemplate ? selectedTemplate.widthMm : 50;
  const labelH = selectedTemplate ? selectedTemplate.heightMm : 30;

  const usableW = Math.max(10, currentSheet.width - 2 * marginMm);
  const usableH = Math.max(10, currentSheet.height - 2 * marginMm);

  // Columnas y filas calculadas automáticamente para encajar al máximo en la hoja según la medida de la etiqueta
  const autoColumns = Math.max(1, Math.floor((usableW + gapMm) / (labelW + gapMm)));
  const autoRows = Math.max(1, Math.floor((usableH + gapMm) / (labelH + gapMm)));
  const labelsPerSheet = autoColumns * autoRows;
  const totalSheetsNeeded = Math.ceil(quantity / labelsPerSheet);
  const savedSheets = Math.max(0, quantity - totalSheetsNeeded);

  // Imprimir directo con ventana de impresión del sistema
  const handleDirectPrint = () => {
    if (!selectedTemplate) return;

    // Crear ventana oculta de impresión para no alterar el layout
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Por favor permite ventanas emergentes para imprimir.');
      return;
    }

    const printSource = document.getElementById('print-source-container') || document.getElementById('preview-label-container');
    const labelHtml = printSource?.innerHTML || '';

    // Generar las etiquetas según cantidad y modo
    let contentHtml = '';
    if (printMode === 'thermal') {
      for (let i = 0; i < quantity; i++) {
        const isLast = i === quantity - 1;
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
              ${labelHtml}
            </div>
          </div>
        `;
      }
    } else {
      // Modo distribución inteligente en Hoja (A4 / Carta)
      let labelsRemaining = quantity;

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
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="width: ${labelW}mm; height: ${labelH}mm; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                ${labelHtml}
              </div>
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

        labelsRemaining -= labelsInThisSheet;
      }
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impresión - ${selectedProduct.name}</title>
          <style>
            @page {
              size: ${printMode === 'thermal' ? `${selectedTemplate.widthMm}mm ${selectedTemplate.heightMm}mm` : `${paperSize} portrait`};
              margin: 0;
            }
            * {
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 0;
              background: #fff;
              font-family: Arial, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .label-box {
              box-shadow: none !important;
              border: none !important;
              width: ${selectedTemplate.widthMm}mm !important;
              height: ${selectedTemplate.heightMm}mm !important;
            }
            .sheet-page {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .sheet-label-item {
              page-break-inside: avoid;
              break-inside: avoid;
            }
          </style>
        </head>
        <body>
          ${contentHtml}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() { window.close(); }, 700);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();

    // Registrar en historial
    onRecordPrint({
      productName: selectedProduct.name,
      productCode: selectedProduct.code,
      templateName: selectedTemplate.name,
      quantity,
      dimensions: printMode === 'sheet' 
        ? `${currentSheet.name} (${autoColumns}x${autoRows}=${labelsPerSheet}/hoja)`
        : `${selectedTemplate.widthMm}x${selectedTemplate.heightMm}mm (Térmica)`,
      status: 'completado',
    });

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.8 } });
  };

  // Exportar a PDF
  const handleExportPDF = async () => {
    if (!selectedProduct || !selectedTemplate) return;
    setIsGeneratingPdf(true);

    try {
      const labelElement = document.getElementById('preview-label-container');
      if (!labelElement) return;

      const canvas = await html2canvas(labelElement, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');

      if (printMode === 'thermal') {
        // PDF con tamaño exacto de la etiqueta térmica
        const orientation = selectedTemplate.widthMm > selectedTemplate.heightMm ? 'landscape' : 'portrait';
        const doc = new jsPDF({
          orientation: orientation as any,
          unit: 'mm',
          format: [selectedTemplate.widthMm, selectedTemplate.heightMm],
        });

        for (let i = 0; i < quantity; i++) {
          if (i > 0) doc.addPage([selectedTemplate.widthMm, selectedTemplate.heightMm], orientation as any);
          doc.addImage(imgData, 'PNG', 0, 0, selectedTemplate.widthMm, selectedTemplate.heightMm);
        }

        doc.save(`Etiquetas_${selectedProduct.code}_${quantity}un.pdf`);
      } else {
        // PDF tamaño A4 / Carta con distribución de etiquetas optimizada
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: paperSize,
        });

        let labelsOnCurSheet = 0;

        for (let i = 0; i < quantity; i++) {
          if (labelsOnCurSheet >= labelsPerSheet) {
            doc.addPage(paperSize, 'portrait');
            labelsOnCurSheet = 0;
          }

          const col = labelsOnCurSheet % autoColumns;
          const row = Math.floor(labelsOnCurSheet / autoColumns);

          const posX = marginMm + col * (labelW + gapMm);
          const posY = marginMm + row * (labelH + gapMm);

          if (showCutGuides) {
            doc.setDrawColor(210, 210, 210);
            doc.setLineDashPattern([1, 1], 0);
            doc.rect(posX, posY, labelW, labelH);
          }

          doc.addImage(imgData, 'PNG', posX, posY, labelW, labelH);
          labelsOnCurSheet++;
        }

        doc.save(`Etiquetas_${paperSize.toUpperCase()}_${selectedProduct.code}_${quantity}un.pdf`);
      }

      onRecordPrint({
        productName: selectedProduct.name,
        productCode: selectedProduct.code,
        templateName: selectedTemplate.name,
        quantity,
        dimensions: printMode === 'sheet'
          ? `${currentSheet.name} (${autoColumns}x${autoRows}=${labelsPerSheet}/hoja PDF)`
          : `${selectedTemplate.widthMm}x${selectedTemplate.heightMm}mm (PDF)`,
        status: 'completado',
      });

      confetti({ particleCount: 60, spread: 50, origin: { y: 0.8 } });
    } catch (err) {
      console.error(err);
      alert('Hubo un error al generar el archivo PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Tag className="text-indigo-400" />
          Generador de Etiquetas
        </h1>
        <p className="text-xs text-slate-400">
          Selecciona el producto, el diseño y la cantidad para imprimir o exportar a PDF al instante.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Panel Izquierdo: Selección y Configuración */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          {/* Selección de Producto */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              1. Seleccionar Producto
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-indigo-500 font-medium"
            >
              {products.length === 0 ? (
                <option value="">(Sin productos registrados - Modo muestra)</option>
              ) : (
                products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name} ({config.currency} {p.salePrice.toFixed(2)})
                  </option>
                ))
              )}
            </select>

            {/* Ficha resumida del producto */}
            {selectedProduct && (
              <div className="mt-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white">{selectedProduct.name}</div>
                  <div className="text-slate-400 text-[11px]">
                    Código: <span className="font-mono text-indigo-300">{selectedProduct.code}</span> | Cat: {selectedProduct.category}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-400 text-sm">
                    {config.currency} {selectedProduct.salePrice.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Mayor: {config.currency} {selectedProduct.wholesalePrice.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
            {products.length === 0 && (
              <div className="mt-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-300">
                ℹ️ Catálogo vacío: Viendo etiqueta con datos de muestra. Agrega productos en la pestaña <strong>Productos</strong> cuando lo desees.
              </div>
            )}
          </div>

          {/* Selección de Plantilla */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              2. Seleccionar Diseño / Plantilla
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {templates.map((tpl) => {
                const isSelected = tpl.id === selectedTemplateId;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold truncate">{tpl.name}</span>
                      {isSelected && <CheckCircle size={15} className="text-indigo-400 shrink-0" />}
                    </div>
                    <div className="text-[11px] font-mono text-indigo-300">
                      {tpl.widthMm} × {tpl.heightMm} mm
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cantidad y Configuración de Impresión */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                3. Cantidad de Copias
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-bold text-white text-center focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-1.5 mt-2">
                {[10, 50, 100, 200].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuantity(q)}
                    className={`flex-1 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                      quantity === q
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                4. Modo de Impresión
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setPrintMode('sheet');
                    setPreviewTab('sheet');
                  }}
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    printMode === 'sheet'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers size={18} className={printMode === 'sheet' ? 'text-indigo-400' : ''} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold flex items-center gap-1.5">
                      Hoja Completa (A4 / Carta)
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                        Ahorro de Papel
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Para Canon, Epson, HP. Distribuye varias en 1 hoja.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPrintMode('thermal');
                    setPreviewTab('single');
                  }}
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    printMode === 'thermal'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Printer size={18} className={printMode === 'thermal' ? 'text-indigo-400' : ''} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold">Rollo Térmico Continuo</div>
                    <div className="text-[10px] text-slate-400">Zebra, TSC, Xprinter (1 por etiqueta)</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Parámetros de Distribución en Hoja */}
            {printMode === 'sheet' && (
              <div className="col-span-2 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Grid size={14} className="text-indigo-400" />
                    Distribución Inteligente en Hoja
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    {labelsPerSheet} etiquetas / hoja
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="text-slate-400 text-[11px] block mb-1">Tamaño de Hoja</label>
                    <select
                      value={paperSize}
                      onChange={(e) => setPaperSize(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                    >
                      <option value="a4">A4 (210×297 mm)</option>
                      <option value="letter">Carta (216×279 mm)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px] block mb-1">Margen Hoja (mm)</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={marginMm}
                      onChange={(e) => setMarginMm(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px] block mb-1">Separación (mm)</label>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={gapMm}
                      onChange={(e) => setGapMm(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCutGuides}
                      onChange={(e) => setShowCutGuides(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Mostrar guías de corte punteadas (para tijera/cúter)</span>
                  </label>
                </div>

                {/* Banner de Ahorro y Optimización */}
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-start gap-2 text-xs text-emerald-300">
                  <Sparkles size={16} className="shrink-0 mt-0.5 text-emerald-400" />
                  <div>
                    <strong>{autoColumns} columnas × {autoRows} filas = {labelsPerSheet} etiquetas por hoja {currentSheet.name}.</strong>
                    <div className="text-[11px] text-emerald-400/90 mt-0.5">
                      Para tus <strong>{quantity} etiquetas</strong> solo usarás <strong>{totalSheetsNeeded} hoja(s)</strong> de papel (¡Ahorras {savedSheets} hojas!).
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDirectPrint}
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Printer size={18} />
              IMPRIMIR AHORA ({quantity} un.)
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isGeneratingPdf}
              className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <FileDown size={18} />
              {isGeneratingPdf ? 'Generando...' : 'Exportar PDF'}
            </button>
          </div>
        </div>

        {/* Panel Derecho: Vista Previa en Vivo */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Vista Previa en Tiempo Real
              </h2>
              <p className="text-xs text-slate-400">
                {previewTab === 'sheet' && printMode === 'sheet'
                  ? `Distribución en Hoja ${currentSheet.name}: ${labelsPerSheet} etiquetas por hoja`
                  : `Etiqueta individual: ${selectedTemplate.widthMm} × ${selectedTemplate.heightMm} mm`}
              </p>
            </div>

            {/* Selector de Pestañas de Vista Previa */}
            <div className="flex rounded-lg bg-slate-800 p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setPreviewTab('sheet')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  previewTab === 'sheet'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mosaico Hoja ({labelsPerSheet})
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('single')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  previewTab === 'single'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Individual (1:1)
              </button>
            </div>
          </div>

          <div
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-6 flex items-center justify-center min-h-[380px] relative overflow-hidden"
            style={{
              backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          >
            {/* Vista Previa: Mosaico de Hoja */}
            {previewTab === 'sheet' && printMode === 'sheet' ? (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <div
                  style={{
                    width: '260px',
                    height: `${Math.round((260 * currentSheet.height) / currentSheet.width)}px`,
                    padding: `${Math.round((marginMm / currentSheet.width) * 260)}px`,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${autoColumns}, 1fr)`,
                    gridTemplateRows: `repeat(${autoRows}, 1fr)`,
                    gap: `${Math.max(1, Math.round((gapMm / currentSheet.width) * 260))}px`,
                  }}
                  className="bg-white rounded-sm shadow-2xl border border-slate-300 relative box-border overflow-hidden select-none"
                >
                  {Array.from({ length: Math.min(quantity, labelsPerSheet) }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-full h-full border border-dashed border-indigo-300/80 bg-slate-50/50 flex flex-col items-center justify-center overflow-hidden p-0.5 rounded-[1px]"
                    >
                      <span className="text-[5.5px] font-bold text-slate-800 truncate w-full text-center leading-none">
                        {selectedProduct.name}
                      </span>
                      <span className="text-[4.5px] text-slate-600 font-mono leading-none mt-0.5">
                        {config.currency} {selectedProduct.salePrice.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-center text-xs text-slate-400">
                  Simulación de Hoja <strong>{currentSheet.name}</strong> con <strong>{labelsPerSheet} etiquetas</strong> distribuidas.
                </div>
              </div>
            ) : (
              /* Vista Previa: Etiqueta Individual */
              <div id="preview-label-container" className="transform scale-110 shadow-2xl">
                <LabelRenderer
                  template={selectedTemplate}
                  product={selectedProduct}
                  config={config}
                  scale={4.2}
                />
              </div>
            )}
          </div>

          {/* Contenedor fuente para impresión a escala 1mm = 3.78px */}
          <div id="print-source-container" className="hidden">
            <LabelRenderer
              template={selectedTemplate}
              product={selectedProduct}
              config={config}
              scale={3.78}
            />
          </div>

          <div className="mt-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Impresora / Modo: <strong className="text-white">
                {printMode === 'sheet' ? `Hoja ${currentSheet.name} (Canon, Epson, HP)` : config.defaultPrinter}
              </strong>
            </span>
            <span>
              Total a imprimir: <strong className="text-indigo-400">
                {quantity} etiquetas {printMode === 'sheet' && `(${totalSheetsNeeded} hojas)`}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
