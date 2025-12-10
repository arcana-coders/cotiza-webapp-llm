# Cotiza - Sistema de Cotizaciones con IA

Sistema web moderno para generar cotizaciones usando inteligencia artificial (Ollama o Gemini).

## Stack Tecnológico

- **Next.js 15** (App Router) - Framework React
- **Supabase** - Base de datos PostgreSQL + Autenticación + Storage
- **Vercel AI SDK** - Integración con LLMs (Ollama/Gemini)
- **Tailwind CSS + shadcn/ui** - Diseño y componentes
- **Puppeteer** - Generación de PDFs (delegada a microservicio externo en Render)

## Características

- 🤖 Generación de cotizaciones con IA (conversacional)
- 📄 Exportación a PDF automática
- 👥 Multi-usuario con autenticación
- 💾 Historial de cotizaciones
- 🔐 Row Level Security (cada usuario ve solo sus datos)
- ⚡ Preview en tiempo real
- 🎨 Interfaz moderna y responsive

## Configuración Inicial

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Click en "New Project"
4. Completa los datos:
   - Name: `cotiza` (o el nombre que prefieras)
   - Database Password: Genera una contraseña segura (guárdala)
   - Region: Elige la más cercana a ti
5. Espera a que el proyecto se cree (~2 minutos)

### 2. Ejecutar Migraciones SQL

**Migración 1 - Schema principal:**

1. En tu proyecto de Supabase, ve a **SQL Editor** (menú lateral)
2. Click en **"New Query"**
3. Copia todo el contenido del archivo `supabase/migrations/001_initial_schema.sql`
4. Pégalo en el editor
5. Click en **"Run"**
6. Verifica que se ejecutó correctamente (debería decir "Success")

**Migración 2 - Fix de creación de perfiles:**

1. Click en **"New Query"** nuevamente
2. Copia y pega este SQL:

```sql
-- Función que crea automáticamente el perfil cuando se registra un usuario
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON public.profiles;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    'user'
  );

  INSERT INTO public.user_settings (user_id, llm_provider)
  VALUES (NEW.id, 'gemini');

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "Users can insert own profile during signup"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

3. Click en **"Run"**

### 3. Configurar Storage para PDFs

1. En Supabase, ve a **Storage** (menú lateral)
2. Click en **"Create a new bucket"**
3. Name: `pdfs`
4. Public bucket: ✅ (activado)
5. Click en **"Save"**

### 4. Obtener Credenciales de Supabase

1. En tu proyecto de Supabase, ve a **Project Settings** (ícono de engranaje)
2. Ve a **API**
3. Copia los siguientes valores:
   - `Project URL` → será tu `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` (en Project API keys) → será tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (en Project API keys) → será tu `SUPABASE_SERVICE_ROLE_KEY`

### 5. Configurar Variables de Entorno

1. Copia el archivo `.env.local.example` a `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edita `.env.local` y completa las variables:
   ```bash
   # Supabase (obligatorio)
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

   # Gemini (opcional - si usas Gemini)
   GEMINI_API_KEY=AIzaxxx...

   # Ollama (opcional - si usas Ollama local)
   OLLAMA_BASE_URL=http://localhost:11434

   # Next.js
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # PDF Service (Nuevo!)
   PDF_SERVICE_URL=https://cotiza-pdf-service.onrender.com/generate-pdf
   PDF_SERVICE_TOKEN=your-service-token
   ```

### 6. Instalar Dependencias y Ejecutar

```bash
npm install
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

### Nota sobre PDFs en Producción

La generación de PDFs se delega a un microservicio externo (`cotiza-pdf-service`) hospedado en Render.com.

**¿Por qué un microservicio separado?**
- Vercel serverless no tiene todas las librerías del sistema que Chrome necesita (`libnss3.so`, etc.)
- El microservicio en Render usa Puppeteer con Chrome completo
- 100% gratis usando:
  - Plan Free de Render (750 horas/mes)
  - Cron job gratuito en cron-job.org para keep-alive (ping cada 14 minutos)

**Configuración requerida:**
1. Despliega el microservicio en Render (repo: `arcana-coders/cotiza-pdf-service`)
2. Configura cron job en cron-job.org apuntando a `https://cotiza-pdf-service.onrender.com/health`
3. Agrega variables de entorno en Vercel:
   - `PDF_SERVICE_URL=https://cotiza-pdf-service.onrender.com/generate-pdf`
   - `PDF_SERVICE_TOKEN=<tu-token-seguro>`

