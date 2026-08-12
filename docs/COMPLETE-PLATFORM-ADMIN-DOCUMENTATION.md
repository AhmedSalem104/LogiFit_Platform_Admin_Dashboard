# LogicFit Platform Admin — التوثيق الكامل للوحة الإدارة

هذا الملف يشرح كل شاشة في لوحة إدارة منصة SaaS، ومن يحق له استخدامها، وما القرار
الذي تساعد عليه، وما الـAPI المرتبط بها، وما الحالات الآمنة والفاشلة. الكتالوج
الكامل لعقود الـAPI موجود في [API-ENDPOINT-CATALOG.md](API-ENDPOINT-CATALOG.md).

## 1. نموذج الوصول

`/auth/login` هو مدخل Platform Owner/Admin. بعد نجاح Platform JWT تطبق الواجهة
`permissionGuard`، ثم يعيد Platform API التحقق من السياسة. لا تستخدم لوحة الإدارة
Tenant JWT ولا تعرض Connection String أو كلمة مرور أو Payment Proof خام.

| Permission | الشاشات |
|---|---|
| `ManagePlatformReports` | Dashboard، Reports، Alerts، Documentation، Audit Logs، Invoices، Administrators، Roles، Operations |
| `ManageTenants` | Tenants، Workspace Applications، Subscriptions |
| `ManagePlans` | Plans، Features، Feature Overrides، Quota Definitions، Feature Dependencies |
| `ManagePaymentRequests` | Payment Methods، Payment Requests |
| `ManagePlatformBackups` | Backups، Database Resources |

## 2. التدفقات الإدارية الرئيسية

### إنشاء Gym أو FreelanceCoach

من `/workspace-applications`: إنشاء الطلب → اختيار النوع → البيانات → الباقة →
الدفع المعلق → بدء المراجعة → اعتماد/رفض الدفع → طلب معلومات عند الحاجة → اعتماد
الطلب → provisioning → owner credentials لمرة واحدة → متابعة حالة الدخول.

### إدارة Tenant

`/tenants` للعرض والإنشاء، ثم أوامر approve/activate/suspend/archive/restore/delete
المسموحة حسب حالة الخادم. لا يعتبر `Active` دليلًا على جاهزية قاعدة البيانات ما لم
تظهر حالة `databaseStatus=Ready` و`canAccessDashboard=true`.

### النسخ وقواعد البيانات

`/database-resources` يعرض Pool والحالة والـhealth ووجود اتصال محمي فقط. التسجيل،
الإصلاح، migrations، backup، وتغيير الحالة أوامر خادمية مؤمنة. `/backups` ينشئ Batch
بالنطاق الذي يحدده الخادم، يعرض artifacts والبصمة والـmanifest، ويعيد محاولة الأهداف
الفاشلة فقط.

## 3. جرد كل شاشات اللوحة

