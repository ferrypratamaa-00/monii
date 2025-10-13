"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

interface FormWrapperProps<T extends z.ZodSchema> {
  schema: T;
  defaultValues: z.infer<T>;
  onSubmit: (data: z.infer<T>) => void | Promise<void>;
  children: (
    methods: ReturnType<typeof useForm<z.infer<T>>>,
  ) => React.ReactNode;
}

export function FormWrapper<T extends z.ZodSchema>({
  schema,
  defaultValues,
  onSubmit,
  children,
}: FormWrapperProps<T>) {
  const methods = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)}>{children(methods)}</form>
  );
}
