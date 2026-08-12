import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { PaymentMethodsComponent } from './payment-methods.component';

describe('PaymentMethodsComponent delete action', () => {
  it('blocks a duplicate delete while the first request is pending', async () => {
    const service = jasmine.createSpyObj('PaymentMethodsService', ['remove']);
    const notify = jasmine.createSpyObj('NotifyService', ['confirm', 'success', 'error']);
    notify.confirm.and.resolveTo(true);
    const pending = new Subject<void>();
    service.remove.and.returnValue(pending.asObservable());

    const component = Object.create(PaymentMethodsComponent.prototype) as any;
    component.service = service;
    component.notify = notify;
    component.busyId = signal<string | null>(null);
    component.load = jasmine.createSpy('load');
    const method = { id: 'method-1', name: 'Bank transfer' } as any;

    await component.remove(method);
    await component.remove(method);

    expect(service.remove).toHaveBeenCalledOnceWith(method.id);
    expect(component.busyId()).toBe(method.id);
    pending.next();
    pending.complete();
    expect(component.busyId()).toBeNull();
  });
});
