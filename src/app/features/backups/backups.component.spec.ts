import { signal } from '@angular/core';
import { BackupsComponent } from './backups.component';

describe('BackupsComponent action guards', () => {
  function createComponent() {
    const component = Object.create(BackupsComponent.prototype) as any;
    component.refreshing = signal(false);
    component.downloadingFile = signal<string | null>(null);
    component.loadStatus = jasmine.createSpy('loadStatus');
    component.service = jasmine.createSpyObj('BackupsService', ['download']);
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
