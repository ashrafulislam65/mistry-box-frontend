import Swal from "sweetalert2";

const baseConfig = {
  confirmButtonColor: "#d9552b",
  cancelButtonColor: "#6b5f52",
  background: "#fbf6ef",
  color: "#2b231c",
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