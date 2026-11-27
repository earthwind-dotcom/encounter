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
import { JoinPanel, LockMark } from '@/components/member-gate';
import { PhotoFrame } from '@/components/photo';
import { PHOTOS } from '@/lib/photos';

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

      <PhotoFrame photo={PHOTOS.questionsPage} className="rise rise-2 mt-10 mb-2 h-[180px] !rounded-[28px] sm:h-[240px]" sizes="(min-width: 1280px) 1200px, 100vw">
        <p className="absolute bottom-5 left-6 z-[2] m-0 max-w-[34ch] text-[clamp(1.1rem,.9rem+.8vw,1.5rem)] italic leading-snug text-white [text-shadow:0_2px_14px_rgb(0_0_0/.5)] sm:left-8">
          {pick({ en: 'Doubt was never a disqualifier. Bring all of it.', es: 'La duda nunca descalificó a nadie. Trae todo.', pt: 'A dúvida nunca desqualificou ninguém. Traga tudo.' }, lang)}
        </p>
      </PhotoFrame>

      {!user && (
        <JoinPanel
          lang={lang}
          next="/questions"
          className="mb-4 mt-6"
          title={pick({ en: 'Read the short answers here. The full ones are free with an account.', es: 'Lee aquí las respuestas cortas. Las completas son gratis con una cuenta.', pt: 'Leia aqui as respostas curtas. As completas são grátis com uma conta.' }, lang)}
          body={pick({ en: 'Each full answer shows the evidence, labels how sure scholars are, and names the real debates.', es: 'Cada respuesta completa muestra la evidencia, indica qué tan seguros están los especialistas y nombra los debates reales.', pt: 'Cada resposta completa mostra a evidência, indica o quanto os especialistas estão seguros e nomeia os debates reais.' }, lang)}
        />
      )}

      <FilterChips
        allLabel={pick({ en: 'All', es: 'Todas', pt: 'Todas' }, lang)}
        options={themes.map((th) => ({ id: th, label: THEMES[th]?.[lang] ?? th, count: questions.filter((q) => q.theme === th).length }))}
      >
        {themes.map((theme) => (
          <section key={theme} data-group={theme} className="mt-10 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10" aria-labelledby={`theme-${theme}`}>
            <div className="lg:sticky lg:top-28 lg:self-start lg:pt-6">
              <h2 id={`theme-${theme}`} className="text-[1.5rem] font-medium leading-tight tracking-[-.01em]">{THEMES[theme]?.[lang] ?? theme}</h2>
              <p className="sans mt-1 text-[.82rem] text-[var(--faint)]">
                {questions.filter((q) => q.theme === theme).length} {pick({ en: 'questions', es: 'preguntas', pt: 'perguntas' }, lang)}
              </p>
            </div>
            <ul className="glass m-0 list-none divide-y divide-[var(--rule)] overflow-hidden !rounded-[24px] p-0">
              {questions
                .filter((q) => q.theme === theme)
                .map((q) => {
                  const isDone = done.has(`question:${q.slug}`);
                  return (
                    <li key={q.slug}>
                      <Link href={`/questions/${q.slug}`} className="group grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[2.4rem_minmax(0,1fr)_auto] gap-x-4 gap-y-2 p-5 text-[var(--ink)] transition-colors hover:bg-[var(--glass-inner-hover)] sm:p-6">
                        <span className="mono hidden pt-1.5 text-[.76rem] text-[var(--accent)] sm:block">{String(q.order).padStart(2, '0')}</span>
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="text-[1.22rem] font-medium leading-snug group-hover:text-[var(--accent)]">{q.title}</span>
                            {isDone && <span className="pill pill-ok"><Check size={12} /> {t('done', lang)}</span>}
                          </span>
                          <span className="mt-1.5 max-w-[68ch] text-[.95rem] leading-normal text-[var(--ink-soft)]">{q.short}</span>
                          <span className="mt-3 flex items-center gap-2.5">
                            <ConfDots labels={q.standing.map((s) => s.label)} lang={lang} />
                            <span className="sans text-[.7rem] text-[var(--faint)]">{q.standing.length} {pick({ en: 'labelled claims', es: 'afirmaciones con etiqueta', pt: 'afirmações com rótulo' }, lang)}</span>
                          </span>
                        </span>
                        <span className="mt-1.5 flex items-center gap-2">
                          {!user && <LockMark label={pick({ en: 'Full answer with a free account', es: 'Respuesta completa con cuenta gratis', pt: 'Resposta completa com conta grátis' }, lang)} />}
                          <ArrowRight size={18} className="text-[var(--faint)] transition-all group-hover:translate-x-1 group-hover:text-[var(--accent)]" />
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
