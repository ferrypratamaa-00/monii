"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

interface FormWrapperProps {
  schema: z.ZodSchema;
  defaultValues: any;
  onSubmit: (data: any) => void | Promise<void>;
  children: (methods: ReturnType<typeof useForm>) => React.ReactNode;
}

export function FormWrapper({
  schema,
  defaultValues,
  onSubmit,
  children,
}: FormWrapperProps) {
  const methods = useForm({
    resolver: zodResolver(schema as any),
    defaultValues,
  });

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)}>{children(methods)}</form>
  );
}
