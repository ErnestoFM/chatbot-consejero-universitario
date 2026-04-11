import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface IMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments: IAttachment[];
  createdAt: Date;
}

export interface IChat extends Document {
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number, required: true },
});

const MessageSchema = new Schema<IMessage>({
  id: { type: String, required: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  attachments: { type: [AttachmentSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const ChatSchema = new Schema<IChat>(
  {
    title: { type: String, required: true, default: "Nueva conversación" },
    messages: { type: [MessageSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

const ChatModel: Model<IChat> =
  mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);

export default ChatModel;
