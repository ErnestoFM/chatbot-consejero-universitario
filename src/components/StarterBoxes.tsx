"use client";

import React from "react";
import { StarterTopic } from "@/types";

const starterTopics: StarterTopic[] = [
  {
    id: "1",
    title: "Trámites Académicos",
    description: "Consulta sobre inscripciones, bajas, cambios de carrera y más",
    prompt:
      "¿Qué trámites académicos puedo realizar y cuáles son los requisitos?",
    icon: "📋",
  },
  {
    id: "2",
    title: "Asesoría Emocional",
    description: "Apoyo para el bienestar estudiantil y manejo del estrés",
    prompt:
      "Necesito apoyo emocional y orientación para manejar el estrés universitario",
    icon: "💙",
  },
  {
    id: "3",
    title: "Quejas y Reclamos",
    description: "Presenta una queja sobre un docente, calificación o servicio",
    prompt:
      "Quiero presentar una queja formal sobre una situación en la universidad",
    icon: "📣",
  },
  {
    id: "4",
    title: "Orientación Vocacional",
    description: "Guía sobre opciones de carrera y oportunidades profesionales",
    prompt:
      "Necesito orientación sobre mi carrera universitaria y opciones profesionales",
    icon: "🎓",
  },
];

interface StarterBoxesProps {
  onSelectTopic: (prompt: string) => void;
}

export default function StarterBoxes({ onSelectTopic }: StarterBoxesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mx-auto">
      {starterTopics.map((topic) => (
        <button
          key={topic.id}
          onClick={() => onSelectTopic(topic.prompt)}
          className="flex flex-col items-start gap-1 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 text-left group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{topic.icon}</span>
            <span className="font-semibold text-white text-sm">
              {topic.title}
            </span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            {topic.description}
          </p>
        </button>
      ))}
    </div>
  );
}
