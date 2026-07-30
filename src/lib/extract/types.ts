/** Resultado de extracción de concepto desde documento o texto. */
export type ExtractedConcept = {
  clientName: string;
  clientEmail: string;
  clientNif: string;
  expediente: string;
  concepto: string;
  baseAmount: number;
  ivaRate?: number;
  suplidos: number;
  notes: string;
  /** 0–1 estimado */
  confidence: number;
  /** Cómo se obtuvo */
  method: "heuristic" | "ai" | "csv" | "mixed" | "harvey";
  warnings: string[];
  /** Fragmento de texto usado (truncado) */
  preview?: string;
};

export type ExtractRequest = {
  /** Texto pegado o contenido de archivo ya leído como texto */
  text?: string;
  /** Archivo en base64 (sin data: prefix) */
  fileBase64?: string;
  fileName?: string;
  mimeType?: string;
};

export type ExtractProviderStatus = {
  /** Provider that will be used for enhancement */
  activeProvider: "harvey" | "xai" | "openai" | "none";
  harveyConfigured: boolean;
  harveyMasked: string | null;
  fallbackConfigured: boolean;
  fallbackProvider: "xai" | "openai" | "none";
  model: string;
  formats: string[];
};
