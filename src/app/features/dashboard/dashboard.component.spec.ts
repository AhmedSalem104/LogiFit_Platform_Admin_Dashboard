import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from './dashboard.service';
import { NotifyService } from '../../shared/ui/notify.service';

describe('DashboardComponent states', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;
  let dashboard: jasmine.SpyObj<DashboardService>;
  let notify: jasmine.SpyObj<NotifyService>;

  beforeEach(async () => {
    dashboard = jasmine.createSpyObj<DashboardService>('DashboardService', ['get', 'getTenants']);
    dashboard.get.and.returnValue(of({
      totalGyms: 0, activeGyms: 0, trialGyms: 0, pendingApprovalGyms: 0, suspendedGyms: 0,
      totalMembers: 0, expiredSubscriptions: 0, activeSubscriptions: 0, pendingPayments: 0,
      invoiceCount: 0, invoicedAmount: 0, collectedAmount: 0, featureCount: 0, quotaDefinitionCount: 0,
      failedJobs: 0, failedOutbox: 0,
    }));
    dashboard.getTenants.and.returnValue(throwError(() => ({ error: { message: 'Tenant list unavailable' } })));
    notify = jasmine.createSpyObj<NotifyService>('NotifyService', ['success', 'error', 'info']);
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: DashboardService, useValue: dashboard },
        { provide: NotifyService, useValue: notify },
        provideRouter([]),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not turn a tenant-list failure into an empty result', () => {
    expect(component.tenants()).toEqual([]);
    expect(component.tenantsError()).toContain('Tenant list unavailable');
    expect(fixture.nativeElement.textContent).toContain('تعذر تحميل قائمة الجيمات');
    expect(fixture.nativeElement.textContent).toContain('إعادة المحاولة');
  });
});
