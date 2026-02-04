import { FormHeader } from '../components/shared/FormHeader';
import { FormActions } from '../components/shared/FormActions';
import { PetFormFields } from '../components/pet/PetFormFields';
import { usePetForm } from '../hooks/usePetForm';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';

export const PetForm = () => {
  const {
    isEditMode,
    isLoadingData,
    isSubmitting,
    imagePreview,
    handleImageChange,
    handleRemoveImage,
    register,
    handleSubmit,
    errors,
    onSubmit,
    handleCancel,
  } = usePetForm();

  if (isLoadingData) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSkeleton type="form" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <FormHeader
        title={isEditMode ? 'Editar Pet' : 'Cadastrar Novo Pet'}
        subtitle={isEditMode ? 'Atualize os dados do pet abaixo' : 'Preencha os dados do pet abaixo'}
        onBack={handleCancel}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <PetFormFields
          register={register}
          errors={errors}
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
          onRemoveImage={handleRemoveImage}
        />

        <FormActions
          submitLabel={isEditMode ? 'Atualizar Pet' : 'Cadastrar Pet'}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
        />
      </form>
    </div>
  );
};
