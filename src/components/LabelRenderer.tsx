import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { LabelTemplate, LabelElement, Product, AppConfig } from '../types';

interface LabelRendererProps {
  template: LabelTemplate;
  product?: Product;
  config: AppConfig;
  scale?: number; // Factor de zoom para pantalla (ej. 3 para 3px por mm aprox o cálculo responsivo)
  selectedElementId?: string | null;
  onSelectElement?: (elementId: string) => void;
  isInteractive?: boolean; // Permite arrastrar / seleccionar elementos en el diseñador
  onElementMove?: (id: string, deltaX: number, deltaY: number) => void;
}

export const LabelRenderer: React.FC<LabelRendererProps> = ({
  template,
  product,
  config,
  scale = 3.5, // 1mm = 3.5px por defecto para visualización clara
  selectedElementId,
  onSelectElement,
  isInteractive = false,
  onElementMove,
}) => {
  const containerWidthPx = template.widthMm * scale;
  const containerHeightPx = template.heightMm * scale;

  return (
    <div
      style={{
        width: `${containerWidthPx}px`,
        height: `${containerHeightPx}px`,
        position: 'relative',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
      className="label-box rounded-xs select-none print:shadow-none print:border-none"
    >
      {template.elements.map((el) => (
        <ElementItem
          key={el.id}
          element={el}
          product={product}
          config={config}
          scale={scale}
          isSelected={selectedElementId === el.id}
          onSelect={onSelectElement ? () => onSelectElement(el.id) : undefined}
          isInteractive={isInteractive}
          onMove={onElementMove}
        />
      ))}
    </div>
  );
};

interface ElementItemProps {
  element: LabelElement;
  product?: Product;
  config: AppConfig;
  scale: number;
  isSelected?: boolean;
  onSelect?: () => void;
  isInteractive?: boolean;
  onMove?: (id: string, deltaX: number, deltaY: number) => void;
}

const ElementItem: React.FC<ElementItemProps> = ({
  element,
  product,
  config,
  scale,
  isSelected,
  onSelect,
  isInteractive,
  onMove,
}) => {
  const barcodeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const dragStartRef = useRef<{ startX: number; startY: number } | null>(null);

  // Reemplazo de variables dinámicas
  const formatText = (text: string) => {
    if (!text) return '';
    let res = text;
    const cur = config.currency || 'S/';
    if (product) {
      res = res.replace(/\{\{nombre\}\}/gi, product.name);
      res = res.replace(/\{\{codigo\}\}/gi, product.code);
      res = res.replace(/\{\{precio\}\}/gi, `${cur} ${product.salePrice.toFixed(2)}`);
      res = res.replace(/\{\{precio_mayor\}\}/gi, `${cur} ${product.wholesalePrice.toFixed(2)}`);
      res = res.replace(/\{\{mayor_min\}\}/gi, String(product.wholesaleMinQty));
      res = res.replace(/\{\{categoria\}\}/gi, product.category);
      res = res.replace(/\{\{marca\}\}/gi, product.brand);
      res = res.replace(/\{\{stock\}\}/gi, String(product.stock));
    } else {
      res = res.replace(/\{\{nombre\}\}/gi, 'Producto Muestra');
      res = res.replace(/\{\{codigo\}\}/gi, '775123456789');
      res = res.replace(/\{\{precio\}\}/gi, `${cur} 49.90`);
      res = res.replace(/\{\{precio_mayor\}\}/gi, `${cur} 42.00`);
      res = res.replace(/\{\{mayor_min\}\}/gi, '6');
      res = res.replace(/\{\{categoria\}\}/gi, 'Tecnología');
      res = res.replace(/\{\{marca\}\}/gi, 'EtiquetaPro');
      res = res.replace(/\{\{stock\}\}/gi, '100');
    }
    const today = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    res = res.replace(/\{\{fecha\}\}/gi, today);
    res = res.replace(/\{\{empresa\}\}/gi, config.businessName || 'Mi Negocio');
    res = res.replace(/\{\{ruc\}\}/gi, config.businessRUC || '20601234567');
    return res;
  };

  const resolvedContent = formatText(element.content);

  // Render barcode
  useEffect(() => {
    if (element.type === 'barcode' && barcodeCanvasRef.current) {
      try {
        const barcodeVal = resolvedContent.trim() || '12345678';
        JsBarcode(barcodeCanvasRef.current, barcodeVal, {
          format: element.barcodeFormat || 'CODE128',
          displayValue: element.showBarcodeValue ?? true,
          fontSize: Math.max(9, Math.round((element.fontSize || 9) * (scale / 3.5))),
          margin: 1,
          background: 'transparent',
          lineColor: element.color || '#000000',
          width: 1.5,
          height: Math.max(15, (element.height * scale) - 18),
        });
      } catch (err) {
        console.warn('Barcode error:', err);
      }
    }
  }, [element, resolvedContent, scale]);

  // Render QR
  useEffect(() => {
    if (element.type === 'qrcode') {
      const qrVal = resolvedContent.trim() || 'https://etiquetapro.local';
      QRCode.toDataURL(qrVal, {
        margin: 0,
        width: Math.round(element.width * scale),
        color: {
          dark: element.color || '#000000',
          light: '#ffffff00',
        },
      })
        .then((url) => setQrUrl(url))
        .catch((err) => console.warn('QR error:', err));
    }
  }, [element, resolvedContent, scale]);

  // Manejador de Drag en el diseñador
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isInteractive) return;
    e.stopPropagation();
    onSelect?.();
    dragStartRef.current = { startX: e.clientX, startY: e.clientY };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current || !onMove) return;
      const deltaX = (moveEvent.clientX - dragStartRef.current.startX) / scale;
      const deltaY = (moveEvent.clientY - dragStartRef.current.startY) / scale;
      if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
        onMove(element.id, deltaX, deltaY);
        dragStartRef.current = { startX: moveEvent.clientX, startY: moveEvent.clientY };
      }
    };

    const handleMouseUp = () => {
      dragStartRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const leftPx = element.x * scale;
  const topPx = element.y * scale;
  const widthPx = element.width * scale;
  const heightPx = element.height * scale;
  const fontSizePx = (element.fontSize || 10) * (scale / 3.5) * 1.33;

  return (
    <div
      onClick={(e) => {
        if (isInteractive) {
          e.stopPropagation();
          onSelect?.();
        }
      }}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: `${leftPx}px`,
        top: `${topPx}px`,
        width: `${widthPx}px`,
        height: `${heightPx}px`,
        cursor: isInteractive ? 'move' : 'default',
        transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
        transformOrigin: 'center center',
      }}
      className={`flex items-center box-border transition-shadow ${
        isInteractive && isSelected ? 'outline-2 outline-indigo-600 outline-offset-1 z-30' : ''
      }`}
    >
      {/* TEXT / PRICE */}
      {(element.type === 'text' || element.type === 'price') && (
        <div
          style={{
            width: '100%',
            height: '100%',
            fontSize: `${fontSizePx}px`,
            fontFamily: element.fontFamily || 'Arial, sans-serif',
            fontWeight: element.fontWeight || (element.type === 'price' ? 'bold' : 'normal'),
            fontStyle: element.fontStyle || 'normal',
            textAlign: element.textAlign || (element.type === 'price' ? 'center' : 'left'),
            color: element.color || '#000000',
            lineHeight: 1.15,
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              element.textAlign === 'center'
                ? 'center'
                : element.textAlign === 'right'
                ? 'flex-end'
                : 'flex-start',
            overflow: 'hidden',
            wordBreak: 'break-word',
          }}
        >
          {resolvedContent}
        </div>
      )}

      {/* BARCODE */}
      {element.type === 'barcode' && (
        <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
          <canvas ref={barcodeCanvasRef} className="max-w-full max-h-full object-contain" />
        </div>
      )}

      {/* QR CODE */}
      {element.type === 'qrcode' && (
        <div className="w-full h-full flex items-center justify-center p-0.5">
          {qrUrl ? (
            <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain" />
          ) : (
            <div className="text-[9px] text-gray-400">QR</div>
          )}
        </div>
      )}

      {/* LINE */}
      {element.type === 'line' && (
        <div
          style={{
            width: '100%',
            height: `${element.borderWidth || 1}px`,
            backgroundColor: element.borderColor || '#000000',
          }}
        />
      )}

      {/* RECT */}
      {element.type === 'rect' && (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: element.backgroundColor || 'transparent',
            border: `${element.borderWidth || 1}px solid ${element.borderColor || '#000000'}`,
            borderRadius: '2px',
          }}
        />
      )}

      {/* IMAGE / LOGO */}
      {element.type === 'image' && (
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          {element.content && element.content.startsWith('data:image') ? (
            <img src={element.content} alt="Logo" className="w-full h-full object-contain" />
          ) : config.businessLogo ? (
            <img src={config.businessLogo} alt="Logo Empresa" className="w-full h-full object-contain" />
          ) : (
            <div className="text-[10px] text-gray-500 border border-dashed border-gray-400 w-full h-full flex items-center justify-center bg-gray-50">
              Logo / Imagen
            </div>
          )}
        </div>
      )}
    </div>
  );
};
