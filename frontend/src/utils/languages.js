// Idiomas como datos, no como código (ARQUITECTURA.md §9).
// Cambiar de par idioma es cambiar estas constantes, no reescribir pantallas.
export const SOURCE_LANG = 'en';
export const TARGET_LANG = 'es';

export const LANGUAGE_LABELS = {
  en: 'Inglés',
  es: 'Español',
};

export function languageLabel(code) {
  return LANGUAGE_LABELS[code] || code;
}
