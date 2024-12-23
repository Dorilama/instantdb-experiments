export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      INSTANT_APP_ID: string;
      DEV: string | undefined;
    }
  }
}
