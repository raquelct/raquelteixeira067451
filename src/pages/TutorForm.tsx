import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { tutorSchema, type TutorFormSchema } from '../schemas/tutorSchema';
import { tutorFacade } from '../facades/tutor.facade';
import { LinkedPetsSection } from '../components/tutor/LinkedPetsSection';
import type { Tutor } from '../types/tutor.types';
import type { Pet } from '../types/pet.types';

/**
 * TutorForm - Formulário de criação/edição de tutor com upload de imagem
 * 
 * Features:
 * - Modo criar e editar (detecta ID na URL)
 * - Validação com React Hook Form + Zod
 * - Upload de imagem com preview
 * - Pré-carregamento de dados em modo edição
 * - Estados de loading e erro
 * - Navegação após sucesso
 * - Alto contraste (text-gray-900)
 */
export const TutorForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(isEditMode);
  const [currentTutor, setCurrentTutor] = useState<Tutor | null>(null);
  
  // Estado local para pets selecionados durante criação
  const [selectedPets, setSelectedPets] = useState<Pet[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TutorFormSchema>({
    resolver: zodResolver(tutorSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      endereco: '',
      cpf: '',
    },
  });

  /**
   * Carrega dados do tutor em modo de edição
   */
  useEffect(() => {
    if (!isEditMode || !id) {
      return;
    }

    const loadTutorData = async () => {
      try {
        setIsLoadingData(true);
        console.log('[TutorForm] Carregando tutor:', id);
        
        const tutor = await tutorFacade.fetchTutorById(Number(id));
        
        // Armazena tutor no estado local
        setCurrentTutor(tutor);
        
        // Pré-preenche o formulário
        reset({
          nome: tutor.name,
          email: tutor.email,
          telefone: tutor.phone,
          endereco: tutor.address,
          cpf: tutor.cpf,
        });

        // Pré-preenche a imagem se existir
        if (tutor.foto?.url) {
          setImagePreview(tutor.foto.url);
        }

        console.log('[TutorForm] Dados carregados:', tutor);
      } catch (error) {
        console.error('[TutorForm] Erro ao carregar tutor:', error);
        setSubmitError('Erro ao carregar dados do tutor');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadTutorData();
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
   * Adiciona pet ao estado local (modo criação)
   */
  const handleAddPet = (pet: Pet) => {
    setSelectedPets((prev) => [...prev, pet]);
  };

  /**
   * Remove pet do estado local (modo criação)
   */
  const handleRemovePet = (petId: number) => {
    setSelectedPets((prev) => prev.filter((p) => p.id !== petId));
  };

  /**
   * Submit do formulário
   */
  const onSubmit = async (data: TutorFormSchema) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      console.log(`[TutorForm] ${isEditMode ? 'Atualizando' : 'Criando'} tutor:`, data);
      
      if (isEditMode && id) {
        // Modo edição: atualiza tutor existente
        await tutorFacade.updateTutor(Number(id), data, imageFile || undefined);
        console.log('[TutorForm] Tutor atualizado com sucesso');
      } else {
        // Modo criação: cria novo tutor e vincula pets selecionados
        const petIds = selectedPets.map((pet) => pet.id);
        await tutorFacade.createTutor(data, imageFile || undefined, petIds);
        console.log('[TutorForm] Tutor criado com sucesso, pets vinculados:', petIds);
      }
      
      // Redireciona para lista
      navigate('/tutores');
    } catch (error) {
      console.error(`[TutorForm] Erro ao ${isEditMode ? 'atualizar' : 'criar'} tutor:`, error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : `Erro ao ${isEditMode ? 'atualizar' : 'criar'} tutor. Tente novamente.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Recarrega dados do tutor (usado após vincular/desvincular pets)
   */
  const handleRefreshTutor = async () => {
    if (!id) return;

    try {
      console.log('[TutorForm] Recarregando dados do tutor...');
      const tutor = await tutorFacade.fetchTutorById(Number(id));
      setCurrentTutor(tutor);
      console.log('[TutorForm] Dados atualizados:', tutor);
    } catch (error) {
      console.error('[TutorForm] Erro ao recarregar tutor:', error);
    }
  };

  /**
   * Cancela e volta para lista
   */
  const handleCancel = () => {
    navigate('/tutores');
  };

  // Loading state enquanto carrega dados do tutor em modo edição
  if (isLoadingData) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-300 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 rounded" />
                  <div className="h-12 bg-gray-200 rounded" />
                  <div className="h-12 bg-gray-200 rounded" />
                  <div className="h-32 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-300 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="space-y-3">
                  <div className="h-16 bg-gray-200 rounded" />
                  <div className="h-16 bg-gray-200 rounded" />
                  <div className="h-16 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          {isEditMode ? 'Editar Tutor' : 'Cadastrar Novo Tutor'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditMode ? 'Atualize os dados do tutor abaixo' : 'Preencha os dados do tutor abaixo'}
        </p>
      </div>

      {/* Grid Layout: Form (2 cols) + Linked Pets (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Formulário (2/3 da largura em desktop) */}
        <div className="lg:col-span-2">
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
            Foto do Tutor
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
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

        {/* Nome Completo */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo *
          </label>
          <input
            type="text"
            id="nome"
            {...register('nome')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-400 transition-colors"
            placeholder="Ex: João Silva"
          />
          {errors.nome && (
            <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-400 transition-colors"
            placeholder="Ex: joao@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Telefone */}
        <div>
          <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
            Telefone *
          </label>
          <input
            type="tel"
            id="telefone"
            {...register('telefone')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-400 transition-colors"
            placeholder="Ex: (65) 98765-4321"
          />
          {errors.telefone && (
            <p className="mt-1 text-sm text-red-600">{errors.telefone.message}</p>
          )}
        </div>

        {/* CPF */}
        <div>
          <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">
            CPF *
          </label>
          <input
            type="text"
            id="cpf"
            {...register('cpf')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-400 transition-colors"
            placeholder="Ex: 123.456.789-00"
          />
          {errors.cpf && (
            <p className="mt-1 text-sm text-red-600">{errors.cpf.message}</p>
          )}
        </div>

        {/* Endereço Completo */}
        <div>
          <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-2">
            Endereço Completo *
          </label>
          <textarea
            id="endereco"
            {...register('endereco')}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-400 transition-colors resize-none"
            placeholder="Ex: Rua das Flores, 123 - Centro, Cuiabá - MT"
          />
          {errors.endereco && (
            <p className="mt-1 text-sm text-red-600">{errors.endereco.message}</p>
          )}
        </div>

        {/* Botões */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center shadow-md hover:shadow-lg"
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
              isEditMode ? 'Atualizar Tutor' : 'Cadastrar Tutor'
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>
          </form>
        </div>

        {/* Coluna Direita: Pets Vinculados (1/3 da largura em desktop, sticky) */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            {isEditMode && currentTutor ? (
              <LinkedPetsSection
                mode="edit"
                tutor={currentTutor}
                onRefresh={handleRefreshTutor}
              />
            ) : (
              <LinkedPetsSection
                mode="create"
                selectedPets={selectedPets}
                onAddPet={handleAddPet}
                onRemovePet={handleRemovePet}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
