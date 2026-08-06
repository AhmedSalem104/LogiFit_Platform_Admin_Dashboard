import { Permission, Permissions } from '../../core/auth/models/auth.models';

export type AssistantActionKind = 'navigate' | 'invoke' | 'refresh';

export interface AssistantAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  keywords: string[];
  route: string;
  permissions: Permission[];
  kind?: AssistantActionKind;
  invoke?: string;
  danger?: boolean;
}

export interface AssistantButtonHint {
  label: string;
  description: string;
}

export interface AssistantGuide {
  route: string;
  title: string;
  summary: string;
  icon: string;
  permissions: Permission[];
  keywords: string[];
  overview: string;
  steps: string[];
  warnings: string[];
  buttons: AssistantButtonHint[];
  quickActions: AssistantAction[];
}

const platform: Permission[] = [Permissions.ManagePlatformReports];
const tenants: Permission[] = [Permissions.ManageTenants];
const plans: Permission[] = [Permissions.ManagePlans];
const payments: Permission[] = [Permissions.ManagePaymentRequests];
const backups: Permission[] = [Permissions.ManagePlatformBackups];

const refresh = (route: string, permissions: Permission[], title = 'تحديث البيانات'): AssistantAction => ({
  id: `refresh:${route}`,
  title,
  description: 'إعادة تحميل بيانات الشاشة الحالية من الخادم.',
  icon: 'pi pi-refresh',
  keywords: ['تحديث', 'اعادة تحميل', 'رفرش', 'refresh'],
  route,
  permissions,
  kind: 'refresh',
});

