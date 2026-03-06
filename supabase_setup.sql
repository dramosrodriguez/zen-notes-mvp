-- Script para inicializar la tabla 'notes' en Supabase

CREATE TABLE IF NOT EXISTS public.notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo text NOT NULL DEFAULT 'Nueva Nota',
  contenido_markdown text NOT NULL DEFAULT '',
  etiquetas text[] DEFAULT ARRAY[]::text[],
  fecha_creacion bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000),
  id_carpeta text NULL
);

-- Habilitar la seguridad a nivel de fila (RLS)
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Política de acceso PÚBLICO:
-- "No debe haber usuarios, cualquiera que acceda a la aplicación verá todas las notas"
-- Esta política permite Insertar, Seleccionar, Actualizar y Eliminar a todos (anon).
CREATE POLICY "Permitir acceso publico total"
ON public.notes
FOR ALL
USING (true)
WITH CHECK (true);
