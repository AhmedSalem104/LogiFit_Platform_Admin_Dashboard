# كتالوج شاشات لوحة المنصة

| Route | الشاشة | Permission | مصدر البيانات | الإجراء الأساسي | حد الأعمال |
|---|---|---|---|---|---|
| `/workspace-applications` | طابور طلبات مساحات العمل | `ManageTenants` | `/api/platform/workspace-applications` | فلترة الطلب/الدفع/المساحة/الاشتراك/التجهيز، بدء مراجعة / طلب استكمال / اعتماد / رفض | القرار نهائي ومدقق بـ`rowVersion`، ولا تظهر بيانات صحية أو تدريبية. |

كل Route أدناه lazy-loaded ومحمٍ على مستوى الواجهة والخادم. القائمة الجانبية والمساعد
يخفيان ما لا يملكه المستخدم، لكن الـPlatform API هو الحاجز الأمني النهائي.

| Route | الشاشة | Permission | مصدر البيانات | الإجراء الأساسي | حد الأعمال |
|---|---|---|---|---|---|
| `/dashboard` | لوحة المتابعة | `ManagePlatformReports` | `/dashboard`, `/dashboard/tenants` | متابعة المؤشرات والتنبيهات وقائمة الجيمات الموجزة | لا قرار مالي من KPI فقط؛ فشل قائمة الجيمات يظهر مستقلاً مع إعادة محاولة. |
| `/tenants` | الصالات والمستأجرون | `ManageTenants` | `/tenants` | إنشاء/اعتماد/تعليق/تفعيل/أرشفة | لا حذف لصالة ذات تاريخ. |
| `/subscriptions` | دورات الاشتراك | `ManageTenants` | `/subscriptions` | فلترة كل الحالات، transition/extend/preview | EndDate غير شامل، Snapshot ثابت؛ تأكيد وحاجز mutation للإيقاف والتمديد. |
| `/plans` | الخطط والأسعار | `ManagePlans` | `/plans` | إنشاء وتعديل قوالب الخطط | لا تعديل Snapshot مفعل. |
| `/features` | كتالوج الميزات | `ManagePlans` | `/features` | تعريف/تعديل/أرشفة | FeatureKey ثابت. |
| `/feature-overrides` | استثناءات الميزات | `ManagePlans` | `/features/tenant-overrides` | فتح/غلق مؤقت لميزة | لا يتجاوز Global Disable أو Tenant Suspend. |
| `/quota-definitions` | حدود الاستخدام | `ManagePlans` | `/features/quota-definitions` | تعريف/تعديل/تعطيل حد | الخادم يفرض Quota وConcurrency. |
| `/feature-dependencies` | اعتماديات الميزات | `ManagePlans` | `/features/dependencies` | إضافة/إزالة علاقة إعداد | لا دوائر أو self-dependency. |
| `/payment-methods` | طرق الدفع | `ManagePaymentRequests` | `/payment-methods` | CRUD طرق الدفع اليدوي | لا تضع أسراراً ظاهرة. |
| `/payment-requests` | طلبات الدفع | `ManagePaymentRequests` | `/payment-requests` | موافقة/رفض سبب | قرار معتمد لا يعدل. |
| `/backups` | النسخ الاحتياطية | `ManagePlatformBackups` | `/backups`, `/batch`, `/batches`, `/restores/capabilities` | تشغيل FullSystem/AllTenants، متابعة artifacts، checksum/manifest، retry آمن | السجلات immutable؛ لا connection material؛ `ManualOnly` لا يضيف زر restore. |
| `/database-resources` | موارد قواعد البيانات | `ManagePlatformBackups` | `GET/POST /api/platform/database-resources` | مراجعة Pool وتسجيل مورد مشفر، مع عرض الحالة والصحة والتخصيص | لا تعرض connection string أو اسم قاعدة البيانات أو القيمة المشفرة؛ التسجيل write-once من الخادم ويعرض `hasProtectedConnection` فقط. |
| `/audit-logs` | سجل المراجعة | `ManagePlatformReports` | `/audit-logs` | بحث وقراءة | immutable؛ لا CRUD. |
| `/invoices` | الفواتير | `ManagePlatformReports` | `/invoices` | بحث وقراءة | تصحيح بعكس مالي جديد. |
| `/administrators` | مدراء المنصة | `ManagePlatformReports` | `/administrators` | إنشاء/تفعيل/تعطيل | أقل صلاحية؛ لا مشاركة حساب. |
| `/roles` | الأدوار والصلاحيات | `ManagePlatformReports` | `/roles` | تحرير permissions | ManagePlatform وصول كامل. |
| `/operations` | Jobs وOutbox | `ManagePlatformReports` | `/operations/jobs`, `/operations/outbox` | متابعة وتشخيص | لا تحذف jobs/outbox. |