export const ADMIN_ASSISTANT_GUIDES: AssistantGuide[] = [
  {
    route: '/dashboard', title: 'لوحة المتابعة العالمية', icon: 'pi pi-chart-line', permissions: platform,
    summary: 'صورة تنفيذية حية لصحة المنصة والاشتراكات والمدفوعات والبنية التشغيلية.',
    keywords: ['الرئيسية', 'الرئيسيه', 'داش بورد', 'احصائيات', 'ملخص', 'صحة النظام', 'database pool', 'provisioning'],
    overview: 'ابدأ من هنا لتحديد الأولويات: راقب KPIs وتوزيع الجيمات وضغط التشغيل، ثم انتقل إلى السجل المصدر. البيانات تأتي من Platform API وتتحدث تلقائياً كل 60 ثانية عند تفعيل الخيار؛ لا تتخذ قراراً مالياً من رقم مجرد.',
    steps: ['راجع البطاقات التي تحمل حالة تحذير أو قيمة غير معتادة.', 'اقرأ توزيع حالات الجيمات ومؤشر الاعتمادية قبل تحديد الأولوية.', 'افتح مركز العمليات أو طلبات الدفع أو موارد قواعد البيانات لمراجعة السجل المصدر.', 'استخدم نطاق المؤشرات والبحث للوصول إلى البيانات المطلوبة دون التنقل اليدوي.'],
    warnings: ['المؤشرات والرسوم للتوجيه وليست بديلاً عن سجل المراجعة أو الفاتورة.', 'الرسوم تعرض توزيعاً وضغطاً حاليين؛ لا تمثل تاريخاً زمنياً غير موجود في عقد API.', 'كل الأوقات التي يعرضها النظام مبنية على UTC في الخادم ثم تُنسّق للعرض.'],
    buttons: [{ label: 'مركز العمليات', description: 'يفتح Jobs وOutbox وعمليات التهيئة لمتابعة الحالات.' }, { label: 'موارد قواعد البيانات', description: 'يفتح الحالة والتخصيص ووجود الاتصال المحمي دون عرض مادة اتصال.' }, { label: 'تحديث', description: 'يعيد قراءة المؤشرات من الخادم دون تعديل بيانات.' }],
    quickActions: [
      { id: 'open-alerts', title: 'مراجعة التنبيهات', description: 'افتح مركز التنبيهات والحالات التي تحتاج اهتماماً.', icon: 'pi pi-bell', keywords: ['تنبيهات', 'اخطاء', 'مشاكل'], route: '/alerts', permissions: platform },
      { id: 'open-payments', title: 'مراجعة طلبات الدفع', description: 'انتقل إلى طلبات الدفع المعلقة للمراجعة.', icon: 'pi pi-wallet', keywords: ['مدفوعات', 'دفع', 'معلق'], route: '/payment-requests', permissions: payments },
      { id: 'open-operations-from-dashboard', title: 'مركز العمليات', description: 'راجع Jobs وOutbox وProvisioning المرتبط بالمؤشرات.', icon: 'pi pi-cog', keywords: ['operations', 'jobs', 'outbox', 'تهيئة'], route: '/operations', permissions: platform },
      { id: 'open-database-resources-from-dashboard', title: 'موارد قواعد البيانات', description: 'افتح حالة الموارد وMappings بدون عرض connection material.', icon: 'pi pi-server', keywords: ['database', 'resources', 'mapping'], route: '/database-resources', permissions: backups },
      refresh('/dashboard', platform),
    ],
  },
  {
    route: '/tenants', title: 'إدارة الصالات والمستأجرين', icon: 'pi pi-building', permissions: tenants,
    summary: 'إنشاء الصالات ومتابعة حالتها وتفعيلها أو تعليقها من خلال دورة حياة واضحة.',
    keywords: ['صالات', 'جيم', 'gym', 'مستأجر', 'تينانت', 'عميل جديد', 'ايقاف صاله'],
    overview: 'كل صالة كيان مستقل ومعزول. استخدم إجراءات الحالة بدلاً من الحذف؛ فهي تحفظ الأثر التاريخي والاشتراك والبيانات المرتبطة.',
    steps: ['ابحث باسم الصالة أو النطاق قبل إنشاء سجل جديد لمنع التكرار.', 'أنشئ الصالة ثم راجع بيانات المالك وخطة الاشتراك.', 'علّق الصالة فقط عند وجود سبب تشغيلي أو إداري موثق.', 'استخدم التفعيل بعد التأكد من استيفاء شروط الوصول.'],
    warnings: ['لا يوجد حذف مباشر للصالات لحماية بيانات العملاء والتاريخ المالي.', 'إيقاف الصالة يمنع الوصول ولا يغير مدة الاشتراك تلقائياً.'],
    buttons: [{ label: 'إضافة صالة', description: 'يفتح نموذج إنشاء صالة جديدة.' }, { label: 'اعتماد', description: 'يعتمد الصالة بعد مراجعة بياناتها.' }, { label: 'تعليق / تفعيل', description: 'يغير حالة الصالة مع حفظ الأثر التشغيلي.' }, { label: 'أرشفة', description: 'تنهي الإتاحة التشغيلية مع حفظ تاريخ الصالة.' }, { label: 'الترقيم', description: 'ينقل بين صفحات الخادم ولا يحمل كل الصالات دفعة واحدة.' }],
    quickActions: [
      { id: 'create-tenant', title: 'إضافة صالة جديدة', description: 'افتح نموذج إنشاء مستأجر/صالة.', icon: 'pi pi-plus', keywords: ['انشاء جيم', 'اضافة جيم', 'صاله جديده', 'عميل جديد'], route: '/tenants', permissions: tenants, kind: 'invoke', invoke: 'create-tenant' },
      { id: 'open-subscriptions-from-tenants', title: 'متابعة اشتراكات الصالات', description: 'انتقل إلى دورات اشتراك جميع الصالات.', icon: 'pi pi-calendar', keywords: ['اشتراك صالة', 'انتهاء اشتراك'], route: '/subscriptions', permissions: tenants },
      refresh('/tenants', tenants),
    ],
  },
  {
    route: '/workspace-applications', title: 'طلبات مساحات العمل', icon: 'pi pi-verified', permissions: tenants,
    summary: 'مراجعة طلبات إنشاء مساحة مدرب حر وطلبات انضمام المدربين والمساعدين والعملاء قبل منح أي وصول تشغيلي.',
    keywords: ['طلبات', 'مدرب حر', 'freelance', 'اعتماد', 'موافقة', 'رفض', 'استكمال بيانات', 'مساحة عمل'],
    overview: 'اعرض الطلب ثم ابدأ المراجعة. لا تظهر في هذه الصفحة بيانات صحية أو تدريبية. كل قرار يخضع لحالة الطلب وrowVersion في الخادم؛ لا يملك المساعد تنفيذ قرار تلقائيًا.',
    steps: ['ابدأ المراجعة لطلب مقدم.', 'راجع بيانات الاتصال والمعرّف أو الدور فقط.', 'اطلب الحقول المسموح بها عند النقص، أو اتخذ قرار الاعتماد أو الرفض بعد التحقق.', 'راجع حالة الصف المحدثة وسجل التدقيق عند ظهور تعارض أو فشل.'],
    warnings: ['الرفض قرار نهائي للطلب الحالي؛ إعادة التقديم تكون بطلب جديد.', 'لا تطلب أو تعرض بيانات العملاء الصحية أو التدريبية.', 'نجاح الموافقة لا يتجاوز حدود الباقة؛ قد يعيد الخادم تعارضًا أو حدًا للباقة.'],
    buttons: [{ label: 'بدء المراجعة', description: 'ينقل الطلب المقدم إلى قيد المراجعة.' }, { label: 'طلب استكمال', description: 'يرسل رسالة وحقولًا مسموحة فقط إلى مقدم الطلب.' }, { label: 'موافقة / رفض', description: 'قرار نهائي موثق في الخادم ولا ينفذه المساعد تلقائيًا.' }, { label: 'تحديث', description: 'يعيد قراءة قائمة الطلبات من الخادم.' }],
    quickActions: [refresh('/workspace-applications', tenants)],
  },
  {
    route: '/subscriptions', title: 'دورات الاشتراكات', icon: 'pi pi-calendar', permissions: tenants,
    summary: 'متابعة حالة ومدة كل اشتراك، مع تنفيذ الإجراءات المسموح بها عبر دورة حياة الاشتراك.',
    keywords: ['اشتراك', 'انتهاء', 'تجديد', 'تمديد', 'تعليق', 'upgrade', 'renew', 'grace'],
    overview: 'هذه الشاشة لسجل الدورة الفعلي وليست لتعديل الفاتورة. الترقية والتجديد والتمديد والتعليق تظل عمليات مسجلة تحفظ Snapshot الأسعار والميزات وقت التفعيل.',
    steps: ['حدد الصالة والاشتراك المقصود من البحث أو الفلاتر.', 'راجع الحالة وتاريخ النهاية قبل أي إجراء.', 'نفذ الإجراء المسموح فقط من أزرار السجل.', 'راجع الفاتورة وطلب الدفع عند وجود أثر مالي.'],
    warnings: ['اشتراك Expired لا يمنح الميزات المدفوعة إلا بقرار إداري مؤقت ومسجل.', 'Suspend يمنع الوصول ولا يوقف احتساب أيام الاشتراك.'],
    buttons: [{ label: 'انتقال الحالة', description: 'يقبل فقط الانتقالات المسموح بها من الـBackend.' }, { label: 'تجديد', description: 'يبدأ من تاريخ النهاية الحالية عند التجديد قبل الانتهاء.' }, { label: 'تمديد', description: 'يضيف أياماً دون إنشاء دورة جديدة.' }, { label: 'معاينة الترقية', description: 'تعرض فرق السعر قبل اعتماد قرار الترقية.' }, { label: 'الترقيم', description: 'ينتقل بين دورات الاشتراك المخزنة على الخادم.' }],
    quickActions: [
      { id: 'open-payment-requests-from-subscriptions', title: 'فتح طلبات الدفع', description: 'راجع إثبات الدفع قبل تفعيل أو تجديد الاشتراك.', icon: 'pi pi-wallet', keywords: ['دفع اشتراك', 'اثبات دفع', 'موافقة'], route: '/payment-requests', permissions: payments },
      { id: 'open-invoices-from-subscriptions', title: 'فتح الفواتير', description: 'راجع الأثر المالي المرقم للاشتراكات.', icon: 'pi pi-file', keywords: ['فاتوره', 'فواتير اشتراك'], route: '/invoices', permissions: platform },
      refresh('/subscriptions', tenants),
    ],
  },
  {
    route: '/plans', title: 'الخطط والأسعار', icon: 'pi pi-verified', permissions: plans,
    summary: 'تصميم خطط الاشتراك ومددها وأسعارها وحدودها وميزاتها المتاحة.',
    keywords: ['خطة', 'باقات', 'سعر', 'شهري', 'سنوي', '6 شهور', 'اشتراكات'],
    overview: 'الخطة قالب تجاري. التعديل عليها يخص التفعيلات المستقبلية؛ الاشتراكات المفعلة تحتفظ بنسخة غير قابلة للتعديل من السعر والمدة والميزات والحدود.',
    steps: ['أنشئ الخطة باسم واضح وحدد مدتها وسعرها وعملتها.', 'اربط الميزات والحدود المناسبة للخطة.', 'راجع أنها صالحة قبل إتاحتها للإدارة.', 'استخدم دورة الحياة بدلاً من حذف خطة مستخدمة.'],
    warnings: ['لا تعدّل السجلات المالية المعتمدة لتصحيح سعر؛ استخدم عملية عكسية جديدة.', 'خفض الخطة يطبق مع دورة التجديد التالية، وليس فوراً.'],
    buttons: [{ label: 'إضافة خطة', description: 'ينشئ قالب خطة جديداً.' }, { label: 'تعديل', description: 'يعدل قالب الخطة للإتاحة المستقبلية، لا Snapshot قائم.' }, { label: 'تعطيل / حذف', description: 'يخضع لقواعد الخادم ولا يزيل خطة مستخدمة تاريخياً.' }, { label: 'الميزات', description: 'يفتح كتالوج الميزات وربطها بالخطط.' }, { label: 'الترقيم', description: 'يعرض صفحة واحدة من الخطط في كل مرة.' }],
    quickActions: [
      { id: 'create-plan', title: 'إنشاء خطة جديدة', description: 'افتح نموذج خطة وتسعير جديدين.', icon: 'pi pi-plus', keywords: ['اضافة خطة', 'انشاء باقة', 'سعر جديد'], route: '/plans', permissions: plans, kind: 'invoke', invoke: 'create-plan' },
      { id: 'open-features-from-plans', title: 'إدارة ميزات الخطط', description: 'افتح كتالوج الميزات وأهلية الخطط.', icon: 'pi pi-th-large', keywords: ['خصائص الخطة', 'features'], route: '/features', permissions: plans },
      refresh('/plans', plans),
    ],
  },
  {
    route: '/features', title: 'كتالوج الميزات', icon: 'pi pi-th-large', permissions: plans,
    summary: 'تعريف ميزات المنتج الثابتة وربطها بالخطط والحدود ودورات الحياة.',
    keywords: ['ميزة', 'خاصية', 'feature', 'تعطيل عام', 'global disable', 'كاتالوج'],
    overview: 'إضافة Feature هنا لا تنشئ وظيفة برمجية. يجب أن تكون الوظيفة مطورة ومحميّة في Backend وFrontend بنفس FeatureKey الثابت قبل إتاحتها تجارياً.',
    steps: ['عرّف FeatureKey ثابتاً ووصفاً عربياً وإنجليزياً ووحدة المنتج.', 'حدد هل الميزة مدفوعة وهل تدعم Quota.', 'اربطها بالخطط المناسبة.', 'استخدم الأرشفة بدلاً من الحذف للحفاظ على التاريخ.'],
    warnings: ['FeatureKey لا يتغير بعد الإنشاء لأنه عقد حماية بين الواجهة والخادم.', 'Global Disable يتقدم على أي خطة أو Override أو منحة مؤقتة.'],
    buttons: [{ label: 'إضافة ميزة', description: 'يفتح نموذج تعريف ميزة جديدة.' }, { label: 'تعديل', description: 'يعدل الاسم والحالة والوحدة التجارية؛ لا يغير FeatureKey.' }, { label: 'أرشفة', description: 'توقف الإتاحة الجديدة مع بقاء التاريخ محفوظاً.' }, { label: 'الترقيم', description: 'ينقل بين صفحات كتالوج الميزات.' }],
    quickActions: [
      { id: 'create-feature', title: 'تعريف ميزة جديدة', description: 'افتح نموذج FeatureKey والبيانات التجارية.', icon: 'pi pi-plus', keywords: ['اضافة خاصية', 'انشاء ميزة'], route: '/features', permissions: plans, kind: 'invoke', invoke: 'create-feature' },
      { id: 'open-feature-overrides', title: 'فتح استثناءات الصالات', description: 'افتح أو أغلق ميزة لصالة محددة بسبب وتاريخ.', icon: 'pi pi-sliders-h', keywords: ['استثناء ميزة', 'فتح ميزة لصالة', 'override'], route: '/feature-overrides', permissions: plans },
      refresh('/features', plans),
    ],
  },
  {
    route: '/feature-overrides', title: 'استثناءات ميزات الصالات', icon: 'pi pi-sliders-h', permissions: plans,
    summary: 'فتح أو غلق ميزة لصالة بعينها ضمن سبب ومدة ومسؤول واضحين.',
    keywords: ['استثناء', 'اوفر رايد', 'فتح ميزة', 'غلق ميزة', 'temporary grant'],
    overview: 'الاستثناء قرار مؤقت ومراجع. ترتيب الحسم هو: Global Disable ثم حالة الاشتراك ثم Tenant Override ثم Plan Feature ثم Default Deny.',
    steps: ['اختر الصالة والميزة المقصودة.', 'سجل سبباً تشغيلياً واضحاً وحدد بداية ونهاية عند الحاجة.', 'راجع أثر القرار على الاشتراك الحالي.', 'اترك السجل التاريخي كما هو بدلاً من حذفه.'],
    warnings: ['المنحة المؤقتة لا تتجاوز Global Disable أو إيقاف الصالة.', 'الاشتراك المنتهي لا يحصل على ميزة مدفوعة إلا بقرار مؤقت مسجل.'],
    buttons: [{ label: 'إضافة استثناء', description: 'يفتح نموذج فتح أو غلق ميزة لصالة.' }, { label: 'تعديل الاستثناء', description: 'يحدث قراراً قائماً مع بقاء تاريخ المراجعة.' }, { label: 'تاريخ الاستثناء', description: 'يبين السبب والمنفذ وفترة السريان.' }, { label: 'الترقيم', description: 'ينتقل بين سجلات الاستثناء على الخادم.' }],
    quickActions: [
      { id: 'create-feature-override', title: 'إضافة استثناء ميزة', description: 'افتح نموذج استثناء لصالة محددة.', icon: 'pi pi-plus', keywords: ['افتح خاصية', 'اقفل خاصية', 'استثناء جديد'], route: '/feature-overrides', permissions: plans, kind: 'invoke', invoke: 'create-feature-override' },
      { id: 'open-features-from-overrides', title: 'فتح كتالوج الميزات', description: 'راجع تعريف الميزة وحالتها العامة.', icon: 'pi pi-th-large', keywords: ['تعريف ميزة'], route: '/features', permissions: plans },
      refresh('/feature-overrides', plans),
    ],
  },
  {
    route: '/quota-definitions', title: 'حدود الاستخدام', icon: 'pi pi-gauge', permissions: plans,
    summary: 'تعريف حدود الميزات القابلة للقياس ومراجعة تطبيقها ضمن الخطط.',
    keywords: ['حدود', 'كوتا', 'quota', 'سقف استخدام', 'members limit'],
    overview: 'الـQuota تحمي سعة كل خطة. يعتمد الحجز والتحقق على المعاملات وConcurrency في الخادم، ولا يجب تجاوزها بمنطق الواجهة فقط.',
    steps: ['اختر ميزة تدعم الحدود.', 'حدد نوع القياس وقيمة الحد.', 'اعتمد التعريف ثم اربطه بالخطط المناسبة.', 'راجع الاستهلاك من تقارير التشغيل عند الحاجة.'],
    warnings: ['حجوزات الـQuota لها مدة انتهاء وتتحرر تلقائياً عند فشل العملية.', 'تعطيل تعريف الحد لا يغير Snapshot الاشتراكات المفعلة تاريخياً.'],
    buttons: [{ label: 'إضافة حد', description: 'ينشئ تعريف حد مرتبطاً بميزة.' }, { label: 'تعديل الحد', description: 'يحدث تعريف الاستخدام للخطة/الميزة المستقبلية.' }, { label: 'تعطيل الحد', description: 'يوقف استخدامه المستقبلي مع بقاء التاريخ.' }, { label: 'الترقيم', description: 'يعرض صفحة محدودة من تعريفات الحدود.' }],
    quickActions: [
      { id: 'create-quota', title: 'تعريف حد استخدام', description: 'افتح نموذج حد جديد لميزة قابلة للقياس.', icon: 'pi pi-plus', keywords: ['اضافة كوتا', 'حد جديد'], route: '/quota-definitions', permissions: plans, kind: 'invoke', invoke: 'create-quota' },
      { id: 'open-features-from-quota', title: 'اختيار ميزة', description: 'افتح كتالوج الميزات لمراجعة دعم الـQuota.', icon: 'pi pi-th-large', keywords: ['ميزة كوتا'], route: '/features', permissions: plans },
      refresh('/quota-definitions', plans),
    ],
  },
  {
    route: '/feature-dependencies', title: 'اعتماديات الميزات', icon: 'pi pi-share-alt', permissions: plans,
    summary: 'ضبط الميزات التي تتطلب ميزات أخرى قبل منحها.',
    keywords: ['اعتمادية', 'dependencies', 'تتطلب ميزة', 'ربط خصائص'],
    overview: 'الاعتماديات تمنع تشغيل ميزة تعتمد على أساس غير متاح. احرص أن يكون الربط منطقياً ولا ينشئ دائرة بين الميزات.',
    steps: ['اختر الميزة الأساسية.', 'اختر الميزة المطلوبة قبلها.', 'راجع أثر الربط على الخطط والاستثناءات.', 'احذف الربط الخاطئ فقط إن كان سجلاً إعدادياً آمناً.'],
    warnings: ['لا تجعل الميزة تعتمد على نفسها أو على سلسلة دائرية.', 'حذف الاعتمادية تعديل إعداد، وليس حذفاً لتاريخ استخدام الميزة.'],
    buttons: [{ label: 'إضافة اعتمادية', description: 'يربط ميزة بميزة مطلوبة.' }, { label: 'إزالة الربط', description: 'يزيل علاقة إعداد آمنة بعد مراجعة أثرها.' }, { label: 'الترقيم', description: 'ينتقل بين علاقات الاعتماد المخزنة في الخادم.' }],
    quickActions: [
      { id: 'open-features-from-dependencies', title: 'فتح كتالوج الميزات', description: 'راجع تعريفات الميزات قبل الربط.', icon: 'pi pi-th-large', keywords: ['ميزات'], route: '/features', permissions: plans },
      refresh('/feature-dependencies', plans),
    ],
  },
  {
    route: '/payment-methods', title: 'طرق الدفع اليدوي', icon: 'pi pi-credit-card', permissions: payments,
    summary: 'تعريف وسائل استلام المدفوعات اليدوية وإتاحتها للصالات.',
    keywords: ['طرق الدفع', 'فودافون كاش', 'تحويل بنكي', 'وسيلة دفع', 'payment method'],
    overview: 'المنصة تستخدم الدفع اليدوي. طريقة الدفع تحدد بيانات الإرشاد للعميل، أما الموافقة الفعلية فتتم من طلبات الدفع بعد مراجعة الإثبات.',
    steps: ['أضف اسم الطريقة وتعليماتها الواضحة.', 'حدد إن كانت متاحة حالياً.', 'راجع التفاصيل المعروضة قبل نشرها للصالات.', 'أوقف الطريقة عند تغير بيانات التحصيل بدلاً من فقد تاريخها.'],
    warnings: ['لا تضع أسراراً أو بيانات حساسة في الوصف الذي قد يصل للمستخدمين.', 'إيقاف الطريقة لا يغير طلبات دفع سابقة.'],
    buttons: [{ label: 'إضافة طريقة', description: 'يفتح نموذج وسيلة دفع جديدة.' }, { label: 'تعديل', description: 'يغير بيانات التحصيل وإرشاداتها للمستقبل.' }, { label: 'تفعيل / إيقاف', description: 'يضبط الإتاحة لطلبات الدفع الجديدة.' }, { label: 'حذف', description: 'يحذف إعداداً فقط عندما يسمح الخادم بذلك.' }, { label: 'الترقيم', description: 'ينتقل بين طرق الدفع دون تحميل غير محدود.' }],
    quickActions: [
      { id: 'create-payment-method', title: 'إضافة طريقة دفع', description: 'افتح نموذج وسيلة دفع يدوية.', icon: 'pi pi-plus', keywords: ['اضافة فودافون كاش', 'طريقة جديده'], route: '/payment-methods', permissions: payments, kind: 'invoke', invoke: 'create-payment-method' },
      { id: 'open-payment-requests-from-methods', title: 'مراجعة طلبات الدفع', description: 'انتقل إلى الإثباتات وقرارات الموافقة.', icon: 'pi pi-wallet', keywords: ['اثبات', 'طلبات دفع'], route: '/payment-requests', permissions: payments },
      refresh('/payment-methods', payments),
    ],
  },
  {
    route: '/payment-requests', title: 'طلبات الدفع والموافقات', icon: 'pi pi-wallet', permissions: payments,
    summary: 'مراجعة إثباتات الدفع اليدوي، ثم الموافقة أو الرفض مع حفظ القرار.',
    keywords: ['طلب دفع', 'اثبات دفع', 'موافقة دفع', 'رفض دفع', 'مدفوعات معلقة'],
    overview: 'هذه أهم شاشة مالية تشغيلية. راجع المبلغ والعملة والمرجع والإثبات قبل القرار. الاعتماد ينشئ أثر الاشتراك والفاتورة وفق قواعد النظام.',
    steps: ['ابدأ بالطلبات المعلقة.', 'طابق الإثبات مع المبلغ والمرجع وطريقة الدفع.', 'وافق فقط إذا كانت البيانات مكتملة وصحيحة.', 'ارفض بسبب واضح عند وجود نقص أو تعارض.'],
    warnings: ['العمليات المالية المعتمدة غير قابلة للتعديل؛ التصحيح يتم بعملية عكسية جديدة.', 'لا توافق بناءً على لقطة إثبات فقط دون فحص المبلغ والمرجع.'],
    buttons: [{ label: 'موافقة', description: 'تعتمد الطلب وتنفذ أثره المالي والتشغيلي.' }, { label: 'رفض', description: 'يرفض الطلب مع سبب مراجعة واضح.' }, { label: 'الترقيم', description: 'يعرض الطلبات على صفحات الخادم؛ ابدأ بالمعلقة.' }],
    quickActions: [
      { id: 'open-invoices-from-payments', title: 'مراجعة الفواتير', description: 'افتح السجل المالي المرقم بعد أي قرار.', icon: 'pi pi-file', keywords: ['فاتوره بعد الدفع'], route: '/invoices', permissions: platform },
      refresh('/payment-requests', payments, 'تحديث طلبات الدفع'),
    ],
  },
  {
    route: '/database-resources', title: 'موارد قواعد البيانات', icon: 'pi pi-server', permissions: backups,
    summary: 'مراجعة موارد قواعد البيانات وحالة الاتصال المحمي دون كشف أسرار.',
    keywords: ['موارد قواعد البيانات', 'database resources', 'connection missing', 'اتصال محمي', 'resource pool'],
    overview: 'تعرض الشاشة الحالة والتخصيص والصحة ومؤشر وجود قيمة اتصال محمية محفوظة. قيمة الاتصال نفسها لا تعود من الخادم ولا تظهر في الواجهة.',
    steps: ['حدّث القائمة واقرأ حالة المورد.', 'استخدم مؤشر الاتصال المحمي كدليل وجود فقط.', 'عالج المورد من المسار التشغيلي المناسب إذا كان غير مضبوطاً.', 'راجع Logs الخادم عند ظهور 500 أو 503 دون نسخ أي secret.'],
    warnings: ['عدم وجود المؤشر يعني أن الاتصال المحمي غير مضبوط لهذا المورد، وليس تصريحاً بإدخال connection string في Issue أو log.', 'لا تعتمد على اسم قاعدة البيانات أو TenantId لتحديد المورد.'],
    buttons: [{ label: 'تحديث الحالة', description: 'يعيد قراءة موارد قواعد البيانات من الخادم.' }],
    quickActions: [refresh('/database-resources', backups, 'تحديث موارد قواعد البيانات')],
  },
  {
    route: '/backups', title: 'النسخ الاحتياطية', icon: 'pi pi-database', permissions: backups,
    summary: 'إنشاء ومتابعة وتنزيل نسخ قاعدة البيانات المحكومة بالصلاحية مع دليل لكل هدف.',
    keywords: ['باك اب', 'نسخة احتياطية', 'backup', 'تنزيل bacpac', 'استعادة'],
    overview: 'اختر نطاق النسخ، ثم راجع حالة كل artifact وحجمه وSHA-256 والـmanifest. إنشاء النسخة وتنزيلها يتطلبان صلاحية مستقلة، ولا يتم حذف السجلات التاريخية من اللوحة.',
    steps: ['تأكد أن الخدمة تعرض Ready قبل الإنشاء.', 'اختر scope مناسباً؛ FullSystem هو الاختيار الافتراضي.', 'أكد الطلب ثم راجع عدد الأهداف وحالة كل artifact والـchecksum.', 'نزّل artifact أو manifest من الجلسة المحمية، واختبر الاستعادة خارج الإنتاج.'],
    warnings: ['الحالة Failed أو Partial تعرض سبب الفشل وتسمح بـRetry للأهداف غير المكتملة فقط.', 'لا تشارك ملف النسخة الاحتياطية أو تخزنه في مسار عام؛ يحتوي على بيانات حقيقية.', 'لا تعرض الشاشة connection strings أو storage paths؛ هذه القيم تظل داخل الخادم.'],
    buttons: [{ label: 'إنشاء نسخة', description: 'يبدأ batch وفق scope الخادم بعد تأكيد.' }, { label: 'تنزيل artifact', description: 'ينزل artifact مكتمل من endpoint محمي.' }, { label: 'تنزيل manifest', description: 'ينزل دليل الأهداف والـchecksums للـbatch.' }, { label: 'إعادة المحاولة', description: 'يعيد الأهداف Failed أو Partial فقط.' }, { label: 'تحديث الحالة', description: 'يعيد قراءة جاهزية الخدمة والملفات والـbatches.' }],
    quickActions: [
      { id: 'create-backup', title: 'إنشاء نسخة احتياطية', description: 'ابدأ إنشاء نسخة قاعدة بيانات جديدة بعد تأكيدك.', icon: 'pi pi-plus', keywords: ['اعمل نسخة', 'backup جديد', 'نسخه جديده'], route: '/backups', permissions: backups, kind: 'invoke', invoke: 'create-backup' },
      refresh('/backups', backups, 'تحديث حالة النسخ'),
    ],
  },
  {
    route: '/audit-logs', title: 'سجل المراجعة', icon: 'pi pi-history', permissions: platform,
    summary: 'سجل غير قابل للتعديل للتغيرات الإدارية والمالية والحساسة.',
    keywords: ['سجل مراجعة', 'audit', 'مين عمل', 'تاريخ التعديلات', 'logs'],
    overview: 'استخدمه للإجابة عن من نفذ الإجراء ومتى وعلى أي كيان. السجل للقراءة والتحقيق ولا يتيح تعديل أو حذف الأحداث.',
    steps: ['ابحث بالكيان أو الفاعل أو نطاق الزمن.', 'افتح السجل المتصل قبل اتخاذ إجراء تصحيحي.', 'وثق سبب أي قرار إداري جديد.', 'استخدم التنبيهات أو العمليات لمتابعة الحوادث الحية.'],
    warnings: ['لا يوجد تعديل أو حذف لسجل المراجعة.', 'لا تعتبر ترتيب الواجهة بديلاً عن التوقيت الرسمي المخزن في UTC.'],
    buttons: [{ label: 'بحث', description: 'يصفّي السجل حسب النص أو النطاق.' }, { label: 'إعادة ضبط', description: 'يمسح الفلتر فقط ولا يمس السجلات.' }, { label: 'الترقيم', description: 'ينقل بين صفحات سجل المراجعة غير القابل للتعديل.' }],
    quickActions: [refresh('/audit-logs', platform)],
  },
  {
    route: '/invoices', title: 'الفواتير', icon: 'pi pi-file', permissions: platform,
    summary: 'عرض الفواتير المرقمة والمبالغ والعملة والخصومات والضريبة كسجل مالي ثابت.',
    keywords: ['فاتورة', 'فواتير', 'invoice', 'ضريبة', 'خصم', 'سجل مالي'],
    overview: 'رقم الفاتورة فريد ومتسلسل ولا يعاد استخدامه حتى بعد الإلغاء. هذه الشاشة تقرأ السجل؛ التصحيح المالي لا يتم بتحرير فاتورة معتمدة.',
    steps: ['ابحث برقم الفاتورة أو الصالة أو الحالة.', 'راجع الإجمالي والعملة ومراجع الدفع.', 'اربط أي استفسار بطلب الدفع واشتراكه.', 'نفذ التصحيح بعملية عكسية موثقة عند الحاجة.'],
    warnings: ['لا تعديل ولا حذف مباشر للفواتير المعتمدة.', 'اختلاف العملة أو الضريبة يحتاج عملية مالية جديدة وليس تغييراً تاريخياً.'],
    buttons: [{ label: 'بحث', description: 'يعرض الفواتير المطابقة للبحث.' }, { label: 'طلبات الدفع', description: 'يفتح المصدر التشغيلي لقرار الاعتماد.' }, { label: 'الترقيم', description: 'ينتقل بين الفواتير المرقمة دون تغييرها.' }],
    quickActions: [
      { id: 'open-payment-requests-from-invoices', title: 'فتح طلبات الدفع', description: 'راجع إثباتات وموافقات الدفع المرتبطة.', icon: 'pi pi-wallet', keywords: ['دفع فاتوره'], route: '/payment-requests', permissions: payments },
      refresh('/invoices', platform),
    ],
  },
  {
    route: '/administrators', title: 'مديرو المنصة', icon: 'pi pi-users', permissions: platform,
    summary: 'إدارة حسابات الإدارة المركزية وحالتها التشغيلية.',
    keywords: ['ادمن', 'مدير', 'super admin', 'مالك المنصة', 'مستخدم اداري'],
    overview: 'حسابات الإدارة تصل إلى بيانات جميع الصالات، لذلك استخدم أقل صلاحية ممكنة وراجع الأدوار قبل التفعيل. الإيقاف يحافظ على التاريخ ويمنع الوصول.',
    steps: ['أنشئ الحساب بالبريد الصحيح وبيانات التعريف.', 'اربطه بالدور الأدنى اللازم للعمل.', 'فعّل أو عطّل الحساب حسب الحالة التشغيلية.', 'راجع سجل المراجعة لأي تغيير حساس.'],
    warnings: ['لا تشارك كلمات المرور أو رموز الجلسات في الملاحظات.', 'لا تمنح ManagePlatform إلا للحالات الضرورية لأنه يمنح كل الصلاحيات.'],
    buttons: [{ label: 'إضافة مدير', description: 'يفتح نموذج حساب إداري جديد.' }, { label: 'تفعيل / إيقاف', description: 'يضبط الوصول دون حذف التاريخ.' }, { label: 'الترقيم', description: 'ينقل بين حسابات فريق المنصة.' }],
    quickActions: [
      { id: 'create-administrator', title: 'إضافة مدير منصة', description: 'افتح نموذج إنشاء حساب إداري.', icon: 'pi pi-user-plus', keywords: ['انشاء ادمن', 'اضافة مدير'], route: '/administrators', permissions: platform, kind: 'invoke', invoke: 'create-administrator' },
      { id: 'open-roles-from-admins', title: 'إدارة الأدوار والصلاحيات', description: 'راجع مجموعة الصلاحيات قبل منح الوصول.', icon: 'pi pi-key', keywords: ['صلاحيات ادمن', 'رول'], route: '/roles', permissions: platform },
      refresh('/administrators', platform),
    ],
  },
  {
    route: '/roles', title: 'الأدوار والصلاحيات', icon: 'pi pi-key', permissions: platform,
    summary: 'مراجعة الأدوار وصلاحيات الإدارة المركزية التي تحمي كل العمليات.',
    keywords: ['صلاحيات', 'دور', 'role', 'permission', 'من يقدر'],
    overview: 'هذه الصلاحيات تطبق في Backend أولاً ولا تعتمد الواجهة وحدها. راجع أثر كل صلاحية قبل حفظها، خاصة موافقات الدفع والنسخ الاحتياطي وإدارة المنصة.',
    steps: ['اختر الدور المقصود.', 'راجع الصلاحيات الحالية مقابل مسؤولياته.', 'احفظ التغيير بعد مراجعته.', 'اختبر بحساب صلاحية محدودة عند تعديل سياسة وصول مهمة.'],
    warnings: ['صلاحية ManagePlatform تمنح وصولاً شاملاً.', 'لا تعتمد على إخفاء زر في الواجهة كحاجز أمني؛ الحماية الفعلية في الخادم.'],
    buttons: [{ label: 'تعديل الصلاحيات', description: 'يفتح محرر الصلاحيات للدور المحدد.' }, { label: 'حفظ', description: 'يثبت سياسة الدور بعد المراجعة.' }, { label: 'الترقيم', description: 'يتنقل بين الأدوار المعرفة في المنصة.' }],
    quickActions: [
      { id: 'open-administrators-from-roles', title: 'مراجعة حسابات الإدارة', description: 'افتح الحسابات التي تستخدم هذه الأدوار.', icon: 'pi pi-users', keywords: ['مديرين', 'حسابات اداريه'], route: '/administrators', permissions: platform },
      refresh('/roles', platform),
    ],
  },
  {
    route: '/operations', title: 'العمليات والخدمات الخلفية', icon: 'pi pi-cog', permissions: platform,
    summary: 'متابعة Jobs وOutbox لضمان وصول الإشعارات وانتقالات الحالات دون فقد.',
    keywords: ['عمليات', 'jobs', 'outbox', 'خدمات خلفية', 'فشل جوب', 'رسائل'],
    overview: 'الـJobs تعالج الانتهاء وفترة السماح والإشعارات، والـOutbox يحفظ الأحداث لضمان إعادة المحاولة. لا تعدّل أو تحذف السجلات من اللوحة؛ راقب الحالة وصعّد المشكلة عند فشل متكرر.',
    steps: ['راجع العناصر الفاشلة أو المتأخرة.', 'اربط التكرار بسجل المراجعة والتنبيهات.', 'تحقق من إعادة المحاولة idempotent قبل التدخل.', 'وثق أي إجراء يدوي في سجل مناسب.'],
    warnings: ['لا تحذف Outbox Records مباشرة؛ تُعلَّم منفذة ثم تؤرشف وفق سياسة الاحتفاظ.', 'تكرار الـJob لا يجب أن يكرر الأثر المالي أو التشغيلي.'],
    buttons: [{ label: 'Jobs', description: 'يعرض تنفيذ الأعمال الخلفية.' }, { label: 'Outbox', description: 'يعرض رسائل الأحداث وحالاتها.' }, { label: 'ترقيم Jobs', description: 'يتنقل بين سجلات Jobs.' }, { label: 'ترقيم Outbox', description: 'يتنقل بين رسائل الأحداث بشكل مستقل.' }],
    quickActions: [
      { id: 'open-alerts-from-operations', title: 'فتح التنبيهات', description: 'راجع التنبيهات الناتجة عن فشل العمليات.', icon: 'pi pi-bell', keywords: ['تنبيه جوب', 'فشل outbox'], route: '/alerts', permissions: platform },
      refresh('/operations', platform, 'تحديث العمليات'),
    ],
  },
  {
    route: '/reports', title: 'التقارير', icon: 'pi pi-chart-bar', permissions: platform,
    summary: 'قراءة مؤشرات المنصة والتقارير المجمعة لاتخاذ القرار.',
    keywords: ['تقارير', 'report', 'تحليل', 'ارقام', 'مؤشرات'],
    overview: 'التقارير تساعد على المتابعة واتخاذ القرار، أما تفاصيل العملاء والمدفوعات فتراجع من شاشاتها المصدرية قبل أي إجراء إداري.',
    steps: ['اختر التقرير أو النطاق المتاح.', 'قارن الاتجاهات بالفترة السابقة.', 'انتقل للسجل المصدر عند ظهور قيمة غير طبيعية.', 'وثق أي إجراء ناتج عن تقرير حساس.'],
    warnings: ['لا تعتمد على تقرير مجمع لتعديل سجل مالي أو اشتراك مباشرة.', 'قد تحتاج بعض المؤشرات إلى تحديث بياناتها من الخادم.'],
    buttons: [{ label: 'لوحة المتابعة', description: 'يفتح الملخص التنفيذي.' }, { label: 'سجل المراجعة', description: 'يفتح الأدلة التفصيلية للتغيرات.' }, { label: 'تحديث', description: 'يعيد طلب بيانات التقرير عند توفره.' }],
    quickActions: [
      { id: 'open-dashboard-from-reports', title: 'فتح لوحة المتابعة', description: 'اعرض المؤشرات التنفيذية الأساسية.', icon: 'pi pi-chart-line', keywords: ['داش بورد'], route: '/dashboard', permissions: platform },
      { id: 'open-audit-from-reports', title: 'فتح سجل المراجعة', description: 'تحقق من التغيرات وراء أي مؤشر.', icon: 'pi pi-history', keywords: ['تاريخ', 'تدقيق'], route: '/audit-logs', permissions: platform },
    ],
  },
  {
    route: '/alerts', title: 'مركز التنبيهات', icon: 'pi pi-bell', permissions: platform,
    summary: 'تجميع التنبيهات التشغيلية والأمنية والمالية التي تحتاج متابعة.',
    keywords: ['تنبيهات', 'alerts', 'تحذير', 'اخطاء', 'مشكلة', 'انذار'],
    overview: 'صنّف التنبيه حسب شدته، ثم انتقل إلى مصدره: دفعات أو عمليات أو صالات أو سجل مراجعة. التنبيه يساعد على الكشف ولا يُغني عن التحقق من البيانات الأصلية.',
    steps: ['ابدأ بالتنبيهات الحرجة والجديدة.', 'افتح المصدر المرتبط بالتنبيه.', 'نفذ إجراءً بصلاحية مناسبة أو صعّد للمالك.', 'تحقق من زوال السبب ثم وثق النتيجة.'],
    warnings: ['خطأ 401 يدل غالباً على جلسة منتهية أو صلاحية ناقصة.', 'خطأ 500 أو 503 من API يحتاج فحص خادم وسجل، وليس إعادة المحاولة العشوائية فقط.'],
    buttons: [{ label: 'تحديث', description: 'يجلب آخر التنبيهات من الخادم.' }, { label: 'العمليات', description: 'يفتح Jobs وOutbox للمشكلات الخلفية.' }, { label: 'الترقيم', description: 'ينتقل بين التنبيهات دون فقد معيار البحث.' }],
    quickActions: [
      { id: 'open-operations-from-alerts', title: 'فحص العمليات الخلفية', description: 'افتح Jobs وOutbox لتشخيص تنبيه تشغيلي.', icon: 'pi pi-cog', keywords: ['job', 'outbox', 'تشخيص'], route: '/operations', permissions: platform },
      { id: 'open-audit-from-alerts', title: 'فحص سجل المراجعة', description: 'تحقق ممن نفذ التغيير المرتبط بالتنبيه.', icon: 'pi pi-history', keywords: ['مين عمل', 'audit'], route: '/audit-logs', permissions: platform },
      refresh('/alerts', platform, 'تحديث التنبيهات'),
    ],
  },
  {
    route: '/documentation', title: 'المرجع والدليل التشغيلي', icon: 'pi pi-book', permissions: platform,
    summary: 'مركز مرجعي قابل للبحث يشرح المنتج والصلاحيات والـAPI والتشغيل وكل شاشات المنصة.',
    keywords: ['توثيق', 'دليل', 'مرجع', 'documentation', 'api', 'صلاحيات', 'كيف اعمل'],
    overview: 'هذه الشاشة تجمع المعرفة التشغيلية داخل اللوحة حتى لا يعتمد الفريق على الذاكرة. استخدم البحث للوصول إلى السياسة أو الشاشة أو الإجراء قبل التنفيذ، ثم ارجع إلى السجل المصدر عند اتخاذ قرار حساس.',
    steps: ['ابحث عن العملية أو المجال المطلوب.', 'اقرأ القاعدة والتحذير المرتبطين به.', 'افتح الشاشة المناسبة من دليل الشاشات.', 'حدّث التوثيق وكتالوج المساعد عند تغيير سلوك النظام.'],
    warnings: ['التوثيق لا يتجاوز صلاحياتك ولا يحل محل تحقق الـBackend.', 'لا تسجل أسراراً أو Connection Strings أو Tokens أو كلمات مرور في أي وثيقة.'],
    buttons: [{ label: 'البحث', description: 'يبحث في المراجع وشاشات المنصة بالعربية.' }, { label: 'دليل الشاشات', description: 'يفتح الشاشة الموثقة مباشرة عند اختيارها.' }, { label: 'لوحة المتابعة', description: 'يعيدك للمؤشرات التشغيلية بعد معرفة الإجراء.' }],
    quickActions: [
      { id: 'open-dashboard-from-documentation', title: 'فتح لوحة المتابعة', description: 'انتقل إلى المؤشرات التنفيذية للمنصة.', icon: 'pi pi-chart-line', keywords: ['الرئيسية', 'مؤشرات'], route: '/dashboard', permissions: platform },
      { id: 'open-api-documentation', title: 'دليل API والصلاحيات', description: 'افتح المرجع الداخلي للـAPI والأدوار والسياسات.', icon: 'pi pi-book', keywords: ['endpoint', 'api', 'permission'], route: '/documentation', permissions: platform },
    ],
  },
];
