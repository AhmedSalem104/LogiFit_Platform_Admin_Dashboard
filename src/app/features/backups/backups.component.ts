import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { ServerPaginatorComponent } from '../../shared/ui/server-paginator.component';
import {
  BackupsService,
  BackupArtifact,
  BackupBatch,
  BackupRecord,
  BackupScope,
  BackupStatus,
  RestoreCapabilities,
} from './backups.service';
import { ADMIN_ASSISTANT_COMMAND_EVENT } from '../../shared/assistant/admin-assistant.service';
import { PlatformTenantDto, TenantStatus } from '../../core/models/platform.models';
import { TenantsService } from '../tenants/tenants.service';
import { DatabaseResource, DatabaseResourceStatus, DatabaseResourcesService } from '../database-resources/database-resources.service';

type BackupMode = 'workspace' | 'platform';
type WorkspaceTypeLabel = 'Gym' | 'FreelanceCoach' | 'Unknown';
type WorkspaceTypeFilter = 'all' | 'Gym' | 'FreelanceCoach';

@Component({
  selector: 'app-backups',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TableModule, ButtonModule, PageHeaderComponent, ServerPaginatorComponent],
  template: `
    <app-page-header
      title="النسخ الاحتياطية"
      subtitle="اختر مساحة عمل واحدة لنسخة مستقلة، أو افتح وضع نسخ المنصة للعمليات الجماعية."
      icon="pi pi-database">
    </app-page-header>

    <section class="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-2xl shadow-indigo-950/20" aria-live="polite">
      <div class="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl"></div>
      <div class="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl"></div>

      <ng-container *ngIf="status() as backupStatus; else statusPending">
        <div class="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div class="max-w-2xl">
            <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
              <span class="h-2 w-2 rounded-full" [class.bg-emerald-400]="backupStatus.isReady" [class.bg-amber-300]="!backupStatus.isReady"></span>
              {{ readinessLabel(backupStatus) }}
            </div>
            <h2 class="m-0 text-2xl font-black tracking-tight sm:text-3xl">{{ readinessTitle(backupStatus) }}</h2>
            <p class="mb-0 mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">{{ readinessMessage(backupStatus) }}</p>
          </div>
          <button
            pButton
            type="button"
            label="تحديث الحالة"
            icon="pi pi-refresh"
            [loading]="refreshing()"
            [disabled]="refreshing()"
            [attr.aria-busy]="refreshing()"
            (click)="refresh()"
            class="!border-white/20 !bg-white/10 !px-5 !py-3 !font-semibold !text-white hover:!bg-white/20"></button>
        </div>

        <div class="relative mt-6 rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="m-0 text-xs font-semibold uppercase tracking-wide text-cyan-200">نوع العملية</p>
              <p class="mb-0 mt-1 text-sm text-slate-300">افصل النسخة الفردية عن نسخ المنصة حتى لا تختار نطاقًا خاطئًا.</p>
            </div>
            <div class="flex flex-wrap gap-2" role="tablist" aria-label="نوع النسخة">
              <button type="button" role="tab" [attr.aria-selected]="backupMode() === 'workspace'" (click)="setMode('workspace')" class="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition" [ngClass]="backupMode() === 'workspace' ? 'border-cyan-300 bg-cyan-300 text-slate-950' : 'border-white/20 bg-white/10 text-white'">
                <i class="pi pi-building"></i> مساحة عمل واحدة
              </button>
              <button type="button" role="tab" [attr.aria-selected]="backupMode() === 'platform'" (click)="setMode('platform')" class="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition" [ngClass]="backupMode() === 'platform' ? 'border-violet-300 bg-violet-300 text-slate-950' : 'border-white/20 bg-white/10 text-white'">
                <i class="pi pi-sitemap"></i> نسخ المنصة والنظام
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="backupMode() === 'workspace'" class="relative mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p class="m-0 text-sm font-extrabold text-white">نسخة مساحة عمل مستقلة</p>
              <p class="mb-0 mt-1 max-w-2xl text-xs leading-5 text-cyan-100">اختر Gym أو FreelanceCoach واحدًا فقط. سيرسل النظام معرّف المساحة إلى الخادم، ويتحقق الخادم من الـmapping والاتصال قبل التصدير.</p>
            </div>
            <div class="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_180px]">
              <label for="workspace-search" class="flex flex-col gap-1 text-xs font-semibold text-slate-100">
                بحث بالاسم أو الـsubdomain
                <input id="workspace-search" type="search" [value]="tenantSearch()" (input)="setTenantSearch($any($event.target).value)" placeholder="مثال: Air Gym أو airgym" class="min-w-0 rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2.5 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-cyan-300">
              </label>
              <label for="workspace-type" class="flex flex-col gap-1 text-xs font-semibold text-slate-100">
                نوع المساحة
                <select id="workspace-type" [value]="tenantTypeFilter()" (change)="setTenantTypeFilter($any($event.target).value)" class="rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-cyan-300">
                  <option value="all">كل الأنواع</option>
                  <option value="Gym">Gym فقط</option>
                  <option value="FreelanceCoach">FreelanceCoach فقط</option>
                </select>
              </label>
            </div>
          </div>

          <div *ngIf="tenantLoading()" class="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/30 p-4 text-sm text-cyan-100"><i class="pi pi-spin pi-spinner"></i> جارٍ تحميل مساحات العمل وربط قواعد البيانات…</div>
          <div *ngIf="!tenantLoading() && tenantLoadError()" class="mt-4 flex items-start gap-3 rounded-xl border border-red-300/30 bg-red-300/10 p-4 text-sm text-red-100" role="alert"><i class="pi pi-times-circle mt-0.5"></i><span>{{ tenantLoadError() }}</span></div>
          <div *ngIf="!tenantLoading() && !tenantLoadError() && tenants().length === 0" class="mt-4 rounded-xl border border-white/10 bg-slate-950/30 p-6 text-center text-sm text-slate-300"><i class="pi pi-inbox mb-2 block text-2xl text-slate-500"></i>لا توجد مساحات عمل نشطة متاحة للاختيار.</div>
          <div *ngIf="!tenantLoading() && !tenantLoadError() && tenants().length > 0 && filteredTenants().length === 0" class="mt-4 rounded-xl border border-white/10 bg-slate-950/30 p-6 text-center text-sm text-slate-300">لا توجد نتيجة مطابقة للبحث أو النوع المختار.</div>

          <div *ngIf="!tenantLoading() && filteredTenants().length > 0" class="mt-4 grid gap-3 xl:grid-cols-2">
            <button *ngFor="let tenant of filteredTenants(); trackBy: trackTenant" type="button" (click)="selectTenant(tenant.id)" class="w-full rounded-2xl border p-4 text-right transition hover:border-cyan-300/70 hover:bg-white/[0.08]" [ngClass]="selectedTenantIds()[0] === tenant.id ? 'border-cyan-300 bg-cyan-300/10' : 'border-white/10 bg-slate-950/20'" [attr.aria-pressed]="selectedTenantIds()[0] === tenant.id">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold" [ngClass]="workspaceTypeClass(tenant)"><i [ngClass]="workspaceTypeIcon(tenant)"></i>{{ workspaceTypeLabel(tenant) }}</span>
                    <span class="rounded-full bg-emerald-300/15 px-2.5 py-1 text-[11px] font-bold text-emerald-200">نشطة</span>
                  </div>
                  <p class="mb-0 mt-3 truncate text-base font-extrabold text-white" [title]="tenant.name">{{ tenant.name }}</p>
                  <p class="mb-0 mt-1 truncate font-mono text-xs text-slate-400" dir="ltr">{{ tenant.subdomain || 'بدون subdomain' }}</p>
                </div>
                <i *ngIf="selectedTenantIds()[0] === tenant.id" class="pi pi-check-circle text-xl text-cyan-300" aria-label="تم الاختيار"></i>
              </div>
              <div class="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 text-xs">
                <span class="text-slate-400">حالة قاعدة البيانات:</span>
                <span class="rounded-full px-2 py-1 font-bold" [ngClass]="resourceStatusClass(resourceForTenant(tenant.id))">{{ resourceStatusLabel(resourceForTenant(tenant.id)) }}</span>
                <span *ngIf="resourceForTenant(tenant.id)?.lastBackupCompletedAtUtc" class="text-slate-400">آخر نسخة: {{ resourceForTenant(tenant.id)?.lastBackupCompletedAtUtc | date:'short' }}</span>
              </div>
            </button>
          </div>

          <div *ngIf="selectedTenant() as selected" class="mt-4 flex flex-col gap-3 rounded-2xl border border-cyan-200/30 bg-slate-950/35 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-start gap-3">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/15 text-cyan-200"><i class="pi pi-shield"></i></span>
              <div>
                <p class="m-0 text-sm font-extrabold text-white">المحدد للنسخ: {{ selected.name }}</p>
                <p class="mb-0 mt-1 text-xs text-cyan-100">{{ workspaceTypeLabel(selected) }} · {{ selected.subdomain || 'بدون subdomain' }} · سيتم إنشاء ملف واحد لهذه المساحة فقط.</p>
                <p *ngIf="!isTenantBackupReady(selected)" class="mb-0 mt-1 text-xs font-bold text-amber-200">لا يمكن البدء قبل أن تكون قاعدة البيانات في حالة مخصصة/Allocated.</p>
              </div>
            </div>
            <button pButton type="button" label="أخذ نسخة لهذه المساحة" icon="pi pi-download" [loading]="creating()" [disabled]="!backupStatus.isReady || creating() || !isTenantBackupReady(selected)" [attr.aria-busy]="creating()" (click)="create()" class="!border-0 !bg-cyan-300 !px-5 !py-3 !font-bold !text-slate-950 hover:!bg-cyan-200 disabled:!opacity-50"></button>
          </div>
        </div>

        <div *ngIf="backupMode() === 'platform'" class="relative mt-4 rounded-2xl border border-violet-300/20 bg-violet-300/10 p-4">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p class="m-0 text-sm font-extrabold text-white">نسخ المنصة والنظام</p>
              <p class="mb-0 mt-1 max-w-2xl text-xs leading-5 text-violet-100">هذه العمليات الجماعية منفصلة عن نسخة Gym واحدة. اختر النطاق ثم راجع كل هدف في سجل الدفعة قبل التنزيل.</p>
            </div>
            <label for="platform-scope" class="flex min-w-72 flex-col gap-1 text-xs font-semibold text-slate-100">
              نطاق العملية
              <select id="platform-scope" [value]="selectedScope()" (change)="selectScope($any($event.target).value)" class="rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-violet-300">
                <option *ngFor="let option of platformScopeOptions" [value]="option.value">{{ option.label }}</option>
              </select>
            </label>
          </div>
          <div class="mt-4 flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-950/25 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p class="m-0 text-xs leading-5 text-violet-100">{{ scopeDescription(selectedScope()) }}</p>
            <button pButton type="button" label="تشغيل النطاق" icon="pi pi-shield" [loading]="creating()" [disabled]="!backupStatus.isReady || creating()" (click)="create()" class="!border-0 !bg-violet-300 !px-5 !py-3 !font-bold !text-slate-950 hover:!bg-violet-200 disabled:!opacity-50"></button>
          </div>
        </div>

        <div *ngIf="!backupStatus.isReady" class="relative mt-6 flex items-start gap-3 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
          <i class="pi pi-exclamation-triangle mt-0.5 text-amber-300"></i>
          <div><p class="m-0 font-bold">إنشاء النسخ الاحتياطية غير متاح</p><p class="mb-0 mt-1 leading-5">{{ backupStatus.unavailableReason || 'فعّل مزود النسخ الاحتياطية على الخادم واضبطه قبل إنشاء نسخة.' }}</p></div>
        </div>
        <div *ngIf="backupStatus.isReady" class="relative mt-6 flex items-start gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-100">
          <i class="pi pi-info-circle mt-0.5 text-cyan-300"></i>
          <p class="m-0 leading-5">يفك الخادم تشفير الربط داخليًا فقط، ويتحقق من الاتصال ثم يصدر BACPAC ويحسِب SHA-256. لا تعرض الشاشة Connection String أو اسم قاعدة البيانات.</p>
        </div>

        <div class="relative mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div class="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm"><p class="m-0 text-xs text-slate-400">صيغة التصدير</p><p class="mb-0 mt-2 text-lg font-extrabold">{{ backupStatus.format || '—' }}</p><span class="text-xs text-cyan-200">المخطط + البيانات</span></div>
          <div class="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm"><p class="m-0 text-xs text-slate-400">مدة الاحتفاظ</p><p class="mb-0 mt-2 text-lg font-extrabold">{{ backupStatus.retentionDays }} يومًا</p><span class="text-xs text-slate-300">تنظيف تلقائي</span></div>
          <div class="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm"><p class="m-0 text-xs text-slate-400">الأرشيفات المتاحة</p><p class="mb-0 mt-2 text-lg font-extrabold">{{ backupStatus.backupCount }}</p><span class="text-xs text-slate-300">تخزين خاص على الخادم</span></div>
          <div class="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm"><p class="m-0 text-xs text-slate-400">الجدولة اليومية</p><p class="mb-0 mt-2 text-lg font-extrabold">{{ backupStatus.runAtUtc || 'غير مجدولة' }} <span *ngIf="backupStatus.runAtUtc" class="text-xs font-medium text-slate-300" dir="ltr">UTC</span></p><span class="text-xs text-slate-300">وقت يحدده الخادم</span></div>
        </div>
      </ng-container>
      <ng-template #statusPending><div class="relative flex min-h-48 items-center gap-3 text-slate-200"><i class="pi pi-spin pi-spinner text-xl text-cyan-300"></i><span>جارٍ التحقق من جاهزية خدمة النسخ الاحتياطية…</span></div></ng-template>
    </section>

    <div *ngIf="statusError()" class="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert"><i class="pi pi-times-circle mt-0.5"></i><div><p class="m-0 font-bold">تعذر قراءة أحدث حالة للنسخ الاحتياطية</p><p class="mb-0 mt-1">{{ statusError() }}</p></div></div>

    <div *ngIf="lastCreatedBatch() as recentBatch" class="mb-6 flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 sm:flex-row sm:items-center sm:justify-between">
      <div><p class="m-0 font-bold">تم استلام طلب النسخ الاحتياطي</p><p class="mb-0 mt-1">{{ batchTargetSummary(recentBatch) }} · {{ batchStatusLabel(recentBatch.status) }} · {{ completedCount(recentBatch) }}/{{ recentBatch.artifacts.length }} هدفًا مكتملًا</p></div>
      <span class="font-mono text-xs text-emerald-700">{{ recentBatch.id }}</span>
    </div>

    <section class="mb-6 grid gap-4 lg:grid-cols-3">
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><i class="pi pi-lock"></i></div><h3 class="m-0 text-sm font-bold text-slate-900">تخزين خاص</h3><p class="mb-0 mt-2 text-sm leading-6 text-slate-500">تبقى الملفات خلف نقطة التنزيل المحمية. لا تُعرض سلاسل الاتصال أو بيانات اعتماد المزود.</p></article>
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><i class="pi pi-check-square"></i></div><h3 class="m-0 text-sm font-bold text-slate-900">ملف مستقل لكل هدف</h3><p class="mb-0 mt-2 text-sm leading-6 text-slate-500">تظهر مساحة العمل ونوعها وحجم الملف وبصمة SHA-256 لكل هدف بدل معرف مبهم.</p></article>
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><i class="pi pi-history"></i></div><h3 class="m-0 text-sm font-bold text-slate-900">إعادة محاولة آمنة</h3><p class="mb-0 mt-2 text-sm leading-6 text-slate-500">لا تظهر إعادة المحاولة إلا للدفعات الفاشلة أو الجزئية، ويعيد الخادم الأهداف غير المكتملة فقط.</p></article>
    </section>

    <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 class="m-0 text-lg font-extrabold text-slate-900">سجل عمليات النسخ</h2><p class="mb-0 mt-1 text-sm text-slate-500">{{ backupMode() === 'workspace' ? 'يعرض نسخ مساحة عمل واحدة فقط؛ اختر مساحة من الأعلى لتحديدها.' : 'يعرض عمليات المنصة والنطاقات الجماعية فقط.' }}</p></div><span class="inline-flex w-fit items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700"><i class="pi pi-sitemap"></i>{{ visibleBatches().length }} دفعة</span></div>
      <div *ngIf="batchError()" class="mx-5 mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert"><i class="pi pi-times-circle mt-0.5"></i><span>{{ batchError() }}</span></div>
      <div *ngIf="batchLoading()" class="flex items-center gap-2 px-5 py-8 text-sm text-slate-500"><i class="pi pi-spin pi-spinner text-indigo-500"></i>جارٍ تحميل سجل الدفعات…</div>
      <div *ngIf="!batchLoading() && visibleBatches().length === 0 && !batchError()" class="px-5 py-10 text-center text-sm text-slate-500"><i class="pi pi-inbox mb-3 block text-3xl text-slate-300"></i><p class="m-0 font-bold">لا توجد دفعات في هذا الوضع حتى الآن.</p><p class="mb-0 mt-1">شغّل نسخة مساحة عمل واحدة أو بدّل إلى نسخ المنصة والنظام.</p></div>

      <div *ngFor="let batch of visibleBatches(); trackBy: trackBatch" class="border-b border-slate-100 px-5 py-5 last:border-b-0">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div class="min-w-0"><div class="flex flex-wrap items-center gap-2"><span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{{ scopeLabel(batch.scope) }}</span><span class="rounded-full px-2.5 py-1 text-xs font-bold" [ngClass]="batchStatusClass(batch.status)">{{ batchStatusLabel(batch.status) }}</span><span class="text-xs text-slate-400">{{ completedCount(batch) }}/{{ batch.artifacts.length }} هدفًا مكتملًا</span></div><div class="mt-3 h-2 max-w-xl overflow-hidden rounded-full bg-slate-100" role="progressbar" [attr.aria-valuenow]="progressPercent(batch)" aria-valuemin="0" aria-valuemax="100"><div class="h-full rounded-full bg-indigo-500 transition-all" [style.width.%]="progressPercent(batch)"></div></div><p class="mb-0 mt-2 text-xs text-slate-500">بدأت {{ batch.startedAtUtc | date:'medium' }} <span *ngIf="batch.completedAtUtc">· اكتملت {{ batch.completedAtUtc | date:'medium' }}</span></p><p class="mb-0 mt-1 truncate font-mono text-[11px] text-slate-400" [title]="batch.id">الدفعة {{ batch.id }}</p></div><div class="flex flex-wrap gap-2"><button *ngIf="batch.manifestStorageKey" pButton type="button" label="تنزيل البيان" icon="pi pi-file-export" [loading]="downloadingFile() === batch.manifestStorageKey" [disabled]="downloadingFile() !== null" (click)="downloadManifest(batch)" class="!border-slate-200 !bg-slate-50 !text-slate-700 hover:!bg-slate-100"></button><button *ngIf="isRetryable(batch)" pButton type="button" label="إعادة محاولة الفاشل" icon="pi pi-refresh" [loading]="batchAction() === batch.id" [disabled]="batchAction() !== null" (click)="retry(batch)" class="!border-amber-200 !bg-amber-50 !text-amber-800 hover:!bg-amber-100"></button></div></div>
        <div *ngIf="batch.artifacts.length > 0; else noArtifacts" class="mt-4 grid gap-3 xl:grid-cols-2"><article *ngFor="let artifact of batch.artifacts; trackBy: trackArtifact" class="rounded-xl border border-slate-100 bg-slate-50/70 p-4"><div class="flex items-start justify-between gap-3"><div class="min-w-0"><div class="flex flex-wrap items-center gap-2"><span *ngIf="artifact.tenantId" class="rounded-full px-2 py-1 text-[11px] font-extrabold" [ngClass]="artifactTypeClass(artifact)">{{ artifactTypeLabel(artifact) }}</span><span *ngIf="!artifact.tenantId" class="rounded-full bg-violet-50 px-2 py-1 text-[11px] font-extrabold text-violet-700">قاعدة المنصة</span><span class="rounded-full px-2 py-1 text-[11px] font-bold" [ngClass]="artifactStatusClass(artifact.status)">{{ artifactStatusLabel(artifact.status) }}</span></div><p class="m-0 mt-3 truncate text-sm font-bold text-slate-800" [title]="artifactLabel(artifact)">{{ artifactLabel(artifact) }}</p><p *ngIf="artifact.workspaceIdentifier" class="mb-0 mt-1 font-mono text-xs text-slate-500" dir="ltr">{{ artifact.workspaceIdentifier }}</p><p class="mb-0 mt-2 text-xs text-slate-500">الحجم: {{ formatBytes(artifact.sizeBytes) }}</p></div><button *ngIf="artifact.storageKey" pButton type="button" icon="pi pi-download" [attr.aria-label]="'تنزيل ' + artifactLabel(artifact)" [loading]="downloadingFile() === artifact.storageKey" [disabled]="downloadingFile() !== null" (click)="downloadArtifact(artifact)" class="!h-8 !w-8 !border-indigo-100 !bg-indigo-50 !text-indigo-700 hover:!bg-indigo-100"></button></div><div class="mt-3 rounded-lg bg-white p-3 text-xs text-slate-500"><span class="font-semibold text-slate-700">بصمة SHA-256:</span><code *ngIf="artifact.sha256; else noChecksum" class="ml-1 break-all text-[11px]">{{ artifact.sha256 }}</code><ng-template #noChecksum><span class="ml-1 text-amber-700">غير متاحة حتى الآن</span></ng-template></div><p *ngIf="artifact.errorCode" class="mb-0 mt-2 text-xs font-semibold text-red-700">رمز الفشل: {{ artifact.errorCode }}</p></article></div><ng-template #noArtifacts><p class="mb-0 mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">لم يُعد الخادم ملفات الأهداف لهذه الدفعة حتى الآن.</p></ng-template>
      </div>
    </section>

    <details class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><summary class="cursor-pointer list-none px-5 py-5"><div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h2 class="m-0 text-lg font-extrabold text-slate-900">أرشيف ملفات التنزيل</h2><p class="mb-0 mt-1 text-sm text-slate-500">قائمة الملفات التي يعيدها الخادم للتنزيل المحمي. راجع سجل العمليات لمعرفة المساحة المالكة لكل ملف.</p></div><span class="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600"><i class="pi pi-folder"></i>{{ totalCount }} ملفًا</span></div></summary><div class="border-t border-slate-100"><div *ngIf="archiveError()" class="mx-5 mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert"><i class="pi pi-times-circle mt-0.5"></i><span>{{ archiveError() }}</span></div><p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm"><ng-template pTemplate="header"><tr><th>الملف</th><th>تاريخ الإنشاء</th><th>الحجم</th><th>الحالة</th><th class="text-left">الإجراء</th></tr></ng-template><ng-template pTemplate="body" let-row><tr><td><div class="flex items-center gap-3"><span class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><i class="pi pi-file"></i></span><code class="text-xs font-semibold text-slate-700">{{ row.fileName }}</code></div></td><td><span class="text-sm font-medium text-slate-700">{{ row.createdAt | date:'medium' }}</span></td><td><span class="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{{ formatBytes(row.sizeBytes) }}</span></td><td><span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold" [ngClass]="recordStatusClass(row.status)"><i class="text-[10px]" [ngClass]="recordStatusIcon(row.status)"></i>{{ recordStatusLabel(row.status) }}</span></td><td class="text-left"><button pButton type="button" label="تنزيل آمن" icon="pi pi-download" [loading]="downloadingFile() === row.fileName" [disabled]="downloadingFile() !== null" (click)="download(row)" class="!border-indigo-100 !bg-indigo-50 !text-indigo-700 hover:!bg-indigo-100"></button></td></tr></ng-template><ng-template pTemplate="emptymessage"><tr><td colspan="5" class="py-12 text-center"><i class="pi pi-inbox mb-3 block text-3xl text-slate-300"></i><p class="m-0 font-bold text-slate-600">لا توجد ملفات نسخ مكتملة حتى الآن</p></td></tr></ng-template></p-table><app-server-paginator [page]="page" [pageSize]="pageSize" [totalCount]="totalCount" (pageChange)="onPageChange($event)"></app-server-paginator></div></details>

    <section class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div class="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-start sm:justify-between"><div><h2 class="m-0 text-sm font-extrabold text-slate-900">إمكانية الاستعادة</h2><p class="mb-0 mt-1 text-sm text-slate-500">تظل الاستعادة تحت تحكم المزود ولا تبدأ من شاشة الأدلة هذه.</p></div><ng-container *ngIf="restoreCapabilities() as capabilities; else restorePending"><span class="rounded-full px-3 py-1.5 text-xs font-bold" [ngClass]="capabilities.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'">{{ capabilities.enabled ? 'متاحة' : 'يدوية / غير متاحة' }}</span></ng-container><ng-template #restorePending><span class="text-xs font-semibold text-slate-400">جارٍ التحقق من المزود…</span></ng-template></div><p *ngIf="restoreCapabilities() as capabilities" class="mb-0 border-t border-slate-100 px-5 py-4 text-xs text-slate-500">{{ capabilities.enabled ? restoreDetails(capabilities) : (capabilities.unavailableReason || 'الاستعادة المباشرة غير مفعلة لهذا المزود.') }} تُسجل أحداث بدء الدفعة واكتمالها في سجل تدقيق الخادم.</p><p *ngIf="restoreError()" class="mb-0 border-t border-slate-100 px-5 py-4 text-xs font-semibold text-red-700">{{ restoreError() }}</p></section>
  `,
})
export class BackupsComponent implements OnInit {
  @HostListener(`window:${ADMIN_ASSISTANT_COMMAND_EVENT}`, ['$event'])
  onAssistantCommand(event: Event): void {
    if ((event as CustomEvent<{ command?: string }>).detail?.command === 'create-backup') this.create();
  }

