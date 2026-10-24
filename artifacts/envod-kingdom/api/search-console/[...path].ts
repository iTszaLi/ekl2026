import express from "express";
import { createSearchConsoleRouter } from "../../server/search-console/router.js";
import { EncryptedVercelBlobSearchConsoleStore } from "../../server/search-console/vercel-blob-store.js";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  "/api/search-console",
  createSearchConsoleRouter({
    apiPrefix: "/api",
    storeFactory: (env) => {
      const blobToken = env.BLOB_READ_WRITE_TOKEN?.trim();
      const encryptionSecret = env.GSC_TOKEN_ENCRYPTION_KEY?.trim();
      if (!blobToken || !encryptionSecret) return null;
      return new EncryptedVercelBlobSearchConsoleStore(
        blobToken,
        encryptionSecret,
      );
    },
  }),
);

app.use((_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.status(404).json({ error: "search_console_route_not_found" });
});

// Express owns body parsing inside the function so the request stream remains
// available to express.json() for the dashboard's small JSON mutations.
export const config = {
  api: { bodyParser: false },
  maxDuration: 120,
};

export default app;
