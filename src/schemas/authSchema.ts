import { z } from 'zod';

/**
 * Schema de validação para formulário de login
 * 
 * Regras (conforme API real):
 * - Username é obrigatório (ex: "admin")
 * - Password deve ter no mínimo 3 caracteres
 */
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username é obrigatório')
    .trim(),
  password: z
    .string()
    .min(3, 'A senha deve ter no mínimo 3 caracteres'),
});

/**
 * Tipo TypeScript inferido do schema Zod
 * Usado para tipagem do formulário
 */
export type LoginFormData = z.infer<typeof loginSchema>;
