import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { ServerPaginatorComponent } from '../../shared/ui/server-paginator.component';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { PlansService } from '../plans/plans.service';
import { PaymentRequestsService } from '../payment-requests/payment-requests.service';
import {
  BillingCycle,
  PaymentRequestStatus,
  PlanDto,
  ProvisioningJobStatus,
  TenantStatus,
  TenantSubscriptionStatus,
} from '../../core/models/platform.models';
import {
  CreatePlatformWorkspaceApplicationCommand,
  PlatformApplicationStatus,
  PlatformApplicationType,
  PlatformWorkspaceApplication,
  PlatformWorkspaceType,
  WorkspaceApplicationsService,
} from './workspace-applications.service';

/** Operator workflow for both Gym and FreelanceCoach applications. */
@Component({
  selector: 'app-workspace-applications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TableModule, DropdownModule, DialogModule, ButtonModule, TooltipModule, PageHeaderComponent, ServerPaginatorComponent],
  template: `
    <app-page-header title="طلبات مساحات العمل" subtitle="إنشاء ومراجعة وتفعيل الجيمات والمدربين الأحرار من مسار واحد" icon="pi pi-verified">
      <p-dropdown [options]="statusOptions" [(ngModel)]="statusFilter" (onChange)="resetPage()" optionLabel="label" optionValue="value" placeholder="حالة الطلب" [showClear]="true" styleClass="w-full sm:w-44"></p-dropdown>
      <p-dropdown [options]="typeOptions" [(ngModel)]="typeFilter" (onChange)="resetPage()" optionLabel="label" optionValue="value" placeholder="نوع المساحة" [showClear]="true" styleClass="w-full sm:w-44"></p-dropdown>
      <p-dropdown [options]="paymentOptions" [(ngModel)]="paymentFilter" (onChange)="resetPage()" optionLabel="label" optionValue="value" placeholder="حالة الدفع" [showClear]="true" styleClass="w-full sm:w-44"></p-dropdown>
      <p-dropdown [options]="workspaceStatusOptions" [(ngModel)]="workspaceStatusFilter" (onChange)="resetPage()" optionLabel="label" optionValue="value" placeholder="حالة المساحة" [showClear]="true" styleClass="w-full sm:w-44"></p-dropdown>
      <p-dropdown [options]="subscriptionStatusOptions" [(ngModel)]="subscriptionStatusFilter" (onChange)="resetPage()" optionLabel="label" optionValue="value" placeholder="حالة الاشتراك" [showClear]="true" styleClass="w-full sm:w-44"></p-dropdown>
      <p-dropdown [options]="provisioningOptions" [(ngModel)]="provisioningFilter" (onChange)="resetPage()" optionLabel="label" optionValue="value" placeholder="حالة التجهيز" [showClear]="true" styleClass="w-full sm:w-44"></p-dropdown>
      <button pButton label="إنشاء مساحة عمل" icon="pi pi-plus" (click)="openCreate()"></button>
    </app-page-header>

    <div class="lifecycle-note"><i class="pi pi-shield"></i><span>لا تصبح المساحة جاهزة للدخول إلا بعد اعتماد الطلب والدفع، اكتمال الاشتراك والعضوية، نجاح تجهيز قاعدة البيانات، ثم فحص الجاهزية.</span></div>
    <div class="lf-card overflow-hidden">
      <p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm" [scrollable]="true">
        <ng-template pTemplate="header"><tr><th>المساحة</th><th>المالك</th><th>الرحلة</th><th class="hidden lg:table-cell">الدفع / الاشتراك</th><th class="hidden xl:table-cell">قاعدة البيانات</th><th class="hidden md:table-cell">آخر تحديث</th><th class="text-center">الإجراءات</th></tr></ng-template>
        <ng-template pTemplate="body" let-a><tr>
          <td><div class="type-line"><span class="type-badge" [class.coach]="isFreelance(a)"><i class="pi" [class.pi-user-edit]="isFreelance(a)" [class.pi-building]="!isFreelance(a)"></i>{{ workspaceTypeLabel(a) }}</span><span class="status" [class.pending]="isPending(a.status)" [class.accepted]="a.status === Status.Approved" [class.rejected]="a.status === Status.Rejected">{{ statusLabel(a.status) }}</span></div><b class="block mt-1">{{ a.workspaceIdentifier || 'بدون معرف' }}</b><small dir="ltr" class="block text-slate-400">{{ a.id }}</small></td>
          <td><div dir="ltr">{{ a.applicantEmail }}</div><small dir="ltr" class="text-slate-400">{{ a.applicantPhoneNumber || '—' }}</small></td>
          <td><span class="journey" [class.ready]="a.userJourneyStage === 'Ready'" [class.failed]="a.userJourneyStage === 'ProvisioningFailed' || a.userJourneyStage === 'Rejected' || a.userJourneyStage === 'PaymentRejected'">{{ journeyLabel(a.userJourneyStage) }}</span><small class="block mt-1 text-slate-500">{{ a.nextStep || '—' }}</small></td>
          <td class="hidden lg:table-cell"><small class="block">الدفع: <b>{{ paymentLabel(a.paymentStatus) }}</b></small><small class="block">الاشتراك: <b>{{ subscriptionLabel(a.subscriptionStatus) }}</b></small></td>
          <td class="hidden xl:table-cell"><span class="database-badge" [class.good]="a.databaseStatusCode === 'Ready'" [class.bad]="a.databaseStatusCode === 'Failed'">{{ databaseLabel(a.databaseStatusCode) }}</span></td>
          <td class="hidden md:table-cell" dir="ltr">{{ (a.lastUpdatedAtUtc || a.submittedAt) | date:'yyyy-MM-dd HH:mm' }}</td>
          <td class="text-center whitespace-nowrap actions">
            @if (a.status === Status.Submitted) { <button pButton pTooltip="بدء المراجعة" icon="pi pi-eye" class="p-button-sm p-button-text" [disabled]="busyId() === a.id" (click)="startReview(a)"></button> }
            @if (a.status === Status.UnderReview && a.paymentRequestId && a.paymentStatus === PRS.Pending) { <button pButton pTooltip="اعتماد الدفع" icon="pi pi-wallet" class="p-button-sm p-button-success p-button-text" [disabled]="busyId() === a.id" (click)="approvePayment(a)"></button><button pButton pTooltip="رفض الدفع" icon="pi pi-ban" class="p-button-sm p-button-danger p-button-text" [disabled]="busyId() === a.id" (click)="openPaymentReject(a)"></button> }
            @if (a.status === Status.UnderReview) { <button pButton pTooltip="طلب معلومات إضافية" icon="pi pi-file-edit" class="p-button-sm p-button-warning p-button-text" [disabled]="busyId() === a.id" (click)="openInformation(a)"></button> }
            @if (isWorkspaceApplication(a) && a.status === Status.UnderReview && a.paymentStatus === PRS.Approved) { <button pButton pTooltip="اعتماد الطلب وبدء التجهيز" icon="pi pi-check" class="p-button-sm p-button-success p-button-text" [disabled]="busyId() === a.id" (click)="approve(a)"></button> }
            @if (isWorkspaceApplication(a) && a.userJourneyStage === 'ProvisioningFailed') { <button pButton pTooltip="إعادة محاولة التجهيز" icon="pi pi-refresh" class="p-button-sm p-button-warning p-button-text" [disabled]="busyId() === a.id" (click)="retry(a)"></button> }
            @if (a.status === Status.UnderReview) { <button pButton pTooltip="رفض الطلب" icon="pi pi-times" class="p-button-sm p-button-danger p-button-text" [disabled]="busyId() === a.id" (click)="openReject(a)"></button> }
            @if (a.status !== Status.Submitted && a.status !== Status.UnderReview && a.userJourneyStage !== 'ProvisioningFailed') { <span class="text-xs text-slate-400">لا إجراء متاح</span> }
          </td>
        </tr></ng-template>
        <ng-template pTemplate="emptymessage"><tr><td colspan="7" class="text-center text-slate-400 py-10"><i class="pi pi-inbox text-2xl block mb-2 opacity-40"></i>لا توجد طلبات مطابقة</td></tr></ng-template>
      </p-table>
      <app-server-paginator [page]="page" [pageSize]="pageSize" [totalCount]="totalCount" (pageChange)="onPageChange($event)"></app-server-paginator>
    </div>

    <p-dialog header="إنشاء مساحة عمل" [(visible)]="showCreate" [modal]="true" [style]="{ width: '720px', maxWidth: '96vw' }" [draggable]="false">
      <div class="create-grid">
        <label class="lf-label">نوع المساحة<select class="lf-input" [(ngModel)]="createType"><option [ngValue]="PWT.Gym">جيم</option><option [ngValue]="PWT.FreelanceCoach">مدرب حر مستقل</option></select></label>
        <label class="lf-label">الباقة<select class="lf-input" [(ngModel)]="createPlanId"><option value="">اختر الباقة</option>@for (plan of plans(); track plan.id) {<option [value]="plan.id">{{ plan.name }} — {{ plan.price }} {{ plan.currency }}</option>}</select></label>
        <label class="lf-label">اسم المساحة *<input class="lf-input" [(ngModel)]="createWorkspaceName" /></label>
        <label class="lf-label">المعرف / Subdomain *<input class="lf-input" dir="ltr" [(ngModel)]="createWorkspaceIdentifier" /></label>
        <label class="lf-label">اسم المالك *<input class="lf-input" [(ngModel)]="createOwnerFullName" /></label>
        <label class="lf-label">البريد الإلكتروني *<input class="lf-input" dir="ltr" type="email" [(ngModel)]="createOwnerEmail" /></label>
        <label class="lf-label">الهاتف<input class="lf-input" [(ngModel)]="createOwnerPhone" /></label>
        <label class="lf-label">الاسم التجاري<input class="lf-input" [(ngModel)]="createBrandName" /></label>
        @if (createType === PWT.FreelanceCoach) { <label class="lf-label">التخصص<input class="lf-input" [(ngModel)]="createSpecialization" /></label><label class="lf-label">طريقة التدريب<input class="lf-input" [(ngModel)]="createDeliveryMode" /></label> }
        <label class="lf-label full">الوصف<textarea class="lf-input" rows="3" [(ngModel)]="createDescription"></textarea></label>
      </div>
      <p class="create-note"><i class="pi pi-info-circle"></i> سيُنشأ الطلب والدفع المعلّق، وتُعرض كلمة المرور المؤقتة مرة واحدة فقط إذا كانت الهوية جديدة.</p>
      <ng-template pTemplate="footer"><button pButton label="إلغاء" class="p-button-text p-button-secondary" (click)="showCreate = false"></button><button pButton label="إنشاء الطلب" icon="pi pi-plus" [disabled]="creating()" (click)="createWorkspace()"></button></ng-template>
    </p-dialog>

    <p-dialog header="بيانات الدخول المؤقتة" [(visible)]="showCredentials" [modal]="true" [style]="{ width: '460px', maxWidth: '94vw' }" [draggable]="false">
      <div class="credential-warning"><i class="pi pi-exclamation-triangle"></i><span>احفظ كلمة المرور الآن؛ لن تُعرض مرة أخرى من الخادم.</span></div><div class="credential-row"><span>البريد</span><b dir="ltr">{{ credentialEmail }}</b></div><div class="credential-row"><span>كلمة المرور المؤقتة</span><b dir="ltr">{{ credentialPassword }}</b></div>
      <ng-template pTemplate="footer"><button pButton label="تم الحفظ" icon="pi pi-check" (click)="showCredentials = false"></button></ng-template>
    </p-dialog>

    <p-dialog header="طلب استكمال البيانات" [(visible)]="showInformation" [modal]="true" [style]="{ width: '520px', maxWidth: '94vw' }" [draggable]="false">
      @if (informationTarget(); as application) { <p class="text-sm text-slate-500 mb-3">اطلب الحقول الناقصة فقط؛ لن يبدأ مقدم الطلب من جديد.</p><label class="lf-label">رسالة الاستكمال *</label><textarea class="lf-input" rows="3" [(ngModel)]="informationMessage"></textarea><label class="lf-label mt-3">الحقول المطلوبة</label><input class="lf-input" [(ngModel)]="informationFields" [placeholder]="fieldHint(application)" /> }
      <ng-template pTemplate="footer"><button pButton label="إلغاء" class="p-button-text p-button-secondary" (click)="showInformation = false"></button><button pButton label="إرسال" icon="pi pi-send" [disabled]="busyId() === informationTarget()?.id" (click)="sendInformationRequest()"></button></ng-template>
    </p-dialog>

    <p-dialog header="رفض الطلب" [(visible)]="showReject" [modal]="true" [style]="{ width: '460px', maxWidth: '94vw' }" [draggable]="false"><label class="lf-label">سبب الرفض *</label><textarea class="lf-input" rows="3" [(ngModel)]="rejectReason"></textarea><ng-template pTemplate="footer"><button pButton label="إلغاء" class="p-button-text p-button-secondary" (click)="showReject = false"></button><button pButton label="رفض نهائي" icon="pi pi-times" class="p-button-danger" [disabled]="busyId() === rejectTarget()?.id" (click)="confirmReject()"></button></ng-template></p-dialog>

    <p-dialog header="رفض الدفع" [(visible)]="showPaymentReject" [modal]="true" [style]="{ width: '460px', maxWidth: '94vw' }" [draggable]="false"><label class="lf-label">سبب رفض الدفع *</label><textarea class="lf-input" rows="3" [(ngModel)]="paymentRejectReason"></textarea><ng-template pTemplate="footer"><button pButton label="إلغاء" class="p-button-text p-button-secondary" (click)="showPaymentReject = false"></button><button pButton label="رفض الدفع" icon="pi pi-ban" class="p-button-danger" [disabled]="busyId() === paymentRejectTarget()?.id" (click)="confirmPaymentReject()"></button></ng-template></p-dialog>
  `,
  styles: [`
    .lifecycle-note{display:flex;align-items:flex-start;gap:.5rem;margin:0 0 1rem;padding:.75rem .9rem;border:1px solid #bfdbfe;border-radius:.65rem;color:#1e40af;background:#eff6ff;font-size:.82rem;line-height:1.5}.type-line{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap}.type-badge,.journey,.database-badge{display:inline-flex;align-items:center;gap:.3rem;padding:.25rem .5rem;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:.7rem;font-weight:800}.type-badge.coach{background:#ede9fe;color:#6d28d9}.status{display:inline-block;padding:.2rem .45rem;border-radius:999px;background:#f1f5f9;color:#475569;font-size:.68rem;font-weight:700}.status.pending{background:#fef3c7;color:#a16207}.status.accepted{background:#d1fae5;color:#047857}.status.rejected{background:#fee2e2;color:#b91c1c}.journey{border-radius:7px;background:#f1f5f9;color:#475569}.journey.ready,.database-badge.good{background:#d1fae5;color:#047857}.journey.failed,.database-badge.bad{background:#fee2e2;color:#b91c1c}.database-badge{background:#f1f5f9;color:#475569}.actions{min-width:150px}.create-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem}.create-grid .full{grid-column:1/-1}.create-note{margin:.8rem 0 0;padding:.6rem .7rem;border-radius:7px;color:#92400e;background:#fffbeb;font-size:.78rem}.credential-warning{display:flex;gap:.5rem;padding:.7rem;border-radius:8px;color:#92400e;background:#fffbeb;font-size:.82rem}.credential-row{display:flex;justify-content:space-between;gap:1rem;margin-top:.7rem;padding:.7rem;border:1px solid #e2e8f0;border-radius:8px}.credential-row span{color:#64748b}.credential-row b{color:#0f172a}@media(max-width:700px){.create-grid{grid-template-columns:1fr}.create-grid .full{grid-column:auto}}
  `],
})
export class WorkspaceApplicationsComponent implements OnInit {
  private readonly service = inject(WorkspaceApplicationsService);
  private readonly paymentService = inject(PaymentRequestsService);
  private readonly plansService = inject(PlansService);
  private readonly notify = inject(NotifyService);
  readonly Status = PlatformApplicationStatus;
  readonly PRS = PaymentRequestStatus;
  readonly PWT = PlatformWorkspaceType;
  rows = signal<PlatformWorkspaceApplication[]>([]);
  plans = signal<PlanDto[]>([]);
  loading = signal(false);
  creating = signal(false);
  busyId = signal<string | null>(null);
  informationTarget = signal<PlatformWorkspaceApplication | null>(null);
  rejectTarget = signal<PlatformWorkspaceApplication | null>(null);
  paymentRejectTarget = signal<PlatformWorkspaceApplication | null>(null);
  page = 1; pageSize = 20; totalCount = 0;
  statusFilter: PlatformApplicationStatus | null = null;
  typeFilter: PlatformApplicationType | null = null;
  paymentFilter: PaymentRequestStatus | null = null;
  workspaceStatusFilter: TenantStatus | null = null;
  subscriptionStatusFilter: TenantSubscriptionStatus | null = null;
  provisioningFilter: ProvisioningJobStatus | null = null;
  showInformation = false; showReject = false; showPaymentReject = false; showCreate = false; showCredentials = false;
  informationMessage = ''; informationFields = ''; rejectReason = ''; paymentRejectReason = '';
  createType = PlatformWorkspaceType.Gym; createPlanId = ''; createWorkspaceName = ''; createWorkspaceIdentifier = '';
  createOwnerFullName = ''; createOwnerEmail = ''; createOwnerPhone = ''; createBrandName = ''; createDescription = '';
  createSpecialization = ''; createDeliveryMode = '';
  credentialEmail = ''; credentialPassword = '';
  readonly statusOptions = [
    { label: 'مسودة', value: PlatformApplicationStatus.Draft }, { label: 'مُقدّم', value: PlatformApplicationStatus.Submitted }, { label: 'قيد المراجعة', value: PlatformApplicationStatus.UnderReview }, { label: 'مطلوب استكمال', value: PlatformApplicationStatus.NeedsMoreInformation }, { label: 'مقبول', value: PlatformApplicationStatus.Approved }, { label: 'مرفوض', value: PlatformApplicationStatus.Rejected }, { label: 'ملغى', value: PlatformApplicationStatus.Cancelled }, { label: 'منتهٍ', value: PlatformApplicationStatus.Expired },
  ];
  readonly typeOptions = [
    { label: 'جيم', value: PlatformApplicationType.GymWorkspaceCreation }, { label: 'مدرب حر مستقل', value: PlatformApplicationType.FreelanceWorkspaceCreation }, { label: 'مدرب ضمن فريق', value: PlatformApplicationType.CoachMembership }, { label: 'مساعد', value: PlatformApplicationType.AssistantMembership }, { label: 'عميل', value: PlatformApplicationType.ClientMembership },
  ];
  readonly paymentOptions = [{ label: 'الدفع قيد المراجعة', value: PaymentRequestStatus.Pending }, { label: 'الدفع معتمد', value: PaymentRequestStatus.Approved }, { label: 'الدفع مرفوض', value: PaymentRequestStatus.Rejected }, { label: 'الدفع ملغى', value: PaymentRequestStatus.Cancelled }, { label: 'الدفع منتهٍ', value: PaymentRequestStatus.Expired }];
  readonly workspaceStatusOptions = [{ label: 'نشطة', value: TenantStatus.Active }, { label: 'موقوفة', value: TenantStatus.Suspended }, { label: 'تجريبية', value: TenantStatus.Trial }, { label: 'متأخرة السداد', value: TenantStatus.PastDue }, { label: 'ملغاة', value: TenantStatus.Cancelled }, { label: 'بانتظار الاعتماد', value: TenantStatus.PendingApproval }, { label: 'مؤرشفة', value: TenantStatus.Archived }, { label: 'محذوفة', value: TenantStatus.Deleted }];
  readonly subscriptionStatusOptions = [{ label: 'بانتظار الدفع', value: TenantSubscriptionStatus.PendingPayment }, { label: 'تجريبي', value: TenantSubscriptionStatus.Trial }, { label: 'نشط', value: TenantSubscriptionStatus.Active }, { label: 'متأخر', value: TenantSubscriptionStatus.PastDue }, { label: 'موقوف', value: TenantSubscriptionStatus.Suspended }, { label: 'ملغى', value: TenantSubscriptionStatus.Cancelled }, { label: 'منتهٍ', value: TenantSubscriptionStatus.Expired }, { label: 'فترة سماح', value: TenantSubscriptionStatus.GracePeriod }];
  readonly provisioningOptions = [{ label: 'معلّق', value: ProvisioningJobStatus.Pending }, { label: 'بانتظار السعة', value: ProvisioningJobStatus.AwaitingDatabaseCapacity }, { label: 'جاري التجهيز', value: ProvisioningJobStatus.Provisioning }, { label: 'مكتمل', value: ProvisioningJobStatus.Completed }, { label: 'فشل', value: ProvisioningJobStatus.Failed }];

