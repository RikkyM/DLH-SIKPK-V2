import { http } from "./http";

export const getKehadiran = async (
  page = 1,
  perPage = 50,
  search = "",
  department = "",
  jabatan = "",
  shift = "",
  fromDate = "",
  toDate = "",
) => {
  const res = await http.get("/api/v1/kehadiran", {
    params: {
      per_page: perPage,
      page,
      search: search || undefined,
      department,
      jabatan,
      shift,
      from_date: fromDate,
      to_date: toDate,
    },
  });
  return res.data;
};

export const getRekapKehadiranData = async (
  page = 1,
  perPage = 50,
  search = "",
  department = "",
  jabatan = "",
  shift = "",
  tanggal = "",
) => {
  const res = await http.get("/api/v1/rekap-kehadiran", {
    params: {
      per_page: perPage,
      page,
      search: search || undefined,
      department,
      jabatan,
      shift,
      tanggal,
    },
  });
  return res.data;
};

export const syncKehadiran = async () => {
  await http.post("/api/v1/sync-kehadiran");
};

export const exportKehadiranData = async (
  name: string = "",
  search = "",
  fromDate = "",
  toDate = "",
) => {
  const res = await http.get(
    `/api/v1/export-kehadiran/${encodeURIComponent(name)}`,
    {
      responseType: "blob",
      params: {
        search,
        from_date: fromDate,
        to_date: toDate,
      },
    },
  );
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;

  const contentDisposition = res.headers["content-disposition"];
  let fileName = `${name}-${new Date().toLocaleDateString("id-ID")}.xlsx`;

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?(.+)"?/);
    if (match && match[1]) {
      fileName = match[1];
    }
  }

  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const exportKehadiranPerTanggalData = async (
  search?: string,
  department?: string,
  jabatan?: string,
  shift?: string,
  korlap?: string,
  tanggal?: string,
) => {
  const res = await http.get(`/api/v1/export-kehadiran-per-tanggal`, {
    responseType: "blob",
    params: {
      search,
      department,
      jabatan,
      shift,
      korlap,
      tanggal,
    },
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;

  const contentDisposition = res.headers["content-disposition"];
  let fileName = `Kehadiran-PerTanggal-${new Date().toLocaleDateString("id-ID")}.xlsx`;

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?(.+)"?/);
    if (match && match[1]) {
      fileName = match[1];
    }
  }

  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
