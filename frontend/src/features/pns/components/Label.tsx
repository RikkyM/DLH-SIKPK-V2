import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  htmlFor: string;
  className?: string;
};

const Label = ({ children, htmlFor, className }: Props) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block w-max text-sm font-medium ${className}`}
    >
      {children}
    </label>
  );
};

export default Label;
