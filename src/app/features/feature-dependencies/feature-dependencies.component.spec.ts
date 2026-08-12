import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { FeatureDependenciesComponent } from './feature-dependencies.component';

describe('FeatureDependenciesComponent delete action', () => {
  it('blocks a duplicate delete while the first request is pending', async () => {
    const service = jasmine.createSpyObj('FeaturesService', ['removeDependency']);
    const notify = jasmine.createSpyObj('NotifyService', ['confirm', 'success', 'error']);
    notify.confirm.and.resolveTo(true);
    const pending = new Subject<void>();
    service.removeDependency.and.returnValue(pending.asObservable());

    const component = Object.create(FeatureDependenciesComponent.prototype) as any;
    component.service = service;
    component.notify = notify;
    component.busyId = signal<string | null>(null);
    component.load = jasmine.createSpy('load');
    const row = { id: 'dependency-1', featureCode: 'A', dependsOnFeatureCode: 'B' };

    await component.remove(row);
    await component.remove(row);

    expect(service.removeDependency).toHaveBeenCalledOnceWith(row.id);
    expect(component.busyId()).toBe(row.id);
    pending.next();
    pending.complete();
    expect(component.busyId()).toBeNull();
  });
});
