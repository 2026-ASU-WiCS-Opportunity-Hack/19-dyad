import { getEvents } from "@/lib/data";
export default function EventsPage() {
  const events = getEvents();
  return (
    <div className="container-shell py-16">
      <div className="max-w-4xl space-y-4">
        <p className="kicker">Shared event calendar</p>
        <h1 className="section-title">Global visibility for chapter events</h1>
        <p className="text-lg leading-8 text-[color:var(--muted-foreground)]">Local chapters can publish events while still benefiting from global visibility on the main WIAL site.</p>
      </div>
      <div className="mt-10 grid gap-5 lg:grid-cols-2">{events.map((event) => <article key={event.id} className="card-subtle p-6"><p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">{event.chapterName}</p><h2 className="mt-3 text-xl font-semibold tracking-tight">{event.title}</h2><p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{event.date} • {event.format} • {event.location}</p><p className="mt-4 text-sm leading-7 text-[color:var(--muted-foreground)]">{event.summary}</p><p className="mt-4 text-sm font-medium text-black">{event.audience}</p></article>)}</div>
    </div>
  );
}
