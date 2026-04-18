export {};

declare global {
  interface Window {
    __TWEAK_DEFAULTS: {
      accent: string;
      density: 'compact' | 'comfortable' | 'spacious';
      heroVariant: 'classic' | 'strip' | 'focus';
      mobile: boolean;
    };
  }
}
