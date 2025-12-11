export interface TableItem {
  id: number
  name: string
  description: string
  status: 'active' | 'inactive'
}

export interface Prefix {
  name: string
  owner: string
  status: number
  id: number
  used_by?: string
  contract_end: string
  service_id?: number
  domain_id?: number
  provider_id: number
  resolvable: boolean
  contact_name: string
  contact_email: string
  contract_type_id: number
  lookup_service_type_id: number
  service_name: string
  domain_name: string
  provider_name: string
  contract_type_name: string
  lookup_service_type_name: string
}

export interface PrefixStats {
  prefix: string
  handles_count: number
  resolvable_count: number
  unresolvable_count: number
  unchecked_count: number
}

export interface CodeListItem {
  id: number
  name: string
  category: string
}

export interface ApiResponsePaged<T> {
  content: T[]
  links: Array<{
    rel: string
    href: string
  }>
}

export type ApiResponseErr = {
  code: string
  message: string
}
