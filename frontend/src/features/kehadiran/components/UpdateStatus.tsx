import PreviewImage from "@/components/PreviewImage";
import { useDialog } from "@/hooks/useDialog";
import { updateStatusKehadiran } from "@/services/api/kehadiranService";
import type { ApiError } from "@/types/error.types";
import type { Kehadiran } from "@/types/kehadiran.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

const UpdateStatus = () => {
  const { isOpen, data, mode, closeDialog } = useDialog<Kehadiran>();
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error } = useMutation<
    unknown,
    AxiosError,
    {
      id: number;
      status: "approve" | "reject";
    }
  >({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: "approve" | "reject";
    }) => updateStatusKehadiran(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["list-data-kehadiran"],
      });
    },
  });

  const handleStatus = (status: "approve" | "reject") => {
    if (!data?.id) return;

    mutate(
      { id: data.id, status },
      {
        onSuccess: () => closeDialog(),
      },
    );
  };

  if (mode !== "update") return null;

  return (
    <section
      onClick={(e) => e.stopPropagation()}
      className={`max-h-full w-full max-w-xl space-y-3 overflow-y-auto rounded-sm bg-white p-3 shadow transition-all duration-300 ${
        isOpen ? "scale-100" : "scale-95"
      }`}
    >
      <h2 className="font-semibold md:text-base lg:text-lg">
        Validasi Kehadiran
      </h2>
      <div className="text-sm">
        <div className="flex items-center">
          <span className="inline-block min-w-32">Nama</span>
          <span>: {data?.pegawai?.nama}</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block min-w-32">Department</span>
          <span>: {data?.pegawai?.department?.DeptName}</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block min-w-32">Penugasan</span>
          <span>: {data?.pegawai?.jabatan?.nama}</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block min-w-32">Tanggal</span>
          <span>
            :{" "}
            {data?.check_time
              ? new Date(data.check_time).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : "-"}
          </span>
        </div>
        <div className="flex items-center">
          <span className="inline-block min-w-32">Jam</span>
          <span>
            :{" "}
            {data?.check_time
              ? new Date(data.check_time)
                  .toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  .replace(".", ":")
              : "-"}
          </span>
        </div>
        <div className="flex items-center">
          <span className="inline-block min-w-32">Tipe</span>
          <span>: {data?.check_type === '0' ? "Masuk" : "Keluar"}</span>
        </div>
        <div className="flex items-start">
          <span className="block min-w-32 text-justify">Keterangan</span>
          <span>: {data?.keterangan ?? "-"} </span>
        </div>
        <div className="flex items-start">
          <span className="block min-w-32 text-justify">Status Kerja</span>
          <span className="capitalize">: {data?.status_kerja ?? "-"} </span>
        </div>
      </div>
      {data?.bukti_dukung && (
        <div>
          <PreviewImage
            title="Bukti Dukung"
            image={
              data?.bukti_dukung
                ? `${import.meta.env.VITE_API_BASE}/api/v1/kehadiran/${data.id}?v=${encodeURIComponent(data?.updated_at ?? "")}`
                : undefined
            }
          />
        </div>
      )}
      {isError && (
        <p className="text-sm text-red-500">
          {(error.response?.data as ApiError)?.message}
        </p>
      )}
      <div className="flex flex-col-reverse gap-2 text-sm font-medium md:flex-row">
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleStatus("reject")}
          className="w-full cursor-pointer rounded bg-red-500 p-2 text-white outline-none hover:bg-red-600 disabled:opacity-50"
        >
          {isPending ? "Loading..." : "Tolak"}
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => handleStatus("approve")}
          className="w-full cursor-pointer rounded bg-green-500 p-2 text-white outline-none hover:bg-green-600 disabled:opacity-50"
        >
          {isPending ? "Loading..." : "Terima"}
        </button>
      </div>
    </section>
  );
};

export default UpdateStatus;
