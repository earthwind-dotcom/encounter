import type { Metadata } from 'next';
import Link from 'next/link';
import { getLang } from '@/lib/lang';
import { getQuestions } from '@/lib/content';
import { getCurrentUser } from '@/lib/session';
import { completedKeys } from '@/lib/learner';
import { pick, t, type Lang } from '@/lib/i18n';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: pick({ en: 'Hard Questions', es: 'Preguntas difíciles', pt: 'Perguntas difíceis' }, lang),
    description: pick({ en: 'Honest, research-grounded answers to the questions that stop people from taking Jesus seriously.', es: 'Respuestas honestas y basadas en investigación a las preguntas que impiden tomar en serio a Jesús.', pt: 'Respostas honestas e baseadas em pesquisa às perguntas que impedem as pessoas de levar Jesus a sério.' }, lang),
  };
}

const THEMES: Record<string, Record<Lang, string>> = {
  history: { en: 'History', es: 'Historia', pt: 'História' },
  'the-bible': { en: 'The Bible', es: 'La Biblia', pt: 'A Bíblia' },
  'god-and-evil': { en: 'God and suffering', es: 'Dios y el sufrimiento', pt: 'Deus e o sofrimento' },
  belief: { en: 'Believing', es: 'Creer', pt: 'Crer' },
  church: { en: 'The church', es: 'La iglesia', pt: 'A igreja' },
};

const intro = {
  en: 'The questions people actually ask, answered straight. We don’t defend the Bible by quoting the Bible at you. We show you the evidence, tell you how sure scholars are, name the real debates, and let you weigh it.',
  es: 'Las preguntas que la gente de verdad hace, respondidas sin rodeos. No defendemos la Biblia citándote la Biblia. Te mostramos la evidencia, te decimos qué tan seguros están los especialistas, nombramos los debates reales y te dejamos sopesarlo.',
  pt: 'As perguntas que as pessoas realmente fazem, respondidas sem rodeios. Não defendemos a Bíblia citando a Bíblia para você. Mostramos a evidência, dizemos o quão seguros os estudiosos estão, nomeamos os debates reais e deixamos você pesar.',
};

export default async function QuestionsPage() {
  const lang = await getLang();
  const questions = getQuestions(lang);
  const user = await getCurrentUser();
  const done = user ? await completedKeys(user.id) : new Set<string>();
  const themes = [...new Set(questions.map((q) => q.theme))];

  return (
    <div className="shell pt-12">
      <p className="kicker kicker-accent">{t('navQuestions', lang)}</p>
      <h1 className="mt-3 text-[clamp(2.1rem,1.4rem+2.6vw,3.2rem)] font-medium leading-tight">
        {pick({ en: 'Ask the hard ones.', es: 'Pregunta lo difícil.', pt: 'Pergunte o difícil.' }, lang)}
      </h1>
      <p className="mt-4 max-w-[62ch] text-[1.1rem] text-[var(--ink-soft)]">{pick(intro, lang)}</p>

      {themes.map((theme) => (
        <section key={theme} className="mt-12" aria-labelledby={`theme-${theme}`}>
          <h2 id={`theme-${theme}`} className="kicker border-b border-[var(--rule)] pb-3">
            {THEMES[theme]?.[lang] ?? theme}
          </h2>
          <ul className="grid gap-x-12 md:grid-cols-2">
            {questions
              .filter((q) => q.theme === theme)
              .map((q) => (
                <li key={q.slug} className="border-b border-[var(--rule)]">
                  <Link href={`/questions/${q.slug}`} className="group block py-5 text-[var(--ink)]">
                    <span className="flex items-start justify-between gap-4">
                      <span className="text-[1.2rem] leading-snug group-hover:text-[var(--accent)]">{q.title}</span>
                      {done.has(`question:${q.slug}`) && <span className="kicker text-[var(--ok)]" aria-label={t('done', lang)}>✓</span>}
                    </span>
                    <span className="mt-1 line-clamp-3 block text-[.95rem] text-[var(--ink-soft)]">{q.short}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}

      <p className="mt-12 max-w-[62ch] text-[.98rem] italic text-[var(--faint)]">
        {pick(
          {
            en: 'Don’t see your question? Ask it. A real person reads every one.',
            es: '¿No ves tu pregunta? Hazla. Una persona real lee cada una.',
            pt: 'Não vê sua pergunta? Pergunte. Uma pessoa real lê cada uma.',
          },
          lang,
        )}{' '}
        <Link href="/talk">{t('navTalk', lang)} →</Link>
      </p>
    </div>
  );
}
