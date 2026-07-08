import Swal from 'sweetalert2';

/** Thin SweetAlert2 wrappers with RTL Arabic defaults, used across screens. */

export function toastSuccess(message: string): void {
  Swal.fire({
    toast: true,
    position: 'top-start',
    icon: 'success',
    title: message,
    showConfirmButton: false,
    timer: 2600,
    timerProgressBar: true,
  });
}

export function toastError(message: string): void {
  Swal.fire({
    toast: true,
    position: 'top-start',
    icon: 'error',
    title: message,
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
  });
}

/** Returns true when the user confirms. */
export async function confirmAction(
  title: string,
  text: string,
  confirmText = 'تأكيد',
  danger = false,
): Promise<boolean> {
  const result = await Swal.fire({
    title,
    text,
    icon: danger ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'إلغاء',
    confirmButtonColor: danger ? '#dc2626' : '#2563eb',
    cancelButtonColor: '#64748b',
    reverseButtons: true,
  });
  return result.isConfirmed;
}

/** Extract a human message from an interceptor-normalized error. */
export function errMsg(err: unknown): string {
  const e = err as { translatedMessage?: string; error?: { message?: string }; message?: string };
  return e?.translatedMessage || e?.error?.message || e?.message || 'حدث خطأ غير متوقع';
}
