/**
 * CONFIG LOADER: runs once, the rest of the framework imports the result.
 *
 *   import { env, routes } from '../config/environments';
 *   env.automationexercise.web.baseURL       → 'https://automationexercise.com'
 *   routes.automationexercise.web.loginPath  → '/login'
 *
 * Flow:  .env → pick ENV → read config/environments/<ENV>.json + config/routes.json → check → export
 * Anything wrong (ENV=dve, a missing baseURL, a path without '/') stops the run HERE,
 * with the exact field in the error, before any test starts.
 *
 * The ONLY place dotenv is loaded.
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { DOTENV_FILE, ENVIRONMENTS_DIR, ROUTES_FILE, envFile } from './paths';

// ─────────────────────────────────────────────────────────────────────────────
// PART 1: WHAT VALID CONFIG LOOKS LIKE (zod schemas = descriptions, nothing runs yet)
// ─────────────────────────────────────────────────────────────────────────────

// One service: { "baseURL": "https://..." }
const ServiceSchema = z.object({ baseURL: z.url() });

// config/environments/<env>.json: any app name → { web: service, api: service }
const EnvSchema = z.record(z.string(), z.object({ web: ServiceSchema, api: ServiceSchema }));

// config/routes.json: any app name → { web: { anyName: '/path' }, api: { anyName: '/path' } }
const PathSchema = z.string().startsWith('/');
const RoutesSchema = z.record(
  z.string(),
  z.object({
    web: z.record(z.string(), PathSchema),
    api: z.record(z.string(), PathSchema),
  }),
);

// Reads a JSON file. Result is `unknown` on purpose: not trusted until zod checks it.
const readJson = (file: string): unknown => JSON.parse(fs.readFileSync(file, 'utf-8'));

// ─────────────────────────────────────────────────────────────────────────────
// PART 2: WHICH ENVIRONMENT?
// ─────────────────────────────────────────────────────────────────────────────

// .env → process.env (ENV=dev + secrets). Never overwrites real env vars, so CI wins.
dotenv.config({ path: DOTENV_FILE, quiet: true });

// Valid names = the files in config/environments/ → ['dev']. Add pre.json → 'pre' is valid.
const names = fs
  .readdirSync(ENVIRONMENTS_DIR)
  .filter((file) => file.endsWith('.json'))
  .map((file) => path.basename(file, '.json'));

// ENV must be one of those names. Not set → 'dev' (never prod).
const ProcessEnvSchema = z.object({ ENV: z.enum(names).default('dev') });
export const { ENV } = ProcessEnvSchema.parse(process.env);

// ─────────────────────────────────────────────────────────────────────────────
// PART 3: LOAD + CHECK + SHARE (parse = check the real data against the description)
// ─────────────────────────────────────────────────────────────────────────────

export const env = EnvSchema.parse(readJson(envFile(ENV)));
export const routes = RoutesSchema.parse(readJson(ROUTES_FILE));
