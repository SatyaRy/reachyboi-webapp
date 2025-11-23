export default function Home() {
  return (
    <div className="container mx-auto px-4 py-10">
      <section className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-slate-800 bg-slate-900/70 text-xs font-semibold uppercase tracking-wide text-slate-300">
          Learn with focus
        </div>
        <div className="flex justify-center gap-3">
          <a
            href="/subscribe"
            className="rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-primary-400/60 hover:text-white transition"
          >
            Subscription
          </a>
          <a
            href="/vps"
            className="rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-primary-400/60 hover:text-white transition"
          >
            My VPS
          </a>
          <a
            href="/videos"
            className="rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-primary-400/60 hover:text-white transition"
          >
            Education
          </a>
          <a
            href="/posts"
            className="rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-primary-400/60 hover:text-white transition"
          >
            Posts
          </a>
          <a
            href="/news"
            className="rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-primary-400/60 hover:text-white transition"
          >
            News
          </a>
        </div>
      </section>
    </div>
  );
}
