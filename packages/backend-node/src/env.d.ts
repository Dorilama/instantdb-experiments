export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      INSTANT_APP_ID: string;
      INSTANT_ADMIN_SECRET: string;
      DEV: string | undefined;
      ADMIN_EMAIL: string;
    }
  }
}
