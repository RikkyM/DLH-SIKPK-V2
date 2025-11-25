import type { InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ className, ...rest }: InputProps) => {
  return (
    <input
      {...rest}
      className={`${className} px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-transparent w-full rounded border border-gray-400`}
    />
  );
};
