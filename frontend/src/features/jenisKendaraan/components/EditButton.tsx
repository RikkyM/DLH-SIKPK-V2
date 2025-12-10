import { Pencil } from "lucide-react";
import type { JenisKendaraan } from "../types/types";
import { useDialog } from "@/hooks/useDialog";

type Props = {
  data: JenisKendaraan;
};

const EditButton = ({ data }: Props) => {
  const { openDialog } = useDialog<JenisKendaraan>();

  return (
    <button
      onClick={() => openDialog(data)}
      className="cursor-pointer rounded p-1 transition-colors hover:bg-gray-300"
    >
      <Pencil className="max-w-5" />
    </button>
  );
};

export default EditButton;
