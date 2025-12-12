import { useState, type ChangeEvent } from "react";

const DATE_INPUT_CLASS =
  "h-9 w-56 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none";

type DateInputProps = {
  id: string;
  name?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  className?: string;
  disabled?: boolean;
};

const DateInput = ({
  id,
  name,
  value,
  onChange,
  placeholder = "Pilih Tanggal...",
  min,
  max,
  className,
  disabled = false,
}: DateInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const type = isFocused || value ? "date" : "text";

  return (
    <input
      id={id}
      name={name}
      type={type}
      className={`${DATE_INPUT_CLASS} ${className ?? ""} disabled:cursor-not-allowed`}
      value={value}
      placeholder={type === "text" ? placeholder : ""}
      onChange={onChange}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      min={min}
      max={max}
      disabled={disabled}
    />
  );
};

export default DateInput;
