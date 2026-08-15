import { signal } from '@angular/core';
import { Subject, of } from 'rxjs';
import { TenantsComponent } from './tenants.component';

describe('TenantsComponent lifecycle actions', () => {
  const tenant = { id: 'tenant-1', name: 'Test Gym' } as any;

  function createFixture() {
    const service = jasmine.createSpyObj('TenantsService', ['create', 'approve', 'activate', 'suspend', 'archive', 'softDelete', 'restore', 'permanentDelete']);
    const notify = jasmine.createSpyObj('NotifyService', ['confirm', 'textPrompt', 'success', 'error']);
    notify.confirm.and.resolveTo(true);
    const component = Object.create(TenantsComponent.prototype) as any;
    component.service = service;
    component.notify = notify;
    component.busyId = signal<string | null>(null);
    component.busyAction = signal<string | null>(null);
    component.rows = signal([tenant]);
    component.load = jasmine.createSpy('load');
    return { component, service, notify };
  }

  it('blocks a duplicate lifecycle mutation while the first request is pending', async () => {
    const { component, service } = createFixture();
    const pending = new Subject<any>();
    service.approve.and.returnValue(pending.asObservable());

    await component.act(tenant, 'approve');
    await component.act(tenant, 'approve');

    expect(service.approve).toHaveBeenCalledOnceWith(tenant.id);
    expect(component.busyId()).toBe(tenant.id);
    expect(component.busyAction()).toBe('approve');

    pending.next(tenant);
    pending.complete();
    expect(component.busyId()).toBeNull();
    expect(component.busyAction()).toBeNull();
  });

  it('clears the lifecycle busy state when confirmation is cancelled', async () => {
    const { component, service, notify } = createFixture();
    notify.confirm.and.resolveTo(false);

    await component.act(tenant, 'suspend');

    expect(service.suspend).not.toHaveBeenCalled();
    expect(component.busyId()).toBeNull();
    expect(component.busyAction()).toBeNull();
  });

  it('routes new workspace creation to the unified application flow', () => {
    const { component } = createFixture();
    component.router = jasmine.createSpyObj('Router', ['navigate']);

    component.openCreate();

    expect(component.router.navigate).toHaveBeenCalledOnceWith(['/workspace-applications'], { queryParams: { create: '1' } });
    expect(component.service.create).not.toHaveBeenCalled();
  });
});
