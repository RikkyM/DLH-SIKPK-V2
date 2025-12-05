import {
  exportKehadiranData,
  getKehadiran,
} from "@/services/api/kehadiranService";
import type { Pagination } from "@/types/pagination.types";
import { useCallback, useState } from "react";

export type KehadiranParams = {
  page: number;
  perPage: number;
  search: string;
  department: string;
  jabatan: string;
  shift: string;
  fromDate: string;
  toDate: string;
};

export type KehadiranData = {
  id: number;
  nik: string;
  nama: string;
  department: string;
  jabatan: string;
  shift: {
    jadwal: string;
    jam_masuk: string;
    jam_keluar: string;
  };
  tanggal: string;
  jam_masuk: string;
  jam_pulang: string;
  jam_telat: string;
  pulang_cepat: string;
  upah: number;
};

// export const useKehadiran = (
//   perPage = 50,
//   page = 1,
//   search = "",
//   department = "",
//   jabatan = "",
//   shift = "",
//   fromDate = "",
//   toDate = "",
// ) => {
//   const [kehadiran, setKehadiran] = useState<Pagination<Kehadiran> | null>(
//     null,
//   );
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchKehadiran = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const data = await getKehadiran(
//         page,
//         perPage,
//         search,
//         department,
//         jabatan,
//         shift,
//         fromDate,
//         toDate,
//       );
//       setKehadiran(data);
//     } catch {
//       setError("Gagal mengambil data kehadiran");
//     } finally {
//       setLoading(false);
//     }
//   }, [page, perPage, search, department, jabatan, shift, fromDate, toDate]);

//   useEffect(() => {
//     void fetchKehadiran();
//   }, [fetchKehadiran]);

//   return {
//     kehadiran,
//     loading,
//     error,
//     refetch: fetchKehadiran,
//   };
// };

export const useKehadiranManual = () => {
  const [kehadiran, setKehadiran] = useState<Pagination<KehadiranData> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(
    async ({
      page,
      perPage,
      search,
      department,
      jabatan,
      shift,
      fromDate,
      toDate,
    }: KehadiranParams) => {
      try {
        setLoading(true);
        setError(null);

        const data = await getKehadiran(
          page,
          perPage,
          search,
          department,
          jabatan,
          shift,
          fromDate,
          toDate,
        );

        setKehadiran(data);
      } catch {
        setError("Gagal mengambil data kehadiran");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    kehadiran,
    loading,
    error,
    refetch,
  };
};

export const useExportKehadiran = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportKehadiranExcel = useCallback(
    async ({
      name = "",
      search = "",
      fromDate = "",
      toDate = "",
    }: {
      name: string;
      search: string;
      fromDate: string;
      toDate: string;
    }) => {
      try {
        setLoading(true);
        setError(null);
        await exportKehadiranData(name, search, fromDate, toDate);
      } catch {
        setError("Gagal untuk mengekspor data.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    fetch: exportKehadiranExcel,
    loading,
    error,
  };
};
