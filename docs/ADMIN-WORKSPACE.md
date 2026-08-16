# منصة الإدارة: Pagination وعمليات التحكم

## اختصار قائمة لوحة الإدارة

القائمة الجانبية تعرض مراكز عمل مختصرة بدلاً من عرض كل وحدة تشغيلية كعنصر مستقل:

| المركز | المسار | الوحدات التابعة |
|---|---|---|
| مساحات العمل | /workspace-management | /workspace-applications و/tenants |
| الباقات والميزات | /catalog | /plans و/features و/feature-overrides و/quota-definitions و/feature-dependencies |
| الفوترة والاشتراكات | /billing | /subscriptions و/payment-requests و/payment-methods و/invoices |
| حماية البيانات | /data-protection | /backups و/database-resources |
| مركز التشغيل | /operations-center | /operations و/alerts |
| الحوكمة والوصول | /governance | /administrators و/roles و/audit-logs و/documentation |

المراكز لا تستبدل الصفحات أو عقود الـAPI؛ هي طبقة تنقل وتجميع فقط. تبقى المسارات الأصلية
صالحة للروابط المباشرة والمساعد والأذونات، كما يكشف بحث القائمة الوحدات الثانوية عند
البحث عنها. لا تُعتبر رؤية الرابط حماية؛ permissionGuard وPlatform API هما مصدر القرار.

## طابور مراجعة مساحات العمل

- المسار `/workspace-applications` محمي في الواجهة بـ`ManageTenants` ومحمي بالسياسة نفسها في Platform API.
- يعرض قائمة خادمية الصفحات من `GET /api/platform/workspace-applications` مع النوع والحالة وبيانات الاتصال اللازمة للمراجعة فقط.
- إنشاء Gym أو FreelanceCoach من زر **إنشاء مساحة عمل** ينشئ الطلب و`PaymentRequest` المعلّقين، ولا يسجل إثباتًا نيابةً عن المسؤول. بعد نجاح الإنشاء تفتح الشاشة رفع إثبات الدفع تلقائيًا؛ وإذا أنشئت هوية جديدة تظهر بيانات الدخول المؤقتة مرة واحدة أولًا، ثم ينتقل زر **تم الحفظ** إلى رفع الإثبات.
- تبدأ المراجعة ثم يفتح المسؤول إثبات الدفع المحمي وسجل إصداراته، ويتحقق من المبلغ والمرجع، ثم يرفع إصدارًا بديلًا عند الحاجة. لا يُعتمد دفع مساحة عمل بلا إثبات حالي؛ اعتماد الدفع مستقل عن اعتماد المساحة وبدء التجهيز.
- بعد اعتماد الدفع يختار المسؤول اعتماد Workspace أو الرفض، أو يطلب استكمال حقول مسموحة. كل قرار يحمل `rowVersion` ويعتمد على استجابة الخادم المحدثة؛ التعارض يعيد تحميل القائمة بدل تكرار قرار قديم.
- نموذج طلب الاستكمال يملأ حقولًا مسموحة حسب النوع: طلبا Gym وFreelanceCoach يستخدمان حقول payload المشتركة مثل `WorkspaceName` و`BrandName` و`Bio` و`Specialties`، بينما طلبات العضوية تستخدم `FullName`. الواجهة تمنع إرسال أي اسم خارج القائمة، مع بقاء تحقق الـBackend هو الحاجز النهائي.
- لا تعرض الشاشة Payload الطلب الكامل أو أي بيانات صحية أو تدريبية للعملاء. لا توجد عمليات CRUD عامة أو حذف.

## القاعدة المشتركة

كل شاشة تعرض مجموعة بيانات تستخدم `ServerPaginatorComponent` من
`src/app/shared/ui/server-paginator.component.ts`. لا تعتمد الشاشات على تقطيع
مصفوفة محلية بعد تحميل جميع البيانات.

عقد API الموحد هو:

```ts
interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;       // يبدأ من 1
  pageSize: number;   // من 1 إلى 100
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
```

تستخدم جميع جداول الإدارة `page` و`pageSize` وتعرض إجمالي السجلات وتسمح
بتغيير حجم الصفحة إلى 10 أو 20 أو 50 أو 100.

## حدود عمليات التعديل

