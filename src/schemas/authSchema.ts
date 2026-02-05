import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username é obrigatório')
    .trim(),
  password: z
    .string()
    .min(3, 'A senha deve ter no mínimo 3 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
