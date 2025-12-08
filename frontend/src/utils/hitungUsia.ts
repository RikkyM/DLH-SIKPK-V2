export const getUsia = (tanggalLahir?: string | null) => {
  if (!tanggalLahir) return "-";

  const today = new Date();
  const tanggal_lahir = new Date(tanggalLahir);

  if (isNaN(tanggal_lahir.getTime())) return "-";

  let usia = today.getFullYear() - tanggal_lahir.getFullYear();
  const monthDiff = today.getMonth() - tanggal_lahir.getMonth();
  const dayDiff = today.getDate() - tanggal_lahir.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    usia--;
  }

  return usia;
};
