export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  brand: string;
  costPrice: number;
  salePrice: number;
  wholesalePrice: number;
  wholesaleMinQty: number;
  stock: number;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export type ElementType = 'text' | 'barcode' | 'qrcode' | 'price' | 'line' | 'rect' | 'image';

export interface LabelElement {
  id: string;
  type: ElementType;
  x: number; // en mm
  y: number; // en mm
  width: number; // en mm
  height: number; // en mm
  content: string; // ej. {{nombre}}, {{precio}}, texto libre o URL para QR
  fontSize?: number; // en puntos o mm
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  barcodeFormat?: 'CODE128' | 'EAN13' | 'UPC';
  showBarcodeValue?: boolean;
  rotation?: number; // 0, 90, 180, 270
}

export interface LabelTemplate {
  id: string;
  name: string;
  description: string;
  widthMm: number;
  heightMm: number;
  orientation: 'landscape' | 'portrait';
  elements: LabelElement[];
  isPreset?: boolean;
  category?: 'tienda' | 'mayorista' | 'joyeria' | 'farmacia' | 'ropa' | 'logistica' | 'personalizado' | 'micro' | 'mini';
  createdAt?: string;
  updatedAt?: string;
}

export interface PrintHistoryItem {
  id: string;
  timestamp: string;
  productName: string;
  productCode: string;
  templateName: string;
  quantity: number;
  dimensions: string;
  status: 'completado' | 'cancelado';
}

export interface AppConfig {
  currency: string;
  businessName: string;
  businessLogo?: string;
  businessRUC?: string;
  businessAddress?: string;
  businessPhone?: string;
  defaultPaperWidth: number;
  defaultPaperHeight: number;
  defaultPrinter: string;
  measurementUnit: 'mm';
}
