import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePetDetails } from './usePetDetails';
import { usePetFacade } from '../../facades/pet.facade';
import { useParams } from 'react-router-dom';
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { Pet } from '../../types/pet.types';

vi.mock('../../facades/pet.facade');
vi.mock('react-router-dom', () => ({
  useParams: vi.fn()
}));



describe('usePetDetails', () => {
  const mockUsePet = vi.fn();

  beforeEach(() => {
    vi.mocked(usePetFacade).mockReturnValue({
      usePet: mockUsePet,
      usePets: vi.fn(),
      createPet: vi.fn(),
      updatePet: vi.fn(),
      deletePet: vi.fn(),
      isCreating: false,
      isUpdating: false,
      isDeleting: false
    });
  });

  it('should return pet data when id is present', () => {
    vi.mocked(useParams).mockReturnValue({ id: '1' });
    
    const petData: Pet = { id: 1, name: 'Rex' };
    mockUsePet.mockReturnValue({
      data: petData,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    const { result } = renderHook(() => usePetDetails());

    expect(result.current.pet).toEqual(petData);
    expect(result.current.isLoading).toBe(false);
  });

  it('should set notFound when API returns 404', () => {
    vi.mocked(useParams).mockReturnValue({ id: '999' });
    
    const error404 = new AxiosError('Not Found');
    error404.response = {
      status: 404,
      data: {},
      statusText: 'Not Found',
      headers: {},
      config: {} as InternalAxiosRequestConfig
    } as AxiosResponse;

    mockUsePet.mockReturnValue({
      data: null,
      isLoading: false,
      error: error404,
      refetch: vi.fn()
    });

    const { result } = renderHook(() => usePetDetails());

    expect(result.current.notFound).toBe(true);
  });
});
