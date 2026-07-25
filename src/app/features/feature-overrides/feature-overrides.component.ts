import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TableModule } from 'primeng/table';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { ServerPaginatorComponent } from '../../shared/ui/server-paginator.component';
import { FeaturesService } from '../features/features.service';
import { TenantsService } from '../tenants/tenants.service';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { ADMIN_ASSISTANT_COMMAND_EVENT } from '../../shared/assistant/admin-assistant.service';

interface OverrideForm { id?: string; tenantId: string; featureId: string; isEnabled: boolean; limitOverride: number | null; reason: string; startsAt: string; endsAt: string; }

@Component({
  selector: 'app-feature-overrides', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ButtonModule, DialogModule, DropdownModule, InputSwitchModule, TableModule, PageHeaderComponent, ServerPaginatorComponent],
  template: `
    <div class="lf-page">
      <app-page-header title="استثناءات الميزات" subtitle="فتح أو إغلاق ميزة أو تغيير حدها لجيم محدد بمدة وسبب موثق" icon="pi pi-sliders-h">
        <button pButton type="button" label="استثناء جديد" icon="pi pi-plus" (click)="open()"></button>
      </app-page-header>
      <section class="lf-card mb-5 flex items-start gap-3 border-r-4 border-r-amber-400 p-4"><i class="pi pi-shield mt-0.5 text-amber-600"></i><p class="m-0 text-sm leading-6 text-slate-600">الاستثناء لا يتجاوز الإيقاف العام أو إيقاف الـTenant. السجل يُصحح أو يُنهى بتعديل فترة الانتهاء، ولا يُحذف للحفاظ على الأثر التشغيلي.</p></section>
      <section class="lf-table-shell">
        <p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm" [scrollable]="true">
          <ng-template pTemplate="header"><tr><th>Tenant</th><th>الميزة</th><th>القرار</th><th>الحد</th><th class="hidden lg:table-cell">المدة</th><th>السبب</th><th class="w-20 text-center">إجراء</th></tr></ng-template>
          <ng-template pTemplate="body" let-row><tr>
            <td><code class="text-xs" dir="ltr">{{ row.tenantId }}</code></td><td><code class="rounded bg-primary-50 px-2 py-1 font-semibold text-primary-700" dir="ltr">{{ row.featureCode }}</code></td>
            <td><span class="lf-badge" [class.lf-badge-green]="row.isEnabled" [class.lf-badge-red]="!row.isEnabled">{{ row.isEnabled ? 'مفتوحة' : 'مغلقة' }}</span></td>
            <td>{{ row.limitOverride ?? 'حسب الباقة' }}</td><td class="hidden lg:table-cell text-xs" dir="ltr">{{ row.startsAt | date:'yyyy-MM-dd' }} → {{ row.endsAt ? (row.endsAt | date:'yyyy-MM-dd') : '∞' }}</td><td class="max-w-48 truncate" [title]="row.reason">{{ row.reason }}</td>
            <td class="text-center"><button pButton type="button" icon="pi pi-pencil" class="p-button-sm p-button-text" aria-label="تعديل الاستثناء" (click)="open(row)"></button></td>
          </tr></ng-template>
          <ng-template pTemplate="emptymessage"><tr><td colspan="7" class="py-10 text-center text-slate-400">لا توجد استثناءات ميزات</td></tr></ng-template>
        </p-table>
        <app-server-paginator [page]="page" [pageSize]="pageSize" [totalCount]="totalCount" (pageChange)="onPageChange($event)"></app-server-paginator>
      </section>

      <p-dialog [header]="form.id ? 'تعديل استثناء ميزة' : 'إنشاء استثناء ميزة'" [(visible)]="showForm" [modal]="true" [style]="{width: '620px', maxWidth: '94vw'}" [draggable]="false">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label class="lf-label">الجيم *</label><p-dropdown [options]="tenants()" [(ngModel)]="form.tenantId" optionLabel="name" optionValue="id" [filter]="true" placeholder="اختر الجيم" styleClass="w-full"></p-dropdown></div>
          <div><label class="lf-label">الميزة *</label><p-dropdown [options]="features()" [(ngModel)]="form.featureId" optionLabel="code" optionValue="id" [filter]="true" placeholder="اختر ميزة" styleClass="w-full"></p-dropdown></div>
          <label class="flex items-center gap-2 pt-7 text-sm font-medium text-slate-700"><p-inputSwitch [(ngModel)]="form.isEnabled"></p-inputSwitch>{{ form.isEnabled ? 'السماح بالميزة' : 'إغلاق الميزة' }}</label>
          <div><label class="lf-label">حد بديل</label><input class="lf-input" [(ngModel)]="form.limitOverride" type="number" min="0" placeholder="فارغ = حسب الباقة" /></div>
          <div><label class="lf-label">يبدأ في *</label><input class="lf-input" [(ngModel)]="form.startsAt" type="datetime-local" /></div>
          <div><label class="lf-label">ينتهي في</label><input class="lf-input" [(ngModel)]="form.endsAt" type="datetime-local" /></div>
          <div class="sm:col-span-2"><label class="lf-label">سبب الاستثناء *</label><textarea class="lf-input" [(ngModel)]="form.reason" rows="3" placeholder="مثال: تعويض إداري بسبب عطل موثق"></textarea></div>
        </div>
        <ng-template pTemplate="footer"><button pButton type="button" label="إلغاء" class="p-button-text p-button-secondary" (click)="showForm=false"></button><button pButton type="button" label="حفظ" icon="pi pi-check" [loading]="saving()" [disabled]="!valid()" (click)="save()"></button></ng-template>
      </p-dialog>
    </div>
  `,
})
export class FeatureOverridesComponent implements OnInit {
  @HostListener(`window:${ADMIN_ASSISTANT_COMMAND_EVENT}`, ['$event'])
  onAssistantCommand(event: Event): void {
    if ((event as CustomEvent<{ command?: string }>).detail?.command === 'create-feature-override') this.open();
  }

