import Swal from "sweetalert2";

const baseConfig = {
  confirmButtonColor: "#ff5722",
  cancelButtonColor: "#6b6b6b",
  background: "#ffffff",
  color: "#1a1a1a",
};

export function showSuccess(title: string, text?: string) {
  return Swal.fire({
    ...baseConfig,
    icon: "success",
    title,
    text,
    timer: 2200,
    showConfirmButton: false,
  });
}

export function showError(title: string, text?: string) {
  return Swal.fire({
    ...baseConfig,
    icon: "error",
    title,
    text,
    confirmButtonText: "ঠিক আছে",
  });
}

export function showOrderSuccess(params: { name: string; packLabel: string; total: number }) {
  return Swal.fire({
    ...baseConfig,
    icon: "success",
    title: "অর্ডার সফল হয়েছে! 🎉",
    html: `
      <p style="margin:0 0 8px"><strong>${params.name}</strong>, আপনার অর্ডারটি গ্রহণ করা হয়েছে।</p>
      <p style="margin:0 0 4px">প্যাক: <strong>${params.packLabel}</strong></p>
      <p style="margin:0 0 12px">মোট: <strong>৳${params.total}</strong> (ক্যাশ অন ডেলিভারি)</p>
      <p style="margin:0;color:#6b6b6b;font-size:14px">আমাদের টিম শীঘ্রই কল করে অর্ডার নিশ্চিত করবে।</p>
    `,
    confirmButtonText: "ঠিক আছে",
  });
}

export async function confirmDelete(itemName: string) {
  const result = await Swal.fire({
    ...baseConfig,
    icon: "warning",
    title: "আপনি কি নিশ্চিত?",
    text: `"${itemName}" ডিলিট হয়ে যাবে, এটা আর ফেরানো যাবে না।`,
    showCancelButton: true,
    confirmButtonText: "হ্যাঁ, ডিলিট করুন",
    cancelButtonText: "না, থাকুক",
  });
  return result.isConfirmed;
}

export async function confirmAction(title: string, text: string, confirmText = "হ্যাঁ") {
  const result = await Swal.fire({
    ...baseConfig,
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "বাতিল",
  });
  return result.isConfirmed;
}