import type { CreatePetDto, PetFormData } from '../../types/pet.types';

export class PetMapper {
  static toCreateDto(formData: PetFormData): CreatePetDto {
    const dto: CreatePetDto = {
      nome: formData.nome,
      raca: formData.raca,
      idade: formData.idade,
    };

    return this.normalize(dto);
  }

  static normalize<T extends Partial<CreatePetDto>>(data: T): T {
    return {
      ...data,
      nome: data.nome?.trim() as T['nome'],
      raca: data.raca?.trim() as T['raca'],
    } as T;
  }
}
