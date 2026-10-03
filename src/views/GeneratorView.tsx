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
  Maximize2
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
  const [printMode, setPrintMode] = useState<'thermal' | 'sheet'>('thermal'); // thermal = 1 por etiqueta, sheet = A4 grid
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Parámetros para hoja A4
  const [columnsA4, setColumnsA4] = useState<number>(3);
  const [rowsA4, setRowsA4] = useState<number>(8);
  const [marginMm, setMarginMm] = useState<number>(5);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Imprimir directo con ventana de impresión del sistema
  const handleDirectPrint = () => {
    if (!selectedProduct || !selectedTemplate) return;

    // Crear ventana oculta de impresión para no alterar el layout
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Por favor permite ventanas emergentes para imprimir.');
      return;
    }

    const labelHtml = document.getElementById('preview-label-container')?.innerHTML || '';

    // Generar las etiquetas según cantidad y modo
    let contentHtml = '';
    if (printMode === 'thermal') {
      for (let i = 0; i < quantity; i++) {
        contentHtml += `
          <div class="thermal-label-page" style="page-break-after: always; display: flex; justify-content: center; align-items: center; width: ${selectedTemplate.widthMm}mm; height: ${selectedTemplate.heightMm}mm;">
            ${labelHtml}
          </div>
        `;
      }
    } else {
      // Modo cuadrícula A4
      contentHtml += `
        <div style="width: 210mm; min-height: 297mm; padding: ${marginMm}mm; display: flex; flex-wrap: wrap; gap: 2mm; box-sizing: border-box;">
      `;
      for (let i = 0; i < quantity; i++) {
        contentHtml += `
          <div style="width: ${selectedTemplate.widthMm}mm; height: ${selectedTemplate.heightMm}mm; display: inline-block;">
            ${labelHtml}
          </div>
        `;
      }
      contentHtml += `</div>`;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impresión - ${selectedProduct.name}</title>
          <style>
            @page {
              size: ${printMode === 'thermal' ? `${selectedTemplate.widthMm}mm ${selectedTemplate.heightMm}mm` : 'A4'};
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background: #fff;
              font-family: Arial, sans-serif;
            }
            .label-box {
              box-shadow: none !important;
              border: none !important;
            }
          </style>
        </head>
        <body>
          ${contentHtml}
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

    // Registrar en historial
    onRecordPrint({
      productName: selectedProduct.name,
      productCode: selectedProduct.code,
      templateName: selectedTemplate.name,
      quantity,
      dimensions: `${selectedTemplate.widthMm}x${selectedTemplate.heightMm}mm`,
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
        // PDF tamaño A4
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pageWidth = 210;
        const pageHeight = 297;
        const labelW = selectedTemplate.widthMm;
        const labelH = selectedTemplate.heightMm;

        let curX = marginMm;
        let curY = marginMm;

        for (let i = 0; i < quantity; i++) {
          // Comprobar si cabe en X
          if (curX + labelW > pageWidth - marginMm) {
            curX = marginMm;
            curY += labelH + 2;
          }

          // Comprobar si cabe en Y
          if (curY + labelH > pageHeight - marginMm) {
            doc.addPage();
            curX = marginMm;
            curY = marginMm;
          }

          doc.addImage(imgData, 'PNG', curX, curY, labelW, labelH);
          curX += labelW + 2;
        }

        doc.save(`Etiquetas_A4_${selectedProduct.code}_${quantity}un.pdf`);
      }

      onRecordPrint({
        productName: selectedProduct.name,
        productCode: selectedProduct.code,
        templateName: selectedTemplate.name,
        quantity,
        dimensions: `${selectedTemplate.widthMm}x${selectedTemplate.heightMm}mm (PDF)`,
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
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name} ({config.currency} {p.salePrice.toFixed(2)})
                </option>
              ))}
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
                4. Tipo de Impresión
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setPrintMode('thermal')}
                  className={`w-full p-2 rounded-xl border text-xs font-medium text-left flex items-center gap-2 transition-all cursor-pointer ${
                    printMode === 'thermal'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Printer size={16} className={printMode === 'thermal' ? 'text-indigo-400' : ''} />
                  <div>
                    <div className="font-bold">Rollo Térmico (1x1)</div>
                    <div className="text-[10px] text-slate-400">Zebra, TSC, Brother</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintMode('sheet')}
                  className={`w-full p-2 rounded-xl border text-xs font-medium text-left flex items-center gap-2 transition-all cursor-pointer ${
                    printMode === 'sheet'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Layers size={16} className={printMode === 'sheet' ? 'text-indigo-400' : ''} />
                  <div>
                    <div className="font-bold">Hoja A4 / Carta</div>
                    <div className="text-[10px] text-slate-400">Cuadrícula adhesiva</div>
                  </div>
                </button>
              </div>
            </div>
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Vista Previa en Tiempo Real
              </h2>
              <p className="text-xs text-slate-400">
                Así se verá impresa en tu etiqueta de {selectedTemplate.widthMm}x{selectedTemplate.heightMm}mm
              </p>
            </div>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
              Escala 1:1 aproximada
            </span>
          </div>

          <div
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-8 flex items-center justify-center min-h-[350px] relative overflow-hidden"
            style={{
              backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          >
            <div id="preview-label-container" className="transform scale-110 shadow-2xl">
              <LabelRenderer
                template={selectedTemplate}
                product={selectedProduct}
                config={config}
                scale={4.2}
              />
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Impresora asignada: <strong className="text-white">{config.defaultPrinter}</strong>
            </span>
            <span>
              Total a imprimir: <strong className="text-indigo-400">{quantity} etiquetas</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
