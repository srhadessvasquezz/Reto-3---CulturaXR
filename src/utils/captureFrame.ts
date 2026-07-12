// Colores del sistema de diseño vigente (no modificar).
const ANIL = '#1a3a52'; // texto de la marca de agua
const ARENA = '#f5ede0'; // fondo de la marca de agua

const WATERMARK_TEXT = 'CULTURAXR';
const WATERMARK_PADDING = 6; // px, fijo según especificación
const WATERMARK_ALPHA = 0.75; // opacidad del rectángulo de fondo

// Compone en un PNG el frame actual de la webcam + el canvas 3D encima +
// una marca de agua "CULTURAXR" en la esquina inferior derecha, y retorna
// el resultado como data URL.
//
// Es async porque asegura que la tipografía Poppins esté cargada antes de
// dibujar el texto; de lo contrario el canvas caería a sans-serif.
export async function captureFrame(
  videoEl: HTMLVideoElement,
  threeCanvas: HTMLCanvasElement,
): Promise<string> {
  const width = videoEl.videoWidth;
  const height = videoEl.videoHeight;

  // Guard: sin dimensiones de video válidas no hay frame que capturar.
  if (!width || !height) return '';

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Fondo: frame del video espejado horizontalmente para coincidir con
  //    el preview en pantalla (que se muestra con transform: scaleX(-1)).
  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(videoEl, 0, 0, width, height);
  ctx.restore();

  // 2. Canvas 3D encima, a tamaño completo. No se espeja: en pantalla el
  //    modelo AR se muestra sin invertir.
  ctx.drawImage(threeCanvas, 0, 0, width, height);

  // 3. Marca de agua. Tamaño proporcional al ancho (~18px @ 720px de ancho).
  const fontSize = Math.max(12, Math.round(width * 0.025));
  const fontSpec = `600 ${fontSize}px Poppins`;

  // Garantizar Poppins cargada antes de medir/dibujar el texto.
  try {
    await document.fonts.load(fontSpec);
  } catch {
    // Fallback silencioso: se usará sans-serif del fontSpec de abajo.
  }

  ctx.font = `${fontSpec}, sans-serif`;
  ctx.textBaseline = 'top';

  const textWidth = ctx.measureText(WATERMARK_TEXT).width;
  const boxWidth = textWidth + WATERMARK_PADDING * 2;
  const boxHeight = fontSize + WATERMARK_PADDING * 2;
  const boxX = width - boxWidth - WATERMARK_PADDING;
  const boxY = height - boxHeight - WATERMARK_PADDING;

  // Rectángulo de fondo Arena semitransparente.
  ctx.globalAlpha = WATERMARK_ALPHA;
  ctx.fillStyle = ARENA;
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

  // Texto Añil, opaco.
  ctx.globalAlpha = 1;
  ctx.fillStyle = ANIL;
  ctx.fillText(WATERMARK_TEXT, boxX + WATERMARK_PADDING, boxY + WATERMARK_PADDING);

  return canvas.toDataURL('image/png');
}
