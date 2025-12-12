import {
  useEffect,
  useMemo,
  useState,
  type FC,
  type HTMLAttributes,
} from "react";

type Option = {
  id: number | string;
  nama: string;
};

type SearchableSelectProps = {
  label?: string;
  name?: string;
  value: number | string | null;
  onChange: (value: number | string | null) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

const SearchableSelect: FC<SearchableSelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  disabled,
  error,
  className = "",
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedOption = useMemo(
    () => options.find((opt) => String(opt.id) === String(value)) ?? null,
    [options, value],
  );

  useEffect(() => {
    if (selectedOption) {
      setSearch(selectedOption.nama);
    } else {
      setSearch("");
    }
  }, [selectedOption]);

  const filteredOptions = useMemo(
    () =>
      options.filter((opt) =>
        opt.nama.toLowerCase().includes(search.toLowerCase()),
      ),
    [options, search],
  );

  const handleSelect = (opt: Option) => {
    onChange(opt.id);
    setSearch(opt.nama);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setSearch("");
  };

  return (
    <div className={`space-y-1 text-sm ${className}`} {...rest}>
      {label && (
        <label className="block font-medium" htmlFor={name}>
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={name}
          name={name}
          type="text"
          autoComplete="off"
          className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
          placeholder={placeholder}
          value={search}
          disabled={disabled}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          onBlur={() => {
            setTimeout(() => setIsOpen(false), 150);
          }}
        />

        {!disabled && search && (
          <button
            type="button"
            className="absolute inset-y-0 right-6 flex items-center px-1 text-xs text-gray-400 hover:text-gray-600"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
          >
            ×
          </button>
        )}

        <button
          type="button"
          className="absolute inset-y-0 right-1 flex items-center px-1 text-gray-400 hover:text-gray-600"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (!disabled) setIsOpen((prev) => !prev);
          }}
        >
          ▾
        </button>

        {isOpen && !disabled && filteredOptions.length > 0 && (
          <div className="absolute z-50 mt-1 max-h-32 w-full overflow-y-auto rounded border border-gray-300 bg-white shadow">
            {filteredOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className="flex w-full cursor-pointer items-center px-3 py-1.5 text-left text-sm hover:bg-gray-100"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(opt)}
              >
                {opt.nama}
              </button>
            ))}
          </div>
        )}

        {isOpen && !disabled && filteredOptions.length === 0 && (
          <div className="absolute z-50 mt-1 w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-500 shadow">
            Tidak ada data
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default SearchableSelect;