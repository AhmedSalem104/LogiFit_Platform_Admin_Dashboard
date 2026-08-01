export const environment = {
  production: false,
  otpDevelopmentHint: 'وضع التطوير فقط: استخدم الكود 1234',
  // Platform API host — the Platform Admin Dashboard talks ONLY to this host.
  // (The gym/Tenant app uses a different host: https://logicfit.runasp.net — not used here.)
  platformApiUrl: 'https://logicfit-saas-model.runasp.net',
  // In DEV we call through a relative path proxied by proxy.conf.json → the browser
  // never makes a cross-origin request, so no CORS whitelist is needed locally.
  apiUrl: '/api/platform',
  tokenKey: 'logifit_platform_token',
  userKey: 'logifit_platform_user',
  permissionsKey: 'logifit_platform_permissions',
};