  private readonly service = inject(BackupsService);
  private readonly tenantsService = inject(TenantsService);
  private readonly databaseResourcesService = inject(DatabaseResourcesService);
  private readonly notify = inject(NotifyService);

  rows = signal<BackupRecord[]>([]);
  loading = signal(false);
  creating = signal(false);
  refreshing = signal(false);
  page = 1;
  pageSize = 20;
  totalCount = 0;
  downloadingFile = signal<string | null>(null);
  status = signal<BackupStatus | null>(null);
  statusError = signal<string | null>(null);
  archiveError = signal<string | null>(null);
  batches = signal<BackupBatch[]>([]);
  batchLoading = signal(false);
  batchError = signal<string | null>(null);
  batchAction = signal<string | null>(null);
  restoreCapabilities = signal<RestoreCapabilities | null>(null);
  restoreError = signal<string | null>(null);
  lastCreatedBatch = signal<BackupBatch | null>(null);
  backupMode = signal<BackupMode>('workspace');
  selectedScope = signal<BackupScope>(BackupScope.SelectedTenants);
  readonly BackupScope = BackupScope;
  tenants = signal<PlatformTenantDto[]>([]);
  tenantLoading = signal(false);
  tenantLoadError = signal<string | null>(null);
  tenantSearch = signal('');
  tenantTypeFilter = signal<WorkspaceTypeFilter>('all');
  selectedTenantIds = signal<string[]>([]);
  databaseResources = signal<DatabaseResource[]>([]);

