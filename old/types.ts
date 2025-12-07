
export interface BookMetadata {
  title: string;
  creator: string;
  description: string;
  pubdate: string;
  publisher: string;
  identifier: string;
  language: string;
}

export interface TocItem {
  id: string;
  href: string;
  label: string;
  subitems?: TocItem[];
  parent?: string;
}

// Interface para o livro salvo no IndexedDB
export interface StoredBook {
  id: string; // Usaremos timestamp + random ou titulo sanitizado
  title: string;
  author: string;
  coverBlob: Blob | null; // Capa extraída
  data: ArrayBuffer; // O arquivo .epub completo
  lastRead: number; // Timestamp
  progressCfi: string | null; // Onde parou
  progressPercent: number; // 0 a 100
}

// Simplified typings for epubjs objects as they don't have perfect TS support
export interface Book {
  renderTo: (element: string | HTMLElement, options?: any) => Rendition;
  destroy: () => void;
  loaded: {
    metadata: Promise<BookMetadata>;
    navigation: Promise<{ toc: TocItem[] }>;
  };
  key: () => string;
  spine: {
    get: (target: string | number) => any;
  };
  load: (url: string) => Promise<any>;
  coverUrl: () => Promise<string | null>;
  archive: {
    createUrl: (url: string) => Promise<string>;
    revokeUrl: (url: string) => void;
  };
}

export interface Rendition {
  display: (target?: string) => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  themes: {
    fontSize: (size: string) => void;
    register: (name: string, styles: any) => void;
    select: (name: string) => void;
    default: (styles: any) => void;
  };
  location: {
    start: {
      cfi: string;
      displayed: {
        page: number;
        total: number;
      };
      index: number;
      href: string;
    };
  };
  currentLocation: () => {
    start: { cfi: string; index: number; href: string };
    end: { cfi: string; index: number; href: string };
  };
  on: (event: string, callback: (...args: any[]) => void) => void;
  getRange: (cfi: string) => Range;
  destroy: () => void;
}

export interface Theme {
  name: string;
  label: string;
  bg: string;
  fg: string;
}

export interface AIResponseState {
  loading: boolean;
  content: string | null;
  error: string | null;
}