  ngOnInit(): void { this.loadPlans(); this.load(); }
  loadPlans(): void { this.plansService.list(true, 1, 100).subscribe({ next: data => this.plans.set(data.items), error: err => this.notify.error(errMsg(err)) }); }
  load(): void { this.loading.set(true); this.service.list({ status: this.statusFilter ?? undefined, type: this.typeFilter ?? undefined, paymentStatus: this.paymentFilter ?? undefined, workspaceStatus: this.workspaceStatusFilter ?? undefined, subscriptionStatus: this.subscriptionStatusFilter ?? undefined, provisioningStatus: this.provisioningFilter ?? undefined }, this.page, this.pageSize).subscribe({ next: data => { this.rows.set(data.items); this.totalCount = data.totalCount; this.loading.set(false); }, error: err => { this.notify.error(errMsg(err)); this.loading.set(false); } }); }
  resetPage(): void { this.page = 1; this.load(); }
  onPageChange(event: { page: number; pageSize: number }): void { this.page = event.page; this.pageSize = event.pageSize; this.load(); }

  openCreate(): void { if (!this.plans().length) this.loadPlans(); this.showCreate = true; }
  createWorkspace(): void {
    if (this.creating()) return;
    if (!this.createPlanId || !this.createWorkspaceName.trim() || !this.createWorkspaceIdentifier.trim() || !this.createOwnerFullName.trim() || !this.createOwnerEmail.trim()) { this.notify.error('أكمل نوع المساحة والباقة وبيانات المالك والمساحة.'); return; }
    const plan = this.plans().find(item => item.id === this.createPlanId); if (!plan) { this.notify.error('اختر باقة صحيحة.'); return; }
    const command: CreatePlatformWorkspaceApplicationCommand = { workspaceType: this.createType, workspaceName: this.createWorkspaceName.trim(), workspaceIdentifier: this.createWorkspaceIdentifier.trim().toLowerCase(), ownerFullName: this.createOwnerFullName.trim(), ownerEmail: this.createOwnerEmail.trim(), ownerPhoneNumber: this.createOwnerPhone.trim() || undefined, planId: plan.id, billingCycle: plan.billingCycle, brandName: this.createBrandName.trim() || undefined, description: this.createDescription.trim() || undefined, specialization: this.createSpecialization.trim() || undefined, deliveryMode: this.createDeliveryMode.trim() || undefined };
    this.creating.set(true); this.service.create(command).subscribe({ next: result => { this.creating.set(false); this.showCreate = false; this.credentialEmail = result.oneTimeCredentials?.email || ''; this.credentialPassword = result.oneTimeCredentials?.temporaryPassword || ''; this.showCredentials = Boolean(result.oneTimeCredentials); this.resetCreate(); this.load(); this.notify.success('تم إنشاء الطلب والدفع المعلّق.'); }, error: err => { this.creating.set(false); this.notify.error(errMsg(err)); } });
  }
  resetCreate(): void { this.createPlanId = ''; this.createWorkspaceName = ''; this.createWorkspaceIdentifier = ''; this.createOwnerFullName = ''; this.createOwnerEmail = ''; this.createOwnerPhone = ''; this.createBrandName = ''; this.createDescription = ''; this.createSpecialization = ''; this.createDeliveryMode = ''; }

