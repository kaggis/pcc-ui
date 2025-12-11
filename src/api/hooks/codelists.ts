import { useQuery } from '@tanstack/react-query'
import { APIClient } from '@/api/client'
import type { CodeListItem } from '@/types/common'

export const useGetCodelist = () =>
  useQuery({
    queryKey: ['codelist'],
    queryFn: async () => {
      const response = await APIClient().get<CodeListItem[]>('/codelist')
      return response.data
    },
  })

export const useGetCodelistByCategory = ({ category }: { category?: string }) =>
  useQuery({
    queryKey: ['codelist', category],
    queryFn: async () => {
      const response = await APIClient().get<CodeListItem[]>(
        `/codelist?category=${category}`,
      )
      return response.data
    },
    enabled: !!category,
  })

export const useGetCodelistLookup = () =>
  useQuery({
    queryKey: ['codelist-lookup'],
    queryFn: async () => {
      const response = await APIClient().get<CodeListItem[]>(
        '/codelist?category=lookup_service_type',
      )
      return response.data
    },
  })

export const useGetCodelistContract = () =>
  useQuery({
    queryKey: ['codelist-contract'],
    queryFn: async () => {
      const response = await APIClient().get<CodeListItem[]>(
        '/codelist?category=contract_type',
      )
      return response.data
    },
  })
