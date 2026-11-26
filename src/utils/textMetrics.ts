export const MAX_TEXT_LENGTH = 20000;
export const MIN_TEXT_LENGTH = 10;
export const MAX_FILE_SIZE_BYTES = 250 * 1024; // 250 KB

export interface TextValidationResult {
  valid: boolean;
  error?: string;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function countCharacters(text: string): number {
  return text.length;
}

export function estimateReadingTimeMinutes(wordCount: number): number {
  if (wordCount <= 0) return 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function calculateLengthDeltaLabel(originalWords: number, transformedWords: number): string | null {
  if (originalWords <= 0 || transformedWords <= 0) return null;
  const diff = originalWords - transformedWords;
  const pct = Math.round((Math.abs(diff) / originalWords) * 100);
  if (pct < 3) return 'Similar length';
  if (diff > 0) return `${pct}% shorter`;
  return `${pct}% longer`;
}

export function validateInputText(text: string): TextValidationResult {
  if (typeof text !== 'string') {
    return { valid: false, error: 'Please enter or paste text to transform.' };
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Please enter or paste some text first before transforming.' };
  }
  if (trimmed.length < MIN_TEXT_LENGTH) {
    return {
      valid: false,
      error: `Please provide at least ${MIN_TEXT_LENGTH} characters of text so Simplify has enough context.`,
    };
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return {
      valid: false,
      error: `Text exceeds the ${MAX_TEXT_LENGTH.toLocaleString()} character limit. Please shorten your text by ${(text.length - MAX_TEXT_LENGTH).toLocaleString()} characters.`,
    };
  }
  return { valid: true };
}

export function validateUploadedFile(file: { name: string; size: number; type?: string }): TextValidationResult {
  const lower = file.name.toLowerCase();
  const isAllowedExtension = lower.endsWith('.txt') || lower.endsWith('.md') || lower.endsWith('.csv');
  const isTextMime = !file.type || file.type.startsWith('text/');

  if (!isAllowedExtension && !isTextMime) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload a plain text (.txt) or Markdown (.md) file.',
    };
  }
  if (file.size === 0) {
    return { valid: false, error: 'The selected file is empty.' };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'File is too large. Please upload a text file under 250 KB.',
    };
  }
  return { valid: true };
}

export const SAMPLE_TEXTS = {
  science:
    'Quantum entanglement is a physical phenomenon that occurs when a group of particles are generated, interact, or share spatial proximity in a way such that the quantum state of each particle of the group cannot be described independently of the state of the others, including when the particles are separated by a large distance. Measurements of physical properties such as position, momentum, spin, and polarization performed on entangled particles can, in some cases, be found to be perfectly correlated.',
  policy:
    'Municipal transit authorities across several metropolitan regions announced on Tuesday a coordinated five-year capital modernization plan totaling $1.4 billion. The initiative prioritizes high-frequency electric bus corridors, upgraded signaling infrastructure along commuter rail lines, and real-time passenger arrival displays at 320 stations. Officials project the improvements will reduce average peak-hour commute delays by 18 percent while cutting fleet carbon emissions by 42,000 metric tons annually.',
  technology:
    'Researchers at the materials engineering consortium unveiled a solid-state battery architecture using a ceramic electrolyte that suppresses dendrite formation during rapid charging cycles. Laboratory prototypes maintained 94 percent of their initial storage capacity after 1,500 full charge-discharge cycles at ambient room temperature, suggesting potential viability for long-range electric vehicles and grid-scale renewable energy storage later this decade.',
};
