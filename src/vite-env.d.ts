interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly PROD: boolean;
  readonly VITE_ROUTER?: 'memory';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

