import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConocimiento extends Document {
  texto: string;
  embedding: number[];
}

const ConocimientoSchema: Schema<IConocimiento> = new Schema(
  {
    texto: { 
      type: String, 
      required: true 
    },
    embedding: { 
      type: [Number], 
      required: true 
    },
  },
  {
    timestamps: true,
    collection: "conocimientos" 
  }
);

const ModeloConocimiento: Model<IConocimiento> = 
  mongoose.models.Conocimiento || mongoose.model<IConocimiento>("Conocimiento", ConocimientoSchema);

export default ModeloConocimiento;
