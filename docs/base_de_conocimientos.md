# Base de Conocimientos y Búsqueda Semántica

## ¿Cómo se cargan los conocimientos?

1. Coloca archivos PDF en la carpeta `conocimientos/`.
2. Llama a la API `/api/ingest-folder` para procesar los PDFs.
3. Cada PDF se divide en fragmentos (~1000 caracteres).
4. Se genera un embedding (vector numérico) para cada fragmento usando Gemini.
5. Se almacena cada fragmento y su embedding en la colección `conocimientos` de MongoDB.

## Ejemplo de documento en MongoDB

```json
{
  "texto": "Fragmento del PDF...",
  "embedding": [0.123, -0.456, ...],
  "createdAt": "...",
  "updatedAt": "..."
}
```

## Búsqueda semántica

- Cuando el usuario pregunta, se genera un embedding de la pregunta.
- Se usa `$vectorSearch` en MongoDB para encontrar los fragmentos más relevantes (índice `vector_index`).
- Los textos encontrados se usan como contexto para la respuesta de la IA.

## Índices de MongoDB

- **vector_index**: Permite búsquedas por similitud semántica entre embeddings.
- Índices automáticos en `_id`, `createdAt`, `updatedAt` para optimizar consultas.
