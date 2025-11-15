import { useCallback, useState } from "react";
import { syncPegawai } from "../services/api";

export const useSyncPegawai = (refetch?: () => Promise<void>) => {
  const [loading, setLoading] = useState(false);

  const handleSync = useCallback(async () => {
    try {
      setLoading(true);
      await syncPegawai();

      if (refetch) {
        await refetch();
      }
    } catch {
      console.error("Gagal menarik data pegawai.");
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  return {
    loading,
    handleSync,
  };
};
