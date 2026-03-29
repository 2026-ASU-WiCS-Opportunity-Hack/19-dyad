"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, FileCheck2, Loader2 } from "lucide-react";
import type {
  CertificationApplicationDefinition,
  CertificationApplicationField
} from "@/lib/certification-applications";

type SubmissionResponse = {
  ok: boolean;
  savedTo?: string;
  submittedAt?: string;
  error?: string;
};

function renderField(
  field: CertificationApplicationField,
  value: string,
  onChange: (nextValue: string) => void,
  disabled: boolean
) {
  const sharedProps = {
    value,
    disabled,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
    placeholder: field.placeholder,
    className:
      field.type === "textarea"
        ? "min-h-32 w-full rounded-[1.25rem] border border-black/8 bg-white p-4 text-sm leading-7 outline-none transition focus:border-black/20 disabled:opacity-60"
        : "h-12 w-full rounded-2xl border border-black/8 bg-white px-4 text-sm outline-none transition focus:border-black/20 disabled:opacity-60"
  };

  if (field.type === "textarea") {
    return <textarea {...sharedProps} rows={5} />;
  }

  return <input {...sharedProps} type={field.type} />;
}

export function CertificationApplicationForm({
  definition
}: {
  definition: CertificationApplicationDefinition;
}) {
  const initialValues = useMemo(
    () =>
      Object.fromEntries(
        definition.sections.flatMap((section) =>
          section.fields.map((field) => [
            field.id,
            field.type === "date" && field.id === "applicationDate"
              ? new Date().toISOString().slice(0, 10)
              : ""
          ])
        )
      ) as Record<string, string>,
    [definition]
  );

  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [step, setStep] = useState<"edit" | "preview" | "submitted">("edit");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmissionResponse | null>(null);

  const requiredFields = useMemo(
    () =>
      definition.sections.flatMap((section) =>
        section.fields.filter((field) => field.required).map((field) => field.id)
      ),
    [definition]
  );

  function updateValue(fieldId: string, nextValue: string) {
    setValues((current) => ({ ...current, [fieldId]: nextValue }));
    setErrors((current) => {
      if (!current[fieldId]) return current;
      const next = { ...current };
      delete next[fieldId];
      return next;
    });
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    for (const fieldId of requiredFields) {
      if (!values[fieldId]?.trim()) {
        nextErrors[fieldId] = "This field is required.";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handlePreview() {
    if (!validate()) return;
    setStep("preview");
    setSubmitResult(null);
  }

  async function handleSubmitApplication() {
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const response = await fetch("/api/certification-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: definition.level,
          values
        })
      });

      const payload = (await response.json()) as SubmissionResponse;
      if (!response.ok) {
        throw new Error(payload.error || "Unable to submit application.");
      }

      setSubmitResult(payload);
      setStep("submitted");
    } catch (error) {
      setSubmitResult({
        ok: false,
        error: error instanceof Error ? error.message : "Unable to submit application."
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pb-16">
      <section className="border-b border-black/8 bg-white">
        <div className="container-shell grid gap-8 py-16 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-5">
            <p className="kicker">{definition.level} application</p>
            <h1 className="section-title">{definition.title}</h1>
            <p className="max-w-3xl text-lg leading-8 text-[color:var(--muted-foreground)]">
              {definition.intro}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/certification"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black"
              >
                <ChevronLeft size={15} />
                Back to certification
              </Link>
              <span className="rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-medium">
                Step {step === "edit" ? "1" : step === "preview" ? "2" : "3"} of 3
              </span>
            </div>
          </div>

          <div className="surface rounded-[2rem] p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
              Application workflow
            </p>
            <div className="mt-5 space-y-4 text-sm">
              {[
                {
                  title: "Complete the application",
                  body: "Enter the details requested by the certification template."
                },
                {
                  title: "Review before saving",
                  body: "Use the preview screen to confirm names, dates, and narrative fields."
                },
                {
                  title: "Submit application",
                  body: "The final submission is written to a certification-specific CSV file in local storage for this project."
                }
              ].map((item, index) => (
                <div key={item.title} className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4">
                  <p className="font-semibold">{index + 1}. {item.title}</p>
                  <p className="mt-2 leading-7 text-[color:var(--muted-foreground)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-12">
        {step === "edit" ? (
          <div className="grid gap-6">
            {definition.sections.map((section) => (
              <section key={section.title} className="surface rounded-[1.8rem] p-6">
                <div className="mb-5 space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
                  {section.description ? (
                    <p className="text-sm leading-7 text-[color:var(--muted-foreground)]">{section.description}</p>
                  ) : null}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {section.fields.map((field) => (
                    <label
                      key={field.id}
                      className={`space-y-2 text-sm ${field.type === "textarea" ? "md:col-span-2" : ""}`}
                    >
                      <span className="font-medium">
                        {field.label}
                        {field.required ? " *" : ""}
                      </span>
                      {renderField(field, values[field.id] || "", (next) => updateValue(field.id, next), false)}
                      {field.helpText ? (
                        <span className="block text-xs leading-6 text-[color:var(--muted-foreground)]">
                          {field.helpText}
                        </span>
                      ) : null}
                      {errors[field.id] ? (
                        <span className="block text-xs text-[color:var(--danger)]">{errors[field.id]}</span>
                      ) : null}
                    </label>
                  ))}
                </div>
              </section>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-black/8 bg-white p-5">
              <p className="text-sm leading-7 text-[color:var(--muted-foreground)]">
                Required fields must be completed before you can review the application.
              </p>
              <button
                type="button"
                onClick={handlePreview}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-semibold text-white"
              >
                <FileCheck2 size={16} />
                Review application
              </button>
            </div>
          </div>
        ) : null}

        {step === "preview" ? (
          <div className="space-y-6">
            <div className="surface rounded-[1.8rem] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="kicker">Preview changes</p>
                  <h2 className="text-3xl font-semibold tracking-tight">Review your application before saving</h2>
                  <p className="max-w-3xl text-sm leading-7 text-[color:var(--muted-foreground)]">
                    Confirm the information below. Use “Back to edit” if anything needs correction.
                  </p>
                </div>
                <span className="rounded-full border border-black/10 bg-[color:var(--background)] px-4 py-2 text-sm font-medium">
                  {definition.level}
                </span>
              </div>
            </div>

            {definition.sections.map((section) => (
              <section key={section.title} className="surface rounded-[1.8rem] p-6">
                <h3 className="text-xl font-semibold tracking-tight">{section.title}</h3>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {section.fields.map((field) => (
                    <div
                      key={field.id}
                      className={`rounded-[1.25rem] border border-black/8 bg-white p-4 ${field.type === "textarea" ? "md:col-span-2" : ""}`}
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                        {field.label}
                      </p>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[color:var(--foreground)]">
                        {values[field.id]?.trim() || "Not provided"}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {submitResult?.error ? (
              <div className="rounded-[1.25rem] border border-[color:var(--danger)]/25 bg-[color:var(--danger)]/10 p-4 text-sm text-[color:var(--danger)]">
                {submitResult.error}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-black/8 bg-white p-5">
              <button
                type="button"
                onClick={() => setStep("edit")}
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-black"
              >
                Back to edit
              </button>
              <button
                type="button"
                onClick={handleSubmitApplication}
                disabled={submitting}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Submit application
              </button>
            </div>
          </div>
        ) : null}

        {step === "submitted" ? (
          <div className="surface rounded-[1.8rem] p-8">
            <div className="flex max-w-3xl flex-col gap-4">
              <p className="kicker">Application saved</p>
              <h2 className="text-3xl font-semibold tracking-tight">Your {definition.level} application has been recorded</h2>
              <p className="text-sm leading-7 text-[color:var(--muted-foreground)]">
                Application submitted successfully. Your details have been recorded for this certification.
              </p>
              <div className="rounded-[1.25rem] border border-black/8 bg-white p-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
                <p><span className="font-medium text-black">Submitted at:</span> {submitResult?.submittedAt || "Unavailable"}</p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/certification" className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white">
                  Return to certification
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setValues(initialValues);
                    setErrors({});
                    setSubmitResult(null);
                    setStep("edit");
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black"
                >
                  Start another application
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
