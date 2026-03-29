import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { getInvoices } from "@/lib/data";
import { canManageChapter, getWorkspaceSession } from "@/lib/server/workspace-auth";
import type { PaymentCheckoutResponse, PaymentProvider } from "@/lib/types";

const bodySchema = z.object({
  invoiceId: z.string().trim().min(1),
  provider: z.enum(["stripe", "paypal", "manual"]).default("stripe"),
  payerName: z.string().trim().min(2).optional(),
  payerEmail: z.string().trim().email().optional(),
  note: z.string().trim().max(280).optional(),
  cardholderName: z.string().trim().min(2).optional(),
  cardNumber: z.string().trim().optional(),
  expiry: z.string().trim().optional(),
  cvc: z.string().trim().optional(),
  billingCountry: z.string().trim().optional(),
  markRemittance: z.boolean().optional()
});

function invoiceTotalAmount(lineItems: { unitAmount: number; quantity: number }[]) {
  return lineItems.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0);
}

function generateToken(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function buildPayload(provider: PaymentProvider, invoiceId: string, chapterSlug: string, amount: number) {
  const requiredEnvironment =
    provider === "stripe"
      ? ["STRIPE_SECRET_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"]
      : provider === "paypal"
        ? ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"]
        : [];

  return {
    provider,
    invoiceId,
    chapterSlug,
    amount,
    currency: "USD",
    requiredEnvironment,
    nextImplementationStep:
      provider === "stripe"
        ? "Persist Stripe session IDs, then confirm payment by webhook before finalizing the invoice record."
        : provider === "paypal"
          ? "Create a PayPal order server-side, return the approval URL, then capture it when the payer returns."
          : "Attach remittance evidence and reconcile manually in a later finance workflow."
  };
}

export async function POST(request: Request) {
  try {
    const session = await getWorkspaceSession();
    if (!session || (session.role !== "global-admin" && session.role !== "chapter-lead")) {
      return NextResponse.json({ error: "Admin access is required for payment actions." }, { status: 401 });
    }

    const body = bodySchema.parse(await request.json());
    const invoice = getInvoices().find((entry) => entry.id === body.invoiceId);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }
    if (!canManageChapter(session, invoice.chapterSlug)) {
      return NextResponse.json({ error: "Your workspace role cannot manage this chapter invoice." }, { status: 403 });
    }

    const amount = invoiceTotalAmount(invoice.lineItems);
    const origin = request.headers.get("origin") || "http://localhost:3000";

    if (body.provider === "manual") {
      const attempt = {
        id: generateToken("pay"),
        invoiceId: invoice.id,
        chapterSlug: invoice.chapterSlug,
        provider: "manual" as const,
        status: "awaiting_remittance" as const,
        amountCents: amount * 100,
        currency: "USD" as const,
        payerName: body.payerName,
        payerEmail: body.payerEmail,
        referenceNote: body.note,
        receiptNumber: generateToken("RCP"),
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({
        mode: "mock",
        provider: "manual",
        url: null,
        message: "Manual remittance recorded. The invoice now waits for chapter finance confirmation.",
        integrationPayload: buildPayload("manual", invoice.id, invoice.chapterSlug, amount),
        attempt
      } satisfies PaymentCheckoutResponse);
    }

    if (body.provider === "paypal") {
      const attempt = {
        id: generateToken("pay"),
        invoiceId: invoice.id,
        chapterSlug: invoice.chapterSlug,
        provider: "paypal" as const,
        status: "redirected" as const,
        amountCents: amount * 100,
        currency: "USD" as const,
        payerName: body.payerName,
        payerEmail: body.payerEmail,
        referenceNote: body.note,
        receiptNumber: generateToken("PP"),
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({
        mode: "integration-ready",
        provider: "paypal",
        url: null,
        message: "PayPal handoff recorded. In a live deployment this step would redirect to the approval URL and capture the order on return.",
        integrationPayload: buildPayload("paypal", invoice.id, invoice.chapterSlug, amount),
        attempt
      } satisfies PaymentCheckoutResponse);
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      const digits = (body.cardNumber || "4242424242424242").replace(/\D/g, "");
      const attempt = {
        id: generateToken("pay"),
        invoiceId: invoice.id,
        chapterSlug: invoice.chapterSlug,
        provider: "demo-card" as const,
        status: "paid_demo" as const,
        amountCents: amount * 100,
        currency: "USD" as const,
        payerName: body.cardholderName || body.payerName,
        payerEmail: body.payerEmail,
        brand: digits.startsWith("5") ? "Mastercard" : "Visa",
        last4: digits.slice(-4) || "4242",
        referenceNote: body.note,
        receiptNumber: generateToken("RCP"),
        authCode: generateToken("AUTH"),
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({
        mode: "mock",
        provider: "stripe",
        url: null,
        message: "Recorded card payment created. The invoice is now represented as paid with a receipt and authorization code.",
        integrationPayload: buildPayload("stripe", invoice.id, invoice.chapterSlug, amount),
        attempt
      } satisfies PaymentCheckoutResponse);
    }

    const stripe = new Stripe(stripeKey);
    const sessionUrl = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/admin/payments?invoice=${invoice.id}&provider=stripe&status=paid&message=Stripe sandbox payment completed`,
      cancel_url: `${origin}/admin/payments?invoice=${invoice.id}&provider=stripe&status=cancelled&message=Stripe sandbox payment cancelled`,
      customer_email: body.payerEmail,
      line_items: invoice.lineItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: invoice.currency.toLowerCase(),
          unit_amount: item.unitAmount * 100,
          product_data: {
            name: item.label,
            description: `${invoice.chapterName} • ${invoice.periodLabel}`
          }
        }
      })),
      metadata: {
        invoiceId: invoice.id,
        chapterSlug: invoice.chapterSlug,
        chapterName: invoice.chapterName,
        payerName: body.payerName || "",
        payerEmail: body.payerEmail || "",
        note: body.note || "",
        billingCountry: body.billingCountry || ""
      }
    });

    return NextResponse.json({
      mode: "stripe",
      provider: "stripe",
      url: sessionUrl.url,
      message: "Stripe sandbox session created. Complete the provider handoff in the new tab.",
      integrationPayload: buildPayload("stripe", invoice.id, invoice.chapterSlug, amount),
      attempt: {
        id: generateToken("pay"),
        invoiceId: invoice.id,
        chapterSlug: invoice.chapterSlug,
        provider: "stripe",
        status: "redirected",
        amountCents: amount * 100,
        currency: "USD",
        payerName: body.payerName,
        payerEmail: body.payerEmail,
        referenceNote: body.note,
        externalSessionId: sessionUrl.id,
        createdAt: new Date().toISOString()
      }
    } satisfies PaymentCheckoutResponse);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to start checkout session."
      },
      { status: 400 }
    );
  }
}
