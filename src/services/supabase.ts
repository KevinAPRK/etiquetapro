import { createClient } from '@supabase/supabase-js';
import { Product, LabelTemplate, AppConfig, PrintHistoryItem } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('tu-proyecto') &&
  supabaseUrl.startsWith('https://')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const SupabaseService = {
  isConfigured(): boolean {
    return isSupabaseConfigured && supabase !== null;
  },

  // PRODUCTOS
  async getProducts(): Promise<Product[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching products from Supabase:', error);
      return null;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      category: row.category || 'General',
      brand: row.brand || 'Genérica',
      costPrice: Number(row.cost_price) || 0,
      salePrice: Number(row.sale_price) || 0,
      wholesalePrice: Number(row.wholesale_price) || 0,
      wholesaleMinQty: Number(row.wholesale_min_qty) || 1,
      stock: Number(row.stock) || 0,
      description: row.description || '',
      image: row.image || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async saveProduct(product: Product): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('products').upsert({
      id: product.id,
      code: product.code,
      name: product.name,
      category: product.category,
      brand: product.brand,
      cost_price: product.costPrice,
      sale_price: product.salePrice,
      wholesale_price: product.wholesalePrice,
      wholesale_min_qty: product.wholesaleMinQty,
      stock: product.stock,
      description: product.description,
      image: product.image,
      updated_at: new Date().toISOString(),
    });
    return !error;
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('products').delete().eq('id', id);
    return !error;
  },

  // PLANTILLAS
  async getTemplates(): Promise<LabelTemplate[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('templates').select('*');
    if (error) return null;

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
      widthMm: Number(row.width_mm) || 50,
      heightMm: Number(row.height_mm) || 30,
      orientation: row.orientation || 'landscape',
      elements: row.elements || [],
      category: row.category || 'personalizado',
      isPreset: Boolean(row.is_preset),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async saveTemplate(tpl: LabelTemplate): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('templates').upsert({
      id: tpl.id,
      name: tpl.name,
      description: tpl.description,
      width_mm: tpl.widthMm,
      height_mm: tpl.heightMm,
      orientation: tpl.orientation,
      elements: tpl.elements,
      category: tpl.category,
      is_preset: tpl.isPreset,
      updated_at: new Date().toISOString(),
    });
    return !error;
  },

  async deleteTemplate(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('templates').delete().eq('id', id);
    return !error;
  },

  // CONFIGURACIÓN Y LOGOTIPO
  async getConfig(): Promise<AppConfig | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('config')
      .select('*')
      .eq('id', 'app_config')
      .single();

    if (error || !data) return null;

    return {
      currency: data.currency || 'S/',
      businessName: data.business_name || 'Mi Negocio & Tienda',
      businessLogo: data.business_logo || undefined,
      businessRUC: data.business_ruc || undefined,
      businessPhone: data.business_phone || undefined,
      businessAddress: data.business_address || undefined,
      defaultPrinter: data.default_printer || 'Zebra GK420 / Térmica USB',
      defaultPaperWidth: 50,
      defaultPaperHeight: 30,
      measurementUnit: 'mm',
    };
  },

  async saveConfig(cfg: AppConfig): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('config').upsert({
      id: 'app_config',
      currency: cfg.currency,
      business_name: cfg.businessName,
      business_logo: cfg.businessLogo,
      business_ruc: cfg.businessRUC,
      business_phone: cfg.businessPhone,
      business_address: cfg.businessAddress,
      default_printer: cfg.defaultPrinter,
      updated_at: new Date().toISOString(),
    });
    return !error;
  },
};
