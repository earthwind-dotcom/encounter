import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Privacy' };

export default function Privacy() {
  return (
    <div className="shell pt-14">
      <div className="prose">
        <p className="kicker kicker-accent">Privacy</p>
        <h1 className="text-[2.4rem] font-medium leading-tight">What we keep, and why</h1>
        <p>
          Faith is personal, and some of what people bring here is the most private thing they have. We keep as little as we can, we never
          sell or share it, and you can delete it.
        </p>
        <h2>Reading</h2>
        <p>Everything on Encounter can be read without an account. We don’t run advertising trackers.</p>
        <h2>If you create an account</h2>
        <ul>
          <li><strong>Your name, email and a scrambled form of your password.</strong> We can’t see your password.</li>
          <li><strong>What you’ve marked as done</strong>, so we can show you where you are.</li>
          <li><strong>Your notes.</strong> Private to you. Facilitators and admins can’t read them in the app.</li>
          <li><strong>Where you are with following Jesus</strong>, only if you choose to say. It’s for you, not a scoreboard.</li>
        </ul>
        <h2>If you send a message</h2>
        <p>
          We keep your name, how to reach you, and what you wrote, so someone can reply. Only the people who answer messages can see them.
        </p>
        <h2>Cookies</h2>
        <p>One to keep you signed in, one to remember your language. Your light or dark choice stays in your own browser.</p>
        <h2>Deleting everything</h2>
        <p>
          You can delete your account from <Link href="/account">your page</Link> at any time. That removes your account, progress, notes and
          stage at once. Messages you sent are kept so the conversation can be closed properly, but they’re no longer linked to an account; ask
          and we’ll remove them too.
        </p>
        <p className="text-[var(--faint)] italic">
          This notice will be reviewed before Encounter is promoted publicly, including for the data-protection law where it is operated.
        </p>
      </div>
    </div>
  );
}
