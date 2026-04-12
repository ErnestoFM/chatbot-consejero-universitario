import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import connectToDatabase from "@/lib/mongodb";
import ModeloConocimiento from "@/models/Conocimiento";
import { getGeminiClient } from "@/lib/gemini";

// Importación directa a lib para evitar el bug de index.js de pdf-parse
const pdfParse = require("pdf-parse/lib/pdf-parse.js");

// Función para dividir texto gigante en fragmentos más pequeños para un mejor Vector Search
function dividirEnFragmentos(texto: string, tamanoRecomendado: number = 1000): string[] {
  // Quita saltos de línea innecesarios
  const limpio = texto.replace(/\n+/g, "\n");
  const paragraphs = limpio.split(/\n/);
  
  const fragments: string[] = [];
  let chunkActual = "";

  for (const p of paragraphs) {
    // Si el párrafo actual excede el límite y no es el primero
    if (chunkActual.length + p.length > tamanoRecomendado && chunkActual.trim().length > 0) {
      fragments.push(chunkActual.trim());
      chunkActual = "";
    }
    chunkActual += p + " ";
  }

  // Agrega lo que sobre
  if (chunkActual.trim().length > 0) {
    fragments.push(chunkActual.trim());
  }

  return fragments.filter(f => f.trim().length > 50); // descartar fragmentos muy cortos
}

export async function GET() {
  try {
    const folderPath = path.join(process.cwd(), "conocimientos");
    
    if (!fs.existsSync(folderPath)) {
      return NextResponse.json(
        { error: "La carpeta 'conocimientos' no existe en la raíz del proyecto." },
        { status: 404 }
      );
    }

    const archivos = fs.readdirSync(folderPath).filter(file => file.toLowerCase().endsWith(".pdf"));

    if (archivos.length === 0) {
      return NextResponse.json({ message: "No se encontraron archivos PDF en la carpeta 'conocimientos'." });
    }

    await connectToDatabase();
    const genAI = getGeminiClient();
    const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

    let totalFragmentosProcesados = 0;
    const historialProceso = [];

    // Procesar cada PDF
    for (const archivo of archivos) {
      const filePath = path.join(folderPath, archivo);
      let dataBuffer: Buffer;
      try {
        dataBuffer = fs.readFileSync(filePath);
      } catch (errRead) {
        console.error(`No se pudo leer el archivo ${archivo}:`, errRead);
        historialProceso.push(`Archivo no encontrado o ilegible: ${archivo}.`);
        continue; // Saltar a siguiente archivo
      }
      try {
        const pdfDatos = await pdfParse(dataBuffer);
        const textoExtraido = pdfDatos.text;

        // Dividir el PDF largo en bloques (chunks) manejables
        const fragmentos = dividirEnFragmentos(textoExtraido, 1000);

        let generadosPDF = 0;

        for (const fragmento of fragmentos) {
          // Evitamos límite de tokens saltando textos que ya estén repetidos en Mongo si gustas, pero aquí insertaremos de una.
          const embeddingResponse = await embeddingModel.embedContent(fragmento);
          const embedding = embeddingResponse.embedding.values;

          await ModeloConocimiento.create({
            texto: fragmento,
            embedding,
            // Podrías añadir un campo archivoFuente al esquema de mongoose después si lo deseas:
            // fuente: archivo 
          });

          generadosPDF++;
          totalFragmentosProcesados++;
        }

        historialProceso.push(`Procesado ${archivo}: ${generadosPDF} fragmentos generados.`);
      } catch (errPdf) {
        console.error(`Error procesando archivo ${archivo}:`, errPdf);
        historialProceso.push(`Error en archivo ${archivo}.`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Procesamiento completado. Se generaron ${totalFragmentosProcesados} fragmentos a partir de ${archivos.length} archivos PDF.`,
      detalles: historialProceso
    });

  } catch (error) {
    console.error("Error al procesar la carpeta:", error);
    return NextResponse.json(
      { error: "Error interno procesando los archivos." },
      { status: 500 }
    );
  }
}
