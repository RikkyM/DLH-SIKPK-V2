import { Pencil } from "lucide-react";
import { useDialog } from "@/hooks/useDialog";
import type { Pegawai } from "../types/pegawai.types";

type Props = {
  row: Pegawai;
};

const EditButton = ({ row }: Props) => {
  const { openDialog } = useDialog<Pegawai>();

  return (
    <button
      onClick={() => openDialog(row)}
      className="cursor-pointer rounded p-1 transition-colors hover:bg-gray-300"
    >
      <Pencil className="max-w-5" />
    </button>
  );
};

export default EditButton;
