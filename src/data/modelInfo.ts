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

  "salvador-del-mundo": {
    title: "Salvador del Mundo",
    subtitle: "San Salvador, El Salvador",
    paragraphs: [
      "El Monumento al Divino Salvador del Mundo representa a Cristo de pie sobre un globo terráqueo. Es el símbolo más reconocible de la capital y del país entero, al que da nombre: El Salvador.",
      "Se ubica en la Plaza Salvador del Mundo, sobre el Paseo General Escalón, y fue erigido en homenaje al patrono nacional. La escultura corona una alta columna que lo hace visible desde gran parte de San Salvador.",
      "Cada agosto, durante las Fiestas Agostinas, el monumento es el corazón de las celebraciones patronales en honor al Salvador del Mundo."
    ],
    footer: "📍 Plaza Salvador del Mundo · San Salvador"
  },

  "trompeta-de-barro": {
    title: "Trompeta de Barro",
    subtitle: "Instrumento ritual precolombino",
    paragraphs: [
      "Las trompetas de barro son instrumentos de viento fabricados en cerámica por las culturas prehispánicas de Mesoamérica. Se han hallado piezas de este tipo en sitios arqueológicos del actual El Salvador.",
      "Su sonido grave y penetrante acompañaba ceremonias religiosas, rituales y celebraciones comunitarias. No eran solo instrumentos musicales: se les atribuía la capacidad de comunicar con lo sagrado y convocar a la comunidad.",
      "Elaboradas a mano y a menudo decoradas con motivos simbólicos, reflejan el dominio de la alfarería y la vida sonora de los pueblos originarios."
    ],
    footer: "🎺 Alfarería precolombina · Mesoamérica"
  },
};
