import type { CreateTutorDto } from '../../types/tutor.types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class TutorValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  static validate(data: Partial<CreateTutorDto>): ValidationResult {
    const errors: ValidationError[] = [];

    if (data.nome && String(data.nome).trim().length < 3) {
      errors.push({
        field: 'nome',
        message: 'Nome do tutor deve ter no mínimo 3 caracteres',
      });
    }

    if (data.email && !this.isValidEmail(String(data.email))) {
      errors.push({
        field: 'email',
        message: 'Email inválido',
      });
    }

    if (data.telefone && String(data.telefone).replace(/\D/g, '').length < 10) {
      errors.push({
        field: 'telefone',
        message: 'Telefone inválido',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateOrThrow(data: Partial<CreateTutorDto>): void {
    const result = this.validate(data);
    if (!result.isValid) {
      const firstError = result.errors[0];
      throw new Error(firstError.message);
    }
  }

  private static isValidEmail(email: string): boolean {
    return this.EMAIL_REGEX.test(email);
  }
}
