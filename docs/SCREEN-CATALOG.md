# كتالوج شاشات لوحة المنصة

| Route | الشاشة | Permission | مصدر البيانات | الإجراء الأساسي | حد الأعمال |
|---|---|---|---|---|---|
| `/workspace-applications` | طابور طلبات مساحات العمل | `ManageTenants` | `/api/platform/workspace-applications` | بدء مراجعة / طلب استكمال / اعتماد / رفض | القرار نهائي ومدقق بـ`rowVersion`، ولا تظهر بيانات صحية أو تدريبية. |

كل Route أدناه lazy-loaded ومحمٍ على مستوى الواجهة والخادم. القائمة الجانبية والمساعد
يخفيان ما لا يملكه المستخدم، لكن الـPlatform API هو الحاجز الأمني النهائي.

| Route | الشاشة | Permission | مصدر البيانات | الإجراء الأساسي | حد الأعمال |
|---|---|---|---|---|---|
| `/dashboard` | لوحة المتابعة | `ManagePlatformReports` | `/dashboard` | متابعة المؤشرات والتنبيهات | لا قرار مالي من KPI فقط. |
| `/tenants` | الصالات والمستأجرون | `ManageTenants` | `/tenants` | إنشاء/اعتماد/تعليق/تفعيل/أرشفة | لا حذف لصالة ذات تاريخ. |
| `/subscriptions` | دورات الاشتراك | `ManageTenants` | `/subscriptions` | transition/extend/preview | EndDate غير شامل، Snapshot ثابت. |
| `/plans` | الخطط والأسعار | `ManagePlans` | `/plans` | إنشاء وتعديل قوالب الخطط | لا تعديل Snapshot مفعل. |
| `/features` | كتالوج الميزات | `ManagePlans` | `/features` | تعريف/تعديل/أرشفة | FeatureKey ثابت. |
| `/feature-overrides` | استثناءات الميزات | `ManagePlans` | `/features/tenant-overrides` | فتح/غلق مؤقت لميزة | لا يتجاوز Global Disable أو Tenant Suspend. |
| `/quota-definitions` | حدود الاستخدام | `ManagePlans` | `/features/quota-definitions` | تعريف/تعديل/تعطيل حد | الخادم يفرض Quota وConcurrency. |
| `/feature-dependencies` | اعتماديات الميزات | `ManagePlans` | `/features/dependencies` | إضافة/إزالة علاقة إعداد | لا دوائر أو self-dependency. |
| `/payment-methods` | طرق الدفع | `ManagePaymentRequests` | `/payment-methods` | CRUD طرق الدفع اليدوي | لا تضع أسراراً ظاهرة. |
| `/payment-requests` | طلبات الدفع | `ManagePaymentRequests` | `/payment-requests` | موافقة/رفض سبب | قرار معتمد لا يعدل. |
| `/backups` | النسخ الاحتياطية | `ManagePlatformBackups` | `/backups`, `/batch`, `/batches`, `/restores/capabilities` | تشغيل FullSystem/AllTenants، متابعة artifacts، checksum/manifest، retry آمن | السجلات immutable؛ لا connection material؛ `ManualOnly` لا يضيف زر restore. |
| `/database-resources` | موارد قواعد البيانات | `ManagePlatformBackups` | `/database-resources` | مراجعة حالة الموارد، التخصيص، الصحة ووجود اتصال محمي | يعرض `hasProtectedConnection` كمؤشر Boolean فقط؛ لا يعرض اسم قاعدة البيانات أو أي connection material. |
| `/audit-logs` | سجل المراجعة | `ManagePlatformReports` | `/audit-logs` | بحث وقراءة | immutable؛ لا CRUD. |
| `/invoices` | الفواتير | `ManagePlatformReports` | `/invoices` | بحث وقراءة | تصحيح بعكس مالي جديد. |
| `/administrators` | مدراء المنصة | `ManagePlatformReports` | `/administrators` | إنشاء/تفعيل/تعطيل | أقل صلاحية؛ لا مشاركة حساب. |
| `/roles` | الأدوار والصلاحيات | `ManagePlatformReports` | `/roles` | تحرير permissions | ManagePlatform وصول كامل. |
| `/operations` | Jobs وOutbox | `ManagePlatformReports` | `/operations/jobs`, `/operations/outbox` | متابعة وتشخيص | لا تحذف jobs/outbox. |
| `/reports` | التقارير | `ManagePlatformReports` | `/reports/overview` | قراءة المؤشرات | افتح مصدر البيانات قبل القرار. |
| `/alerts` | التنبيهات | `ManagePlatformReports` | `/alerts` | فرز/متابعة مصدر التنبيه | 500/503 تحتاج Logs وخادم. |
| `/documentation` | المرجع والدليل | `ManagePlatformReports` | محتوى الواجهة الموثق | بحث وفتح شاشة | لا يحل محل تحقق Backend. |

## الأزرار المشتركة

| الزر/النمط | السلوك المتوقع |
|---|---|
| إنشاء/جديد | يفتح Dialog؛ لا ينشئ شيئاً قبل زر حفظ والتحقق. |
| تعديل | يفتح بيانات السجل القابل للتعديل؛ لا يظهر للسجلات المالية/التاريخية. |
| حفظ | يرسل command ويعرض loading ونجاح/فشل. |
| إلغاء | يغلق النموذج ولا يرسل request. |
| تفعيل/تعليق/أرشفة | يطلب تأكيداً، ثم يستدعي lifecycle endpoint مناسب. |
| موافقة/رفض دفع | قرار حساس يراجع المبلغ والمرجع والإثبات ثم يطلب سبباً عند الرفض. |
| تحديث | يعيد القراءة، ولا يغير بيانات الخادم. |
| الترقيم | يطلب page جديدة من الخادم مع حفظ حجم الصفحة. |
| زر أيقونة | يجب أن يحمل Tooltip و`aria-label`. |

## حالات لا يدعمها الـCRUD العام

لا تضف edit/delete إلى الفاتورة، Payment Request المعتمد، Audit Log، Outbox، Job Log
أو Backup Record. هذه سجلات دليل أو مال؛ التصحيح أو الإيقاف يتم بعملية Domain
محددة ومسجلة في Backend.