  scopeOptions = [
    { value: BackupScope.FullSystem, label: 'النظام بالكامل (المنصة + كل مساحات العمل)' },
    { value: BackupScope.AllTenants, label: 'كل قواعد بيانات مساحات العمل' },
    { value: BackupScope.AllGyms, label: 'كل قواعد بيانات الجيمات' },
    { value: BackupScope.AllFreelance, label: 'كل قواعد بيانات المدربين الأحرار' },
    { value: BackupScope.Platform, label: 'قاعدة بيانات المنصة فقط' },
    { value: BackupScope.SelectedTenants, label: 'مساحة عمل واحدة محددة' },
  ];
  platformScopeOptions = this.scopeOptions.filter(option => option.value !== BackupScope.SelectedTenants);

  ngOnInit(): void {
    this.loadStatus();
    this.loadTenants();
  }

  refresh(): void {
    if (this.refreshing()) return;
    this.refreshing.set(true);
    this.loadStatus();
    this.loadTenants();
  }

  setMode(mode: BackupMode): void {
    if (this.backupMode() === mode) return;
    this.backupMode.set(mode);
    this.selectedTenantIds.set([]);
    this.selectedScope.set(mode === 'workspace' ? BackupScope.SelectedTenants : BackupScope.FullSystem);
  }

