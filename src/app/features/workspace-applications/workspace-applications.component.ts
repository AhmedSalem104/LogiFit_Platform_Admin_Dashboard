import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { ServerPaginatorComponent } from '../../shared/ui/server-paginator.component';
import { NotifyService, errMsg } from '../../shared/ui/notify.service';
import { PlansService } from '../plans/plans.service';
import { BillingCycle, PlanDto } from '../../core/models/platform.models';
import {
  CreatePlatformWorkspaceApplicationCommand,
  OneTimeOwnerCredentials,
  PlatformApplicationStatus,
  PlatformApplicationType,
  PlatformDatabaseStatus,
  PlatformPaymentStatus,
  PlatformProvisioningStatus,
  PlatformSubscriptionStatus,
  PlatformWorkspaceApplication,
  PlatformWorkspaceStatus,
  WorkspaceApplicationsFilters,
  WorkspaceApplicationsService,
} from './workspace-applications.service';

interface TimelineStep {
  key: string;
  label: string;
  icon: string;
  state: 'done' | 'current' | 'blocked' | 'pending';
  detail: string;
}

interface CreateWorkspaceForm {
  workspaceType: 1 | 2;
  workspaceName: string;
  workspaceIdentifier: string;
  ownerFullName: string;
  ownerEmail: string;
  ownerPhoneNumber: string;
  planId: string | null;
  billingCycle: BillingCycle;
  brandName: string;
  description: string;
  address: string;
  specialization: string;
  deliveryMode: string;
}

