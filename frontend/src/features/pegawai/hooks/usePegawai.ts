import { useCallback, useEffect, useState } from "react";
import { exportPegawaiExcelApi, getPegawaiList } from "../services/api";
import type { Pagination } from "@/types/pagination.types";
import type { Pegawai } from "../types/pegawai.types";

type PegawaiState = {
  data: Pagination<Pegawai> | null;
  loading: boolean;
  error: string | null;
};

export const usePegawai = (
  perPage = 50,
  page = 1,
  search = "",
  department = "",
  jabatan = "",
  shift = "",
) => {
  const [state, setState] = useState<PegawaiState>({
    data: null,
    loading: false,
    error: null,
  });

  const getPegawai = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setState((prev) => ({ ...prev, loading: true, error: null }));
        }

        const res = await getPegawaiList(
          page,
          perPage,
          search,
          department,
          jabatan,
          shift,
        );

        setState({
          data: res,
          loading: false,
          error: null,
        });
      } catch {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Gagal mengambil data pegawai.",
        }));
      }
    },
    [page, perPage, search, department, jabatan, shift],
  );

  useEffect(() => {
    void getPegawai(true);
  }, [getPegawai]);

  const refetch = useCallback(() => getPegawai(false), [getPegawai]);

  const updatePegawaiState = useCallback((updated: Pegawai) => {
    setState((prev) => {
      if (!prev.data) return prev;

      return {
        ...prev,
        data: {
          ...prev.data,
          data: prev.data.data.map((p) =>
            p.id === updated.id ? { ...p, ...updated } : p,
          ),
        },
      };
    });
  }, []);

  return {
    pegawai: state.data,
    loading: state.loading,
    error: state.error,
    refetch,
    updatePegawaiState,
  };
};

type ExportPegawaiState = {
  loading: boolean;
  error: string | null;
};

export const useExportPegawai = () => {
  const [state, setState] = useState<ExportPegawaiState>({
    loading: false,
    error: null,
  });

  const exportPegawaiExcel = useCallback(
    async ({
      search = "",
      department = "",
      jabatan = "",
      shift = "",
      korlap = "",
    }: {
      search: string;
      department: string;
      jabatan: string;
      shift: string;
      korlap?: string;
    }) => {
      setState({
        loading: true,
        error: null,
      });
      try {
        await exportPegawaiExcelApi(search, department, jabatan, shift, korlap);
        setState((prev) => ({
          ...prev,
          loading: false,
        }));
      } catch {
        setState({
          loading: false,
          error: "Terjadi kesalahan ketika export pegawai.",
        });
      }
    },
    [],
  );

  return {
    loading: state.loading,
    error: state.error,
    exportPegawaiExcel,
  };
};
