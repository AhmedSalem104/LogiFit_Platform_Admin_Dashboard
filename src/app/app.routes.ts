import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';
import { permissionGuard } from './core/auth/guards/permission.guard';
import type { AdminHubDefinition } from './shared/ui/admin-section-hub.component';

const SECTION_HUBS = {
  workspace: {
    title: 'مساحات العمل',
    subtitle: 'إنشاء ومراجعة ومتابعة كل مساحات Gym وFreelanceCoach من مكان واحد',
    description: 'استخدم طلبات مساحات العمل للتدفق الموحد، أو افتح قائمة المساحات الحالية لإجراءات دورة الحياة. لا يتم حذف أي وظيفة؛ كل وحدة تشغيلية ما زالت متاحة من هنا أو من البحث.',
    icon: 'pi pi-building',
    cards: [
      { label: 'طلبات مساحات العمل', description: 'إنشاء ومراجعة وقبول ورفض وتجهيز مساحات Gym والمدرب الحر.', icon: 'pi pi-verified', route: '/workspace-applications', permissions: ['ManageTenants'] },
      { label: 'المنشآت الرياضية', description: 'متابعة المساحات الحالية وإجراءات التفعيل والتعليق والأرشفة.', icon: 'pi pi-building', route: '/tenants', permissions: ['ManageTenants'] },
    ],
  },
  catalog: {
    title: 'الباقات والميزات',
    subtitle: 'إدارة ما تقدمه المنصة وحدود استخدام كل باقة',
    description: 'تجميع إعدادات الباقات وكتالوج الميزات والحدود والاعتماديات في مركز واحد مع إبقاء كل قاعدة أعمال في شاشتها المتخصصة.',
    icon: 'pi pi-box',
    cards: [
      { label: 'الباقات', description: 'إنشاء وتعديل أسعار الباقات ودوراتها وحدودها.', icon: 'pi pi-box', route: '/plans', permissions: ['ManagePlans'] },
      { label: 'كتالوج الميزات', description: 'تعريف الميزات التي يمكن تفعيلها للمساحات.', icon: 'pi pi-star', route: '/features', permissions: ['ManagePlans'] },
      { label: 'تجاوزات الميزات', description: 'استثناءات مؤقتة لميزة أو حد لمساحة محددة.', icon: 'pi pi-sliders-h', route: '/feature-overrides', permissions: ['ManagePlans'] },
      { label: 'تعريفات الحدود', description: 'ضبط Quotas وحدود الاستخدام التي يفرضها الخادم.', icon: 'pi pi-chart-line', route: '/quota-definitions', permissions: ['ManagePlans'] },
      { label: 'اعتماديات الميزات', description: 'مراجعة علاقات الاعتماد بين الميزات ومنع الدوائر.', icon: 'pi pi-share-alt', route: '/feature-dependencies', permissions: ['ManagePlans'] },
    ],
  },
  billing: {
    title: 'الفوترة والاشتراكات',
    subtitle: 'متابعة الاشتراكات وطلبات الدفع والفواتير وطرق التحصيل',
    description: 'تظهر العمليات المالية في مركز واحد، بينما تظل طلبات الدفع والفواتير والاشتراكات كيانات مستقلة بسجلاتها وقواعدها غير القابلة للخلط.',
    icon: 'pi pi-credit-card',
    cards: [
      { label: 'الاشتراكات', description: 'متابعة الحالة والمدة والتمديد والإيقاف والمعاينة.', icon: 'pi pi-sync', route: '/subscriptions', permissions: ['ManageTenants'] },
      { label: 'طلبات الدفع', description: 'مراجعة الإثباتات واعتماد أو رفض الدفع بسبب واضح.', icon: 'pi pi-inbox', route: '/payment-requests', permissions: ['ManagePaymentRequests'] },
      { label: 'طرق الدفع', description: 'إدارة طرق التحصيل اليدوي المتاحة للمشتركين.', icon: 'pi pi-credit-card', route: '/payment-methods', permissions: ['ManagePaymentRequests'] },
      { label: 'الفواتير', description: 'قراءة السجل المالي والفواتير دون تعديل تاريخي مباشر.', icon: 'pi pi-file', route: '/invoices', permissions: ['ManagePlatformReports'] },
    ],
  },
  data: {
    title: 'حماية البيانات',
    subtitle: 'النسخ الاحتياطية ومورد قواعد البيانات في مساحة تشغيل واحدة',
    description: 'ابدأ النسخ الاحتياطي من مركز النسخ، وراجع Pool قواعد البيانات وحالتها من الموردات. تبقى connection material مشفرة ولا تظهر في الواجهة.',
    icon: 'pi pi-shield',
    cards: [
      { label: 'النسخ الاحتياطية', description: 'تشغيل الدفعات ومتابعة artifacts وchecksum وretry والاستعادة المتاحة.', icon: 'pi pi-database', route: '/backups', permissions: ['ManagePlatformBackups'] },
      { label: 'موارد قواعد البيانات', description: 'تسجيل واختبار وإصلاح ومراقبة موارد الـPool دون كشف الاتصال.', icon: 'pi pi-server', route: '/database-resources', permissions: ['ManagePlatformBackups'] },
    ],
  },
  operations: {
    title: 'مركز التشغيل',
    subtitle: 'مراقبة Jobs وOutbox والتنبيهات من نقطة متابعة واحدة',
    description: 'استخدم مراقبة العمليات للتشخيص، ومركز التنبيهات للمتابعة والتعامل مع الإشعارات. الشاشات الأصلية ما زالت منفصلة لأن لكل منها مصدر بيانات مختلف.',
    icon: 'pi pi-cog',
    cards: [
      { label: 'مراقبة العمليات', description: 'قراءة Jobs وOutbox واكتشاف الفشل والمحاولات.', icon: 'pi pi-cog', route: '/operations', permissions: ['ManagePlatformReports'] },
      { label: 'مركز التنبيهات', description: 'عرض التنبيهات وترتيبها وتعليمها كمقروءة.', icon: 'pi pi-bell', route: '/alerts', permissions: ['ManagePlatformReports'] },
    ],
  },
  governance: {
    title: 'الحوكمة والوصول',
    subtitle: 'حسابات مشرفي المنصة والأدوار وسجل التدقيق والمرجع',
    description: 'كل وظائف الوصول والمراجعة في مركز واحد مع الحفاظ على سجل التدقيق للقراءة فقط والتوثيق كمرجع تشغيلي.',
    icon: 'pi pi-lock',
    cards: [
      { label: 'مديرو المنصة', description: 'إنشاء حسابات فريق الإدارة وتفعيلها أو تعطيلها.', icon: 'pi pi-users', route: '/administrators', permissions: ['ManagePlatformReports'] },
      { label: 'الأدوار والصلاحيات', description: 'إدارة الأدوار والـpermissions المسموحة لكل مشرف.', icon: 'pi pi-shield', route: '/roles', permissions: ['ManagePlatformReports'] },
      { label: 'سجل التدقيق', description: 'قراءة الأحداث الحساسة وسجل قرارات التشغيل دون تعديل.', icon: 'pi pi-history', route: '/audit-logs', permissions: ['ManagePlatformReports'] },
      { label: 'المرجع والدليل', description: 'شرح التدفقات والشاشات وعقود الـAPI داخل اللوحة.', icon: 'pi pi-book', route: '/documentation', permissions: ['ManagePlatformReports'] },
    ],
  },
} satisfies Record<string, AdminHubDefinition>;