/** Platform review and onboarding surface for independent Gym/FreelanceCoach workspaces. */
@Component({
  selector: 'app-workspace-applications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, TableModule, DropdownModule, DialogModule, ButtonModule, TooltipModule, PageHeaderComponent, ServerPaginatorComponent],
  template: `
    <div class="lf-page" dir="rtl">
      <app-page-header title="طلبات مساحات العمل" subtitle="مسار موحد للجيم والمدرب الحر: طلب، دفع، مراجعة، تجهيز، تفعيل" icon="pi pi-verified">
        <button pButton label="إنشاء مساحة عمل" icon="pi pi-plus" (click)="openCreate()"></button>
      </app-page-header>

      <section class="workspace-policy-note">
        <i class="pi pi-shield"></i>
        <div><strong>قاعدة الوصول:</strong> حالة الطلب أو الدفع وحدها لا تعني أن المساحة جاهزة. لا يسمح بالدخول إلا بعد جاهزية قاعدة البيانات والاشتراك والعضوية.</div>
      </section>

      <section class="lf-card workspace-filters">
        <div class="filters-heading"><div><h2>تصفية دورة الحياة</h2><p>افصل بين نوع المساحة، الدفع، التجهيز، الاشتراك والوصول.</p></div><button type="button" class="clear-filters" (click)="clearFilters()"><i class="pi pi-filter-slash"></i>مسح الفلاتر</button></div>
        <div class="filters-grid">
          <label><span>نوع المساحة</span><p-dropdown [options]="typeOptions" [(ngModel)]="typeFilter" (onChange)="resetPage()" optionLabel="label" optionValue="value" placeholder="كل الأنواع" [showClear]="true" styleClass="w-full"></p-dropdown></label>
          <label><span>حالة الطلب</span><p-dropdown [options]="statusOptions" [(ngModel)]="statusFilter" (onChange)="resetPage()" optionLabel="label" optionValue="value" placeholder="كل الحالات" [showClear]="true" styleClass="w-full"></p-dropdown></label>
          <label><span>حالة الدفع</span><p-dropdown [options]="paymentOptions" [(ngModel)]="paymentFilter" (onChange)="resetPage()" optionLabel="label" optionValue="value" placeholder="كل حالات الدفع" [showClear]="true" styleClass="w-full"></p-dropdown></label>
          <label><span>حالة التجهيز</span><p-dropdown [options]="provisioningOptions" [(ngModel)]="provisioningFilter" (onChange)="resetPage()" optionLabel="label" optionValue="value" placeholder="كل حالات التجهيز" [showClear]="true" styleClass="w-full"></p-dropdown></label>
          <label><span>حالة المساحة</span><p-dropdown [options]="workspaceOptions" [(ngModel)]="workspaceFilter" (onChange)="resetPage()" optionLabel="label" optionValue="value" placeholder="كل حالات المساحة" [showClear]="true" styleClass="w-full"></p-dropdown></label>
          <label><span>حالة الاشتراك</span><p-dropdown [options]="subscriptionOptions" [(ngModel)]="subscriptionFilter" (onChange)="resetPage()" optionLabel="label" optionValue="value" placeholder="كل حالات الاشتراك" [showClear]="true" styleClass="w-full"></p-dropdown></label>
        </div>
      </section>

      @if (error()) { <div class="workspace-error"><i class="pi pi-exclamation-triangle"></i><span>{{ error() }}</span><button pButton label="إعادة المحاولة" class="p-button-sm p-button-outlined" (click)="load()"></button></div> }

      <section class="lf-card overflow-hidden">
        <div class="workspace-table-heading"><div><h2>قائمة الطلبات</h2><p>{{ totalCount | number }} طلب · اضغط على أي صف لرؤية المراحل بالتفصيل</p></div><span class="source-chip"><i class="pi pi-database"></i>بيانات حية</span></div>
        <p-table [value]="rows()" [loading]="loading()" styleClass="p-datatable-sm workspace-table" [scrollable]="true">
          <ng-template pTemplate="header"><tr><th>المساحة</th><th>المالك</th><th>حالة الطلب</th><th>المراحل المرتبطة</th><th>الخطوة التالية</th><th class="text-center">الإجراءات</th></tr></ng-template>
          <ng-template pTemplate="body" let-a><tr class="workspace-row" (click)="openDetails(a)">
            <td>
              <div class="workspace-type-cell" [class.freelance]="isFreelance(a)">
                <span class="workspace-type-icon"><i [class]="typeIcon(a)"></i></span>
                <div><strong>{{ typeLabel(a) }}</strong><small dir="ltr">{{ a.workspaceIdentifier || 'بدون معرّف' }}</small><span class="workspace-kind-badge" [class.freelance]="isFreelance(a)">{{ isFreelance(a) ? 'مساحة مستقلة' : 'مساحة جيم' }}</span></div>
              </div>
            </td>
            <td><div class="owner-cell" dir="ltr">{{ a.applicantEmail }}</div><small dir="ltr" class="muted-cell">{{ a.applicantPhoneNumber || '—' }}</small></td>
            <td><span class="status-pill" [class.good]="a.status === Status.Approved" [class.danger]="a.status === Status.Rejected" [class.info]="a.status === Status.UnderReview">{{ applicationStatusLabel(a.status) }}</span><small class="muted-cell">{{ a.requiredAction || '—' }}</small></td>
            <td><div class="stage-stack"><span class="mini-state">الدفع: {{ paymentLabel(a.paymentStatus) }}</span><span class="mini-state">المساحة: {{ workspaceLabel(a.workspaceStatus) }}</span><span class="mini-state">DB: {{ databaseLabel(a.databaseStatus, a.databaseStatusCode) }}</span><span class="mini-state">الاشتراك: {{ subscriptionLabel(a.subscriptionStatus) }}</span></div></td>
            <td><div class="next-step" [class.done]="a.canAccessDashboard"><i [class]="a.canAccessDashboard ? 'pi pi-check-circle' : 'pi pi-arrow-left'"></i><span>{{ a.canAccessDashboard ? 'جاهز للدخول' : (a.nextStep || 'راجع التفاصيل') }}</span></div><small class="error-code" *ngIf="a.provisioningErrorCode">{{ a.provisioningErrorCode }}</small></td>
            <td class="text-center whitespace-nowrap" (click)="$event.stopPropagation()">
              @if (a.status === Status.Submitted) { <button pButton pTooltip="بدء المراجعة" icon="pi pi-eye" class="p-button-sm p-button-text" [disabled]="busyId() === a.id" (click)="startReview(a)"></button> }
              @if (a.status === Status.UnderReview) { <button pButton pTooltip="طلب استكمال" icon="pi pi-file-edit" class="p-button-sm p-button-warning p-button-text" [disabled]="busyId() === a.id" (click)="openInformation(a)"></button>@if (a.paymentStatus === PaymentStatus.Approved) {<button pButton pTooltip="اعتماد وبدء التجهيز" icon="pi pi-check" class="p-button-sm p-button-success p-button-text" [disabled]="busyId() === a.id" (click)="approve(a)"></button>} @else {<a pButton pTooltip="فتح طلبات الدفع" icon="pi pi-wallet" class="p-button-sm p-button-help p-button-text" routerLink="/payment-requests" (click)="$event.stopPropagation()"></a>}<button pButton pTooltip="رفض" icon="pi pi-times" class="p-button-sm p-button-danger p-button-text" [disabled]="busyId() === a.id" (click)="openReject(a)"></button> }
              @if (canRetry(a)) { <button pButton pTooltip="إعادة محاولة التجهيز" icon="pi pi-refresh" class="p-button-sm p-button-warning p-button-text" [disabled]="busyId() === a.id" (click)="retry(a)"></button> }
              <button pButton pTooltip="التفاصيل" icon="pi pi-list" class="p-button-sm p-button-text" (click)="openDetails(a)"></button>
            </td>
          </tr></ng-template>
          <ng-template pTemplate="emptymessage"><tr><td colspan="6" class="text-center text-slate-400 py-12"><i class="pi pi-inbox text-3xl block mb-2 opacity-40"></i><strong class="block text-slate-500">لا توجد طلبات مطابقة</strong><span class="text-xs">جرّب مسح الفلاتر أو أنشئ مساحة عمل جديدة.</span></td></tr></ng-template>
        </p-table>
        <app-server-paginator [page]="page" [pageSize]="pageSize" [totalCount]="totalCount" (pageChange)="onPageChange($event)"></app-server-paginator>
      </section>

      <p-dialog header="تفاصيل دورة حياة مساحة العمل" [(visible)]="showDetails" [modal]="true" [style]="{ width: '880px', maxWidth: '96vw' }" [draggable]="false">
        @if (selected(); as a) {
          <div class="detail-identity" [class.freelance]="isFreelance(a)"><span class="workspace-type-icon"><i [class]="typeIcon(a)"></i></span><div><strong>{{ typeLabel(a) }}</strong><small dir="ltr">{{ a.applicantEmail }} · {{ a.workspaceIdentifier || 'بدون معرّف' }}</small></div><span class="status-pill mr-auto" [class.good]="a.canAccessDashboard">{{ a.canAccessDashboard ? 'جاهز للدخول' : applicationStatusLabel(a.status) }}</span></div>
          <div class="timeline" dir="rtl">@for (step of timeline(a); track step.key) {<div class="timeline-item" [class.done]="step.state === 'done'" [class.current]="step.state === 'current'" [class.blocked]="step.state === 'blocked'"><span class="timeline-marker"><i [class]="step.icon"></i></span><div><strong>{{ step.label }}</strong><span>{{ step.detail }}</span></div></div>}</div>
          <div class="detail-facts"><div><span>حالة الطلب</span><strong>{{ applicationStatusLabel(a.status) }}</strong></div><div><span>الدفع</span><strong>{{ paymentLabel(a.paymentStatus) }}</strong></div><div><span>قاعدة البيانات</span><strong>{{ databaseLabel(a.databaseStatus, a.databaseStatusCode) }}</strong></div><div><span>الاشتراك</span><strong>{{ subscriptionLabel(a.subscriptionStatus) }}</strong></div><div><span>الإجراء المطلوب</span><strong>{{ a.requiredAction || '—' }}</strong></div><div><span>آخر تحديث</span><strong dir="ltr">{{ a.lastUpdatedAtUtc ? (a.lastUpdatedAtUtc | date:'yyyy-MM-dd HH:mm') : '—' }}</strong></div></div>
          @if (a.userMessage) { <div class="detail-message" [class.success]="a.canAccessDashboard" [class.danger]="a.provisioningStatus === ProvisioningStatus.Failed"><i [class]="a.canAccessDashboard ? 'pi pi-check-circle' : 'pi pi-info-circle'"></i><div><strong>{{ a.userMessage }}</strong><small>{{ a.nextStep }}</small></div></div> }
        }
        <ng-template pTemplate="footer"><button pButton label="إغلاق" class="p-button-text" (click)="showDetails = false"></button></ng-template>
      </p-dialog>

      <p-dialog header="إنشاء مساحة عمل" [(visible)]="showCreate" [modal]="true" [style]="{ width: '780px', maxWidth: '96vw' }" [draggable]="false" [closable]="!createBusy()">
        <div class="wizard-progress"><span [class.active]="createStep === 1">1 <b>نوع المساحة</b></span><i></i><span [class.active]="createStep === 2">2 <b>بيانات المالك والمساحة</b></span></div>
        @if (createStep === 1) {
          <p class="wizard-intro">اختر نوعاً مستقلاً؛ المدرب الحر سيحصل على مساحة وقاعدة بيانات واشتراك منفصل، وليس عضوية داخل جيم.</p>
          <div class="type-choice-grid"><button type="button" class="type-choice" [class.selected]="createForm.workspaceType === 1" (click)="selectCreateType(1)"><span class="choice-icon gym"><i class="pi pi-building"></i></span><strong>جيم</strong><small>مساحة صالات وفروع وموظفين</small></button><button type="button" class="type-choice freelance" [class.selected]="createForm.workspaceType === 2" (click)="selectCreateType(2)"><span class="choice-icon coach"><i class="pi pi-user-edit"></i></span><strong>مدرب حر</strong><small>مساحة مستقلة للعملاء والجلسات والمدفوعات</small></button></div>
        } @else {
          <div class="selected-type-summary" [class.freelance]="createForm.workspaceType === 2"><span class="workspace-type-icon"><i [class]="createForm.workspaceType === 2 ? 'pi pi-user-edit' : 'pi pi-building'"></i></span><div><strong>{{ createForm.workspaceType === 2 ? 'مساحة مدرب حر مستقلة' : 'مساحة جيم' }}</strong><small>ستمر العملية بالمراحل نفسها: طلب ← دفع ← مراجعة ← تجهيز ← تفعيل</small></div></div>
          <div class="create-grid">
            <label><span>اسم المساحة *</span><input class="lf-input" [(ngModel)]="createForm.workspaceName" placeholder="مثال: Air Gym" /></label>
            <label><span>المعرّف / Subdomain *</span><input class="lf-input" [(ngModel)]="createForm.workspaceIdentifier" dir="ltr" placeholder="air-gym" /></label>
            <label><span>اسم المالك *</span><input class="lf-input" [(ngModel)]="createForm.ownerFullName" /></label>
            <label><span>البريد الإلكتروني *</span><input class="lf-input" type="email" [(ngModel)]="createForm.ownerEmail" dir="ltr" /></label>
            <label><span>الهاتف</span><input class="lf-input" [(ngModel)]="createForm.ownerPhoneNumber" dir="ltr" placeholder="+201..." /></label>
            <label><span>الباقة *</span><p-dropdown [options]="plans()" [(ngModel)]="createForm.planId" optionLabel="name" optionValue="id" placeholder="اختر الباقة" styleClass="w-full"></p-dropdown></label>
            <label><span>{{ createForm.workspaceType === 2 ? 'اسم النشاط' : 'الاسم التجاري' }}</span><input class="lf-input" [(ngModel)]="createForm.brandName" /></label>
            <label class="wide"><span>{{ createForm.workspaceType === 2 ? 'التخصص' : 'العنوان' }}</span>@if (createForm.workspaceType === 2) {<input class="lf-input" [(ngModel)]="createForm.specialization" />} @else {<input class="lf-input" [(ngModel)]="createForm.address" />}</label>
            <label class="wide"><span>{{ createForm.workspaceType === 2 ? 'طريقة تقديم التدريب' : 'العنوان التفصيلي' }}</span>@if (createForm.workspaceType === 2) {<input class="lf-input" [(ngModel)]="createForm.deliveryMode" />} @else {<input class="lf-input" [(ngModel)]="createForm.address" />}</label>
            <label class="wide"><span>{{ createForm.workspaceType === 2 ? 'نبذة عن المدرب' : 'وصف المساحة' }}</span><textarea class="lf-input" rows="3" [(ngModel)]="createForm.description"></textarea></label>
          </div>
          <p class="wizard-security"><i class="pi pi-lock"></i> للحساب الجديد سيولّد الخادم كلمة مرور مؤقتة ويعرضها مرة واحدة فقط بعد إنشاء الطلب. لا يتم تخزينها كنص صريح.</p>
        }
        <ng-template pTemplate="footer"><button pButton label="إلغاء" class="p-button-text p-button-secondary" [disabled]="createBusy()" (click)="showCreate = false"></button>@if (createStep === 2) {<button pButton label="رجوع" class="p-button-outlined" [disabled]="createBusy()" (click)="createStep = 1"></button><button pButton label="إنشاء الطلب" icon="pi pi-check" [loading]="createBusy()" [disabled]="!createValid() || createBusy()" (click)="submitCreate()"></button>} @else {<button pButton label="متابعة" icon="pi pi-arrow-left" (click)="createStep = 2"></button>}</ng-template>
      </p-dialog>

      <p-dialog header="بيانات الدخول — عرض مرة واحدة" [(visible)]="showCredentials" [modal]="true" [style]="{ width: '520px', maxWidth: '94vw' }" [closable]="false" [draggable]="false">
        @if (credentials(); as c) { <div class="credentials-warning"><i class="pi pi-exclamation-triangle"></i><strong>احفظ هذه البيانات الآن</strong><span>لن يتم عرض كلمة المرور المؤقتة مرة أخرى من الشاشة.</span></div><div class="credential-row"><span>البريد</span><strong dir="ltr">{{ c.email }}</strong></div><div class="credential-row"><span>كلمة المرور المؤقتة</span><strong dir="ltr" class="temporary-password">{{ c.temporaryPassword }}</strong></div><p class="text-xs text-slate-500 mt-3"><i class="pi pi-info-circle"></i> سيُطلب من المالك تغيير كلمة المرور عند أول دخول.</p> }
        <ng-template pTemplate="footer"><button pButton label="نسخ كلمة المرور" icon="pi pi-copy" class="p-button-outlined" (click)="copyCredentials()"></button><button pButton label="تم الحفظ" icon="pi pi-check" (click)="showCredentials = false"></button></ng-template>
      </p-dialog>

      <p-dialog header="طلب استكمال البيانات" [(visible)]="showInformation" [modal]="true" [style]="{ width: '520px', maxWidth: '94vw' }" [draggable]="false">
        @if (informationTarget(); as application) { <p class="text-sm text-slate-500 mb-3">حدد الحقول التي يحتاج مقدم الطلب إلى تعديلها فقط.</p><label class="lf-label">رسالة الاستكمال *</label><textarea class="lf-input" rows="3" [(ngModel)]="informationMessage"></textarea><span class="lf-label mt-3">الحقول المطلوبة *</span><div class="information-options">@for (field of informationFieldOptions(application); track field.value) {<label class="information-option"><input type="checkbox" [checked]="informationFields.includes(field.value)" (change)="toggleInformationField(field.value, $any($event.target).checked)" /><span>{{ field.label }}</span></label>}</div> }
        <ng-template pTemplate="footer"><button pButton label="إلغاء" class="p-button-text p-button-secondary" (click)="showInformation = false"></button><button pButton label="إرسال الطلب" icon="pi pi-send" (click)="sendInformationRequest()"></button></ng-template>
      </p-dialog>

      <p-dialog header="رفض الطلب" [(visible)]="showReject" [modal]="true" [style]="{ width: '460px', maxWidth: '94vw' }" [draggable]="false"><label class="lf-label">سبب الرفض *</label><textarea class="lf-input" rows="3" [(ngModel)]="rejectReason" placeholder="اكتب سبباً واضحاً يمكن فهمه."></textarea><ng-template pTemplate="footer"><button pButton label="إلغاء" class="p-button-text p-button-secondary" (click)="showReject = false"></button><button pButton label="رفض نهائي" icon="pi pi-times" class="p-button-danger" (click)="confirmReject()"></button></ng-template></p-dialog>
    </div>
  `,
  styles: [`
    .workspace-policy-note{display:flex;gap:.65rem;align-items:flex-start;padding:.85rem 1rem;border:1px solid #bfdbfe;border-radius:.85rem;color:#1e40af;background:#eff6ff;font-size:.78rem;line-height:1.7}.workspace-policy-note i{margin-top:.2rem;color:#2563eb}.workspace-filters{padding:1rem 1.1rem;background:linear-gradient(110deg,#fff,#f8fbff)}.filters-heading,.workspace-table-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1rem}.filters-heading h2,.workspace-table-heading h2{margin:0;color:#172033;font-size:.95rem;font-weight:800}.filters-heading p,.workspace-table-heading p{margin:.25rem 0 0;color:#94a3b8;font-size:.72rem}.clear-filters{border:0;color:#4f46e5;background:transparent;font-size:.72rem;font-weight:800;cursor:pointer}.filters-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:.75rem}.filters-grid label,.create-grid label{display:flex;flex-direction:column;gap:.35rem;color:#475569;font-size:.72rem;font-weight:800}.source-chip{display:inline-flex;align-items:center;gap:.35rem;padding:.3rem .6rem;border-radius:999px;color:#047857;background:#ecfdf5;font-size:.68rem;font-weight:800}.workspace-error{display:flex;align-items:center;gap:.65rem;padding:.8rem 1rem;border:1px solid #fecdd3;border-radius:.8rem;color:#be123c;background:#fff1f2;font-size:.78rem}.workspace-error span{flex:1}.workspace-table-heading{padding:1.1rem 1.1rem .1rem;margin:0}.workspace-table :global(.p-datatable-tbody > tr){cursor:pointer}.workspace-type-cell,.detail-identity,.selected-type-summary{display:flex;align-items:center;gap:.6rem}.workspace-type-icon{display:grid;width:2.15rem;height:2.15rem;flex:none;place-items:center;border-radius:.7rem;color:#2563eb;background:#eff6ff}.freelance .workspace-type-icon,.detail-identity.freelance .workspace-type-icon,.selected-type-summary.freelance .workspace-type-icon{color:#7c3aed;background:#f5f3ff}.workspace-type-cell strong,.detail-identity strong{display:block;color:#172033;font-size:.78rem}.workspace-type-cell small,.detail-identity small{display:block;margin-top:.15rem;color:#94a3b8;font-size:.65rem}.workspace-kind-badge{display:inline-block;margin-top:.25rem;padding:.16rem .4rem;border-radius:999px;color:#1d4ed8;background:#dbeafe;font-size:.58rem;font-weight:800}.workspace-kind-badge.freelance{color:#6d28d9;background:#ede9fe}.owner-cell{font-size:.75rem;font-weight:700}.muted-cell{display:block;color:#94a3b8;font-size:.65rem}.status-pill{display:inline-block;padding:.3rem .55rem;border-radius:999px;color:#a16207;background:#fef3c7;font-size:.68rem;font-weight:800}.status-pill.info{color:#1d4ed8;background:#dbeafe}.status-pill.good{color:#047857;background:#d1fae5}.status-pill.danger{color:#b91c1c;background:#fee2e2}.stage-stack{display:flex;flex-wrap:wrap;gap:.3rem;max-width:18rem}.mini-state{padding:.22rem .38rem;border:1px solid #e8edf4;border-radius:.4rem;color:#64748b;background:#f8fafc;font-size:.61rem;white-space:nowrap}.next-step{display:flex;align-items:flex-start;gap:.35rem;max-width:14rem;color:#475569;font-size:.68rem;line-height:1.5}.next-step i{color:#6366f1;margin-top:.15rem}.next-step.done{color:#047857}.next-step.done i{color:#10b981}.error-code{display:block;margin-top:.3rem;color:#be123c;font:600 .58rem ui-monospace,monospace}.timeline{display:grid;grid-template-columns:repeat(6,1fr);gap:.5rem;margin:1.25rem 0}.timeline-item{position:relative;display:flex;flex-direction:column;gap:.45rem;min-width:0;padding:.65rem .45rem;border:1px solid #e2e8f0;border-radius:.7rem;color:#94a3b8;background:#f8fafc;text-align:center}.timeline-item.done{color:#047857;border-color:#bbf7d0;background:#f0fdf4}.timeline-item.current{color:#1d4ed8;border-color:#bfdbfe;background:#eff6ff}.timeline-item.blocked{color:#b91c1c;border-color:#fecdd3;background:#fff1f2}.timeline-marker{display:grid;width:2rem;height:2rem;margin:auto;place-items:center;border-radius:50%;color:inherit;background:rgba(148,163,184,.13)}.timeline-item strong{display:block;color:inherit;font-size:.7rem}.timeline-item span:last-child{display:block;margin-top:.2rem;font-size:.59rem;line-height:1.45}.detail-identity{padding:.8rem;border:1px solid #dbeafe;border-radius:.8rem;background:#f8fbff}.detail-identity.freelance{border-color:#ddd6fe;background:#faf5ff}.detail-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem}.detail-facts>div{padding:.65rem;border:1px solid #edf1f6;border-radius:.65rem;background:#fafcff}.detail-facts span,.detail-facts strong{display:block}.detail-facts span{color:#94a3b8;font-size:.63rem}.detail-facts strong{margin-top:.25rem;color:#334155;font-size:.72rem}.detail-message{display:flex;gap:.55rem;margin-top:.8rem;padding:.75rem;border:1px solid #bfdbfe;border-radius:.7rem;color:#1d4ed8;background:#eff6ff;font-size:.72rem}.detail-message.success{border-color:#bbf7d0;color:#047857;background:#f0fdf4}.detail-message.danger{border-color:#fecdd3;color:#be123c;background:#fff1f2}.detail-message strong,.detail-message small{display:block}.detail-message small{margin-top:.2rem;color:inherit;font-size:.65rem}.wizard-progress{display:flex;align-items:center;justify-content:center;gap:.65rem;margin:.2rem 0 1.15rem;color:#94a3b8;font-size:.7rem}.wizard-progress span{display:flex;align-items:center;gap:.35rem}.wizard-progress span.active{color:#4f46e5;font-weight:800}.wizard-progress span:first-child{color:#4f46e5}.wizard-progress i{width:3.5rem;border-top:1px dashed #cbd5e1}.wizard-progress b{font-weight:inherit}.wizard-intro{margin:0 0 1rem;padding:.7rem .8rem;border-radius:.65rem;color:#475569;background:#f8fafc;font-size:.75rem;line-height:1.7}.type-choice-grid{display:grid;grid-template-columns:1fr 1fr;gap:.8rem}.type-choice{display:flex;flex-direction:column;align-items:flex-start;gap:.4rem;padding:1rem;border:1px solid #e2e8f0;border-radius:.9rem;background:#fff;text-align:right;cursor:pointer}.type-choice.selected{border-color:#60a5fa;background:#eff6ff;box-shadow:0 0 0 3px rgba(59,130,246,.1)}.type-choice.freelance.selected{border-color:#a78bfa;background:#f5f3ff;box-shadow:0 0 0 3px rgba(124,58,237,.1)}.choice-icon{display:grid;width:2.5rem;height:2.5rem;place-items:center;border-radius:.75rem;color:#2563eb;background:#dbeafe;font-size:1.1rem}.choice-icon.coach{color:#7c3aed;background:#ede9fe}.type-choice strong{color:#172033;font-size:.85rem}.type-choice small{color:#64748b;font-size:.68rem;line-height:1.5}.selected-type-summary{margin-bottom:1rem;padding:.7rem;border-radius:.7rem;color:#1d4ed8;background:#eff6ff}.selected-type-summary.freelance{color:#6d28d9;background:#f5f3ff}.selected-type-summary strong,.selected-type-summary small{display:block}.selected-type-summary strong{font-size:.78rem}.selected-type-summary small{margin-top:.15rem;color:inherit;font-size:.63rem}.create-grid{display:grid;grid-template-columns:1fr 1fr;gap:.8rem}.create-grid label.wide{grid-column:1/-1}.create-grid textarea{resize:vertical}.wizard-security{display:flex;gap:.4rem;align-items:flex-start;margin:.9rem 0 0;color:#64748b;font-size:.65rem;line-height:1.6}.wizard-security i{color:#10b981;margin-top:.15rem}.credentials-warning{display:flex;flex-direction:column;gap:.25rem;align-items:center;margin-bottom:1rem;padding:1rem;border:1px solid #fde68a;border-radius:.8rem;color:#92400e;background:#fffbeb;text-align:center;font-size:.75rem}.credentials-warning i{font-size:1.3rem;color:#f59e0b}.credentials-warning span{font-size:.65rem}.credential-row{display:flex;justify-content:space-between;gap:1rem;padding:.75rem 0;border-bottom:1px solid #edf1f6;font-size:.75rem}.credential-row span{color:#64748b}.credential-row strong{color:#172033}.temporary-password{padding:.25rem .45rem;border-radius:.35rem;color:#3730a3;background:#eef2ff;font-family:ui-monospace,monospace;letter-spacing:.08em}
    .information-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.45rem;margin-top:.45rem}.information-option{display:flex;align-items:center;gap:.45rem;padding:.55rem .65rem;border:1px solid #e2e8f0;border-radius:.55rem;color:#475569;background:#f8fafc;font-size:.72rem;cursor:pointer}.information-option input{accent-color:#4f46e5}.information-option:has(input:checked){border-color:#a5b4fc;color:#3730a3;background:#eef2ff}
    @media (max-width:1000px){.filters-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.timeline{grid-template-columns:repeat(3,1fr)}}@media (max-width:650px){.filters-grid,.create-grid,.type-choice-grid{grid-template-columns:1fr}.create-grid label.wide{grid-column:auto}.timeline{grid-template-columns:repeat(2,1fr)}.detail-facts{grid-template-columns:repeat(2,1fr)}.filters-heading,.workspace-table-heading{flex-direction:column}.workspace-table-heading .source-chip{align-self:flex-start}}
  `],
})
export class WorkspaceApplicationsComponent implements OnInit {
  private readonly service = inject(WorkspaceApplicationsService);
  private readonly plansService = inject(PlansService);
  private readonly notify = inject(NotifyService);

