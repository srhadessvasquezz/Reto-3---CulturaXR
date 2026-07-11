import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;
const MODELS_JSON = join(__dirname, 'models.json');

const app = express();

app.use(cors());
app.use(express.json());

let modelsRegistry = [];

function loadModels() {
  try {
    const raw = readFileSync(MODELS_JSON, 'utf-8');
    modelsRegistry = JSON.parse(raw);
    console.log(`[server] ${modelsRegistry.length} modelos cargados desde models.json`);
  } catch (err) {
    console.error('[server] Error cargando models.json:', err.message);
    modelsRegistry = [];
  }
}

loadModels();

app.get('/api/models', (_req, res) => {
  const list = modelsRegistry.map(({ id, name, description, category, thumbnail }) => ({
    id, name, description, category,
    thumbnail: thumbnail || null,
  }));
  res.json(list);
});

app.get('/api/models/:id', (req, res) => {
  const model = modelsRegistry.find(m => m.id === req.params.id);
  if (!model) return res.status(404).json({ error: 'Modelo no encontrado' });
  res.json(model);
});

app.use('/3d_models', express.static(join(__dirname, '..', 'public', '3d_models')));

app.listen(PORT, () => {
  console.log(`[server] CulturaXR API corriendo en http://localhost:${PORT}`);
});
