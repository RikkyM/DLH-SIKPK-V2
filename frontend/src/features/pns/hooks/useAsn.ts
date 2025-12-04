import type { Pagination } from "@/types/pagination.types";
import { useCallback, useEffect, useState } from "react";
import type { PegawaiAsn } from "../types";
import { getAsnData } from "../services/api.services";

export const useAsn = (
  perPage: number = 10,
  page: number = 1,
  search: string = "",
) => {
  const [asn, setAsn] = useState<Pagination<PegawaiAsn> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAsn = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAsnData(page, perPage, search);
      setAsn(res);
    } catch {
      setError("Gagal mengambil data pegawai asn.");
    } finally {
      setLoading(false);
    }
  }, [perPage, page, search]);

  useEffect(() => {
    void getAsn();
  }, [getAsn]);

  return {
    asn,
    loading,
    error,
  };
};
