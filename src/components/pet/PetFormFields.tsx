import { memo } from 'react';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { PetFormSchema } from '../../schemas/petSchema';
import { FormInput } from '../shared/FormInput';
import { ImageUpload } from '../shared/ImageUpload';

interface PetFormFieldsProps {
  register: UseFormRegister<PetFormSchema>;
  errors: FieldErrors<PetFormSchema>;
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

export const PetFormFields = memo(({
  register,
  errors,
  imagePreview,
  onImageChange,
  onRemoveImage,
}: PetFormFieldsProps) => {
  return (
    <div className="space-y-6">
      <ImageUpload
        label="Foto do Pet"
        previewUrl={imagePreview}
        onImageSelect={onImageChange}
        onRemove={onRemoveImage}
      />

      <FormInput
        label="Nome do Pet *"
        placeholder="Ex: Bob"
        error={errors.nome?.message}
        {...register('nome')}
      />

      <FormInput
        label="Raça"
        placeholder="Ex: Labrador"
        error={errors.raca?.message}
        {...register('raca')}
      />

      <FormInput
        label="Idade (anos)"
        placeholder="Ex: 3"
        type="number"
        min="0"
        error={errors.idade?.message}
        {...register('idade', { valueAsNumber: true })}
      />
    </div>
  );
});