<!-- GENERATED ROUTES START -->
| Route | Guard / permission source | Component source | Purpose and benefit | Primary API family |
|---|---|---|---|---|
| `/administrators` | `permissionGuard('ManagePlatformReports')` | `./features/administrators/administrators.component` | Role-scoped LogicFit workspace screen. | `See the generated API endpoint catalog for the component service.` |
| `/alerts` | `permissionGuard('ManagePlatformReports')` | `./features/alerts/alerts.component` | Monitoring, communication, reporting, or governance. | `See the generated API endpoint catalog for the component service.` |
| `/audit-logs` | `permissionGuard('ManagePlatformReports')` | `./features/audit-logs/audit-logs.component` | Monitoring, communication, reporting, or governance. | `See the generated API endpoint catalog for the component service.` |
| `/backups` | `permissionGuard('ManagePlatformBackups')` | `./features/backups/backups.component` | Role-scoped LogicFit workspace screen. | `/api/platform/backups and /api/platform/database-resources` |
| `/dashboard` | `permissionGuard('ManagePlatformReports')` | `./features/dashboard/dashboard.component` | Live indicators and the next operational decision. | `/api/reports and dashboard endpoints` |
| `/database-resources` | `permissionGuard('ManagePlatformBackups')` | `./features/database-resources/database-resources.component` | Role-scoped LogicFit workspace screen. | `/api/platform/backups and /api/platform/database-resources` |
| `/documentation` | `permissionGuard('ManagePlatformReports')` | `./features/documentation/documentation.component` | Role-scoped LogicFit workspace screen. | `See the generated API endpoint catalog for the component service.` |
| `/feature-dependencies` | `permissionGuard('ManagePlans')` | `./features/feature-dependencies/feature-dependencies.component` | Role-scoped LogicFit workspace screen. | `/api/platform/plans and /api/platform/features` |
| `/feature-overrides` | `permissionGuard('ManagePlans')` | `./features/feature-overrides/feature-overrides.component` | Role-scoped LogicFit workspace screen. | `/api/platform/plans and /api/platform/features` |
| `/features` | `permissionGuard('ManagePlans')` | `./features/features/features.component` | Role-scoped LogicFit workspace screen. | `/api/platform/plans and /api/platform/features` |
| `/invoices` | `permissionGuard('ManagePlatformReports')` | `./features/invoices/invoices.component` | Commercial, billing, finance, or payroll operations. | `/api/subscriptions, /api/payments, /api/invoices, finance endpoints` |
| `/operations` | `permissionGuard('ManagePlatformReports')` | `./features/operations/operations.component` | Monitoring, communication, reporting, or governance. | `See the generated API endpoint catalog for the component service.` |
| `/payment-methods` | `permissionGuard('ManagePaymentRequests')` | `./features/payment-methods/payment-methods.component` | Commercial, billing, finance, or payroll operations. | `/api/subscriptions, /api/payments, /api/invoices, finance endpoints` |
| `/payment-requests` | `permissionGuard('ManagePaymentRequests')` | `./features/payment-requests/payment-requests.component` | Commercial, billing, finance, or payroll operations. | `/api/subscriptions, /api/payments, /api/invoices, finance endpoints` |
| `/plans` | `permissionGuard('ManagePlans')` | `./features/plans/plans.component` | Role-scoped LogicFit workspace screen. | `/api/platform/plans and /api/platform/features` |
| `/quota-definitions` | `permissionGuard('ManagePlans')` | `./features/quota-definitions/quota-definitions.component` | Role-scoped LogicFit workspace screen. | `/api/platform/plans and /api/platform/features` |
| `/reports` | `permissionGuard('ManagePlatformReports')` | `./features/reports/reports.component` | Monitoring, communication, reporting, or governance. | `/api/reports and dashboard endpoints` |
| `/roles` | `permissionGuard('ManagePlatformReports')` | `./features/roles/roles.component` | Role-scoped LogicFit workspace screen. | `See the generated API endpoint catalog for the component service.` |
| `/subscriptions` | `permissionGuard('ManageTenants')` | `./features/subscriptions/subscriptions.component` | Commercial, billing, finance, or payroll operations. | `/api/subscriptions, /api/payments, /api/invoices, finance endpoints` |
| `/tenants` | `permissionGuard('ManageTenants')` | `./features/tenants/tenants.component` | Workspace profile, lifecycle, or personal settings. | `See the generated API endpoint catalog for the component service.` |
| `/workspace-applications` | `permissionGuard('ManageTenants')` | `./features/workspace-applications/workspace-applications.component` | Workspace creation, membership, or activation workflow. | `/api/identity, /api/workspace-applications, /api/workspace-invites` |
<!-- GENERATED ROUTES END -->

## 4. قواعد كل مجموعة

| المجموعة | الشاشات | الفائدة |
|---|---|---|
| المتابعة | Dashboard، Reports، Alerts، Documentation | رؤية المؤشرات واتخاذ قرار سريع دون تعديل صامت |
| المساحات | Tenants، Workspace Applications، Subscriptions | إدارة دورة حياة العميل ومساحته واشتراكه |
| SaaS product | Plans، Features، Overrides، Quotas، Dependencies | تحويل الباقات إلى قواعد تشغيل قابلة للفحص |
| الدفع | Payment Methods، Payment Requests، Invoices | اعتماد مالي قابل للتدقيق دون تعديل تاريخي |
| الحماية والتشغيل | Backups، Database Resources، Operations | استمرارية النظام ومراقبة jobs وresources |
| الحوكمة | Administrators، Roles، Audit Logs | أقل صلاحية، سجل قرارات، وعدم مشاركة الحسابات |

