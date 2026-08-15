import { NAV_GROUPS, NAV_ITEMS } from './nav-items';

describe('platform navigation consolidation', () => {
  it('exposes section hubs instead of every secondary screen in the default sidebar', () => {
    const visibleRoutes = NAV_ITEMS.filter((item) => item.visible !== false).map((item) => item.route);

    expect(visibleRoutes).toEqual([
      '/dashboard',
      '/reports',
      '/workspace-management',
      '/catalog',
      '/billing',
      '/data-protection',
      '/operations-center',
      '/governance',
    ]);
  });

  it('keeps every existing operational route available as a secondary route', () => {
    const secondaryRoutes = NAV_ITEMS.filter((item) => item.visible === false).map((item) => item.route);

    expect(secondaryRoutes).toEqual(jasmine.arrayContaining([
      '/tenants',
      '/workspace-applications',
      '/plans',
      '/features',
      '/feature-overrides',
      '/quota-definitions',
      '/feature-dependencies',
      '/subscriptions',
      '/payment-methods',
      '/payment-requests',
      '/invoices',
      '/backups',
      '/database-resources',
      '/operations',
      '/alerts',
      '/administrators',
      '/roles',
      '/audit-logs',
      '/documentation',
    ]));
  });

  it('defines a visible Arabic label for every navigation group', () => {
    for (const group of new Set(NAV_ITEMS.map((item) => item.group))) {
      expect(NAV_GROUPS[group]).toBeTruthy();
    }
  });
});
