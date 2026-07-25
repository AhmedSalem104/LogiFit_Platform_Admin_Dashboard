import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

/**
 * The single feedback gateway for the platform dashboard.
 *
 * Browser alert/confirm/prompt must not be used in a platform page. SweetAlert2
 * keeps success, failure, confirmation, and bounded input visually consistent,
 * accessible, and appropriate for RTL users.
 */
@Injectable({ providedIn: 'root' })
export class NotifyService {
  success(detail: string, summary = 'تم الحفظ'): void {
    this.toast('success', summary, detail, 2800);
  }

  error(detail: string, summary = 'تعذر إتمام العملية'): void {
    this.toast('error', summary, detail, 5000);
  }

  info(detail: string, summary = 'معلومة'): void {
    this.toast('info', summary, detail, 3600);
  }

  /** Promise-based confirmation for destructive and administrative operations. */
  confirm(opts: {
    header: string;
    message: string;
    acceptLabel?: string;
    rejectLabel?: string;
    danger?: boolean;
    icon?: string;
  }): Promise<boolean> {
    return Swal.fire({
      title: opts.header,
      text: opts.message,
      icon: opts.danger ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonText: opts.acceptLabel ?? 'تأكيد',
      cancelButtonText: opts.rejectLabel ?? 'إلغاء',
      reverseButtons: true,
      focusCancel: !opts.danger,
      customClass: {
        popup: 'lf-swal-popup',
        title: 'lf-swal-title',
        htmlContainer: 'lf-swal-text',
        actions: 'lf-swal-actions',
        confirmButton: opts.danger ? 'lf-swal-confirm-danger' : 'lf-swal-confirm',
        cancelButton: 'lf-swal-cancel',
      },
      buttonsStyling: false,
    }).then(result => result.isConfirmed);
  }

  /** A safe numeric dialog for bounded administrative input. */
  numberPrompt(opts: {
    title: string;
    label: string;
    initialValue?: number;
    min: number;
    max: number;
    confirmLabel?: string;
  }): Promise<number | null> {
    return Swal.fire({
      title: opts.title,
      text: opts.label,
      icon: 'question',
      input: 'number',
      inputValue: String(opts.initialValue ?? opts.min),
      inputAttributes: { min: String(opts.min), max: String(opts.max), step: '1', inputmode: 'numeric' },
      inputValidator: (value) => {
        const parsed = Number(value);
        return Number.isInteger(parsed) && parsed >= opts.min && parsed <= opts.max
          ? undefined
          : `أدخل عدداً صحيحاً من ${opts.min} إلى ${opts.max}.`;
      },
      showCancelButton: true,
      confirmButtonText: opts.confirmLabel ?? 'متابعة',
      cancelButtonText: 'إلغاء',
      reverseButtons: true,
      customClass: {
        popup: 'lf-swal-popup',
        title: 'lf-swal-title',
        htmlContainer: 'lf-swal-text',
        input: 'lf-swal-input',
        actions: 'lf-swal-actions',
        confirmButton: 'lf-swal-confirm',
        cancelButton: 'lf-swal-cancel',
      },
      buttonsStyling: false,
    }).then(result => result.isConfirmed ? Number(result.value) : null);
  }

  private toast(icon: SweetAlertIcon, title: string, text: string, timer: number): void {
    void Swal.fire({
      toast: true,
      position: 'top-start',
      icon,
      title,
      text,
      timer,
      timerProgressBar: true,
      showConfirmButton: false,
      showCloseButton: true,
      customClass: {
        popup: 'lf-swal-toast',
        title: 'lf-swal-toast-title',
        htmlContainer: 'lf-swal-toast-text',
      },
    });
  }
}

/** Extract a human message from an interceptor-normalized error. Pure — no deps. */
export function errMsg(err: unknown): string {
  const e = err as { translatedMessage?: string; error?: { message?: string }; message?: string };
  return e?.translatedMessage || e?.error?.message || e?.message || 'حدث خطأ غير متوقع.';
}
