"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BellRing, CheckCircle2, Mail } from "lucide-react";
import type { InvoiceRecord, InvoiceStatus } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const OVERRIDES_KEY = "wial-admin-invoice-overrides";

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  awaiting_remittance: "Awaiting remittance"
};

function invoiceTotal(invoice: InvoiceRecord) {
  return invoice.lineItems.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0);
}

function readOverrides() {
  if (typeof window === "undefined") return {} as Record<string, Partial<InvoiceRecord>>;
  try {
    const saved = window.localStorage.getItem(OVERRIDES_KEY);
    return saved ? (JSON.parse(saved) as Record<string, Partial<InvoiceRecord>>) : {};
  } catch {
    return {} as Record<string, Partial<InvoiceRecord>>;
  }
}

function writeOverrides(value: Record<string, Partial<InvoiceRecord>>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(value));
  } catch {
    // ignore browser storage issues
  }
}

function mergeInvoices(base: InvoiceRecord[]) {
  const overrides = readOverrides();
  return base.map((invoice) => ({ ...invoice, ...(overrides[invoice.id] || {}) }));
}

export function InvoicePortal({ invoices }: { invoices: InvoiceRecord[] }) {
  const [invoiceState, setInvoiceState] = useState<InvoiceRecord[]>(invoices);
  const [selectedId, setSelectedId] = useState(invoices[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setInvoiceState(mergeInvoices(invoices));
  }, [invoices]);

  const selectedInvoice = useMemo(
    () => invoiceState.find((invoice) => invoice.id === selectedId) ?? invoiceState[0],
    [invoiceState, selectedId]
  );

  const totals = useMemo(() => {
    const totalDue = invoiceState.reduce((sum, invoice) => sum + invoiceTotal(invoice), 0);
    const totalPaid = invoiceState
      .filter((invoice) => invoice.status === "paid")
      .reduce((sum, invoice) => sum + invoiceTotal(invoice), 0);
    const overdueCount = invoiceState.filter((invoice) => invoice.status === "overdue").length;
    const awaitingCount = invoiceState.filter((invoice) => invoice.status === "awaiting_remittance").length;
    return { totalDue, totalPaid, overdueCount, awaitingCount };
  }, [invoiceState]);

  if (!selectedInvoice) return null;

  function updateInvoice(partial: Partial<InvoiceRecord>) {
    const overrides = readOverrides();
    overrides[selectedInvoice.id] = {
      ...(overrides[selectedInvoice.id] || {}),
      ...partial
    };
    writeOverrides(overrides);
    setInvoiceState((current) =>
      current.map((invoice) =>
        invoice.id === selectedInvoice.id ? { ...invoice, ...partial } : invoice
      )
    );
  }

  function handleReminder() {
    updateInvoice({ reminderSentAt: new Date().toISOString() });
    setMessage(`Reminder logged for ${selectedInvoice.chapterName}.`);
  }

  function handleMarkPaid() {
    updateInvoice({
      status: "paid",
      receiptNumber: selectedInvoice.receiptNumber ?? `RCP-${selectedInvoice.id.toUpperCase()}`
    });
    setMessage(`Payment status updated for ${selectedInvoice.chapterName}.`);
  }

  return (
    <section className="surface rounded-[2rem] p-6 md:p-8">
      <div className="mb-6 space-y-2">
        <p className="kicker">Dues and invoicing</p>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Chapter dues with a complete payment workflow
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-[color:var(--muted-foreground)]">
          This workspace models WIAL’s dues rules without collapsing into course commerce. Invoice
          state stays readable, reminders are visible, and the payment portal can hand off to
          Stripe, PayPal, or manual reconciliation without redesigning the workflow.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card-subtle p-5">
          <p className="text-sm text-[color:var(--muted-foreground)]">Total due</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{formatCurrency(totals.totalDue, "USD")}</p>
        </div>
        <div className="card-subtle p-5">
          <p className="text-sm text-[color:var(--muted-foreground)]">Total paid</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{formatCurrency(totals.totalPaid, "USD")}</p>
        </div>
        <div className="card-subtle p-5">
          <p className="text-sm text-[color:var(--muted-foreground)]">Overdue invoices</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{totals.overdueCount}</p>
        </div>
        <div className="card-subtle p-5">
          <p className="text-sm text-[color:var(--muted-foreground)]">Awaiting remittance</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{totals.awaitingCount}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-3">
          {invoiceState.map((invoice) => (
            <button
              key={invoice.id}
              type="button"
              onClick={() => {
                setSelectedId(invoice.id);
                setMessage(null);
              }}
              className={`w-full rounded-[1.5rem] border p-5 text-left transition ${
                invoice.id === selectedInvoice.id
                  ? "border-black/15 bg-white shadow-sm"
                  : "border-black/8 bg-[color:var(--background)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{invoice.chapterName}</p>
                  <p className="text-sm text-[color:var(--muted-foreground)]">{invoice.periodLabel}</p>
                </div>
                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs">
                  {STATUS_LABELS[invoice.status]}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-[color:var(--muted-foreground)]">
                <span>Due {formatDate(invoice.dueDate)}</span>
                <span>{formatCurrency(invoiceTotal(invoice), invoice.currency)}</span>
              </div>
              <div className="mt-2 text-xs text-[color:var(--muted-foreground)]">
                Payment method: {invoice.status === "awaiting_remittance" ? "Manual / bank" : invoice.receiptNumber ? "Recorded payment" : "Provider handoff or manual"}
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-[1.75rem] border border-black/8 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                Selected invoice
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">{selectedInvoice.chapterName}</h3>
              <p className="text-sm text-[color:var(--muted-foreground)]">{selectedInvoice.periodLabel}</p>
            </div>

            <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Total due</p>
              <p className="text-2xl font-semibold tracking-tight">
                {formatCurrency(invoiceTotal(selectedInvoice), selectedInvoice.currency)}
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-black/8">
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
                {selectedInvoice.lineItems.map((item) => (
                  <tr key={item.label} className="border-t border-black/6">
                    <td className="px-4 py-4">{item.label}</td>
                    <td className="px-4 py-4">{item.quantity}</td>
                    <td className="px-4 py-4">{formatCurrency(item.unitAmount, selectedInvoice.currency)}</td>
                    <td className="px-4 py-4">{formatCurrency(item.unitAmount * item.quantity, selectedInvoice.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Reminder</p>
              <p className="mt-2 text-sm">{selectedInvoice.reminderSentAt ? formatDate(selectedInvoice.reminderSentAt) : "Not sent"}</p>
            </div>
            <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Receipt</p>
              <p className="mt-2 text-sm">{selectedInvoice.receiptNumber ?? "Pending"}</p>
            </div>
            <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Status</p>
              <p className="mt-2 text-sm">{STATUS_LABELS[selectedInvoice.status]}</p>
            </div>
            <div className="rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Payment method</p>
              <p className="mt-2 text-sm">{selectedInvoice.status === "awaiting_remittance" ? "Manual / bank" : "Provider or recorded payment"}</p>
            </div>
          </div>

          <p className="mt-5 rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4 text-sm leading-7 text-[color:var(--muted-foreground)]">
            {selectedInvoice.notes}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleReminder}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold"
            >
              <Mail size={14} />
              Send reminder
            </button>
            <Link
              href={`/admin/payments?invoice=${selectedInvoice.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold"
            >
              Open payment portal
              <ArrowRight size={14} />
            </Link>
            <button
              type="button"
              onClick={handleMarkPaid}
              className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
            >
              <CheckCircle2 size={14} />
              Mark paid
            </button>
          </div>

          {message ? (
            <div className="mt-4 rounded-[1.25rem] border border-black/8 bg-[color:var(--background)] p-4 text-sm text-[color:var(--muted-foreground)]">
              {message}
            </div>
          ) : null}

          <div className="mt-4 flex items-center gap-2 text-xs text-[color:var(--muted-foreground)]">
            <BellRing size={14} />
            Stripe sandbox, PayPal handoff, and manual chapter collection all map to the same invoice workflow.
          </div>
        </div>
      </div>
    </section>
  );
}