Ver documentación completa en [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

## Uso

### Primera vez

1. Ve a [http://localhost:3000/register](http://localhost:3000/register)
2. Crea tu cuenta (email + contraseña + nombre)
3. Serás redirigido al dashboard

### Crear una Cotización

1. En el dashboard, click en **"Nueva Cotización"**
2. Describe tu cotización en lenguaje natural, por ejemplo:
   ```
   Cliente: ABC Corp
   Fecha: hoy
   Conceptos:
   - Desarrollo web: 3 horas a $500 cada una
   - Diseño de logo: 1 pieza a $800
   - Consultoría: 2 horas a $400 cada una
   ```
3. El sistema generará la cotización y mostrará un preview
4. Puedes editar conversacionalmente: "Cambia el precio del logo a $1000"
5. Cuando esté lista, click en **"Generar PDF"**
6. El PDF se descargará automáticamente

### Configurar LLM

1. Ve a **Configuración** en el menú
2. Elige entre:
   - **Gemini**: Necesitas una API key (gratis en [makersuite.google.com](https://makersuite.google.com))
   - **Ollama**: Requiere Ollama corriendo localmente

## Estructura del Proyecto

```
cotiza-web/
├── app/
│   ├── (auth)/              # Rutas de autenticación
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Rutas protegidas
│   │   ├── page.tsx         # Dashboard principal
│   │   ├── nueva/           # Nueva cotización (TODO)
│   │   ├── cotizaciones/    # Lista de cotizaciones (TODO)
│   │   └── settings/        # Configuración (TODO)
│   └── api/                 # API routes (TODO)
├── components/
│   ├── chat/                # Componentes de chat (TODO)
│   ├── quotations/          # Componentes de cotizaciones (TODO)
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── supabase/            # Clientes de Supabase
│   ├── ai/                  # Configuración de IA (TODO)
│   └── pdf/                 # Generación de PDFs (TODO)
├── shared/
│   ├── schemas.ts           # Esquemas de validación Zod
│   └── types.ts             # Tipos TypeScript
├── templates/
│   └── quotation.hbs        # Template Handlebars para cotizaciones
└── supabase/
    └── migrations/          # Migraciones SQL
```

## 📊 Estado Actual del Proyecto

### ✅ Completado (Día 1-2: Setup + Autenticación)

- [x] Proyecto Next.js 15 configurado
- [x] Dependencias instaladas (Supabase, Vercel AI SDK, Puppeteer, shadcn/ui)
- [x] Base de datos Supabase configurada
- [x] Migraciones SQL ejecutadas:
  - `001_initial_schema.sql` - Tablas principales (profiles, quotations, user_settings)
  - `002_fix_profile_creation.sql` - Trigger automático para crear perfiles
- [x] Storage bucket `pdfs` creado
- [x] Sistema de autenticación completo:
  - Login funcional (`/login`)
  - Registro funcional (`/register`)
  - Middleware de protección de rutas
  - Row Level Security (RLS) configurado
- [x] Dashboard base con navbar
- [x] Archivos reutilizados del proyecto CLI:
  - `shared/schemas.ts` - Validación Zod
  - `shared/types.ts` - Tipos TypeScript
  - `templates/quotation.hbs` - Template Handlebars
  - `public/logo.png` - Logo

### ✅ Completado Recientemente (Día 3-4: Chat Interface + Preview)

- [x] Migrado `generator.ts` para compatibilidad con Vercel
- [x] Sistema de prompts de IA creado
- [x] API de chat implementada con Vercel AI SDK (streaming)
- [x] Componente ChatInterface con useChat hook
- [x] Componente QuotationPreview con iframe
- [x] Página `/dashboard/nueva` funcional
- [x] Preview HTML en tiempo real
- [x] Integración completa con Supabase

### 🚧 En Progreso (Día 5: Generación de PDFs)

- [ ] API route para generar PDFs
- [ ] Subir PDFs a Supabase Storage
- [ ] Descargar PDFs desde el dashboard

### 📋 Pendiente

- [ ] Día 5: Generación de PDFs
- [ ] Día 6: Lista de Cotizaciones
- [ ] Día 7: Settings + Deploy

Ver el plan completo en `.claude/plans/mighty-moseying-pizza.md`

## Soporte

Si encuentras problemas:
1. Revisa que las variables de entorno estén correctas
2. Verifica que las migraciones SQL se ejecutaron correctamente
3. Asegúrate de tener el bucket `pdfs` creado en Supabase Storage

## Licencia

MIT
