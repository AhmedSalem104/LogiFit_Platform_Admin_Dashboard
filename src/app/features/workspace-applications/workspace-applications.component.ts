import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
  PaymentProofDto,
} from '../../core/models/platform.models';
import {
  CreatePlatformWorkspaceApplicationCommand,
  PlatformApplicationStatus,
  PlatformApplicationType,
  PlatformWorkspaceApplication,
  PlatformWorkspaceType,
  WorkspaceApplicationsService,
} from './workspace-applications.service';

const WORKSPACE_EDITABLE_APPLICATION_FIELDS = [
  'WorkspaceName', 'OwnerFullName', 'BrandName', 'LogoUrl', 'PhotoUrl',
  'CoverImageUrl', 'BackgroundImageUrl', 'PrimaryColor', 'SecondaryColor',
  'Bio', 'Specialties', 'Certifications', 'SocialLinks', 'WelcomeMessage',
  'BookingSettings',
] as const;
const WORKSPACE_SPECIAL_APPLICATION_FIELDS = ['PaymentProof'] as const;

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
          <td class="hidden lg:table-cell"><small class="block">الدفع: <b>{{ paymentLabel(a.paymentStatus) }}</b></small><small class="block">الإثبات: <b>{{ paymentProofLabel(a) }}</b></small><small class="block">الاشتراك: <b>{{ subscriptionLabel(a.subscriptionStatus) }}</b></small></td>
          <td class="hidden xl:table-cell"><span class="database-badge" [class.good]="a.databaseStatusCode === 'Ready'" [class.bad]="a.databaseStatusCode === 'Failed'">{{ databaseLabel(a.databaseStatusCode) }}</span></td>
          <td class="hidden md:table-cell" dir="ltr">{{ (a.lastUpdatedAtUtc || a.submittedAt) | date:'yyyy-MM-dd HH:mm' }}</td>
          <td class="text-center whitespace-nowrap actions">
            @if (a.status === Status.Submitted) { <button pButton pTooltip="بدء المراجعة" icon="pi pi-eye" class="p-button-sm p-button-text" [disabled]="busyId() === a.id" (click)="startReview(a)"></button> }
            @if (a.status === Status.UnderReview && a.paymentRequestId) { <button pButton [pTooltip]="a.hasPaymentProof ? 'عرض إثبات الدفع' : 'لا يوجد إثبات - إرفاق الآن'" [icon]="a.hasPaymentProof ? 'pi pi-image' : 'pi pi-upload'" class="p-button-sm p-button-info p-button-text" [disabled]="busyId() === a.id" (click)="a.hasPaymentProof ? previewProof(a) : openProofUpload(a)"></button> }
            @if (a.status === Status.UnderReview && a.paymentRequestId && a.paymentStatus === PRS.Pending) { @if (a.hasPaymentProof) { <button pButton pTooltip="استبدال الإثبات" icon="pi pi-upload" class="p-button-sm p-button-secondary p-button-text" [disabled]="busyId() === a.id" (click)="openProofUpload(a)"></button> } <button pButton pTooltip="اعتماد الدفع" icon="pi pi-wallet" class="p-button-sm p-button-success p-button-text" [disabled]="busyId() === a.id || !a.hasPaymentProof" (click)="approvePayment(a)"></button><button pButton pTooltip="رفض الدفع" icon="pi pi-ban" class="p-button-sm p-button-danger p-button-text" [disabled]="busyId() === a.id" (click)="openPaymentReject(a)"></button> }
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
      <p class="create-note"><i class="pi pi-info-circle"></i> سيُنشأ الطلب والدفع المعلّق. بعد الإنشاء يجب حفظ إثبات الدفع قبل اعتماده؛ وتُعرض كلمة المرور المؤقتة مرة واحدة فقط إذا كانت الهوية جديدة.</p>
      <ng-template pTemplate="footer"><button pButton label="إلغاء" class="p-button-text p-button-secondary" (click)="showCreate = false"></button><button pButton label="إنشاء الطلب" icon="pi pi-plus" [disabled]="creating()" (click)="createWorkspace()"></button></ng-template>
    </p-dialog>

    <p-dialog header="بيانات الدخول المؤقتة" [(visible)]="showCredentials" (onHide)="closeCredentials()" [modal]="true" [style]="{ width: '460px', maxWidth: '94vw' }" [draggable]="false">
      <div class="credential-warning"><i class="pi pi-exclamation-triangle"></i><span>احفظ كلمة المرور الآن؛ لن تُعرض مرة أخرى من الخادم.</span></div><div class="credential-row"><span>البريد</span><b dir="ltr">{{ credentialEmail }}</b></div><div class="credential-row"><span>كلمة المرور المؤقتة</span><b dir="ltr">{{ credentialPassword }}</b></div>
      <ng-template pTemplate="footer"><button pButton label="تم الحفظ" icon="pi pi-check" (click)="closeCredentials()"></button></ng-template>
    </p-dialog>

    <p-dialog header="مراجعة إثبات الدفع" [(visible)]="showProofPreview" (onHide)="closeProofPreview()" [modal]="true" [style]="{ width: '720px', maxWidth: '96vw' }" [draggable]="false">
      @if (proofPreviewTarget(); as application) {
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="bg-slate-50 rounded-lg px-3 py-2"><span class="text-slate-400 block text-xs">المساحة</span><b>{{ application.workspaceIdentifier || 'بدون معرف' }}</b></div>
            <div class="bg-slate-50 rounded-lg px-3 py-2"><span class="text-slate-400 block text-xs">الإصدار الحالي</span><b>{{ application.paymentProofVersion || '—' }}</b></div>
          </div>
          @if (proofLoading()) { <div class="p-8 text-center text-slate-500"><i class="pi pi-spin pi-spinner mr-2"></i>جاري تحميل الإثبات المحفوظ...</div> }
          @else if (proofLoadError()) { <div class="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-700"><i class="pi pi-exclamation-triangle block mb-2 text-xl"></i>تعذر فتح الإثبات المحفوظ. سيظل سجل الإثبات محفوظا ويمكن إعادة المحاولة.</div> }
          @else if (proofBlobUrl() && proofContentType().startsWith('image/')) { <img [src]="proofBlobUrl()!" alt="إثبات الدفع" class="w-full rounded-lg border border-slate-200 max-h-[58vh] object-contain bg-slate-50" /> }
          @else if (proofSafeUrl() && proofContentType() === 'application/pdf') { <iframe [src]="proofSafeUrl()!" title="إثبات الدفع PDF" class="w-full h-[58vh] rounded-lg border border-slate-200 bg-slate-50"></iframe> }
          @else if (proofBlobUrl()) { <a [href]="proofBlobUrl()!" target="_blank" rel="noopener" class="block rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-blue-700"><i class="pi pi-file block mb-2 text-2xl"></i>فتح الملف المحفوظ</a> }

          <div class="rounded-lg border border-slate-200 p-3">
            <div class="flex items-center justify-between gap-2 mb-2"><b class="text-sm">سجل الإثباتات المحفوظة</b><span class="text-xs text-slate-500">لا يتم حذف الإصدارات السابقة</span></div>
            @if (proofHistoryLoading()) { <p class="text-xs text-slate-500">جاري تحميل السجل...</p> }
            @else if (proofHistoryError()) { <p class="text-xs text-amber-700">تعذر تحميل سجل الإصدارات.</p> }
            @else if (!proofHistory().length) { <p class="text-xs text-slate-500">لا توجد إصدارات مسجلة.</p> }
            @else { <div class="space-y-2">@for (proof of proofHistory(); track proof.id) { <div class="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs"><span><b>الإصدار {{ proof.version }}</b> · {{ proof.originalFileName }} · {{ proof.contentType }}<small class="block text-slate-500" dir="ltr">{{ proof.uploadedAtUtc | date:'yyyy-MM-dd HH:mm' }} · SHA-256: {{ proof.sha256 }}</small></span><button pButton label="فتح" icon="pi pi-external-link" class="p-button-sm p-button-text" (click)="previewProofVersion(application, proof.version)"></button></div> }</div> }
          </div>
        </div>
      }
      <ng-template pTemplate="footer"><button pButton label="إرفاق إصدار جديد" icon="pi pi-upload" class="p-button-secondary" (click)="openProofUpload(proofPreviewTarget()!); showProofPreview = false"></button><button pButton label="إغلاق" class="p-button-text" (click)="showProofPreview = false"></button></ng-template>
    </p-dialog>

    <p-dialog header="إرفاق إثبات الدفع" [(visible)]="showProofUpload" [modal]="true" [style]="{ width: '520px', maxWidth: '94vw' }" [draggable]="false">
      @if (proofUploadTarget(); as application) {
        <p class="text-sm text-slate-500 mb-3">سيُحفظ الملف كإصدار جديد مرتبط بطلب الدفع {{ application.paymentRequestId }}. الإصدارات السابقة لا تُحذف.</p>
        <label class="lf-label">الصورة أو ملف PDF *<input class="lf-input" type="file" accept="image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf" (change)="onProofFileSelected($event)" /></label>
        @if (proofFileName) { <div class="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm"><i class="pi pi-paperclip mr-2"></i>{{ proofFileName }}</div> }
        <p class="mt-3 text-xs text-slate-500">الأنواع المسموحة: JPG وPNG وPDF — الحد الأقصى 10 ميجابايت.</p>
      }
      <ng-template pTemplate="footer"><button pButton label="إلغاء" class="p-button-text p-button-secondary" (click)="showProofUpload = false"></button><button pButton label="حفظ الإثبات" icon="pi pi-save" [disabled]="proofUploading() || !proofFile" (click)="uploadProof()"></button></ng-template>
    </p-dialog>

    <p-dialog header="طلب استكمال البيانات" [(visible)]="showInformation" [modal]="true" [style]="{ width: '520px', maxWidth: '94vw' }" [draggable]="false">
      @if (informationTarget(); as application) { <p class="text-sm text-slate-500 mb-3">اطلب الحقول الناقصة فقط؛ لن يبدأ مقدم الطلب من جديد.</p><label class="lf-label">رسالة الاستكمال *</label><textarea class="lf-input" rows="3" [(ngModel)]="informationMessage"></textarea><label class="lf-label mt-3">الحقول المطلوبة</label><input class="lf-input" [(ngModel)]="informationFields" [placeholder]="fieldHint(application)" /> @if (isWorkspaceApplication(application)) { <label class="proof-request-option"><input type="checkbox" [checked]="hasInformationField('PaymentProof')" (change)="toggleInformationField('PaymentProof', $event)" /> <span>اطلب من المالك رفع صورة أو ملف إثبات الدفع</span></label><small class="block mt-2 text-slate-500">سيظهر الرفع في شاشة متابعة الطلب، ويصل الملف محفوظًا للإدارة كإصدار قابل للمعاينة.</small> } }
      <ng-template pTemplate="footer"><button pButton label="إلغاء" class="p-button-text p-button-secondary" (click)="showInformation = false"></button><button pButton label="إرسال" icon="pi pi-send" [disabled]="busyId() === informationTarget()?.id" (click)="sendInformationRequest()"></button></ng-template>
    </p-dialog>

    <p-dialog header="رفض الطلب" [(visible)]="showReject" [modal]="true" [style]="{ width: '460px', maxWidth: '94vw' }" [draggable]="false"><label class="lf-label">سبب الرفض *</label><textarea class="lf-input" rows="3" [(ngModel)]="rejectReason"></textarea><ng-template pTemplate="footer"><button pButton label="إلغاء" class="p-button-text p-button-secondary" (click)="showReject = false"></button><button pButton label="رفض نهائي" icon="pi pi-times" class="p-button-danger" [disabled]="busyId() === rejectTarget()?.id" (click)="confirmReject()"></button></ng-template></p-dialog>

    <p-dialog header="رفض الدفع" [(visible)]="showPaymentReject" [modal]="true" [style]="{ width: '460px', maxWidth: '94vw' }" [draggable]="false"><label class="lf-label">سبب رفض الدفع *</label><textarea class="lf-input" rows="3" [(ngModel)]="paymentRejectReason"></textarea><ng-template pTemplate="footer"><button pButton label="إلغاء" class="p-button-text p-button-secondary" (click)="showPaymentReject = false"></button><button pButton label="رفض الدفع" icon="pi pi-ban" class="p-button-danger" [disabled]="busyId() === paymentRejectTarget()?.id" (click)="confirmPaymentReject()"></button></ng-template></p-dialog>
  `,
  styles: [`
    .lifecycle-note{display:flex;align-items:flex-start;gap:.5rem;margin:0 0 1rem;padding:.75rem .9rem;border:1px solid #bfdbfe;border-radius:.65rem;color:#1e40af;background:#eff6ff;font-size:.82rem;line-height:1.5}.type-line{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap}.type-badge,.journey,.database-badge{display:inline-flex;align-items:center;gap:.3rem;padding:.25rem .5rem;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:.7rem;font-weight:800}.type-badge.coach{background:#ede9fe;color:#6d28d9}.status{display:inline-block;padding:.2rem .45rem;border-radius:999px;background:#f1f5f9;color:#475569;font-size:.68rem;font-weight:700}.status.pending{background:#fef3c7;color:#a16207}.status.accepted{background:#d1fae5;color:#047857}.status.rejected{background:#fee2e2;color:#b91c1c}.journey{border-radius:7px;background:#f1f5f9;color:#475569}.journey.ready,.database-badge.good{background:#d1fae5;color:#047857}.journey.failed,.database-badge.bad{background:#fee2e2;color:#b91c1c}.database-badge{background:#f1f5f9;color:#475569}.actions{min-width:150px}.create-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem}.create-grid .full{grid-column:1/-1}.create-note{margin:.8rem 0 0;padding:.6rem .7rem;border-radius:7px;color:#92400e;background:#fffbeb;font-size:.78rem}.proof-request-option{display:flex;align-items:center;gap:.5rem;margin-top:.7rem;padding:.65rem .75rem;border:1px solid #fde68a;border-radius:8px;color:#92400e;background:#fffbeb;font-size:.82rem}.proof-request-option input{width:1rem;height:1rem}.credential-warning{display:flex;gap:.5rem;padding:.7rem;border-radius:8px;color:#92400e;background:#fffbeb;font-size:.82rem}.credential-row{display:flex;justify-content:space-between;gap:1rem;margin-top:.7rem;padding:.7rem;border:1px solid #e2e8f0;border-radius:8px}.credential-row span{color:#64748b}.credential-row b{color:#0f172a}@media(max-width:700px){.create-grid{grid-template-columns:1fr}.create-grid .full{grid-column:auto}}
  `],
})
export class WorkspaceApplicationsComponent implements OnInit {
  private readonly service = inject(WorkspaceApplicationsService);
  private readonly paymentService = inject(PaymentRequestsService);
  private readonly plansService = inject(PlansService);
  private readonly notify = inject(NotifyService);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
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
  proofPreviewTarget = signal<PlatformWorkspaceApplication | null>(null);
  proofUploadTarget = signal<PlatformWorkspaceApplication | null>(null);
  proofHistory = signal<PaymentProofDto[]>([]);
  proofBlobUrl = signal<string | null>(null);
  proofSafeUrl = signal<SafeResourceUrl | null>(null);
  proofContentType = signal('');
  proofLoading = signal(false);
  proofLoadError = signal(false);
  proofHistoryLoading = signal(false);
  proofHistoryError = signal(false);
  proofFile: File | null = null;
  proofFileName = '';
  proofUploading = signal(false);
  page = 1; pageSize = 20; totalCount = 0;
  statusFilter: PlatformApplicationStatus | null = null;
  typeFilter: PlatformApplicationType | null = null;
  paymentFilter: PaymentRequestStatus | null = null;
  workspaceStatusFilter: TenantStatus | null = null;
  subscriptionStatusFilter: TenantSubscriptionStatus | null = null;
  provisioningFilter: ProvisioningJobStatus | null = null;
  showInformation = false; showReject = false; showPaymentReject = false; showCreate = false; showCredentials = false; showProofPreview = false; showProofUpload = false;
  informationMessage = ''; informationFields = ''; rejectReason = ''; paymentRejectReason = '';
  createType = PlatformWorkspaceType.Gym; createPlanId = ''; createWorkspaceName = ''; createWorkspaceIdentifier = '';
  createOwnerFullName = ''; createOwnerEmail = ''; createOwnerPhone = ''; createBrandName = ''; createDescription = '';
  createSpecialization = ''; createDeliveryMode = '';
  credentialEmail = ''; credentialPassword = ''; private proofAfterCreate: PlatformWorkspaceApplication | null = null;
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

  ngOnInit(): void {
    this.loadPlans();
    this.load();
    if (this.route.snapshot.queryParamMap.get('create') === '1') this.openCreate();
  }
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
    this.creating.set(true); this.service.create(command).subscribe({ next: result => { this.creating.set(false); this.showCreate = false; this.credentialEmail = result.oneTimeCredentials?.email || ''; this.credentialPassword = result.oneTimeCredentials?.temporaryPassword || ''; this.showCredentials = Boolean(result.oneTimeCredentials); this.proofAfterCreate = !result.application.hasPaymentProof && result.application.paymentRequestId ? result.application : null; this.resetCreate(); this.load(); const proofTarget = this.proofAfterCreate; this.proofAfterCreate = null; if (!result.oneTimeCredentials && proofTarget) this.openProofUpload(proofTarget); this.notify.success('تم إنشاء الطلب. الخطوة التالية: حفظ إثبات الدفع قبل الاعتماد.'); }, error: err => { this.creating.set(false); this.notify.error(errMsg(err)); } });
  }
  closeCredentials(): void {
    this.showCredentials = false;
    const application = this.proofAfterCreate
      || this.rows().find(item => item.applicantEmail.toLowerCase() === this.credentialEmail.toLowerCase() && !item.hasPaymentProof && !!item.paymentRequestId)
      || null;
    this.proofAfterCreate = null;
    if (application) this.openProofUpload(application);
  }
  resetCreate(): void { this.createPlanId = ''; this.createWorkspaceName = ''; this.createWorkspaceIdentifier = ''; this.createOwnerFullName = ''; this.createOwnerEmail = ''; this.createOwnerPhone = ''; this.createBrandName = ''; this.createDescription = ''; this.createSpecialization = ''; this.createDeliveryMode = ''; }

  startReview(application: PlatformWorkspaceApplication): void { this.run(application, () => this.service.startReview(application), 'بدأت مراجعة الطلب.'); }
  approve(application: PlatformWorkspaceApplication): void { void this.confirmThen(application, 'اعتماد الطلب', 'سيبدأ اعتماد مساحة العمل وتجهيزها بعد اعتماد الدفع. متابعة؟', () => this.service.approve(application), 'تم اعتماد الطلب وبدء التجهيز.'); }
  retry(application: PlatformWorkspaceApplication): void { void this.confirmThen(application, 'إعادة تجهيز المساحة', 'سيعيد الخادم تشغيل التجهيز مع الحفاظ على السجلات الحالية ومنع التكرار. متابعة؟', () => this.service.retryProvisioning(application), 'تمت إعادة محاولة التجهيز.'); }
  approvePayment(application: PlatformWorkspaceApplication): void { if (!application.paymentRequestId || this.busyId()) return; if (!application.hasPaymentProof) { this.notify.error('لا يمكن اعتماد الدفع قبل حفظ إثبات الدفع.'); this.openProofUpload(application); return; } this.busyId.set(application.id); void this.notify.confirm({ header: 'اعتماد الدفع', message: 'سيصبح الطلب مؤهلاً لاعتماد المساحة والتجهيز. متابعة؟', acceptLabel: 'اعتماد الدفع', icon: 'pi pi-check-circle' }).then(ok => { if (!ok) { this.busyId.set(null); return; } this.paymentService.approve(application.paymentRequestId!).subscribe({ next: () => { this.busyId.set(null); this.notify.success('تم اعتماد الدفع.'); this.load(); }, error: err => { this.busyId.set(null); this.notify.error(errMsg(err)); this.load(); } }); }); }

  paymentProofLabel(application: PlatformWorkspaceApplication): string { return application.hasPaymentProof ? `محفوظ (${application.paymentProofVersion ? `إصدار ${application.paymentProofVersion}` : 'إصدار حالي'})` : 'غير مرفق'; }

  previewProof(application: PlatformWorkspaceApplication): void {
    if (!application.paymentRequestId) return;
    this.releaseProofUrl();
    this.proofPreviewTarget.set(application);
    this.proofLoading.set(true);
    this.proofLoadError.set(false);
    this.proofHistory.set([]);
    this.proofHistoryError.set(false);
    this.showProofPreview = true;
    this.loadProofHistory(application);
    this.paymentService.proof(application.paymentRequestId).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        this.proofBlobUrl.set(url);
        this.proofSafeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        this.proofContentType.set(blob.type || 'application/octet-stream');
        this.proofLoading.set(false);
      },
      error: () => { this.proofLoading.set(false); this.proofLoadError.set(true); }
    });
  }

  previewProofVersion(application: PlatformWorkspaceApplication, version: number): void {
    if (!application.paymentRequestId) return;
    this.releaseProofUrl();
    this.proofLoading.set(true);
    this.proofLoadError.set(false);
    this.paymentService.proofVersion(application.paymentRequestId, version).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        this.proofBlobUrl.set(url);
        this.proofSafeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        this.proofContentType.set(blob.type || 'application/octet-stream');
        this.proofLoading.set(false);
      },
      error: () => { this.proofLoading.set(false); this.proofLoadError.set(true); }
    });
  }

  openProofUpload(application: PlatformWorkspaceApplication): void { if (!application.paymentRequestId) return; this.proofUploadTarget.set(application); this.proofFile = null; this.proofFileName = ''; this.showProofUpload = true; }

  onProofFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) { this.proofFile = null; this.proofFileName = ''; return; }
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type) || file.size <= 0 || file.size > 10 * 1024 * 1024) { this.notify.error('اختر ملف JPG أو PNG أو PDF بحجم لا يتجاوز 10 ميجابايت.'); input.value = ''; this.proofFile = null; this.proofFileName = ''; return; }
    this.proofFile = file;
    this.proofFileName = file.name;
  }

  uploadProof(): void {
    const application = this.proofUploadTarget();
    if (!application?.paymentRequestId || !this.proofFile || this.proofUploading()) return;
    this.proofUploading.set(true);
    this.paymentService.uploadProof(application.paymentRequestId, this.proofFile).subscribe({
      next: () => { this.proofUploading.set(false); this.showProofUpload = false; this.notify.success('تم حفظ إثبات الدفع كسجل دائم.'); this.load(); },
      error: err => { this.proofUploading.set(false); this.notify.error(errMsg(err)); }
    });
  }

  closeProofPreview(): void { this.releaseProofUrl(); this.proofPreviewTarget.set(null); this.proofHistory.set([]); }

  private loadProofHistory(application: PlatformWorkspaceApplication): void {
    if (!application.paymentRequestId) return;
    this.proofHistoryLoading.set(true);
    this.paymentService.proofHistory(application.paymentRequestId).subscribe({
      next: items => { this.proofHistory.set(items); this.proofHistoryLoading.set(false); },
      error: () => { this.proofHistoryLoading.set(false); this.proofHistoryError.set(true); }
    });
  }

  private releaseProofUrl(): void { const url = this.proofBlobUrl(); if (url) URL.revokeObjectURL(url); this.proofBlobUrl.set(null); this.proofSafeUrl.set(null); this.proofContentType.set(''); }

  openPaymentReject(application: PlatformWorkspaceApplication): void { if (this.busyId()) return; this.paymentRejectTarget.set(application); this.paymentRejectReason = ''; this.showPaymentReject = true; }
  confirmPaymentReject(): void { const application = this.paymentRejectTarget(); if (!application?.paymentRequestId || this.busyId()) { if (!application?.paymentRequestId) this.notify.error('لا يوجد طلب دفع مرتبط.'); return; } if (!this.paymentRejectReason.trim()) { this.notify.error('أدخل سبب رفض الدفع.'); return; } this.busyId.set(application.id); this.paymentService.reject(application.paymentRequestId, { rejectReason: this.paymentRejectReason.trim() }).subscribe({ next: () => { this.busyId.set(null); this.showPaymentReject = false; this.notify.success('تم رفض الدفع.'); this.load(); }, error: err => { this.busyId.set(null); this.notify.error(errMsg(err)); } }); }
  openInformation(application: PlatformWorkspaceApplication): void { this.informationTarget.set(application); this.informationMessage = ''; this.informationFields = this.defaultInformationFields(application); this.showInformation = true; }
  openReject(application: PlatformWorkspaceApplication): void { this.rejectTarget.set(application); this.rejectReason = ''; this.showReject = true; }
  confirmReject(): void { const application = this.rejectTarget(); if (!application || !this.rejectReason.trim()) { this.notify.error('أدخل سبب الرفض قبل التأكيد.'); return; } this.run(application, () => this.service.reject(application, this.rejectReason.trim()), 'تم رفض الطلب.'); this.showReject = false; }
  sendInformationRequest(): void { const application = this.informationTarget(); const fields = [...new Set(this.informationFields.split(',').map(item => item.trim()).filter(Boolean))]; if (!application || !this.informationMessage.trim() || !fields.length) { this.notify.error('أدخل رسالة الاستكمال وحقلًا واحدًا على الأقل.'); return; } const allowedFields = this.editableApplicationFields(application); const invalidFields = fields.filter(field => !allowedFields.includes(field)); if (invalidFields.length) { this.notify.error(`الحقول غير متاحة لهذا النوع: ${invalidFields.join(', ')}. الحقول المسموحة: ${allowedFields.join(', ')}`); return; } this.run(application, () => this.service.requestInformation(application, this.informationMessage.trim(), fields), 'أُرسل طلب الاستكمال.'); this.showInformation = false; }

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
  private editableApplicationFields(application: PlatformWorkspaceApplication): readonly string[] { return this.isWorkspaceApplication(application) ? [...WORKSPACE_EDITABLE_APPLICATION_FIELDS, ...WORKSPACE_SPECIAL_APPLICATION_FIELDS] : ['FullName']; }
  private defaultInformationFields(application: PlatformWorkspaceApplication): string { if (!this.isWorkspaceApplication(application)) return 'FullName'; const proof = !application.hasPaymentProof && application.paymentRequestId ? ', PaymentProof' : ''; return this.isFreelance(application) ? `BrandName, Bio, Specialties${proof}` : `WorkspaceName${proof}`; }
  hasInformationField(field: string): boolean { return this.informationFields.split(',').map(item => item.trim()).includes(field); }
  toggleInformationField(field: string, event: Event): void { const checked = (event.target as HTMLInputElement).checked; const fields = this.informationFields.split(',').map(item => item.trim()).filter(Boolean).filter(item => item !== field); if (checked) fields.push(field); this.informationFields = [...new Set(fields)].join(', '); }
  fieldHint(application: PlatformWorkspaceApplication): string { return `مثال: ${this.defaultInformationFields(application)}`; }

  private async confirmThen(application: PlatformWorkspaceApplication, header: string, message: string, request: () => Observable<PlatformWorkspaceApplication>, success: string): Promise<void> { if (this.busyId()) return; this.busyId.set(application.id); if (!(await this.notify.confirm({ header, message, acceptLabel: 'تأكيد', icon: 'pi pi-check-circle' }))) { this.busyId.set(null); return; } this.execute(application, request, success); }
  private execute(application: PlatformWorkspaceApplication, request: () => Observable<PlatformWorkspaceApplication>, success: string): void { request().subscribe({ next: () => { this.busyId.set(null); this.notify.success(success); this.load(); }, error: err => { this.busyId.set(null); this.notify.error(errMsg(err)); this.load(); } }); }
  private run(application: PlatformWorkspaceApplication, request: () => Observable<PlatformWorkspaceApplication>, success: string): void { if (this.busyId()) return; this.busyId.set(application.id); request().subscribe({ next: () => { this.busyId.set(null); this.notify.success(success); this.load(); }, error: err => { this.busyId.set(null); this.notify.error(errMsg(err)); this.load(); } }); }
}
