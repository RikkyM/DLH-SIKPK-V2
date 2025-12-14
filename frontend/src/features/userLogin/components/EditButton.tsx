import { Pencil } from "lucide-react";
import { useDialog } from "@/hooks/useDialog";
import type { User } from "@/features/auth";

type Props = {
  row: User;
};

const EditButton = ({ row }: Props) => {
  const { openDialog } = useDialog<User>();

  return (
    <button
      onClick={() => openDialog(row)}
      className="cursor-pointer outline-none rounded p-1 transition-colors hover:bg-gray-300"
    >
      <Pencil className="max-w-5" />
    </button>
  );
};

export default EditButton;
