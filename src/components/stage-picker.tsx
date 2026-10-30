'use client';

import { useState, useTransition } from 'react';
import { setStage } from '@/app/actions';
import { pick, type Lang } from '@/lib/i18n';

const OPTIONS = [
  {
    id: 'curious',
    label: { en: 'Curious', es: 'Con curiosidad', pt: 'Curioso' },
    hint: { en: 'I’m looking into this. No commitments.', es: 'Estoy investigando. Sin compromisos.', pt: 'Estou investigando. Sem compromisso.' },
  },
  {
    id: 'exploring',
    label: { en: 'Exploring', es: 'Explorando', pt: 'Explorando' },
    hint: {
      en: 'I’m taking Jesus seriously and working through my questions.',
      es: 'Estoy tomando a Jesús en serio y trabajando mis preguntas.',
      pt: 'Estou levando Jesus a sério e trabalhando minhas perguntas.',
    },
  },
  {
    id: 'ready',
    label: { en: 'Ready to start', es: 'Listo para empezar', pt: 'Pronto para começar' },
    hint: { en: 'I think I want to follow Jesus.', es: 'Creo que quiero seguir a Jesús.', pt: 'Acho que quero seguir Jesus.' },
  },
  {
    id: 'following',
    label: { en: 'Following', es: 'Siguiéndolo', pt: 'Seguindo' },
    hint: { en: 'I’ve started following him.', es: 'Ya empecé a seguirlo.', pt: 'Já comecei a segui-lo.' },
  },
] as const;

/** The course's standing question, answered privately. Every answer is a fine answer. */
export function StagePicker({ initial, lang }: { initial: string | null; lang: Lang }) {
  const [stage, set] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <fieldset className="mt-4 grid gap-2 sm:grid-cols-2" disabled={pending}>
      <legend className="sr-only">
        {pick({ en: 'Where are you with following Jesus?', es: '¿Dónde estás en cuanto a seguir a Jesús?', pt: 'Onde você está em relação a seguir Jesus?' }, lang)}
      </legend>
      {OPTIONS.map((o) => (
        <label
          key={o.id}
          className={`well relative cursor-pointer p-4 pr-10 transition-all has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--accent)] ${
            stage === o.id ? '!border-[var(--accent)] !bg-[var(--accent-soft)] shadow-[0_0_0_3px_var(--accent-soft)]' : 'hover:!bg-[var(--glass-inner-hover)]'
          }`}
        >
          <span aria-hidden="true" className={`absolute right-4 top-4 grid h-5 w-5 place-items-center rounded-full border-2 ${stage === o.id ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--rule-strong)]'}`}>
            {stage === o.id && <span className="h-1.5 w-1.5 rounded-full bg-[var(--on-accent)]" />}
          </span>
          <input
            type="radio"
            name="stage"
            value={o.id}
            checked={stage === o.id}
            onChange={() => start(async () => { set(o.id); await setStage(o.id); })}
            className="sr-only"
          />
          <span className="block font-medium">{pick(o.label, lang)}</span>
          <span className="sans mt-1 block text-[.84rem] leading-snug text-[var(--ink-soft)]">{pick(o.hint, lang)}</span>
        </label>
      ))}
    </fieldset>
  );
}
