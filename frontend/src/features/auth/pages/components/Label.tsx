import type { LabelHTMLAttributes, ReactNode } from "react";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode;
};

export const Label = ({ children, ...rest }: LabelProps) => {
  return (
    <label {...rest} className="block font-medium">
      {children}
    </label>
  );
};
