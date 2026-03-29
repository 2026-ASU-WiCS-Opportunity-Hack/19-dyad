import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-shell flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="kicker">Page not found</p>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
        This chapter path is not available yet
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-[color:var(--muted-foreground)]">
        The network only exposes chapter pages that have already been provisioned or published.
        Return to the chapter list or coach directory to continue browsing.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/chapters" className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white">
          Browse chapters
        </Link>
        <Link href="/coaches" className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black">
          Open directory
        </Link>
      </div>
    </div>
  );
}
