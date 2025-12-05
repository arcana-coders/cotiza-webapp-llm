-- Función que crea automáticamente el perfil cuando se registra un usuario
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

  -- También crear settings por defecto
  INSERT INTO public.user_settings (user_id, llm_provider)
  VALUES (NEW.id, 'gemini');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que ejecuta la función cuando se crea un usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Agregar policy para que los usuarios puedan ver que se creó su perfil
CREATE POLICY "Users can insert own profile during signup"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
