import type { CreateTutorDto, TutorFormData } from '../../types/tutor.types';
import { TutorValidator } from './TutorValidator';

export class TutorMapper {
  static toCreateDto(formData: TutorFormData): CreateTutorDto {
    const dto: CreateTutorDto = {
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      endereco: formData.endereco,
      cpf: formData.cpf,
    };

    TutorValidator.validateOrThrow(dto);
    return this.normalize(dto);
  }

  static normalize<T extends Partial<CreateTutorDto>>(data: T): T {
    const normalizeString = (value: unknown) => {
      if (!value) return undefined;
      return String(value).trim();
    };

    const normalizeDigits = (value: unknown) => {
      if (!value) return undefined;
      return String(value).replace(/\D/g, '');
    };

    return {
      ...data,
      nome: normalizeString(data.nome) as T['nome'],
      email: normalizeString(data.email)?.toLowerCase() as T['email'],
      telefone: normalizeDigits(data.telefone) as T['telefone'],
      endereco: normalizeString(data.endereco) as T['endereco'],
      cpf: normalizeDigits(data.cpf) as T['cpf'],
    } as T;
  }
}
