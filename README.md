# LogicFit — Platform Admin Dashboard

لوحة تحكم **مشغّل المنصة** (السوبر أدمن) لإدارة كل الجيمات المشتركة على منصة LogicFit —
مشروع فرونت إند **مستقل تماماً** عن تطبيق الجيم. مبني على **Angular 18 + PrimeNG 17 + Tailwind**.

يعتمد على `PLATFORM_FRONTEND_GUIDE.md` (الموجود في مجلد `LogicFit/`).

## المتطلبات

- Node.js 20+ و npm 10+
- Platform API: `https://logicfit-platform.runasp.net`

## التشغيل (Development)

```bash
npm install
npm start            # ng serve → http://localhost:4200
```

- الدخول: **email + password** (بدون subdomain).
- بيانات افتراضية بعد أول تشغيل للنظام: `owner@platform.local` / `ChangeMe#12345`
- في وضع التطوير الطلبات على `/api/...` تُمرَّر تلقائياً للـ Platform API عبر `proxy.conf.json` — **بدون مشاكل CORS**.

## البناء (Production)

```bash
npm run build        # → dist/logifit-platform-admin/browser
```

### النشر و CORS — مهم
هناك طريقتان لربط الفرونت بالـ API في الإنتاج:

1. **Proxy على مستوى الاستضافة (مُوصى به — بلا CORS):** الإبقاء على `apiUrl: '/api/platform'` في
   `src/environments/environment.prod.ts`، وتمرير `/api/*` للـ backend من خلال الاستضافة.
   ملف `vercel.json` جاهز بهذا الإعداد (rewrite). المتصفح لا يعمل طلباً cross-origin أصلاً.
2. **اتصال مباشر بالـ API (يتطلب CORS):** تغيير `apiUrl` في `environment.prod.ts` إلى الرابط المطلق
   `https://logicfit-platform.runasp.net/api/platform`، وحينها **يجب** إضافة دومين هذا الفرونت إلى
   `AllowedOrigins` في `appsettings` بالـ backend (حالياً `AllowedOrigins` فاضية = CORS مقفول).

> بعد تحديد دومين النشر، سلّمه لفريق الـ backend لإضافته في CORS (لو اخترت الطريقة 2).

## الشاشات

| # | الشاشة | المسار | الصلاحية |
|---|--------|--------|----------|
| 1 | نظرة عامة (6 KPIs) | `/dashboard` | `ManagePlatformReports` |
| 2 | الجيمات (Tenants) | `/tenants` | `ManageTenants` |
| 3 | الاشتراكات | `/subscriptions` | `ManageTenants` |
| 4 | الباقات (Plans) | `/plans` | `ManagePlans` |
| 5 | الميزات (Features) | `/features` | `ManagePlans` |
| 6 | طرق الدفع | `/payment-methods` | `ManagePaymentRequests` |
| 7 | **طلبات الدفع** (المراجعة) | `/payment-requests` | `ManagePaymentRequests` |

عناصر القائمة الجانبية تظهر تلقائياً حسب `permissions[]` في التوكن. صلاحية `ManagePlatform` = صلاحية كاملة.

## البنية

```
src/app/
├── core/
│   ├── auth/            # models, AuthService (signals), interceptors, guards
│   ├── layout/          # main-layout (sidebar + topbar) + nav-items
│   ├── models/          # platform.models.ts (enums + DTOs + badge helpers)
│   └── services/        # StorageService
├── shared/ui/           # status-badge, page-header, notify (SweetAlert2 helpers)
└── features/            # auth, dashboard, tenants, plans, features,
                         # payment-methods, payment-requests, subscriptions
```

## المصادقة

- **JWT Bearer**: `accessToken` عمره 15 دقيقة + `refreshToken` (Rotation).
- عند `401` على طلب محمي، الـ `errorInterceptor` يجدّد التوكن **مرة واحدة** (single-flight) ثم يعيد الطلب؛
  الطلبات المتزامنة تنتظر نفس عملية التجديد.
- التوكنات والصلاحيات تُخزَّن في `localStorage`، والخروج يمسحها ويوجّه لصفحة الدخول.

## الأخطاء

كل الأخطاء بشكل موحّد `{ statusCode, message, errors? }`. الـ interceptor يترجمها لرسائل عربية:
`400` (تحقق) · `401` (تجديد/خروج) · `403` (لا صلاحية) · `404` · `409` (تعارض — مثل حذف باقة عليها اشتراكات).
