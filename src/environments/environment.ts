export const environment = {
  production: false,
  // Platform API host — the Platform Admin Dashboard talks ONLY to this host.
  // (The gym/Tenant app uses a different host: https://logicfit.runasp.net — not used here.)
  platformApiUrl: 'https://logicfit-saas.runasp.net',
  // In DEV we call through a relative path proxied by proxy.conf.json → the browser
  // never makes a cross-origin request, so no CORS whitelist is needed locally.
  apiUrl: '/api/platform',
  tokenKey: 'logifit_platform_token',
  refreshTokenKey: 'logifit_platform_refresh_token',
  userKey: 'logifit_platform_user',
  permissionsKey: 'logifit_platform_permissions',
};
