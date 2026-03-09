import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log("Intentando insertar en Supabase...");
    const newId = crypto.randomUUID();
    const { data, error } = await supabase
        .from('notes')
        .insert({
            id: newId,
            titulo: 'Test Node Script',
            contenido_markdown: '<p>Hola</p>',
            etiquetas: [],
            fecha_creacion: Date.now(),
        })
        .select()
        .single();

    if (error) {
        console.error("ERROR DE SUPABASE:", JSON.stringify(error, null, 2));
    } else {
        console.log("EXITO DE SUPABASE:", data);
    }
}

test();
