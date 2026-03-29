import { DirectoryClient } from "@/components/directory/DirectoryClient";
import { getCoaches, getCountryOptions, getLanguageOptions } from "@/lib/data";
export default function CoachesPage() {
  const coaches = getCoaches();
  const languageOptions = getLanguageOptions();
  const countryOptions = getCountryOptions();
  return (
    <div className="container-shell py-16">
      <div className="max-w-4xl space-y-4">
        <p className="kicker">Coach directory</p>
        <h1 className="section-title">Find a coach across languages, chapters, and contexts</h1>
        <p className="text-lg leading-8 text-[color:var(--muted-foreground)]">Search by need, language, geography, or certification level. Public profile gaps remain visible so the directory stays honest about what is verified and what still needs review.</p>
      </div>
      <div className="mt-10"><DirectoryClient coaches={coaches} languageOptions={languageOptions} countryOptions={countryOptions} /></div>
    </div>
  );
}
