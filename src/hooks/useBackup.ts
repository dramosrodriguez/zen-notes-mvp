import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useBackup() {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    // === EXPORTAR ===
    const exportData = async () => {
        try {
            setIsExporting(true);
            const { data: allNotes, error } = await supabase
                .from('notes')
                .select('*')
                .order('fecha_creacion', { ascending: false });

            if (error) throw error;

            const backupData = {
                version: 1,
                timestamp: new Date().toISOString(),
                notes: allNotes || [],
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `zen-notes-backup-cloud-${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();

            return true;
        } catch (error) {
            console.error("Error al exportar desde Supabase:", error);
            return false;
        } finally {
            setIsExporting(false);
        }
    };

    // === IMPORTAR ===
    const importData = async (file: File) => {
        return new Promise<boolean>((resolve) => {
            try {
                setIsImporting(true);
                const reader = new FileReader();

                reader.onload = async (event) => {
                    try {
                        const content = event.target?.result as string;
                        const parsedData = JSON.parse(content);

                        if (!parsedData.notes || !Array.isArray(parsedData.notes)) {
                            alert("Archivo no válido o corrupto.");
                            resolve(false);
                            return;
                        }

                        const notesToImport = parsedData.notes;

                        // Upsert notes into Supabase
                        // Supabase allows 'upsert' which handles conflicts based on id (primary key)
                        const { error } = await supabase
                            .from('notes')
                            .upsert(notesToImport);

                        if (error) throw error;

                        resolve(true);
                    } catch (e) {
                        console.error("Error analizando el JSON o subiendo a Supabase:", e);
                        alert("Error al procesar la importación.");
                        resolve(false);
                    }
                };

                reader.readAsText(file);
            } catch (error) {
                console.error("Error inicial al importar:", error);
                resolve(false);
            } finally {
                setIsImporting(false);
            }
        });
    };

    return { exportData, importData, isExporting, isImporting };
}
