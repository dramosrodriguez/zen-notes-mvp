"use client";

import { useState, useEffect } from "react";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { FileText, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { LoginModal } from "@/components/auth/LoginModal";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const [openNotes, setOpenNotes] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setOpenNotes([]); // Clear notes on logout
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-900">
      <Sidebar 
        openNotes={openNotes} 
        onSelectNote={(id) => {
          if (!id) return;
          if (openNotes.includes(id)) {
            setOpenNotes(prev => prev.filter(nId => nId !== id));
          } else {
            if (openNotes.length < 6) {
              setOpenNotes(prev => [...prev, id]);
            } else {
              alert("Has alcanzado el límite máximo de 6 notas abiertas simultáneamente.");
            }
          }
        }}
        user={user}
        onShowLogin={() => setShowLoginModal(true)}
      />
      
      <main className="flex-1 overflow-y-auto bg-zinc-100/30 dark:bg-zinc-900 flex flex-col relative">
        {/* Banner para usuarios no autenticados */}
        {!user && !loadingAuth && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/30 p-3 flex items-center justify-center gap-2 text-amber-800 dark:text-amber-500 text-sm">
            <AlertTriangle size={16} />
            <span>Estás en modo de prueba. <strong>Los cambios no se guardarán</strong>. <button onClick={() => setShowLoginModal(true)} className="underline font-medium hover:text-amber-900 dark:hover:text-amber-400">Inicia sesión</button> para guardar tus notas.</span>
          </div>
        )}

        {loadingAuth ? (
          <div className="flex-1 flex items-center justify-center text-zinc-400">Cargando...</div>
        ) : !user ? (
          /* Vista de Scratchpad (Nota de prueba) para NO autenticados */
          <div className="flex-1 p-4 flex flex-col">
            <div className="flex-1 bg-white dark:bg-zinc-950 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden relative flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 select-none">
                <span className="text-xs font-semibold text-zinc-500 tracking-wider uppercase">Borrador Temporal</span>
              </div>
              <div className="flex-1 overflow-y-auto relative">
                <TiptapEditor isMock={true} initialTitle="Nota de Prueba" />
              </div>
            </div>
          </div>
        ) : openNotes.length > 0 ? (
          /* Vista normal de cuadrícula para Autenticados */
          <div className={`overflow-hidden flex-1 grid gap-4 p-4 ${
            openNotes.length === 1 ? 'grid-cols-1' :
            openNotes.length === 2 ? 'grid-cols-2' :
            openNotes.length === 3 ? 'grid-cols-2' : 
            openNotes.length === 4 ? 'grid-cols-2 grid-rows-2' :
            openNotes.length === 5 ? 'grid-cols-3' :
            openNotes.length === 6 ? 'grid-cols-3 grid-rows-2' : 'grid-cols-1'
          }`}>
            {openNotes.map((noteId, index) => (
              <div key={noteId} className={`flex flex-col bg-white dark:bg-zinc-950 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden relative ${
                openNotes.length === 3 && index === 2 ? 'col-span-2' : '' 
              }`}>
                {/* Cabecera / Pestaña del Editor */}
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 select-none">
                  <div className="flex gap-1">
                    <button 
                      title="Mover a la izquierda"
                      onClick={() => {
                        if (index > 0) {
                          setOpenNotes(prev => {
                            const newArr = [...prev];
                            [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]];
                            return newArr;
                          });
                        }
                      }}
                      disabled={index === 0}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30"
                    >
                      &larr;
                    </button>
                    <button 
                      title="Mover a la derecha"
                      onClick={() => {
                        if (index < openNotes.length - 1) {
                          setOpenNotes(prev => {
                            const newArr = [...prev];
                            [newArr[index], newArr[index + 1]] = [newArr[index + 1], newArr[index]];
                            return newArr;
                          });
                        }
                      }}
                      disabled={index === openNotes.length - 1}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30"
                    >
                      &rarr;
                    </button>
                  </div>
                  
                  <span className="text-xs font-semibold text-zinc-500 tracking-wider uppercase">Pestaña {index + 1}</span>
                  
                  <button 
                    onClick={() => setOpenNotes(prev => prev.filter(id => id !== noteId))}
                    className="p-1.5 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 text-zinc-500 transition-colors"
                    title="Cerrar nota"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Contenido del Editor */}
                <div className="flex-1 overflow-y-auto relative">
                  <TiptapEditor noteId={noteId} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
            <FileText size={64} className="text-zinc-200 dark:text-zinc-800 mb-4" />
            <p className="text-lg font-medium text-zinc-400">Espacio de trabajo vacío</p>
            <p className="text-sm text-zinc-500 mt-2 max-w-sm text-center">Selecciona notas en la barra lateral para abrirlas aquí. Puedes abrir hasta 6 notas simultáneamente creadas en una cuadrícula.</p>
          </div>
        )}
      </main>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onSuccess={() => setShowLoginModal(false)} 
      />
    </div>
  );
}
