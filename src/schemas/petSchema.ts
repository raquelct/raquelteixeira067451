import { z } from 'zod';

/**
 * Schema de validação para criação de pet
 * Apenas campos suportados pela API
 */
export const petSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  
  raca: z
    .string()
    .min(2, 'Raça deve ter no mínimo 2 caracteres')
    .max(100, 'Raça deve ter no máximo 100 caracteres'),
  
  idade: z
    .number({ message: 'Idade deve ser um número' })
    .min(0, 'Idade deve ser maior ou igual a 0')
    .max(100, 'Idade deve ser menor ou igual a 100'),
});

/**
 * Type inferido do schema
 */
export type PetFormSchema = z.infer<typeof petSchema>;
