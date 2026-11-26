import type {
  HistoricalFormat,
  HistoricalPeriod,
  PreferredLanguage,
  ReadingLevel,
  SummaryFormat,
  SummaryLength,
} from '../types/simplify';

export class TransformApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, status = 500, code = 'REQUEST_FAILED') {
    super(message);
    this.name = 'TransformApiError';
    this.status = status;
    this.code = code;
  }
}

async function postTransform<TBody extends object>(
  endpoint: string,
  body: TBody,
  signal?: AbortSignal
): Promise<string> {
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    throw new TransformApiError(
      'Network error while contacting the Simplify server. Please check your connection and try again.',
      0,
      'NETWORK_ERROR'
    );
  }

  let data: { result?: string; error?: string; code?: string } = {};
  try {
    data = await response.json();
  } catch {
    throw new TransformApiError('Received an unexpected response from the server.', response.status, 'BAD_RESPONSE');
  }

  if (!response.ok || typeof data.result !== 'string') {
    throw new TransformApiError(
      data.error || 'Transformation failed. Please try again.',
      response.status,
      data.code || 'API_ERROR'
    );
  }

  return data.result;
}

export function simplifyTextRequest(
  payload: {
    text: string;
    readingLevel: ReadingLevel;
    preferredLanguage: PreferredLanguage;
  },
  signal?: AbortSignal
): Promise<string> {
  return postTransform('/api/transform/simplify', payload, signal);
}

export function summarizeTextRequest(
  payload: {
    text: string;
    summaryLength: SummaryLength;
    outputFormat: SummaryFormat;
    preferredLanguage: PreferredLanguage;
  },
  signal?: AbortSignal
): Promise<string> {
  return postTransform('/api/transform/summarize', payload, signal);
}

export function historicalTransformRequest(
  payload: {
    text: string;
    period: HistoricalPeriod;
    writingFormat: HistoricalFormat;
    preferredLanguage: PreferredLanguage;
  },
  signal?: AbortSignal
): Promise<string> {
  return postTransform('/api/transform/historical', payload, signal);
}

export async function fetchHealthStatus(): Promise<{ ok: boolean; aiConfigured: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { ok: false, aiConfigured: true };
    const data = await res.json();
    return { ok: Boolean(data.ok), aiConfigured: Boolean(data.aiConfigured) };
  } catch {
    return { ok: false, aiConfigured: true };
  }
}
