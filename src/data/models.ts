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
    id: "torre-maya",
    name: "Torre Maya de San Andrés",
    description:
      "Torre ceremonial maya del período clásico tardío, ubicada en el sitio arqueológico San Andrés, en el valle de Zapotitán. Representa la avanzada arquitectura y cosmovisión de la civilización maya en El Salvador.",
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
