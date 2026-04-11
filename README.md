# Chatbot Consejero Universitario

Un chatbot inteligente para orientación universitaria, conectado con la API de Gemini y con una interfaz similar a ChatGPT.

## 🚀 Características

- **Interfaz similar a ChatGPT**: Diseño moderno y familiar para los usuarios
- **4 temas de conversación iniciales**: Trámites Académicos, Asesoría Emocional, Quejas y Reclamos, Orientación Vocacional
- **Carga de archivos**: Soporte para imágenes, videos y documentos PDF como evidencia
- **Historial de conversaciones**: Guardado en MongoDB con sidebar de navegación
- **IA con Gemini**: Integración con la API de Gemini de Google
- **Soporte para PDFs**: Arquitectura preparada para RAG (Retrieval-Augmented Generation)

## 🛠️ Tecnologías

- **Frontend/Backend**: Next.js 16 con App Router y React 19
- **Estilos**: Tailwind CSS
- **Base de datos**: MongoDB con Mongoose
- **IA**: Google Gemini API (`gemini-1.5-flash`)
- **Testing**: Jest + React Testing Library (metodología TDD)

## 📋 Requisitos previos

- Node.js 18+
- MongoDB (local o Atlas)
- API Key de Gemini (obtener en [Google AI Studio](https://makersuite.google.com/app/apikey))

## ⚙️ Configuración

1. **Instala dependencias**:
   ```bash
   npm install
   ```

2. **Configura las variables de entorno**:
   Copia `.env.local.example` a `.env.local` y rellena los valores:
   ```bash
   cp .env.local.example .env.local
   ```

   ```env
   GEMINI_API_KEY=tu_api_key_de_gemini
   MONGODB_URI=mongodb://localhost:27017/chatbot-consejero
   ```

3. **Ejecuta el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🧪 Tests

El proyecto sigue la metodología **TDD**. Todos los tests están en la carpeta `__tests__/`.

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con cobertura
npm run test:coverage
```

### Estructura de tests:

```
__tests__/
├── components/
│   ├── StarterBoxes.test.tsx    # Tests de los 4 recuadros de temas
│   ├── ChatInput.test.tsx       # Tests del área de entrada
│   ├── MessageList.test.tsx     # Tests de la lista de mensajes
│   └── Sidebar.test.tsx         # Tests del sidebar
├── api/
│   └── chat.test.ts             # Tests de las rutas API
└── lib/
    └── gemini.test.ts           # Tests del servicio de Gemini
```

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts        # API de chat (GET, POST, DELETE)
│   │   └── upload/route.ts      # API de carga de archivos
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ChatInterface.tsx        # Componente principal del chat
│   ├── ChatInput.tsx            # Área de entrada con carga de archivos
│   ├── MessageList.tsx          # Lista de mensajes
│   ├── Sidebar.tsx              # Historial de conversaciones
│   └── StarterBoxes.tsx         # 4 recuadros de temas iniciales
├── lib/
│   ├── mongodb.ts               # Conexión a MongoDB
│   └── gemini.ts                # Servicio de Gemini API
├── models/
│   └── Chat.ts                  # Modelo de MongoDB para chats
└── types/
    └── index.ts                 # Tipos TypeScript
```

## 📄 Integración de PDFs (RAG)

El servicio de Gemini (`src/lib/gemini.ts`) incluye un sistema de contexto de documentos preparado para RAG:

```typescript
import { setDocumentContext } from "@/lib/gemini";

// Cuando el usuario proporcione PDFs, establece el contexto:
setDocumentContext("Contenido extraído del PDF...");
```

## 🔒 Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `GEMINI_API_KEY` | API Key de Google Gemini |
| `MONGODB_URI` | URI de conexión a MongoDB |
