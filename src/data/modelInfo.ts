export interface ModelInfo {
  title: string;
  subtitle: string;
  paragraphs: string[];
  footer: string;
}

// Contenido del panel "Ver información" de la experiencia inmersiva,
// indexado por el mismo modelId que usan los botones [data-model-id]
// de la landing y el registro de src/data/models.ts.
export const MODEL_INFO: Record<string, ModelInfo> = {
  piramide: {
    title: "Pirámide de San Andrés",
    subtitle: "Departamento de La Libertad, El Salvador",
    paragraphs: [
      "Centro ceremonial maya del período Clásico Tardío (600–900 d.C.). Fue una de las capitales políticas más importantes del valle de Zapotitán y llegó a albergar cerca de 12,000 habitantes.",
      "Su estructura principal, conocida como La Campana, se eleva sobre una acrópolis de siete metros. Desde su cima, los gobernantes mayas dirigían ceremonias religiosas y decisiones políticas que influenciaban toda la región.",
      "El sitio fue abandonado tras la erupción del volcán El Playón en el siglo XVII, que lo cubrió de ceniza y lo preservó hasta su redescubrimiento en 1977."
    ],
    footer: "📍 Abierto al público · Parque Arqueológico San Andrés"
  },
};
