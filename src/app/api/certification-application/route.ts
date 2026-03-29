import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCertificationApplication } from "@/lib/certification-applications";

const bodySchema = z.object({
  level: z.enum(["CALC", "PALC", "SALC", "MALC"]),
  values: z.record(z.string(), z.string())
});

function escapeCsvValue(value: string) {
  const normalized = String(value ?? "").replace(/\r?\n/g, "\n");
  return `"${normalized.replace(/"/g, '""')}"`;
}

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const definition = getCertificationApplication(body.level);

    if (!definition) {
      return NextResponse.json({ error: "Unknown certification application type." }, { status: 404 });
    }

    const requiredFields = definition.sections.flatMap((section) =>
      section.fields.filter((field) => field.required).map((field) => field.id)
    );

    const missing = requiredFields.filter((fieldId) => !body.values[fieldId]?.trim());
    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missing.join(", ")}`
        },
        { status: 400 }
      );
    }

    const csvDir = path.join(process.cwd(), "data", "certification_applications");
    const filePath = path.join(csvDir, definition.csvFileName);
    await fs.mkdir(csvDir, { recursive: true });

    const headers = [
      "submittedAt",
      "applicationLevel",
      ...definition.sections.flatMap((section) => section.fields.map((field) => field.id))
    ];

    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, `${headers.join(",")}\n`, "utf8");
    }

    const submittedAt = new Date().toISOString();
    const rowValues = headers.map((header) => {
      if (header === "submittedAt") return escapeCsvValue(submittedAt);
      if (header === "applicationLevel") return escapeCsvValue(definition.level);
      return escapeCsvValue(body.values[header] || "");
    });

    await fs.appendFile(filePath, `${rowValues.join(",")}\n`, "utf8");

    return NextResponse.json({
      ok: true,
      savedTo: path.relative(process.cwd(), filePath),
      submittedAt
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to submit certification application."
      },
      { status: 400 }
    );
  }
}
