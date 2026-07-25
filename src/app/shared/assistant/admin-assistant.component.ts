import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssistantAction } from './admin-assistant.catalog';
import { AdminAssistantService } from './admin-assistant.service';

@Component({
  selector: 'app-admin-assistant',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <button
      type="button"
      class="lf-assistant-fab"
      aria-label="فتح المساعد الذكي"
      title="المساعد الذكي — Ctrl+K"
      (click)="openGuide()">
      <i class="pi pi-sparkles"></i>
      <span class="hidden sm:inline">مساعد المنصة</span>
      <kbd class="hidden xl:inline">Ctrl K</kbd>
    </button>

    @if (assistant.isOpen()) {
      <div class="fixed inset-0 z-[70] flex items-end justify-start bg-slate-950/35 p-3 backdrop-blur-[2px] sm:p-5" (click)="assistant.close()">
        <aside class="lf-assistant-panel" role="dialog" aria-modal="true" aria-label="مساعد إدارة المنصة" (click)="$event.stopPropagation()">
          <header class="border-b border-slate-100 bg-gradient-to-l from-indigo-600 via-blue-600 to-cyan-500 px-5 py-5 text-white">
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-center gap-3">
                <span class="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 text-xl shadow-lg shadow-blue-950/20"><i class="pi pi-sparkles"></i></span>
                <div>
                  <p class="m-0 text-[11px] font-bold tracking-[.16em] text-blue-100">دليل تشغيل LogicFit</p>
                  <h2 class="m-0 mt-1 text-base font-extrabold">كيف أساعدك الآن؟</h2>
                </div>
              </div>
              <button type="button" class="grid h-9 w-9 place-items-center rounded-xl text-white/90 transition hover:bg-white/15" aria-label="إغلاق" (click)="assistant.close()"><i class="pi pi-times"></i></button>
            </div>
            <label class="relative mt-4 block">
              <i class="pi pi-search pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                #searchInput
                class="w-full rounded-xl border-0 bg-white py-3 pr-10 pl-4 text-sm font-medium text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:ring-4 focus:ring-white/25"
                [ngModel]="assistant.query()"
                (ngModelChange)="onQuery($event)"
                placeholder="اكتب ما تريد فعله: إضافة صالة، مراجعة دفع، نسخة احتياطية…"
                aria-label="ابحث عن صفحة أو إجراء" />
            </label>
            <p class="m-0 mt-2 text-xs leading-5 text-blue-100">ابحث بالعربية أو الإنجليزية؛ لن ينفذ المساعد أي عملية حساسة تلقائياً.</p>
          </header>

          <nav class="grid grid-cols-2 gap-1 border-b border-slate-100 bg-slate-50 p-2" aria-label="أقسام المساعد">
            <button type="button" class="lf-assistant-tab" [class.lf-assistant-tab-active]="assistant.view() === 'guide'" (click)="assistant.setView('guide')"><i class="pi pi-compass"></i> شرح الشاشة</button>
            <button type="button" class="lf-assistant-tab" [class.lf-assistant-tab-active]="assistant.view() === 'search'" (click)="assistant.setView('search')"><i class="pi pi-search"></i> بحث وإجراءات</button>
          </nav>

          <section class="max-h-[min(62vh,640px)] overflow-y-auto px-5 py-5">
            @if (assistant.view() === 'guide' && !assistant.query()) {
              @let guide = assistant.currentGuide();
              <div class="flex items-start gap-3">
                <span class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-lg text-blue-600"><i [class]="guide.icon"></i></span>
                <div>
                  <p class="m-0 text-[11px] font-bold text-blue-600">أنت الآن في</p>
                  <h3 class="m-0 mt-1 text-lg font-extrabold text-slate-800">{{ guide.title }}</h3>
                  <p class="m-0 mt-2 text-sm leading-6 text-slate-600">{{ guide.overview }}</p>
                </div>
              </div>

              <div class="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <h4 class="m-0 flex items-center gap-2 text-sm font-extrabold text-slate-800"><i class="pi pi-list-check text-emerald-600"></i> أفضل طريقة للعمل</h4>
                <ol class="m-0 mt-3 space-y-3 pr-0">
                  @for (step of guide.steps; track step; let index = $index) {
                    <li class="flex gap-3 text-sm leading-5 text-slate-600"><span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-xs font-extrabold text-blue-600 shadow-sm">{{ index + 1 }}</span><span>{{ step }}</span></li>
                  }
                </ol>
              </div>

              @if (guide.buttons.length) {
                <div class="mt-5">
                  <h4 class="m-0 text-sm font-extrabold text-slate-800">ماذا تفعل أزرار الصفحة؟</h4>
                  <div class="mt-3 space-y-2">
                    @for (button of guide.buttons; track button.label) {
                      <div class="rounded-xl border border-slate-100 px-3 py-3"><b class="text-sm text-slate-700">{{ button.label }}</b><p class="m-0 mt-1 text-xs leading-5 text-slate-500">{{ button.description }}</p></div>
                    }
                  </div>
                </div>
              }

              @if (guide.warnings.length) {
                <div class="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <h4 class="m-0 flex items-center gap-2 text-sm font-extrabold text-amber-900"><i class="pi pi-shield"></i> تنبيه تشغيلي</h4>
                  <ul class="m-0 mt-2 space-y-1 pr-4 text-xs leading-5 text-amber-800">
                    @for (warning of guide.warnings; track warning) { <li>{{ warning }}</li> }
                  </ul>
                </div>
              }

              <div class="mt-5">
                <div class="flex items-center justify-between gap-3"><h4 class="m-0 text-sm font-extrabold text-slate-800">إجراءات سريعة وآمنة</h4><button type="button" class="text-xs font-bold text-blue-600 hover:text-blue-800" (click)="assistant.setView('search')">عرض الكل</button></div>
                <div class="mt-3 grid gap-2">
                  @for (action of guide.quickActions; track action.id) {
                    @if (assistant.isAllowed(action.permissions)) {
                      <button type="button" class="lf-assistant-action" (click)="run(action)"><span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><i [class]="action.icon"></i></span><span class="min-w-0 text-right"><b>{{ action.title }}</b><small>{{ action.description }}</small></span><i class="pi pi-angle-left mr-auto text-xs text-slate-400"></i></button>
                    }
                  }
                </div>
              </div>
            } @else {
              <div class="flex items-center justify-between gap-3"><div><p class="m-0 text-xs font-bold text-blue-600">بحث في الصفحات والإجراءات المتاحة لك</p><h3 class="m-0 mt-1 text-base font-extrabold text-slate-800">{{ assistant.query() ? 'نتائج البحث' : 'اختصارات المنصة' }}</h3></div><span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">{{ assistant.searchResults().length }}</span></div>
              <div class="mt-4 space-y-2">
                @for (result of assistant.searchResults(); track result.action.id) {
                  <button type="button" class="lf-assistant-action" (click)="run(result.action)"><span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600"><i [class]="result.icon"></i></span><span class="min-w-0 text-right"><span class="mb-1 inline-flex rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">{{ result.label }}</span><b>{{ result.title }}</b><small>{{ result.description }}</small></span><i class="pi pi-angle-left mr-auto text-xs text-slate-400"></i></button>
                } @empty {
                  <div class="rounded-2xl border border-dashed border-slate-200 p-6 text-center"><i class="pi pi-search text-xl text-slate-300"></i><p class="m-0 mt-2 text-sm font-bold text-slate-600">لا توجد نتيجة مطابقة</p><p class="m-0 mt-1 text-xs text-slate-400">جرّب مثلاً: صالة، خطة، دفع، نسخة احتياطية، صلاحيات.</p></div>
                }
              </div>
            }
          </section>

          <footer class="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3 text-[11px] text-slate-500"><span><i class="pi pi-shield ml-1 text-emerald-600"></i> الإجراءات الحساسة تبقى محمية بالصلاحيات والتأكيد.</span><kbd class="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-sans text-slate-600">Ctrl + K</kbd></footer>
        </aside>
      </div>
    }
  `,
  styles: [`
    .lf-assistant-fab { position:fixed; z-index:60; bottom:1.25rem; left:1.25rem; display:flex; align-items:center; gap:.55rem; min-height:3.1rem; padding:0 .9rem; border-radius:1rem; color:#fff; background:linear-gradient(135deg,#2563eb,#4f46e5); box-shadow:0 14px 32px rgba(37,99,235,.34); font-size:.79rem; font-weight:800; transition:transform .16s,box-shadow .16s; }
    .lf-assistant-fab:hover { transform:translateY(-2px); box-shadow:0 18px 36px rgba(37,99,235,.42); }.lf-assistant-fab i { font-size:1rem; }.lf-assistant-fab kbd { border:1px solid rgba(255,255,255,.25); border-radius:.45rem; padding:.18rem .35rem; color:#dbeafe; font:inherit; font-size:.64rem; }
    .lf-assistant-panel { width:min(100%,34rem); overflow:hidden; border:1px solid rgba(255,255,255,.75); border-radius:1.25rem; background:#fff; box-shadow:0 28px 80px rgba(15,23,42,.32); animation:assistant-in .18s ease-out; }
    .lf-assistant-tab { display:flex; align-items:center; justify-content:center; gap:.45rem; border-radius:.7rem; padding:.65rem .75rem; color:#64748b; font-size:.78rem; font-weight:800; transition:.15s; }.lf-assistant-tab:hover { color:#2563eb; background:#eff6ff; }.lf-assistant-tab-active { color:#1d4ed8!important; background:#fff!important; box-shadow:0 1px 3px rgba(15,23,42,.08); }
    .lf-assistant-action { display:flex; width:100%; align-items:center; gap:.7rem; border:1px solid #e8edf5; border-radius:.9rem; padding:.7rem; text-align:right; transition:.15s; }.lf-assistant-action:hover { border-color:#bfdbfe; background:#f8fbff; transform:translateX(-1px); }.lf-assistant-action b,.lf-assistant-action small { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }.lf-assistant-action b { color:#334155; font-size:.8rem; font-weight:800; }.lf-assistant-action small { margin-top:.2rem; color:#94a3b8; font-size:.68rem; }
    @keyframes assistant-in { from { opacity:0; transform:translateY(12px) scale(.98); } to { opacity:1; transform:translateY(0) scale(1); } }
    @media (max-width:639px) { .lf-assistant-panel { max-height:calc(100vh - 1.5rem); border-radius:1.1rem; }.lf-assistant-fab { bottom:1rem; left:1rem; width:3.25rem; justify-content:center; padding:0; } }
  `],
})
export class AdminAssistantComponent {
  constructor(readonly assistant: AdminAssistantService) {}

  openGuide(): void {
    this.assistant.openGuide();
  }

  onQuery(value: string): void {
    this.assistant.setQuery(value);
    this.assistant.setView('search');
  }

  run(action: AssistantAction): void {
    this.assistant.run(action);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyboard(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.assistant.openSearch();
    }
    if (event.key === 'Escape' && this.assistant.isOpen()) this.assistant.close();
  }
}
