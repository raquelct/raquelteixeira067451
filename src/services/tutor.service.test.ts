import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tutorService } from './tutor.service';
import apiClient from './api';
import MockAdapter from 'axios-mock-adapter';
import type { TutorApiDto, TutorListApiResponse, Tutor, CreateTutorDto } from '../types/tutor.types';

describe('TutorService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.reset();
  });

  const getBaseUrlRegex = (path: string = '') => new RegExp(`/v1/tutores${path}(\\?.*)?`);

  describe('getAll', () => {
    it('should fetch tutors and transform them', async () => {
      const apiResponse: TutorListApiResponse = {
        content: [
          {
            id: 1,
            nome: 'João Silva',
            email: 'john@example.com',
            telefone: '11999999999',
            endereco: 'Street 1',
            cpf: '12345678900',
            foto: { url: 'http://example.com/john.jpg', id: 10 },
            pets: []
          }
        ],
        page: 0,
        size: 20,
        total: 1,
        pageCount: 1
      };

      mock.onGet(getBaseUrlRegex()).reply(200, apiResponse);

      const result = await tutorService.getAll();
      const tutor: Tutor = result.content[0];

      expect(tutor.id).toBe(1);
      expect(tutor.name).toBe('João Silva');
      expect(tutor.photo).toBe('http://example.com/john.jpg');
    });
  });

  describe('create', () => {
    it('should create tutor', async () => {
      const newTutor: CreateTutorDto = {
        nome: 'João Silva',
        email: 'jane@example.com',
        telefone: '11888888888',
        endereco: 'Street 2',
        cpf: '00987654321'
      };
      const apiResponse: TutorApiDto = { ...newTutor, id: 2, pets: [] };

      mock.onPost('/v1/tutores').reply(200, apiResponse);

      const result = await tutorService.create(newTutor);

      expect(result.id).toBe(2);
      expect(result.name).toBe('João Silva');
    });
  });
});
