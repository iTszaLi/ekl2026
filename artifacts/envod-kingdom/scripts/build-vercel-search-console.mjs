import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

await build({
  entryPoints: [
    path.join(packageRoot, "server/search-console/vercel-function.ts"),
  ],
  outfile: path.join(packageRoot, "api/search-console/[...path].js"),
  bundle: true,
  packages: "external",
  platform: "node",
  format: "esm",
  target: "node20",
  sourcemap: false,
  tsconfig: path.join(packageRoot, "tsconfig.json"),
});
