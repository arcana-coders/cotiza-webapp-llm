# Configuración de Supabase

## Desactivar Confirmación de Email (Solo para Desarrollo)

Por defecto, Supabase requiere que los usuarios confirmen su email antes de poder iniciar sesión. Esto es recomendado para producción, pero para desarrollo puedes desactivarlo:

### Pasos:

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. En el menú lateral, ve a **Authentication** → **Providers**
3. Busca la sección **Email**
4. Desactiva la opción **"Confirm email"**
5. Guarda los cambios

Ahora, cuando un usuario se registre, será autenticado automáticamente sin necesidad de confirmar el email.

### Para Producción:

**IMPORTANTE**: En producción, debes mantener activada la confirmación de email para:
- Verificar que los emails son válidos
- Prevenir spam y cuentas falsas
- Asegurar que el usuario tiene acceso al email que proporcionó

---

## Configurar Email Templates (Opcional)

Si quieres personalizar los emails de confirmación:

1. Ve a **Authentication** → **Email Templates**
2. Edita las plantillas:
   - **Confirm signup**: Email de confirmación de registro
   - **Magic Link**: Para login sin contraseña
   - **Change Email Address**: Cuando el usuario cambia su email
   - **Reset Password**: Para recuperar contraseña

Puedes usar variables como:
- `{{ .ConfirmationURL }}` - URL de confirmación
- `{{ .Token }}` - Token de confirmación
- `{{ .Email }}` - Email del usuario
- `{{ .SiteURL }}` - URL de tu aplicación

---

## Configurar URL de Redirección

**IMPORTANTE**: Debes configurar la URL de callback en Supabase para que funcione la confirmación de email.

### Configurar en Supabase Dashboard:

1. Ve a **Authentication** → **URL Configuration**
2. En **Site URL**, configura:
   - Desarrollo: `http://localhost:3000`
   - Producción: `https://tu-dominio.com`
3. En **Redirect URLs**, agrega las siguientes URLs:
   - `http://localhost:3000/auth/callback` (desarrollo)
   - `http://localhost:3000/**` (desarrollo - todas las rutas)
   - `https://tu-dominio.com/auth/callback` (producción)
   - `https://tu-dominio.com/**` (producción - todas las rutas)

La URL de callback ya está configurada en el código:

```typescript
emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
```

Cuando el usuario hace click en el enlace de confirmación:
1. Supabase lo redirige a `/auth/callback`
2. El callback intercambia el código por una sesión
3. Redirige al usuario a `/dashboard`

---

## Verificar que el Trigger está Funcionando

El trigger `handle_new_user()` debe crear automáticamente el perfil cuando un usuario se registra.

Para verificar:

```sql
-- En el SQL Editor de Supabase, ejecuta:
SELECT * FROM auth.users;
SELECT * FROM public.profiles;
SELECT * FROM public.user_settings;
```

Deberías ver:
- Un registro en `auth.users`
- Un registro correspondiente en `profiles` con el mismo `id`
- Un registro correspondiente en `user_settings` con `llm_provider='gemini'` por defecto

Si falta alguno, revisa los logs de la función:

1. Ve a **Database** → **Functions**
2. Busca `handle_new_user`
3. Revisa los logs de ejecución

---

## Solución de Problemas

### "Email confirmation required" pero no recibo el email

1. Revisa la carpeta de spam
2. Verifica que Supabase tiene configurado un proveedor de email:
   - Por defecto usa el email de desarrollo (limitado)
   - Para producción, configura SendGrid, AWS SES, u otro proveedor
3. Ve a **Authentication** → **Logs** para ver intentos de envío

### Usuario registrado pero sin perfil en `profiles`

El trigger podría no estar funcionando. Ejecuta esto en SQL Editor:

```sql
-- Verificar que el trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Verificar que la función existe
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';
```

Si no existe, ejecuta de nuevo la migración `002_fix_profile_creation.sql`.

### "User already registered" pero no puedo iniciar sesión

Si desactivaste la confirmación de email DESPUÉS de registrar usuarios, esos usuarios quedan en estado pendiente. Opciones:

1. **Confirmar manualmente** (en desarrollo):
   ```sql
   UPDATE auth.users
   SET email_confirmed_at = NOW()
   WHERE email = 'usuario@ejemplo.com';
   ```

2. **Eliminar y volver a registrar**:
   ```sql
   DELETE FROM auth.users WHERE email = 'usuario@ejemplo.com';
   -- El CASCADE eliminará también el perfil
   ```

---

## Estado Actual

- ✅ Trigger automático configurado
- ✅ Políticas RLS configuradas
- ✅ Storage bucket `pdfs` creado
- ✅ Flujo de registro maneja confirmación de email correctamente
- ⚠️  Confirmación de email habilitada (por defecto)
  - Para desarrollo: Considera desactivarla
  - Para producción: Déjala activada
