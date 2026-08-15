import { signal } from '@angular/core';
import { of } from 'rxjs';
import { BackupsComponent } from './backups.component';

describe('BackupsComponent action guards', () => {
  function createComponent() {
    const component = Object.create(BackupsComponent.prototype) as any;
    component.refreshing = signal(false);
    component.downloadingFile = signal<string | null>(null);
    component.tenantLoading = signal(false);
    component.tenantLoadError = signal<string | null>(null);
    component.tenants = signal([]);
    component.databaseResources = signal([]);
    component.loadStatus = jasmine.createSpy('loadStatus');
    component.service = jasmine.createSpyObj('BackupsService', ['download']);
    component.tenantsService = jasmine.createSpyObj('TenantsService', ['list']);
    component.tenantsService.list.and.returnValue(of({ items: [] }));
    component.databaseResourcesService = jasmine.createSpyObj('DatabaseResourcesService', ['list']);
    component.databaseResourcesService.list.and.returnValue(of({ items: [] }));
    return component;
  }

  it('does not start a second refresh while the first refresh is pending', () => {
    const component = createComponent();

    component.refresh();
    component.refresh();

    expect(component.loadStatus).toHaveBeenCalledOnceWith();
    expect(component.refreshing()).toBeTrue();
  });

  it('does not start a second download while another file is pending', () => {
    const component = createComponent();
    component.downloadingFile.set('first.bacpac');

    component.downloadFile('second.bacpac', 'second.bacpac');

    expect(component.service.download).not.toHaveBeenCalled();
  });
});
