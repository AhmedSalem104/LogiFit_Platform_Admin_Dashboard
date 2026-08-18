import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { DatabaseResourcesComponent } from './database-resources.component';

describe('DatabaseResourcesComponent action guards', () => {
  it('submits a trimmed registration once while the request is pending', () => {
    const service = jasmine.createSpyObj('DatabaseResourcesService', ['register']);
    const notify = jasmine.createSpyObj('NotifyService', ['error', 'success']);
    const pending = new Subject<unknown>();
    service.register.and.returnValue(pending.asObservable());

    const component = Object.create(DatabaseResourcesComponent.prototype) as any;
    component.service = service;
    component.notify = notify;
    component.saving = signal(false);
    component.registering = signal(false);
    component.repairMode = false;
    component.editingId = null;
    component.editor = {
      provider: ' ManualMonster ',
      databaseName: ' tenant-db-01 ',
      serverKey: ' ',
      connectionString: ' opaque-input ',
    };
    component.closeDialog = jasmine.createSpy('closeDialog');
    component.load = jasmine.createSpy('load');

    component.save();
    component.save();

    expect(service.register).toHaveBeenCalledOnceWith({
      provider: 'ManualMonster',
      databaseName: 'tenant-db-01',
      serverKey: undefined,
      connectionString: 'opaque-input',
    });
    expect(component.registering()).toBeTrue();

    pending.next({});
    pending.complete();
    expect(component.registering()).toBeFalse();
  });

  it('rejects whitespace-only required registration fields before the API call', () => {
    const service = jasmine.createSpyObj('DatabaseResourcesService', ['register']);
    const notify = jasmine.createSpyObj('NotifyService', ['error']);
    const component = Object.create(DatabaseResourcesComponent.prototype) as any;
    component.service = service;
    component.notify = notify;
    component.saving = signal(false);
    component.registering = signal(false);
    component.repairMode = false;
    component.editingId = null;
    component.editor = {
      provider: 'ManualMonster',
      databaseName: 'tenant-db-01',
      serverKey: '',
      connectionString: '   ',
    };

    component.save();

    expect(service.register).not.toHaveBeenCalled();
    expect(notify.error).toHaveBeenCalled();
  });

  it('tests a new connection once while the request is pending', () => {
    const service = jasmine.createSpyObj('DatabaseResourcesService', ['testConnection']);
    const notify = jasmine.createSpyObj('NotifyService', ['error', 'success']);
    const pending = new Subject<unknown>();
    service.testConnection.and.returnValue(pending.asObservable());

    const component = Object.create(DatabaseResourcesComponent.prototype) as any;
    component.service = service;
    component.notify = notify;
    component.testing = signal(false);
    component.repairMode = false;
    component.lastTest = signal(null);
    component.editor = {
      provider: 'ManualMonster',
      databaseName: ' tenant-db-01 ',
      serverKey: '',
      connectionString: ' opaque-input ',
    };

    component.testConnection();
    component.testConnection();

    expect(service.testConnection).toHaveBeenCalledOnceWith('tenant-db-01', 'opaque-input');
    expect(component.testing()).toBeTrue();

    pending.next({
      succeeded: true,
      databaseName: 'tenant-db-01',
      serverHost: 'db',
      serverPort: 1433,
      actualDatabaseName: 'tenant-db-01',
      errorCode: null,
      message: 'ok',
      durationMs: 12,
      testedAtUtc: '2026-08-18T00:00:00Z',
    });
    pending.complete();
    expect(component.testing()).toBeFalse();
  });

  it('starts only one delete after repeated clicks while confirmation is pending', async () => {
    const service = jasmine.createSpyObj('DatabaseResourcesService', ['delete']);
    const notify = jasmine.createSpyObj('NotifyService', ['confirm', 'success', 'error']);
    notify.confirm.and.resolveTo(true);
    const pending = new Subject<void>();
    service.delete.and.returnValue(pending.asObservable());

    const component = Object.create(DatabaseResourcesComponent.prototype) as any;
    component.service = service;
    component.notify = notify;
    component.busyId = signal<string | null>(null);
    component.busyAction = signal<string | null>(null);
    component.shortId = (id: string) => id;
    component.load = jasmine.createSpy('load');
    const row = { id: 'resource-1', databaseName: 'tenant-db-01', canDelete: true } as any;

    component.deleteResource(row);
    component.deleteResource(row);
    await Promise.resolve();
    await Promise.resolve();

    expect(notify.confirm).toHaveBeenCalledOnceWith(jasmine.objectContaining({ danger: true }));
    expect(service.delete).toHaveBeenCalledOnceWith(row.id);
    expect(component.busyId()).toBe(row.id);

    pending.next();
    pending.complete();
    expect(component.busyId()).toBeNull();
    expect(component.busyAction()).toBeNull();
  });

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
