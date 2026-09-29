import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useApiQuery = (key, fetcher, options = {}) => {
  return useQuery({
    queryKey: key,
    queryFn: fetcher,
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
    ...options,
  });
};

export const useApiMutation = (fetcher, options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fetcher,
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
    ...options,
  });
};

export const useApi = () => {
  return { useApiQuery, useApiMutation };
};