### عقد التفاعل مع شاشة النسخ الاحتياطية

تبدأ شاشة `/backups` دفعة نسخ يحددها الخادم فقط بعد إعلان الخدمة حالة `Ready` وبعد تأكيد المشغّل للنطاق المختار. تدعم النطاقات `Platform` و`SelectedTenants` و`AllGyms` و`AllFreelance` و`AllTenants` و`FullSystem`؛ وتحمّل المساحات المحددة كأسماء آمنة ولا ترسل إلا معرّفاتها. تميز الشاشة حالات التحميل وعدم الإتاحة والفراغ والاكتمال الجزئي والفشل والاكتمال؛ وتعرض حالة كل هدف وحجمه وبصمة SHA-256 وتوفر البيان وإجراءات التنزيل المحمية. تمنع أقفال التأكيد والتنفيذ ومفتاح idempotency اليدوي النقرات المكررة. تتاح إعادة المحاولة لدفعات `Failed` أو `Partial` فقط وبنطاق الأهداف الذي يحدده الخادم. ولا تعرض الشاشة سلسلة اتصال أو اسم قاعدة بيانات أو مسار تخزين أو بيانات اعتماد للمزود.

تدعم شاشة `/database-resources` فلاتر دورة الحياة ومعرّف مساحة العمل من الخادم. أرقام الملخص مرتبطة بالصفحة الحالية لأن الجدول يستخدم الترقيم. يتاح `إصلاح` للصفوف `Available` و`Allocated` و`Failed` و`Disabled`؛ ويتحقق الخادم من القيمة البديلة ويحميها ويحدّث الربط المخصص داخل معاملة. لا تعرض الواجهة القيمة المحمية أو بيانات تعريف قاعدة البيانات.
| `/reports` | التقارير | `ManagePlatformReports` | `/reports/overview`, `/reports/catalog` | قراءة المؤشرات والكتالوج، إعادة محاولة المصدر الفاشل، طباعة/CSV | فشل مصدر لا يخفي نجاح المصدر الآخر؛ افتح المصدر قبل القرار. |
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
## Issue #287 — Mutation safety

`/tenants` lifecycle actions, database-resource migrations/backups/status actions, and destructive actions in `/plans`, `/payment-methods`, and `/feature-dependencies` disable repeated clicks while their API mutation is pending. The same guard covers feature archiving, platform-administrator status changes, payment approval/rejection, role-permission saving, workspace-application approval/rejection/provisioning, and workspace creation. Notifications guard single/all read mutations, while dashboard refresh ignores a second request during an active load. The UI resets the state on cancel, success, or error and keeps the existing confirmation dialogs.
# دليل الكتالوج الكامل

المرجع الموسع الذي يجمع كل Routes والشاشات والتدفقات وعقود الـAPI هو
[COMPLETE-PLATFORM-ADMIN-DOCUMENTATION.md](COMPLETE-PLATFORM-ADMIN-DOCUMENTATION.md).
هذا الملف يحتفظ بالكتالوج التشغيلي المختصر، ويجب تحديث الاثنين عند إضافة شاشة أو
تغيير صلاحية أو Action.
