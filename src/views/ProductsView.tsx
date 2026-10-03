import React, { useState, useRef } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Edit3, 
  Trash2, 
  Tag, 
  Barcode, 
  X, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Product, AppConfig } from '../types';

interface ProductsViewProps {
  products: Product[];
  config: AppConfig;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onClearAllProducts?: () => void;
  onPrintProduct: (product: Product) => void;
  onBulkImport: (products: Product[]) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  config,
  onSaveProduct,
  onDeleteProduct,
  onClearAllProducts,
  onPrintProduct,
  onBulkImport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    id: '',
    code: '',
    name: '',
    category: '',
    brand: '',
    costPrice: 0,
    salePrice: 0,
    wholesalePrice: 0,
    wholesaleMinQty: 6,
    stock: 0,
    description: '',
  });

  const categories = ['todos', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'todos' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenCreateModal = () => {
    const nextId = 'P' + String(products.length + 1).padStart(3, '0');
    // Generador aleatorio EAN13 válido simulado para conveniencia
    const randomBarcode = '775' + Math.floor(100000000 + Math.random() * 900000000);
    setFormData({
      id: nextId,
      code: randomBarcode,
      name: '',
      category: 'General',
      brand: 'Genérica',
      costPrice: 10,
      salePrice: 20,
      wholesalePrice: 16,
      wholesaleMinQty: 6,
      stock: 50,
      description: '',
    });
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setFormData({ ...product });
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    const toSave: Product = {
      id: formData.id || 'P' + Date.now(),
      code: formData.code,
      name: formData.name,
      category: formData.category || 'General',
      brand: formData.brand || 'Genérica',
      costPrice: Number(formData.costPrice) || 0,
      salePrice: Number(formData.salePrice) || 0,
      wholesalePrice: Number(formData.wholesalePrice) || 0,
      wholesaleMinQty: Number(formData.wholesaleMinQty) || 1,
      stock: Number(formData.stock) || 0,
      description: formData.description || '',
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveProduct(toSave);
    setIsModalOpen(false);
  };

  // Exportar a Excel
  const handleExportExcel = () => {
    const exportData = products.map((p) => ({
      ID: p.id,
      Codigo_Barras: p.code,
      Nombre: p.name,
      Categoria: p.category,
      Marca: p.brand,
      Precio_Compra: p.costPrice,
      Precio_Venta: p.salePrice,
      Precio_Mayor: p.wholesalePrice,
      Minimo_Mayor: p.wholesaleMinQty,
      Stock: p.stock,
      Descripcion: p.description || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    XLSX.writeFile(wb, `Inventario_Productos_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Importar desde Excel
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawData = XLSX.utils.sheet_to_json<any>(ws);

        const imported: Product[] = rawData.map((row, idx) => ({
          id: String(row.ID || row.id || 'IMP' + (idx + 1)),
          code: String(row.Codigo_Barras || row.codigo || row.Codigo || row.barcode || '775' + Math.floor(100000000 + Math.random() * 900000000)),
          name: String(row.Nombre || row.nombre || row.Producto || 'Producto ' + (idx + 1)),
          category: String(row.Categoria || row.categoria || 'Importados'),
          brand: String(row.Marca || row.marca || 'Genérica'),
          costPrice: Number(row.Precio_Compra || row.costo || 0),
          salePrice: Number(row.Precio_Venta || row.precio || row.Precio || 0),
          wholesalePrice: Number(row.Precio_Mayor || row.precio_mayor || row.salePrice || 0),
          wholesaleMinQty: Number(row.Minimo_Mayor || row.minimo || 6),
          stock: Number(row.Stock || row.stock || 0),
          description: String(row.Descripcion || row.descripcion || ''),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        if (imported.length > 0) {
          onBulkImport(imported);
          alert(`¡Se importaron ${imported.length} productos correctamente desde el archivo!`);
        }
      } catch (err) {
        alert('Error al leer el archivo Excel. Asegúrate de que tenga columnas válidas.');
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="text-indigo-400" />
            Módulo de Productos
          </h1>
          <p className="text-xs text-slate-400">
            Base de datos local ({products.length} productos registrados). Sin límite de almacenamiento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Cargar productos masivamente desde Excel"
          >
            <Upload size={15} /> Importar Excel
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Descargar lista completa en Excel"
          >
            <Download size={15} /> Exportar Excel
          </button>
          {products.length > 0 && onClearAllProducts && (
            <button
              onClick={() => {
                if (confirm('¿Estás seguro de eliminar TODOS los productos del catálogo? Esta acción no se puede deshacer.')) {
                  onClearAllProducts();
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold border border-rose-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Eliminar todos los productos de la base de datos"
            >
              <Trash2 size={15} /> Vaciar Catálogo
            </button>
          )}
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus size={16} /> NUEVO PRODUCTO
          </button>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, código o marca..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter size={16} className="text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 shrink-0">Categoría:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/70 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Código Barras</th>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 text-right">P. Venta</th>
                <th className="py-3 px-4 text-right">P. Mayor</th>
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No se encontraron productos coincidentes.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">{p.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-indigo-300 font-medium">
                        <Barcode size={15} />
                        {p.code}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{p.name}</div>
                      <div className="text-[11px] text-slate-400">{p.brand}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white">
                      {config.currency} {p.salePrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-indigo-300 font-semibold">
                      {config.currency} {p.wholesalePrice.toFixed(2)}
                      <div className="text-[10px] text-slate-500">desde {p.wholesaleMinQty} un.</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          p.stock > 10
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : p.stock > 0
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onPrintProduct(p)}
                          className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-all cursor-pointer"
                          title="Generar Etiqueta para este producto"
                        >
                          <Tag size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                          title="Editar producto"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Estás seguro de eliminar el producto "${p.name}"?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white transition-all cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="text-indigo-400" size={18} />
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">ID Producto</label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-indigo-500"
                    placeholder="P001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Código de Barras</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-indigo-500"
                    placeholder="775123456789"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500"
                  placeholder="Ej. Audífonos Bluetooth Pro TWS"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Categoría</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500"
                    placeholder="Tecnología, Moda, Bazar..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Marca</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500"
                    placeholder="Marca comercial"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">P. Compra</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">P. Venta ({config.currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-400 font-bold focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">P. Mayor ({config.currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.wholesalePrice}
                    onChange={(e) => setFormData({ ...formData, wholesalePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-indigo-300 font-bold focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Mínimo para Mayor</label>
                  <input
                    type="number"
                    value={formData.wholesaleMinQty}
                    onChange={(e) => setFormData({ ...formData, wholesaleMinQty: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Stock Actual</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Descripción / Detalles</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500"
                  placeholder="Detalles técnicos o adicionales..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={16} /> Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
