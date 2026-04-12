# API y Endpoints Principales

## 1. `/api/chat`

- **POST**: Envía un mensaje, realiza búsqueda semántica en la base de conocimientos y devuelve la respuesta de la IA. Guarda el historial en MongoDB.
- **GET**: Obtiene el historial de conversaciones o una conversación específica.
- **DELETE**: Elimina una conversación por su ID.

## 2. `/api/ingest-folder`

- **GET**: Procesa todos los PDFs en la carpeta `conocimientos/`, los fragmenta y almacena en la base de datos con sus embeddings.

## 3. `/api/upload`

- **POST**: Permite subir archivos (PDF, imágenes, videos) que pueden ser usados como contexto en la conversación.

## Ejemplo de flujo de una pregunta

1. El usuario envía un mensaje (y opcionalmente archivos) a `/api/chat`.
2. El backend genera el embedding de la pregunta y busca contexto relevante en la colección `conocimientos`.
3. Se genera la respuesta con Gemini y se guarda en la colección `chats`.
