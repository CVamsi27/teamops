import { useApiQuery } from '../api/useApiQuery';
import { PublicUserSchema } from '@workspace/api';

export function useProfile() {
    return useApiQuery(['profileData'], '/users/me', PublicUserSchema, {
        retry: (failureCount, error: any) => {
            if (error?.message?.includes('Unauthorized') || 
                error?.message?.includes('Data validation failed')) {
                return false;
            }
            return failureCount < 3;
        },
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
}

