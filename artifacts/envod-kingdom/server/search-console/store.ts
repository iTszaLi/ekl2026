import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export interface SearchConsoleStore {
  version: 1;
  refreshToken: string | null;
  selectedProperty: string | null;
  lastSyncedAt: string | null;
  audit: unknown | null;
}

export interface SearchConsoleStorage {
  read(): Promise<SearchConsoleStore>;
  write(value: SearchConsoleStore): Promise<void>;
  clear(): Promise<void>;
}

interface EncryptedEnvelope {
  version: 1;
  iv: string;
  tag: string;
  ciphertext: string;
}

export function emptySearchConsoleStore(): SearchConsoleStore {
  return {
    version: 1,
    refreshToken: null,
    selectedProperty: null,
    lastSyncedAt: null,
    audit: null,
  };
}

function encryptionKey(secret: string): Buffer {
  return createHash("sha256")
    .update("ENVOD KINGDOM Search Console store v1\0")
    .update(secret)
    .digest();
}

function validateStore(value: unknown): SearchConsoleStore {
  if (!value || typeof value !== "object") {
    throw new Error("search_console_store_invalid");
  }
  const store = value as Partial<SearchConsoleStore>;
  if (
    store.version !== 1 ||
    (store.refreshToken !== null && typeof store.refreshToken !== "string") ||
    (store.selectedProperty !== null &&
      typeof store.selectedProperty !== "string") ||
    (store.lastSyncedAt !== null && typeof store.lastSyncedAt !== "string") ||
    !("audit" in store)
  ) {
    throw new Error("search_console_store_invalid");
  }
  return store as SearchConsoleStore;
}

export function encryptSearchConsoleStore(
  value: SearchConsoleStore,
  secret: string,
): string {
  if (secret.length < 32) {
    throw new Error("search_console_store_key_too_short");
  }
  const store = validateStore(value);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(secret), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(store), "utf8"),
    cipher.final(),
  ]);
  const envelope: EncryptedEnvelope = {
    version: 1,
    iv: iv.toString("base64url"),
    tag: cipher.getAuthTag().toString("base64url"),
    ciphertext: ciphertext.toString("base64url"),
  };
  return JSON.stringify(envelope);
}

export function decryptSearchConsoleStore(
  raw: string,
  secret: string,
): SearchConsoleStore {
  if (secret.length < 32) {
    throw new Error("search_console_store_key_too_short");
  }
  try {
    const envelope = JSON.parse(raw) as Partial<EncryptedEnvelope>;
    if (
      envelope.version !== 1 ||
      typeof envelope.iv !== "string" ||
      typeof envelope.tag !== "string" ||
      typeof envelope.ciphertext !== "string"
    ) {
      throw new Error("invalid_envelope");
    }
    const decipher = createDecipheriv(
      "aes-256-gcm",
      encryptionKey(secret),
      Buffer.from(envelope.iv, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(envelope.tag, "base64url"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(envelope.ciphertext, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    return validateStore(JSON.parse(plaintext));
  } catch {
    throw new Error("search_console_store_unreadable");
  }
}

export class EncryptedSearchConsoleStore implements SearchConsoleStorage {
  constructor(
    private readonly filePath: string,
    private readonly secret: string,
  ) {
    if (secret.length < 32) {
      throw new Error("search_console_store_key_too_short");
    }
  }

  async read(): Promise<SearchConsoleStore> {
    let raw: string;
    try {
      raw = await readFile(this.filePath, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return emptySearchConsoleStore();
      }
      throw error;
    }

    return decryptSearchConsoleStore(raw, this.secret);
  }

  async write(value: SearchConsoleStore): Promise<void> {
    const directory = path.dirname(this.filePath);
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const temporaryPath = `${this.filePath}.${process.pid}.${randomBytes(6).toString("hex")}.tmp`;
    await writeFile(temporaryPath, encryptSearchConsoleStore(value, this.secret), {
      encoding: "utf8",
      mode: 0o600,
      flag: "wx",
    });
    await rename(temporaryPath, this.filePath);
  }

  async clear(): Promise<void> {
    await rm(this.filePath, { force: true });
  }
}
