import { NAV_GROUPS, NAV_ITEMS } from './nav-items';

describe('platform navigation consolidation', () => {
  it('exposes every registered permitted resource as a direct sidebar link', () => {
    const visibleRoutes = NAV_ITEMS.filter((item) => item.visible !== false).map((item) => item.route);

    expect(visibleRoutes).toEqual(NAV_ITEMS.map((item) => item.route));
  });

  it('keeps every existing operational route in the grouped navigation registry', () => {
    const registeredRoutes = NAV_ITEMS.map((item) => item.route);

    expect(registeredRoutes).toEqual(jasmine.arrayContaining([
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

  it('keeps a label and icon on every direct link', () => {
    for (const item of NAV_ITEMS) {
      expect(item.label).toBeTruthy();
      expect(item.icon).toMatch(/^pi pi-/);
    }
  });
});
