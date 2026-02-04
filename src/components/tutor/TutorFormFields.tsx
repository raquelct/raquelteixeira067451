import type { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form';
import type { TutorFormSchema } from '../../schemas/tutorSchema';
import { FormInput } from '../shared/FormInput';
import { FormTextarea } from '../shared/FormTextarea';
import { ImageUpload } from '../shared/ImageUpload';
import { maskPhone, maskCPF } from '../../utils/masks';

interface TutorFormFieldsProps {
  register: UseFormRegister<TutorFormSchema>;
  errors: FieldErrors<TutorFormSchema>;
  setValue: UseFormSetValue<TutorFormSchema>;
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

export const TutorFormFields = ({
  register,
  errors,
  setValue,
  imagePreview,
  onImageChange,
  onRemoveImage,
}: TutorFormFieldsProps) => {
  return (
    <div className="space-y-6">
      <ImageUpload
        label="Foto do Tutor"
        previewUrl={imagePreview}
        onImageSelect={onImageChange}
        onRemove={onRemoveImage}
      />

      <FormInput
        label="Nome Completo *"
        placeholder="Ex: João Silva"
        autoComplete="name"
        error={errors.nome?.message}
        {...register('nome')}
      />

      <FormInput
        label="Email *"
        placeholder="Ex: joao@email.com"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <FormInput
        label="Telefone *"
        placeholder="Ex: (65) 98765-4321"
        autoComplete="tel"
        error={errors.telefone?.message}
        {...register('telefone')}
        maxLength={15}
        onChange={(e) => {
          const masked = maskPhone(e.target.value);
          setValue('telefone', masked);
        }}
      />

      <FormInput
        label="CPF *"
        placeholder="000.000.000-00"
        autoComplete="off"
        error={errors.cpf?.message}
        {...register('cpf')}
        maxLength={14}
        onChange={(e) => {
          const masked = maskCPF(e.target.value);
          setValue('cpf', masked);
        }}
      />

      <FormTextarea
        label="Endereço Completo *"
        placeholder="Ex: Rua das Flores, 123 - Centro, Cuiabá - MT"
        rows={3}
        error={errors.endereco?.message}
        {...register('endereco')}
      />
    </div>
  );
};
