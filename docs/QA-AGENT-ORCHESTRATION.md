# إطار ضمان الجودة متعدد الوكلاء — لوحة إدارة المنصة

هذا الملف يحدد إطار QA الخاص بريبو `LogiFit_Platform_Admin_Dashboard` فقط. لا يغيّر عقد الـBackend ولا يضيف سلوكاً إلى منصة الجيم أو المدرب الحر. المرجع هو Issue #103.

## النطاق والحدود

يحتاج النظام إلى ستة أدوار QA مستقلة. كلمة «وكيل» هنا تعني مسؤولية قابلة للتدقيق واختبارات وأدلة قبول، وليست ادعاءً بوجود نموذج LLM يعمل داخل الإنتاج. المساعد الموجود في لوحة الإدارة هو كتالوج إجراءات deterministic ولا يستقبل prompt ولا يرسل بيانات المنصة إلى خدمة خارجية.

لا تُشغّل اختبارات mutations على Production تلقائياً. اختبار الإنشاء أو الاعتماد أو الرفض أو النسخ يحتاج حساباً مصرحاً وبيانات fixture معزولة في Staging. ما يمكن إثباته محلياً هو عقد الشاشة والخدمة والحالات والحماية؛ أما Database state وAudit وTenant isolation فتحتاج أدلة من بيئة الاختبار ومالك الـBackend.

## الوكلاء الستة

| الوكيل | المسؤولية الوحيدة | المدخلات | المخرجات | بوابة القبول |
|---|---|---|---|---|
| Contract Agent | مطابقة الشاشة والزر والنموذج مع endpoint وmethod وpayload وresponse وpermission | route، service، API catalog، permission، payload | verdict، mapping، فجوة، test evidence | contract specs + build type-check |
| Flow/E2E Agent | تتبع Gym وFreelanceCoach من الطلب إلى الدفع والمراجعة والتجهيز والتفعيل | حساب Staging، fixture، النوع، proof، transition | trace، responses، final states، audit expectation | happy/failure paths + no duplicates + isolation |
| Security Agent | منع privilege escalation وتسريب الأسرار وحقن الأوامر والوصول المتقاطع | permission matrix، action IDs، payload، response، forged input | finding، severity، reproduction، mitigation، residual risk | deny forged actions + redaction + backend denial |
| UX/State Agent | فصل Loading/Empty/Blocked/Error/Retry وتضارب الإجراءات | state model، response، permission، row version، action | visible verdict، message، conflict rule، accessibility evidence | لا صفحة فارغة ولا نجاح زائف |
| Resilience/Performance Agent | اختبار timeout والتزامن والتكرار وpagination والأداء | latency fixture، idempotency key، pagination، row version | resilience verdict، duplicate finding، latency، retry evidence | retry آمن + لا تكرار + server pagination |
| Release/Health Agent | حسم جاهزية النسخة من tests/build/health/deploy smoke | diff، test/build output، health، deployment commit | release verdict، gates، failure، escalation | tests pass + build pass + `/health` HTTP 200 Healthy |

التعريف البرمجي القابل للاختبار موجود في [qa-agent-catalog.ts](../src/app/shared/quality/qa-agent-catalog.ts)، ويضمن أن لكل وكيل نطاقاً ومدخلات ومخرجات واختبارات وضوابط أمنية وسياسة تعارض وبوابات إصدار.

## مصفوفة الاختبار التنفيذية

### Contract

- تحقق من كل `GET/POST/PUT/PATCH/DELETE` في خدمات `/workspace-applications` و`/tenants` و`/plans` و`/payment-requests` و`/backups` و`/database-resources`.
- تحقق من payload إثبات الدفع، request-information، approve/reject، retry، pagination، وrow version.
- تحقق من أن permission guard يمنع فتح الشاشة، وأن خطأ الخادم لا يتحول إلى empty success.

### Flow/E2E

نفّذ على Staging بحساب مصرح وبـfixture قابل للإزالة:

