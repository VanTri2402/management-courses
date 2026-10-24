import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().default("postgresql://postgres:postgres@localhost:5432/enterprise_db"),
  DIRECT_URL: z.string().optional(),
  JWT_SECRET: z.string().default("dev-secret-key-32-characters-minimum-enterprise-boilerplate"),
  SMTP_HOST: z.string().default("smtp.mailtrap.io"),
  SMTP_PORT: z.coerce.number().default(2525),
  SMTP_USER: z.string().default("sample_user"),
  SMTP_PASS: z.string().default("sample_pass"),
  SMTP_FROM: z.string().default("Enterprise Core <noreply@enterprise-core.dev>"),
  UPLOAD_DIR: z.string().default("./public/uploads"),
  NEXT_PUBLIC_STORAGE_PROVIDER: z.enum(["local", "s3", "cloudinary"]).default("local"),
  MAINTENANCE_MODE: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
  NEXT_PUBLIC_SITE_NAME: z.string().default("EduCore Academy"),
  EDUTECH_VIDEO_CDN: z.string().default("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample"),
  CERTIFICATE_ISSUER_NAME: z.string().default("EduCore Global Tech Academy"),
  DEFAULT_CURRENCY: z.string().default("VND"),
  ENABLE_FREE_PREVIEW: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.warn("⚠️ Invalid environment variables:", _env.error.format());
}

export const env = _env.success
  ? _env.data
  : {
      NODE_ENV: "development" as const,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/enterprise_db",
      DIRECT_URL: process.env.DIRECT_URL,
      JWT_SECRET: process.env.JWT_SECRET || "dev-secret-key-32-characters-minimum-enterprise-boilerplate",
      SMTP_HOST: process.env.SMTP_HOST || "smtp.mailtrap.io",
      SMTP_PORT: Number(process.env.SMTP_PORT) || 2525,
      SMTP_USER: process.env.SMTP_USER || "sample_user",
      SMTP_PASS: process.env.SMTP_PASS || "sample_pass",
      SMTP_FROM: process.env.SMTP_FROM || "Enterprise Core <noreply@enterprise-core.dev>",
      UPLOAD_DIR: process.env.UPLOAD_DIR || "./public/uploads",
      NEXT_PUBLIC_STORAGE_PROVIDER: (process.env.NEXT_PUBLIC_STORAGE_PROVIDER as any) || "local",
      MAINTENANCE_MODE: process.env.MAINTENANCE_MODE === "true",
      NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || "EduCore Academy",
      EDUTECH_VIDEO_CDN: process.env.EDUTECH_VIDEO_CDN || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample",
      CERTIFICATE_ISSUER_NAME: process.env.CERTIFICATE_ISSUER_NAME || "EduCore Global Tech Academy",
      DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY || "VND",
      ENABLE_FREE_PREVIEW: process.env.ENABLE_FREE_PREVIEW !== "false",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    };
