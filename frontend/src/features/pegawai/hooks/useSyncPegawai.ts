// import { useCallback, useState } from "react";
import { syncPegawai } from "../services/api";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

export const useSyncPegawai = () => {
  // const [loading, setLoading] = useState(false);

  // const handleSync = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     await syncPegawai();

  //     if (refetch) {
  //       await refetch();
  //     }
  //   } catch {
  //     console.error("Gagal menarik data pegawai.");
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [refetch]);

  // return {
  //   loading,
  //   handleSync,
  // };

  const { mutate: handleSync, isPending: loading } = useMutation<unknown, unknown, unknown>({
    mutationFn: syncPegawai,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["petugas"] });
    },
  });

  return {
    loading,
    handleSync,
  };
};
