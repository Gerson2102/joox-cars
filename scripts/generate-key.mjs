// A strong random secret for CMS_ADMIN_KEY, the key in the secret link that unlocks /admin
// (see src/proxy.ts). Run: node scripts/generate-key.mjs
import { randomBytes } from "node:crypto";

console.log(randomBytes(24).toString("base64url"));
