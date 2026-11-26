import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  buildHistoricalPrompt,
  buildSimplificationPrompt,
  buildSummarizationPrompt,
  validateHistoricalPayload,
  validateSimplifyPayload,
  validateSummarizePayload,
} from './server/prompts.ts';
import { ApiServiceError, generateTransformation, isGeminiConfigured } from './server/geminiClient.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

async function createServer() {
  const app = express();

  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      aiConfigured: isGeminiConfigured(),
    });
  });

  app.post('/api/transform/simplify', async (req: Request, res: Response) => {
    const validation = validateSimplifyPayload(req.body);
    if (!validation.ok) {
      res.status(validation.status).json({ error: validation.error, code: 'VALIDATION_ERROR' });
      return;
    }

    try {
      const prompt = buildSimplificationPrompt(validation.data);
      const result = await generateTransformation(prompt);
      res.json({ result });
    } catch (err) {
      const apiErr = err instanceof ApiServiceError ? err : new ApiServiceError('Failed to simplify text.', 500);
      res.status(apiErr.status).json({ error: apiErr.message, code: apiErr.code });
    }
  });

  app.post('/api/transform/summarize', async (req: Request, res: Response) => {
    const validation = validateSummarizePayload(req.body);
    if (!validation.ok) {
      res.status(validation.status).json({ error: validation.error, code: 'VALIDATION_ERROR' });
      return;
    }

    try {
      const prompt = buildSummarizationPrompt(validation.data);
      const result = await generateTransformation(prompt);
      res.json({ result });
    } catch (err) {
      const apiErr = err instanceof ApiServiceError ? err : new ApiServiceError('Failed to summarize text.', 500);
      res.status(apiErr.status).json({ error: apiErr.message, code: apiErr.code });
    }
  });

  app.post('/api/transform/historical', async (req: Request, res: Response) => {
    const validation = validateHistoricalPayload(req.body);
    if (!validation.ok) {
      res.status(validation.status).json({ error: validation.error, code: 'VALIDATION_ERROR' });
      return;
    }

    try {
      const prompt = buildHistoricalPrompt(validation.data);
      const result = await generateTransformation(prompt);
      res.json({ result });
    } catch (err) {
      const apiErr = err instanceof ApiServiceError ? err : new ApiServiceError('Failed to transform text.', 500);
      res.status(apiErr.status).json({ error: apiErr.message, code: apiErr.code });
    }
  });

  // Handle malformed JSON bodies cleanly
  app.use((err: unknown, _req: Request, res: Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({ error: 'Invalid JSON request body.', code: 'BAD_JSON' });
      return;
    }
    next(err);
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Simplify server running at http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start Simplify server:', err);
  process.exit(1);
});
