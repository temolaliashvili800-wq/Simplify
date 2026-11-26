export const MAX_SERVER_TEXT_LENGTH = 20000;
export const MIN_SERVER_TEXT_LENGTH = 10;

export const READING_LEVELS = ['very-simple', 'standard', 'advanced'] as const;
export type ServerReadingLevel = (typeof READING_LEVELS)[number];

export const SUMMARY_LENGTHS = ['short', 'medium', 'detailed'] as const;
export type ServerSummaryLength = (typeof SUMMARY_LENGTHS)[number];

export const SUMMARY_FORMATS = ['paragraphs', 'bullets', 'takeaways', 'step-by-step'] as const;
export type ServerSummaryFormat = (typeof SUMMARY_FORMATS)[number];

export const HISTORICAL_PERIODS = [
  '1920s',
  '1930s',
  '1940s',
  '1950s',
  '1960s',
  '1970s',
  '1980s',
  '1990s',
  '2000s',
] as const;
export type ServerHistoricalPeriod = (typeof HISTORICAL_PERIODS)[number];

export const HISTORICAL_FORMATS = ['newspaper', 'news-report', 'editorial', 'magazine'] as const;
export type ServerHistoricalFormat = (typeof HISTORICAL_FORMATS)[number];

export const PREFERRED_LANGUAGES = [
  'preserve',
  'English',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Italian',
  'Japanese',
] as const;
export type ServerPreferredLanguage = (typeof PREFERRED_LANGUAGES)[number];

export interface ValidationFailure {
  ok: false;
  status: number;
  error: string;
}

export interface ValidationSuccess<T> {
  ok: true;
  data: T;
}

export type ValidationResult<T> = ValidationFailure | ValidationSuccess<T>;

function validateBaseText(rawText: unknown): ValidationResult<string> {
  if (typeof rawText !== 'string') {
    return { ok: false, status: 400, error: 'Text input must be a string.' };
  }
  const trimmed = rawText.trim();
  if (trimmed.length === 0) {
    return { ok: false, status: 400, error: 'Please provide text to transform.' };
  }
  if (trimmed.length < MIN_SERVER_TEXT_LENGTH) {
    return {
      ok: false,
      status: 400,
      error: `Text must be at least ${MIN_SERVER_TEXT_LENGTH} characters long.`,
    };
  }
  if (rawText.length > MAX_SERVER_TEXT_LENGTH) {
    return {
      ok: false,
      status: 400,
      error: `Text exceeds the maximum length of ${MAX_SERVER_TEXT_LENGTH.toLocaleString()} characters.`,
    };
  }
  return { ok: true, data: trimmed };
}

function normalizeLanguage(rawLang: unknown): ServerPreferredLanguage {
  if (typeof rawLang === 'string' && (PREFERRED_LANGUAGES as readonly string[]).includes(rawLang)) {
    return rawLang as ServerPreferredLanguage;
  }
  return 'preserve';
}

export function validateSimplifyPayload(body: unknown): ValidationResult<{
  text: string;
  readingLevel: ServerReadingLevel;
  preferredLanguage: ServerPreferredLanguage;
}> {
  if (!body || typeof body !== 'object') {
    return { ok: false, status: 400, error: 'Invalid request body.' };
  }
  const record = body as Record<string, unknown>;
  const textCheck = validateBaseText(record.text);
  if (!textCheck.ok) return textCheck;

  const level = record.readingLevel;
  if (typeof level !== 'string' || !(READING_LEVELS as readonly string[]).includes(level)) {
    return {
      ok: false,
      status: 400,
      error: 'Invalid reading level. Choose very-simple, standard, or advanced.',
    };
  }

  return {
    ok: true,
    data: {
      text: textCheck.data,
      readingLevel: level as ServerReadingLevel,
      preferredLanguage: normalizeLanguage(record.preferredLanguage),
    },
  };
}

export function validateSummarizePayload(body: unknown): ValidationResult<{
  text: string;
  summaryLength: ServerSummaryLength;
  outputFormat: ServerSummaryFormat;
  preferredLanguage: ServerPreferredLanguage;
}> {
  if (!body || typeof body !== 'object') {
    return { ok: false, status: 400, error: 'Invalid request body.' };
  }
  const record = body as Record<string, unknown>;
  const textCheck = validateBaseText(record.text);
  if (!textCheck.ok) return textCheck;

  const summaryLength = record.summaryLength;
  if (typeof summaryLength !== 'string' || !(SUMMARY_LENGTHS as readonly string[]).includes(summaryLength)) {
    return {
      ok: false,
      status: 400,
      error: 'Invalid summary length. Choose short, medium, or detailed.',
    };
  }

  const outputFormat = record.outputFormat;
  if (typeof outputFormat !== 'string' || !(SUMMARY_FORMATS as readonly string[]).includes(outputFormat)) {
    return {
      ok: false,
      status: 400,
      error: 'Invalid output format. Choose paragraphs, bullets, takeaways, or step-by-step.',
    };
  }

  return {
    ok: true,
    data: {
      text: textCheck.data,
      summaryLength: summaryLength as ServerSummaryLength,
      outputFormat: outputFormat as ServerSummaryFormat,
      preferredLanguage: normalizeLanguage(record.preferredLanguage),
    },
  };
}

