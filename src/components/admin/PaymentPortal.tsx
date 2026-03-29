"use client";

import { type FormEvent, useMemo, useState } from "react";
import { CheckCircle2, CreditCard, Landmark, Loader2, Wallet2 } from "lucide-react";
import type { InvoiceRecord, PaymentAttempt, PaymentCheckoutResponse, WorkspacePaymentMode } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const OVERRIDES_KEY = "wial-admin-invoice-overrides";

function invoiceTotal(invoice: InvoiceRecord) {
  return invoice.lineItems.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0);
}

function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function writeInvoiceUpdate(invoice: InvoiceRecord, attempt: PaymentAttempt | null) {
  if (typeof window === "undefined") return;
  try {
    const saved = window.localStorage.getItem(OVERRIDES_KEY);
    const overrides = saved ? (JSON.parse(saved) as Record<string, Partial<InvoiceRecord>>) : {};
    overrides[invoice.id] = {
      ...(overrides[invoice.id] || {}),
      status:
        attempt?.status === "awaiting_remittance"
          ? "awaiting_remittance"
          : attempt?.status === "paid_demo" || attempt?.status === "paid"
            ? "paid"
            : invoice.status,
      receiptNumber: attempt?.receiptNumber || invoice.receiptNumber
    };
    window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    // ignore browser storage issues
  }
}

