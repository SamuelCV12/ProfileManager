// lib/i18n/index.ts
//
// Punto de entrada único para todas las traducciones.
// Para añadir una nueva página/sección:
//   1. Crea lib/i18n/locales/{es|en|fr}/miPagina.ts
//   2. Importa aquí y agrégalo al spread de cada idioma.

import { es as esCommon } from "./locales/es/common";
import { en as enCommon } from "./locales/en/common";
import { fr as frCommon } from "./locales/fr/common";

import { esRegister } from "./locales/es/register";
import { enRegister } from "./locales/en/register";
import { frRegister } from "./locales/fr/register";

import { esCompany } from "./locales/es/company";
import { enCompany } from "./locales/en/company";
import { frCompany } from "./locales/fr/company";

import { esDashboard } from "./locales/es/dashboard";
import { enDashboard } from "./locales/en/dashboard";
import { frDashboard } from "./locales/fr/dashboard";

import { esDashboardCompany } from "./locales/es/dashboardCompany";
import { enDashboardCompany } from "./locales/en/dashboardCompany";
import { frDashboardCompany } from "./locales/fr/dashboardCompany";

import { esProfile } from "./locales/es/profile";
import { enProfile } from "./locales/en/profile";
import { frProfile } from "./locales/fr/profile";

import { esAuth } from "./locales/es/auth";
import { enAuth } from "./locales/en/auth";
import { frAuth } from "./locales/fr/auth";

// ─── Idiomas disponibles ────────────────────────────────────────────────────
export const translations = {
  es: {
    ...esCommon,
    ...esRegister,
    ...esCompany,
    ...esDashboard,
    ...esDashboardCompany,
    ...esProfile,
    ...esAuth,
    // próximos namespaces: ...esProfile, ...esForms …
  },
  en: {
    ...enCommon,
    ...enRegister,
    ...enCompany,
    ...enDashboard,
    ...enDashboardCompany,
    ...enProfile,
    ...enAuth,
    // próximos namespaces: ...enProfile, ...enForms …
  },
  fr: {
    ...frCommon,
    ...frRegister,
    ...frCompany,
    ...frDashboard,
    ...frDashboardCompany,
    ...frProfile,
    ...frAuth,
    // próximos namespaces: ...frProfile, ...frForms …
  },
} as const;

// ─── Tipos derivados automáticamente ───────────────────────────────────────
export type Language = keyof typeof translations;
export type Translations = typeof translations[Language];

// ─── Helper: obtener traducciones para un idioma ────────────────────────────
export function getTranslations(lang: Language): Translations {
  return translations[lang];
}

// ─── Idioma por defecto ─────────────────────────────────────────────────────
export const DEFAULT_LANGUAGE: Language = "es";