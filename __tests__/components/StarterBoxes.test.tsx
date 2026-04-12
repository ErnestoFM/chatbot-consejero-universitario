import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import StarterBoxes from "@/components/StarterBoxes";

describe("StarterBoxes", () => {
  it("renders 4 starter topic boxes", () => {
    const mockOnSelect = jest.fn();
    render(<StarterBoxes onSelectTopic={mockOnSelect} />);

    expect(screen.getByText("Trámites Académicos")).toBeInTheDocument();
    expect(screen.getByText("Asesoría Emocional")).toBeInTheDocument();
    expect(screen.getByText("Quejas y Reclamos")).toBeInTheDocument();
    expect(screen.getByText("Orientación Vocacional")).toBeInTheDocument();
  });

  it("calls onSelectTopic with the correct prompt when a box is clicked", () => {
    const mockOnSelect = jest.fn();
    render(<StarterBoxes onSelectTopic={mockOnSelect} />);

    const tramitesBox = screen.getByText("Trámites Académicos").closest("button");
    expect(tramitesBox).not.toBeNull();
    fireEvent.click(tramitesBox!);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(
      "¿Qué trámites académicos puedo realizar y cuáles son los requisitos?"
    );
  });

  it("calls onSelectTopic when Asesoría Emocional is clicked", () => {
    const mockOnSelect = jest.fn();
    render(<StarterBoxes onSelectTopic={mockOnSelect} />);

    const box = screen.getByText("Asesoría Emocional").closest("button");
    fireEvent.click(box!);

    expect(mockOnSelect).toHaveBeenCalledWith(
      "Necesito apoyo emocional y orientación para manejar el estrés universitario"
    );
  });

  it("calls onSelectTopic when Quejas y Reclamos is clicked", () => {
    const mockOnSelect = jest.fn();
    render(<StarterBoxes onSelectTopic={mockOnSelect} />);

    const box = screen.getByText("Quejas y Reclamos").closest("button");
    fireEvent.click(box!);

    expect(mockOnSelect).toHaveBeenCalledWith(
      "Quiero presentar una queja formal sobre una situación en la universidad"
    );
  });

  it("calls onSelectTopic when Orientación Vocacional is clicked", () => {
    const mockOnSelect = jest.fn();
    render(<StarterBoxes onSelectTopic={mockOnSelect} />);

    const box = screen.getByText("Orientación Vocacional").closest("button");
    fireEvent.click(box!);

    expect(mockOnSelect).toHaveBeenCalledWith(
      "Necesito orientación sobre mi carrera universitaria y opciones profesionales"
    );
  });

  it("renders descriptions for each topic", () => {
    const mockOnSelect = jest.fn();
    render(<StarterBoxes onSelectTopic={mockOnSelect} />);

    expect(
      screen.getByText(
        "Consulta sobre inscripciones, bajas, cambios de carrera y más"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Apoyo para el bienestar estudiantil y manejo del estrés"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Presenta una queja sobre un docente, calificación o servicio"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Guía sobre opciones de carrera y oportunidades profesionales"
      )
    ).toBeInTheDocument();
  });
});
