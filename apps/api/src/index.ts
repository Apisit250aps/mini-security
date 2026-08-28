// Entry point for apps/api
// Ready for Hono application setup

export const serverConfig = {
  port: Number(process.env.PORT) || 4000,
};

console.log(`[api] Server initialized on port ${serverConfig.port}`);