  readonly Status = PlatformApplicationStatus;
  readonly PaymentStatus = PlatformPaymentStatus;
  readonly ProvisioningStatus = PlatformProvisioningStatus;
  readonly rows = signal<PlatformWorkspaceApplication[]>([]);
  readonly plans = signal<PlanDto[]>([]);
  readonly loading = signal(false);
  readonly createBusy = signal(false);
  readonly error = signal('');
  readonly busyId = signal<string | null>(null);
  readonly selected = signal<PlatformWorkspaceApplication | null>(null);
  readonly informationTarget = signal<PlatformWorkspaceApplication | null>(null);
  readonly rejectTarget = signal<PlatformWorkspaceApplication | null>(null);
  readonly credentials = signal<OneTimeOwnerCredentials | null>(null);

  page = 1;
  pageSize = 20;
  totalCount = 0;
  typeFilter: PlatformApplicationType | null = null;
  statusFilter: PlatformApplicationStatus | null = null;
  paymentFilter: PlatformPaymentStatus | null = null;
  workspaceFilter: PlatformWorkspaceStatus | null = null;
  subscriptionFilter: PlatformSubscriptionStatus | null = null;
  provisioningFilter: PlatformProvisioningStatus | null = null;
  showDetails = false;
  showCreate = false;
  showCredentials = false;
  showInformation = false;
  showReject = false;
  createStep = 1;
  informationMessage = '';
  informationFields: string[] = [];
  rejectReason = '';
  createForm: CreateWorkspaceForm = this.emptyCreateForm();

