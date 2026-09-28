import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/session';
import { TalkForm } from '@/components/forms';

export const metadata: Metadata = {
  title: 'Talk to someone',
  description: 'Ask a question, talk something through, or say you want to follow Jesus. A real person reads every message.',
};

export default async function Talk() {
  const user = await getCurrentUser();
  return (
    <div className="shell max-w-[40rem] pt-14">
      <p className="kicker kicker-accent">Talk to someone</p>
      <h1 className="mt-3 text-[clamp(2rem,1.5rem+2vw,2.8rem)] font-medium leading-tight">A real person, not a funnel.</h1>
      <p className="mt-4 text-[1.08rem] text-[var(--ink-soft)]">
        Ask the question you haven’t been able to ask anyone. Talk through something hard. Tell us you think you want to follow Jesus and
        don’t know what that means yet. Or just say hello.
      </p>
      <p className="mt-3 text-[1.02rem] text-[var(--ink-soft)]">
        A real person reads every message. We won’t add you to a mailing list, we won’t pass on your details, and you can stop the conversation
        at any point.
      </p>
      <TalkForm defaultName={user?.name} defaultContact={user?.email} />
    </div>
  );
}
