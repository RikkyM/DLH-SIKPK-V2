import { http } from "@/services/api/http";
import { RefreshCcw, X } from "lucide-react";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  //   type ChangeEvent,
  type KeyboardEvent,
} from "react";

type Option = {
  label: string;
  value: string | number;
};

type Source<T> = T[] | string;

interface ComboboxProps<T extends Record<string, unknown>> {
  label?: string;
  placeholder?: string;

  datas: Source<T>;
  labelKey: keyof T;
  valueKey: keyof T;

  getLoading: boolean;

  className?: string;
  maxWidth?: string;

  value?: string | number;
  // defaultValue?: string | number;
  onChange?: (value: string | number, option: Option) => void;
}

const Combobox = <T extends Record<string, unknown>>({
  label,
  placeholder = "Cari data...",
  datas,
  labelKey,
  valueKey,
  className,
  maxWidth,
  getLoading = false,
  // value,
  // defaultValue,
  onChange,
}: ComboboxProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<Option[]>([]);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  // const [internalValue, setInternalValue] = useState<
  //   string | number | undefined
  // >(defaultValue);

  // const selectedValue = value ?? internalValue;

  const dropdownRef = useRef<HTMLDivElement>(null);

  //   const source = [
  //     { id: 1, nama: "test" },
  //     { id: 2, nama: "test1" },
  //     { id: 3, nama: "test2" },
  //   ];

  const loadOptions = useCallback(
    async (search: string = "") => {
      setLoading(true);

      try {
        let raw: T[] = [];

        if (Array.isArray(datas)) {
          raw = datas.filter((item) => {
            return String(item[labelKey])
              .toLowerCase()
              .includes(search.toLowerCase());
          });
        } else {
          const res = await http.get(datas, {
            params: { search },
          });
          raw = res.data;
        }

        setOptions(
          raw.map((item) => {
            return {
              label: String(item[labelKey]),
              value: item[valueKey] as string | number,
            };
          }),
        );
      } catch (err) {
        console.error(err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [labelKey, valueKey, datas],
  );

  useEffect(() => {
    const t = setTimeout(() => loadOptions(searchTerm), 500);

    return () => clearTimeout(t);
  }, [searchTerm, loadOptions]);

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

  const handleSelect = useCallback(
    (option: Option) => {
      setSearchTerm(option.label);
      setIsOpen(false);
      setSelectedIndex(-1);

      // if (value === undefined) {
      //   setInternalValue(option.value);
      // }

      onChange?.(option.value, option);
    },
    [onChange],
  );

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
        handleSelect(options[selectedIndex]);
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const dropdownData = useMemo(() => {
    return (
      <div
        className={`absolute z-10 mt-2 max-h-60 min-h-auto w-full origin-top-left overflow-y-auto rounded-lg border border-gray-300 bg-red-500 bg-white text-sm shadow-lg transition-all ease-[cubic-bezier(0.46,0.03,0.52,0.96)] ${isOpen ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"} `}
      >
        {(loading || getLoading) && (
          <div className="grid h-full min-h-20 w-full place-items-center bg-white p-2">
            <RefreshCcw className="animate-spin" />
          </div>
        )}

        {!loading && !getLoading && options.length === 0 && (
          <div className="grid h-full min-h-20 w-full place-items-center bg-white p-2 text-gray-400">
            <p className="font-medium">Data tidak ditemukan</p>
          </div>
        )}

        {!loading &&
          !getLoading &&
          options.map((item, index) => (
            <div
              key={item.value}
              onMouseDown={() => handleSelect(item)}
              className={`cursor-pointer px-3 py-1.5 hover:bg-gray-300 ${
                index === selectedIndex ? "bg-gray-300" : ""
              }`}
            >
              {item.label}
            </div>
          ))}
      </div>
    );
  }, [loading, isOpen, options, selectedIndex, handleSelect, getLoading]);

  return (
    <div className={`w-full space-y-1 ${maxWidth}`} ref={dropdownRef}>
      {label && (
        <label htmlFor="nama" className="block text-sm font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="relative flex items-center rounded border border-gray-300 bg-transparent text-sm focus-within:ring-1">
          <input
            // ref={inputRef}
            className={`w-full px-3 py-1.5 pr-10 text-sm outline-none ${className}`}
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            // onChange={handleSearchChange}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className={`absolute right-0 cursor-pointer bg-transparent px-3 py-2 ${searchTerm !== "" ? "" : "absolute text-transparent"}`}
          >
            <X className="size-4" />
          </button>
        </div>

        {dropdownData}
      </div>
    </div>
  );
};

export default memo(Combobox);