  setTenantSearch(value: string): void { this.tenantSearch.set(value ?? ''); }

  setTenantTypeFilter(value: string): void {
    if (value === 'Gym' || value === 'FreelanceCoach' || value === 'all') this.tenantTypeFilter.set(value);
  }

  filteredTenants(): PlatformTenantDto[] {
    const query = this.tenantSearch().trim().toLocaleLowerCase();
    const type = this.tenantTypeFilter();
    return this.tenants().filter(tenant => {
      const matchesType = type === 'all' || this.workspaceTypeLabel(tenant) === type;
      const haystack = `${tenant.name} ${tenant.subdomain ?? ''} ${tenant.email ?? ''}`.toLocaleLowerCase();
      return matchesType && (!query || haystack.includes(query));
    });
  }

  selectTenant(tenantId: string): void {
    if (this.tenants().some(tenant => tenant.id === tenantId)) this.selectedTenantIds.set([tenantId]);
  }

  selectedTenant(): PlatformTenantDto | null {
    const id = this.selectedTenantIds()[0];
    return id ? this.tenants().find(tenant => tenant.id === id) ?? null : null;
  }

  resourceForTenant(tenantId: string): DatabaseResource | null {
    return this.databaseResources().find(resource => resource.tenantId === tenantId) ?? null;
  }

