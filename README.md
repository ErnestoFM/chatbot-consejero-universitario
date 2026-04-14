# Chatbot Consejero Universitario

Un chatbot inteligente para orientación universitaria, conectado con la API de Gemini y con una interfaz similar a ChatGPT.

## 🚀 Características

- **Interfaz similar a ChatGPT**: Diseño moderno y familiar para los usuarios
- **4 temas de conversación iniciales**: Trámites Académicos, Asesoría Emocional, Quejas y Reclamos, Orientación Vocacional
- **Carga de archivos**: Soporte para imágenes, videos y documentos PDF como evidencia
- **Historial de conversaciones**: Guardado en MongoDB con sidebar de navegación
- **Autenticación de usuarios**: Registro/Login con sesión en cookie HTTP-only
- **Logout y expiración de sesión**: Cierre manual y redirección automática al login cuando la sesión vence
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
   JWT_SECRET=una_clave_larga_y_segura
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

| Variable         | Descripción                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| `GEMINI_API_KEY` | API Key de Google Gemini                                                                       |
| `MONGODB_URI`    | URI de conexión a MongoDB                                                                      |
| `GEMINI_MODEL`   | Modelo de Gemini a usar (default: `gemini-1.5-flash`). Usa este para mejor cuota en free tier. |
| `JWT_SECRET`     | Clave para firmar el token de sesión                                                           |

## 🔐 Flujo de autenticación

- El registro crea el usuario y abre sesión automáticamente.
- El login usa cookie HTTP-only con JWT.
- Si la sesión expira, la app muestra "Sesión expirada, inicia sesión de nuevo" y vuelve al formulario.
- El botón "Cerrar sesión" borra la cookie y regresa al login.

## ⚠️ Límites de API de Gemini (Free Tier)

Por defecto, el proyecto usa **`gemini-1.5-flash`** que tiene mejor cuota en free tier que `gemini-2.0-flash`:

- ~15,000 requests/día
- ~1 millón de tokens/minuto

Si ves error **"Cuota de Gemini excedida"**:

1. Espera unos minutos y reintentar (el rate limit se reinicia cada minuto).
2. Crea un plan pagado en [Google AI Studio](https://makersuite.google.com/app/apikeys).
3. O usa otro modelo ajustando `GEMINI_MODEL` en `.env.local`.

Para cambiar de modelo:

```env
GEMINI_MODEL=gemini-1.5-pro  # Mejor calidad, más tokens
# O tu modelo preferido que tenga disponibilidad
```
