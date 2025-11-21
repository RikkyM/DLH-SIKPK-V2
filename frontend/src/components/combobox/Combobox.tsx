import type { Department } from "@/types/department.types";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

const Combobox = ({ data }: { data: Department[] }) => {
  const [value, setValue] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [dropUp, setDropUp] = useState(false);
  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const optRef = useRef<(HTMLButtonElement | null)[]>([]);

  const filterData = data.filter((opt: Department) =>
    opt?.DeptName?.toLowerCase().includes(value.toLowerCase())
  );

  const handleSelect = (opt: Department) => {
    setValue(opt.DeptName ?? "");
    setOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!filterData.length) return;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIdx((prev) => (prev - 1 < 0 ? filterData.length - 1 : prev - 1));
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIdx((prev) => (prev + 1 >= filterData.length ? 0 : prev + 1));
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (open) {
        handleSelect(filterData[activeIdx]);
      }
    }

    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (optRef.current[activeIdx]) {
      optRef.current[activeIdx]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeIdx]);

  // Deteksi posisi dropdown - apakah harus ke atas atau ke bawah
  useEffect(() => {
    if (!open || !listRef.current || !inputRef.current) return;

    const checkPosition = () => {
      const inputRect = inputRef.current!.getBoundingClientRect();
      const listHeight = listRef.current!.offsetHeight;
      const spaceBelow = window.innerHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;

      // Tambahkan margin 8px untuk spacing
      const margin = 8;

      // Jika space dibawah tidak cukup DAN space diatas lebih besar
      const shouldDropUp =
        spaceBelow < listHeight + margin && spaceAbove > spaceBelow;

      setDropUp(shouldDropUp);
    };

    // Jalankan setelah render untuk mendapatkan dimensi yang akurat
    requestAnimationFrame(checkPosition);

    // Re-check saat window resize
    window.addEventListener("resize", checkPosition);
    return () => window.removeEventListener("resize", checkPosition);
  }, [open, filterData.length]);

  return (
    <div
      className="relative"
      onBlur={() => setTimeout(() => setOpen(false), 150)}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
          setActiveIdx(0);
        }}
        placeholder="Filter Department"
        onClick={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className="w-full border border-gray-300 rounded px-3 py-2"
      />
      {open && (
        <div
          ref={listRef}
          className={`absolute z-10 w-full bg-white shadow-lg border border-gray-300 rounded p-2 max-h-44 overflow-auto transition-opacity duration-200 ${
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {filterData.length > 0 ? (
            filterData.map((options, idx) => (
              <button
                key={idx}
                ref={(el) => (optRef.current[idx] = el)}
                onClick={() => handleSelect(options)}
                className={`w-full text-left px-2 py-1.5 rounded transition-colors ${
                  idx === activeIdx ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                {options.DeptName}
              </button>
            ))
          ) : (
            <div className="px-2 py-1.5 text-gray-500 text-sm">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Combobox;