  startReview(application: PlatformWorkspaceApplication): void { this.run(application, () => this.service.startReview(application), 'بدأت مراجعة الطلب.'); }
  approve(application: PlatformWorkspaceApplication): void { void this.confirmThen(application, 'اعتماد الطلب', 'سيبدأ اعتماد مساحة العمل وتجهيزها بعد اعتماد الدفع. متابعة؟', () => this.service.approve(application), 'تم اعتماد الطلب وبدء التجهيز.'); }
  retry(application: PlatformWorkspaceApplication): void { void this.confirmThen(application, 'إعادة تجهيز المساحة', 'سيعيد الخادم تشغيل التجهيز مع الحفاظ على السجلات الحالية ومنع التكرار. متابعة؟', () => this.service.retryProvisioning(application), 'تمت إعادة محاولة التجهيز.'); }
  approvePayment(application: PlatformWorkspaceApplication): void { if (!application.paymentRequestId || this.busyId()) return; this.busyId.set(application.id); void this.notify.confirm({ header: 'اعتماد الدفع', message: 'سيصبح الطلب مؤهلاً لاعتماد المساحة والتجهيز. متابعة؟', acceptLabel: 'اعتماد الدفع', icon: 'pi pi-check-circle' }).then(ok => { if (!ok) { this.busyId.set(null); return; } this.paymentService.approve(application.paymentRequestId!).subscribe({ next: () => { this.busyId.set(null); this.notify.success('تم اعتماد الدفع.'); this.load(); }, error: err => { this.busyId.set(null); this.notify.error(errMsg(err)); } }); }); }
  openPaymentReject(application: PlatformWorkspaceApplication): void { if (this.busyId()) return; this.paymentRejectTarget.set(application); this.paymentRejectReason = ''; this.showPaymentReject = true; }
  confirmPaymentReject(): void { const application = this.paymentRejectTarget(); if (!application?.paymentRequestId || this.busyId()) { if (!application?.paymentRequestId) this.notify.error('لا يوجد طلب دفع مرتبط.'); return; } if (!this.paymentRejectReason.trim()) { this.notify.error('أدخل سبب رفض الدفع.'); return; } this.busyId.set(application.id); this.paymentService.reject(application.paymentRequestId, { rejectReason: this.paymentRejectReason.trim() }).subscribe({ next: () => { this.busyId.set(null); this.showPaymentReject = false; this.notify.success('تم رفض الدفع.'); this.load(); }, error: err => { this.busyId.set(null); this.notify.error(errMsg(err)); } }); }
  openInformation(application: PlatformWorkspaceApplication): void { this.informationTarget.set(application); this.informationMessage = ''; this.informationFields = this.fieldHint(application); this.showInformation = true; }
  openReject(application: PlatformWorkspaceApplication): void { this.rejectTarget.set(application); this.rejectReason = ''; this.showReject = true; }
  confirmReject(): void { const application = this.rejectTarget(); if (!application || !this.rejectReason.trim()) { this.notify.error('أدخل سبب الرفض قبل التأكيد.'); return; } this.run(application, () => this.service.reject(application, this.rejectReason.trim()), 'تم رفض الطلب.'); this.showReject = false; }
  sendInformationRequest(): void { const application = this.informationTarget(); const fields = this.informationFields.split(',').map(item => item.trim()).filter(Boolean); if (!application || !this.informationMessage.trim() || !fields.length) { this.notify.error('أدخل رسالة الاستكمال وحقلًا واحدًا على الأقل.'); return; } this.run(application, () => this.service.requestInformation(application, this.informationMessage.trim(), fields), 'أُرسل طلب الاستكمال.'); this.showInformation = false; }

