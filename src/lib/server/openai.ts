import fs from "node:fs";
import path from "node:path";

const RESPONSES_API_URL = "https://api.openai.com/v1/responses";
const EMBEDDINGS_API_URL = "https://api.openai.com/v1/embeddings";

type JsonSchema = Record<string, unknown>;

let cachedExampleEnv: Record<string, string> | null = null;

function readExampleEnv() {
  if (cachedExampleEnv) return cachedExampleEnv;

  try {
    const filePath = path.join(process.cwd(), ".env.example");
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed: Record<string, string> = {};

    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim();
      if (key) parsed[key] = value;
    }

    cachedExampleEnv = parsed;
    return parsed;
  } catch {
    cachedExampleEnv = {};
    return cachedExampleEnv;
  }
}

function readEnvValue(key: string) {
  const runtimeValue = process.env[key];
  if (runtimeValue && runtimeValue.trim()) return runtimeValue.trim();

  const exampleValue = readExampleEnv()[key];
  if (exampleValue && exampleValue.trim()) return exampleValue.trim();

  return "";
}

function extractResponseText(payload: any): string | null {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }
  if (Array.isArray(payload?.output)) {
    for (const item of payload.output) {
      if (Array.isArray(item?.content)) {
        for (const part of item.content) {
          if (typeof part?.text === "string" && part.text.trim()) {
            return part.text;
          }
          if (part?.parsed && typeof part.parsed === "object") {
            return JSON.stringify(part.parsed);
          }
        }
      }
    }
  }
  return null;
}

function authHeaders(apiKey: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`
  };
}

export function hasOpenAIKey() {
  return Boolean(readEnvValue("OPENAI_API_KEY"));
}

export function getConfiguredModelName() {
  return readEnvValue("OPENAI_MODEL") || "gpt-4o";
}

export function getConfiguredEmbeddingModelName() {
  return readEnvValue("OPENAI_EMBEDDING_MODEL") || "text-embedding-3-small";
}

export function getConfiguredAIDisplayLabel() {
  return `${getConfiguredModelName()} + ${getConfiguredEmbeddingModelName()}`;
}

export async function requestStructuredOutput<T>({
  schemaName,
  schema,
  systemPrompt,
  userPrompt,
  temperature = 0.2,
  maxOutputTokens = 1200
}: {
  schemaName: string;
  schema: JsonSchema;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<T | null> {
  const apiKey = readEnvValue("OPENAI_API_KEY");
  if (!apiKey) return null;

  const response = await fetch(RESPONSES_API_URL, {
    method: "POST",
    headers: authHeaders(apiKey),
    body: JSON.stringify({
      model: getConfiguredModelName(),
      store: false,
      temperature,
      max_output_tokens: maxOutputTokens,
      input: [
        { role: "system", content: [{ type: "input_text", text: systemPrompt }] },
        { role: "user", content: [{ type: "input_text", text: userPrompt }] }
      ],
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          strict: true,
          schema
        }
      }
    })
  });

  if (!response.ok) throw new Error(`OpenAI request failed with status ${response.status}`);
  const payload = await response.json();
  const text = extractResponseText(payload);
  if (!text) return null;
  return JSON.parse(text) as T;
}

export async function requestEmbeddings(input: string[]): Promise<number[][] | null> {
  const apiKey = readEnvValue("OPENAI_API_KEY");
  if (!apiKey || input.length === 0) return null;
  const response = await fetch(EMBEDDINGS_API_URL, {
    method: "POST",
    headers: authHeaders(apiKey),
    body: JSON.stringify({ model: getConfiguredEmbeddingModelName(), input })
  });
  if (!response.ok) throw new Error(`OpenAI embedding request failed with status ${response.status}`);
  const payload = (await response.json()) as { data?: Array<{ embedding?: number[] }> };
  if (!Array.isArray(payload.data)) return null;
  return payload.data.map((entry) => entry.embedding || []);
}

export async function requestEmbedding(input: string): Promise<number[] | null> {
  const results = await requestEmbeddings([input]);
  return results?.[0] || null;
}
