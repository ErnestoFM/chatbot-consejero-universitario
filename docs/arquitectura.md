# Arquitectura General

La aplicación está construida con **Next.js 16** (App Router) y **React 19** para el frontend y backend, usando **MongoDB** como base de datos y la **API de Gemini** para IA.

## Diagrama de módulos principales

- **Frontend (React/Next.js)**
  - Interfaz de chat
  - Sidebar de historial
  - Carga de archivos
- **Backend (API Next.js)**
  - Rutas para chat, carga y consulta
  - Ingesta de PDFs a la base de conocimientos
- **Base de datos (MongoDB)**
  - Colección `chats`: historial de conversaciones
  - Colección `conocimientos`: fragmentos de documentos y embeddings
- **IA (Gemini API)**
  - Generación de respuestas
  - Generación de embeddings para búsqueda semántica

## Flujo de datos

1. El usuario envía un mensaje (y opcionalmente archivos)
2. El backend consulta la base de conocimientos usando búsqueda semántica
3. Se genera una respuesta con contexto relevante usando Gemini
4. Se guarda la conversación en MongoDB
