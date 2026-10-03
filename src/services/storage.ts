import { Product, LabelTemplate, PrintHistoryItem, AppConfig } from '../types';
import { SupabaseService } from './supabase';

const STORAGE_KEYS = {
  PRODUCTS: 'etiquetapro_products_v1',
  TEMPLATES: 'etiquetapro_templates_v1',
  HISTORY: 'etiquetapro_history_v1',
  CONFIG: 'etiquetapro_config_v1',
};

export const DEFAULT_CONFIG: AppConfig = {
  currency: 'S/',
  businessName: 'Mi Negocio & Tienda',
  businessRUC: '20601234567',
  businessAddress: 'Av. Principal 123',
  businessPhone: '+51 987 654 321',
  defaultPaperWidth: 50,
  defaultPaperHeight: 30,
  defaultPrinter: 'Zebra GK420 / Térmica USB',
  measurementUnit: 'mm',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'P001',
    code: '775123456789',
    name: 'Audífonos Bluetooth Pro TWS',
    category: 'Tecnología',
    brand: 'SoundWave',
    costPrice: 28.00,
    salePrice: 49.90,
    wholesalePrice: 42.00,
    wholesaleMinQty: 6,
    stock: 45,
    description: 'Cancelación de ruido, estuche de carga 300mAh, bluetooth 5.3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'P002',
    code: '775987654321',
    name: 'Cable USB-C Carga Rápida 65W',
    category: 'Accesorios',
    brand: 'PowerLink',
    costPrice: 6.50,
    salePrice: 19.90,
    wholesalePrice: 14.50,
    wholesaleMinQty: 12,
    stock: 120,
    description: 'Cable reforzado trenzado 1.5m con chip E-marker',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'P003',
    code: '775456789123',
    name: 'Botella Térmica Inox 750ml',
    category: 'Hogar & Bazar',
    brand: 'HydroCool',
    costPrice: 15.00,
    salePrice: 35.00,
    wholesalePrice: 28.00,
    wholesaleMinQty: 10,
    stock: 28,
    description: 'Mantiene frío 24h y caliente 12h, libre de BPA',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'P004',
    code: '775321654987',
    name: 'Polo Algodón Pima Cuello Redondo',
    category: 'Textil & Moda',
    brand: 'UrbanCotton',
    costPrice: 22.00,
    salePrice: 55.00,
    wholesalePrice: 45.00,
    wholesaleMinQty: 6,
    stock: 80,
    description: '100% Algodón Pima reactivo, acabado suave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const INITIAL_TEMPLATES: LabelTemplate[] = [
  {
    id: 'tpl-tienda-50x30',
    name: 'Tienda Minorista (50x30mm)',
    description: 'Diseño clásico con Código de barras, nombre de producto y precio destacado.',
    widthMm: 50,
    heightMm: 30,
    orientation: 'landscape',
    category: 'tienda',
    isPreset: true,
    createdAt: new Date().toISOString(),
    elements: [
      {
        id: 'el-1',
        type: 'text',
        x: 2,
        y: 2,
        width: 46,
        height: 7,
        content: '{{nombre}}',
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000000',
      },
      {
        id: 'el-2',
        type: 'barcode',
        x: 4,
        y: 9,
        width: 42,
        height: 11,
        content: '{{codigo}}',
        barcodeFormat: 'CODE128',
        showBarcodeValue: true,
        textAlign: 'center',
      },
      {
        id: 'el-3',
        type: 'price',
        x: 2,
        y: 21,
        width: 46,
        height: 7,
        content: '{{precio}}',
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000000',
      }
    ]
  },
  {
    id: 'tpl-mayorista-60x40',
    name: 'Mayorista con 2 Precios (60x40mm)',
    description: 'Etiqueta comercial con precio unitario, precio al por mayor y escala mínima.',
    widthMm: 60,
    heightMm: 40,
    orientation: 'landscape',
    category: 'mayorista',
    isPreset: true,
    createdAt: new Date().toISOString(),
    elements: [
      {
        id: 'el-m-1',
        type: 'text',
        x: 3,
        y: 2,
        width: 54,
        height: 6,
        content: '{{nombre}}',
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000000',
      },
      {
        id: 'el-m-2',
        type: 'line',
        x: 3,
        y: 8,
        width: 54,
        height: 1,
        content: '',
        borderColor: '#000000',
        borderWidth: 1,
      },
      {
        id: 'el-m-3',
        type: 'text',
        x: 3,
        y: 10,
        width: 27,
        height: 5,
        content: 'P. UNIDAD:',
        fontSize: 7,
        fontWeight: 'bold',
        textAlign: 'left',
        color: '#333333',
      },
      {
        id: 'el-m-4',
        type: 'price',
        x: 3,
        y: 15,
        width: 27,
        height: 7,
        content: '{{precio}}',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'left',
        color: '#000000',
      },
      {
        id: 'el-m-5',
        type: 'text',
        x: 31,
        y: 10,
        width: 26,
        height: 5,
        content: 'P. MAYOR (min {{mayor_min}}):',
        fontSize: 7,
        fontWeight: 'bold',
        textAlign: 'left',
        color: '#333333',
      },
      {
        id: 'el-m-6',
        type: 'text',
        x: 31,
        y: 15,
        width: 26,
        height: 7,
        content: '{{precio_mayor}}',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'left',
        color: '#000000',
      },
      {
        id: 'el-m-7',
        type: 'barcode',
        x: 5,
        y: 24,
        width: 50,
        height: 13,
        content: '{{codigo}}',
        barcodeFormat: 'CODE128',
        showBarcodeValue: true,
        textAlign: 'center',
      }
    ]
  },
  {
    id: 'tpl-minimal-qr-40x25',
    name: 'Minimalista con QR (40x25mm)',
    description: 'Compacta y moderna para joyería, accesorios o catálogos web.',
    widthMm: 40,
    heightMm: 25,
    orientation: 'landscape',
    category: 'joyeria',
    isPreset: true,
    createdAt: new Date().toISOString(),
    elements: [
      {
        id: 'el-q-1',
        type: 'qrcode',
        x: 2,
        y: 2,
        width: 17,
        height: 17,
        content: '{{codigo}}',
      },
      {
        id: 'el-q-2',
        type: 'text',
        x: 20,
        y: 2,
        width: 18,
        height: 8,
        content: '{{nombre}}',
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'left',
      },
      {
        id: 'el-q-3',
        type: 'price',
        x: 20,
        y: 11,
        width: 18,
        height: 8,
        content: '{{precio}}',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'left',
      },
      {
        id: 'el-q-4',
        type: 'text',
        x: 2,
        y: 20,
        width: 36,
        height: 4,
        content: 'COD: {{codigo}}',
        fontSize: 6,
        textAlign: 'center',
      }
    ]
  },
  {
    id: 'tpl-gondola-80x30',
    name: 'Precios Góndola / Estante (80x30mm)',
    description: 'Etiqueta ancha para estantería de supermercados y minimarkets.',
    widthMm: 80,
    heightMm: 30,
    orientation: 'landscape',
    category: 'tienda',
    isPreset: true,
    createdAt: new Date().toISOString(),
    elements: [
      {
        id: 'el-g-1',
        type: 'text',
        x: 3,
        y: 2,
        width: 50,
        height: 7,
        content: '{{nombre}}',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'left',
      },
      {
        id: 'el-g-2',
        type: 'text',
        x: 3,
        y: 9,
        width: 50,
        height: 4,
        content: 'MARCA: {{marca}} | CAT: {{categoria}}',
        fontSize: 7,
        color: '#555555',
      },
      {
        id: 'el-g-3',
        type: 'barcode',
        x: 3,
        y: 14,
        width: 48,
        height: 13,
        content: '{{codigo}}',
        barcodeFormat: 'CODE128',
        showBarcodeValue: true,
      },
      {
        id: 'el-g-4',
        type: 'rect',
        x: 54,
        y: 2,
        width: 24,
        height: 25,
        content: '',
        backgroundColor: '#f1f5f9',
        borderColor: '#0f172a',
        borderWidth: 1,
      },
      {
        id: 'el-g-5',
        type: 'text',
        x: 55,
        y: 4,
        width: 22,
        height: 4,
        content: 'PRECIO VENTA',
        fontSize: 6,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#475569',
      },
      {
        id: 'el-g-6',
        type: 'price',
        x: 55,
        y: 10,
        width: 22,
        height: 12,
        content: '{{precio}}',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000000',
      }
    ]
  }
];

