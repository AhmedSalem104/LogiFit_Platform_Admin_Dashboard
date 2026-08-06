import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

interface DocumentationSection {
  id: string;
  title: string;
  icon: string;
  summary: string;
  keywords: string[];
  items: string[];
}

interface ScreenReference {
  route: string;
  title: string;
  permission: string;
  purpose: string;
  action: string;
  keywords: string[];
}

@Component({
  selector: 'app-documentation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, PageHeaderComponent],
  template: `
    <div class="lf-page">
      <app-page-header title="المرجع والدليل التشغيلي" subtitle="كل ما يحتاجه فريق المنصة لتشغيل LogicFit وإدارته بأمان" icon="pi pi-book">
        <a routerLink="/dashboard" class="lf-btn lf-btn-secondary"><i class="pi pi-chart-line"></i> لوحة المتابعة</a>
      </app-page-header>

      <section class="relative overflow-hidden rounded-3xl bg-gradient-to-l from-slate-950 via-indigo-950 to-blue-900 px-5 py-7 text-white shadow-xl shadow-indigo-950/20 sm:px-8">
        <div class="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl"></div>
        <div class="relative grid gap-5 lg:grid-cols-[1fr,390px] lg:items-center">
          <div>
            <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-blue-100"><i class="pi pi-shield"></i> مرجع موحد ومراجع</span>
            <h2 class="m-0 mt-4 text-2xl font-extrabold sm:text-3xl">اعرف القرار الصحيح قبل تنفيذه</h2>
            <p class="m-0 mt-3 max-w-3xl text-sm leading-7 text-slate-200">يوثق هذا المركز نموذج الـSaaS، المستخدمين، الصلاحيات، التدفقات، واجهات API، التشغيل، التصميم، وكل شاشة في لوحة المنصة. استخدمه مع المساعد الذكي للوصول السريع إلى الإجراء الآمن.</p>
          </div>
          <label class="relative block">
            <i class="pi pi-search pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input class="w-full rounded-2xl border border-white/10 bg-white px-11 py-3.5 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-cyan-300/30" [(ngModel)]="query" placeholder="ابحث: نسخة احتياطية، اشتراك، صلاحيات، API…" aria-label="بحث في دليل المنصة" />
          </label>
        </div>
      </section>

      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div class="lf-card p-5"><i class="pi pi-sitemap text-xl text-blue-600"></i><p class="m-0 mt-3 text-2xl font-extrabold text-slate-800">{{ sections.length }}</p><p class="m-0 mt-1 text-xs font-bold text-slate-500">مراجع تشغيلية أساسية</p></div>
        <div class="lf-card p-5"><i class="pi pi-window-maximize text-xl text-violet-600"></i><p class="m-0 mt-3 text-2xl font-extrabold text-slate-800">{{ screens.length }}</p><p class="m-0 mt-1 text-xs font-bold text-slate-500">شاشة إدارية موثقة</p></div>
        <div class="lf-card p-5"><i class="pi pi-key text-xl text-emerald-600"></i><p class="m-0 mt-3 text-2xl font-extrabold text-slate-800">6</p><p class="m-0 mt-1 text-xs font-bold text-slate-500">صلاحيات مركزية أساسية</p></div>
        <div class="lf-card p-5"><i class="pi pi-clock text-xl text-amber-600"></i><p class="m-0 mt-3 text-sm font-extrabold text-slate-800">مُحدّث محلياً</p><p class="m-0 mt-1 text-xs font-bold text-slate-500">يُراجع مع كل تغيير وظيفي</p></div>
      </section>

      <section class="lf-card overflow-hidden">
        <div class="border-b border-slate-100 px-5 py-5 sm:px-6"><h3 class="m-0 text-base font-extrabold text-slate-800">المرجع العام</h3><p class="m-0 mt-1 text-sm text-slate-500">افتح أي قسم لقراءة القواعد والإجراءات المختصرة.</p></div>
        <div class="divide-y divide-slate-100">
          @for (section of filteredSections(); track section.id) {
            <article>
              <button type="button" class="flex w-full items-start gap-4 px-5 py-5 text-right transition hover:bg-slate-50 sm:px-6" (click)="toggle(section.id)" [attr.aria-expanded]="expanded() === section.id">
                <span class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-50 text-lg text-primary-600"><i [class]="section.icon"></i></span>
                <span class="min-w-0 flex-1"><b class="block text-sm text-slate-800">{{ section.title }}</b><small class="mt-1 block text-xs leading-5 text-slate-500">{{ section.summary }}</small></span>
                <i class="pi mt-2 text-sm text-slate-400" [class.pi-angle-down]="expanded() !== section.id" [class.pi-angle-up]="expanded() === section.id"></i>
              </button>
              @if (expanded() === section.id) {
                <div class="border-t border-slate-100 bg-slate-50 px-5 py-5 sm:px-20"><ul class="m-0 space-y-3 pr-4 text-sm leading-6 text-slate-600">@for (item of section.items; track item) { <li>{{ item }}</li> }</ul></div>
              }
            </article>
          } @empty {
            <div class="lf-empty-state"><i class="pi pi-search"></i><b>لا توجد نتيجة مطابقة</b><span class="mt-1 text-sm">جرّب كلمة أبسط مثل: دفع، صالة، خطة، نسخة، صلاحية.</span></div>
          }
        </div>
      </section>

      <section class="lf-card overflow-hidden">
        <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6"><div><h3 class="m-0 text-base font-extrabold text-slate-800">دليل شاشات المنصة</h3><p class="m-0 mt-1 text-sm text-slate-500">هدف كل شاشة، صلاحيتها، وأهم إجراء آمن فيها.</p></div><span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{{ filteredScreens().length }} شاشة</span></div>
        <div class="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
          @for (screen of filteredScreens(); track screen.route) {
            <a [routerLink]="screen.route" class="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-card-hover">
              <div class="flex items-start justify-between gap-3"><div><h4 class="m-0 text-sm font-extrabold text-slate-800 group-hover:text-blue-700">{{ screen.title }}</h4><code class="mt-2 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500" dir="ltr">{{ screen.permission }}</code></div><i class="pi pi-arrow-up-left text-sm text-slate-300 group-hover:text-blue-500"></i></div>
              <p class="m-0 mt-3 text-xs leading-5 text-slate-500">{{ screen.purpose }}</p><p class="m-0 mt-3 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold leading-5 text-blue-800"><i class="pi pi-check-circle ml-1"></i>{{ screen.action }}</p>
            </a>
          } @empty {
            <div class="lf-empty-state sm:col-span-2 xl:col-span-3"><i class="pi pi-search"></i><b>لم نجد شاشة بهذه العبارة</b></div>
          }
        </div>
      </section>

      <section class="grid gap-4 lg:grid-cols-2">
        <div class="rounded-3xl border border-amber-200 bg-amber-50 p-5"><h3 class="m-0 flex items-center gap-2 text-sm font-extrabold text-amber-900"><i class="pi pi-exclamation-triangle"></i> ثوابت لا تتغير من الواجهة</h3><ul class="m-0 mt-3 space-y-2 pr-4 text-sm leading-6 text-amber-800"><li>لا حذف أو تعديل مباشر للفواتير، قرارات الدفع، Audit، Outbox، Jobs أو سجل النسخ.</li><li>Global Disable وإيقاف الصالة يتقدمان على أي Feature Override.</li><li>الـTenantId وصلاحية المستخدم يفحصهما الـBackend دائماً.</li></ul></div>
        <div class="rounded-3xl border border-emerald-200 bg-emerald-50 p-5"><h3 class="m-0 flex items-center gap-2 text-sm font-extrabold text-emerald-900"><i class="pi pi-check-square"></i> عند تغيير النظام</h3><ul class="m-0 mt-3 space-y-2 pr-4 text-sm leading-6 text-emerald-800"><li>حدّث API/DTO والاختبارات والواجهة المتأثرة معاً.</li><li>حدّث دليل الشاشة وملفات التوثيق وكتالوج المساعد في نفس المهمة.</li><li>راجع Migration وBackup وRollback قبل نشر Production.</li></ul></div>
      </section>
    </div>
  `,
})
export class DocumentationComponent {
  query = '';
  readonly expanded = signal<string | null>('product');

