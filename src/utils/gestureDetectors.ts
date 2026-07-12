import type { GestureCommand } from '../types';

// Landmarks de MediaPipe Hands (índices): 0 = muñeca, 9 = base del dedo medio
// (centro aproximado de la palma). Puntas: 4 pulgar, 8 índice, 12 medio,
// 16 anular, 20 meñique. MCP (nudillos): 2 pulgar, 5 índice, 9 medio,
// 13 anular, 17 meñique.
type Landmark = { x: number; y: number; z: number };

const FINGERTIPS = [4, 8, 12, 16, 20];
const PALM_CENTER = 9;
const WRIST = 0;

// Cada dedo (sin pulgar) es una cadena MCP→PIP→DIP→TIP. Para saber si está
// extendido basta comparar la punta (TIP) y el nudillo medio (PIP) contra la
// muñeca: extendido = punta más lejos de la muñeca que el PIP.
const FINGERS: { tip: number; pip: number }[] = [
  { tip: 8, pip: 6 },   // índice
  { tip: 12, pip: 10 }, // medio
  { tip: 16, pip: 14 }, // anular
  { tip: 20, pip: 18 }, // meñique
];

const OPEN_PALM_THRESHOLD = 0.08;

// Suavizado temporal: moda de los últimos N conteos, por mano (handKey).
const SMOOTHING_WINDOW = 5;
const fingerBuffers: Record<string, number[]> = {};

export type Handedness = 'Left' | 'Right';

function dist2D(a: Landmark, b: Landmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Palma abierta: las 5 puntas están lejos del centro de la palma (landmark 9).
export function isOpenPalm(landmarks: Landmark[]): boolean {
  if (!landmarks || landmarks.length < 21) return false;
  const center = landmarks[PALM_CENTER];
  return FINGERTIPS.every((tip) => dist2D(landmarks[tip], center) > OPEN_PALM_THRESHOLD);
}

// Dedo (índice/medio/anular/meñique) extendido: la punta está más lejos de la
// muñeca que el nudillo medio. Si está doblado, la punta se acerca a la muñeca.
function isFingerExtended(
  landmarks: Landmark[],
  tipIdx: number,
  pipIdx: number,
  wristIdx: number,
): boolean {
  return dist2D(landmarks[tipIdx], landmarks[wristIdx]) > dist2D(landmarks[pipIdx], landmarks[wristIdx]);
}

// El pulgar se dobla lateralmente, no hacia la palma: se compara el eje X.
// El sentido depende de la lateralidad (label de MediaPipe). Sin lateralidad,
// heurística: la punta (4) claramente más lejos del nudillo base (2) que el
// nudillo medio (3).
function isThumbExtended(landmarks: Landmark[], handedness?: Handedness): boolean {
  if (handedness === 'Right') return landmarks[4].x < landmarks[3].x;
  if (handedness === 'Left') return landmarks[4].x > landmarks[3].x;
  return dist2D(landmarks[4], landmarks[2]) > dist2D(landmarks[3], landmarks[2]) * 1.2;
}

// Moda del buffer; ante empate, gana el valor más reciente entre los empatados.
function mode(buffer: number[]): number {
  const freq = new Map<number, number>();
  for (const v of buffer) freq.set(v, (freq.get(v) ?? 0) + 1);
  let maxFreq = 0;
  for (const c of freq.values()) if (c > maxFreq) maxFreq = c;
  let best = buffer[buffer.length - 1];
  for (let i = 0; i < buffer.length; i++) {
    if (freq.get(buffer[i]) === maxFreq) best = buffer[i]; // el último con maxFreq gana
  }
  return best;
}

// Empuja rawCount al buffer de handKey y devuelve la moda de la ventana.
// Mientras el buffer no está lleno, devuelve el conteo crudo del frame.
function smooth(handKey: string, rawCount: number): number {
  let buf = fingerBuffers[handKey];
  if (!buf) {
    buf = [];
    fingerBuffers[handKey] = buf;
  }
  buf.push(rawCount);
  if (buf.length > SMOOTHING_WINDOW) buf.shift();
  if (buf.length < SMOOTHING_WINDOW) return rawCount;
  return mode(buf);
}

// Cuenta dedos extendidos (0-5) con suavizado temporal. handedness afina el
// pulgar; handKey selecciona el buffer de suavizado ('hand1'/'hand2'/etc.).
export function countExtendedFingers(
  landmarks: Landmark[],
  handedness?: Handedness,
  handKey: string = 'default',
): number {
  if (!landmarks || landmarks.length < 21) return 0;
  let raw = 0;
  for (const f of FINGERS) {
    if (isFingerExtended(landmarks, f.tip, f.pip, WRIST)) raw++;
  }
  if (isThumbExtended(landmarks, handedness)) raw++;
  return smooth(handKey, raw);
}

// Clasifica el comando del frame a partir de los landmarks de ambas manos.
// previousCommand implementa el anti-chattering del freeze: si estábamos en
// TOGGLE_FREEZE y ahora no hay gesto claro, se sostiene TOGGLE_FREEZE.
export function classifyGesture(
  hand1Landmarks: Landmark[] | null,
  hand2Landmarks: Landmark[] | null,
  previousCommand: GestureCommand,
  hand1Handedness?: Handedness,
  hand2Handedness?: Handedness,
): GestureCommand {
  const hand1Present = !!hand1Landmarks;
  const hand2Present = !!hand2Landmarks;

  // Sin manos: nada que clasificar.
  if (!hand1Present && !hand2Present) return 'NONE';

  const hand1Open = hand1Present && isOpenPalm(hand1Landmarks!);
  const hand2Open = hand2Present && isOpenPalm(hand2Landmarks!);

  // Ambas palmas abiertas → toggle de congelamiento.
  if (hand1Present && hand2Present && hand1Open && hand2Open) {
    return 'TOGGLE_FREEZE';
  }

  // Una sola palma abierta: esperamos a la otra, no disparamos nada.
  if (hand1Open || hand2Open) {
    return sticky('NONE', previousCommand);
  }

  // Comandos de una mano por conteo de dedos. Se prioriza la mano 1;
  // si no está, se usa la mano 2.
  const activeHand = hand1Present ? hand1Landmarks! : hand2Landmarks;
  const activeHandedness = hand1Present ? hand1Handedness : hand2Handedness;
  if (activeHand) {
    // Buffer 'classify' separado del de display ('hand1'/'hand2') para que
    // ningún buffer reciba dos muestras en el mismo frame.
    const fingers = countExtendedFingers(activeHand, activeHandedness, 'classify');
    switch (fingers) {
      case 1: return sticky('SHOW_INFO', previousCommand);
      case 2: return sticky('NEXT_MODEL', previousCommand);
      case 3: return sticky('PREVIOUS_MODEL', previousCommand);
      case 4: return sticky('TAKE_PHOTO', previousCommand);
      default: return sticky('NONE', previousCommand);
    }
  }

  return sticky('NONE', previousCommand);
}

// Si veníamos de TOGGLE_FREEZE y el frame actual no lo reafirma, mantenemos
// TOGGLE_FREEZE para que no parpadee mientras oscila la detección.
function sticky(current: GestureCommand, previous: GestureCommand): GestureCommand {
  if (previous === 'TOGGLE_FREEZE' && current === 'NONE') return 'TOGGLE_FREEZE';
  return current;
}