  readonly typeOptions = [{ label: 'جيم', value: PlatformApplicationType.GymWorkspaceCreation }, { label: 'مدرب حر', value: PlatformApplicationType.FreelanceWorkspaceCreation }, { label: 'عضوية فريق', value: PlatformApplicationType.CoachMembership }];
  readonly statusOptions = [{ label: 'مسودة', value: PlatformApplicationStatus.Draft }, { label: 'مُقدّم', value: PlatformApplicationStatus.Submitted }, { label: 'قيد المراجعة', value: PlatformApplicationStatus.UnderReview }, { label: 'مطلوب استكمال', value: PlatformApplicationStatus.NeedsMoreInformation }, { label: 'مقبول', value: PlatformApplicationStatus.Approved }, { label: 'مرفوض', value: PlatformApplicationStatus.Rejected }];
  readonly paymentOptions = [{ label: 'قيد المراجعة', value: PlatformPaymentStatus.Pending }, { label: 'مقبول', value: PlatformPaymentStatus.Approved }, { label: 'مرفوض', value: PlatformPaymentStatus.Rejected }];
  readonly provisioningOptions = [{ label: 'بانتظار البدء', value: PlatformProvisioningStatus.Pending }, { label: 'بانتظار السعة', value: PlatformProvisioningStatus.AwaitingDatabaseCapacity }, { label: 'جاري التجهيز', value: PlatformProvisioningStatus.Provisioning }, { label: 'مكتمل', value: PlatformProvisioningStatus.Completed }, { label: 'فشل', value: PlatformProvisioningStatus.Failed }];
  readonly workspaceOptions = [{ label: 'بانتظار الموافقة', value: PlatformWorkspaceStatus.PendingApproval }, { label: 'جاري التجهيز', value: PlatformWorkspaceStatus.Provisioning }, { label: 'فشل التجهيز', value: PlatformWorkspaceStatus.ProvisioningFailed }, { label: 'بانتظار الاشتراك', value: PlatformWorkspaceStatus.PendingSubscription }, { label: 'نشط', value: PlatformWorkspaceStatus.Active }, { label: 'موقوف', value: PlatformWorkspaceStatus.Suspended }];
  readonly subscriptionOptions = [{ label: 'بانتظار الدفع', value: PlatformSubscriptionStatus.PendingPayment }, { label: 'بانتظار التفعيل', value: PlatformSubscriptionStatus.PendingActivation }, { label: 'نشط', value: PlatformSubscriptionStatus.Active }, { label: 'تجريبي', value: PlatformSubscriptionStatus.Trial }, { label: 'موقوف', value: PlatformSubscriptionStatus.Suspended }, { label: 'منتهٍ', value: PlatformSubscriptionStatus.Expired }];

