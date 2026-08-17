export type QaAgentId =
  | 'contract'
  | 'lifecycle'
  | 'security'
  | 'ux-state'
  | 'resilience'
  | 'release-health';

export type QaRisk = 'Critical' | 'High' | 'Medium';

export interface QaTestCase {
  id: string;
  title: string;
  risk: QaRisk;
  expected: string;
}

export interface QaAgentDefinition {
  id: QaAgentId;
  name: string;
  responsibility: string;
  scope: string;
  inputs: readonly string[];
  outputs: readonly string[];
  evidence: readonly string[];
  testCases: readonly QaTestCase[];
  securityControls: readonly string[];
  conflictPolicy: readonly string[];
  releaseGates: readonly string[];
}

/**
 * The admin dashboard QA registry is deliberately deterministic. It describes
 * six auditable QA roles; it is not an LLM prompt runner and does not claim to
 * have executed production mutations. Live evidence must come from the test
 * runner, build, health check, or an authorized staging account.
 */
export const QA_AGENT_CATALOG: readonly QaAgentDefinition[] = [
  {
    id: 'contract',
    name: 'Contract Agent',
    responsibility: 'تحقق من أن كل شاشة وزر ونموذج مرتبط بعقد API صحيح ومصرح به.',
    scope: 'شاشات لوحة الإدارة، الخدمات، route guards، HTTP method، payload، response، وpermission.',
    inputs: ['screen route', 'service method', 'API catalog entry', 'required permission', 'form payload'],
    outputs: ['contract verdict', 'endpoint/method mapping', 'missing or conflicting field', 'test evidence'],
    evidence: ['service spec with HttpTestingController', 'route/permission assertion', 'build type-check'],
    testCases: [
      { id: 'CON-001', title: 'كل mutation يستخدم method وendpoint الصحيحين', risk: 'Critical', expected: 'يُرفض الاختبار عند اختلاف المسار أو method أو payload.' },
      { id: 'CON-002', title: 'كل route حساس محمي بالـpermission المناسب', risk: 'Critical', expected: 'لا يمكن فتح الشاشة أو action دون permission.' },
      { id: 'CON-003', title: 'الاستجابة الفاشلة لا تتحول إلى نجاح أو قائمة فارغة', risk: 'High', expected: 'تظهر Error/Retry ويظل السبب محفوظاً في الحالة.' },
    ],
    securityControls: ['لا يثق في route أو endpoint قادم من input خارجي.', 'لا يضع secrets أو connection material في payload أو UI.', 'الـBackend يظل مصدر التفويض النهائي.'],
    conflictPolicy: ['عند تعارض النص المعروض مع عقد API يُوقف mutation ويُرفع كفجوة.', 'عند تعارض permission الشاشة لا تتغلب على Backend denial.'],
    releaseGates: ['كل خدمة حساسة لها contract spec.', 'لا يوجد TypeScript/build error.', 'لا يوجد route orphan غير موثق.'],
  },
  {
    id: 'lifecycle',
    name: 'Flow/E2E Agent',
    responsibility: 'يتتبع رحلة طلب Gym وFreelanceCoach من الإنشاء حتى القرار والتجهيز والتفعيل.',
    scope: 'workspace applications، payment proof، payment decisions، review، approval/rejection، provisioning، tenants، subscriptions، plans، payment requests، backups، وdatabase resources.',
    inputs: ['authorized staging account', 'safe test fixture', 'workspace type', 'payment proof fixture', 'expected state transition'],
    outputs: ['step-by-step result', 'API response evidence', 'final state assertion', 'audit trail expectation', 'blocked step'],
    evidence: ['E2E trace', 'network/API assertion', 'database/audit evidence from backend owner', 'no duplicate resource assertion'],
    testCases: [
      { id: 'E2E-001', title: 'إنشاء Gym وFreelanceCoach من نفس تدفق الطلب', risk: 'Critical', expected: 'كل نوع يمر بالمراحل الصحيحة مع اختلاف النوع فقط.' },
      { id: 'E2E-002', title: 'إثبات الدفع يظهر ويُحفظ قبل اعتماد الدفع', risk: 'Critical', expected: 'لا يتم اعتماد الدفع دون proof صالح، ويبقى الملف قابلاً للمراجعة.' },
      { id: 'E2E-003', title: 'Provisioning failure ثم Retry', risk: 'Critical', expected: 'Retry لا ينشئ Tenant/Subscription/Membership/Mapping مكرراً.' },
      { id: 'E2E-004', title: 'لا دخول قبل الجاهزية', risk: 'Critical', expected: 'المستخدم يرى حالة مفهومة ولا يفتح Dashboard قبل كل شروط الوصول.' },
    ],
    securityControls: ['لا تُشغّل mutations على Production ضمن الاختبار الآلي.', 'تُستخدم fixtures معزولة وحساب اختبار مصرح.', 'كل قرار حساس يحتاج تأكيداً ويدعم idempotency.'],
    conflictPolicy: ['اعتماد الدفع لا يعني تفعيل Workspace؛ كل منهما خطوة مستقلة.', 'Active لا تُقبل كدليل منفرد؛ يجب فحص application/payment/tenant/subscription/database/membership.'],
    releaseGates: ['Happy path وfailure path موثقان.', 'إثبات عدم التكرار بعد retry.', 'إثبات Tenant isolation واختيار Workspace الصحيح.'],
  },
  {
    id: 'security',
    name: 'Security Agent',
    responsibility: 'يمنع الوصول غير المصرح وتسرب البيانات وسوء استخدام الإجراءات.',
    scope: 'auth، permission guards، admin assistant، payloads، proof preview، database resources، backups، audit-sensitive mutations.',
    inputs: ['role/permission matrix', 'route and action IDs', 'malicious or forged action', 'sensitive response sample', 'duplicate request'],
    outputs: ['security finding', 'severity', 'reproduction', 'mitigation', 'residual risk'],
    evidence: ['forged assistant action test', 'secret redaction assertion', 'permission denial test', 'audit requirement'],
    testCases: [
      { id: 'SEC-001', title: 'Prompt/command injection لا ينفذ route أو event', risk: 'Critical', expected: 'يُقبل فقط action ID موجود في الكتالوج وببياناته canonical.' },
      { id: 'SEC-002', title: 'منع كشف JWT وconnection string ومفاتيح التخزين', risk: 'Critical', expected: 'لا تظهر في response model أو logs أو documentation.' },
      { id: 'SEC-003', title: 'منع privilege escalation وcross-tenant access', risk: 'Critical', expected: 'الواجهة تخفي الإجراء وBackend يرفض الطلب اليدوي.' },
      { id: 'SEC-004', title: 'إجراءات الدفع والنسخ الحساسة قابلة للتدقيق', risk: 'High', expected: 'Confirmation وaudit evidence مطلوبة قبل وبعد mutation.' },
    ],
    securityControls: ['المساعد الحالي deterministic ولا يرسل prompt أو بيانات المنصة لخدمة خارجية.', 'Action dispatch يعتمد على allowlist من الكتالوج.', 'لا يُعتبر frontend guard بديلاً عن Backend authorization.', 'يُمنع open redirect وCustomEvent غير معروف.'],
    conflictPolicy: ['أي input يطلب تجاوز permission أو كشف secret يُعامل كغير موثوق ويُهمل.', 'عند الشك في صلاحية mutation تكون النتيجة deny وطلب مراجعة، لا محاولة تلقائية.'],
    releaseGates: ['لا يوجد forged route/invoke يمر.', 'لا يوجد secret في tracked diff.', 'نتيجة unauthorized request موثقة كـ403/رفض مناسب من Backend.'],
  },
  {
    id: 'ux-state',
    name: 'UX/State Agent',
    responsibility: 'يضمن أن كل شاشة تعرض حالة مفهومة وقابلة للاستمرار بدلاً من الصفحة الفارغة.',
    scope: 'loading، empty، blocked، error، retry، confirmation، stale state، navigation، responsive labels، وconflicting actions.',
    inputs: ['screen state model', 'API success/error', 'permission result', 'current row version', 'user action'],
    outputs: ['visible state verdict', 'message/action recommendation', 'conflicting control rule', 'accessibility evidence'],
    evidence: ['component state spec', 'rendered message assertion', 'disabled/loading action assertion', 'route fallback'],
    testCases: [
      { id: 'UX-001', title: 'Loading وEmpty وError حالات منفصلة', risk: 'High', expected: 'فشل الشبكة لا يظهر كأن البيانات صفر.' },
      { id: 'UX-002', title: 'Double-click على mutation', risk: 'High', expected: 'الزر يعطل أثناء الطلب ويظهر نتيجة واحدة فقط.' },
      { id: 'UX-003', title: 'Blocked/MoreInfo/Rejected/Provisioning', risk: 'High', expected: 'رسالة عربية واضحة وخطوة تالية قابلة للتنفيذ.' },
    ],
    securityControls: ['لا تعرض الواجهة إجراءً دون permission.', 'لا تعرض connection material أو proof download key.', 'رسائل الخطأ لا تحتوي stack trace أو أسراراً.'],
    conflictPolicy: ['الحالة القادمة من الخادم تغلب أي optimistic state محلي.', 'عند تضارب الصف القديم مع الخادم يظهر Refresh/Conflict ولا يتم overwrite صامت.'],
    releaseGates: ['كل شاشة بيانات لها Loading/Empty/Error/Retry.', 'كل mutation لها confirmation حيث يلزم وsuccess/error.', 'كل icon action له label وtooltip أو نص واضح.'],
  },
  {
    id: 'resilience',
    name: 'Resilience/Performance Agent',
    responsibility: 'يختبر التحمل والأداء وسلامة retry والتزامن والصفحات المقسمة.',
    scope: 'timeouts، network failures، duplicate clicks، retry، pagination، stale rowVersion، partial failure، cache، وlarge lists.',
    inputs: ['latency/failure fixture', 'request identity key', 'pagination parameters', 'row version', 'concurrent action'],
    outputs: ['resilience verdict', 'duplicate/timeout finding', 'latency observation', 'retry safety evidence'],
    evidence: ['service error spec', 'action lock assertion', 'pagination contract', 'build size/performance observation'],
    testCases: [
      { id: 'RES-001', title: 'Timeout و5xx ثم Retry', risk: 'High', expected: 'تظهر حالة قابلة للإعادة ولا تُكرر mutation تلقائياً بشكل خطر.' },
      { id: 'RES-002', title: 'طلبات متزامنة لنفس القرار', risk: 'Critical', expected: 'لا تتجاوز العملية idempotency أو row-version guard.' },
      { id: 'RES-003', title: 'Pagination وlarge list', risk: 'Medium', expected: 'تُرسل page/pageSize للخادم ولا تحمل كل البيانات دفعة واحدة.' },
    ],
    securityControls: ['لا retry تلقائي للـfinancial/provisioning mutation دون idempotency.', 'لا تُخزن payloads الحساسة في cache أو local storage.', 'الـtimeout لا يُفسر كنجاح.'],
    conflictPolicy: ['عند timeout النتيجة Unknown وتُستخدم Refresh/operation status، لا إعادة إنشاء.', 'عند stale version يُطلب refresh ثم مراجعة القرار.'],
    releaseGates: ['كل mutation الحساسة لها request lock.', 'كل قائمة كبيرة لها server pagination.', 'الفشل الجزئي قابل للتشخيص ولا يترك شاشة نجاح زائف.'],
  },
  {
    id: 'release-health',
    name: 'Release/Health Agent',
    responsibility: 'يقرر جاهزية النسخة من الاختبارات والبناء وصحة الخادم والنشر.',
    scope: 'unit/component/service tests، production build، diff hygiene، health endpoint، deployment artifact، وpost-publish smoke.',
    inputs: ['git diff', 'test output', 'build output', 'health response', 'deployment URL/commit'],
    outputs: ['release verdict', 'commands and timestamps', 'failed gate', 'rollback/escalation recommendation'],
    evidence: ['npm test result', 'npm run build result', 'HTTP /health=200 Healthy', 'clean tracked diff', 'deployment commit check'],
    testCases: [
      { id: 'REL-001', title: 'كل الاختبارات تمر', risk: 'Critical', expected: 'لا يتم التسليم عند وجود test failure.' },
      { id: 'REL-002', title: 'Production build', risk: 'Critical', expected: 'build ينجح دون compile error أو budget failure.' },
      { id: 'REL-003', title: 'Backend health', risk: 'Critical', expected: 'HTTP 200 وHealthy؛ 500/503 توقف التسليم.' },
      { id: 'REL-004', title: 'Post-publish smoke', risk: 'High', expected: 'النسخة المنشورة تطابق commit المدموج وتفتح auth/dashboard.' },
    ],
    securityControls: ['لا تُسجل credentials أو tokens في evidence.', 'لا يتم deploy من worktree غير معروف أو dirty secrets.', 'التحقق بعد النشر يظل read-only ما لم يُصرح باختبار staging mutation.'],
    conflictPolicy: ['فشل health أو build يغلب نجاح الواجهة المحلي.', 'اختلاف commit المنشور عن commit المراجع يعني عدم جاهزية، حتى لو نجح CI المحلي.'],
    releaseGates: ['tests pass.', 'build pass.', 'health 200 Healthy.', 'issue/PR evidence updated.', 'لا يتم الادعاء بالنشر قبل التحقق من URL والcommit.'],
  },
] as const;

export function getQaAgent(id: QaAgentId): QaAgentDefinition | undefined {
  return QA_AGENT_CATALOG.find((agent) => agent.id === id);
}
