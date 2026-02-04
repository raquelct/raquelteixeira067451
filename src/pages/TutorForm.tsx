import { LinkedPetsSection } from '../components/tutor/LinkedPetsSection';
import { PetSelectModal } from '../components/shared/PetSelectModal';
import { FormHeader } from '../components/shared/FormHeader';
import { TutorFormFields } from '../components/tutor/TutorFormFields';
import { FormActions } from '../components/shared/FormActions';
import { useTutorForm } from '../hooks/useTutorForm';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';

export const TutorForm = () => {
  const {
    isEditMode,
    isLoadingData,
    isSubmitting,
    currentTutor,
    selectedPets,
    isModalOpen,
    setIsModalOpen,
    imagePreview,
    handleImageChange,
    handleRemoveImage,
    register,
    handleSubmit,
    errors,
    setValue,
    onSubmit,
    handleCancel,
    handleAddPet,
    handleRemovePet,
    handlePetUnlinked,
    handleSelectPet,
    linkedPetIds,
  } = useTutorForm();

  if (isLoadingData) {
    return <LoadingSkeleton type="form" />;
  }

  return (
    <>
      <FormHeader
        title={isEditMode ? 'Editar Tutor' : 'Cadastrar Novo Tutor'}
        subtitle={isEditMode ? 'Atualize os dados do tutor abaixo' : 'Preencha os dados do tutor abaixo'}
        onBack={handleCancel}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <TutorFormFields
              register={register}
              errors={errors}
              setValue={setValue}
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              onRemoveImage={handleRemoveImage}
            />

            <FormActions
              submitLabel={isEditMode ? 'Atualizar Tutor' : 'Cadastrar Tutor'}
              isSubmitting={isSubmitting}
              onCancel={handleCancel}
            />
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <LinkedPetsSection
              mode={isEditMode ? 'edit' : 'create'}
              tutor={isEditMode ? currentTutor || undefined : undefined}
              selectedPets={selectedPets}
              onAddPet={handleAddPet}
              onRemovePet={isEditMode ? handlePetUnlinked : handleRemovePet}
              onAddClick={() => setIsModalOpen(true)}
            />
          </div>
        </div>
      </div>

      <PetSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelectPet}
        alreadyLinkedPetIds={linkedPetIds}
      />
    </>
  );
};