  ngOnInit(): void { this.load(); this.plansService.list(true, 1, 100).subscribe({ next: response => this.plans.set(response.items), error: () => this.plans.set([]) }); }

  load(): void { this.loading.set(true); this.error.set(''); this.service.list(this.filters(), this.page, this.pageSize).subscribe({ next: data => { this.rows.set(data.items); this.totalCount = data.totalCount; this.loading.set(false); }, error: err => { this.error.set(errMsg(err)); this.loading.set(false); } }); }
  resetPage(): void { this.page = 1; this.load(); }
  onPageChange(event: { page: number; pageSize: number }): void { this.page = event.page; this.pageSize = event.pageSize; this.load(); }
  clearFilters(): void { this.typeFilter = null; this.statusFilter = null; this.paymentFilter = null; this.workspaceFilter = null; this.subscriptionFilter = null; this.provisioningFilter = null; this.resetPage(); }
  private filters(): WorkspaceApplicationsFilters { return { applicationType: this.typeFilter ?? undefined, status: this.statusFilter ?? undefined, paymentStatus: this.paymentFilter ?? undefined, workspaceStatus: this.workspaceFilter ?? undefined, subscriptionStatus: this.subscriptionFilter ?? undefined, provisioningStatus: this.provisioningFilter ?? undefined }; }