  isTenantBackupReady(tenant: PlatformTenantDto): boolean {
    const resource = this.resourceForTenant(tenant.id);
    return !!resource && (resource.status === DatabaseResourceStatus.Assigned || resource.lifecycleStatus === 'Allocated');
  }

  loadStatus(): void {
    this.statusError.set(null);
    this.service.status().subscribe({
      next: status => {
        this.status.set(status);
        this.refreshing.set(false);
        this.loadRelatedData();
      },
      error: error => {
        const message = this.readError(error, 'لم يُعد الخادم حالة جاهزية النسخ الاحتياطية.');
        this.statusError.set(message);
        this.status.set({ isEnabled: false, isReady: false, format: 'BACPAC', retentionDays: 0, runAtUtc: '', backupCount: 0, unavailableReason: message });
        this.refreshing.set(false);
        this.loadRelatedData();
      },
    });
  }

  private loadRelatedData(): void {
    this.load();
    this.loadBatches();
    this.loadRestoreCapabilities();
  }

  loadBatches(): void {
    this.batchLoading.set(true);
    this.batchError.set(null);
    this.service.listBatches().subscribe({
      next: batches => { this.batches.set(batches); this.batchLoading.set(false); },
      error: error => { this.batches.set([]); this.batchError.set(this.readError(error, 'لم يُعد الخادم سجل الدفعات.')); this.batchLoading.set(false); },
    });
  }

