import { Permission } from '../auth/models/auth.models';

export type NavGroup = 'overview' | 'platform' | 'billing' | 'governance' | 'operations';
export interface NavItem { label: string; icon: string; route: string; group: NavGroup; permissions: Permission[]; }

export const NAV_GROUPS: Record<NavGroup, string> = {
  overview: 'الرؤية والتقارير',
  platform: 'إدارة المنصة',
  billing: 'الاشتراكات والمدفوعات',
  governance: 'الحوكمة والصلاحيات',
  operations: 'التشغيل والمراقبة',
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'الرئيسية', icon: 'pi pi-chart-bar', route: '/dashboard', group: 'overview', permissions: ['ManagePlatformReports'] },
  { label: 'التقارير', icon: 'pi pi-chart-line', route: '/reports', group: 'overview', permissions: ['ManagePlatformReports'] },
  { label: 'المنشآت الرياضية', icon: 'pi pi-building', route: '/tenants', group: 'platform', permissions: ['ManageTenants'] },
  { label: 'طلبات مساحات العمل', icon: 'pi pi-verified', route: '/workspace-applications', group: 'platform', permissions: ['ManageTenants'] },
  { label: 'كتالوج الميزات', icon: 'pi pi-star', route: '/features', group: 'platform', permissions: ['ManagePlans'] },
  { label: 'تجاوزات الميزات', icon: 'pi pi-sliders-h', route: '/feature-overrides', group: 'platform', permissions: ['ManagePlans'] },
  { label: 'تعريفات الحدود', icon: 'pi pi-chart-line', route: '/quota-definitions', group: 'platform', permissions: ['ManagePlans'] },
  { label: 'اعتماديات الميزات', icon: 'pi pi-share-alt', route: '/feature-dependencies', group: 'platform', permissions: ['ManagePlans'] },
  { label: 'الاشتراكات', icon: 'pi pi-sync', route: '/subscriptions', group: 'billing', permissions: ['ManageTenants'] },
  { label: 'الباقات', icon: 'pi pi-box', route: '/plans', group: 'billing', permissions: ['ManagePlans'] },
  { label: 'طرق الدفع', icon: 'pi pi-credit-card', route: '/payment-methods', group: 'billing', permissions: ['ManagePaymentRequests'] },
  { label: 'طلبات الدفع', icon: 'pi pi-inbox', route: '/payment-requests', group: 'billing', permissions: ['ManagePaymentRequests'] },
  { label: 'الفواتير', icon: 'pi pi-file', route: '/invoices', group: 'billing', permissions: ['ManagePlatformReports'] },
  { label: 'مديرو المنصة', icon: 'pi pi-users', route: '/administrators', group: 'governance', permissions: ['ManagePlatformReports'] },
  { label: 'الأدوار والصلاحيات', icon: 'pi pi-shield', route: '/roles', group: 'governance', permissions: ['ManagePlatformReports'] },
  { label: 'سجل التدقيق', icon: 'pi pi-history', route: '/audit-logs', group: 'governance', permissions: ['ManagePlatformReports'] },
  { label: 'المرجع والدليل', icon: 'pi pi-book', route: '/documentation', group: 'governance', permissions: ['ManagePlatformReports'] },
  { label: 'النسخ الاحتياطية', icon: 'pi pi-database', route: '/backups', group: 'operations', permissions: ['ManagePlatformBackups'] },
  { label: 'مراقبة العمليات', icon: 'pi pi-cog', route: '/operations', group: 'operations', permissions: ['ManagePlatformReports'] },
  { label: 'مركز التنبيهات', icon: 'pi pi-bell', route: '/alerts', group: 'operations', permissions: ['ManagePlatformReports'] },
];
