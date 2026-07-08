export const environment = {
  production: true,
  // Platform API host — the Platform Admin Dashboard talks ONLY to this host.
  platformApiUrl: 'https://logicfit-platform.runasp.net',
  // Direct absolute calls in production. This REQUIRES the deployed frontend domain
  // to be added to the backend CORS `AllowedOrigins`.
  // (Alternative with zero CORS: set apiUrl to '/api/platform' and let the host proxy
  //  /api/* to the Platform API — vercel.json is preconfigured for this.)
  apiUrl: 'https://logicfit-platform.runasp.net/api/platform',
  tokenKey: 'logifit_platform_token',
  refreshTokenKey: 'logifit_platform_refresh_token',
  userKey: 'logifit_platform_user',
  permissionsKey: 'logifit_platform_permissions',
};
