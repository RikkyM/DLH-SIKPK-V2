import { http } from "@/services/api/http";
import {
  memo,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

export interface Option {
  id: number | string;
  name: string;
  [key: string]: unknown;
}

interface Props {
  api: string;
  placeholder?: string;
  label?: string;
  onSelect: (option: Option | null) => void;
  value?: Option | null;
  displayKey?: string;
  valueKey?: string;
  searchParam?: string;
}

const Combobox = ({
  api,
  placeholder = "Pilih atau ketik untuk mencari",
  label,
  onSelect,
  value = null,
  displayKey = "nama",
  valueKey = "id",
  searchParam = "search",
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setSelectedOption(value);
  }, [value]);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (searchTerm) {
          params[searchParam] = searchTerm;
        }

        const res = await http.get(api, {
          params,
        });

        let data = res.data;

        if (data.data) {
          data = data.data;
        }

        // const optionsData = Array.isArray(data) ? data : [];

        setOptions(data ? data : []);
      } catch {
        console.error("Gagal mengambil data");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      const debounce = setTimeout(() => {
        getData();
      }, 300);

      return () => clearTimeout(debounce);
    }
  }, [searchTerm, isOpen, api, searchParam]);

   useEffect(() => {
     if (isOpen && selectedOption && options.length > 0) {
       const index = options.findIndex(
         (opt) => opt[valueKey] === selectedOption[valueKey],
       );
       if (index >= 0) {
         setSelectedIndex(index);
         setTimeout(() => {
           optionsRef.current[index]?.scrollIntoView({
             block: "center",
             behavior: "smooth",
           });
         }, 100);
       }
     }
   }, [isOpen, options, selectedOption, valueKey]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedIndex >= 0 && optionsRef.current[selectedIndex]) {
      optionsRef.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedIndex(-1);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelect = (option: Option) => {
    setSelectedOption(option);
    setSearchTerm("");
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelect(option);
  };

  const handleClear = () => {
    setSelectedOption(null);
    setSearchTerm("");
    setSelectedIndex(-1);
    onSelect(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (
      !isOpen &&
      (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")
    ) {
      setIsOpen(true);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && options[selectedIndex]) {
          handleSelect(options[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="w-full max-w-md" ref={dropdownRef}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={
              selectedOption ? String(selectedOption[displayKey]) : searchTerm
            }
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-20 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
            {selectedOption && (
              <button
                onClick={handleClear}
                className="rounded p-1 hover:bg-gray-100"
                type="button"
              >
                <svg
                  className="h-4 w-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded p-1 hover:bg-gray-100"
              type="button"
            >
              <svg
                className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
            {loading ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                <p className="mt-2">Memuat data...</p>
              </div>
            ) : options.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                Tidak ada data ditemukan
              </div>
            ) : (
              options.map((option, index) => (
                <div
                  key={String(option[valueKey])}
                  ref={(el) => {
                    optionsRef.current[index] = el;
                  }}
                  onClick={() => handleSelect(option)}
                  className={`cursor-pointer px-4 py-2 transition-colors ${
                    selectedIndex === index
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100"
                  } ${
                    selectedOption?.[valueKey] === option[valueKey]
                      ? "bg-blue-50 font-medium"
                      : ""
                  }`}
                >
                  {String(option[displayKey])}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Combobox);
