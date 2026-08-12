import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';
import { ServerPaginatorComponent } from '../../shared/ui/server-paginator.component';
import { FeaturesService } from './features.service';
import { BadgeInfo, FeatureDto } from '../../core/models/platform.models';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { ADMIN_ASSISTANT_COMMAND_EVENT } from '../../shared/assistant/admin-assistant.service';

@Component({
  selector: 'app-features',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TableModule, DialogModule, ButtonModule, DropdownModule, PageHeaderComponent, StatusBadgeComponent, ServerPaginatorComponent],
  template: `
    <app-page-header
      title="الميزات"
      subtitle="أكواد الميزات المتاحة — تُستخدم عند بناء الباقات"
      icon="pi pi-star">
      <button pButton label="ميزة جديدة" icon="pi pi-plus" (click)="open()"></button>
    </app-page-header>

    <div class="lf-card overflow-hidden">
      <p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm" [scrollable]="true">
        <ng-template pTemplate="header">
          <tr>
            <th>الكود</th>
            <th>الاسم</th>
            <th class="hidden sm:table-cell">الوصف</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-f>
          <tr>
            <td><code class="text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md text-[13px] font-semibold" dir="ltr">{{ f.code }}</code></td>
            <td class="font-semibold text-slate-800">{{ f.name }}</td>
            <td class="text-slate-500 text-sm hidden sm:table-cell">{{ f.description || '—' }}</td>
            <td><div class="flex flex-wrap gap-1"><app-status-badge [badge]="activeBadge(f.isActive)"></app-status-badge><span class="lf-badge lf-badge-gray">{{ statusLabel(f.status) }}</span></div></td>
            <td><button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="open(f)"></button>@if(f.status !== 4){<button pButton icon="pi pi-inbox" class="p-button-secondary p-button-text p-button-sm" title="أرشفة" [loading]="archiveBusyId() === f.id" [disabled]="archiveBusyId() !== null" (click)="archive(f)"></button>}</td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="5" class="text-center text-slate-400 py-10"><i class="pi pi-inbox text-2xl block mb-2 opacity-40"></i>لا توجد ميزات</td></tr>
        </ng-template>
      </p-table>
      <app-server-paginator [page]="page" [pageSize]="pageSize" [totalCount]="totalCount" (pageChange)="onPageChange($event)"></app-server-paginator>
    </div>
    <p-dialog header="إدارة ميزة" [(visible)]="showForm" [modal]="true" [style]="{width:'520px',maxWidth:'95vw'}">
      <form [formGroup]="form" class="grid gap-3">
        <input class="lf-input" formControlName="code" placeholder="members.manage" [readonly]="!!editingId" />
        <input class="lf-input" formControlName="name" placeholder="Feature name" />
        <input class="lf-input" formControlName="nameEn" placeholder="English name" />
        <input class="lf-input" formControlName="nameAr" placeholder="الاسم العربي" />
        <input class="lf-input" formControlName="module" placeholder="Module" />
        <p-dropdown [options]="statusOptions" formControlName="status" optionLabel="label" optionValue="value" placeholder="حالة الميزة" styleClass="w-full"></p-dropdown>
        <textarea class="lf-input" formControlName="description" placeholder="الوصف"></textarea>
        <label><input type="checkbox" formControlName="isFree" /> مجانية</label>
        <label><input type="checkbox" formControlName="supportsQuota" /> تدعم Quota</label>
        <label><input type="checkbox" formControlName="isActive" /> مفعلة عالميًا</label>
      </form>
      <ng-template pTemplate="footer"><button pButton label="حفظ" [disabled]="form.invalid || saving" (click)="save()"></button></ng-template>
    </p-dialog>
  `,
})
export class FeaturesComponent implements OnInit {
  @HostListener(`window:${ADMIN_ASSISTANT_COMMAND_EVENT}`, ['$event'])
  onAssistantCommand(event: Event): void {
    if ((event as CustomEvent<{ command?: string }>).detail?.command === 'create-feature') this.open();
  }

  private service = inject(FeaturesService);
  private notify = inject(NotifyService);
  private fb = inject(FormBuilder);

  rows = signal<FeatureDto[]>([]);
  page = 1;
  pageSize = 20;
  totalCount = 0;
  loading = signal(false);
  archiveBusyId = signal<string | null>(null);
  showForm = false;
  saving = false;
  editingId: string | undefined;
  form = this.fb.nonNullable.group({ code: ['', Validators.required], name: ['', Validators.required], nameAr: [''], nameEn: [''], module: [''], description: [''], isFree: [false], supportsQuota: [false], isActive: [true], status: [2] });
  statusOptions = [{ label: 'مسودة', value: 1 }, { label: 'نشطة', value: 2 }, { label: 'مهجورة', value: 3 }, { label: 'مؤرشفة', value: 4 }];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.service.list(this.page, this.pageSize).subscribe({
      next: (data) => {
        this.rows.set(data.items);
        this.totalCount = data.totalCount;
        this.loading.set(false);
      },
      error: (err) => {
        this.notify.error(errMsg(err));
        this.loading.set(false);
      },
    });
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page = event.page;
    this.pageSize = event.pageSize;
    this.load();
  }

  activeBadge(active: boolean): BadgeInfo {
    return active ? { label: 'مفعّلة', color: 'green' } : { label: 'معطّلة', color: 'gray' };
  }

  open(feature?: FeatureDto): void {
    this.editingId = feature?.id;
    this.form.reset({ code: feature?.code ?? '', name: feature?.name ?? '', nameAr: feature?.nameAr ?? '', nameEn: feature?.nameEn ?? '', module: feature?.module ?? '', description: feature?.description ?? '', isFree: feature?.isFree ?? false, supportsQuota: feature?.supportsQuota ?? false, isActive: feature?.isActive ?? true, status: feature?.status ?? 2 });
    this.showForm = true;
  }

  save(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    this.service.save({ ...this.form.getRawValue(), id: this.editingId }).subscribe({ next: () => { this.saving = false; this.showForm = false; this.service.invalidate(); this.load(); this.notify.success('تم حفظ الميزة'); }, error: (e) => { this.saving = false; this.notify.error(errMsg(e)); } });
  }

  statusLabel(status?: number): string { return this.statusOptions.find((item) => item.value === status)?.label ?? 'غير محددة'; }

  async archive(feature: FeatureDto): Promise<void> {
    if (this.archiveBusyId()) return;
    const ok = await this.notify.confirm({ header: 'أرشفة الميزة', message: `أرشفة ${feature.code}؟ لن تُمنح للاشتراكات الجديدة.`, acceptLabel: 'أرشفة', danger: true });
    if (!ok) return;
    this.archiveBusyId.set(feature.id);
    this.service.save({ ...feature, status: 4, isActive: false }).subscribe({ next: () => { this.archiveBusyId.set(null); this.service.invalidate(); this.notify.success('تمت أرشفة الميزة'); this.load(); }, error: (error) => { this.archiveBusyId.set(null); this.notify.error(errMsg(error)); } });
  }
}
