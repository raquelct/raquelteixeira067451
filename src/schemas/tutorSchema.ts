import { z } from 'zod';

/**
 * Schema de validação para criação de tutor
 * Campos conforme API: nome, email, telefone, endereco, cpf
 */
export const tutorSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  
  email: z
    .string()
    .email('Email inválido')
    .min(5, 'Email deve ter no mínimo 5 caracteres')
    .max(100, 'Email deve ter no máximo 100 caracteres'),
  
  telefone: z
    .string()
    .min(10, 'Telefone deve ter no mínimo 10 caracteres')
    .max(15, 'Telefone deve ter no máximo 15 caracteres')
    .regex(/^[\d\s\(\)\-\+]+$/, 'Telefone deve conter apenas números e símbolos válidos'),
  
  endereco: z
    .string()
    .min(5, 'Endereço deve ter no mínimo 5 caracteres')
    .max(200, 'Endereço deve ter no máximo 200 caracteres'),
  
  cpf: z
    .string()
    .min(11, 'CPF deve ter no mínimo 11 caracteres')
    .max(14, 'CPF deve ter no máximo 14 caracteres')
    .regex(/^[\d\.\-]+$/, 'CPF deve conter apenas números, pontos e traços'),
});

/**
 * Type inferido do schema
 */
export type TutorFormSchema = z.infer<typeof tutorSchema>;
