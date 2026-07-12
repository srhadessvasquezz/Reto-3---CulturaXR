export interface Model3D {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string | null;
}

export interface Model3DDetail extends Model3D {
  file: string;
}

// Los .glb viven en public/3d_models. En GitHub Pages el sitio se sirve bajo
// un subpath (/Reto-3---CulturaXR/), así que una ruta absoluta "/3d_models/..."
// apunta al dominio raíz y da 404. Prefijar con BASE_URL (que Vite resuelve
// según la config `base`) hace que la ruta funcione tanto en local como en Pages.
const asset = (path: string): string => `${import.meta.env.BASE_URL}${path}`;

const MODELS: Model3DDetail[] = [
  {
    id: "piramide",
    name: "Pirámide de San Andrés",
    description:
      "Centro ceremonial maya del período Clásico Tardío, ubicado en el valle de Zapotitán.",
    file: asset("3d_models/torre_xd.glb"),
    category: "arqueología",
    thumbnail: null,
  },
  {
    id: "salvador-del-mundo",
    name: "Salvador del Mundo",
    description:
      "Monumento al Divino Salvador del Mundo: la figura de Cristo sobre el globo terráqueo, ícono nacional de El Salvador.",
    // Los espacios del nombre van URL-encoded (%20) para que el loader los sirva.
    file: asset("3d_models/Salvador%20del%20mundo.glb"),
    category: "monumento",
    thumbnail: null,
  },
  {
    id: "trompeta-de-barro",
    name: "Trompeta de Barro",
    description:
      "Instrumento de viento de cerámica usado en ceremonias por las culturas precolombinas del actual El Salvador.",
    file: asset("3d_models/trompeta%20de%20barro.glb"),
    category: "instrumento",
    thumbnail: null,
  },
];

export function getModels(): Model3D[] {
  return MODELS.map(({ file: _, ...rest }) => rest);
}

export function getModelDetail(id: string): Model3DDetail | undefined {
  return MODELS.find((m) => m.id === id);
}
