import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const MODEL_NAME = 'gemini-4-hydrogen';
const MAX_RETRIES = 2;

export class ApiServiceError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = 'AI_ERROR') {
    super(message);
    this.name = 'ApiServiceError';
    this.status = status;
    this.code = code;
  }
}

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim().length > 0 && key.trim() !== 'MY_GEMINI_API_KEY');
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new ApiServiceError(
      'Gemini API key is not configured. Add GEMINI_API_KEY in the Settings > Secrets panel (or your server environment) to enable AI text transformations.',
      503,
      'API_KEY_MISSING'
    );
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapGeminiError(err: unknown): ApiServiceError {
  if (err instanceof ApiServiceError) {
    return err;
  }

  const rawMessage = err instanceof Error ? err.message : String(err);
  const statusMatch = rawMessage.match(/\b(400|401|403|404|429|500|503|504)\b/);
  const numericStatus =
    typeof (err as { status?: unknown })?.status === 'number'
      ? (err as { status: number }).status
      : statusMatch
        ? Number(statusMatch[1])
        : 500;

  if (
    numericStatus === 401 ||
    numericStatus === 403 ||
    rawMessage.includes('API_KEY_INVALID') ||
    rawMessage.includes('PERMISSION_DENIED')
  ) {
    return new ApiServiceError(
      'The configured Gemini API key was rejected or lacks permission. Please verify GEMINI_API_KEY in Settings > Secrets.',
      403,
      'API_KEY_INVALID'
    );
  }

  if (numericStatus === 429 || rawMessage.includes('RESOURCE_EXHAUSTED')) {
    return new ApiServiceError(
      'The AI service is currently rate-limited. Please wait a moment and try again.',
      429,
      'RATE_LIMITED'
    );
  }

  if (numericStatus === 404 || rawMessage.includes('NOT_FOUND')) {
    return new ApiServiceError(
      'The configured AI model could not be found. Please check model availability and try again.',
      502,
      'MODEL_NOT_FOUND'
    );
  }

  return new ApiServiceError(
    'Unable to complete the text transformation right now. Please try again in a moment.',
    numericStatus >= 400 && numericStatus < 600 ? numericStatus : 502,
    'AI_UPSTREAM_ERROR'
  );
}

export async function generateTransformation(params: {
  systemInstruction: string;
  userPrompt: string;
}): Promise<string> {
  const ai = getClient();

  let lastError: unknown = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: params.userPrompt,
        config: {
          systemInstruction: params.systemInstruction,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });

      const output = response.text?.trim();
      if (!output) {
        throw new ApiServiceError(
          'The AI returned an empty response for this text. Please adjust your input and try again.',
          502,
          'EMPTY_OUTPUT'
        );
      }

      return output;
    } catch (err) {
      lastError = err;
      const mapped = mapGeminiError(err);
      const isRetryable = mapped.status === 429 || mapped.status >= 500;
      if (!isRetryable || attempt === MAX_RETRIES) {
        throw mapped;
      }
      await sleep(350 * Math.pow(2, attempt));
    }
  }

  throw mapGeminiError(lastError);
}
