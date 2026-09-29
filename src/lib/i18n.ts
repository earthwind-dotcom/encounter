export const LANGS = ['en', 'es', 'pt'] as const;
export type Lang = (typeof LANGS)[number];
export const LANG_COOKIE = 'enc_lang';
export const isLang = (v: unknown): v is Lang => typeof v === 'string' && (LANGS as readonly string[]).includes(v);

/** Pick from a localized record, falling back to English. */
export const pick = (rec: Partial<Record<Lang, string>> | undefined, lang: Lang) => rec?.[lang] ?? rec?.en ?? '';

/**
 * Interface strings. Section and brand names (Encounter, Reflections, Roots, Provenance) stay
 * in English in every language, as they did on Marginalia. Portuguese has not been reviewed
 * by a native speaker; the About page says so.
 */
const dict = {
  tagline: {
    en: 'Meet Jesus again, for the first time.',
    es: 'Conoce a Jesús otra vez, por primera vez.',
    pt: 'Conheça Jesus de novo, pela primeira vez.',
  },
  navQuestions: { en: 'Hard Questions', es: 'Preguntas difíciles', pt: 'Perguntas difíceis' },
  navCourse: { en: 'The Course', es: 'El curso', pt: 'O curso' },
  navLibrary: { en: 'Library', es: 'Biblioteca', pt: 'Biblioteca' },
  navAbout: { en: 'About', es: 'Acerca de', pt: 'Sobre' },
  navTalk: { en: 'Talk to someone', es: 'Habla con alguien', pt: 'Fale com alguém' },
  signIn: { en: 'Sign in', es: 'Entrar', pt: 'Entrar' },
  signUp: { en: 'Create account', es: 'Crear cuenta', pt: 'Criar conta' },
  signOut: { en: 'Sign out', es: 'Salir', pt: 'Sair' },
  account: { en: 'Your path', es: 'Tu camino', pt: 'Seu caminho' },
  theme: { en: 'Theme', es: 'Tema', pt: 'Tema' },
  search: { en: 'Search', es: 'Buscar', pt: 'Buscar' },
  notTranslated: {
    en: '',
    es: 'Esta pieza aún no está traducida. El texto que sigue está en inglés.',
    pt: 'Esta peça ainda não foi traduzida. O texto a seguir está em inglês.',
  },
  markDone: { en: 'Mark as done', es: 'Marcar como hecho', pt: 'Marcar como feito' },
  done: { en: 'Done', es: 'Hecho', pt: 'Feito' },
  signInToTrack: {
    en: 'Sign in to keep your place and your notes.',
    es: 'Entra para guardar tu avance y tus notas.',
    pt: 'Entre para guardar seu progresso e suas notas.',
  },
  yourNotes: { en: 'Your notes', es: 'Tus notas', pt: 'Suas notas' },
  notesHint: {
    en: 'Private. Only you can see these.',
    es: 'Privadas. Solo tú puedes verlas.',
    pt: 'Privadas. Só você pode vê-las.',
  },
  save: { en: 'Save', es: 'Guardar', pt: 'Salvar' },
  saved: { en: 'Saved', es: 'Guardado', pt: 'Salvo' },
  shortAnswer: { en: 'The short answer', es: 'La respuesta corta', pt: 'A resposta curta' },
  standing: { en: 'Where the evidence stands', es: 'Dónde está la evidencia', pt: 'Onde está a evidência' },
  furtherReading: { en: 'Further reading', es: 'Para leer más', pt: 'Para ler mais' },
  related: { en: 'Keep going', es: 'Sigue', pt: 'Continue' },
  desk: { en: 'Facilitator desk', es: 'Mesa de facilitadores', pt: 'Mesa dos facilitadores' },
  session: { en: 'Session', es: 'Sesión', pt: 'Sessão' },
  footerNote: {
    en: 'Honest about the evidence. Clear about the invitation. Free to say no.',
    es: 'Honestos con la evidencia. Claros con la invitación. Libres para decir que no.',
    pt: 'Honestos com a evidência. Claros com o convite. Livres para dizer não.',
  },
} satisfies Record<string, Record<Lang, string>>;

export type Key = keyof typeof dict;
export const t = (key: Key, lang: Lang) => dict[key][lang] || dict[key].en;

/** The five confidence labels, and only five. Defined in About → How the work is done. */
export const CONFIDENCE = {
  consensus: { en: 'Consensus', es: 'Consenso', pt: 'Consenso' },
  'strong majority': { en: 'Strong majority', es: 'Mayoría amplia', pt: 'Maioria ampla' },
  debated: { en: 'Debated', es: 'En debate', pt: 'Em debate' },
  'our read': { en: 'Our read', es: 'Nuestra lectura', pt: 'Nossa leitura' },
  rejected: { en: 'Rejected', es: 'Rechazado', pt: 'Rejeitado' },
} as const;
export type Confidence = keyof typeof CONFIDENCE;
export const isConfidence = (v: string): v is Confidence => v in CONFIDENCE;
