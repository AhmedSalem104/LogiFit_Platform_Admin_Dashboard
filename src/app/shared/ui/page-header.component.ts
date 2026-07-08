import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Page title + subtitle with a right-aligned actions slot. */
@Component({
  selector: 'app-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="flex items-start justify-between gap-3 mb-5 flex-wrap">
      <div class="min-w-0">
        <h1 class="text-lg sm:text-xl font-extrabold text-slate-800 flex items-center gap-2.5">
          @if (icon) {
            <span class="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-base shrink-0">
              <i [class]="icon"></i>
            </span>
          }
          <span class="truncate">{{ title }}</span>
        </h1>
        @if (subtitle) { <p class="text-sm text-slate-500 mt-1.5 pr-0.5">{{ subtitle }}</p> }
      </div>
      <div class="flex items-center gap-2 flex-wrap justify-end">
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
