import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { petSchema, type PetFormSchema } from '../schemas/petSchema';
import { petFacade } from '../facades/pet.facade';

/**
 * PetForm - Formulário de criação/edição de pet com upload de imagem
 * 
 * Features:
 * - Modo criar e editar (detecta ID na URL)
 * - Validação com React Hook Form + Zod
 * - Upload de imagem com preview
 * - Pré-carregamento de dados em modo edição
 * - Estados de loading e erro
 * - Navegação após sucesso
 */
export const PetForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PetFormSchema>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      nome: '',
      raca: '',
      idade: 0,
    },
  });

  /**
   * Carrega dados do pet em modo de edição
   */
  useEffect(() => {
    if (!isEditMode || !id) {
      return;
    }

    const loadPetData = async () => {
      try {
        setIsLoadingData(true);
        console.log('[PetForm] Carregando pet:', id);
        
        const pet = await petFacade.fetchPetById(Number(id));
        
        // Pré-preenche o formulário
        reset({
          nome: pet.name,
          raca: pet.breed,
          idade: pet.age,
        });

        // Pré-preenche a imagem se existir
        if (pet.foto?.url) {
          setImagePreview(pet.foto.url);
        }

        console.log('[PetForm] Dados carregados:', pet);
      } catch (error) {
        console.error('[PetForm] Erro ao carregar pet:', error);
        setSubmitError('Erro ao carregar dados do pet');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadPetData();
  }, [id, isEditMode, reset]);

  /**
   * Manipula seleção de imagem
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Valida tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem');
        return;
      }

      // Valida tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB');
        return;
      }

      setImageFile(file);

      // Cria preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Remove imagem selecionada
   */
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  /**
   * Submit do formulário (modo criar ou editar)
   */
  const onSubmit = async (data: PetFormSchema) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      console.log(`[PetForm] ${isEditMode ? 'Atualizando' : 'Criando'} pet:`, data);
      
      if (isEditMode && id) {
        // Modo edição: atualiza pet existente
        await petFacade.updatePet(Number(id), data, imageFile || undefined);  
        console.log('[PetForm] Pet atualizado com sucesso');
      } else {
        // Modo criação: cria novo pet
        await petFacade.createPet(data, imageFile || undefined);
        console.log('[PetForm] Pet criado com sucesso');
      }
      
      // Redireciona para lista
      navigate('/');
    } catch (error) {
      console.error(`[PetForm] Erro ao ${isEditMode ? 'atualizar' : 'criar'} pet:`, error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : `Erro ao ${isEditMode ? 'atualizar' : 'criar'} pet. Tente novamente.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Cancela e volta para lista
   */
  const handleCancel = () => {
    navigate('/');
  };

  // Loading state enquanto carrega dados do pet em modo edição
  if (isLoadingData) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleCancel}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Voltar
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Editar Pet' : 'Cadastrar Novo Pet'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditMode ? 'Atualize os dados do pet abaixo' : 'Preencha os dados do pet abaixo'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* Erro geral */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          </div>
        )}

        {/* Upload de Imagem */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Foto do Pet
          </label>
          
          {!imagePreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm text-gray-600 mb-1">
                  Clique para selecionar uma imagem
                </span>
                <span className="text-xs text-gray-500">PNG, JPG até 5MB</span>
              </label>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Nome */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Pet *
          </label>
          <input
            type="text"
            id="nome"
            {...register('nome')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-400"
            placeholder="Ex: Bob"
          />
          {errors.nome && (
            <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
          )}
        </div>

        {/* Raça */}
        <div>
          <label htmlFor="raca" className="block text-sm font-medium text-gray-700 mb-2">
            Raça *
          </label>
          <input
            type="text"
            id="raca"
            {...register('raca')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-400"
            placeholder="Ex: Labrador"
          />
          {errors.raca && (
            <p className="mt-1 text-sm text-red-600">{errors.raca.message}</p>
          )}
        </div>

        {/* Idade */}
        <div>
          <label htmlFor="idade" className="block text-sm font-medium text-gray-700 mb-2">
            Idade (anos) *
          </label>
          <input
            type="number"
            id="idade"
            {...register('idade', { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-400"
            placeholder="Ex: 3"
            min="0"
          />
          {errors.idade && (
            <p className="mt-1 text-sm text-red-600">{errors.idade.message}</p>
          )}
        </div>

        {/* Botões */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {isEditMode ? 'Atualizando...' : 'Cadastrando...'}
              </>
            ) : (
              isEditMode ? 'Atualizar Pet' : 'Cadastrar Pet'
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