  readonly sections: DocumentationSection[] = [
    { id: 'product', title: 'فكرة المنصة وتدفق العمل', icon: 'pi pi-sitemap', summary: 'SaaS متعدد الصالات من التسجيل حتى الاشتراك والدفع والوصول للميزات.', keywords: ['منتج', 'فلو', 'صالة', 'اشتراك', 'دفع', 'saas'], items: ['منصة مركزية تدير الصالات والخطط والميزات، وكل صالة Tenant معزول يدير أعضاؤه وموظفوه.', 'نموذج الدفع الحالي يدوي: يراجع المشرف طلب الدفع وإثباته قبل الموافقة أو الرفض.', 'الصالة وحالة اشتراكها قراران منفصلان؛ إيقاف الصالة يمنع الدخول حتى لو كان اشتراكها صالحاً.'] },
    { id: 'subscriptions', title: 'الاشتراكات والفواتير والميزات', icon: 'pi pi-verified', summary: 'سياسات التجديد والترقية والـSnapshot وفترة السماح وقواعد الوصول.', keywords: ['اشتراك', 'ترقية', 'تجديد', 'فاتورة', 'ميزة', 'grace', 'expired'], items: ['الترقية فورية بفارق سعر نسبي، بينما التخفيض يبدأ في دورة التجديد التالية.', 'التجديد قبل الانتهاء يبدأ من EndDate الحالية؛ بعد الانتهاء يبدأ من موافقة الإدارة.', 'Snapshot السعر والعملة والمدة والحدود والميزات غير قابل للتعديل بعد التفعيل.', 'ترتيب حسم الميزات: Global Disable ثم حالة الاشتراك ثم Override الصالة ثم الخطة ثم Default Deny.'] },
    { id: 'permissions', title: 'المستخدمون والصلاحيات', icon: 'pi pi-key', summary: 'فرق Platform Owner/Admin عن مستخدمي الصالات ومبدأ أقل صلاحية.', keywords: ['دور', 'صلاحية', 'ادمن', 'owner', 'coach', 'client', 'permission'], items: ['ManagePlatform وصول شامل؛ لا يمنح إلا عند الحاجة وبحساب شخصي قابل للمراجعة.', 'صلاحيات المنصة الأساسية تفصل الصالات والخطط والمدفوعات والتقارير والنسخ.', 'واجهة الصالة تفصل Owner وManager وReceptionist وAccountant وCoach وClient؛ الـBackend هو حد الأمان الحقيقي.'] },
    { id: 'api', title: 'الـAPI وعقود البيانات', icon: 'pi pi-code', summary: 'المسارات، JWT، أخطاء HTTP، والعقد الموحد للترقيم.', keywords: ['api', 'endpoint', 'jwt', '401', '500', 'pagination', 'ترقيم'], items: ['Platform API تحت /api/platform وTenant API تحت /api؛ كل طلب محمي يحمل Bearer Token.', 'قائمة الإدارة تستخدم items وtotalCount وpage وpageSize وtotalPages مع page يبدأ من 1 وحجم لا يتجاوز 100.', '401 غالباً جلسة/صلاحية، 403 Policy، 404 مورد أو إصدار خادم، و500/503 تتطلب فحص API والسجلات.'] },
    { id: 'data', title: 'البيانات والموثوقية', icon: 'pi pi-database', summary: 'Tenant isolation، معاملات، Concurrency، Jobs، Outbox وAudit.', keywords: ['بيانات', 'database', 'outbox', 'job', 'audit', 'concurrency', 'tenant'], items: ['كل التواريخ UTC ويستخدم النظام TimeProvider؛ EndDate غير شامل.', 'الموافقة والتفعيل والتجديد وفحص Quota تتم داخل Transaction مع Idempotency وConcurrency Control.', 'Outbox لا يحذف مباشرة؛ يعلم منفذاً ثم يؤرشف. Audit والمال سجلات تاريخية لا تعدل.'] },
    { id: 'operations', title: 'التشغيل والنسخ الاحتياطي', icon: 'pi pi-cog', summary: 'الإعدادات السرية، النشر، المراقبة، النسخ، الاستعادة وRollback.', keywords: ['نشر', 'سيرفر', 'باك اب', 'backup', 'rollback', 'logs', 'monitoring'], items: ['الإعدادات السرية تخزن في إعدادات الموقع/Secret Store لا في Git أو appsettings المنشور.', 'قبل Migration أو نشر كبير: Backup وDry Run واختبار Health وخطة Rollback.', '404 لتنزيل Backup مع عمل القائمة غالباً يعني أن إصدار Platform API المنشور قديم ولا يحتوي Endpoint التنزيل.'] },
    { id: 'design', title: 'التصميم وتجربة الإدارة', icon: 'pi pi-palette', summary: 'Tailwind وPrimeNG وRTL والبطاقات والجداول والنوافذ وإتاحة الوصول.', keywords: ['تصميم', 'tailwind', 'primeng', 'rtl', 'style', 'زر', 'ui'], items: ['استخدم tokens وlf-card وlf-page وlf-table-shell وServerPaginator قبل كتابة CSS خاص.', 'كل زر أيقونة يحتاج aria-label وTooltip، وكل Mutation حساس يحتاج تأكيد ورسالة نجاح/فشل.', 'المساعد الذكي موجود في كل شاشة: Ctrl+K للبحث ودليل سياقي وإجراءات آمنة حسب الصلاحية.'] },
  ];

