"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect, useState } from 'react';
import { Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Undo2, Redo2, ImageIcon, Loader2 } from 'lucide-react';
import { supabase, uploadImage } from '@/lib/supabase';
import Image from '@tiptap/extension-image';

// Crear una extensión de imagen personalizada que soporte width y height
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => {
          if (!attributes.height) return {};
          return { height: attributes.height };
        },
      },
    };
  },
});

import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';

interface TiptapEditorProps {
  noteId?: string;
  initialTitle?: string;
  isMock?: boolean;
}

function ImageResizeControl({ editor }: { editor: any }) {
  const currentWidth = editor.getAttributes('image').width || '';
  const [width, setWidth] = useState(currentWidth);

  useEffect(() => {
    setWidth(editor.getAttributes('image').width || '');
  }, [editor.getAttributes('image').width]);

  const applyWidth = (newWidth?: string) => {
    const finalWidth = newWidth !== undefined ? newWidth : width;
    editor.chain().focus().updateAttributes('image', { width: finalWidth ? finalWidth : null, height: null }).run();
    if (newWidth !== undefined) {
      setWidth(newWidth);
    }
  };

  const presetSizes = [
    { label: 'XS', value: '150' },
    { label: 'S', value: '300' },
    { label: 'M', value: '500' },
    { label: 'L', value: '800' },
    { label: 'XL', value: '1200' },
  ];

  return (
    <div className="flex items-center gap-2 p-1">
      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Imagen</span>
      <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 my-auto mx-1"></div>
      
      {/* Botones de tamaño predefinido */}
      <div className="flex items-center gap-1">
        {presetSizes.map(size => (
          <button
            key={size.label}
            onClick={() => applyWidth(size.value)}
            className={`h-7 px-2 text-xs font-medium rounded transition-colors ${
              currentWidth === size.value 
                ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' 
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-700/50 text-zinc-500 dark:text-zinc-400'
            }`}
            title={`${size.value}px`}
          >
            {size.label}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 my-auto mx-1"></div>
      
      {/* Input manual */}
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-medium text-zinc-500">px:</label>
        <input
          type="number"
          className="w-16 h-7 text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-700 dark:text-zinc-300"
          placeholder="auto"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') applyWidth();
          }}
        />
      </div>
      <button
        onClick={() => applyWidth()}
        className="h-7 px-2.5 text-xs font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
      >
        Ok
      </button>
    </div>
  );
}

export function TiptapEditor({ noteId, initialTitle = "Nueva Nota", isMock = false }: TiptapEditorProps) {
  const [title, setTitle] = useState(noteId ? "" : initialTitle);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(noteId || null);
  const [, setRefreshTick] = useState(0);

  const saveToDb = useCallback(async (content: string, noteTitle: string) => {
    if (isMock) return; // No guardamos notas de prueba
    
    setIsSaving(true);
    try {
      if (currentNoteId) {
        // Update existing note in Supabase
        const { error } = await supabase
          .from('notes')
          .update({
            titulo: noteTitle,
            contenido_markdown: content,
          })
          .eq('id', currentNoteId);

        if (error) throw error;
      } else {
        // Insert new note in Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const newId = crypto.randomUUID();
        const { data, error } = await supabase
          .from('notes')
          .insert({
            id: newId,
            titulo: noteTitle,
            contenido_markdown: content,
            etiquetas: [],
            fecha_creacion: Date.now(),
            user_id: session.user.id
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setCurrentNoteId(data.id);
        }
      }
    } catch (error) {
      console.error("Error guardando en Supabase:", error);
    } finally {
      setIsSaving(false);
    }
  }, [currentNoteId]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      CustomImage.configure({
        HTMLAttributes: {
          class: 'rounded-lg border border-zinc-200 dark:border-zinc-800 max-w-full',
        },
      }),
    ],
    content: '<p>Cargando editor...</p>',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // Evitar autoguardado antes de que haya cargado todo
      if (!isLoaded) return;
      
      const html = editor.getHTML(); 
      saveToDb(html, title);
    },
    onSelectionUpdate: () => {
      // Forzar re-render para que los botones reflejen la selección actual (si es H2, Tachado, etc.)
      setRefreshTick((r: number) => r + 1);
    },
    onTransaction: () => {
      // Por seguridad garantizamos estado local tras deshacer/rehacer y cambios similares
      setRefreshTick((r: number) => r + 1);
    },
    editorProps: {
      attributes: {
        // Añadimos [&_strong]:!text-inherit para evitar que el plugin "prose" de Tailwind pise los colores del texto cuando es negrita.
        // Lo mismo para los headings si queremos que admitan color, aunque por ahora aseguramos strong y headings genéricos si hace falta.
        // Por consistencia en Markdown, garantizamos que strong e inline-elements hereden.
        class: 'prose prose-zinc prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-none min-h-[50vh] [&_strong]:!text-inherit [&_h1]:!text-inherit [&_h2]:!text-inherit [&_h3]:!text-inherit',
      },
    },
  });

  // Load Initial Content
  useEffect(() => {
    async function loadData() {
      try {
        if (noteId) {
          const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('id', noteId)
            .single();

          if (error) throw error;

          if (data && editor) {
            setTitle(data.titulo);
            editor.commands.setContent(data.contenido_markdown);
          }
        } else {
          // Explicitly new note requested by the Sidebar / Home
          if (editor) {
            setTitle("Nueva Nota");
            if (isMock) {
              editor.commands.setContent(`
                <h1>¡Bienvenido a Zen Notes! 🧘</h1>
                <p>Esta es una <strong>nota de prueba</strong>. Los cambios que hagas aquí no se guardarán a menos que inicies sesión.</p>
                <h2>Características de edición</h2>
                <p>Puedes aplicar diferentes estilos de texto, como <em>cursiva</em>, <strong>negrita</strong>, <s>tachado</s>, o <span style="color:#ef4444">aplicar</span> <span style="color:#3b82f6">colores</span> <span style="color:#10b981">distintos</span>.</p>
                <h3>Estructura y Listas</h3>
                <ul>
                  <li>Puedes crear listas de viñetas para tus ideas sueltas.</li>
                  <li>Incluso listas anidadas.</li>
                </ul>
                <ol>
                  <li>Primer paso para organizarte.</li>
                  <li>Segundo paso: apuntarlo todo.</li>
                </ol>
                <blockquote>"La creatividad simplemente consiste en conectar cosas." - Steve Jobs</blockquote>
                <p>¡Selecciona cualquier parte de este texto para probar el menú emergente y cambiar su formato!</p>
              `);
            } else {
              editor.commands.setContent('<p>Empieza a escribir aquí...</p>');
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar la nota inicial desde Supabase", error);
      } finally {
        setIsLoaded(true);
      }
    }
    
    // Solo cargamos una vez cuando el editor está listo
    if (editor && !editor.isDestroyed && !isLoaded) {
      loadData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]); // Dependemos solo de la inicialización, el `key` en page.tsx destruye el componente al cambiar de nota

  // Effect for Debounced Title Change
  useEffect(() => {
    if (editor && isLoaded) {
      const timeoutId = setTimeout(() => {
        saveToDb(editor.getHTML(), title);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [title, editor, saveToDb, isLoaded]);

  if (!editor || !isLoaded) {
    return (
      <div className="w-full h-full p-8 animate-pulse bg-white dark:bg-zinc-950 flex flex-col">
        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mb-8"></div>
        <div className="space-y-4 flex-1">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 sm:p-8 flex flex-col relative overflow-y-auto">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-3xl sm:text-4xl font-bold bg-transparent border-none outline-none w-full mb-4 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 shrink-0"
        placeholder="Título de la nota"
      />

      {/* Toolbar superior estática (opcional, como botón de imagen) */}
      <div className="flex items-center mb-6 gap-2 border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
        <label className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          (isUploadingImage || isMock)
          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' 
          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 cursor-pointer'
        }`}
        title={isMock ? "Inicia sesión para subir imágenes" : ""}
        >
          {isUploadingImage ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
          <span>{isUploadingImage ? 'Subiendo...' : 'Añadir Imagen'}</span>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            disabled={isUploadingImage || !editor || isMock}
            onChange={async (e) => {
              if (e.target.files && e.target.files[0] && editor) {
                try {
                  setIsUploadingImage(true);
                  const file = e.target.files[0];
                  // Usar la función helper que creamos
                  const publicUrl = await uploadImage(file);
                  // Insertar la imagen en el editor
                  editor.chain().focus().setImage({ src: publicUrl }).run();
                } catch (error) {
                  alert('Hubo un error al subir la imagen.');
                  console.error(error);
                } finally {
                  setIsUploadingImage(false);
                  // Reseteamos el input para que pueda seleccionar el mismo archivo si es necesario
                  e.target.value = '';
                }
              }
            }}
          />
        </label>
      </div>

      {editor && (
        <BubbleMenu 
          editor={editor} 
          shouldShow={({ editor, view, state, oldState, from, to }) => {
            // Check if it's an image selection or text selection
            return editor.isActive('image') || (!state.selection.empty && !editor.isActive('image'));
          }}
          className="flex gap-1 bg-white dark:bg-zinc-800 p-1 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700"
        >
          {editor.isActive('image') ? (
            <ImageResizeControl editor={editor} />
          ) : (
            <>
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 ${editor.isActive('bold') ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}
                title="Negrita"
              >
                <Bold size={16} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 ${editor.isActive('italic') ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}
                title="Cursiva"
              >
                <Italic size={16} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 ${editor.isActive('strike') ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}
                title="Tachado"
              >
                <Strikethrough size={16} />
              </button>

              <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 my-auto mx-1"></div>

              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 ${editor.isActive('heading', { level: 1 }) ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}
                title="Título 1"
              >
                <Heading1 size={16} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}
                title="Título 2"
              >
                <Heading2 size={16} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 ${editor.isActive('heading', { level: 3 }) ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}
                title="Título 3"
              >
                <Heading3 size={16} />
              </button>

              <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 my-auto mx-1"></div>

              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 ${editor.isActive('bulletList') ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}
                title="Lista de Puntos"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 ${editor.isActive('orderedList') ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}
                title="Lista Numerada"
              >
                <ListOrdered size={16} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 ${editor.isActive('blockquote') ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}
                title="Cita"
              >
                <Quote size={16} />
              </button>

              <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 my-auto mx-1"></div>

              {/* Preset Colors */}
              <div className="flex items-center gap-0.5 px-1">
                {[
                  { color: '#ef4444', name: 'Rojo' },
                  { color: '#f59e0b', name: 'Naranja' },
                  { color: '#10b981', name: 'Menta' },
                  { color: '#3b82f6', name: 'Azul' },
                  { color: '#8b5cf6', name: 'Morado' },
                ].map(({ color, name }) => (
                  <button
                    key={color}
                    onClick={() => editor.chain().focus().setColor(color).run()}
                    className={`w-6 h-6 flex items-center justify-center rounded-full transition-transform hover:scale-110 ${editor.getAttributes('textStyle').color === color ? 'ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-1 dark:ring-offset-zinc-800' : ''}`}
                    title={name}
                  >
                    <div className="w-4 h-4 rounded-full shadow-sm border border-black/10 dark:border-white/10" style={{ backgroundColor: color }} />
                  </button>
                ))}
                
                {/* Botón reset color */}
                <button
                  onClick={() => editor.chain().focus().unsetColor().run()}
                  className={`w-6 h-6 flex items-center justify-center rounded-full transition-transform hover:scale-110 ml-0.5 ${!editor.getAttributes('textStyle').color ? 'ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-1 dark:ring-offset-zinc-800' : ''}`}
                  title="Color por defecto"
                >
                  <div className="w-4 h-4 rounded-full shadow-sm border border-black/10 dark:border-white/10 bg-zinc-900 dark:bg-zinc-100" />
                </button>

                {/* Custom Color Picker (Nativo) */}
                <div className="relative flex items-center justify-center w-6 h-6 ml-0.5 rounded-full hover:scale-110 transition-transform cursor-pointer" title="Color personalizado">
                  <input
                    type="color"
                    onInput={event => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
                    value={editor.getAttributes('textStyle').color || '#000000'}
                    className="absolute inset-0 w-8 h-8 -ml-1 -mt-1 cursor-pointer opacity-0 z-10"
                  />
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm border border-black/10 dark:border-white/10" 
                    style={{ 
                      background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)'
                    }}
                  />
                </div>
              </div>

              <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 my-auto mx-1"></div>

              <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 disabled:opacity-30 disabled:hover:bg-transparent"
                title="Deshacer (Ctrl+Z)"
              >
                <Undo2 size={16} />
              </button>
              <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 disabled:opacity-30 disabled:hover:bg-transparent"
                title="Rehacer (Ctrl+Y)"
              >
                <Redo2 size={16} />
              </button>
            </>
          )}
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />

      <div className="fixed bottom-4 right-4 text-xs font-medium text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
        {isSaving ? (
          <>
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            Guardando...
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            Guardado
          </>
        )}
      </div>
    </div>
  );
}
