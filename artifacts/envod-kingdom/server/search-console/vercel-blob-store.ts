import { del, get, put } from "@vercel/blob";
import {
  decryptSearchConsoleStore,
  emptySearchConsoleStore,
  encryptSearchConsoleStore,
  type SearchConsoleStorage,
  type SearchConsoleStore,
} from "./store.js";

const STORE_PATH = "envod-private/search-console/connection-v1.enc";

interface BlobOperations {
  get: typeof get;
  put: typeof put;
  del: typeof del;
}

const defaultBlobOperations: BlobOperations = { get, put, del };

/**
 * Stores only the OAuth refresh token, selected Search Console property,
 * sync timestamp, and the latest crawl report. The payload is encrypted before
 * it reaches the private Blob store; reads bypass the CDN cache so overwrites
 * are consistent across serverless instances.
 */
export class EncryptedVercelBlobSearchConsoleStore implements SearchConsoleStorage {
  constructor(
    private readonly token: string,
    private readonly encryptionSecret: string,
    private readonly blob: BlobOperations = defaultBlobOperations,
  ) {
    if (!token.trim()) throw new Error("search_console_blob_token_missing");
    if (encryptionSecret.trim().length < 32) {
      throw new Error("search_console_store_key_too_short");
    }
  }

  async read(): Promise<SearchConsoleStore> {
    const result = await this.blob.get(STORE_PATH, {
      access: "private",
      token: this.token,
      useCache: false,
    });
    if (!result) return emptySearchConsoleStore();
    if (result.statusCode !== 200 || !result.stream) {
      throw new Error("search_console_blob_read_failed");
    }
    const raw = await new Response(result.stream).text();
    return decryptSearchConsoleStore(raw, this.encryptionSecret);
  }

  async write(value: SearchConsoleStore): Promise<void> {
    const encrypted = encryptSearchConsoleStore(value, this.encryptionSecret);
    await this.blob.put(STORE_PATH, encrypted, {
      access: "private",
      token: this.token,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
  }

  async clear(): Promise<void> {
    const current = await this.blob.get(STORE_PATH, {
      access: "private",
      token: this.token,
      useCache: false,
    });
    if (!current) return;
    await current.stream?.cancel();
    await this.blob.del(STORE_PATH, { token: this.token });
  }
}
