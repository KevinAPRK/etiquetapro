# ETIQUETA PRO v1.0 🏷️
### Sistema Profesional de Diseño e Impresión de Etiquetas Multi-Dispositivo

**EtiquetaPro** es una aplicación multiplataforma que funciona tanto como programa de escritorio en Windows como servidor web en **Red Local / Wi-Fi y Nube**, permitiendo que **celulares, tablets y computadoras adicionales** se conecten y compartan la misma base de datos en tiempo real.

Diseñado para crear etiquetas con **códigos de barras (EAN-13, CODE128), códigos QR, precios, logos de empresa e información comercial**.

---

## 📱 Acceso Multi-Dispositivo (Celular, Tablet y Otras PCs)

Cualquier dispositivo en la misma red Wi-Fi o red local puede acceder al sistema:

1. Inicia el sistema con `npm run dev` o `npm run desktop`.
2. Haz clic en el botón **`[ 📱 Conectar Celular / Wi-Fi ]`** en el menú lateral o en el Dashboard.
3. Se abrirá una ventana con un **Código QR**: apunta la cámara de tu celular para abrir la aplicación al instante.
4. **Base de Datos Unificada en Tiempo Real**: Todo producto que crees, edites o importes desde el celular se sincronizará automáticamente con la computadora principal en `database/etiquetapro_db.json`.

---

## 🚀 Características Principales

### 1. 📊 Dashboard Principal
- Métricas en tiempo real: productos registrados, total de etiquetas generadas, última impresión realizada.
- Botones de acción rápida: `[ NUEVA ETIQUETA ]`, `[ PRODUCTOS ]`, `[ DISEÑADOR ]`, `[ 📱 CELULAR / RED ]`.
- Catálogo de plantillas preconfiguradas con renderizado interactivo en vivo.

### 2. 📦 Catálogo de Productos
- Base de datos centralizada con persistencia atómica en `database/etiquetapro_db.json`.
- Campos: ID, Código de barras, Nombre, Categoría, Marca, Precio compra, Precio venta, Precio mayor, Cantidad mínima, Stock, Descripción.
- **Importación masiva desde Excel (.xlsx, .csv)**: Carga cientos de productos en segundos.
- **Exportación a Excel (.xlsx)** del inventario completo.
- Buscador predictivo en tiempo real y filtrado por categorías.

### 3. 🎨 Diseñador Profesional Visual ("Tipo Canva Simple")
- Lienzo milimétrico interactivo con tecnología de arrastrar y soltar (Drag & Drop).
- Soporte para elementos modulares:
  - **Texto libre y Títulos**
  - **Precio destacado**
  - **Código de Barras** (CODE128, EAN-13, UPC con dígitos opcionales)
  - **Código QR** vectorial en alta resolución
  - **Líneas separadoras y Marcos/Rectángulos**
  - **Logotipo o Imagen** (usa automáticamente el logo de tu empresa guardado en Configuración)
- Comodines dinámicos:
  - `{{nombre}}`, `{{codigo}}`, `{{precio}}`, `{{precio_mayor}}`, `{{mayor_min}}`, `{{marca}}`, `{{categoria}}`, `{{fecha}}`, `{{empresa}}`, `{{ruc}}`
- Guardado y exportación de plantillas en formato `.json`.

### 4. ⚡ Generador Rápido de Etiquetas
- Flujo en 4 pasos: Producto -> Plantilla -> Cantidad -> Formato.
- Salidas soportadas:
  - **Rollo Térmico (1x1)**: Para impresoras Zebra, TSC, Brother, Xprinter, Epson, etc.
  - **Hoja A4 / Carta**: Cuadrícula de etiquetas adhesivas múltiples por página.
- Previsualización en vivo 1:1 con datos reales del producto.
- Impresión directa con diálogo del sistema y **Exportación nítida a PDF**.

### 5. 📁 Sistema de Plantillas Predefinidas
- **Tienda Minorista (50x30mm)**
- **Mayorista con 2 Precios (60x40mm)**
- **Minimalista con QR (40x25mm)**
- **Góndola / Estantería (80x30mm)**
- Soporte para importar y exportar plantillas en formato JSON.

### 6. 🖨️ Impresión Profesional & En Lote
- Selección de múltiples productos para impresión masiva.
- Compatibilidad comprobada con impresoras térmicas de rollo continuo.

### 7. 🛡️ Copias de Seguridad (Backup)
- Botón **"CREAR BACKUP AHORA"**: Descarga inmediata de `backup_etiquetapro_DD_MM_AAAA.json`.
- Botón **"RESTAURAR COPIA DE SEGURIDAD"**: Recupera tus datos o transfiérelos a otra máquina.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **Backend / Sincronización en Red**: Express + Node.js (con detección automática de IP)
- **Escritorio**: Electron con API IPC segura
- **Códigos de barras & QR**: `JsBarcode`, `QRCode`
- **PDF & Gráficos**: `jsPDF`, `html2canvas`
- **Hojas de cálculo**: `SheetJS (xlsx)`
- **Iconografía**: `lucide-react`

---

## 💻 Instrucciones de Ejecución

### 1. Iniciar con Servidor de Red Local (para esta PC + Celulares / Tablets)
```bash
npm run dev
```
> - En esta PC: `http://localhost:5173`
> - En celulares o tablets conectados al Wi-Fi: escanea el QR en pantalla o entra a `http://TU_IP_LOCAL:5173`.

### 2. Iniciar como Aplicación de Escritorio (Desktop Electron)
```bash
npm run desktop
# O alternativamente:
npm start
```

### 3. Compilar para Producción
```bash
npm run build
```
Genera la carpeta optimizada `/dist` lista para servir o empaquetar en instalador `.exe`.
