import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { parseEnv } from "znv";
import { z } from "zod";

// populate process.env with .env file contents
const myEnv = dotenv.config();
// expand nested variables in .env file
dotenvExpand.expand(myEnv);

// define env vars that we want to pull in
export const serverConfigSchema = {
  DATABASE_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  COOKIE_SECRET: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  // hosted domain, localhost or deployed url
  WEB_URL: z
    .string()
    .min(1)
    .transform((s) => (s.endsWith("/") ? s.slice(0, s.length - 1) : s)),
} as const;

// parse env vars from schema
export const serverConfig = parseEnv(process.env, serverConfigSchema);
