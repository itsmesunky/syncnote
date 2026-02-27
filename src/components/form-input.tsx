import { InputHTMLAttributes } from "react";

import { Control, FieldPath, FieldValues } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";

interface Props<TFieldValues extends FieldValues> extends InputHTMLAttributes<HTMLInputElement> {
  fieldName: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
}

export const FormInput = <TFieldValues extends FieldValues>({
  fieldName,
  control,
  label,
  ...rest
}: Props<TFieldValues>) => {
  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input {...field} {...rest} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
