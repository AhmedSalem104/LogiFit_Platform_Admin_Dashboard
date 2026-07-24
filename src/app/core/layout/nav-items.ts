import { Permission } from '../auth/models/auth.models';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  /** User needs ANY of these permissions to see the item. */
  permissions: Permission[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'الرئيسية', icon: 'pi pi-chart-bar', route: '/dashboard', permissions: ['ManagePlatformReports'] },
  { label: 'الجيمات', icon: 'pi pi-building', route: '/tenants', permissions: ['ManageTenants'] },
  { label: 'الاشتراكات', icon: 'pi pi-sync', route: '/subscriptions', permissions: ['ManageTenants'] },
  { label: 'الباقات', icon: 'pi pi-box', route: '/plans', permissions: ['ManagePlans'] },
  { label: 'الميزات', icon: 'pi pi-star', route: '/features', permissions: ['ManagePlans'] },
  { label: 'طرق الدفع', icon: 'pi pi-credit-card', route: '/payment-methods', permissions: ['ManagePaymentRequests'] },
  { label: 'طلبات الدفع', icon: 'pi pi-inbox', route: '/payment-requests', permissions: ['ManagePaymentRequests'] },
  { label: 'النسخ الاحتياطي', icon: 'pi pi-database', route: '/backups', permissions: ['ManagePlatformBackups'] },
  { label: 'Feature Overrides', icon: 'pi pi-sliders-h', route: '/feature-overrides', permissions: ['ManagePlans'] },
  { label: 'Quota Definitions', icon: 'pi pi-chart-line', route: '/quota-definitions', permissions: ['ManagePlans'] },
  { label: 'Feature Dependencies', icon: 'pi pi-share-alt', route: '/feature-dependencies', permissions: ['ManagePlans'] },
];
