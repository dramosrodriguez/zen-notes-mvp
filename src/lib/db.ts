import Dexie, { type EntityTable } from 'dexie';

export interface Note {
    id: string; // UUID
    titulo: string;
    contenido_markdown: string;
    etiquetas: string[];
    fecha_creacion: number;
    id_carpeta?: string;
}

const db = new Dexie('ZenNotesDB') as Dexie & {
    notes: EntityTable<
        Note,
        'id'
    >;
};

// Schema declaration:
db.version(1).stores({
    notes: 'id, titulo, *etiquetas, fecha_creacion, id_carpeta'
});

export { db };
