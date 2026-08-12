import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { PlansComponent } from './plans.component';

describe('PlansComponent delete action', () => {
  it('blocks a duplicate delete while the first request is pending', async () => {
    const service = jasmine.createSpyObj('PlansService', ['remove']);
    const notify = jasmine.createSpyObj('NotifyService', ['confirm', 'success', 'error']);
    notify.confirm.and.resolveTo(true);
    const pending = new Subject<void>();
    service.remove.and.returnValue(pending.asObservable());

    const component = Object.create(PlansComponent.prototype) as any;
    component.service = service;
    component.notify = notify;
    component.busyId = signal<string | null>(null);
    component.load = jasmine.createSpy('load');
    const plan = { id: 'plan-1', name: 'Basic' } as any;

    await component.remove(plan);
    await component.remove(plan);

    expect(service.remove).toHaveBeenCalledOnceWith(plan.id);
    expect(component.busyId()).toBe(plan.id);
    pending.next();
    pending.complete();
    expect(component.busyId()).toBeNull();
  });
});
