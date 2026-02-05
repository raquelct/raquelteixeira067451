import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { petService } from './pet.service';
import apiClient from './api';
import MockAdapter from 'axios-mock-adapter';
import type { PetApiDto, PetListApiResponse, CreatePetDto, Pet } from '../types/pet.types';

describe('PetService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.reset();
  });

  const getBaseUrlRegex = (path: string = '') => new RegExp(`/v1/pets${path}(\\?.*)?`);

  describe('getAll', () => {
    it('should fetch pets and transform them to domain model', async () => {
      const apiResponse: PetListApiResponse = {
        content: [
          {
            id: 1,
            nome: 'Rex',
            raca: 'Labrador',
            idade: 5,
            foto: { url: 'http://example.com/rex.jpg', id: 123 },
            tutorNome: 'João Silva',
            tutorCpf: '12345678900'
          }
        ],
        page: 0,
        size: 10,
        total: 1,
        pageCount: 1
      };

      mock.onGet(getBaseUrlRegex()).reply(200, apiResponse);

      const result = await petService.getAll();

      expect(result.content).toHaveLength(1);
      const pet: Pet = result.content[0];
      
      expect(pet.id).toBe(1);
      expect(pet.name).toBe('Rex');
      expect(pet.breed).toBe('Labrador');
    });
  });

  describe('getById', () => {
    it('should throw error on 404', async () => {
      mock.onGet(getBaseUrlRegex('/999')).reply(404);

      await expect(petService.getById(999)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a pet', async () => {
      const newPet: CreatePetDto = { nome: 'Buddy', raca: 'Golden', idade: 2 };
      const apiResponse: PetApiDto = { ...newPet, id: 2, foto: null };

      mock.onPost('/v1/pets').reply(200, apiResponse);

      const result = await petService.create(newPet);

      expect(result.id).toBe(2);
      expect(result.name).toBe('Buddy');
    });
  });

  describe('Error Handling', () => {
    it('should handle 500 server errors', async () => {
      mock.onGet(getBaseUrlRegex()).reply(500);
      await expect(petService.getAll()).rejects.toThrow();
    });
  });
});
