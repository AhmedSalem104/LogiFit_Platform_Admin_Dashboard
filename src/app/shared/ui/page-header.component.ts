import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Page title + subtitle with a right-aligned actions slot. */
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between gap-4 mb-5 flex-wrap">
      <div>
        <h1 class="text-xl font-bold text-slate-800 flex items-center gap-2">
          @if (icon) { <i [class]="icon" class="text-primary-600"></i> }
          {{ title }}
        </h1>
        @if (subtitle) { <p class="text-sm text-slate-500 mt-1">{{ subtitle }}</p> }
      </div>
      <div class="flex items-center gap-2">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
}
