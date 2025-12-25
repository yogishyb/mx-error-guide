/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Unlock all Pro and Enterprise features when set to 'true' */
  readonly VITE_UNLOCK_ALL_FEATURES: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
