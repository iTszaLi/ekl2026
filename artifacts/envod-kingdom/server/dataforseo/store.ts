import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";

/**
 * Small JSON document store for DataForSEO results, history, usage ledger and
 * tracking configuration. Production uses the project's existing **private**
 * Vercel Blob store; local development uses a git-ignored directory.
 * No credentials are ever written to this store.
 */
export interface JsonStore {
  readonly kind: "vercel-blob" | "local-file" | "memory";
  read<T>(key: string): Promise<T | null>;
  write(key: string, value: unknown): Promise<void>;
}

const KEY_PATTERN = /^[a-z0-9][a-z0-9/_.-]{0,200}\.json$/;

function assertKey(key: string): void {
  if (!KEY_PATTERN.test(key) || key.includes("..")) {
    throw new Error("dataforseo_store_invalid_key");
  }
}

export const STORE_PREFIX = "envod-private/dataforseo";

interface BlobOperations {
  get: typeof get;
  put: typeof put;
}

export class VercelBlobJsonStore implements JsonStore {
  readonly kind = "vercel-blob" as const;

  constructor(
    private readonly token: string,
    private readonly blob: BlobOperations = { get, put },
  ) {
    if (!token.trim()) throw new Error("dataforseo_blob_token_missing");
  }

  async read<T>(key: string): Promise<T | null> {
    assertKey(key);
    const result = await this.blob.get(`${STORE_PREFIX}/${key}`, {
      access: "private",
      token: this.token,
      useCache: false,
    });
    if (!result) return null;
    if (result.statusCode !== 200 || !result.stream) {
      throw new Error("dataforseo_blob_read_failed");
    }
    const raw = await new Response(result.stream).text();
    return JSON.parse(raw) as T;
  }

  async write(key: string, value: unknown): Promise<void> {
    assertKey(key);
    await this.blob.put(`${STORE_PREFIX}/${key}`, JSON.stringify(value), {
      access: "private",
      token: this.token,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
  }
}

export class LocalFileJsonStore implements JsonStore {
  readonly kind = "local-file" as const;

  constructor(private readonly directory: string) {}

  private filePath(key: string): string {
    assertKey(key);
    return path.join(this.directory, ...key.split("/"));
  }

  async read<T>(key: string): Promise<T | null> {
    try {
      return JSON.parse(await readFile(this.filePath(key), "utf8")) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  }

  async write(key: string, value: unknown): Promise<void> {
    const target = this.filePath(key);
    await mkdir(path.dirname(target), { recursive: true });
    const temporary = `${target}.${process.pid}.tmp`;
    await writeFile(temporary, JSON.stringify(value), { encoding: "utf8", mode: 0o600 });
    await rename(temporary, target);
  }
}

export class MemoryJsonStore implements JsonStore {
  readonly kind = "memory" as const;
  readonly documents = new Map<string, string>();

  async read<T>(key: string): Promise<T | null> {
    assertKey(key);
    const value = this.documents.get(key);
    return value === undefined ? null : (JSON.parse(value) as T);
  }

  async write(key: string, value: unknown): Promise<void> {
    assertKey(key);
    this.documents.set(key, JSON.stringify(value));
  }
}
