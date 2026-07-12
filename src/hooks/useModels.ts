import { useState, useEffect } from 'react';
import { getModels, getModelDetail } from '../data/models';
import type { Model3D, Model3DDetail } from '../data/models';

export type { Model3D, Model3DDetail };

export function useModels() {
  const [models, setModels] = useState<Model3D[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      try {
        setModels(getModels());
      } catch {
        setError('Error al cargar modelos');
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
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
    setError(null);
    const timer = setTimeout(() => {
      try {
        const detail = getModelDetail(id);
        if (detail) {
          setModel(detail);
        } else {
          setError('Modelo no encontrado');
        }
      } catch {
        setError('Error al cargar el modelo');
      } finally {
        setLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [id]);

  return { model, loading, error };
}
