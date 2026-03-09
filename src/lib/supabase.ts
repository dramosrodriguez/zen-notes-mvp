import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.warn("Faltan las variables de entorno de Supabase. Añade NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Sube una imagen al bucket de Supabase Storage ('note-images')
 * y devuelve la URL pública para usarla en Tiptap.
 */
export async function uploadImage(file: File): Promise<string> {
    if (!file) throw new Error("No hay archivo para subir");

    // Generar un nombre de archivo único para evitar sobrescrituras
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Subir al bucket 'note-images'
    const { error: uploadError } = await supabase.storage
        .from('note-images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false // false para evitar sobrescribir si por raro que parezca hay uuid repetido
        });

    if (uploadError) {
        console.error("Error al subir imagen a Supabase:", uploadError);
        throw uploadError;
    }

    // Obtener la URL pública correspondiente
    const { data } = supabase.storage
        .from('note-images')
        .getPublicUrl(filePath);

    return data.publicUrl;
}
