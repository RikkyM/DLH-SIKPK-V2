import type { InputProps } from "./Input";
import { Label } from "./Label";
import { Input } from "./Input";

type FormFieldProps = InputProps & {
  label: string;
};

export const FormField = ({
  id,
  name,
  label,
  required = false,
  ...rest
}: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} required={required} {...rest} />
    </div>
  );
};
