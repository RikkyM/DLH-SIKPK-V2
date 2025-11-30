import type { Pagination } from "@/types/pagination.types";
import { useCallback, useEffect, useState } from "react";
import type { ShiftKerja } from "../types/types";
import {
  getKategoriKerjaData,
  getShiftKerjaData,
} from "@/services/api/shiftKerjaService";

export const useShiftKerja = (perPage = 10, page = 1, search = "") => {
  const [shift, setShift] = useState<Pagination<ShiftKerja> | null>(null);
  const [kategoriKerja, setKategoriKerja] = useState<ShiftKerja[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getShiftKerja = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getShiftKerjaData(page, perPage, search);
      setShift(res);
    } catch {
      setError("Gagal mengambil data shift kerja.");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search]);

  const getKategoriKerja = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getKategoriKerjaData();
      setKategoriKerja(res);
    } catch {
      setError("Gagal mengambil data kategori kerja.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void getShiftKerja();
  }, [getShiftKerja]);

  useEffect(() => {
    void getKategoriKerja();
  }, [getKategoriKerja]);

  return {
    shift,
    kategoriKerja,
    loading,
    error,
  };
};