  isFreelance(application: PlatformWorkspaceApplication): boolean { return (application.workspaceType ?? application.applicationType) === 2; }
  typeIcon(application: PlatformWorkspaceApplication): string { return this.isFreelance(application) ? 'pi pi-user-edit' : 'pi pi-building'; }
  typeLabel(application: PlatformWorkspaceApplication): string { return this.isFreelance(application) ? 'مدرب حر' : application.applicationType === PlatformApplicationType.GymWorkspaceCreation ? 'جيم' : 'عضوية فريق'; }
  applicationStatusLabel(status: PlatformApplicationStatus): string { return ({ 1: 'مسودة', 2: 'مُقدّم', 3: 'قيد المراجعة', 4: 'مطلوب استكمال', 5: 'مقبول', 6: 'مرفوض', 7: 'ملغى', 8: 'منتهٍ' } as Record<number, string>)[status] ?? 'غير معروف'; }
  paymentLabel(status: PlatformPaymentStatus | null): string { return status == null ? 'غير مسجل' : ({ 1: 'قيد المراجعة', 2: 'مقبول', 3: 'مرفوض', 4: 'ملغى', 5: 'منتهٍ' } as Record<number, string>)[status] ?? 'غير معروف'; }
  workspaceLabel(status: PlatformWorkspaceStatus | null): string { return status == null ? 'غير منشأة' : ({ 1: 'نشطة', 2: 'موقوفة', 6: 'بانتظار الموافقة', 9: 'جاري التجهيز', 10: 'فشل التجهيز', 11: 'بانتظار الاشتراك', 12: 'بانتظار السعة' } as Record<number, string>)[status] ?? 'غير معروف'; }
  subscriptionLabel(status: PlatformSubscriptionStatus | null): string { return status == null ? 'غير مسجل' : ({ 1: 'بانتظار الدفع', 2: 'تجريبي', 3: 'نشط', 4: 'متأخر', 5: 'موقوف', 6: 'ملغى', 7: 'منتهٍ', 8: 'فترة سماح', 9: 'بانتظار التفعيل' } as Record<number, string>)[status] ?? 'غير معروف'; }
  databaseLabel(status: PlatformDatabaseStatus | null, code: PlatformWorkspaceApplication['databaseStatusCode'] = null): string { if (code) return ({ Unassigned: 'غير مخصصة', Provisioning: 'جاري التجهيز', Ready: 'جاهزة', Unavailable: 'غير متاحة', Failed: 'فشل', Released: 'محررة' } as Record<string, string>)[code] ?? code; return status == null ? 'غير مخصصة' : ({ 1: 'متاحة في المورد', 2: 'محجوزة', 3: 'جاري التجهيز', 4: 'جاهزة/مخصصة', 5: 'صيانة', 6: 'استعادة', 7: 'معطلة', 8: 'محررة' } as Record<number, string>)[status] ?? 'غير معروف'; }
  canRetry(application: PlatformWorkspaceApplication): boolean { return application.provisioningStatus === PlatformProvisioningStatus.Failed || application.workspaceStatus === PlatformWorkspaceStatus.ProvisioningFailed; }

