import type { CreatePetDto } from '../../types/pet.types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class PetValidator {
  static validate(data: Partial<CreatePetDto>): ValidationResult {
    const errors: ValidationError[] = [];

    if (data.nome && data.nome.trim().length < 3) {
      errors.push({
        field: 'nome',
        message: 'Nome do pet deve ter no mínimo 3 caracteres',
      });
    }

    if (data.raca && data.raca.trim().length < 2) {
      errors.push({
        field: 'raca',
        message: 'Raça do pet deve ter no mínimo 2 caracteres',
      });
    }

    if (data.idade !== undefined && (data.idade < 0 || data.idade > 100)) {
      errors.push({
        field: 'idade',
        message: 'Idade do pet deve estar entre 0 e 100 anos',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateOrThrow(data: Partial<CreatePetDto>): void {
    const result = this.validate(data);
    if (!result.isValid) {
      const firstError = result.errors[0];
      throw new Error(firstError.message);
    }
  }
}