export function validateHistoricalPayload(body: unknown): ValidationResult<{
  text: string;
  period: ServerHistoricalPeriod;
  writingFormat: ServerHistoricalFormat;
  preferredLanguage: ServerPreferredLanguage;
}> {
  if (!body || typeof body !== 'object') {
    return { ok: false, status: 400, error: 'Invalid request body.' };
  }
  const record = body as Record<string, unknown>;
  const textCheck = validateBaseText(record.text);
  if (!textCheck.ok) return textCheck;

  const period = record.period;
  if (typeof period !== 'string' || !(HISTORICAL_PERIODS as readonly string[]).includes(period)) {
    return {
      ok: false,
      status: 400,
      error: 'Invalid historical period. Choose a decade from 1920s to 2000s.',
    };
  }

  const writingFormat = record.writingFormat;
  if (typeof writingFormat !== 'string' || !(HISTORICAL_FORMATS as readonly string[]).includes(writingFormat)) {
    return {
      ok: false,
      status: 400,
      error: 'Invalid writing format. Choose newspaper, news-report, editorial, or magazine.',
    };
  }

  return {
    ok: true,
    data: {
      text: textCheck.data,
      period: period as ServerHistoricalPeriod,
      writingFormat: writingFormat as ServerHistoricalFormat,
      preferredLanguage: normalizeLanguage(record.preferredLanguage),
    },
  };
}

function buildLanguageInstruction(preferredLanguage: ServerPreferredLanguage): string {
  if (preferredLanguage === 'preserve') {
    return 'Preserve the exact language of the original text.';
  }
  return `Write the transformed output in ${preferredLanguage}.`;
}

export function buildSimplificationPrompt(params: {
  text: string;
  readingLevel: ServerReadingLevel;
  preferredLanguage: ServerPreferredLanguage;
}): { systemInstruction: string; userPrompt: string } {
  const baseSystem =
    'You are Simplify, an expert text simplification assistant. Your task is to transform difficult texts into clear, accessible, and understandable language while preserving all essential information. Never invent facts, change dates, alter numbers, or distort the original meaning. Adapt vocabulary, sentence structure, and explanations to the selected reading level.';

  const levelGuidance: Record<ServerReadingLevel, string> = {
    'very-simple':
      'Selected Reading Level: Very Simple. Use basic everyday vocabulary and short, clear sentences. Briefly explain difficult concepts in plain words so a beginner can understand effortlessly.',
    standard:
      'Selected Reading Level: Standard. Use clear, natural, everyday language. Preserve important details and reduce unnecessary complexity while keeping a good balance between simplicity and detail.',
    advanced:
      'Selected Reading Level: Advanced. Retain appropriate technical terminology and academic precision, while improving sentence clarity, structure, and flow without oversimplifying the ideas.',
  };

  const systemInstruction = [
    baseSystem,
    levelGuidance[params.readingLevel],
    buildLanguageInstruction(params.preferredLanguage),
    'Output only the transformed text itself without meta commentary, markdown code fences, or preambles.',
  ].join('\n\n');

  return {
    systemInstruction,
    userPrompt: `Simplify the following text:\n\n${params.text}`,
  };
}

