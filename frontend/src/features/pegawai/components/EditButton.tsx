// import { Pencil } from "lucide-react";
import { useDialog } from "@/hooks/useDialog";
import type { Pegawai } from "../types/pegawai.types";

type Props = {
  row: Pegawai;
};

const EditButton = ({ row }: Props) => {
  const { openDialog } = useDialog<Pegawai>();

  return (
    <button
      onClick={() => openDialog({ mode: "edit", data: row })}
      className="cursor-pointer outline-none rounded p-1 whitespace-nowrap text-green-500"
    >
      {/* <Pencil className="max-w-5" /> */}
      Edit Data
    </button>
  );
};

export default EditButton;
