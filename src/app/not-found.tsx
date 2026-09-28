import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="shell max-w-xl pt-20">
      <p className="kicker kicker-accent">Not found</p>
      <h1 className="mt-3 text-[2.4rem] font-medium leading-tight">That page isn’t here.</h1>
      <p className="mt-3 text-[var(--ink-soft)]">
        If you followed a link from the old Marginalia site, everything moved into the <Link href="/library">Library</Link>.
      </p>
      <p className="mt-6"><Link href="/" className="btn">Back to the start</Link></p>
    </div>
  );
}