export const routes: Routes = [
  // Public login
  {
    path: 'auth/login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },

  // Authenticated shell
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: 'workspace-management',
        canActivate: [permissionGuard('ManageTenants')],
        data: { hub: SECTION_HUBS.workspace },
        loadComponent: () => import('./shared/ui/admin-section-hub.component').then((m) => m.AdminSectionHubComponent),
      },
      {
        path: 'catalog',
        canActivate: [permissionGuard('ManagePlans')],
        data: { hub: SECTION_HUBS.catalog },
        loadComponent: () => import('./shared/ui/admin-section-hub.component').then((m) => m.AdminSectionHubComponent),
      },
      {
        path: 'billing',
        canActivate: [permissionGuard('ManageTenants', 'ManagePaymentRequests', 'ManagePlatformReports')],
        data: { hub: SECTION_HUBS.billing },
        loadComponent: () => import('./shared/ui/admin-section-hub.component').then((m) => m.AdminSectionHubComponent),
      },
      {
        path: 'data-protection',
        canActivate: [permissionGuard('ManagePlatformBackups')],
        data: { hub: SECTION_HUBS.data },
        loadComponent: () => import('./shared/ui/admin-section-hub.component').then((m) => m.AdminSectionHubComponent),
      },
      {
        path: 'operations-center',
        canActivate: [permissionGuard('ManagePlatformReports')],
        data: { hub: SECTION_HUBS.operations },
        loadComponent: () => import('./shared/ui/admin-section-hub.component').then((m) => m.AdminSectionHubComponent),
      },
      {
        path: 'governance',
        canActivate: [permissionGuard('ManagePlatformReports')],
        data: { hub: SECTION_HUBS.governance },
        loadComponent: () => import('./shared/ui/admin-section-hub.component').then((m) => m.AdminSectionHubComponent),
      },
      {
        path: 'dashboard',
        canActivate: [permissionGuard('ManagePlatformReports')],
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'tenants',
        canActivate: [permissionGuard('ManageTenants')],
        loadComponent: () =>
          import('./features/tenants/tenants.component').then((m) => m.TenantsComponent),
      },
      {
        path: 'workspace-applications',
        canActivate: [permissionGuard('ManageTenants')],
        loadComponent: () =>
          import('./features/workspace-applications/workspace-applications.component').then((m) => m.WorkspaceApplicationsComponent),
      },
      {
        path: 'subscriptions',
        canActivate: [permissionGuard('ManageTenants')],
        loadComponent: () =>
          import('./features/subscriptions/subscriptions.component').then((m) => m.SubscriptionsComponent),
      },
      {
        path: 'plans',
        canActivate: [permissionGuard('ManagePlans')],
        loadComponent: () =>
          import('./features/plans/plans.component').then((m) => m.PlansComponent),
      },
      {
        path: 'features',
        canActivate: [permissionGuard('ManagePlans')],
        loadComponent: () =>
          import('./features/features/features.component').then((m) => m.FeaturesComponent),
      },
      { path: 'feature-overrides', canActivate: [permissionGuard('ManagePlans')], loadComponent: () => import('./features/feature-overrides/feature-overrides.component').then(m => m.FeatureOverridesComponent) },
      { path: 'quota-definitions', canActivate: [permissionGuard('ManagePlans')], loadComponent: () => import('./features/quota-definitions/quota-definitions.component').then(m => m.QuotaDefinitionsComponent) },
      { path: 'feature-dependencies', canActivate: [permissionGuard('ManagePlans')], loadComponent: () => import('./features/feature-dependencies/feature-dependencies.component').then(m => m.FeatureDependenciesComponent) },
      {
        path: 'payment-methods',
        canActivate: [permissionGuard('ManagePaymentRequests')],
        loadComponent: () =>
          import('./features/payment-methods/payment-methods.component').then((m) => m.PaymentMethodsComponent),
      },
      {
        path: 'payment-requests',
        canActivate: [permissionGuard('ManagePaymentRequests')],
        loadComponent: () =>
          import('./features/payment-requests/payment-requests.component').then((m) => m.PaymentRequestsComponent),
      },
      {
        path: 'backups',
        canActivate: [permissionGuard('ManagePlatformBackups')],
        loadComponent: () => import('./features/backups/backups.component').then((m) => m.BackupsComponent),
      },
      {
        path: 'database-resources',
        canActivate: [permissionGuard('ManagePlatformBackups')],
        loadComponent: () => import('./features/database-resources/database-resources.component').then((m) => m.DatabaseResourcesComponent),
      },
      { path: 'audit-logs', canActivate: [permissionGuard('ManagePlatformReports')], loadComponent: () => import('./features/audit-logs/audit-logs.component').then((m) => m.AuditLogsComponent) },
      { path: 'invoices', canActivate: [permissionGuard('ManagePlatformReports')], loadComponent: () => import('./features/invoices/invoices.component').then((m) => m.InvoicesComponent) },
      { path: 'administrators', canActivate: [permissionGuard('ManagePlatformReports')], loadComponent: () => import('./features/administrators/administrators.component').then((m) => m.AdministratorsComponent) },
      { path: 'roles', canActivate: [permissionGuard('ManagePlatformReports')], loadComponent: () => import('./features/roles/roles.component').then((m) => m.RolesComponent) },
      { path: 'operations', canActivate: [permissionGuard('ManagePlatformReports')], loadComponent: () => import('./features/operations/operations.component').then((m) => m.OperationsComponent) },
      { path: 'reports', canActivate: [permissionGuard('ManagePlatformReports')], loadComponent: () => import('./features/reports/reports.component').then((m) => m.ReportsComponent) },
      { path: 'alerts', canActivate: [permissionGuard('ManagePlatformReports')], loadComponent: () => import('./features/alerts/alerts.component').then((m) => m.AlertsComponent) },
      { path: 'documentation', canActivate: [permissionGuard('ManagePlatformReports')], loadComponent: () => import('./features/documentation/documentation.component').then((m) => m.DocumentationComponent) },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },

  { path: '**', redirectTo: 'auth/login' },
];
