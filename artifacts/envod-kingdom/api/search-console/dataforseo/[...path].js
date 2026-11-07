// Vercel's [...path].js one level up only matches a single path segment, so the
// DataForSEO dashboard routes need their own entry files. Same function, same app.
export { default, config } from "../[...path].js";
