import { syncKehadiran } from "@/services/kehadiranApi";
import { useCallback, useState } from "react";

export const useSyncKehadiran = (refetch?: () => Promise<void>) => {
  const [loading, setLoading] = useState(false);

  const handleSync = useCallback(async () => {
    try {
      setLoading(true);

      await syncKehadiran();

      if (refetch) {
        await refetch();
      }
    } catch {
      console.error("Gagal menarik data kehadiran.");
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  return { loading, handleSync };
};