## 5. عقد الشاشة المشترك

- كل جدول يستخدم server-side pagination: `items`, `totalCount`, `page`, `pageSize`,
  `totalPages`, `hasPreviousPage`, `hasNextPage`.
- كل شاشة لها Loading، Empty، Error، وBlocked state؛ لا تعرض خطأ تقنيًا أو صفحة فارغة.
- كل Mutation حساس يطلب Confirmation، يعرض loading، يمنع النقر المكرر، ويعيد قراءة
  الحالة بعد النجاح أو التعارض.
- القرارات الحساسة تحمل RowVersion/Idempotency عند تعريفها في العقد.
- السجلات المالية والتدقيق والـBackup والـJobs/Outbox immutable وليست CRUD عامًا.

## 6. API mapping والردود

كل شاشة في جدول Routes لها عائلة API أساسية، لكن المصدر التفصيلي لكل endpoint هو
الكتالوج المولد. لكل سجل في الكتالوج ستجد:

1. Method وRoute وAction.
2. JWT/Policy أو Anonymous.
3. Body/Query/Path inputs وDTO fields.
4. Success response type وschema و`204` عند عدم وجود body.
5. `400/401/403/404/409/429/500` ومعنى كل فشل.
6. أهمية العملية وفائدتها والآثار الجانبية وقواعد إعادة المحاولة.

## 7. حالات التشغيل الخاصة

| الحالة | ما يظهر للمشغّل | ما لا يجب فعله |
|---|---|---|
| Backup disabled/unhealthy | Action required وسبب عدم الجاهزية | لا تعلن النسخة مكتملة ولا تكرر الطلب عشوائيًا |
| Resource reserved/provisioning | حالة انتظار وتفاصيل آمنة | لا تسجل نفس المورد أو تعيد mapping يدويًا |
| Payment pending | أزرار مراجعة وإثبات فقط | لا تعتمد الطلب قبل قرار الدفع |
| Provisioning failed | سبب مختصر وRetry إذا سمح الخادم | لا تنشئ Tenant/Subscription جديدة |
| 409 concurrency | إعادة تحميل الصف/القائمة | لا تعيد القرار القديم |
| 401/403 | انتهاء جلسة أو منع صلاحية | لا تحاول تجاوز الحارس بتغيير الرابط |

## 8. مساعد التشغيل

المساعد داخل اللوحة يشرح الشاشة ويقترح الانتقال أو فتح نموذج قائم. لا ينفذ Mutation
صامتًا ولا يرسل بيانات المنصة إلى LLM خارجي. كل command سريع يظل محكومًا بالصلاحية
وتأكيد الشاشة نفسها.

## 9. الاختبار والتسليم

- Login بحساب Platform مصرح، ثم اختبار كل permission بمستخدم لا يملكها.
- إنشاء Gym وFreelance، المراجعة، اعتماد/رفض الدفع، طلب معلومات، الاعتماد، Retry.
- اختبار Pool: Available/Reserved/Provisioning/Assigned ومنع الحجز المكرر.
- اختبار Backup readiness، إنشاء Batch، checksum، download، partial/failure/retry.
- اختبار كل زر مرتين بسرعة، والتأكد من عدم تكرار الطلب أو Audit event.
- Build ثم Health Check ثم Smoke على الـAPI والواجهة المنشورة.

## 10. صيانة التوثيق

مصدر الشاشات هو `src/app/app.routes.ts` ومصدر عقود API هو Controllers في Backend.
شغّل:

```powershell
cd ..\LogicFit
.\Scripts\Export-ApiEndpointCatalog.ps1
.\Scripts\Export-FrontendRouteDocumentation.ps1
```

لا تعتبر نسخة docs أو commit أو push دليلًا على Production deployment؛ يجب تسجيل
كل مرحلة منفصلة في Issue وPR.
