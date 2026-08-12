import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { ServerPaginatorComponent } from '../../shared/ui/server-paginator.component';
import { FeaturesService } from '../features/features.service';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';

@Component({
  selector: 'app-feature-dependencies',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ButtonModule, DropdownModule, TableModule, PageHeaderComponent, ServerPaginatorComponent],
  template: `
    <div class="lf-page">
      <app-page-header title="اعتماديات الميزات" subtitle="ربط الميزات التي لا يمكن تشغيلها إلا بعد تفعيل ميزات أخرى" icon="pi pi-share-alt"></app-page-header>

      <section class="lf-card mb-5 p-4">
        <div class="mb-4 flex items-center gap-2"><i class="pi pi-info-circle text-primary-600"></i><p class="m-0 text-sm text-slate-600">لا يمكن إنشاء علاقة دائرية، وحذف العلاقة لا يغير اشتراكات أو لقطات سابقة.</p></div>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div><label class="lf-label">الميزة</label><p-dropdown [options]="features()" [(ngModel)]="featureId" optionLabel="code" optionValue="id" [filter]="true" placeholder="اختر ميزة" styleClass="w-full"></p-dropdown></div>
          <div><label class="lf-label">تعتمد على</label><p-dropdown [options]="availableDependencies()" [(ngModel)]="dependsOnFeatureId" optionLabel="code" optionValue="id" [filter]="true" placeholder="اختر المتطلب" styleClass="w-full"></p-dropdown></div>
          <button pButton type="button" label="إضافة العلاقة" icon="pi pi-plus" [loading]="saving()" [disabled]="!featureId || !dependsOnFeatureId" (click)="save()"></button>
        </div>
      </section>

      <section class="lf-table-shell">
        <p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm" [scrollable]="true">
          <ng-template pTemplate="header"><tr><th>الميزة</th><th>تعتمد على</th><th class="w-20 text-center">إجراء</th></tr></ng-template>
          <ng-template pTemplate="body" let-row><tr>
            <td><code class="rounded bg-primary-50 px-2 py-1 font-semibold text-primary-700" dir="ltr">{{ row.featureCode }}</code></td>
            <td><code class="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-700" dir="ltr">{{ row.dependsOnFeatureCode }}</code></td>
            <td class="text-center"><button pButton type="button" icon="pi pi-trash" class="p-button-sm p-button-danger p-button-text" aria-label="حذف العلاقة" [loading]="busyId() === row.id" [disabled]="busyId() !== null" (click)="remove(row)"></button></td>
          </tr></ng-template>
          <ng-template pTemplate="emptymessage"><tr><td colspan="3" class="py-10 text-center text-slate-400">لا توجد اعتماديات معرفة</td></tr></ng-template>
        </p-table>
        <app-server-paginator [page]="page" [pageSize]="pageSize" [totalCount]="totalCount" (pageChange)="onPageChange($event)"></app-server-paginator>
      </section>
    </div>
  `,
})
export class FeatureDependenciesComponent implements OnInit {
  private service = inject(FeaturesService);
  private notify = inject(NotifyService);
  rows = signal<any[]>([]);
  features = signal<any[]>([]);
  loading = signal(false);
  saving = signal(false);
  busyId = signal<string | null>(null);
  page = 1;
  pageSize = 20;
  totalCount = 0;
  featureId = '';
  dependsOnFeatureId = '';

  ngOnInit(): void {
    this.service.catalog().subscribe({ next: (items) => this.features.set(items), error: (error) => this.notify.error(errMsg(error)) });
    this.load();
  }

  availableDependencies(): any[] { return this.features().filter((feature) => feature.id !== this.featureId); }

  load(): void {
    this.loading.set(true);
    this.service.dependencies(this.page, this.pageSize).subscribe({
      next: (response) => { this.rows.set(response.items); this.totalCount = response.totalCount; this.loading.set(false); },
      error: (error) => { this.notify.error(errMsg(error)); this.loading.set(false); },
    });
  }

  onPageChange(event: { page: number; pageSize: number }): void { this.page = event.page; this.pageSize = event.pageSize; this.load(); }

  save(): void {
    if (this.saving() || !this.featureId || !this.dependsOnFeatureId || this.featureId === this.dependsOnFeatureId) return;
    this.saving.set(true);
    this.service.addDependency({ featureId: this.featureId, dependsOnFeatureId: this.dependsOnFeatureId }).subscribe({
      next: () => { this.saving.set(false); this.dependsOnFeatureId = ''; this.notify.success('تمت إضافة الاعتمادية'); this.load(); },
      error: (error) => { this.saving.set(false); this.notify.error(errMsg(error)); },
    });
  }

  async remove(row: any): Promise<void> {
    if (this.busyId()) return;
    this.busyId.set(row.id);
    const ok = await this.notify.confirm({ header: 'حذف الاعتمادية', message: `إزالة الاعتمادية بين ${row.featureCode} و ${row.dependsOnFeatureCode}؟`, acceptLabel: 'حذف', danger: true });
    if (!ok) { this.busyId.set(null); return; }
    this.service.removeDependency(row.id).subscribe({
      next: () => { this.busyId.set(null); this.notify.success('تم حذف الاعتمادية'); this.load(); },
      error: (error) => { this.busyId.set(null); this.notify.error(errMsg(error)); },
    });
  }
}