  private service = inject(FeaturesService); private tenantsService = inject(TenantsService); private notify = inject(NotifyService);
  rows = signal<any[]>([]); features = signal<any[]>([]); tenants = signal<any[]>([]); loading = signal(false); saving = signal(false);
  page = 1; pageSize = 20; totalCount = 0; showForm = false;
  form: OverrideForm = this.emptyForm();

  ngOnInit(): void {
    this.service.catalog().subscribe({ next: (items) => this.features.set(items), error: (error) => this.notify.error(errMsg(error)) });
    this.tenantsService.list(undefined, 1, 100).subscribe({ next: (response) => this.tenants.set(response.items), error: (error) => this.notify.error(errMsg(error)) });
    this.load();
  }

  private emptyForm(): OverrideForm { return { tenantId: '', featureId: '', isEnabled: true, limitOverride: null, reason: '', startsAt: this.toLocalInput(new Date()), endsAt: '' }; }
  private toLocalInput(value: Date | string): string { const date = new Date(value); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 16); }
  valid(): boolean { return !!this.form.tenantId && !!this.form.featureId && !!this.form.reason.trim() && !!this.form.startsAt && (!this.form.endsAt || new Date(this.form.endsAt) > new Date(this.form.startsAt)) && (this.form.limitOverride == null || this.form.limitOverride >= 0); }
  load(): void { this.loading.set(true); this.service.overrides(this.page, this.pageSize).subscribe({ next: (response) => { this.rows.set(response.items); this.totalCount = response.totalCount; this.loading.set(false); }, error: (error) => { this.notify.error(errMsg(error)); this.loading.set(false); } }); }
  onPageChange(event: { page: number; pageSize: number }): void { this.page = event.page; this.pageSize = event.pageSize; this.load(); }
  open(row?: any): void { this.form = row ? { id: row.id, tenantId: row.tenantId, featureId: row.featureId, isEnabled: row.isEnabled, limitOverride: row.limitOverride, reason: row.reason, startsAt: this.toLocalInput(row.startsAt), endsAt: row.endsAt ? this.toLocalInput(row.endsAt) : '' } : this.emptyForm(); this.showForm = true; }
  save(): void { if (!this.valid()) return; this.saving.set(true); const command = { tenantId: this.form.tenantId, featureId: this.form.featureId, isEnabled: this.form.isEnabled, limitOverride: this.form.limitOverride == null || this.form.limitOverride === ('' as any) ? null : Number(this.form.limitOverride), reason: this.form.reason.trim(), startsAt: new Date(this.form.startsAt).toISOString(), endsAt: this.form.endsAt ? new Date(this.form.endsAt).toISOString() : null }; this.service.setOverride(command).subscribe({ next: () => { this.saving.set(false); this.showForm = false; this.notify.success('تم حفظ الاستثناء'); this.load(); }, error: (error) => { this.saving.set(false); this.notify.error(errMsg(error)); } }); }
}
