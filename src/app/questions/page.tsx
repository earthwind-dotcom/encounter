import type { Metadata } from 'next';
import Link from 'next/link';
import { getLang } from '@/lib/lang';
import { getQuestions } from '@/lib/content';
import { getCurrentUser } from '@/lib/session';
import { completedKeys } from '@/lib/learner';
import { pick, t, type Lang } from '@/lib/i18n';
import { ArrowRight, Check, CheckCircle2, MessageCircle } from 'lucide-react';
import { ConfDots, IconTile, PageHeader } from '@/components/ui';
import { FilterChips } from '@/components/filter-chips';

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

  const read = questions.filter((q) => done.has(`question:${q.slug}`)).length;

  return (
    <div className="shell">
      <PageHeader kicker={t('navQuestions', lang)} title={pick({ en: 'Ask the hard ones.', es: 'Pregunta lo difícil.', pt: 'Pergunte o difícil.' }, lang)} dek={pick(intro, lang)}>
        {user && (
          <p className="sans mt-5 inline-flex items-center gap-2 text-[.86rem] text-[var(--ink-soft)]">
            <CheckCircle2 size={15} className="text-[var(--ok)]" /> {read} / {questions.length} {pick({ en: 'read', es: 'leídas', pt: 'lidas' }, lang)}
          </p>
        )}
      </PageHeader>

      <FilterChips
        allLabel={pick({ en: 'All', es: 'Todas', pt: 'Todas' }, lang)}
        options={themes.map((th) => ({ id: th, label: THEMES[th]?.[lang] ?? th, count: questions.filter((q) => q.theme === th).length }))}
      >
        {themes.map((theme) => (
          <section key={theme} data-group={theme} className="mt-12" aria-labelledby={`theme-${theme}`}>
            <h2 id={`theme-${theme}`} className="kicker kicker-accent mb-4 flex items-center gap-3">
              {THEMES[theme]?.[lang] ?? theme}
              <span className="h-px flex-1 bg-[var(--rule)]" />
            </h2>
            <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2 lg:grid-cols-3">
              {questions
                .filter((q) => q.theme === theme)
                .map((q) => {
                  const isDone = done.has(`question:${q.slug}`);
                  return (
                    <li key={q.slug}>
                      <Link href={`/questions/${q.slug}`} className="glass lift group flex h-full flex-col p-6 text-[var(--ink)]">
                        <span className="flex items-center justify-between gap-3">
                          <span className="mono text-[.72rem] text-[var(--accent)]">{String(q.order).padStart(2, '0')}</span>
                          {isDone && <span className="pill pill-ok"><Check size={12} /> {t('done', lang)}</span>}
                        </span>
                        <span className="mt-2 block text-[1.18rem] font-medium leading-snug">{q.title}</span>
                        <span className="mt-2 line-clamp-3 block flex-1 text-[.93rem] leading-normal text-[var(--ink-soft)]">{q.short}</span>
                        <span className="mt-4 flex items-center justify-between">
                          <ConfDots labels={q.standing.map((s) => s.label)} lang={lang} />
                          <ArrowRight size={16} className="text-[var(--faint)] transition-all group-hover:translate-x-1 group-hover:text-[var(--accent)]" />
                        </span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
      </FilterChips>

      <Link href="/talk" className="glass lift mt-14 flex flex-wrap items-center gap-4 p-6 text-[var(--ink)]">
        <IconTile><MessageCircle size={19} /></IconTile>
        <span className="min-w-0 flex-1">
          <span className="block text-[1.15rem] font-medium">
            {pick({ en: 'Don’t see your question? Ask it.', es: '¿No ves tu pregunta? Hazla.', pt: 'Não vê sua pergunta? Pergunte.' }, lang)}
          </span>
          <span className="sans block text-[.88rem] text-[var(--ink-soft)]">
            {pick({ en: 'A real person reads every one.', es: 'Una persona real lee cada una.', pt: 'Uma pessoa real lê cada uma.' }, lang)}
          </span>
        </span>
        <span className="btn btn-sm">{t('navTalk', lang)} <ArrowRight size={14} /></span>
      </Link>
    </div>
  );
}