// Helper LocalStorage API con Sincronización en Red Local
export const StorageService = {
  // Sincronización inicial desde Supabase (si está configurado) o servidor central de la red
  async syncWithServer(): Promise<{ products?: Product[]; templates?: LabelTemplate[]; config?: AppConfig; history?: PrintHistoryItem[] } | null> {
    // 1. Si Supabase está configurado (Nube / Vercel), sincronizar con Supabase
    if (SupabaseService.isConfigured()) {
      try {
        const [cloudProducts, cloudTemplates, cloudConfig] = await Promise.all([
          SupabaseService.getProducts(),
          SupabaseService.getTemplates(),
          SupabaseService.getConfig(),
        ]);

        const result: { products?: Product[]; templates?: LabelTemplate[]; config?: AppConfig } = {};
        if (cloudProducts && cloudProducts.length > 0) {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(cloudProducts));
          result.products = cloudProducts;
        }
        if (cloudTemplates && cloudTemplates.length > 0) {
          localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(cloudTemplates));
          result.templates = cloudTemplates;
        }
        if (cloudConfig) {
          localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(cloudConfig));
          result.config = cloudConfig;
        }
        return result;
      } catch (err) {
        console.warn('Error sincronizando con Supabase:', err);
      }
    }

    // 2. Si no, sincronizar con el servidor local Express si está disponible
    try {
      const res = await fetch('/api/all', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data.products));
        }
        if (data.templates && Array.isArray(data.templates) && data.templates.length > 0) {
          localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(data.templates));
        }
        if (data.config && Object.keys(data.config).length > 0) {
          localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(data.config));
        }
        if (data.history && Array.isArray(data.history)) {
          localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
        }
        return data;
      }
    } catch {
      // Servidor no disponible o modo offline aislado
    }
    return null;
  },

  // Obtener info de red e IP para el código QR
  async getNetworkInfo(): Promise<{ localIp: string; url: string; serverUrl: string; status: string }> {
    try {
      const res = await fetch('/api/network');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback si no está el proxy
    }
    const host = window.location.hostname || 'localhost';
    const port = window.location.port || '5173';
    return {
      localIp: host,
      url: `${window.location.protocol}//${host}:${port}`,
      serverUrl: `${window.location.protocol}//${host}:3001`,
      status: host !== 'localhost' ? 'online' : 'local',
    };
  },

  // PRODUCTS
  getProducts(): Product[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts(products: Product[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    fetch('/api/products/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products),
    }).catch(() => {});
  },

  saveProduct(product: Product): Product[] {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    let toSave: Product;
    if (index >= 0) {
      toSave = { ...product, updatedAt: new Date().toISOString() };
      products[index] = toSave;
    } else {
      toSave = { ...product, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      products.unshift(toSave);
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    if (SupabaseService.isConfigured()) {
      SupabaseService.saveProduct(toSave).catch(() => {});
    }

    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toSave),
    }).catch(() => {});

    return products;
  },

  deleteProduct(id: string): Product[] {
    const products = this.getProducts().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    if (SupabaseService.isConfigured()) {
      SupabaseService.deleteProduct(id).catch(() => {});
    }

    fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(() => {});

    return products;
  },

  // TEMPLATES
  getTemplates(): LabelTemplate[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(INITIAL_TEMPLATES));
      return INITIAL_TEMPLATES;
    }
    try {
      const parsed = JSON.parse(raw);
      return parsed.length > 0 ? parsed : INITIAL_TEMPLATES;
    } catch {
      return INITIAL_TEMPLATES;
    }
  },

  saveTemplates(templates: LabelTemplate[]): void {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  },

  saveTemplate(template: LabelTemplate): LabelTemplate[] {
    const templates = this.getTemplates();
    const index = templates.findIndex((t) => t.id === template.id);
    let toSave: LabelTemplate;
    if (index >= 0) {
      toSave = { ...template, updatedAt: new Date().toISOString() };
      templates[index] = toSave;
    } else {
      toSave = { ...template, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      templates.push(toSave);
    }
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));

    if (SupabaseService.isConfigured()) {
      SupabaseService.saveTemplate(toSave).catch(() => {});
    }

    fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toSave),
    }).catch(() => {});

    return templates;
  },

  deleteTemplate(id: string): LabelTemplate[] {
    const templates = this.getTemplates().filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));

    if (SupabaseService.isConfigured()) {
      // Si la tabla templates existe en Supabase
    }

    fetch(`/api/templates/${id}`, { method: 'DELETE' }).catch(() => {});

    return templates;
  },

  // HISTORY
  getHistory(): PrintHistoryItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  addHistory(item: Omit<PrintHistoryItem, 'id' | 'timestamp'>): PrintHistoryItem[] {
    const history = this.getHistory();
    const newItem: PrintHistoryItem = {
      ...item,
      id: 'print-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    const updated = [newItem, ...history].slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));

    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    }).catch(() => {});

    return updated;
  },

  clearHistory(): void {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
    fetch('/api/history', { method: 'DELETE' }).catch(() => {});
  },

  // CONFIG
  getConfig(): AppConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
      return DEFAULT_CONFIG;
    }
    try {
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_CONFIG;
    }
  },

  saveConfig(config: AppConfig): void {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));

    if (SupabaseService.isConfigured()) {
      SupabaseService.saveConfig(config).catch(() => {});
    }

    fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    }).catch(() => {});
  },

  // BACKUP & RESTORE
  createBackupData(): string {
    const backup = {
      app: 'EtiquetaPro',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      products: this.getProducts(),
      templates: this.getTemplates(),
      history: this.getHistory(),
      config: this.getConfig(),
    };
    return JSON.stringify(backup, null, 2);
  },

  restoreBackupData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.products && Array.isArray(data.products)) {
        this.saveProducts(data.products);
      }
      if (data.templates && Array.isArray(data.templates)) {
        this.saveTemplates(data.templates);
      }
      if (data.config) {
        this.saveConfig({ ...DEFAULT_CONFIG, ...data.config });
      }
      if (data.history && Array.isArray(data.history)) {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
      }
      fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => {});
      return true;
    } catch (err) {
      console.error('Error restaurando backup:', err);
      return false;
    }
  }
};