| المجال | العمليات المسموحة في اللوحة |
|---|---|
| الباقات ووسائل الدفع | إنشاء، تعديل، حذف محمي بقواعد الأعمال |
| كتالوج الميزات | إنشاء، تعديل، أرشفة؛ مفتاح الميزة ثابت بعد الإنشاء |
| اعتماديات الميزات | إضافة وإزالة علاقة إعداد آمنة |
| الحدود والاستثناءات | إنشاء وتعديل/تعطيل زمني؛ لا حذف تاريخي |
| الجيمات والاشتراكات والمشرفون | أوامر دورة حياة، وليست حذفًا مباشرًا |
| طلبات الدفع | موافقة أو رفض فقط |
| الفواتير والتدقيق والنسخ والـOutbox والـJobs والتنبيهات | قراءة/تشغيل آمن فقط؛ لا تعديل أو حذف للسجل |

## مركز النسخ الاحتياطي

- `/backups` يستخدم صلاحية `ManagePlatformBackups` ويظل Platform API هو مصدر scope والعزل.
- يبدأ الوضع الافتراضي من **نسخة مساحة عمل واحدة**: يختار المشغّل Gym أو FreelanceCoach واحدًا
  فقط، مع بحث وBadge للنوع وحالة المورد. ترسل الواجهة `scope=SelectedTenants` ومعرّف Tenant واحدًا
  فقط؛ زر التنفيذ يظل معطلاً إذا لم يكن المورد `Assigned/Allocated`.
- وضع **نسخ المنصة والنظام** منفصل بصريًا عن النسخة الفردية ويحتوي `Platform` و`AllGyms`
  و`AllFreelance` و`AllTenants` و`FullSystem`. لا تخلط الواجهة بين ملف Gym واحد ودفعة جماعية.
- `FullSystem` يطلب من الخادم نسخة مستقلة لقاعدة المنصة ولكل Tenant mapping نشط؛ لا ترسل الواجهة
  connection string أو اسم قاعدة البيانات.
- يعرض batch history والـartifacts وحالتها وحجمها و`SHA-256` وmanifest. الإنشاء وretry يحتاجان
  تأكيدًا باسم المساحة ونوعها، والـretry محصور في `Failed` أو `Partial`.
- يعيد الـBackend مع كل tenant artifact بيانات عرض آمنة فقط: `TenantName` و`WorkspaceIdentifier`
  و`WorkspaceType`. أما Artifact المنصة فيبقى بلا Tenant metadata، ولا تُعرض أي قيمة اتصال أو
  اسم قاعدة بيانات.
- restore capability معلوماتية فقط؛ عندما تكون `ManualOnly` لا تعرض الشاشة mutation. بدء/انتهاء
  الـbatch يسجلان في Audit Log على الخادم.
- حالات الواجهة واضحة ومقصودة: `Ready` يسمح بالإنشاء، و`Action required` يعرض سبب عدم الجاهزية، وسجل الـbatch يوضح progress ونتيجة كل هدف. لا يظهر `Retry` إلا لـ`Failed` أو `Partial`، ولا تُطبع مفاتيح التخزين أو connection material.

## موارد قواعد البيانات

- `/database-resources` تستخدم `ManagePlatformBackups` وتقرأ من `GET /api/platform/database-resources`،
  وتوفر تسجيل مورد جديد من خلال `POST /api/platform/database-resources`.
- تعرض الصفحة `Id` مختصراً، المزود، الحالة، مساحة العمل، آخر فحص صحة، الحجم، إصدار الـschema، ووجود
  اتصال محمي فقط. لا تعرض اسم قاعدة البيانات أو connection string أو قيمة مشفرة.
- زر `تسجيل قاعدة بيانات` يرسل اسمًا وصِفَة المورد وسلسلة الاتصال إلى الخادم عبر TLS؛ الخادم
  يشفر القيمة فورًا ولا يعيدها. بعد الحفظ تختفي القيمة من النموذج ولا توجد edit/delete أو كشف للمادة.
- `Refresh` يعيد قراءة الحالة، مع ترقيم خادمي وحالة Loading/Empty/Error. أي تخصيص أو Migration أو
  health check يتم عبر الـprovisioning saga المحمي، وليس من CRUD عام في المتصفح.

## Issue #248 — طابور إنشاء المساحات

