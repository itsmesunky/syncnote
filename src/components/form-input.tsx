"use client";

import { ComponentProps } from "react";

import { Control, FieldPath, FieldValues } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

type BaseProps<TFieldValues extends FieldValues> = {
  fieldName: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
};

type InputProps<TFieldValues extends FieldValues> = BaseProps<TFieldValues> & {
  contentType?: "input";
} & ComponentProps<typeof Input>;

type TextareaProps<TFieldValues extends FieldValues> = BaseProps<TFieldValues> & {
  contentType: "textarea";
} & ComponentProps<typeof Textarea>;

type FormInputProps<TFieldValues extends FieldValues> =
  | InputProps<TFieldValues>
  | TextareaProps<TFieldValues>;

export const FormInput = <TFieldValues extends FieldValues>(
  props: FormInputProps<TFieldValues>,
) => {
  const { fieldName, control, label, contentType = "input", ...rest } = props;

  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            {contentType === "input" ? (
              <Input {...field} {...(rest as ComponentProps<typeof Input>)} />
            ) : (
              <Textarea {...field} {...(rest as ComponentProps<typeof Textarea>)} />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
