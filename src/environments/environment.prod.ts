export const environment = {
  production: true,
  otpDevelopmentHint: '',
  // Platform API host — the Platform Admin Dashboard talks ONLY to this host.
  platformApiUrl: 'https://logicfit-saas-model.runasp.net',
  // RELATIVE path → the browser calls the same origin (the Vercel domain), and Vercel
  // proxies /api/* to the Platform API server-side via the rewrite in vercel.json.
  // The browser therefore never makes a cross-origin request → NO CORS is required.
  // (Do NOT put an absolute URL here unless the backend adds this domain to CORS
  //  AllowedOrigins — otherwise the browser blocks it with a CORS preflight error.)
  apiUrl: '/api/platform',
  tokenKey: 'logifit_platform_token',
  userKey: 'logifit_platform_user',
  permissionsKey: 'logifit_platform_permissions',
};
