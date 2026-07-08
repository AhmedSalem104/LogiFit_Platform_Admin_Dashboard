import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeInfo } from '../../core/models/platform.models';

/** Renders a colored pill from a BadgeInfo ({ label, color }). */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <span class="lf-badge" [ngClass]="'lf-badge-' + (badge?.color || 'gray')">
      {{ badge?.label || '—' }}
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input() badge?: BadgeInfo;
}