  openDetails(application: PlatformWorkspaceApplication): void { this.selected.set(application); this.showDetails = true; }
  timeline(application: PlatformWorkspaceApplication): TimelineStep[] {
    const requestDone = application.status >= PlatformApplicationStatus.Submitted;
    const reviewDone = application.status === PlatformApplicationStatus.Approved || application.status === PlatformApplicationStatus.Rejected;
    const paymentDone = application.paymentStatus === PlatformPaymentStatus.Approved;
    const provisioningDone = application.provisioningStatus === PlatformProvisioningStatus.Completed || application.databaseStatus === PlatformDatabaseStatus.Assigned;
    const subscriptionDone = application.subscriptionStatus === PlatformSubscriptionStatus.Active || application.subscriptionStatus === PlatformSubscriptionStatus.Trial;
    const current = (condition: boolean, next: boolean, blocked = false): TimelineStep['state'] => blocked ? 'blocked' : condition ? 'done' : next ? 'current' : 'pending';
    return [
      { key: 'request', label: 'الطلب', icon: 'pi pi-file', state: current(requestDone, true), detail: this.applicationStatusLabel(application.status) },
      { key: 'payment', label: 'الدفع', icon: 'pi pi-wallet', state: current(paymentDone, !paymentDone && application.status >= PlatformApplicationStatus.Submitted, application.paymentStatus === PlatformPaymentStatus.Rejected), detail: this.paymentLabel(application.paymentStatus) },
      { key: 'review', label: 'المراجعة', icon: 'pi pi-search', state: current(reviewDone, application.status === PlatformApplicationStatus.UnderReview, application.status === PlatformApplicationStatus.Rejected), detail: this.applicationStatusLabel(application.status) },
      { key: 'provisioning', label: 'التجهيز', icon: 'pi pi-cog', state: current(provisioningDone, application.provisioningStatus === PlatformProvisioningStatus.Provisioning || application.workspaceStatus === PlatformWorkspaceStatus.Provisioning, this.canRetry(application)), detail: this.provisioningLabel(application.provisioningStatus) },
      { key: 'subscription', label: 'الاشتراك', icon: 'pi pi-credit-card', state: current(subscriptionDone, application.subscriptionStatus === PlatformSubscriptionStatus.PendingActivation || application.subscriptionStatus === PlatformSubscriptionStatus.PendingPayment, application.subscriptionStatus === PlatformSubscriptionStatus.Suspended || application.subscriptionStatus === PlatformSubscriptionStatus.Expired), detail: this.subscriptionLabel(application.subscriptionStatus) },
      { key: 'access', label: 'الوصول', icon: 'pi pi-sign-in', state: application.canAccessDashboard ? 'done' : this.canRetry(application) ? 'blocked' : 'pending', detail: application.canAccessDashboard ? 'يمكن الدخول' : 'محمي حتى الجاهزية' },
    ];
  }
  provisioningLabel(status: PlatformProvisioningStatus | null): string { return status == null ? 'لم يبدأ' : ({ 1: 'بانتظار البدء', 2: 'بانتظار السعة', 3: 'جاري التجهيز', 4: 'مكتمل', 5: 'فشل' } as Record<number, string>)[status] ?? 'غير معروف'; }

  startReview(application: PlatformWorkspaceApplication): void { this.run(application, () => this.service.startReview(application), 'بدأت مراجعة الطلب.'); }
  approve(application: PlatformWorkspaceApplication): void { void this.confirmThen(application, 'اعتماد مساحة العمل', 'سيبدأ تجهيز قاعدة البيانات بعد اعتماد الدفع. هل تريد المتابعة؟', () => this.service.approveWorkspace(application), 'تم اعتماد الطلب وبدء المرحلة التالية.'); }
  retry(application: PlatformWorkspaceApplication): void { void this.confirmThen(application, 'إعادة محاولة التجهيز', 'ستستأنف العملية نفس الطلب ولن يتم إنشاء مساحة مكررة. هل تريد المتابعة؟', () => this.service.retryProvisioning(application), 'تم إرسال إعادة المحاولة.'); }
  private async confirmThen(application: PlatformWorkspaceApplication, header: string, message: string, request: () => Observable<PlatformWorkspaceApplication>, success: string): Promise<void> { if (await this.notify.confirm({ header, message, acceptLabel: 'تأكيد' })) this.run(application, request, success); }
  private run(application: PlatformWorkspaceApplication, request: () => Observable<PlatformWorkspaceApplication>, success: string): void { this.busyId.set(application.id); request().subscribe({ next: updated => { this.replace(updated); this.busyId.set(null); this.notify.success(success); this.load(); }, error: err => { this.busyId.set(null); this.notify.error(this.actionErrorMessage(err)); this.load(); } }); }
  private replace(updated: PlatformWorkspaceApplication): void { this.rows.update(rows => rows.map(row => row.id === updated.id ? updated : row)); if (this.selected()?.id === updated.id) this.selected.set(updated); }

