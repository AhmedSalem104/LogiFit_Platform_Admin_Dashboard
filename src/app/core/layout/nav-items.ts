import { Permission } from '../auth/models/auth.models';

export type NavGroup =
  | 'overview'
  | 'workspace'
  | 'catalog'
  | 'billing'
  | 'data'
  | 'operations'
  | 'governance';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  group: NavGroup;
  permissions: Permission[];
  /** Secondary routes remain available as deep links and from their section hub. */
  visible?: boolean;
  /** Extra Arabic/English terms used by the sidebar search for secondary routes. */
  searchTerms?: string;
}

export const NAV_GROUPS: Record<NavGroup, string> = {
  overview: 'الرؤية والتقارير',
  workspace: 'مساحات العمل',
  catalog: 'الباقات والميزات',
  billing: 'الفوترة والاشتراكات',
  data: 'حماية البيانات',
  operations: 'التشغيل والمراقبة',
  governance: 'الحوكمة والوصول',
};

/**
 * The sidebar exposes section hubs first. The underlying pages are deliberately
 * kept in this list as hidden secondary routes so existing deep links, page
 * titles, permissions, and assistant commands continue to work.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: 'الرئيسية', icon: 'pi pi-chart-bar', route: '/dashboard', group: 'overview', permissions: ['ManagePlatformReports'] },
  { label: 'التقارير', icon: 'pi pi-chart-line', route: '/reports', group: 'overview', permissions: ['ManagePlatformReports'] },

  { label: 'مساحات العمل', icon: 'pi pi-building', route: '/workspace-management', group: 'workspace', permissions: ['ManageTenants'] },
  { label: 'المنشآت الرياضية', icon: 'pi pi-building', route: '/tenants', group: 'workspace', permissions: ['ManageTenants'], visible: false, searchTerms: 'الجيمات المستأجرون المنشآت' },
  { label: 'طلبات مساحات العمل', icon: 'pi pi-verified', route: '/workspace-applications', group: 'workspace', permissions: ['ManageTenants'], visible: false, searchTerms: 'إنشاء جيم مدرب حر مراجعة الطلب' },

  { label: 'الباقات والميزات', icon: 'pi pi-box', route: '/catalog', group: 'catalog', permissions: ['ManagePlans'] },
  { label: 'الباقات', icon: 'pi pi-box', route: '/plans', group: 'catalog', permissions: ['ManagePlans'], visible: false, searchTerms: 'الخطط الأسعار' },
  { label: 'كتالوج الميزات', icon: 'pi pi-star', route: '/features', group: 'catalog', permissions: ['ManagePlans'], visible: false, searchTerms: 'الميزات الكتالوج' },
  { label: 'تجاوزات الميزات', icon: 'pi pi-sliders-h', route: '/feature-overrides', group: 'catalog', permissions: ['ManagePlans'], visible: false, searchTerms: 'استثناءات الميزات tenant overrides' },
  { label: 'تعريفات الحدود', icon: 'pi pi-chart-line', route: '/quota-definitions', group: 'catalog', permissions: ['ManagePlans'], visible: false, searchTerms: 'حدود الاستخدام quota' },
  { label: 'اعتماديات الميزات', icon: 'pi pi-share-alt', route: '/feature-dependencies', group: 'catalog', permissions: ['ManagePlans'], visible: false, searchTerms: 'dependencies' },

  { label: 'الفوترة والاشتراكات', icon: 'pi pi-credit-card', route: '/billing', group: 'billing', permissions: ['ManageTenants', 'ManagePaymentRequests', 'ManagePlatformReports'] },
  { label: 'الاشتراكات', icon: 'pi pi-sync', route: '/subscriptions', group: 'billing', permissions: ['ManageTenants'], visible: false, searchTerms: 'دورات الاشتراك التمديد الإيقاف' },
  { label: 'طرق الدفع', icon: 'pi pi-credit-card', route: '/payment-methods', group: 'billing', permissions: ['ManagePaymentRequests'], visible: false, searchTerms: 'وسائل الدفع' },
  { label: 'طلبات الدفع', icon: 'pi pi-inbox', route: '/payment-requests', group: 'billing', permissions: ['ManagePaymentRequests'], visible: false, searchTerms: 'مراجعة الدفع إثبات الدفع' },
  { label: 'الفواتير', icon: 'pi pi-file', route: '/invoices', group: 'billing', permissions: ['ManagePlatformReports'], visible: false, searchTerms: 'الحسابات المالية' },

  { label: 'حماية البيانات', icon: 'pi pi-shield', route: '/data-protection', group: 'data', permissions: ['ManagePlatformBackups'] },
  { label: 'النسخ الاحتياطية', icon: 'pi pi-database', route: '/backups', group: 'data', permissions: ['ManagePlatformBackups'], visible: false, searchTerms: 'backup restore استعادة' },
  { label: 'موارد قواعد البيانات', icon: 'pi pi-server', route: '/database-resources', group: 'data', permissions: ['ManagePlatformBackups'], visible: false, searchTerms: 'connection pool قاعدة البيانات' },

  { label: 'مركز التشغيل', icon: 'pi pi-cog', route: '/operations-center', group: 'operations', permissions: ['ManagePlatformReports'] },
  { label: 'مراقبة العمليات', icon: 'pi pi-cog', route: '/operations', group: 'operations', permissions: ['ManagePlatformReports'], visible: false, searchTerms: 'jobs outbox مهام' },
  { label: 'مركز التنبيهات', icon: 'pi pi-bell', route: '/alerts', group: 'operations', permissions: ['ManagePlatformReports'], visible: false, searchTerms: 'notifications إشعارات' },

  { label: 'الحوكمة والوصول', icon: 'pi pi-lock', route: '/governance', group: 'governance', permissions: ['ManagePlatformReports'] },
  { label: 'مديرو المنصة', icon: 'pi pi-users', route: '/administrators', group: 'governance', permissions: ['ManagePlatformReports'], visible: false, searchTerms: 'المشرفون الحسابات' },
  { label: 'الأدوار والصلاحيات', icon: 'pi pi-shield', route: '/roles', group: 'governance', permissions: ['ManagePlatformReports'], visible: false, searchTerms: 'permissions roles' },
  { label: 'سجل التدقيق', icon: 'pi pi-history', route: '/audit-logs', group: 'governance', permissions: ['ManagePlatformReports'], visible: false, searchTerms: 'audit سجل المراجعة' },
  { label: 'المرجع والدليل', icon: 'pi pi-book', route: '/documentation', group: 'governance', permissions: ['ManagePlatformReports'], visible: false, searchTerms: 'التوثيق المساعدة' },
];
