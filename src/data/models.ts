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

const MODELS: Model3DDetail[] = [
  {
    id: "piramide",
    name: "Pirámide de San Andrés",
    description:
      "Centro ceremonial maya del período Clásico Tardío, ubicado en el valle de Zapotitán.",
    file: "/3d_models/torre_xd.glb",
    category: "arqueología",
    thumbnail: null,
  },
];

export function getModels(): Model3D[] {
  return MODELS.map(({ file: _, ...rest }) => rest);
}

export function getModelDetail(id: string): Model3DDetail | undefined {
  return MODELS.find((m) => m.id === id);
}
