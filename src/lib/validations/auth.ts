import { z } from "zod";

export const SignupSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Konfirmasi sandi tidak cocok",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
