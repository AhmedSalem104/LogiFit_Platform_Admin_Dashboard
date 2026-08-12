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
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { ADMIN_ASSISTANT_COMMAND_EVENT } from '../../shared/assistant/admin-assistant.service';

interface QuotaForm { id?: string; featureId: string; resourceKey: string; unit: string; defaultLimit: number | null; isActive: boolean; }

@Component({
  selector: 'app-quota-definitions', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ButtonModule, DialogModule, DropdownModule, InputSwitchModule, TableModule, PageHeaderComponent, ServerPaginatorComponent],
  template: `
    <div class="lf-page">
      <app-page-header title="حدود الاستخدام" subtitle="تعريف وإدارة الحدود الافتراضية للميزات المدفوعة" icon="pi pi-chart-bar">
        <button pButton type="button" label="حد جديد" icon="pi pi-plus" (click)="open()"></button>
      </app-page-header>
      <section class="lf-table-shell">
        <p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm" [scrollable]="true">
          <ng-template pTemplate="header"><tr><th>الميزة</th><th>المورد</th><th>الوحدة</th><th>الحد الافتراضي</th><th>الحالة</th><th class="w-24 text-center">إجراء</th></tr></ng-template>
          <ng-template pTemplate="body" let-row><tr>
            <td><code class="rounded bg-primary-50 px-2 py-1 font-semibold text-primary-700" dir="ltr">{{ row.featureCode }}</code></td>
            <td dir="ltr">{{ row.resourceKey }}</td><td>{{ row.unit }}</td><td class="font-semibold tabular-nums">{{ row.defaultLimit ?? 'غير محدود' }}</td>
            <td><span class="lf-badge" [class.lf-badge-green]="row.isActive" [class.lf-badge-gray]="!row.isActive">{{ row.isActive ? 'مفعّل' : 'معطّل' }}</span></td>
            <td class="text-center"><button pButton type="button" icon="pi pi-pencil" class="p-button-sm p-button-text" aria-label="تعديل الحد" (click)="open(row)"></button></td>
          </tr></ng-template>
          <ng-template pTemplate="emptymessage"><tr><td colspan="6" class="py-10 text-center text-slate-400">لا توجد حدود استخدام معرفة</td></tr></ng-template>
        </p-table>
        <app-server-paginator [page]="page" [pageSize]="pageSize" [totalCount]="totalCount" (pageChange)="onPageChange($event)"></app-server-paginator>
      </section>

      <p-dialog [header]="form.id ? 'تعديل حد استخدام' : 'تعريف حد استخدام'" [(visible)]="showForm" [modal]="true" [style]="{width: '540px', maxWidth: '94vw'}" [draggable]="false">
        <div class="grid grid-cols-1 gap-4">
          <div><label class="lf-label">الميزة *</label><p-dropdown [options]="features()" [(ngModel)]="form.featureId" optionLabel="code" optionValue="id" [filter]="true" placeholder="اختر ميزة" styleClass="w-full"></p-dropdown></div>
          <div><label class="lf-label">مفتاح المورد *</label><input class="lf-input" [(ngModel)]="form.resourceKey" dir="ltr" placeholder="members" /></div>
          <div><label class="lf-label">الوحدة *</label><input class="lf-input" [(ngModel)]="form.unit" placeholder="عضو / فرع / MB" /></div>
          <div><label class="lf-label">الحد الافتراضي</label><input class="lf-input" [(ngModel)]="form.defaultLimit" type="number" min="0" placeholder="فارغ = غير محدود" /></div>
          <label class="flex items-center gap-2 text-sm font-medium text-slate-700"><p-inputSwitch [(ngModel)]="form.isActive"></p-inputSwitch> الحد مفعّل</label>
        </div>
        <ng-template pTemplate="footer"><button pButton type="button" label="إلغاء" class="p-button-text p-button-secondary" (click)="showForm=false"></button><button pButton type="button" label="حفظ" icon="pi pi-check" [loading]="saving()" [disabled]="!valid()" (click)="save()"></button></ng-template>
      </p-dialog>
    </div>
  `,
})
export class QuotaDefinitionsComponent implements OnInit {
  @HostListener(`window:${ADMIN_ASSISTANT_COMMAND_EVENT}`, ['$event'])
  onAssistantCommand(event: Event): void {
    if ((event as CustomEvent<{ command?: string }>).detail?.command === 'create-quota') this.open();
  }

  private service = inject(FeaturesService); private notify = inject(NotifyService);
  rows = signal<any[]>([]); features = signal<any[]>([]); loading = signal(false); saving = signal(false);
  page = 1; pageSize = 20; totalCount = 0; showForm = false;
  form: QuotaForm = { featureId: '', resourceKey: '', unit: '', defaultLimit: null, isActive: true };

  ngOnInit(): void { this.service.catalog().subscribe({ next: (items) => this.features.set(items), error: (error) => this.notify.error(errMsg(error)) }); this.load(); }
  valid(): boolean { return !!this.form.featureId && !!this.form.resourceKey.trim() && !!this.form.unit.trim() && (this.form.defaultLimit == null || this.form.defaultLimit >= 0); }
  load(): void { this.loading.set(true); this.service.quotaDefinitions(this.page, this.pageSize).subscribe({ next: (response) => { this.rows.set(response.items); this.totalCount = response.totalCount; this.loading.set(false); }, error: (error) => { this.notify.error(errMsg(error)); this.loading.set(false); } }); }
  onPageChange(event: { page: number; pageSize: number }): void { this.page = event.page; this.pageSize = event.pageSize; this.load(); }
  open(row?: any): void { this.form = row ? { id: row.id, featureId: row.featureId, resourceKey: row.resourceKey, unit: row.unit, defaultLimit: row.defaultLimit, isActive: row.isActive } : { featureId: '', resourceKey: '', unit: '', defaultLimit: null, isActive: true }; this.showForm = true; }
  save(): void { if (this.saving() || !this.valid()) return; this.saving.set(true); const command = { ...this.form, resourceKey: this.form.resourceKey.trim(), unit: this.form.unit.trim(), defaultLimit: this.form.defaultLimit == null || this.form.defaultLimit === ('' as any) ? null : Number(this.form.defaultLimit) }; this.service.saveQuota(command).subscribe({ next: () => { this.saving.set(false); this.showForm = false; this.notify.success('تم حفظ حد الاستخدام'); this.load(); }, error: (error) => { this.saving.set(false); this.notify.error(errMsg(error)); } }); }
}
