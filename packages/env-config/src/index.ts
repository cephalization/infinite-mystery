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
} as const;

// parse env vars from schema
export const serverConfig = parseEnv(process.env, serverConfigSchema);
