import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { DatabaseResourcesComponent } from './database-resources.component';

describe('DatabaseResourcesComponent action guards', () => {
  it('starts only one migration after repeated confirmation clicks', async () => {
    const service = jasmine.createSpyObj('DatabaseResourcesService', ['runMigrations']);
    const notify = jasmine.createSpyObj('NotifyService', ['confirm', 'success', 'error']);
    notify.confirm.and.resolveTo(true);
    const pending = new Subject<{ message: string }>();
    service.runMigrations.and.returnValue(pending.asObservable());

    const component = Object.create(DatabaseResourcesComponent.prototype) as any;
    component.service = service;
    component.notify = notify;
    component.busyId = signal<string | null>(null);
    component.busyAction = signal<string | null>(null);
    component.canRunMigrations = jasmine.createSpy('canRunMigrations').and.returnValue(true);
    component.shortId = (id: string) => id;
    component.load = jasmine.createSpy('load');
    const row = { id: 'resource-1', resourceCode: 'db-1' } as any;

    component.runMigrations(row);
    component.runMigrations(row);
    await Promise.resolve();
    await Promise.resolve();

    expect(service.runMigrations).toHaveBeenCalledOnceWith(row.id);
    expect(component.busyId()).toBe(row.id);
    expect(component.busyAction()).toBe('migrations');

    pending.next({ message: 'completed' });
    pending.complete();
    expect(component.busyId()).toBeNull();
    expect(component.busyAction()).toBeNull();
  });
});
