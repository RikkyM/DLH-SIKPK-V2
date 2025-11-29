import { useDialog } from "@/hooks/useDialog";

const Dialog = () => {
  const { isOpen, content, closeDialog } = useDialog();

  return (
    <div
      onClick={closeDialog}
      className={`absolute inset-0 z-40 transition-all ${
        isOpen
          ? "pointer-events-auto bg-black/50 backdrop-blur-xs opacity-100 duration-300"
          : "pointer-events-none opacity-0"
      }`}
    >
      {content}
    </div>
  );
};

export default Dialog;
