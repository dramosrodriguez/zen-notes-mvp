-- ==========================================
-- SCRIPT PARA AUTENTICACIÓN Y RLS MODO ESTRICTO
-- ==========================================

-- 1. Añadir columna user_id a notes si no existe
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- 2. Actualizar las notas existentes para asignarles un usuario (OPCIONAL, si hay datos previos)
-- Si necesitas asignar notas huerfanas a un usuario admin, podrías hacerlo aquí
-- UPDATE public.notes SET user_id = 'tu-uuid-de-admin' WHERE user_id IS NULL;

-- 3. Eliminar las políticas MVP públicas y permisivas anteriores
DROP POLICY IF EXISTS "Permitir acceso publico total" ON public.notes;
DROP POLICY IF EXISTS "Permitir subida publica MVP" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura publica MVP" ON storage.objects;
DROP POLICY IF EXISTS "Permitir borrado publico MVP" ON storage.objects;

-- 4. POLÍTICAS DE 'notes' (Strict RLS)
-- Solo se puede interactuar con las notas donde el user_id coincida con el usuario autenticado

-- Leer mis notas
CREATE POLICY "Usuarios pueden ver sus propias notas"
ON public.notes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Insertar mis notas (user_id debe coincidir obligatoriamente al crear)
CREATE POLICY "Usuarios pueden insertar sus propias notas"
ON public.notes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Actualizar mis notas
CREATE POLICY "Usuarios pueden actualizar sus propias notas"
ON public.notes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Borrar mis notas
CREATE POLICY "Usuarios pueden borrar sus propias notas"
ON public.notes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- 5. POLÍTICAS DE bucket 'note-images'
-- Idealmente la ruta debería empezar por user_id, ej: (auth.uid() || '/*')
-- Pero vamos a simplificar: solo usuarios autenticados pueden subir/leer

CREATE POLICY "Usuarios autenticados pueden subir imagenes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'note-images');

CREATE POLICY "Cualquiera puede leer imagenes (para que carguen en el Markdown de la nota)"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'note-images');

CREATE POLICY "Usuarios autenticados pueden borrar imagenes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'note-images');