  isWorkspaceApplication(application: PlatformWorkspaceApplication): boolean { return application.applicationType === PlatformApplicationType.GymWorkspaceCreation || application.applicationType === PlatformApplicationType.FreelanceWorkspaceCreation; }
  isFreelance(application: PlatformWorkspaceApplication): boolean { return application.workspaceType === PlatformWorkspaceType.FreelanceCoach || application.applicationType === PlatformApplicationType.FreelanceWorkspaceCreation; }
  workspaceTypeLabel(application: PlatformWorkspaceApplication): string { return this.isFreelance(application) ? 'مدرب حر مستقل' : this.isWorkspaceApplication(application) ? 'جيم' : this.typeLabel(application.applicationType); }
  typeLabel(type: PlatformApplicationType): string { return ({ 1: 'جيم', 2: 'مدرب حر مستقل', 3: 'انضمام مدرب', 4: 'انضمام مساعد', 5: 'انضمام عميل' } as Record<number, string>)[type] || 'طلب مساحة'; }
  statusLabel(status: PlatformApplicationStatus): string { return ({ 1: 'مسودة', 2: 'مُقدّم', 3: 'قيد المراجعة', 4: 'مطلوب استكمال', 5: 'مقبول', 6: 'مرفوض', 7: 'ملغى', 8: 'منتهي' } as Record<number, string>)[status] || 'غير معروف'; }
  isPending(status: PlatformApplicationStatus): boolean { return [PlatformApplicationStatus.Submitted, PlatformApplicationStatus.UnderReview, PlatformApplicationStatus.NeedsMoreInformation].includes(status); }
  paymentLabel(status: PaymentRequestStatus | null): string { return ({ 1: 'قيد المراجعة', 2: 'معتمد', 3: 'مرفوض', 4: 'ملغى', 5: 'منتهٍ' } as Record<number, string>)[status ?? 0] || 'غير مسجل'; }
  subscriptionLabel(status: TenantSubscriptionStatus | null): string { return ({ 1: 'بانتظار الدفع', 2: 'تجريبي', 3: 'نشط', 4: 'متأخر', 5: 'موقوف', 6: 'ملغى', 7: 'منتهٍ', 8: 'فترة سماح' } as Record<number, string>)[status ?? 0] || 'غير مسجل'; }
  databaseLabel(status: string | null): string { return ({ Unassigned: 'غير مخصصة', Provisioning: 'جاري التجهيز', Ready: 'جاهزة', Unavailable: 'غير متاحة', Failed: 'فشل', Released: 'محررة' } as Record<string, string>)[status || 'Unassigned'] || 'غير مكتملة'; }
  journeyLabel(stage: string): string { return ({ Submitted: 'تم الإرسال', UnderReview: 'قيد المراجعة', MoreInformation: 'مطلوب معلومات', Preparing: 'جاري التجهيز', ProvisioningFailed: 'فشل التجهيز', PaymentRejected: 'الدفع مرفوض', Rejected: 'الطلب مرفوض', Ready: 'جاهزة للدخول' } as Record<string, string>)[stage] || 'غير مكتملة'; }
  fieldHint(application: PlatformWorkspaceApplication): string { return this.isFreelance(application) ? 'مثال: BrandName, Bio, Specialties' : 'مثال: WorkspaceName, Address'; }

  private async confirmThen(application: PlatformWorkspaceApplication, header: string, message: string, request: () => Observable<PlatformWorkspaceApplication>, success: string): Promise<void> { if (this.busyId()) return; this.busyId.set(application.id); if (!(await this.notify.confirm({ header, message, acceptLabel: 'تأكيد', icon: 'pi pi-check-circle' }))) { this.busyId.set(null); return; } this.execute(application, request, success); }
  private execute(application: PlatformWorkspaceApplication, request: () => Observable<PlatformWorkspaceApplication>, success: string): void { request().subscribe({ next: () => { this.busyId.set(null); this.notify.success(success); this.load(); }, error: err => { this.busyId.set(null); this.notify.error(errMsg(err)); this.load(); } }); }
  private run(application: PlatformWorkspaceApplication, request: () => Observable<PlatformWorkspaceApplication>, success: string): void { if (this.busyId()) return; this.busyId.set(application.id); request().subscribe({ next: () => { this.busyId.set(null); this.notify.success(success); this.load(); }, error: err => { this.busyId.set(null); this.notify.error(errMsg(err)); this.load(); } }); }
}
