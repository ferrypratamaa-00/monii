import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type FormWrapperProps<T extends z.ZodType> = {
  schema: T;
  defaultValues: z.infer<T>;
  onSubmit: (data: z.infer<T>) => void | Promise<void>;
  children: (methods: ReturnType<typeof useForm>) => React.ReactNode;
};

export function FormWrapper<T extends z.ZodType>({
  schema,
  defaultValues,
  onSubmit,
  children,
}: FormWrapperProps<T>) {
  const methods = useForm({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={methods.handleSubmit(onSubmit as any)}>
      {children(methods)}
    </form>
  );
}
