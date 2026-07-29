import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { ServerPaginatorComponent } from '../../shared/ui/server-paginator.component';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import {
  PlatformApplicationStatus,
  PlatformApplicationType,
  PlatformWorkspaceApplication,
  WorkspaceApplicationsService,
} from './workspace-applications.service';

/** Review queue only renders the Platform-safe application projection. */
@Component({
  selector: 'app-workspace-applications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TableModule, DropdownModule, DialogModule, ButtonModule, TooltipModule, PageHeaderComponent, ServerPaginatorComponent],
  template: `
    <app-page-header title="طلبات مساحات العمل" subtitle="اعتماد أو استكمال أو رفض طلبات المدربين وأعضاء فرقهم" icon="pi pi-verified">
      <p-dropdown [options]="statusOptions" [(ngModel)]="statusFilter" (onChange)="resetPage()" optionLabel="label" optionValue="value" placeholder="كل الحالات" [showClear]="true" styleClass="w-full sm:w-48"></p-dropdown>
      <p-dropdown [options]="typeOptions" [(ngModel)]="typeFilter" (onChange)="resetPage()" optionLabel="label" optionValue="value" placeholder="كل الأنواع" [showClear]="true" styleClass="w-full sm:w-48"></p-dropdown>
    </app-page-header>

    <p class="safe-note"><i class="pi pi-shield"></i> تعرض هذه الشاشة بيانات المراجعة الضرورية فقط، ولا تعرض أي بيانات صحية أو تدريبية للعملاء.</p>
    <div class="lf-card overflow-hidden">
      <p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm" [scrollable]="true">
        <ng-template pTemplate="header"><tr><th>الطلب</th><th>مقدم الطلب</th><th class="hidden md:table-cell">المعرّف/الدور</th><th>الحالة</th><th class="hidden lg:table-cell">التاريخ</th><th class="text-center">الإجراءات</th></tr></ng-template>
        <ng-template pTemplate="body" let-a><tr>
          <td><b>{{ typeLabel(a.applicationType) }}</b><small class="block text-slate-400" dir="ltr">{{ a.id }}</small></td>
          <td><div dir="ltr">{{ a.applicantEmail }}</div><small dir="ltr" class="text-slate-400">{{ a.applicantPhoneNumber || '—' }}</small></td>
          <td class="hidden md:table-cell"><span dir="ltr">{{ a.workspaceIdentifier || '—' }}</span><small class="block text-slate-400">{{ a.requestedRole || '' }}</small></td>
          <td><span class="status" [class.pending]="a.status === Status.Submitted || a.status === Status.UnderReview || a.status === Status.NeedsMoreInformation" [class.accepted]="a.status === Status.Approved" [class.rejected]="a.status === Status.Rejected">{{ statusLabel(a.status) }}</span></td>
          <td class="hidden lg:table-cell" dir="ltr">{{ a.submittedAt | date:'yyyy-MM-dd' }}</td>
          <td class="text-center whitespace-nowrap">
            @if (a.status === Status.Submitted) { <button pButton pTooltip="بدء المراجعة" icon="pi pi-eye" class="p-button-sm p-button-text" [disabled]="busyId() === a.id" (click)="startReview(a)"></button> }
            @if (a.status === Status.UnderReview) {
              <button pButton pTooltip="طلب استكمال" icon="pi pi-file-edit" class="p-button-sm p-button-warning p-button-text" [disabled]="busyId() === a.id" (click)="openInformation(a)"></button>
              <button pButton pTooltip="موافقة" icon="pi pi-check" class="p-button-sm p-button-success p-button-text" [disabled]="busyId() === a.id" (click)="approve(a)"></button>
              <button pButton pTooltip="رفض" icon="pi pi-times" class="p-button-sm p-button-danger p-button-text" [disabled]="busyId() === a.id" (click)="openReject(a)"></button>
            }
            @if (![Status.Submitted, Status.UnderReview].includes(a.status)) { <span class="text-xs text-slate-400">لا إجراء متاح</span> }
          </td>
        </tr></ng-template>
        <ng-template pTemplate="emptymessage"><tr><td colspan="6" class="text-center text-slate-400 py-10"><i class="pi pi-inbox text-2xl block mb-2 opacity-40"></i>لا توجد طلبات مطابقة</td></tr></ng-template>
      </p-table>
      <app-server-paginator [page]="page" [pageSize]="pageSize" [totalCount]="totalCount" (pageChange)="onPageChange($event)"></app-server-paginator>
    </div>

    <p-dialog header="طلب استكمال البيانات" [(visible)]="showInformation" [modal]="true" [style]="{ width: '520px', maxWidth: '94vw' }" [draggable]="false">
      @if (informationTarget(); as application) {
        <p class="text-sm text-slate-500 mb-3">حدد الحقول التي يحتاج مقدم الطلب إلى تعديلها فقط. لا تطلب بيانات صحية أو تدريبية.</p>
        <label class="lf-label">رسالة الاستكمال *</label><textarea class="lf-input" rows="3" [(ngModel)]="informationMessage"></textarea>
        <label class="lf-label mt-3">الحقول المطلوبة (مفصولة بفواصل)</label><input class="lf-input" [(ngModel)]="informationFields" [placeholder]="fieldHint(application)" />
      }
      <ng-template pTemplate="footer"><button pButton label="إلغاء" class="p-button-text p-button-secondary" (click)="showInformation = false"></button><button pButton label="إرسال الطلب" icon="pi pi-send" [disabled]="busyId() === informationTarget()?.id" (click)="sendInformationRequest()"></button></ng-template>
    </p-dialog>

    <p-dialog header="رفض الطلب" [(visible)]="showReject" [modal]="true" [style]="{ width: '460px', maxWidth: '94vw' }" [draggable]="false">
      <label class="lf-label">سبب الرفض *</label><textarea class="lf-input" rows="3" [(ngModel)]="rejectReason" placeholder="اكتب سببًا واضحًا يمكن لمقدم الطلب فهمه."></textarea>
      <ng-template pTemplate="footer"><button pButton label="إلغاء" class="p-button-text p-button-secondary" (click)="showReject = false"></button><button pButton label="رفض نهائي" icon="pi pi-times" class="p-button-danger" [disabled]="busyId() === rejectTarget()?.id" (click)="confirmReject()"></button></ng-template>
    </p-dialog>
  `,
  styles: [`
    .safe-note { display:flex; align-items:center; gap:.45rem; margin:0 0 1rem; padding:.75rem .9rem; border:1px solid #bfdbfe; border-radius:.65rem; color:#1e40af; background:#eff6ff; font-size:.82rem; }.status { display:inline-block; padding:.25rem .55rem; border-radius:999px; color:#475569; background:#f1f5f9; font-size:.75rem; font-weight:700; }.status.pending { color:#a16207; background:#fef3c7; }.status.accepted { color:#047857; background:#d1fae5; }.status.rejected { color:#b91c1c; background:#fee2e2; }
  `],
})
export class WorkspaceApplicationsComponent implements OnInit {
  private readonly service = inject(WorkspaceApplicationsService);
  private readonly notify = inject(NotifyService);
  readonly Status = PlatformApplicationStatus;
  rows = signal<PlatformWorkspaceApplication[]>([]);
  loading = signal(false);
  busyId = signal<string | null>(null);
  informationTarget = signal<PlatformWorkspaceApplication | null>(null);
  rejectTarget = signal<PlatformWorkspaceApplication | null>(null);
  page = 1; pageSize = 20; totalCount = 0;
  statusFilter: PlatformApplicationStatus | null = null;
  typeFilter: PlatformApplicationType | null = null;
  showInformation = false;
  showReject = false;
  informationMessage = '';
  informationFields = '';
  rejectReason = '';
  readonly statusOptions = [
    { label: 'مُقدّم', value: PlatformApplicationStatus.Submitted }, { label: 'قيد المراجعة', value: PlatformApplicationStatus.UnderReview }, { label: 'مطلوب استكمال', value: PlatformApplicationStatus.NeedsMoreInformation }, { label: 'مقبول', value: PlatformApplicationStatus.Approved }, { label: 'مرفوض', value: PlatformApplicationStatus.Rejected },
  ];
  readonly typeOptions = [
    { label: 'مساحة مدرب حر', value: PlatformApplicationType.FreelanceWorkspaceCreation }, { label: 'مدرب ضمن فريق', value: PlatformApplicationType.CoachMembership }, { label: 'مساعد', value: PlatformApplicationType.AssistantMembership }, { label: 'عميل', value: PlatformApplicationType.ClientMembership },
  ];