شاشة `/workspace-applications` تعرض Gym بلون أزرق وأيقونة مبنى، وFreelanceCoach بلون بنفسجي
وأيقونة مدرب. الفلاتر تشمل النوع وحالة الطلب والدفع والتجهيز. الأزرار مرتبطة بالعقود التالية:
`start-review`, payment approve/reject, request-information, approve-workspace, reject, و
`retry-provisioning`. يمنع الزر نفسه الضغط المزدوج أثناء الطلب، ويُحدّث الصف من استجابة الخادم
لا من حالة محلية مفترضة. تعرض الشاشة `hasPaymentProof` و`paymentProofVersion`، وتستخدم
`GET/POST /api/platform/payment-requests/{id}/proof*` للمعاينة والتاريخ والرفع؛ الملفات السابقة
تبقى محفوظة ولا تظهر مفاتيح التخزين. لا يظهر زر Dashboard قبل `canAccessDashboard=true`.

## التحقق المحلي

```powershell
npm run build
```

## المساعد التشغيلي الذكي

المساعد موجود داخل `src/app/shared/assistant/` ويظهر في كل صفحة محمية داخل لوحة
المنصة، بما فيها لوحة المتابعة الرئيسية. يفتح من الزر العائم أو من زر الشريط العلوي
أو من الاختصار `Ctrl + K` (`Cmd + K` على macOS).

- يعرض شرحاً سياقياً للشاشة الحالية: الغرض، خطوات العمل، التحذيرات التشغيلية، ومعنى
  أزرارها الرئيسية وأزرار الصفوف والترقيم ذات الصلة.
- يوفّر بحثاً عربياً/إنجليزياً في الصفحات والإجراءات، مثل: `إضافة صالة` أو `مراجعة دفع`
  أو `نسخة احتياطية`.
- لا يعرض صفحة أو إجراءً للمستخدم الذي لا يمتلك صلاحيته. تظل الحماية الفعلية في
  الـBackend؛ إخفاء الإجراء في الواجهة ليس بديلاً عن التحقق من الصلاحيات.
- الإجراءات السريعة لا تنفذ تعديلاً صامتاً: إما تنقل إلى الشاشة، أو تفتح نموذجاً
  موجوداً، أو تطلب التأكيد الموجود مسبقاً (مثل إنشاء نسخة احتياطية).
- لا يستخدم المساعد مفتاح LLM أو يرسل بيانات المنصة إلى جهة خارجية. إضافة محادثة
  توليدية لاحقاً تتطلب API آمن على الخادم، سياسة بيانات، ومفتاحاً في Secret Store فقط.

عند إضافة شاشة إدارية أو زر عملية جديد، يجب إضافة/تحديث دليلها في
`admin-assistant.catalog.ts` وربطه فقط بإجراء آمن وصريح.

## مركز التوثيق داخل اللوحة

المسار `/documentation` محمي بـ`ManagePlatformReports` ويعرض المرجع داخل الواجهة:
المشروع والـFlows والصلاحيات والـAPI والبيانات والتشغيل والتصميم، إضافة إلى دليل كل
شاشة مع رابط مباشر إليها. مصدر التفصيل القابل للمراجعة هو ملفات هذا المجلد وملفات
`LogicFit/docs`؛ عند تغير سلوك أو شاشة، حدّث الاثنين معاً.

يعتمد التحقق الوظيفي على نشر نسخة الـPlatform API التي تحتوي على عقد
الـPagination نفسه، ثم تسجيل الدخول بحساب Platform Owner وتجربة التنقل بين
الصفحات لكل جدول.

## عقد API الكامل

للتأكد من كل endpoint وليس فقط ما يظهر في جدول الشاشات، راجع
[API-ENDPOINT-CATALOG.md](API-ENDPOINT-CATALOG.md). الكتالوج يذكر طريقة الطلب
والمسار والصلاحية والمدخلات والاستجابة لكل عقد في المشروعين، ويُعاد توليده من
Controllers مشروع Backend عند أي تغيير للعقد.
# 2026-08-13 screen contract hardening (Issues #88 and #290)

The `/tenants` create action routes to `/workspace-applications`, the single Gym/FreelanceCoach
creation flow that creates plan, payment, subscription, identity, and retryable provisioning
records together. The lifecycle list remains read/action-oriented.

The Dashboard tenant widget, Tenants list, and Workspace Applications list keep visible loading,
empty, and retry states and tolerate legacy data that previously could turn a list into HTTP 500.
