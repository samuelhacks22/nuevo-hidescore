// Declarations for built server artifacts to satisfy TypeScript when importing
declare module "../dist/server/app.js" {
  export function createApp(): Promise<{ app: import("express").Express }>;
}