  readonly screens: ScreenReference[] = [
    { route: '/dashboard', title: 'لوحة المتابعة', permission: 'ManagePlatformReports', purpose: 'مؤشرات صحة المنصة والتنبيهات والاشتراكات.', action: 'ابدأ بالتنبيهات أو الطلبات المعلقة ثم افتح السجل المصدر.', keywords: ['رئيسية', 'dashboard', 'مؤشرات'] },
    { route: '/tenants', title: 'الصالات والمستأجرون', permission: 'ManageTenants', purpose: 'إنشاء الصالات وحالاتها ومالكها.', action: 'استخدم دورة الحياة بدلاً من الحذف المباشر.', keywords: ['صالة', 'جيم', 'tenant'] },
    { route: '/subscriptions', title: 'دورات الاشتراك', permission: 'ManageTenants', purpose: 'حالة ومدة وخطة كل اشتراك SaaS.', action: 'راجع النهاية والفاتورة قبل transition أو extend.', keywords: ['اشتراك', 'تجديد', 'تمديد'] },
    { route: '/plans', title: 'الخطط والأسعار', permission: 'ManagePlans', purpose: 'قوالب الخطط ومدتها وأسعارها وميزاتها.', action: 'تعديل الخطة لا يغير Snapshot اشتراك مفعل.', keywords: ['خطة', 'سعر', 'باقة'] },
    { route: '/features', title: 'كتالوج الميزات', permission: 'ManagePlans', purpose: 'تعريف FeatureKey وحالة الميزة وربطها التجاري.', action: 'لا تغيّر FeatureKey؛ استخدم الأرشفة لحفظ التاريخ.', keywords: ['ميزة', 'feature', 'خاصية'] },
    { route: '/feature-overrides', title: 'استثناءات الميزات', permission: 'ManagePlans', purpose: 'قرار فتح/غلق ميزة لصالة مع سبب ومدة.', action: 'لا يتجاوز الاستثناء Global Disable أو إيقاف الصالة.', keywords: ['استثناء', 'override'] },
    { route: '/quota-definitions', title: 'حدود الاستخدام', permission: 'ManagePlans', purpose: 'تعريف Quota للميزات القابلة للقياس.', action: 'التحقق والحجز في الخادم، وليس في الواجهة فقط.', keywords: ['كوتا', 'quota', 'حد'] },
    { route: '/feature-dependencies', title: 'اعتماديات الميزات', permission: 'ManagePlans', purpose: 'ربط ميزة بميزة مطلوبة قبلها.', action: 'تجنب الاعتماد الدائري أو ربط الميزة بنفسها.', keywords: ['اعتمادية', 'dependency'] },
    { route: '/payment-methods', title: 'طرق الدفع', permission: 'ManagePaymentRequests', purpose: 'وسائل الدفع اليدوي وتعليمات التحصيل.', action: 'لا تضع أسرار التحصيل في وصف ظاهر للمستخدم.', keywords: ['دفع', 'طريقة', 'تحويل'] },
    { route: '/payment-requests', title: 'طلبات الدفع', permission: 'ManagePaymentRequests', purpose: 'إثباتات الدفع وقرارات الموافقة أو الرفض.', action: 'طابق المرجع والمبلغ والعملة قبل الاعتماد.', keywords: ['طلب دفع', 'موافقة', 'رفض'] },
    { route: '/backups', title: 'النسخ الاحتياطية', permission: 'ManagePlatformBackups', purpose: 'إنشاء ومتابعة وتنزيل نسخ قاعدة البيانات.', action: 'نزّل واحفظ النسخ في مكان محمي واختبر الاستعادة خارج الإنتاج.', keywords: ['باك اب', 'backup', 'استعادة'] },
    { route: '/database-resources', title: 'موارد قواعد البيانات', permission: 'ManagePlatformBackups', purpose: 'مراجعة حالة موارد قواعد البيانات والاتصال المحمي دون كشف أسرار.', action: 'حدّث القائمة أو أعد المحاولة؛ التخصيص والإصلاح والنسخ تتم من تدفقات الخادم المحمية.', keywords: ['موارد قواعد البيانات', 'database resources', 'resource pool'] },
    { route: '/audit-logs', title: 'سجل المراجعة', permission: 'ManagePlatformReports', purpose: 'تاريخ التغييرات ومنفذيها.', action: 'بحث وقراءة فقط؛ لا تعديل أو حذف.', keywords: ['audit', 'تدقيق', 'سجل'] },
    { route: '/invoices', title: 'الفواتير', permission: 'ManagePlatformReports', purpose: 'السجل المالي المرقم للمنصة.', action: 'التصحيح بعملية عكسية جديدة، لا بتعديل فاتورة معتمدة.', keywords: ['فاتورة', 'invoice'] },
    { route: '/administrators', title: 'مديرو المنصة', permission: 'ManagePlatformReports', purpose: 'حسابات فريق الإدارة المركزية.', action: 'امنح أقل صلاحية وعطّل الحساب بدلاً من حذف تاريخه.', keywords: ['ادمن', 'مدير', 'administrator'] },
    { route: '/roles', title: 'الأدوار والصلاحيات', permission: 'ManagePlatformReports', purpose: 'سياسات وصول فريق المنصة.', action: 'راجع أثر ManagePlatform قبل الحفظ.', keywords: ['صلاحية', 'دور', 'role'] },
    { route: '/operations', title: 'العمليات الخلفية', permission: 'ManagePlatformReports', purpose: 'Jobs وOutbox ومتابعة إعادة المحاولة.', action: 'لا تحذف سجلات العمليات؛ شخّص السبب من التنبيهات والسجل.', keywords: ['job', 'outbox', 'عمليات'] },
    { route: '/reports', title: 'التقارير', permission: 'ManagePlatformReports', purpose: 'مؤشرات مالية وتشغيلية مجمعة.', action: 'استخدم التقرير للاكتشاف ثم تحقق من المصدر.', keywords: ['تقرير', 'report'] },
    { route: '/alerts', title: 'مركز التنبيهات', permission: 'ManagePlatformReports', purpose: 'المخاطر والحالات التي تحتاج اهتماماً.', action: 'ابدأ بالحرج ثم انتقل إلى المصدر التشغيلي.', keywords: ['تنبيه', 'alert', 'خطأ'] },
  ];

  readonly filteredSections = computed(() => this.sections.filter((section) => matches(this.query, [section.title, section.summary, ...section.keywords, ...section.items])));
  readonly filteredScreens = computed(() => this.screens.filter((screen) => matches(this.query, [screen.title, screen.permission, screen.purpose, screen.action, ...screen.keywords])));

  toggle(id: string): void {
    this.expanded.update((current) => current === id ? null : id);
  }
}

function matches(query: string, values: string[]): boolean {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return true;
  const content = normalize(values.join(' '));
  return normalizedQuery.split(' ').every((word) => content.includes(word));
}

function normalize(value: string): string {
  return value.toLocaleLowerCase('ar').normalize('NFD').replace(/[\u064B-\u065F\u0670]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}
