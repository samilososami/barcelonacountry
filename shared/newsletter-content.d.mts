export type MediaKind = 'image' | 'video' | 'audio' | 'file';
export type ContentBlock =
  | { type: 'media'; kind: MediaKind; label: string; url: string; source: string }
  | { type: 'heading' | 'paragraph'; text: string; source: string }
  | { type: 'list'; items: string[]; source: string };
export const MEDIA_BUCKET: string;
export const CONTENT_LIMIT: number;
export const MEDIA_TYPES: Record<string, [MediaKind, string]>;
export const MEDIA_ACCEPT: string;
export function safeMediaUrl(value: string): string | null;
export function mediaMarkup(kind: MediaKind, label: string, url: string): string;
export function parseContent(content: string): ContentBlock[];
export function insertMedia(content: string, position: number, markup: string): { content: string; cursor: number };
export function validateMediaFile(file: File): Promise<{ kind: MediaKind; extension: string }>;
export function contentEmailHtml(content: string): string;
export function contentPlainText(content: string): string;
