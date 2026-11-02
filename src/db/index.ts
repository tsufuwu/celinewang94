import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export * from "./schema";

export type DbClient = ReturnType<typeof drizzle<typeof schema>>;

export interface R2ObjectItem {
  body: ReadableStream;
  httpEtag: string;
  writeHttpMetadata: (headers: Headers) => void;
}

export interface CloudflareEnv {
  DB?: Parameters<typeof drizzle>[0];
  COVERS_BUCKET?: {
    put: (key: string, value: unknown, options?: Record<string, unknown>) => Promise<unknown>;
    get: (key: string) => Promise<R2ObjectItem | null>;
  };
  ADMIN_PASSWORD?: string;
}

export async function getDb(): Promise<DbClient | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const cfEnv = env as CloudflareEnv;
    if (cfEnv && cfEnv.DB) {
      return drizzle(cfEnv.DB, { schema });
    }
  } catch {
    // When running during static build or local Next.js node server
  }
  return null;
}

export async function getCloudflareEnv(): Promise<CloudflareEnv> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env as CloudflareEnv;
  } catch {
    return {
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    };
  }
}