export function PaymentPortal({
  invoice,
  initialStatus,
  initialMessage,
  initialProvider
}: {
  invoice: InvoiceRecord;
  initialStatus?: string | null;
  initialMessage?: string | null;
  initialProvider?: string | null;
}) {
  const [paymentMode, setPaymentMode] = useState<WorkspacePaymentMode>(initialProvider === "paypal" ? "paypal" : initialProvider === "manual" ? "manual" : "card");
  const [payerName, setPayerName] = useState("WIAL Chapter Finance");
  const [payerEmail, setPayerEmail] = useState("finance@wial.org");
  const [billingCountry, setBillingCountry] = useState("United States");
  const [referenceNote, setReferenceNote] = useState(`${invoice.chapterName} dues for ${invoice.periodLabel}`);
  const [cardholderName, setCardholderName] = useState("WIAL Chapter Finance");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(initialMessage ?? null);
  const [attempt, setAttempt] = useState<PaymentAttempt | null>(null);

  const total = useMemo(() => invoiceTotal(invoice), [invoice]);

  const statusMessage = useMemo(() => {
    if (!initialStatus) return null;
    if (initialStatus === "paid") return "Payment completed in the provider flow.";
    if (initialStatus === "cancelled") return "Payment was cancelled before completion.";
    if (initialStatus === "pending") return "Provider handoff has been initiated and is waiting for completion.";
    if (initialStatus === "recorded") return "Manual payment mode has been recorded for this invoice.";
    return null;
  }, [initialStatus]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const provider = paymentMode === "card" ? "stripe" : paymentMode;
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
          provider,
          payerName,
          payerEmail,
          note: referenceNote,
          cardholderName,
          cardNumber,
          expiry,
          cvc,
          billingCountry,
          markRemittance: paymentMode === "manual"
        })
      });

      const payload = (await response.json()) as PaymentCheckoutResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to start payment flow.");

      if (payload.url) {
        window.open(payload.url, "_blank", "noopener,noreferrer");
      }

      setAttempt(payload.attempt || null);
      setMessage(payload.message);
      writeInvoiceUpdate(invoice, payload.attempt || null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to start payment flow.");
      setAttempt(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="surface rounded-[2rem] p-6 md:p-8">
        <div className="space-y-2">
          <p className="kicker">Dues checkout</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Invoice payment portal</h1>
          <p className="max-w-3xl text-sm leading-7 text-[color:var(--muted-foreground)]">
            Complete chapter dues for the selected reporting period. Card, PayPal, and manual
            remittance all map back to the same invoice and receipt workflow.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[1.75rem] border border-black/8 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">Invoice</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">{invoice.chapterName}</h2>
            <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{invoice.periodLabel}</p>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4">
                <dt className="text-[color:var(--muted-foreground)]">Due date</dt>
                <dd className="mt-1 font-semibold">{formatDate(invoice.dueDate)}</dd>
              </div>
              <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4">
                <dt className="text-[color:var(--muted-foreground)]">Total</dt>
                <dd className="mt-1 font-semibold">{formatCurrency(total, invoice.currency)}</dd>
              </div>
              <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4">
                <dt className="text-[color:var(--muted-foreground)]">Current status</dt>
                <dd className="mt-1 font-semibold capitalize">{attempt?.status === "awaiting_remittance" ? "awaiting remittance" : attempt?.status === "paid_demo" ? "paid" : invoice.status}</dd>
              </div>
              <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4">
                <dt className="text-[color:var(--muted-foreground)]">Receipt</dt>
                <dd className="mt-1 font-semibold">{attempt?.receiptNumber || invoice.receiptNumber || "Pending"}</dd>
              </div>
            </dl>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-black/8 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-[color:var(--background)] text-left text-[color:var(--muted-foreground)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Line item</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Unit</th>
                  <th className="px-4 py-3 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item) => (
                  <tr key={item.label} className="border-t border-black/6">
                    <td className="px-4 py-4">{item.label}</td>
                    <td className="px-4 py-4">{item.quantity}</td>
                    <td className="px-4 py-4">{formatCurrency(item.unitAmount, invoice.currency)}</td>
                    <td className="px-4 py-4">{formatCurrency(item.quantity * item.unitAmount, invoice.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {statusMessage ? (
        <div className="rounded-[1.5rem] border border-black/8 bg-white p-5 text-sm text-[color:var(--muted-foreground)]">
          {statusMessage}
        </div>
      ) : null}

      <div className="surface rounded-[2rem] p-6 md:p-8">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            {
              value: "card",
              label: "Card",
              icon: CreditCard,
              body: "Enter card details now. With Stripe keys present, this can hand off to sandbox checkout. Without keys, the portal still records a payment and generates a receipt."
            },
            {
              value: "paypal",
              label: "PayPal",
              icon: Wallet2,
              body: "Capture the invoice context and follow the PayPal handoff path from the same dues workflow."
            },
            {
              value: "manual",
              label: "Manual / bank",
              icon: Landmark,
              body: "Keep the dues workflow useful for chapters that still reconcile offline or by remittance."
            }
          ].map((entry) => {
            const Icon = entry.icon;
            const active = paymentMode === entry.value;
            return (
              <button
                key={entry.value}
                type="button"
                onClick={() => setPaymentMode(entry.value as WorkspacePaymentMode)}
                className={`rounded-[1.35rem] border p-4 text-left transition ${
                  active ? "border-black/18 bg-white shadow-sm" : "border-black/8 bg-[color:var(--background)]"
                }`}
              >
                <Icon size={18} className="text-[color:var(--accent)]" />
                <p className="mt-3 text-sm font-semibold">{entry.label}</p>
                <p className="mt-2 text-xs leading-6 text-[color:var(--muted-foreground)]">{entry.body}</p>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5 lg:grid-cols-[0.96fr_1.04fr]">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium">Payer name</span>
                <input value={payerName} onChange={(event) => setPayerName(event.target.value)} className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4" />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium">Billing email</span>
                <input value={payerEmail} onChange={(event) => setPayerEmail(event.target.value)} className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4" />
              </label>
            </div>

            {paymentMode === "card" ? (
              <div className="space-y-4 rounded-[1.5rem] border border-black/8 bg-white p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Card details</p>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">Name on card</span>
                  <input value={cardholderName} onChange={(event) => setCardholderName(event.target.value)} className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">Card number</span>
                  <input value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4" />
                </label>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="space-y-2 text-sm md:col-span-1">
                    <span className="font-medium">Expiry</span>
                    <input value={expiry} onChange={(event) => setExpiry(event.target.value)} className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4" />
                  </label>
                  <label className="space-y-2 text-sm md:col-span-1">
                    <span className="font-medium">CVC</span>
                    <input value={cvc} onChange={(event) => setCvc(event.target.value)} className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4" />
                  </label>
                  <label className="space-y-2 text-sm md:col-span-1">
                    <span className="font-medium">Country</span>
                    <input value={billingCountry} onChange={(event) => setBillingCountry(event.target.value)} className="h-12 w-full rounded-2xl border border-black/8 bg-[color:var(--background)] px-4" />
                  </label>
                </div>
                <p className="text-xs leading-6 text-[color:var(--muted-foreground)]">Sandbox or recorded payment. If Stripe keys are available, this can hand off to sandbox checkout. Otherwise the portal records the payment and generates a receipt.</p>
              </div>
            ) : null}

            {paymentMode === "paypal" ? (
              <div className="rounded-[1.5rem] border border-black/8 bg-white p-5 text-sm leading-7 text-[color:var(--muted-foreground)]">
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">PayPal handoff</p>
                <p className="mt-2">The portal records payer, invoice, and amount first, then initiates a PayPal handoff path for provider approval.</p>
              </div>
            ) : null}

            {paymentMode === "manual" ? (
              <div className="rounded-[1.5rem] border border-black/8 bg-white p-5 text-sm leading-7 text-[color:var(--muted-foreground)]">
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Manual remittance</p>
                <p className="mt-2">Use this mode when chapter finance pays by bank transfer or another offline method. The invoice will move into an awaiting-remittance state.</p>
              </div>
            ) : null}

            <label className="space-y-2 text-sm">
              <span className="font-medium">Reference note</span>
              <textarea value={referenceNote} onChange={(event) => setReferenceNote(event.target.value)} rows={3} className="w-full rounded-[1.5rem] border border-black/8 bg-[color:var(--background)] p-4" />
            </label>

            <button type="submit" disabled={submitting} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-semibold text-white disabled:opacity-60">
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={16} />}
              {paymentMode === "card" ? "Submit payment" : paymentMode === "paypal" ? "Continue with PayPal" : "Mark awaiting remittance"}
            </button>
          </div>

          <div className="rounded-[1.75rem] border border-black/8 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Receipt and status</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4 text-sm">
                <p className="text-[color:var(--muted-foreground)]">Receipt number</p>
                <p className="mt-1 font-semibold">{attempt?.receiptNumber || invoice.receiptNumber || "Pending"}</p>
              </div>
              <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4 text-sm">
                <p className="text-[color:var(--muted-foreground)]">Chapter</p>
                <p className="mt-1 font-semibold">{invoice.chapterName}</p>
              </div>
              <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4 text-sm">
                <p className="text-[color:var(--muted-foreground)]">Reporting period</p>
                <p className="mt-1 font-semibold">{invoice.periodLabel}</p>
              </div>
              <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4 text-sm">
                <p className="text-[color:var(--muted-foreground)]">Provider</p>
                <p className="mt-1 font-semibold capitalize">{attempt?.provider === "demo-card" ? "Card" : attempt?.provider || paymentMode}</p>
              </div>
              <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4 text-sm">
                <p className="text-[color:var(--muted-foreground)]">Status</p>
                <p className="mt-1 font-semibold capitalize">{attempt?.status === "paid_demo" ? "paid" : attempt?.status || invoice.status}</p>
              </div>
              <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4 text-sm">
                <p className="text-[color:var(--muted-foreground)]">Payer email</p>
                <p className="mt-1 font-semibold">{attempt?.payerEmail || payerEmail}</p>
              </div>
              {attempt?.createdAt ? (
                <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4 text-sm">
                  <p className="text-[color:var(--muted-foreground)]">Paid at</p>
                  <p className="mt-1 font-semibold">{formatDateTime(attempt.createdAt)}</p>
                </div>
              ) : null}
              {attempt?.last4 || attempt?.authCode ? (
                <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4 text-sm">
                  <p className="text-[color:var(--muted-foreground)]">Recorded card details</p>
                  <p className="mt-1 font-semibold">{attempt?.brand || "Card"} •••• {attempt?.last4 || "4242"}{attempt?.authCode ? ` • ${attempt.authCode}` : ""}</p>
                </div>
              ) : null}
            </div>

            {message ? (
              <div className="mt-5 rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
                {message}
              </div>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
