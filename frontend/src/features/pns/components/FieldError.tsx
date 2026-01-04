import type { ReactNode } from "react";

type Props = {
  errors: ReactNode;
  className?: string;
};

const FieldError = ({ errors, className }: Props) => {
  return <p className={`text-sm text-red-500 ${className}`}>{errors}</p>;
};

export default FieldError;
