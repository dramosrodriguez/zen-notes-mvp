"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Search, Plus, PanelLeftClose, PanelLeft, FileText, Trash2, Download, Upload, Moon, Sun, Laptop } from "lucide-react";
import { useBackup } from "@/hooks/useBackup";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/components/ThemeProvider";

import { User } from "@supabase/supabase-js";

interface SidebarProps {
  openNotes: string[];
  onSelectNote: (id: string | null) => void;
  user?: User | null;
  onShowLogin?: () => void;
}

export function Sidebar({ openNotes, onSelectNote, user, onShowLogin }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  
  // Custom Hook for Backup
  const { exportData, importData, isExporting, isImporting } = useBackup();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  // Fetch notes from Supabase
  const fetchNotes = useCallback(async () => {
    let query = supabase
      .from('notes')
      .select('id, titulo, fecha_creacion')
      .order('fecha_creacion', { ascending: false });

    if (searchQuery.trim()) {
      query = query.ilike('titulo', `%${searchQuery}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching notes:", error);
    } else {
      setNotes(data || []);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      return;
    }
    
    fetchNotes();

    // Subscribe to changes in Supabase
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
        },
        () => {
          fetchNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotes, user]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const success = await importData(file);
      if (success) {
        alert("¡Notas importadas correctamente!");
        fetchNotes();
      }
      e.target.value = '';
    }
  };

  if (!isOpen) {
    return (
      <div className="h-screen bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center py-4 w-16 transition-all duration-300 z-10">
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="mb-4 hover:bg-zinc-200 dark:hover:bg-zinc-800">
          <PanelLeft size={20} className="text-zinc-500" />
        </Button>
        <Button variant="ghost" size="icon" onClick={async () => {
          if (!user) {
            onShowLogin?.();
            return;
          }
          const newId = crypto.randomUUID();
          const { error } = await supabase.from('notes').insert({ 
            id: newId, 
            titulo: "Nueva Nota", 
            contenido_markdown: "<p>Empieza a escribir aquí...</p>", 
            fecha_creacion: Date.now(),
            user_id: user.id 
          });
          if (!error) { onSelectNote(newId); fetchNotes(); }
          else console.error(error);
        }} className="hover:bg-zinc-200 dark:hover:bg-zinc-800">
          <Plus size={20} className="text-zinc-500" />
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-50 dark:bg-zinc-100/5 bg-opacity-50 dark:bg-opacity-50 border-r border-zinc-200 dark:border-zinc-800 w-72 flex flex-col transition-all duration-300 flex-shrink-0 z-10 block">
      <div className="p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          Zen Notes
        </h2>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              if (theme === 'light') setTheme('dark');
              else if (theme === 'dark') setTheme('system');
              else setTheme('light');
            }} 
            className="h-8 w-8 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            title="Cambiar tema"
          >
            {theme === 'light' ? <Sun size={16} className="text-zinc-500" /> : 
             theme === 'dark' ? <Moon size={16} className="text-zinc-500" /> : 
             <Laptop size={16} className="text-zinc-500" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 hover:bg-zinc-200 dark:hover:bg-zinc-800">
            <PanelLeftClose size={16} className="text-zinc-500" />
          </Button>
        </div>
      </div>

      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-3 flex-shrink-0">
        <Button 
          onClick={async () => {
            if (!user) {
              onShowLogin?.();
              return;
            }
            if (openNotes.length >= 6) {
              alert("Has alcanzado el límite máximo de 6 notas abiertas simultáneamente.");
              return;
            }
            const newId = crypto.randomUUID();
            const { error } = await supabase
              .from('notes')
              .insert({
                id: newId,
                titulo: "Nueva Nota",
                contenido_markdown: "<p>Empieza a escribir aquí...</p>",
                fecha_creacion: Date.now(),
                user_id: user.id
              });
            
            if (error) {
              console.error("Error creating note:", error);
            } else {
              onSelectNote(newId);
              fetchNotes(); // Fast manual sync
            }
          }} 
          className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-sm flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Nueva Nota</span>
        </Button>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="Buscar notas..."
            className="pl-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:ring-1 focus-visible:ring-zinc-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {!notes || notes.length === 0 ? (
            <div className="text-center py-8 text-sm text-zinc-500 italic">
              {searchQuery ? "No se encontraron notas." : "No hay notas aún."}
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="relative group">
                <button
                  onClick={() => onSelectNote(note.id)}
                  className={`w-full text-left p-3 pr-10 rounded-lg flex items-start gap-3 transition-colors ${
                    openNotes.includes(note.id)
                      ? "bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 ring-1 ring-zinc-300 dark:ring-zinc-700"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/30"
                  }`}
                >
                  <FileText size={16} className={`mt-0.5 shrink-0 ${openNotes.includes(note.id) ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400"}`} />
                  <div className="overflow-hidden">
                    <h3 className="text-sm font-medium truncate">{note.titulo || "Sin título"}</h3>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 truncate">
                      {new Date(note.fecha_creacion).toLocaleDateString()}
                    </p>
                  </div>
                </button>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (confirm("¿Estás seguro de que quieres eliminar esta nota?")) {
                      const { error } = await supabase
                        .from('notes')
                        .delete()
                        .eq('id', note.id);
                      
                      if (error) {
                        console.error("Error deleting note:", error);
                      } else {
                        if (openNotes.includes(note.id)) {
                          // The page.tsx passes onSelectNote handler. We'll pass the deleted ID and page.tsx will filter it out.
                          // Let's modify page.tsx to handle this gracefully or pass the exact ID here if so.
                          onSelectNote(note.id); // In page.tsx: if openNotes.includes(id), we could toggle it off.
                        }
                        fetchNotes(); // Fast manual sync
                      }
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded opacity-0 group-hover:opacity-100 transition-all"
                  title="Eliminar nota"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2 shrink-0">
        <input 
          type="file" 
          accept=".json" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange} 
        />
        
        {user ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 px-2 py-1.5 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-5 h-5 bg-zinc-200 dark:bg-zinc-700 rounded flex items-center justify-center font-bold text-zinc-900 dark:text-zinc-100 shrink-0">
                  {user.email?.[0].toUpperCase() || 'U'}
                </div>
                <span className="truncate">{user.email}</span>
              </div>
              <button 
                onClick={async () => await supabase.auth.signOut()}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium shrink-0 px-1"
                title="Cerrar sesión"
              >
                Salir
              </button>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="w-1/2 text-xs h-8 bg-transparent text-zinc-600 dark:text-zinc-400 flex gap-1.5"
                onClick={exportData}
                disabled={isExporting}
                title="Exportar"
              >
                <Download size={14} />
                <span className="truncate">Exportar</span>
              </Button>
              <Button 
                variant="outline" 
                className="w-1/2 text-xs h-8 bg-transparent text-zinc-600 dark:text-zinc-400 flex gap-1.5"
                onClick={handleImportClick}
                disabled={isImporting}
                title="Importar"
              >
                <Upload size={14} />
                <span className="truncate">Importar</span>
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            onClick={onShowLogin}
            className="w-full text-xs h-9 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 font-medium"
          >
            Iniciar Sesión
          </Button>
        )}
      </div>
    </div>
  );
}
