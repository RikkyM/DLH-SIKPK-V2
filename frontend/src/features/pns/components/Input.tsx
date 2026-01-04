import type { ChangeEvent, HTMLInputTypeAttribute } from "react";

type Props = {
  id: string;
  name: string;
  className?: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

const Input = ({
  id,
  name,
  className,
  type = "text",
  placeholder,
  value,
  onChange,
}: Props) => {
  return (
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={`rounded border w-full border-gray-300 px-3 py-1.5 text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:shadow focus:ring-blue-500/50 ${className}`}
      placeholder={placeholder}
    />
  );
};

export default Input;
