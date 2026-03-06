"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DbTest() {
  const notes = useLiveQuery(() => db.notes.toArray());

  const addNote = async () => {
    try {
      await db.notes.add({
        id: uuidv4(),
        titulo: `Nota de prueba ${new Date().toLocaleTimeString()}`,
        contenido_markdown: "Contenido **inicial** de la nota.",
        etiquetas: ["test", "dexie"],
        fecha_creacion: Date.now(),
      });
    } catch (error) {
      console.error("Error añadiendo la nota:", error);
    }
  };

  const clearNotes = async () => {
    try {
      await db.notes.clear();
    } catch (error) {
      console.error("Error borrando las notas:", error);
    }
  }

  return (
    <Card className="mt-8 border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl font-medium text-zinc-900 dark:text-zinc-100">Prueba IndexedDB</CardTitle>
        <CardDescription className="text-zinc-500">
          Componente para verificar que la persistencia offline-first con Dexie.js funciona.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button onClick={addNote} className="bg-zinc-800 hover:bg-zinc-700 text-white shadow-sm">
            Crear Nota de Prueba
          </Button>
          <Button onClick={clearNotes} variant="destructive" className="shadow-sm">
            Borrar Todo
          </Button>
        </div>
        
        <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <h3 className="font-medium mb-2 text-sm text-zinc-500">Notas en Base de Datos ({notes?.length || 0}):</h3>
          {notes?.length === 0 ? (
            <p className="text-zinc-500 text-sm italic">No hay notas actualmente.</p>
          ) : (
            <ul className="space-y-2">
              {notes?.map((note) => (
                <li key={note.id} className="text-sm border-b border-zinc-200 dark:border-zinc-800 pb-2 last:border-0">
                  <strong className="text-zinc-900 dark:text-zinc-100">{note.titulo}</strong>
                  <div className="text-xs text-zinc-500 mt-1">
                    ID: {note.id.substring(0, 8)}... | Fecha: {new Date(note.fecha_creacion).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
