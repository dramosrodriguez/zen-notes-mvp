# 🧘 Zen Notes MVP - Documentación Completa del Proyecto

Bienvenido a la documentación de **Zen Notes MVP**. Este documento está diseñado para ayudarte a entender la estructura, configuración y lógica del proyecto, incluso si eres nuevo en el ecosistema de Next.js o Node.js.

---

## 📋 Tabla de Contenidos
1. [Introducción](#1-introducción)
2. [Pila Tecnológica (Tech Stack)](#2-pila-tecnológica)
3. [Estructura de Directorios](#3-estructura-de-directorios)
4. [Instalación y Configuración](#4-instalación-y-configuración)
5. [Base de Datos (Supabase)](#5-base-de-datos)
6. [Componentes Principales](#6-componentes-principales)
7. [PWA y Offline](#7-pwa-y-offline)
8. [Conceptos para Principiantes](#8-conceptos-para-principiantes)

---

## 1. Introducción
**Zen Notes MVP** es un editor de notas minimalista y potente. Su característica principal es el **Workspace Dinámico**, que permite abrir hasta 6 notas simultáneamente en una cuadrícula inteligente, facilitando la multitarea y la referencia cruzada entre notas.

### Características Clave:
- 📝 Edición de texto enriquecido (Rich Text).
- 🌓 Soporte para modo claro y oscuro.
- 🔄 Sincronización en tiempo real con Supabase.
- 📱 Instalable como aplicación móvil/escritorio (PWA).
- 📤 Importación/Exportación de datos en formato JSON.

---

## 2. Pila Tecnológica
El proyecto utiliza herramientas modernas para garantizar velocidad y facilidad de desarrollo:

- **Next.js 15+ (App Router)**: Framework de React para construir aplicaciones web modernas. (Nota: El proyecto usa una versión experimental 16.x).
- **Tailwind CSS 4.0**: Un motor de estilos basado en utilidades de última generación.
- **Supabase**: Proporciona base de datos PostgreSQL, autenticación y capacidades en tiempo real.
- **Tiptap**: Un framework para crear editores de texto enriquecido altamente extensible.
- **Serwist**: Gestión de Service Workers para soporte PWA y offline.
- **Lucide React**: Biblioteca de iconos elegantes.

---

## 3. Estructura de Directorios
Así es como se organiza el código dentro de la carpeta `src/`:

```text
src/
├── app/                  # Lógica de rutas de Next.js (App Router)
│   ├── globals.css       # Estilos globales y configuración de Tailwind
│   ├── layout.tsx        # Estructura base (HTML, Head, Body)
│   ├── page.tsx          # La página principal (Dashboard/Workspace)
│   ├── manifest.ts       # Configuración para que el móvil reconozca la App
│   └── sw.ts             # Configuración del Service Worker (PWA)
├── components/           # Componentes reutilizables
│   ├── editor/           # Lógica del editor Tiptap
│   ├── sidebar/          # Barra lateral de gestión de notas
│   └── ui/               # Componentes básicos de interfaz (shadcn)
├── hooks/                # Hooks personalizados
│   └── useBackup.ts      # Lógica para exportar/importar datos JSON
├── lib/                  # Configuraciones y utilidades
│   ├── supabase.ts       # Cliente de conexión con Supabase
│   └── utils.ts          # Utilidades para CSS (cn)
```

---

## 4. Instalación y Configuración

### 1. Clonar e Instalar
```bash
# Instalar dependencias
npm install
```

### 2. Variables de Env
Crea un archivo `.env` en la raíz con tus credenciales:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### 3. Ejecutar
```bash
# Modo desarrollo
npm run dev
```

---

## 5. Base de Datos
El proyecto usa Supabase. Toda la información reside en la tabla `notes`.

### Esquema:
- `id` (uuid): Identificador único.
- `titulo` (text): Título de la nota.
- `contenido_markdown` (text): Contenido guardado en formato HTML.
- `fecha_creacion` (bigint): Timestamp en ms.

### Configuración SQL:
Revisa `supabase_setup.sql` para ver cómo crear la tabla y configurar las políticas de seguridad (RLS).

---

## 6. Componentes Principales

### `TiptapEditor.tsx`
- **Autoguardado**: Guarda cambios automáticamente con un retraso (debounce) de 1s.
- **Formato**: Soporta negrita, cursiva, encabezados, colores y listas.
- **Grid Context**: Se adapta al tamaño del contenedor en el workspace.

### `Sidebar.tsx`
- **Realtime Sync**: Escucha cambios en Supabase para actualizar la lista de notas al instante.
- **Gestión**: Permite crear, buscar y eliminar notas.

---

## 7. PWA y Offline
Gracias a Serwist, puedes instalar Zen Notes en tu dispositivo:
1. Asegúrate de que el `manifest.ts` tenga los iconos correctos en `public/`.
2. El modo offline permite abrir la app sin internet, basándose en los archivos cacheados por el Service Worker.

---

## 8. Conceptos para Principiantes

### Hooks de React
- `useState`: Para mantener datos locales (ej: si la barra lateral está abierta).
- `useEffect`: Para ejecutar acciones externas (ej: pedir las notas a Supabase al cargar).
- `useCallback`: Para optimizar funciones que se pasan a otros componentes.

### Tailwind 4
A diferencia de CSS tradicional, usamos clases cortas:
- `dark:bg-zinc-900`: Cambia el fondo solo en modo oscuro.
- `grid-cols-2`: Crea una cuadrícula de dos columnas.
- `animate-pulse`: Crea un efecto de carga suave.

---

¡Disfruta construyendo con **Zen Notes MVP**!
