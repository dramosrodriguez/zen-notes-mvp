-- ==========================================
-- SCRIPT PARA GESTIÓN DE IMÁGENES (STORAGE)
-- ==========================================

-- 1. Crear el bucket 'note-images' si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('note-images', 'note-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Habilitar RLS en el bucket
-- Esto es normalmente automático, pero lo aseguramos para policies.
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas para permitir subida pública (INSERT)
-- Idealmente sólo a usuarios autenticados, pero para el MVP con acceso público será:
CREATE POLICY "Permitir subida publica MVP"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'note-images');

-- 4. Crear políticas para permitir lectura pública (SELECT)
CREATE POLICY "Permitir lectura publica MVP"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'note-images');

-- 5. Crear políticas para permitir borrado público (DELETE)
CREATE POLICY "Permitir borrado publico MVP"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'note-images');
