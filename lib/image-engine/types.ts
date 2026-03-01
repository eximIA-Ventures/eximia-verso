export type ImageProvider =
  | "unsplash"
  | "pexels"
  | "pixabay"
  | "together"
  | "openai";

export interface ImageResult {
  id: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  alt: string;
  provider: ImageProvider;
  photographer?: string;
  photographerUrl?: string;
  license: string;
  score?: number;
}

export interface SearchOptions {
  query: string;
  perPage?: number;
  page?: number;
  orientation?: "landscape" | "portrait" | "squarish";
  providers?: ImageProvider[];
}

export interface GenerateOptions {
  prompt: string;
  width?: number;
  height?: number;
  provider?: "together" | "openai";
}

export interface DownloadOptions {
  imageUrl: string;
  provider: ImageProvider;
  fileName?: string;
}

export interface DownloadResult {
  publicUrl: string;
  fileName: string;
  bucket: string;
}

export interface ProviderAdapter {
  name: ImageProvider;
  search(options: SearchOptions): Promise<ImageResult[]>;
  isConfigured(): boolean;
}

export interface GeneratorAdapter {
  name: ImageProvider;
  generate(options: GenerateOptions): Promise<ImageResult[]>;
  isConfigured(): boolean;
}