export function buildSummarizationPrompt(params: {
  text: string;
  summaryLength: ServerSummaryLength;
  outputFormat: ServerSummaryFormat;
  preferredLanguage: ServerPreferredLanguage;
}): { systemInstruction: string; userPrompt: string } {
  const baseSystem =
    "You are Simplify, an expert summarization assistant. Identify the central ideas, essential facts, important details, and key arguments in the supplied text. Remove unnecessary repetition without changing the author's meaning. Follow the user's selected summary length and output format. Never add unsupported facts.";

  const lengthGuidance: Record<ServerSummaryLength, string> = {
    short:
      'Selected Summary Length: Short Summary. Include only the essential core message and critical facts in a very concise form suitable for quick reading.',
    medium:
      'Selected Summary Length: Medium Summary. Capture the main arguments, key evidence, and important details at a balanced, readable length.',
    detailed:
      'Selected Summary Length: Detailed Summary. Provide a thorough, well-structured explanation covering central arguments, supporting context, dates, names, statistics, and relevant facts.',
  };

  const formatGuidance: Record<ServerSummaryFormat, string> = {
    paragraphs: 'Selected Output Format: Normal paragraphs. Write cohesive, well-structured prose paragraphs without bullet lists.',
    bullets: 'Selected Output Format: Bullet points. Present the summary as clear, concise bullet points using "- " prefixes.',
    takeaways: 'Selected Output Format: Key takeaways. Begin with a brief 1-2 sentence overview followed by numbered or bulleted key takeaways.',
    'step-by-step': 'Selected Output Format: Step-by-step explanation. Organize the summary as a logical sequence of numbered steps (1., 2., 3., ...).',
  };

  const systemInstruction = [
    baseSystem,
    lengthGuidance[params.summaryLength],
    formatGuidance[params.outputFormat],
    buildLanguageInstruction(params.preferredLanguage),
    'Output only the summary itself without meta commentary or markdown code fences.',
  ].join('\n\n');

  return {
    systemInstruction,
    userPrompt: `Summarize the following text:\n\n${params.text}`,
  };
}

export function buildHistoricalPrompt(params: {
  text: string;
  period: ServerHistoricalPeriod;
  writingFormat: ServerHistoricalFormat;
  preferredLanguage: ServerPreferredLanguage;
}): { systemInstruction: string; userPrompt: string } {
  const baseSystem =
    "You are Simplify, an expert historical writing-style transformation assistant. Rewrite the supplied information using the journalistic tone, vocabulary, sentence structures, and editorial conventions inspired by the user's selected historical period. Preserve the original facts and meaning. Do not falsely present modern events as historical events. Do not invent sources, citations, journalists, dates, or quotations.";

  const periodGuidance: Record<ServerHistoricalPeriod, string> = {
    '1920s': 'Era Style: 1920s. Crisp, formal early-modern print cadence, dignified diction, and brisk telegraph-influenced headline energy.',
    '1930s': 'Era Style: 1930s. Earnest, civic-minded interwar prose with measured cadence, clear declarative reporting, and steady narrative authority.',
    '1940s': 'Era Style: 1940s. Tight, urgent wire-service clarity with crisp active verbs and brisk, sober mid-century dispatch phrasing.',
    '1950s': 'Era Style: 1950s. Polished post-war broadsheet prose—optimistic, orderly, authoritative, and impeccably structured.',
    '1960s': 'Era Style: 1960s. Vivid, culturally observant print journalism blending crisp reporting with sharper literary momentum.',
    '1970s': 'Era Style: 1970s. Analytical, investigative long-form cadence with grounded realism and deliberate contextual framing.',
    '1980s': 'Era Style: 1980s. Punchy, high-clarity modern print journalism balancing brisk leads with sharp technical or economic explanation.',
    '1990s': 'Era Style: 1990s. Conversational yet authoritative late-century feature journalism bridging print depth with emerging digital fluency.',
    '2000s': 'Era Style: 2000s. Direct, scannable early-21st-century online journalism with tight ledes and crisp explanatory pacing.',
  };

  const formatGuidance: Record<ServerHistoricalFormat, string> = {
    newspaper: 'Writing Format: Newspaper Article. Open with a period-appropriate headline and lead paragraph using the inverted-pyramid structure.',
    'news-report': 'Writing Format: News Report. Present the facts in an objective, structured journalistic dispatch.',
    editorial: 'Writing Format: Editorial. Frame the supplied facts in a thoughtful, measured opinion-column voice faithful to the era while keeping all facts accurate.',
    magazine: 'Writing Format: Magazine Article. Use an engaging feature-story opening and rich narrative flow typical of magazines from that decade.',
  };

  const systemInstruction = [
    baseSystem,
    periodGuidance[params.period],
    formatGuidance[params.writingFormat],
    'CRITICAL INTEGRITY RULE: Preserve all facts, names, dates, numbers, and modern context accurately. Never claim a modern event happened in the chosen historical decade, and never fabricate newspaper names, bylines, datelines, quotes, or citations.',
    buildLanguageInstruction(params.preferredLanguage),
    'Output only the rewritten piece without meta commentary or markdown code fences.',
  ].join('\n\n');

  return {
    systemInstruction,
    userPrompt: `Rewrite the following text in the requested historical style:\n\n${params.text}`,
  };
}
