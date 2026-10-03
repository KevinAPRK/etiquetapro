-- ==============================================================
-- 🏷️ ETIQUETA PRO - SCHEMA PARA SUPABASE (PostgreSQL)
-- Copia y pega este script en el SQL Editor de tu proyecto Supabase
-- ==============================================================

-- 1. TABLA DE PRODUCTOS
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  brand TEXT DEFAULT 'Genérica',
  cost_price NUMERIC(10, 2) DEFAULT 0,
  sale_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  wholesale_price NUMERIC(10, 2) DEFAULT 0,
  wholesale_min_qty INTEGER DEFAULT 1,
  stock INTEGER DEFAULT 0,
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(code);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);

-- 2. TABLA DE PLANTILLAS DE ETIQUETAS
CREATE TABLE IF NOT EXISTS public.templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  width_mm NUMERIC(8, 2) NOT NULL DEFAULT 50,
  height_mm NUMERIC(8, 2) NOT NULL DEFAULT 30,
  orientation TEXT DEFAULT 'landscape',
  elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  category TEXT DEFAULT 'personalizado',
  is_preset BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE HISTORIAL DE IMPRESIONES
CREATE TABLE IF NOT EXISTS public.print_history (
  id TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  product_code TEXT NOT NULL,
  template_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  dimensions TEXT NOT NULL,
  status TEXT DEFAULT 'completado',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE CONFIGURACIÓN Y LOGOTIPO
CREATE TABLE IF NOT EXISTS public.config (
  id TEXT PRIMARY KEY DEFAULT 'app_config',
  currency TEXT DEFAULT 'S/',
  business_name TEXT DEFAULT 'Mi Negocio & Tienda',
  business_logo TEXT,
  business_ruc TEXT,
  business_phone TEXT,
  business_address TEXT,
  default_printer TEXT DEFAULT 'Zebra GK420 / Térmica USB',
  measurement_unit TEXT DEFAULT 'mm',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fila inicial de configuración
INSERT INTO public.config (id, currency, business_name)
VALUES ('app_config', 'S/', 'Mi Negocio & Tienda')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================
-- 5. POLÍTICAS DE ACCESO (ROW LEVEL SECURITY - RLS)
-- Permite lectura y escritura pública usando la clave "anon" de Supabase
-- ==============================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso total anonimo productos" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total anonimo templates" ON public.templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total anonimo print_history" ON public.print_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total anonimo config" ON public.config FOR ALL USING (true) WITH CHECK (true);
