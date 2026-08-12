import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReportsComponent } from './reports.component';
import { NotifyService } from '../../shared/ui/notify.service';

describe('ReportsComponent states', () => {
  let fixture: ComponentFixture<ReportsComponent>;
  let component: ReportsComponent;
  let http: HttpTestingController;
  let notify: jasmine.SpyObj<NotifyService>;

  beforeEach(async () => {
    notify = jasmine.createSpyObj<NotifyService>('NotifyService', ['success', 'error', 'info']);
    await TestBed.configureTestingModule({
      imports: [ReportsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: NotifyService, useValue: notify }],
    }).compileComponents();
    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('keeps a successful overview visible and exposes a separate catalog error', () => {
    http.expectOne(request => request.url.endsWith('/reports/overview')).flush({
      invoiceCount: 2,
      invoicedAmount: 100,
      collectedAmount: 80,
      pendingPaymentRequests: 1,
      activeSubscriptions: 1,
      expiredSubscriptions: 0,
    });
    http.expectOne(request => request.url.endsWith('/reports/catalog')).flush(
      { message: 'Catalog unavailable' },
      { status: 503, statusText: 'Service Unavailable' },
    );
    fixture.detectChanges();

    expect(component.data()?.invoiceCount).toBe(2);
    expect(component.catalog()).toBeNull();
    expect(component.catalogError()).toContain('Catalog unavailable');
    expect(fixture.nativeElement.textContent).toContain('تعذر تحميل كتالوج بيانات النظام');
    expect(fixture.nativeElement.textContent).not.toContain('لا تتوفر بيانات التقرير');
  });
});
