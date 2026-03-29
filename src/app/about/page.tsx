import { Globe2, LayoutTemplate, ShieldCheck, Wallet } from "lucide-react";
export default function AboutPage() {
  return (
    <div className="container-shell py-16">
      <div className="max-w-4xl space-y-5">
        <p className="kicker">About WIAL</p>
        <h1 className="section-title">A global Action Learning network with local chapter relevance</h1>
        <p className="text-lg leading-8 text-[color:var(--muted-foreground)]">WIAL advances Action Learning worldwide. The platform keeps one recognizable public presence while letting each chapter publish local events, coach visibility, and chapter-specific content.</p>
      </div>
      <div className="mt-10 grid gap-5 lg:grid-cols-2">{[
        { icon: LayoutTemplate, title: "Shared structure", body: "Navigation, layout, and core visual standards stay consistent across the network." },
        { icon: Wallet, title: "Dues operations", body: "Chapter and affiliate dues can be tracked inside one workflow instead of scattered across separate tools." },
        { icon: Globe2, title: "One network, local context", body: "Visitors can move from the global site into local chapters without feeling like they left the WIAL ecosystem." },
        { icon: ShieldCheck, title: "Trust first", body: "Coach visibility stays honest about verification, certifications, and public-data gaps." }
      ].map((item) => <div key={item.title} className="card-subtle p-6"><item.icon size={18} className="text-[color:var(--accent)]" /><h2 className="mt-4 text-xl font-semibold tracking-tight">{item.title}</h2><p className="mt-3 text-sm leading-7 text-[color:var(--muted-foreground)]">{item.body}</p></div>)}</div>
    </div>
  );
}