1. أنشئ Gym وFreelanceCoach من شاشة `/workspace-applications`.
2. اختر الباقة، أرسل الطلب، وارفع payment proof محفوظاً.
3. ابدأ المراجعة، اعتمد/ارفض الدفع، اطلب معلومات إضافية وأعد الإرسال.
4. اعتمد/ارفض الطلب، راقب provisioning، ثم اختبر retry بعد فشل مصطنع.
5. تحقق من `Application Approved + Payment Approved + Tenant Active + Subscription Active + Database Ready + Owner Membership Active` قبل السماح بالدخول.
6. تحقق من Workspace selection والصلاحيات والعزل وعدم تكرار Tenant/Subscription/Membership/Database Mapping.

### Security

- مرر action object مزوراً إلى المساعد مع route و`invoke` ضارين؛ يجب أن يرفضه.
- مرر action معروفاً ببيانات route/permission/invoke مختلفة؛ يجب استخدام metadata canonical من الكتالوج فقط.
- راجع responses وlogs وdocumentation بحثاً عن JWT أو connection string أو storage key أو payment proof secret.
- اختبر مستخدم بلا permission، ومستخدم يحاول فتح route مباشرة، وطلباً يغيّر Tenant غير مصرح به. يجب أن يكون القرار النهائي من Backend.

### UX/State

لكل شاشة remote data يجب إثبات الحالات التالية: Loading، Empty حقيقي، Error مع Retry، Blocked بسبب الصلاحية أو الجاهزية، Success، وConflict/stale state. أثناء أي mutation:

- يتعطل الزر ويظهر progress.
- لا تظهر نتيجة نجاح قبل response الخادم.
- يظهر تأكيد قبل قرار مالي أو حذف/استعادة أو provisioning.
- تظهر رسالة مفهومة وخطوة تالية، ولا يظهر stack trace أو صفحة بيضاء.

### Resilience/Performance

- افصل الاتصال أو أعد 5xx/timeout ثم تحقق من الرسالة وRetry.
- اضغط الإجراء مرتين وأرسل طلبين متزامنين؛ يجب أن يحمي Backend العملية بـidempotency/row version.
- اختبر صفحات كبيرة؛ يجب إرسال `page` و`pageSize` وعدم تحميل كل السجلات دفعة واحدة.
- لا تُعاد mutations الحساسة تلقائياً بعد timeout؛ الحالة Unknown وتحتاج Refresh/status check.

### Release/Health

الأوامر الإلزامية قبل التسليم:

```powershell
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
Invoke-WebRequest https://logicfit-saas-model.runasp.net/health
```

النتيجة المقبولة للـhealth هي HTTP `200` ومحتوى `Healthy`. أي `500` أو `503` يوقف الدمج/النشر حتى لو نجحت الواجهة محلياً. بعد النشر يجب مطابقة commit المنشور مع commit المراجع وتشغيل smoke read-only على login/dashboard والروابط الحساسة.

## سياسة التعارض والأمان

1. حالة الخادم تغلب أي حالة optimistic محلية.
2. اعتماد الدفع لا يساوي تفعيل Workspace؛ كل مرحلة مستقلة.
3. `Active` لا يكفي وحده للسماح بالدخول؛ يجب فحص الحالات المركبة المذكورة في اختبار E2E.
4. أي طلب لتجاوز permission أو كشف secret أو تنفيذ route غير معروف يُرفض ولا يُعاد تفسيره.
5. Frontend guards تحسين UX فقط؛ التفويض والعزل والتدقيق مسؤولية Backend.
6. لا يُخزّن credential أو connection material أو payment proof secret في Git أو local storage أو evidence.

## الفجوة المتبقية

لا توجد حالياً خدمة AI Agent أو endpoint يشغّل هذه الأدوار تلقائياً داخل لوحة الإدارة. لذلك لا يجوز عرض «نجح الوكيل» كحالة حية من دون evidence. السجل البرمجي والاختبارات الحالية يثبتان الحوكمة والحواجز المحلية، بينما يحتاج E2E mutation وDatabase/Audit/Tenant isolation إلى تشغيل مصرح في Staging وربط النتائج بـIssue/PR.

## تعريف الانتهاء

يُعتبر إطار QA جاهزاً عندما تمر اختبارات الكتالوج والمساعد، وتنجح اختبارات المشروع والبناء، ويعود `/health` بـ200 Healthy، وتُرفق أدلة E2E الفعلية لكل نوع مساحة، وتُحدّث Issue #103، ثم يُراجع commit المنشور. لا يُغلق الإطار اعتماداً على نجاح الواجهة وحده.
