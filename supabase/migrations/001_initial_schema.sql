-- Usuarios extendidos (complementa auth.users de Supabase)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cotizaciones
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folio TEXT UNIQUE NOT NULL,
  cliente TEXT NOT NULL,
  fecha DATE NOT NULL,
  json_data JSONB NOT NULL,                    -- Datos completos de la cotización
  html TEXT,                                     -- HTML generado
  pdf_url TEXT,                                  -- URL en Supabase Storage
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
  conversation_history TEXT,                     -- Historial del chat
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuración de usuario (qué LLM usa)
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  llm_provider TEXT DEFAULT 'gemini' CHECK (llm_provider IN ('ollama', 'gemini')),
  ollama_model TEXT,
  gemini_api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Secuencia para folios (reemplaza archivo .folio)
CREATE SEQUENCE folio_sequence START 1;

-- Función para generar siguiente folio
CREATE OR REPLACE FUNCTION get_next_folio(prefix TEXT DEFAULT 'CIC')
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  folio TEXT;
BEGIN
  next_num := nextval('folio_sequence');
  folio := prefix || '-' || LPAD(next_num::TEXT, 5, '0');
  RETURN folio;
END;
$$ LANGUAGE plpgsql;

-- Índices para mejorar performance
CREATE INDEX idx_quotations_user_id ON quotations(user_id);
CREATE INDEX idx_quotations_folio ON quotations(folio);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_created_at ON quotations(created_at);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies: Los usuarios solo ven sus propios datos
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view own quotations"
  ON quotations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quotations"
  ON quotations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotations"
  ON quotations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotations"
  ON quotations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins ven todo
CREATE POLICY "Admins can view all quotations"
  ON quotations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all quotations"
  ON quotations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete all quotations"
  ON quotations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
