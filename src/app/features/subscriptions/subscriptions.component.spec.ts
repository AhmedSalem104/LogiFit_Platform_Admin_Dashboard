import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SubscriptionsComponent } from './subscriptions.component';
import { SubscriptionsService } from './subscriptions.service';
import { NotifyService } from '../../shared/ui/notify.service';
import { TenantSubscriptionStatus } from '../../core/models/platform.models';

describe('SubscriptionsComponent actions', () => {
  let fixture: ComponentFixture<SubscriptionsComponent>;
  let component: SubscriptionsComponent;
  let service: jasmine.SpyObj<SubscriptionsService>;
  let notify: jasmine.SpyObj<NotifyService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<SubscriptionsService>('SubscriptionsService', ['list', 'usage', 'extend', 'transition']);
    service.list.and.returnValue(of({ items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0, hasPreviousPage: false, hasNextPage: false }));
    service.usage.and.returnValue(of([]));
    service.extend.and.returnValue(of('ok'));
    service.transition.and.returnValue(of(TenantSubscriptionStatus.Suspended));
    notify = jasmine.createSpyObj<NotifyService>('NotifyService', ['success', 'error', 'info', 'confirm', 'numberPrompt']);
    notify.confirm.and.resolveTo(false);
    await TestBed.configureTestingModule({
      imports: [SubscriptionsComponent],
      providers: [
        { provide: SubscriptionsService, useValue: service },
        { provide: NotifyService, useValue: notify },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SubscriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('offers the complete subscription lifecycle including GracePeriod', () => {
    const gracePeriod = component.statusOptions.find(option => option.value === TenantSubscriptionStatus.GracePeriod);
    expect(gracePeriod).toEqual({ label: 'فترة سماح', value: TenantSubscriptionStatus.GracePeriod });
  });

  it('requires confirmation before suspending and calls the API only after confirmation', async () => {
    const subscription = { id: 'subscription-1', tenantName: 'Test Gym' } as any;
    await component.transition(subscription, TenantSubscriptionStatus.Suspended);
    expect(service.transition).not.toHaveBeenCalled();

    notify.confirm.and.resolveTo(true);
    await component.transition(subscription, TenantSubscriptionStatus.Suspended);
    expect(service.transition).toHaveBeenCalledOnceWith('subscription-1', TenantSubscriptionStatus.Suspended);
    expect(component.busyId()).toBeNull();
  });
});
