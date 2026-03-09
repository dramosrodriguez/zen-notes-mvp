# 🧘 Zen Notes MVP

Zen Notes MVP es una aplicación de toma de notas moderna, minimalista y diseñada para la productividad extrema. Permite gestionar múltiples notas simultáneamente en un espacio de trabajo dinámico.

> [!TIP]
> **¿Eres nuevo en el proyecto?** Revisa nuestra [Guía de Documentación Completa](./DOCUMENTATION.md) para entender cómo funciona todo bajo el capó.

## ✨ Características Principales

- **Workspace de 6 Notas**: Abre hasta 6 notas a la vez en una cuadrícula inteligente.
- **Editor Enriquecido**: Potenciado por **Tiptap**, con soporte para colores, encabezados y listas.
- **Sincronización Cloud**: Base de datos en tiempo real con **Supabase**.
- **Offline First**: Soporte PWA completo gracias a **Serwist**.
- **Modo Oscuro Premuim**: Interfaz diseñada para reducir la fatiga visual.

## 🚀 Inicio Rápido

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar el entorno**:
   Crea un archivo `.env` con tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave
   ```

3. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

## 🛠️ Tecnologías

- **Framework**: Next.js 16 (App Router)
- **Estilos**: Tailwind CSS 4.0
- **Backend**: Supabase
- **Editor**: Tiptap
- **PWA**: Serwist

---

Para más detalles sobre la arquitectura y configuraciones avanzadas, consulta [DOCUMENTATION.md](./DOCUMENTATION.md).

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si tienes ideas para nuevas extensiones de Tiptap o mejoras en la interfaz del Workspace, no dudes en abrir un issue o enviar un pull request.

## 📄 Licencia

Este proyecto es de código abierto. Siéntete libre de usarlo como base para tus propias aplicaciones.