  loadRestoreCapabilities(): void {
    this.restoreError.set(null);
    this.service.restoreCapabilities().subscribe({
      next: capabilities => this.restoreCapabilities.set(capabilities),
      error: error => { this.restoreCapabilities.set(null); this.restoreError.set(this.readError(error, 'تعذر قراءة إمكانية الاستعادة.')); },
    });
  }

  selectScope(value: string | number): void {
    const scope = Number(value) as BackupScope;
    if (!this.platformScopeOptions.some(option => option.value === scope)) return;
    this.selectedScope.set(scope);
  }

  private loadTenants(): void {
    this.tenantLoading.set(true);
    this.tenantLoadError.set(null);
    this.tenantsService.list(TenantStatus.Active, 1, 100).subscribe({
      next: result => {
        this.tenants.set(result.items ?? []);
        this.tenantLoading.set(false);
        this.loadDatabaseResources();
      },
      error: error => {
        this.tenants.set([]);
        this.tenantLoading.set(false);
        this.tenantLoadError.set(this.readError(error, 'تعذر تحميل مساحات العمل النشطة.'));
        this.databaseResources.set([]);
      },
    });
  }

  private loadDatabaseResources(): void {
    this.databaseResourcesService.list(1, 200).subscribe({
      next: result => this.databaseResources.set(result.items ?? []),
      error: () => this.databaseResources.set([]),
    });
  }

  load(): void {
    this.loading.set(true);
    this.archiveError.set(null);
    this.service.list(this.page, this.pageSize).subscribe({
      next: result => { this.rows.set(result.items ?? []); this.totalCount = result.totalCount ?? 0; this.loading.set(false); },
      error: error => { this.rows.set([]); this.totalCount = 0; this.archiveError.set(this.readError(error, 'لم يُعد الخادم ملفات النسخ المكتملة.')); this.loading.set(false); },
    });
  }

  onPageChange(event: { page: number; pageSize: number }): void { this.page = event.page; this.pageSize = event.pageSize; this.load(); }

