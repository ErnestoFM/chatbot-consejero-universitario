---
name: code-review-checklist
description: Checklist rápida para revisión de código en proyectos Next.js/TypeScript.
usage: workspace
---

# Checklist de Revisión de Código para Next.js/TypeScript

Utiliza esta skill antes de aprobar un PR o finalizar una tarea de desarrollo. Marca cada punto:

## Checklist General

- [ ] El código compila y pasa todos los tests.
- [ ] No hay errores ni warnings de ESLint.
- [ ] Las funciones y componentes tienen nombres descriptivos.
- [ ] No hay código comentado innecesario ni archivos sin usar.
- [ ] Se usan tipados TypeScript adecuados (evitar `any`).
- [ ] Los imports están ordenados y no hay duplicados.
- [ ] Las dependencias nuevas están justificadas y documentadas.
- [ ] El código es fácil de leer y sigue las convenciones del proyecto.
- [ ] Los endpoints de API validan correctamente los datos de entrada.
- [ ] No se exponen datos sensibles en logs ni respuestas.
- [ ] Los cambios están documentados en el README o en comentarios relevantes.

## Checklist de UI/UX (si aplica)

- [ ] La interfaz es responsiva y accesible.
- [ ] No hay errores visibles en consola del navegador.
- [ ] Los textos y mensajes son claros y están en el idioma correcto.

---

## Ejemplo de uso

- "Revisa este PR usando la skill de checklist de revisión de código."
- "¿Qué puntos del checklist faltan en este commit?"

## Sugerencias relacionadas

- Crear skill de buenas prácticas para endpoints API.
- Skill para automatización de pruebas con Jest.
