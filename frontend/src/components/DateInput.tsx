import { useState, type ChangeEvent } from "react";

const DATE_INPUT_CLASS =
  "h-9 w-56 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none";

type DateInputProps = {
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  className?: string;
};

const DateInput = ({
  id,
  value,
  onChange,
  placeholder = "Pilih Tanggal...",
  min,
  max,
  className,
}: DateInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const type = isFocused || value ? "date" : "text";

  return (
    <input
      id={id}
      type={type}
      className={`${DATE_INPUT_CLASS} ${className ?? ""}`}
      value={value}
      placeholder={type === "text" ? placeholder : ""}
      onChange={onChange}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      min={min}
      max={max}
    />
  );
};

export default DateInput;
