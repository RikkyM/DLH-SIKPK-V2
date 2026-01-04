import type { ChangeEvent } from "react";

type Props = {
  id: string;
  name: string;
  className?: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
};

const Textarea = ({
  id,
  name,
  className,
  placeholder,
  value,
  onChange,
}: Props) => {
  return (
    <textarea
      id={id}
      name={name}
      className={`w-full rounded border border-gray-300 px-3 py-1.5 text-sm transition-all duration-300 focus:shadow focus:ring-2 focus:ring-blue-500/50 focus:outline-none ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    ></textarea>
  );
};

export default Textarea;
