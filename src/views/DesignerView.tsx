import React, { useState } from 'react';
import { 
  Palette, 
  Save, 
  Plus, 
  Trash2, 
  Copy, 
  Type, 
  Barcode, 
  QrCode, 
  DollarSign, 
  Minus, 
  Square, 
  Image as ImageIcon, 
  Calendar, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Sparkles,
  Download,
  FolderOpen,
  ArrowRightLeft,
  Check
} from 'lucide-react';
import { LabelTemplate, LabelElement, Product, AppConfig, ElementType } from '../types';
import { LabelRenderer } from '../components/LabelRenderer';

interface DesignerViewProps {
  initialTemplate?: LabelTemplate;
  products: Product[];
  config: AppConfig;
  onSaveTemplate: (template: LabelTemplate) => void;
}

export const DesignerView: React.FC<DesignerViewProps> = ({
  initialTemplate,
  products,
  config,
  onSaveTemplate,
}) => {
  // Plantilla activa
  const [template, setTemplate] = useState<LabelTemplate>(() => {
    if (initialTemplate) return JSON.parse(JSON.stringify(initialTemplate));
    return {
      id: 'tpl-custom-' + Date.now(),
      name: 'Nueva Etiqueta Personalizada',
      description: 'Etiqueta diseñada a medida',
      widthMm: 50,
      heightMm: 30,
      orientation: 'landscape',
      elements: [
        {
          id: 'el-' + Date.now() + '-1',
          type: 'text',
          x: 2,
          y: 2,
          width: 46,
          height: 6,
          content: '{{nombre}}',
          fontSize: 10,
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#000000',
        },
        {
          id: 'el-' + Date.now() + '-2',
          type: 'barcode',
          x: 4,
          y: 9,
          width: 42,
          height: 12,
          content: '{{codigo}}',
          barcodeFormat: 'CODE128',
          showBarcodeValue: true,
          textAlign: 'center',
        },
        {
          id: 'el-' + Date.now() + '-3',
          type: 'price',
          x: 2,
          y: 22,
          width: 46,
          height: 6,
          content: '{{precio}}',
          fontSize: 13,
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#000000',
        },
      ],
      isPreset: false,
      category: 'personalizado',
      createdAt: new Date().toISOString(),
    };
  });

  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    template.elements[0]?.id || null
  );

  const [previewProduct, setPreviewProduct] = useState<Product>(
    products[0] || {
      id: 'P001',
      code: '775123456789',
      name: 'Audífonos Bluetooth Pro TWS',
      category: 'Tecnología',
      brand: 'SoundWave',
      costPrice: 28,
      salePrice: 49.9,
      wholesalePrice: 42.0,
      wholesaleMinQty: 6,
      stock: 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const [zoomScale, setZoomScale] = useState<number>(4.0); // 1mm = 4px en pantalla
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [blackenedFeedback, setBlackenedFeedback] = useState(false);

  const selectedElement = template.elements.find((el) => el.id === selectedElementId) || null;

  // Agregar nuevo elemento
  const handleAddElement = (type: ElementType) => {
    const newId = 'el-' + Date.now();
    let newElement: LabelElement;

    switch (type) {
      case 'text':
        newElement = {
          id: newId,
          type: 'text',
          x: 5,
          y: 5,
          width: Math.min(35, template.widthMm - 10),
          height: 6,
          content: 'Nuevo Texto',
          fontSize: 9,
          fontWeight: 'normal',
          textAlign: 'left',
          color: '#000000',
        };
        break;
      case 'price':
        newElement = {
          id: newId,
          type: 'price',
          x: 5,
          y: 10,
          width: Math.min(30, template.widthMm - 10),
          height: 8,
          content: '{{precio}}',
          fontSize: 14,
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#000000',
        };
        break;
      case 'barcode':
        newElement = {
          id: newId,
          type: 'barcode',
          x: 5,
          y: 12,
          width: Math.min(40, template.widthMm - 10),
          height: 12,
          content: '{{codigo}}',
          barcodeFormat: 'CODE128',
          showBarcodeValue: true,
          textAlign: 'center',
        };
        break;
      case 'qrcode':
        newElement = {
          id: newId,
          type: 'qrcode',
          x: 5,
          y: 5,
          width: 15,
          height: 15,
          content: '{{codigo}}',
        };
        break;
      case 'line':
        newElement = {
          id: newId,
          type: 'line',
          x: 2,
          y: 8,
          width: template.widthMm - 4,
          height: 1,
          content: '',
          borderColor: '#000000',
          borderWidth: 1,
        };
        break;
      case 'rect':
        newElement = {
          id: newId,
          type: 'rect',
          x: 2,
          y: 2,
          width: template.widthMm - 4,
          height: template.heightMm - 4,
          content: '',
          backgroundColor: 'transparent',
          borderColor: '#000000',
          borderWidth: 1,
        };
        break;
      case 'image':
        newElement = {
          id: newId,
          type: 'image',
          x: 2,
          y: 2,
          width: 15,
          height: 15,
          content: config.businessLogo || '',
        };
        break;
    }

    setTemplate({
      ...template,
      elements: [...template.elements, newElement],
    });
    setSelectedElementId(newId);
  };

  // Mover elemento en el lienzo
  const handleElementMove = (id: string, deltaX: number, deltaY: number) => {
    setTemplate((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => {
        if (el.id !== id) return el;
        const newX = Math.max(0, Math.min(prev.widthMm - el.width, Math.round((el.x + deltaX) * 2) / 2));
        const newY = Math.max(0, Math.min(prev.heightMm - el.height, Math.round((el.y + deltaY) * 2) / 2));
        return { ...el, x: newX, y: newY };
      }),
    }));
  };

  // Actualizar elemento seleccionado
  const handleUpdateSelected = (changes: Partial<LabelElement>) => {
    if (!selectedElementId) return;
    setTemplate({
      ...template,
      elements: template.elements.map((el) =>
        el.id === selectedElementId ? { ...el, ...changes } : el
      ),
    });
  };

  // Borrar elemento seleccionado
  const handleDeleteSelected = () => {
    if (!selectedElementId) return;
    const remaining = template.elements.filter((el) => el.id !== selectedElementId);
    setTemplate({ ...template, elements: remaining });
    setSelectedElementId(remaining[0]?.id || null);
  };

  // Duplicar elemento seleccionado
  const handleDuplicateSelected = () => {
    if (!selectedElement) return;
    const duplicated: LabelElement = {
      ...JSON.parse(JSON.stringify(selectedElement)),
      id: 'el-' + Date.now(),
      x: Math.min(template.widthMm - selectedElement.width, selectedElement.x + 2),
      y: Math.min(template.heightMm - selectedElement.height, selectedElement.y + 2),
    };
    setTemplate({
      ...template,
      elements: [...template.elements, duplicated],
    });
    setSelectedElementId(duplicated.id);
  };

  // Convertir Código de Barras en Código QR
  const handleConvertBarcodeToQR = () => {
    if (!selectedElement || selectedElement.type !== 'barcode') return;
    const qrSize = Math.min(selectedElement.width, selectedElement.height, 16);
    const converted: LabelElement = {
      ...selectedElement,
      type: 'qrcode',
      width: Math.max(10, Math.min(qrSize > 5 ? qrSize : 15, template.widthMm - selectedElement.x)),
      height: Math.max(10, Math.min(qrSize > 5 ? qrSize : 15, template.heightMm - selectedElement.y)),
    };
    handleUpdateSelected(converted);
  };

  // Convertir Código QR en Código de Barras
  const handleConvertQRToBarcode = () => {
    if (!selectedElement || selectedElement.type !== 'qrcode') return;
    const converted: LabelElement = {
      ...selectedElement,
      type: 'barcode',
      width: Math.min(Math.max(selectedElement.width * 1.8, 25), template.widthMm - selectedElement.x),
      height: Math.max(8, Math.min(selectedElement.height, template.heightMm - selectedElement.y)),
      barcodeFormat: 'CODE128',
      showBarcodeValue: true,
    };
    handleUpdateSelected(converted);
  };

  // Convertir una imagen (dibujo, logo, firma) a tinta negra pura para impresión térmica
  const convertImageToPureBlack = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width || 300;
            canvas.height = img.naturalHeight || img.height || 300;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(imageSrc);

            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const a = data[i + 3];

              // Si el píxel tiene opacidad visible
              if (a > 20) {
                const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
                // Si no es fondo blanco/muy claro (umbral 235), convertir a negro puro sólido
                if (luminance < 235) {
                  data[i] = 0;       // R
                  data[i + 1] = 0;   // G
                  data[i + 2] = 0;   // B
                  data[i + 3] = 255; // Opaco sólido
                } else {
                  // Fondo blanco pasa a transparente para no tapar elementos
                  data[i] = 255;
                  data[i + 1] = 255;
                  data[i + 2] = 255;
                  data[i + 3] = 0;
                }
              }
            }

            ctx.putImageData(imgData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } catch (e) {
            console.warn('Canvas conversion error:', e);
            resolve(imageSrc);
          }
        };
        img.onerror = () => resolve(imageSrc);
        img.src = imageSrc;
      } catch {
        resolve(imageSrc);
      }
    });
  };

  // Volver elemento seleccionado a Negro Puro (#000000)
  const handleMakePureBlack = async () => {
    if (!selectedElement) return;

    if (selectedElement.type === 'image') {
      const src = selectedElement.content || config.businessLogo;
      if (src) {
        const blackened = await convertImageToPureBlack(src);
        handleUpdateSelected({ content: blackened });
      }
    } else if (selectedElement.type === 'line' || selectedElement.type === 'rect') {
      handleUpdateSelected({
        borderColor: '#000000',
        color: '#000000',
      });
    } else {
      // text, price, barcode, qrcode
      handleUpdateSelected({ color: '#000000' });
    }

    setBlackenedFeedback(true);
    setTimeout(() => setBlackenedFeedback(false), 2000);
  };

  // Volver todos los elementos de la plantilla a Negro Puro
  const handleMakeAllPureBlack = async () => {
    const updated = await Promise.all(
      template.elements.map(async (el) => {
        if (el.type === 'image') {
          const src = el.content || config.businessLogo;
          if (src) {
            const blackened = await convertImageToPureBlack(src);
            return { ...el, content: blackened };
          }
          return el;
        }
        if (el.type === 'line' || el.type === 'rect') {
          return { ...el, borderColor: '#000000', color: '#000000' };
        }
        return { ...el, color: '#000000' };
      })
    );
    setTemplate((prev) => ({ ...prev, elements: updated }));
    setBlackenedFeedback(true);
    setTimeout(() => setBlackenedFeedback(false), 2000);
  };

  // Guardar plantilla
  const handleSave = () => {
    onSaveTemplate(template);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Exportar archivo JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(template, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${template.name.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Subir imagen para elemento tipo image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedElement) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      handleUpdateSelected({ content: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const dynamicVariables = [
    { label: 'Nombre Producto', tag: '{{nombre}}' },
    { label: 'Código Barras', tag: '{{codigo}}' },
    { label: 'Precio Regular', tag: '{{precio}}' },
    { label: 'Precio Mayorista', tag: '{{precio_mayor}}' },
    { label: 'Mínimo Mayorista', tag: '{{mayor_min}}' },
    { label: 'Marca', tag: '{{marca}}' },
    { label: 'Categoría', tag: '{{categoria}}' },
    { label: 'Fecha Actual', tag: '{{fecha}}' },
    { label: 'Nombre Negocio', tag: '{{empresa}}' },
  ];

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col p-4 max-w-[1700px] mx-auto select-none">
      {/* Barra superior de herramientas del Diseñador */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 mb-4 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
            <Palette size={20} />
          </div>
          <div>
            <input
              type="text"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              className="bg-transparent text-white font-bold text-base focus:bg-slate-800 px-2 py-0.5 rounded border border-transparent focus:border-slate-700 outline-none"
              placeholder="Nombre de la plantilla"
            />
            <div className="text-[11px] text-slate-400 px-2">Diseñador interactivo tipo Canva</div>
          </div>
        </div>

        {/* Tamaño del papel y orientación */}
        <div className="flex items-center gap-4 bg-slate-800/80 px-4 py-1.5 rounded-xl border border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span>Ancho:</span>
            <input
              type="number"
              min="5"
              max="200"
              value={template.widthMm}
              onChange={(e) => setTemplate({ ...template, widthMm: Number(e.target.value) || 20 })}
              className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-white font-bold"
            />
            <span className="text-[11px] text-slate-400">mm</span>
          </div>

          <span className="text-slate-600 font-bold">×</span>

          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span>Alto:</span>
            <input
              type="number"
              min="5"
              max="200"
              value={template.heightMm}
              onChange={(e) => setTemplate({ ...template, heightMm: Number(e.target.value) || 10 })}
              className="w-14 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-white font-bold"
            />
            <span className="text-[11px] text-slate-400">mm</span>
          </div>
        </div>

        {/* Zoom y Acciones */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setZoomScale((z) => Math.max(2, z - 0.5))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded cursor-pointer"
              title="Reducir Zoom"
            >
              <ZoomOut size={15} />
            </button>
            <span className="text-[11px] font-mono px-2 text-slate-300">
              {Math.round((zoomScale / 3.5) * 100)}%
            </span>
            <button
              onClick={() => setZoomScale((z) => Math.min(8, z + 0.5))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded cursor-pointer"
              title="Aumentar Zoom"
            >
              <ZoomIn size={15} />
            </button>
          </div>

          <button
            onClick={handleExportJSON}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            title="Exportar archivo JSON de la plantilla"
          >
            <Download size={15} /> Exportar JSON
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Save size={16} />
            {saveSuccess ? '¡Guardada!' : 'Guardar Plantilla'}
          </button>
        </div>
      </div>

      {/* Contenido principal en 3 columnas: [Caja de herramientas] - [Lienzo Canva] - [Panel Propiedades] */}
      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden min-h-0">
        {/* Columna Izquierda: Paleta de Elementos */}
        <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 overflow-y-auto shadow-md">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Añadir Elementos
          </div>

          <button
            onClick={() => handleAddElement('text')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600/20 hover:border-indigo-500 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer text-left"
          >
            <Type size={16} className="text-indigo-400" />
            <span>Texto Libre / Título</span>
          </button>

          <button
            onClick={() => handleAddElement('price')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-emerald-600/20 hover:border-emerald-500 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer text-left"
          >
            <DollarSign size={16} className="text-emerald-400" />
            <span>Precio Destacado</span>
          </button>

          <button
            onClick={() => handleAddElement('barcode')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-purple-600/20 hover:border-purple-500 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer text-left"
          >
            <Barcode size={16} className="text-purple-400" />
            <span>Código de Barras</span>
          </button>

          <button
            onClick={() => handleAddElement('qrcode')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-blue-600/20 hover:border-blue-500 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer text-left"
          >
            <QrCode size={16} className="text-blue-400" />
            <span>Código QR</span>
          </button>

          <button
            onClick={() => handleAddElement('line')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer text-left"
          >
            <Minus size={16} className="text-slate-400" />
            <span>Línea Separadora</span>
          </button>

          <button
            onClick={() => handleAddElement('rect')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer text-left"
          >
            <Square size={16} className="text-slate-400" />
            <span>Marco / Rectángulo</span>
          </button>

          <button
            onClick={() => handleAddElement('image')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-amber-600/20 hover:border-amber-500 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer text-left"
          >
            <ImageIcon size={16} className="text-amber-400" />
            <span>Logo o Imagen</span>
          </button>

          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400">Previsualizar con:</span>
            <select
              value={previewProduct.id}
              onChange={(e) => {
                const found = products.find((p) => p.id === e.target.value);
                if (found) setPreviewProduct(found);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name.slice(0, 20)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Columna Central: Lienzo Interactivo tipo Canva */}
        <div
          onClick={() => setSelectedElementId(null)}
          className="col-span-7 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 relative overflow-auto shadow-inner"
          style={{
            backgroundImage:
              'radial-gradient(circle, #334155 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          {/* Reglas o dimensiones visibles y botón Todo a Negro */}
          <div className="absolute top-3 left-4 flex items-center gap-2 z-10">
            <div className="text-xs font-mono text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
              Lienzo: {template.widthMm}mm × {template.heightMm}mm | Elementos: {template.elements.length}
            </div>
            <button
              type="button"
              onClick={handleMakeAllPureBlack}
              className="text-xs text-slate-300 hover:text-white bg-slate-900/90 hover:bg-black px-2.5 py-1 rounded border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
              title="Convertir todos los textos, códigos, marcos y dibujos de la plantilla a negro puro (#000000)"
            >
              {blackenedFeedback ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-300 font-semibold">¡Todo a Negro!</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-black border border-white inline-block"></span>
                  <span>Todo a Negro Puro</span>
                </>
              )}
            </button>
          </div>

          {/* Lienzo renderizado editable */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="transition-transform duration-100 ease-out"
          >
            <LabelRenderer
              template={template}
              product={previewProduct}
              config={config}
              scale={zoomScale}
              selectedElementId={selectedElementId}
              onSelectElement={(id) => setSelectedElementId(id)}
              isInteractive={true}
              onElementMove={handleElementMove}
            />
          </div>

          <div className="absolute bottom-3 text-xs text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-800">
            💡 Arrastra los elementos libremente dentro de la etiqueta.
          </div>
        </div>

        {/* Columna Derecha: Inspector de Propiedades */}
        <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between overflow-y-auto shadow-md">
          {selectedElement ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Propiedades: {selectedElement.type.toUpperCase()}
                </span>
                <div className="flex items-center gap-1">
                  {selectedElement.type === 'barcode' && (
                    <button
                      onClick={handleConvertBarcodeToQR}
                      className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white cursor-pointer flex items-center gap-1 text-[10px] font-semibold px-2"
                      title="Convertir este código de barras a código QR"
                    >
                      <ArrowRightLeft size={12} /> Convertir a QR
                    </button>
                  )}
                  {selectedElement.type === 'qrcode' && (
                    <button
                      onClick={handleConvertQRToBarcode}
                      className="p-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white cursor-pointer flex items-center gap-1 text-[10px] font-semibold px-2"
                      title="Convertir este código QR a código de barras"
                    >
                      <ArrowRightLeft size={12} /> Convertir a Barras
                    </button>
                  )}
                  <button
                    onClick={handleMakePureBlack}
                    className="p-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white border border-slate-700 cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold px-2 shadow-sm transition-all"
                    title={
                      selectedElement.type === 'image'
                        ? 'Convertir este dibujo o logo a tinta negra pura térmica'
                        : 'Volver este texto o elemento a negro puro (#000000)'
                    }
                  >
                    {blackenedFeedback ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-300">¡Negro!</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-white ring-1 ring-slate-400 inline-block"></span>
                        <span>Volver Negro</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDuplicateSelected}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                    title="Duplicar elemento"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white cursor-pointer"
                    title="Eliminar elemento"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Posición y Dimensiones */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-slate-400 text-[11px] block">X (mm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={selectedElement.x}
                    onChange={(e) => handleUpdateSelected({ x: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] block">Y (mm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={selectedElement.y}
                    onChange={(e) => handleUpdateSelected({ y: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] block">Ancho (mm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={selectedElement.width}
                    onChange={(e) => handleUpdateSelected({ width: parseFloat(e.target.value) || 5 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] block">Alto (mm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={selectedElement.height}
                    onChange={(e) => handleUpdateSelected({ height: parseFloat(e.target.value) || 5 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                  />
                </div>
              </div>

              {/* Contenido / Texto */}
              {selectedElement.type !== 'line' && selectedElement.type !== 'rect' && selectedElement.type !== 'image' && (
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">
                    Contenido / Fórmula Dinámica
                  </label>
                  <textarea
                    rows={2}
                    value={selectedElement.content}
                    onChange={(e) => handleUpdateSelected({ content: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 font-mono"
                  />

                  {/* Variables Rápidas */}
                  <div className="mt-1">
                    <span className="text-[10px] text-slate-400 block mb-1">Insertar comodín:</span>
                    <div className="flex flex-wrap gap-1">
                      {dynamicVariables.map((v) => (
                        <button
                          key={v.tag}
                          type="button"
                          onClick={() =>
                            handleUpdateSelected({
                              content: selectedElement.content
                                ? `${selectedElement.content} ${v.tag}`
                                : v.tag,
                            })
                          }
                          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-indigo-600/30 text-indigo-300 text-[10px] font-mono border border-slate-700 cursor-pointer"
                        >
                          {v.tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Subir imagen si es tipo image */}
              {selectedElement.type === 'image' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-slate-400 text-[11px] block mb-1">Subir Logo / Dibujo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full text-xs text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer"
                    />
                  </div>

                  {/* Herramienta Térmica: Volver Dibujo a Negro Puro */}
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-200 block">
                      Optimizador Térmico para Dibujos / Logos
                    </span>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Convierte cualquier logo, dibujo a mano o firma de color a <b>tinta negra pura (#000000)</b> con fondo transparente para que imprima con máxima definición en impresoras térmicas.
                    </p>
                    <button
                      type="button"
                      onClick={handleMakePureBlack}
                      className="w-full py-2 px-3 rounded-lg bg-black hover:bg-neutral-850 text-white border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
                    >
                      {blackenedFeedback ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          <span className="text-emerald-300">¡Dibujo Convertido a Negro Puro!</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-white ring-2 ring-black inline-block"></span>
                          <span>Volver Dibujo a Negro Puro</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Propiedades de Línea o Marco */}
              {(selectedElement.type === 'line' || selectedElement.type === 'rect') && (
                <div className="space-y-2">
                  <div>
                    <label className="text-slate-400 text-[11px] block">Grosor de Trazo (px)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={selectedElement.borderWidth || 1}
                      onChange={(e) =>
                        handleUpdateSelected({ borderWidth: parseInt(e.target.value) || 1 })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleMakePureBlack}
                    className="w-full py-1.5 px-3 rounded-lg bg-black hover:bg-neutral-850 text-white border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow transition-all"
                  >
                    <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
                    <span>Volver Trazo a Negro Puro</span>
                  </button>
                </div>
              )}

              {/* Tipografía y Alineación (si aplica) */}
              {(selectedElement.type === 'text' || selectedElement.type === 'price') && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-slate-400 text-[11px] block">Tamaño Fuente</label>
                      <input
                        type="number"
                        min="6"
                        max="36"
                        value={selectedElement.fontSize || 10}
                        onChange={(e) =>
                          handleUpdateSelected({ fontSize: parseInt(e.target.value) || 10 })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[11px] block">Alineación</label>
                      <select
                        value={selectedElement.textAlign || 'left'}
                        onChange={(e) =>
                          handleUpdateSelected({ textAlign: e.target.value as any })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                      >
                        <option value="left">Izquierda</option>
                        <option value="center">Centro</option>
                        <option value="right">Derecha</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedElement.fontWeight === 'bold'}
                        onChange={(e) =>
                          handleUpdateSelected({
                            fontWeight: e.target.checked ? 'bold' : 'normal',
                          })
                        }
                        className="rounded text-indigo-600"
                      />
                      Negrita (Bold)
                    </label>

                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedElement.fontStyle === 'italic'}
                        onChange={(e) =>
                          handleUpdateSelected({
                            fontStyle: e.target.checked ? 'italic' : 'normal',
                          })
                        }
                        className="rounded text-indigo-600"
                      />
                      Cursiva
                    </label>
                  </div>
                </div>
              )}

              {/* Opciones de Código de barras */}
              {selectedElement.type === 'barcode' && (
                <div className="space-y-2">
                  <div>
                    <label className="text-slate-400 text-[11px] block">Formato de Barras</label>
                    <select
                      value={selectedElement.barcodeFormat || 'CODE128'}
                      onChange={(e) =>
                        handleUpdateSelected({ barcodeFormat: e.target.value as any })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    >
                      <option value="CODE128">CODE128 (Universal)</option>
                      <option value="EAN13">EAN13 (Comercio)</option>
                      <option value="UPC">UPC</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedElement.showBarcodeValue ?? true}
                      onChange={(e) =>
                        handleUpdateSelected({ showBarcodeValue: e.target.checked })
                      }
                      className="rounded text-indigo-600"
                    />
                    Mostrar números abajo del código
                  </label>

                  <button
                    type="button"
                    onClick={handleConvertBarcodeToQR}
                    className="w-full mt-2 py-2 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowRightLeft size={14} />
                    Convertir este Código a QR
                  </button>
                </div>
              )}

              {/* Opciones de Código QR */}
              {selectedElement.type === 'qrcode' && (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-400">
                    Genera un código QR 2D óptimo para escanear con cualquier celular o lector óptico.
                  </p>
                  <button
                    type="button"
                    onClick={handleConvertQRToBarcode}
                    className="w-full mt-2 py-2 px-3 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowRightLeft size={14} />
                    Convertir este QR a Código de Barras
                  </button>
                </div>
              )}

              {/* Color y Negro Puro */}
              {selectedElement.type !== 'image' && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-400 text-[11px] font-semibold">
                      Color / Tinta
                    </label>
                    <button
                      type="button"
                      onClick={handleMakePureBlack}
                      className="px-2 py-1 rounded bg-black hover:bg-neutral-850 text-white border border-slate-700 text-[10px] font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                      title="Volver letra, código o trazo inmediatamente a negro puro (#000000)"
                    >
                      {blackenedFeedback ? (
                        <>
                          <Check size={12} className="text-emerald-400" />
                          <span className="text-emerald-300">¡Listo en Negro!</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-white ring-1 ring-slate-400 inline-block"></span>
                          <span>Volver a Negro Puro</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedElement.color || selectedElement.borderColor || '#000000'}
                      onChange={(e) =>
                        handleUpdateSelected({
                          color: e.target.value,
                          borderColor: e.target.value,
                        })
                      }
                      className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-mono text-slate-300">
                      {selectedElement.color || selectedElement.borderColor || '#000000'}
                    </span>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateSelected({ color: '#000000', borderColor: '#000000' })
                        }
                        className="w-6 h-6 rounded-full bg-black border border-slate-500 hover:scale-110 transition-transform cursor-pointer shadow-sm"
                        title="Negro Puro (#000000)"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateSelected({ color: '#333333', borderColor: '#333333' })
                        }
                        className="w-6 h-6 rounded-full bg-neutral-700 border border-slate-500 hover:scale-110 transition-transform cursor-pointer shadow-sm"
                        title="Gris Oscuro (#333333)"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateSelected({ color: '#2563eb', borderColor: '#2563eb' })
                        }
                        className="w-6 h-6 rounded-full bg-blue-600 border border-slate-500 hover:scale-110 transition-transform cursor-pointer shadow-sm"
                        title="Azul (#2563eb)"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateSelected({ color: '#dc2626', borderColor: '#dc2626' })
                        }
                        className="w-6 h-6 rounded-full bg-red-600 border border-slate-500 hover:scale-110 transition-transform cursor-pointer shadow-sm"
                        title="Rojo (#dc2626)"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-slate-400">
              <Eye size={36} className="text-slate-600 mb-2" />
              <p className="text-xs font-medium">Ningún elemento seleccionado</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Haz clic sobre cualquier elemento del lienzo para editar su posición, texto, tipografía o propiedades.
              </p>
            </div>
          )}

          {/* Lista de Capas */}
          <div className="pt-3 border-t border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Capas ({template.elements.length})
            </span>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {template.elements.map((el, idx) => (
                <div
                  key={el.id}
                  onClick={() => setSelectedElementId(el.id)}
                  className={`px-2 py-1 rounded text-[11px] flex items-center justify-between cursor-pointer ${
                    selectedElementId === el.id
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="truncate">
                    {idx + 1}. {el.type}: {el.content || '(vacío)'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
