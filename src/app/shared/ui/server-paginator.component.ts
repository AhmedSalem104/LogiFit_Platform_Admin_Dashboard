import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';

export interface PageChange {
  page: number;
  pageSize: number;
}

/**
 * Shared, server-driven paginator.  It deliberately owns no rows: list pages keep
 * their API query as the single source of truth instead of paginating a partial list locally.
 */
@Component({
  selector: 'app-server-paginator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PaginatorModule],
  template: `
    <div class="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-3 py-3 sm:flex-row sm:items-center sm:justify-between" dir="rtl">
      <p class="m-0 text-xs font-medium text-slate-500">
        @if (totalCount > 0) {
          عرض {{ firstRecord }}–{{ lastRecord }} من {{ totalCount | number }} سجل
        } @else {
          لا توجد سجلات للعرض
        }
      </p>
      <p-paginator
        [first]="first"
        [rows]="pageSize"
        [totalRecords]="totalCount"
        [rowsPerPageOptions]="rowsPerPageOptions"
        [showCurrentPageReport]="false"
        (onPageChange)="change($event.first ?? 0, $event.rows ?? pageSize)"
      ></p-paginator>
    </div>
  `,
})
export class ServerPaginatorComponent {
  @Input() page = 1;
  @Input() pageSize = 20;
  @Input() totalCount = 0;
  @Input() rowsPerPageOptions = [10, 20, 50, 100];
  @Output() pageChange = new EventEmitter<PageChange>();

  get first(): number { return Math.max(0, (this.page - 1) * this.pageSize); }
  get firstRecord(): number { return this.totalCount === 0 ? 0 : this.first + 1; }
  get lastRecord(): number { return Math.min(this.first + this.pageSize, this.totalCount); }

  change(first: number, pageSize: number): void {
    this.pageChange.emit({ page: Math.floor(first / pageSize) + 1, pageSize });
  }
}