  create(): void {
    const backupStatus = this.status();
    if (!backupStatus?.isReady) {
      this.notify.error(backupStatus?.unavailableReason || 'خدمة النسخ الاحتياطية غير جاهزة.', 'النسخ الاحتياطية غير متاحة');
      return;
    }
    const scope = this.selectedScope();
    const tenantIds = this.selectedTenantIds();
    const selected = this.selectedTenant();
    if (this.backupMode() === 'workspace' && (tenantIds.length !== 1 || !selected)) {
      this.notify.error('اختر مساحة عمل واحدة فقط قبل إنشاء النسخة.', 'اختيار مساحة العمل مطلوب');
      return;
    }
    if (this.backupMode() === 'workspace' && selected && !this.isTenantBackupReady(selected)) {
      this.notify.error('لا توجد قاعدة بيانات مخصصة وجاهزة لهذه المساحة. راجع موارد قواعد البيانات أولًا.', 'المساحة غير جاهزة للنسخ');
      return;
    }
    if (this.creating()) return;
    this.creating.set(true);
    const targetLabel = selected ? `${selected.name} (${this.workspaceTypeLabel(selected)})` : this.scopeLabel(scope);
    void this.notify.confirm({
      header: 'تأكيد إنشاء النسخة',
      message: `سيُنشئ الخادم ملف BACPAC مستقلًا لـ «${targetLabel}» ثم يعرض الحالة والحجم والبصمة. لا تُرسل الشاشة أي Connection String.`,
      acceptLabel: 'إنشاء النسخة',
      rejectLabel: 'إلغاء',
      icon: 'pi pi-shield',
    }).then(confirmed => {
      if (!confirmed) { this.creating.set(false); return; }
      this.service.createBatch({ scope, tenantIds: this.backupMode() === 'workspace' ? tenantIds : undefined, idempotencyKey: this.createIdempotencyKey(scope, tenantIds[0]) }).subscribe({
        next: batch => {
          this.lastCreatedBatch.set(batch);
          this.creating.set(false);
          this.notify.success(`اكتملت دفعة «${this.batchTargetSummary(batch)}» بحالة ${this.batchStatusLabel(batch.status)} مع ${this.completedCount(batch)}/${batch.artifacts.length} هدفًا.`, 'اكتمل طلب النسخ الاحتياطي');
          this.loadStatus();
        },
        error: error => { this.creating.set(false); this.notify.error(this.readError(error, 'فشل طلب النسخ الاحتياطي قبل إنتاج نتيجة.'), 'فشل طلب النسخ الاحتياطي'); this.loadStatus(); },
      });
    }).catch(() => this.creating.set(false));
  }

  retry(batch: BackupBatch): void {
    if (!this.isRetryable(batch) || this.batchAction() !== null) return;
    this.batchAction.set(batch.id);
    void this.notify.confirm({ header: 'إعادة محاولة الأهداف الفاشلة؟', message: `سيعيد الخادم فقط الأهداف الفاشلة أو غير المكتملة في الدفعة ${batch.id}.`, acceptLabel: 'إعادة المحاولة', rejectLabel: 'إلغاء', icon: 'pi pi-refresh' }).then(confirmed => {
      if (!confirmed) { this.batchAction.set(null); return; }
      this.service.retryBatch(batch.id).subscribe({
        next: updated => { this.batches.update(items => items.map(item => item.id === updated.id ? updated : item)); this.batchAction.set(null); this.notify.success(`اكتمل ${this.completedCount(updated)}/${updated.artifacts.length} هدفًا.`, 'اكتملت إعادة المحاولة'); this.loadStatus(); },
        error: error => { this.batchAction.set(null); this.notify.error(this.readError(error, 'فشل طلب إعادة المحاولة.'), 'فشلت إعادة المحاولة'); this.loadBatches(); },
      });
    }).catch(() => this.batchAction.set(null));
  }

  download(row: BackupRecord): void { this.downloadFile(row.fileName, row.fileName); }
  downloadManifest(batch: BackupBatch): void { if (batch.manifestStorageKey) this.downloadFile(batch.manifestStorageKey, `${batch.id}-manifest.json`); }
  downloadArtifact(artifact: BackupArtifact): void { if (artifact.storageKey) this.downloadFile(artifact.storageKey, `${artifact.id}.bacpac`); }