  ngOnInit(): void { this.load(); }
  load(): void { this.loading.set(true); this.service.list(this.statusFilter ?? undefined, this.typeFilter ?? undefined, this.page, this.pageSize).subscribe({ next: data => { this.rows.set(data.items); this.totalCount = data.totalCount; this.loading.set(false); }, error: err => { this.notify.error(errMsg(err)); this.loading.set(false); } }); }
  resetPage(): void { this.page = 1; this.load(); }
  onPageChange(event: { page: number; pageSize: number }): void { this.page = event.page; this.pageSize = event.pageSize; this.load(); }
  startReview(application: PlatformWorkspaceApplication): void { this.run(application, () => this.service.startReview(application), 'بدأت مراجعة الطلب.'); }
  approve(application: PlatformWorkspaceApplication): void { void this.confirmThen(application, 'اعتماد الطلب', 'هل تريد اعتماد هذا الطلب؟', () => this.service.approve(application), 'تم اعتماد الطلب.'); }
  openInformation(application: PlatformWorkspaceApplication): void { this.informationTarget.set(application); this.informationMessage = ''; this.informationFields = this.fieldHint(application); this.showInformation = true; }
  openReject(application: PlatformWorkspaceApplication): void { this.rejectTarget.set(application); this.rejectReason = ''; this.showReject = true; }
  confirmReject(): void { const application = this.rejectTarget(); if (!application || !this.rejectReason.trim()) { this.notify.error('أدخل سبب الرفض قبل تأكيد القرار.'); return; } this.run(application, () => this.service.reject(application, this.rejectReason.trim()), 'تم رفض الطلب.'); this.showReject = false; }
  sendInformationRequest(): void { const application = this.informationTarget(); const fields = this.informationFields.split(',').map(item => item.trim()).filter(Boolean); if (!application || !this.informationMessage.trim() || !fields.length) { this.notify.error('أدخل رسالة الاستكمال وحقلًا واحدًا على الأقل.'); return; } this.run(application, () => this.service.requestInformation(application, this.informationMessage.trim(), fields), 'أُرسل طلب الاستكمال.'); this.showInformation = false; }
  typeLabel(type: PlatformApplicationType): string { return ({ 1: 'إنشاء جيم', 2: 'مساحة مدرب حر', 3: 'انضمام مدرب', 4: 'انضمام مساعد', 5: 'انضمام عميل' } as Record<number, string>)[type]; }
  statusLabel(status: PlatformApplicationStatus): string { return ({ 1: 'مسودة', 2: 'مُقدّم', 3: 'قيد المراجعة', 4: 'مطلوب استكمال', 5: 'مقبول', 6: 'مرفوض', 7: 'ملغى', 8: 'منتهي' } as Record<number, string>)[status]; }
  fieldHint(application: PlatformWorkspaceApplication): string { return application.applicationType === PlatformApplicationType.FreelanceWorkspaceCreation ? 'مثال: BrandName, Bio' : 'FullName'; }

  private async confirmThen(application: PlatformWorkspaceApplication, header: string, message: string, request: () => ReturnType<WorkspaceApplicationsService['approve']>, success: string, danger = false): Promise<void> { if (await this.notify.confirm({ header, message, acceptLabel: 'تأكيد', danger })) this.run(application, request, success); }
  private run(application: PlatformWorkspaceApplication, request: () => ReturnType<WorkspaceApplicationsService['approve']>, success: string): void { this.busyId.set(application.id); request().subscribe({ next: updated => { this.replace(updated); this.busyId.set(null); this.notify.success(success); }, error: err => { this.busyId.set(null); this.notify.error(errMsg(err)); this.load(); } }); }
  private replace(updated: PlatformWorkspaceApplication): void { this.rows.update(rows => rows.map(row => row.id === updated.id ? updated : row)); }
}
