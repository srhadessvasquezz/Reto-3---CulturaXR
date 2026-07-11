import { useState, useEffect } from 'react';

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

export function useModels() {
  const [models, setModels] = useState<Model3D[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/models')
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar modelos');
        return res.json();
      })
      .then(data => {
        setModels(data);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { models, loading, error };
}

export function useModelDetail(id: string | null) {
  const [model, setModel] = useState<Model3DDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setModel(null);
      return;
    }

    setLoading(true);
    fetch(`/api/models/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Modelo no encontrado');
        return res.json();
      })
      .then(data => {
        setModel(data);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { model, loading, error };
}
