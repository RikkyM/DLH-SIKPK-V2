import { http } from "./api/http";
import type { FormState } from "@/features/pns/types";

export const PnsService = {
  create: async (payload?: FormState) => {
    const { data } = await http.post<FormState>("/api/v1/pegawai-asn", payload);
    return data;
  },
};
