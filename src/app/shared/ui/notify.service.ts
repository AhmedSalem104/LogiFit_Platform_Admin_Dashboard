import { Injectable, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';

/**
 * App-wide feedback via PrimeNG (Toast + ConfirmDialog) — no third-party dialog lib.
 * The <p-toast> and <p-confirmDialog> hosts live once in AppComponent.
 */
@Injectable({ providedIn: 'root' })
export class NotifyService {
  private messages = inject(MessageService);
  private confirmation = inject(ConfirmationService);

  success(detail: string, summary = 'تم'): void {
    this.messages.add({ severity: 'success', summary, detail, life: 2600 });
  }

  error(detail: string, summary = 'خطأ'): void {
    this.messages.add({ severity: 'error', summary, detail, life: 4500 });
  }

  info(detail: string, summary = 'معلومة'): void {
    this.messages.add({ severity: 'info', summary, detail, life: 3000 });
  }

  /** Promise-based confirm dialog. Resolves true on accept, false on reject/cancel. */
  confirm(opts: {
    header: string;
    message: string;
    acceptLabel?: string;
    rejectLabel?: string;
    danger?: boolean;
    icon?: string;
  }): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmation.confirm({
        header: opts.header,
        message: opts.message,
        icon: opts.icon ?? (opts.danger ? 'pi pi-exclamation-triangle' : 'pi pi-question-circle'),
        acceptLabel: opts.acceptLabel ?? 'تأكيد',
        rejectLabel: opts.rejectLabel ?? 'إلغاء',
        acceptButtonStyleClass: opts.danger ? 'p-button-danger' : 'p-button-primary',
        rejectButtonStyleClass: 'p-button-text p-button-secondary',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }
}

/** Extract a human message from an interceptor-normalized error. Pure — no deps. */
export function errMsg(err: unknown): string {
  const e = err as { translatedMessage?: string; error?: { message?: string }; message?: string };
  return e?.translatedMessage || e?.error?.message || e?.message || 'حدث خطأ غير متوقع';
}
