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
          className={`card cursor-pointer p-4 ${stage === o.id ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : ''}`}
        >
          <input
            type="radio"
            name="stage"
            value={o.id}
            checked={stage === o.id}
            onChange={() => start(async () => { set(o.id); await setStage(o.id); })}
            className="sr-only"
          />
          <span className="block font-medium">{pick(o.label, lang)}</span>
          <span className="block text-[.9rem] text-[var(--ink-soft)]">{pick(o.hint, lang)}</span>
        </label>
      ))}
    </fieldset>
  );
}
