import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { ProductsView } from './views/ProductsView';
import { DesignerView } from './views/DesignerView';
import { GeneratorView } from './views/GeneratorView';
import { TemplatesView } from './views/TemplatesView';
import { PrintBatchView } from './views/PrintBatchView';
import { HistoryView } from './views/HistoryView';
import { BackupView } from './views/BackupView';
import { SettingsView } from './views/SettingsView';
import { NetworkModal } from './components/NetworkModal';
import { StorageService } from './services/storage';
import { Product, LabelTemplate, PrintHistoryItem, AppConfig } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [history, setHistory] = useState<PrintHistoryItem[]>([]);
  const [config, setConfig] = useState<AppConfig>(StorageService.getConfig());
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);

  // Estado para transferir ítems entre vistas
  const [productToPrint, setProductToPrint] = useState<Product | null>(null);
  const [templateToEdit, setTemplateToEdit] = useState<LabelTemplate | undefined>(undefined);

  // Cargar datos iniciales y sincronizar con servidor en red si existe
  useEffect(() => {
    reloadAllData();

    // Intentar sincronización centralizada si el cliente se conecta desde celular o red
    StorageService.syncWithServer().then((serverData) => {
      if (serverData) {
        if (serverData.products !== undefined) {
          setProducts(serverData.products);
        }

        // Fusión inteligente: nunca sobrescribir con vacío y combinar plantillas locales con el servidor
        const localTemplates = StorageService.getTemplates();
        const templateMap = new Map<string, LabelTemplate>();

        localTemplates.forEach((t) => templateMap.set(t.id, t));

        if (serverData.templates && serverData.templates.length > 0) {
          serverData.templates.forEach((t) => templateMap.set(t.id, t));
        }

        const mergedTemplates = Array.from(templateMap.values());
        StorageService.saveTemplates(mergedTemplates);
        setTemplates(mergedTemplates);

        if (serverData.config && Object.keys(serverData.config).length > 0) setConfig(serverData.config);
        if (serverData.history && serverData.history.length > 0) setHistory(serverData.history);
      }
    });
  }, []);

  const reloadAllData = () => {
    setProducts(StorageService.getProducts());
    setTemplates(StorageService.getTemplates());
    setHistory(StorageService.getHistory());
    setConfig(StorageService.getConfig());
  };

  // Manejadores de Productos
  const handleSaveProduct = (prod: Product) => {
    const updated = StorageService.saveProduct(prod);
    setProducts([...updated]);
  };

  const handleDeleteProduct = (id: string) => {
    const updated = StorageService.deleteProduct(id);
    setProducts([...updated]);
  };

  const handleClearAllProducts = () => {
    const updated = StorageService.clearAllProducts();
    setProducts([...updated]);
  };

  const handleBulkImportProducts = (newProducts: Product[]) => {
    const existing = StorageService.getProducts();
    const combined = [...newProducts, ...existing];
    StorageService.saveProducts(combined);
    setProducts(combined);
  };

  const handlePrintProduct = (prod: Product) => {
    setProductToPrint(prod);
    setCurrentTab('generador');
  };

  // Manejadores de Plantillas
  const handleSaveTemplate = (tpl: LabelTemplate) => {
    const updated = StorageService.saveTemplate(tpl);
    setTemplates([...updated]);
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = StorageService.deleteTemplate(id);
    setTemplates([...updated]);
  };

  const handleDuplicateTemplate = (tpl: LabelTemplate) => {
    const duplicated: LabelTemplate = {
      ...JSON.parse(JSON.stringify(tpl)),
      id: 'tpl-' + Date.now(),
      name: `${tpl.name} (Copia)`,
      isPreset: false,
      createdAt: new Date().toISOString(),
    };
    handleSaveTemplate(duplicated);
  };

  const handleEditTemplate = (tpl: LabelTemplate) => {
    setTemplateToEdit(tpl);
    setCurrentTab('disenador');
  };

  const handleNewTemplate = () => {
    setTemplateToEdit(undefined);
    setCurrentTab('disenador');
  };

  const handleUseTemplateInGenerator = (tpl: LabelTemplate) => {
    setTemplateToEdit(tpl);
    setCurrentTab('generador');
  };

  // Manejadores de Historial
  const handleRecordPrint = (item: Omit<PrintHistoryItem, 'id' | 'timestamp'>) => {
    const updated = StorageService.addHistory(item);
    setHistory([...updated]);
  };

  const handleClearHistory = () => {
    StorageService.clearHistory();
    setHistory([]);
  };

  // Manejador de Configuración
  const handleSaveConfig = (newConfig: AppConfig) => {
    StorageService.saveConfig(newConfig);
    setConfig(newConfig);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Barra Lateral Navegación */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'disenador' && currentTab !== 'disenador') {
            setTemplateToEdit(undefined);
          }
          setCurrentTab(tab);
        }}
        productsCount={products.length}
        onOpenNetworkModal={() => setIsNetworkModalOpen(true)}
      />

      {/* Área de Contenido Principal */}
      <main className="flex-1 overflow-y-auto bg-slate-950">
        {currentTab === 'dashboard' && (
          <DashboardView
            products={products}
            templates={templates}
            history={history}
            config={config}
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectProductToPrint={handlePrintProduct}
            onSelectTemplateToEdit={handleEditTemplate}
            onOpenNetworkModal={() => setIsNetworkModalOpen(true)}
          />
        )}

        {currentTab === 'productos' && (
          <ProductsView
            products={products}
            config={config}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onClearAllProducts={handleClearAllProducts}
            onPrintProduct={handlePrintProduct}
            onBulkImport={handleBulkImportProducts}
          />
        )}

        {currentTab === 'generador' && (
          <GeneratorView
            products={products}
            templates={templates}
            config={config}
            initialProduct={productToPrint}
            onRecordPrint={handleRecordPrint}
          />
        )}

        {currentTab === 'disenador' && (
          <DesignerView
            key={templateToEdit?.id || 'new-tpl'}
            initialTemplate={templateToEdit}
            products={products}
            config={config}
            onSaveTemplate={handleSaveTemplate}
          />
        )}

        {currentTab === 'plantillas' && (
          <TemplatesView
            templates={templates}
            sampleProduct={products[0]}
            config={config}
            onEditTemplate={handleEditTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onDuplicateTemplate={handleDuplicateTemplate}
            onImportTemplate={handleSaveTemplate}
            onNewTemplate={handleNewTemplate}
            onUseInGenerator={handleUseTemplateInGenerator}
          />
        )}

        {currentTab === 'impresion' && (
          <PrintBatchView
            products={products}
            templates={templates}
            config={config}
            onRecordPrint={handleRecordPrint}
          />
        )}

        {currentTab === 'historial' && (
          <HistoryView history={history} onClearHistory={handleClearHistory} />
        )}

        {currentTab === 'backup' && (
          <BackupView onDataRestored={reloadAllData} />
        )}

        {currentTab === 'configuracion' && (
          <SettingsView config={config} onSaveConfig={handleSaveConfig} />
        )}
      </main>

      {/* Modal para conectar Celular o Tablet mediante QR / Red Wi-Fi */}
      <NetworkModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
      />
    </div>
  );
}

export default App;
