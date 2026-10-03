const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '25mb' }));

const DB_DIR = path.join(__dirname, '../database');
const DB_FILE = path.join(DB_DIR, 'etiquetapro_db.json');

// Asegurar directorio de base de datos
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Obtener la IP local de la red Wi-Fi / Ethernet
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (!iface.address.startsWith('169.254.')) {
          candidates.push(iface.address);
        }
      }
    }
  }
  const wifiOrLan = candidates.find(ip => ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.'));
  return wifiOrLan || candidates[0] || 'localhost';
}

const DEFAULT_TEMPLATES = [
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
      { id: 'el-1', type: 'text', x: 2, y: 2, width: 46, height: 7, content: '{{nombre}}', fontSize: 10, fontWeight: 'bold', textAlign: 'center', color: '#000000' },
      { id: 'el-2', type: 'barcode', x: 4, y: 9, width: 42, height: 11, content: '{{codigo}}', barcodeFormat: 'CODE128', showBarcodeValue: true, textAlign: 'center' },
      { id: 'el-3', type: 'price', x: 2, y: 21, width: 46, height: 7, content: '{{precio}}', fontSize: 13, fontWeight: 'bold', textAlign: 'center', color: '#000000' }
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
      { id: 'el-m-1', type: 'text', x: 3, y: 2, width: 54, height: 6, content: '{{nombre}}', fontSize: 10, fontWeight: 'bold', textAlign: 'center', color: '#000000' },
      { id: 'el-m-2', type: 'line', x: 3, y: 8, width: 54, height: 1, content: '', borderColor: '#000000', borderWidth: 1 },
      { id: 'el-m-3', type: 'text', x: 3, y: 10, width: 27, height: 5, content: 'P. UNIDAD:', fontSize: 7, fontWeight: 'bold', textAlign: 'left', color: '#333333' },
      { id: 'el-m-4', type: 'price', x: 3, y: 15, width: 27, height: 7, content: '{{precio}}', fontSize: 12, fontWeight: 'bold', textAlign: 'left', color: '#000000' },
      { id: 'el-m-5', type: 'text', x: 31, y: 10, width: 26, height: 5, content: 'P. MAYOR (min {{mayor_min}}):', fontSize: 7, fontWeight: 'bold', textAlign: 'left', color: '#333333' },
      { id: 'el-m-6', type: 'text', x: 31, y: 15, width: 26, height: 7, content: '{{precio_mayor}}', fontSize: 12, fontWeight: 'bold', textAlign: 'left', color: '#000000' },
      { id: 'el-m-7', type: 'barcode', x: 5, y: 24, width: 50, height: 13, content: '{{codigo}}', barcodeFormat: 'CODE128', showBarcodeValue: true, textAlign: 'center' }
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
      { id: 'el-q-1', type: 'qrcode', x: 2, y: 2, width: 17, height: 17, content: '{{codigo}}' },
      { id: 'el-q-2', type: 'text', x: 20, y: 2, width: 18, height: 8, content: '{{nombre}}', fontSize: 8, fontWeight: 'bold', textAlign: 'left' },
      { id: 'el-q-3', type: 'price', x: 20, y: 11, width: 18, height: 8, content: '{{precio}}', fontSize: 11, fontWeight: 'bold', textAlign: 'left' },
      { id: 'el-q-4', type: 'text', x: 2, y: 20, width: 36, height: 4, content: 'COD: {{codigo}}', fontSize: 6, textAlign: 'center' }
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
      { id: 'el-g-1', type: 'text', x: 3, y: 2, width: 50, height: 7, content: '{{nombre}}', fontSize: 11, fontWeight: 'bold', textAlign: 'left' },
      { id: 'el-g-2', type: 'text', x: 3, y: 9, width: 50, height: 4, content: 'MARCA: {{marca}} | CAT: {{categoria}}', fontSize: 7, color: '#555555' },
      { id: 'el-g-3', type: 'barcode', x: 3, y: 14, width: 48, height: 13, content: '{{codigo}}', barcodeFormat: 'CODE128', showBarcodeValue: true },
      { id: 'el-g-4', type: 'rect', x: 54, y: 2, width: 24, height: 25, content: '', backgroundColor: '#f1f5f9', borderColor: '#0f172a', borderWidth: 1 },
      { id: 'el-g-5', type: 'text', x: 55, y: 4, width: 22, height: 4, content: 'PRECIO VENTA', fontSize: 6, fontWeight: 'bold', textAlign: 'center', color: '#475569' },
      { id: 'el-g-6', type: 'price', x: 55, y: 10, width: 22, height: 12, content: '{{precio}}', fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: '#000000' }
    ]
  }
];