  openInformation(application: PlatformWorkspaceApplication): void { this.informationTarget.set(application); this.informationMessage = ''; this.informationFields = []; this.showInformation = true; }
  informationFieldOptions(application: PlatformWorkspaceApplication): Array<{ value: string; label: string }> { return this.isFreelance(application) ? [{ value: 'BrandName', label: 'اسم النشاط' }, { value: 'Bio', label: 'النبذة التعريفية' }, { value: 'Specialties', label: 'التخصصات' }, { value: 'DeliveryMode', label: 'طريقة تقديم التدريب' }] : [{ value: 'WorkspaceName', label: 'اسم المساحة' }, { value: 'Address', label: 'العنوان' }, { value: 'OwnerDetails', label: 'بيانات المالك' }, { value: 'Plan', label: 'الباقة' }]; }
  toggleInformationField(value: string, selected: boolean): void { this.informationFields = selected ? [...new Set([...this.informationFields, value])] : this.informationFields.filter(field => field !== value); }
  fieldHint(application: PlatformWorkspaceApplication): string { return this.isFreelance(application) ? 'BrandName, Bio, Specialties' : 'WorkspaceName, Address'; }
  sendInformationRequest(): void { const application = this.informationTarget(); const fields = [...this.informationFields]; if (!application || !this.informationMessage.trim() || !fields.length) { this.notify.error('أدخل رسالة الاستكمال وحقلًا واحدًا على الأقل.'); return; } this.run(application, () => this.service.requestInformation(application, this.informationMessage.trim(), fields), 'أُرسل طلب الاستكمال.'); this.showInformation = false; }
  actionErrorMessage(error: unknown): string { const e = error as { status?: number; error?: { code?: string; message?: string } }; const raw = e?.error?.message ?? ''; if (e?.status === 409 && (e.error?.code === 'FREELANCE_ROLES_NOT_SEEDED' || raw.includes('Freelance roles'))) return 'تعذر اعتماد المدرب الحر لأن أدوار النظام غير مهيأة. شغّل SeedFreelanceSystemRoles ثم أعد المحاولة.'; if (e?.status === 409) return 'تم تحديث القائمة من مستخدم آخر. أعد قراءة الطلب قبل تنفيذ الإجراء.'; return errMsg(error); }
  openReject(application: PlatformWorkspaceApplication): void { this.rejectTarget.set(application); this.rejectReason = ''; this.showReject = true; }
  confirmReject(): void { const application = this.rejectTarget(); if (!application || !this.rejectReason.trim()) { this.notify.error('أدخل سبب الرفض قبل تأكيد القرار.'); return; } this.run(application, () => this.service.reject(application, this.rejectReason.trim()), 'تم رفض الطلب.'); this.showReject = false; }

  openCreate(): void { this.createForm = this.emptyCreateForm(); this.createStep = 1; this.showCreate = true; }
  selectCreateType(type: 1 | 2): void { this.createForm.workspaceType = type; }
  private emptyCreateForm(): CreateWorkspaceForm { return { workspaceType: 1, workspaceName: '', workspaceIdentifier: '', ownerFullName: '', ownerEmail: '', ownerPhoneNumber: '', planId: null, billingCycle: BillingCycle.Monthly, brandName: '', description: '', address: '', specialization: '', deliveryMode: '' }; }
  createValid(): boolean { const f = this.createForm; return !!f.workspaceName.trim() && !!f.workspaceIdentifier.trim() && !!f.ownerFullName.trim() && !!f.ownerEmail.trim() && !!f.planId; }
  submitCreate(): void { if (!this.createValid() || !this.createForm.planId) { this.notify.error('أكمل اسم المساحة والمالك والبريد والباقة.'); return; } const payload: CreatePlatformWorkspaceApplicationCommand = { workspaceType: this.createForm.workspaceType, workspaceName: this.createForm.workspaceName.trim(), workspaceIdentifier: this.createForm.workspaceIdentifier.trim().toLowerCase(), ownerFullName: this.createForm.ownerFullName.trim(), ownerEmail: this.createForm.ownerEmail.trim(), ownerPhoneNumber: this.createForm.ownerPhoneNumber.trim(), planId: this.createForm.planId, billingCycle: this.createForm.billingCycle, brandName: this.createForm.brandName.trim() || undefined, description: this.createForm.description.trim() || undefined, address: this.createForm.workspaceType === 1 ? this.createForm.address.trim() || undefined : undefined, specialization: this.createForm.workspaceType === 2 ? this.createForm.specialization.trim() || undefined : undefined, deliveryMode: this.createForm.workspaceType === 2 ? this.createForm.deliveryMode.trim() || undefined : undefined }; this.createBusy.set(true); this.service.create(payload).subscribe({ next: result => { this.createBusy.set(false); this.showCreate = false; this.rows.update(rows => [result.application, ...rows]); this.totalCount += 1; if (result.oneTimeCredentials) { this.credentials.set(result.oneTimeCredentials); this.showCredentials = true; } this.notify.success('تم إنشاء الطلب وإضافته إلى قائمة المراجعة.'); }, error: err => { this.createBusy.set(false); this.notify.error(errMsg(err)); } }); }
  copyCredentials(): void { const value = this.credentials()?.temporaryPassword; if (!value) return; if (navigator.clipboard) { void navigator.clipboard.writeText(value).then(() => this.notify.success('تم نسخ كلمة المرور.')); } else this.notify.info('انسخ كلمة المرور يدوياً من النافذة.'); }
}
