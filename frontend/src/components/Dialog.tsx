import { useDialog } from "@/hooks/useDialog";
import type { ReactNode } from "react";

const Dialog = ({ children }: { children: ReactNode }) => {
  const { isOpen, closeDialog } = useDialog();

  return (
    <div
      onClick={closeDialog}
      className={`absolute inset-0 z-40 grid place-items-center transition-all duration-300 ${
        isOpen
          ? "pointer-events-auto bg-black/20 opacity-100 backdrop-blur-xs duration-300"
          : "pointer-events-none opacity-0"
      }`}
    >
      <div className="grid h-full w-full max-w-5xl place-items-center overflow-hidden px-3 py-10">
        {children}
      </div>
    </div>
  );
};

export default Dialog;