// Cargar o inicializar la base de datos
function loadDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (!parsed.templates || parsed.templates.length === 0) {
        parsed.templates = DEFAULT_TEMPLATES;
        saveDatabase(parsed);
      }
      return parsed;
    } catch (e) {
      console.error('Error al leer base de datos, usando default:', e);
    }
  }

  const initialData = {
    products: [
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
    ],
    templates: DEFAULT_TEMPLATES,
    history: [],
    config: {
      currency: 'S/',
      businessName: 'Mi Negocio & Tienda',
      businessRUC: '20601234567',
      businessAddress: 'Av. Principal 123',
      businessPhone: '+51 987 654 321',
      defaultPaperWidth: 50,
      defaultPaperHeight: 30,
      defaultPrinter: 'Zebra GK420 / Térmica USB',
      measurementUnit: 'mm',
    }
  };

  saveDatabase(initialData);
  return initialData;
}

function saveDatabase(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error al guardar base de datos:', err);
  }
}

let db = loadDatabase();

// --- ENDPOINTS API ---

// Estado de red e IP
app.get('/api/network', (req, res) => {
  const localIp = getLocalIpAddress();
  res.json({
    localIp,
    port: 5173,
    url: `http://${localIp}:5173`,
    serverUrl: `http://${localIp}:${PORT}`,
    status: 'online',
    connectedDevicesDesc: 'Cualquier dispositivo en la misma red Wi-Fi/LAN puede acceder en tiempo real.'
  });
});

// Cargar todo
app.get('/api/all', (req, res) => {
  res.json(db);
});

// PRODUCTOS
app.get('/api/products', (req, res) => {
  res.json(db.products || []);
});

app.post('/api/products', (req, res) => {
  const product = req.body;
  if (!product || !product.id) return res.status(400).json({ error: 'Producto inválido' });
  const index = (db.products || []).findIndex(p => p.id === product.id);
  if (index >= 0) {
    db.products[index] = { ...product, updatedAt: new Date().toISOString() };
  } else {
    db.products = [{ ...product, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...(db.products || [])];
  }
  saveDatabase(db);
  res.json(db.products);
});

app.post('/api/products/bulk', (req, res) => {
  const products = req.body;
  if (Array.isArray(products)) {
    db.products = [...products, ...(db.products || [])];
    saveDatabase(db);
    res.json(db.products);
  } else {
    res.status(400).json({ error: 'Datos no válidos' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.products = (db.products || []).filter(p => p.id !== id);
  saveDatabase(db);
  res.json(db.products);
});

// PLANTILLAS
app.get('/api/templates', (req, res) => {
  res.json(db.templates || []);
});

app.post('/api/templates', (req, res) => {
  const template = req.body;
  if (!template || !template.id) return res.status(400).json({ error: 'Plantilla inválida' });
  const index = (db.templates || []).findIndex(t => t.id === template.id);
  if (index >= 0) {
    db.templates[index] = { ...template, updatedAt: new Date().toISOString() };
  } else {
    db.templates = [...(db.templates || []), { ...template, createdAt: new Date().toISOString() }];
  }
  saveDatabase(db);
  res.json(db.templates);
});

app.delete('/api/templates/:id', (req, res) => {
  const { id } = req.params;
  db.templates = (db.templates || []).filter(t => t.id !== id);
  saveDatabase(db);
  res.json(db.templates);
});

// HISTORIAL
app.get('/api/history', (req, res) => {
  res.json(db.history || []);
});

app.post('/api/history', (req, res) => {
  const item = req.body;
  const newItem = {
    ...item,
    id: 'print-' + Date.now(),
    timestamp: new Date().toISOString()
  };
  db.history = [newItem, ...(db.history || [])].slice(0, 100);
  saveDatabase(db);
  res.json(db.history);
});

app.delete('/api/history', (req, res) => {
  db.history = [];
  saveDatabase(db);
  res.json(db.history);
});

// CONFIG
app.get('/api/config', (req, res) => {
  res.json(db.config || {});
});

app.post('/api/config', (req, res) => {
  db.config = { ...(db.config || {}), ...req.body };
  saveDatabase(db);
  res.json(db.config);
});

// RESTORE
app.post('/api/restore', (req, res) => {
  try {
    const backup = req.body;
    if (backup.products && Array.isArray(backup.products)) db.products = backup.products;
    if (backup.templates && Array.isArray(backup.templates)) db.templates = backup.templates;
    if (backup.config) db.config = backup.config;
    if (backup.history && Array.isArray(backup.history)) db.history = backup.history;
    saveDatabase(db);
    res.json({ ok: true, message: 'Restaurado con éxito' });
  } catch (e) {
    res.status(500).json({ error: 'Error restaurando datos' });
  }
});

// Servir la aplicación en producción si existe dist/
const DIST_PATH = path.join(__dirname, '../dist');
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(DIST_PATH, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIpAddress();
  console.log(`\n======================================================`);
  console.log(` 🏷️  ETIQUETA PRO - SERVIDOR MULTI-DISPOSITIVO ACTIVO`);
  console.log(`------------------------------------------------------`);
  console.log(` En esta computadora:  http://localhost:${PORT}`);
  console.log(` En celulares/tablets:  http://${ip}:${PORT} (o vía Vite dev)`);
  console.log(`======================================================\n`);
});
