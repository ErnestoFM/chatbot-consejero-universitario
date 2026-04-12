# Funcionamiento de los Módulos Principales

## 1. Frontend (React/Next.js)

- **ChatInterface.tsx**: Componente principal del chat.
- **ChatInput.tsx**: Entrada de texto y carga de archivos.
- **MessageList.tsx**: Lista de mensajes.
- **Sidebar.tsx**: Historial de conversaciones.
- **StarterBoxes.tsx**: Temas iniciales sugeridos.

## 2. Backend/API (Next.js)

- **/api/chat/route.ts**: Lógica principal del chat, búsqueda semántica y guardado de mensajes.
- **/api/ingest-folder/route.ts**: Procesa PDFs y los ingesta en la base de conocimientos.
- **/api/upload/route.ts**: Maneja la carga de archivos.

## 3. Librerías y Modelos

- **lib/gemini.ts**: Integración con la API de Gemini (generación de respuestas y embeddings).
- **lib/mongodb.ts**: Conexión y gestión de la base de datos MongoDB.
- **models/Chat.ts**: Modelo de conversación (historial, mensajes, adjuntos).
- **models/Conocimiento.ts**: Modelo de fragmentos de conocimiento y embeddings.

## 4. Testing

- ****tests**/**: Pruebas unitarias y de integración con Jest y React Testing Library.
