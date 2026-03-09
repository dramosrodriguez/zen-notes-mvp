# 🎓 Guía Detallada de Zen Notes MVP: De Cero a Experto

Esta guía es una extensión de la documentación básica, pensada para desarrolladores junior o aquellos que vienen de otros frameworks y quieren entender **exactamente** cómo funciona este proyecto de Next.js y sus piezas móviles.

---

## 🏗️ 1. Entendiendo la Arquitectura de Next.js (App Router)

En Next.js 13+, el sistema de carpetas es el corazón de la aplicación.

### `layout.tsx` vs `page.tsx`
Imagina que `layout.tsx` es el marco de un cuadro y `page.tsx` es el lienzo que cambia.

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {/* Este contenido es persistente en todas las páginas */}
        {children} 
      </body>
    </html>
  );
}
```

*   **`layout.tsx`**: Aquí ponemos lo que no debe recargarse al navegar (como fuentes, metadata o el proveedor de modo oscuro).
*   **`page.tsx`**: Es el contenido específico de la ruta `/`. En nuestro caso, contiene el `Sidebar` y el workspace de notas.

---

## ⚡ 2. Client vs Server Components

Next.js por defecto trata todos los componentes como **Server Components** (se ejecutan en el servidor). Pero para un editor de notas, necesitamos interactividad inmediata.

Por eso verás `"use client";` al principio de casi todos nuestros archivos:
```tsx
"use client"; // Indica a Next.js que este componente usa hooks de React (state, effects)
import { useState } from "react";
```

> [!IMPORTANT]
> Si olvidas `"use client"`, recibirás un error al intentar usar hooks como `useState` o `useEffect`.

---

## 📂 3. Gestión de la Base de Datos (Supabase)

Usamos **Supabase** porque nos da una base de datos PostgreSQL y capacidades de **Tiempo Real** sin configurar un servidor propio.

### Conexión (`src/lib/supabase.ts`)
```tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Suscripción Realtime (`src/components/sidebar/Sidebar.tsx`)
Para que la lista de notas se actualice sola si borras una nota en otro PC, usamos esto:
```tsx
useEffect(() => {
  const channel = supabase
    .channel('cambios-en-notas')
    .on('postgres_changes', { 
      event: '*', // Escucha Inserts, Updates y Deletes
      schema: 'public', 
      table: 'notes' 
    }, () => {
      fetchNotes(); // Si algo cambia, vuelve a pedir la lista
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); }; // Limpieza
}, []);
```

---

## 📝 4. El Motor del Editor (Tiptap)

Tiptap no es un editor "listo para usar", es un **framework** para construir uno. 

### ¿Cómo guardamos los datos? (Debounce)
No queremos enviar una petición a internet cada vez que pulsas una tecla. Usamos un **Debounce**:
```tsx
useEffect(() => {
  // Esperamos 1000ms (1 segundo) después del último cambio para guardar
  const timeoutId = setTimeout(() => {
    saveToDb(editor.getHTML(), title);
  }, 1000);

  return () => clearTimeout(timeoutId); // Si pulsas otra tecla, cancelamos el anterior
}, [title, editor.getHTML()]);
```

---

## 🎨 5. Componentes de UI (shadcn/ui)

Este proyecto usa `shadcn/ui`. A diferencia de otras librerías de componentes (como MUI), shadcn no es una dependencia de `npm` que instalas, sino **código que copias en tu carpeta `src/components/ui`**.

*   **¿Por qué?** Porque tienes control total del código. Si quieres cambiar cómo se ve un botón, vas a `src/components/ui/button.tsx` y editas el Tailwind directamente.
*   **Radix UI**: Bajo el capó, muchos componentes usan Radix UI, que se encarga de que todo sea accesible (soporte de teclado, lectores de pantalla).

---

## 🌀 6. El Flujo de Datos (Prop Drilling vs State)

En `src/app/page.tsx`, gestionamos qué notas están abiertas:
```tsx
const [openNotes, setOpenNotes] = useState<string[]>([]);
```

Este estado se pasa al `Sidebar` para saber qué nota resaltar, y al `Workspace` para saber qué editores renderizar. 

**Ejemplo de cómo el Sidebar avisa a la página principal:**
1. El usuario hace click en una nota en el Sidebar.
2. El Sidebar llama a la función `onSelectNote(id)`.
3. Esta función llega a `page.tsx`, que actualiza el array `openNotes`.
4. React detecta el cambio de estado y vuelve a dibujar (re-render) el workspace con el nuevo editor.

---

## 📱 7. Progressive Web App (PWA)

Zen Notes es una PWA. Esto significa que puedes "Instalarla" desde Chrome/Safari.

*   **`manifest.ts`**: Define el nombre ("Zen Notes"), el color de la barra de estado y los iconos.
*   **Serwist (`sw.ts`)**: Es el "Service Worker". Es un script que vive en el navegador y decide qué archivos guardar en cache para que la app abra instantáneamente incluso sin WiFi.

---

## 🛠️ Cómo Extender el Proyecto

### ¿Quieres añadir un componente nuevo?
Usa el comando de shadcn desde tu terminal:
```bash
npx shadcn@latest add dialog
```
Esto creará `src/components/ui/dialog.tsx`, listo para usar.

### ¿Quieres añadir "Checklists" al editor?
1. Busca la extensión `@tiptap/extension-task-list`.
2. Instálala.
3. Añádela en el array `extensions` de `src/components/editor/TiptapEditor.tsx`.

---

## 🚀 8. Guía para el Principiante Absoluto (Zero to Zero)

Si es tu primera vez abriendo una terminal:

1.  **Instala Node.js**: Es el motor que permite ejecutar Javascript fuera del navegador. Descarga la versión "LTS" de [nodejs.org](https://nodejs.org).
2.  **La Terminal**: No le tengas miedo. Es solo una forma de decirle al PC qué hacer. `npm install` es como ir a una tienda y descargar todas las piezas del puzzle.
3.  **El archivo `.env`**: Es una caja de secretos. Nunca lo subas a GitHub (ya está en el `.gitignore`). Ahí guardas las llaves de tu base de datos.

## 🎨 9. El Nuevo Tailwind CSS 4

En este proyecto usamos Tailwind 4. A diferencia de las versiones antiguas:
*   **Zero Config**: Casi no necesita archivos de configuración `.js`. Se configura directamente en `src/app/globals.css` usando variables de CSS.
*   **Rendimiento**: Es mucho más rápido al procesar los estilos.
*   **Ejemplo de Clase Dinámica**:
    ```tsx
    <div className={`grid ${openNotes.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
    ```
    Aquí usamos Javascript para decirle a Tailwind cómo debe comportarse la cuadrícula según cuántas notas hay.

---

¡Felicidades! Ahora entiendes cómo se conectan los puntos en Zen Notes MVP. No tengas miedo de "romper" cosas para aprender cómo se arreglan.