  private downloadFile(resourceKey: string, downloadName: string): void {
    if (this.downloadingFile()) return;
    this.downloadingFile.set(resourceKey);
    this.service.download(resourceKey).subscribe({
      next: blob => { const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = downloadName; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 0); this.downloadingFile.set(null); },
      error: error => { this.downloadingFile.set(null); this.notify.error(this.readError(error, 'تعذر إتمام التنزيل المحمي.'), 'فشل التنزيل'); },
    });
  }

  visibleBatches(): BackupBatch[] {
    return this.batches().filter(batch => this.backupMode() === 'workspace' ? batch.scope === BackupScope.SelectedTenants : batch.scope !== BackupScope.SelectedTenants);
  }

  readinessLabel(status: BackupStatus): string { return status.isReady ? 'جاهزة لإنشاء النسخ' : 'إجراء مطلوب قبل إنشاء النسخة'; }
  readinessTitle(status: BackupStatus): string { return status.isReady ? 'أدلة النسخ الاحتياطية تحت السيطرة.' : 'خدمة النسخ الاحتياطية غير جاهزة.'; }
  readinessMessage(status: BackupStatus): string { return status.isReady ? 'ابدأ من وضع مساحة عمل واحدة إذا أردت نسخ Gym محددًا، أو انتقل إلى وضع المنصة للنطاقات الجماعية.' : (status.unavailableReason || 'فعّل مزود النسخ الاحتياطية على الخادم واضبطه قبل إنشاء نسخة.'); }

  scopeLabel(scope: BackupScope | number): string { return this.scopeOptions.find(option => option.value === Number(scope))?.label || 'نطاق غير معروف'; }
  scopeDescription(scope: BackupScope | number): string {
    switch (Number(scope)) {
      case BackupScope.FullSystem: return 'قاعدة بيانات المنصة بالإضافة إلى كل قواعد بيانات مساحات العمل المرتبطة.';
      case BackupScope.AllTenants: return 'كل قواعد بيانات مساحات العمل، دون قاعدة بيانات المنصة.';
      case BackupScope.AllGyms: return 'كل قواعد بيانات الجيمات المرتبطة.';
      case BackupScope.AllFreelance: return 'كل قواعد بيانات المدربين الأحرار المرتبطة.';
      case BackupScope.Platform: return 'قاعدة بيانات المنصة فقط.';
      default: return 'يحدد الخادم أهداف النسخ من النطاق المختار.';
    }
  }

  workspaceTypeLabel(value: { id?: string; workspaceType?: string | number | null }): WorkspaceTypeLabel {
    const fallback = value.id ? this.resourceForTenant(value.id)?.workspaceType : null;
    const normalized = String(value.workspaceType ?? fallback ?? '').toLowerCase().replace(/[ _-]/g, '');
    if (normalized === '1' || normalized === 'gym') return 'Gym';
    if (normalized === '2' || normalized === 'freelancecoach') return 'FreelanceCoach';
    return 'Unknown';
  }

  workspaceTypeClass(value: { id?: string; workspaceType?: string | number | null }): string {
    return this.workspaceTypeLabel(value) === 'Gym' ? 'bg-blue-300/15 text-blue-100' : this.workspaceTypeLabel(value) === 'FreelanceCoach' ? 'bg-violet-300/15 text-violet-100' : 'bg-slate-300/15 text-slate-200';
  }

  workspaceTypeIcon(value: { id?: string; workspaceType?: string | number | null }): string { return this.workspaceTypeLabel(value) === 'Gym' ? 'pi pi-building' : this.workspaceTypeLabel(value) === 'FreelanceCoach' ? 'pi pi-user' : 'pi pi-question-circle'; }
  artifactTypeLabel(artifact: BackupArtifact): string { return artifact.workspaceType === 'FreelanceCoach' ? 'FreelanceCoach' : artifact.workspaceType === 'Gym' ? 'Gym' : 'مساحة عمل'; }
  artifactTypeClass(artifact: BackupArtifact): string { return artifact.workspaceType === 'FreelanceCoach' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'; }

  resourceStatusLabel(resource: DatabaseResource | null): string {
    if (!resource) return 'لا يوجد ربط مخصص';
    if (resource.status === DatabaseResourceStatus.Assigned || resource.lifecycleStatus === 'Allocated') return 'مخصصة / جاهزة للنسخ';
    if (resource.status === DatabaseResourceStatus.Provisioning || resource.lifecycleStatus === 'Provisioning') return 'جارٍ التجهيز';
    if (resource.status === DatabaseResourceStatus.Available) return 'متاحة في الـPool فقط';
    if (resource.status === DatabaseResourceStatus.Faulted || resource.lifecycleStatus === 'Failed') return 'فاشلة';
    return resource.lifecycleStatus || 'غير جاهزة';
  }

  resourceStatusClass(resource: DatabaseResource | null): string {
    if (resource && (resource.status === DatabaseResourceStatus.Assigned || resource.lifecycleStatus === 'Allocated')) return 'bg-emerald-300/15 text-emerald-200';
    if (resource && (resource.status === DatabaseResourceStatus.Provisioning || resource.lifecycleStatus === 'Provisioning')) return 'bg-amber-300/15 text-amber-200';
    return 'bg-red-300/15 text-red-200';
  }

  batchTargetSummary(batch: BackupBatch): string {
    const artifact = batch.artifacts.find(item => item.tenantId);
    return artifact?.tenantName ? `${artifact.workspaceType === 'FreelanceCoach' ? 'FreelanceCoach' : 'Gym'}: ${artifact.tenantName}` : this.scopeLabel(batch.scope);
  }

  batchStatusLabel(status: string): string { switch (status) { case 'Completed': return 'مكتملة'; case 'Running': return 'قيد التنفيذ'; case 'Partial': return 'مكتملة جزئيًا'; case 'Failed': return 'فاشلة'; default: return status || 'غير معروفة'; } }
  batchStatusClass(status: string): string { return status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : status === 'Failed' ? 'bg-red-50 text-red-700' : status === 'Running' || status === 'Partial' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'; }
  artifactStatusLabel(status: string): string { return status === 'Completed' ? 'تم التحقق' : this.batchStatusLabel(status); }
  artifactStatusClass(status: string): string { return status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : status === 'Failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'; }
  recordStatusLabel(status: string): string { return status === 'Completed' ? 'مكتملة' : this.batchStatusLabel(status); }
  recordStatusClass(status: string): string { return status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'; }
  recordStatusIcon(status: string): string { return status === 'Completed' ? 'pi pi-check-circle text-emerald-600' : 'pi pi-info-circle text-amber-600'; }
  completedCount(batch: BackupBatch): number { return batch.artifacts.filter(artifact => artifact.status === 'Completed').length; }
  progressPercent(batch: BackupBatch): number { return batch.artifacts.length === 0 ? 0 : Math.round((this.completedCount(batch) / batch.artifacts.length) * 100); }
  isRetryable(batch: BackupBatch): boolean { return batch.status === 'Failed' || batch.status === 'Partial'; }
  artifactLabel(artifact: BackupArtifact): string { return artifact.tenantId ? (artifact.tenantName || `مساحة العمل (${artifact.tenantId.slice(0, 8)}…)`) : 'قاعدة بيانات المنصة'; }
  formatBytes(value: number | null | undefined): string { if (!Number.isFinite(value) || !value || value <= 0) return '—'; if (value < 1024) return `${value} B`; if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`; if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`; return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`; }
  restoreDetails(capabilities: RestoreCapabilities): string { const details: string[] = []; if (capabilities.supportsBacpacImport) details.push('استيراد BACPAC مدعوم'); if (capabilities.supportsMappingSwitch) details.push('تبديل الربط مدعوم'); return details.length > 0 ? `${details.join(' و')} من خلال المزود.` : 'أبلغ المزود بإمكانية الاستعادة.'; }

  trackTenant(_index: number, tenant: PlatformTenantDto): string { return tenant.id; }
  trackBatch(_index: number, batch: BackupBatch): string { return batch.id; }
  trackArtifact(_index: number, artifact: BackupArtifact): string { return artifact.id; }

  private readError(error: unknown, fallback: string): string { const message = errMsg(error); return message && !message.includes('غير متوقع') ? message : fallback; }
  private createIdempotencyKey(scope: BackupScope, tenantId?: string): string { const randomUuid = typeof globalThis.crypto?.randomUUID === 'function' ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`; return `dashboard:${scope}:${tenantId ?? 'platform'}:${randomUuid}`; }
}
