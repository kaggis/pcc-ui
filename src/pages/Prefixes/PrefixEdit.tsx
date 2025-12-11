import { useEffect, useState, useTransition } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Prefix } from '@/types/common'
import { PencilIcon, PlusIcon } from '@heroicons/react/16/solid'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import {
  useGetCodelistContract,
  useGetCodelistLookup,
} from '@/api/hooks/codelists'
import { useGetDomains } from '@/api/hooks/domains'
import {
  useGetPrefixById,
  useAddPrefix,
  useUpdatePrefix,
} from '@/api/hooks/prefixes'
import { useGetProviders } from '@/api/hooks/providers'
import { useGetServices } from '@/api/hooks/services'
import { useTranslation } from 'react-i18next'

const PrefixEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate()
  const params = useParams()
  const prefixId = params.id
  const isEditMode = !!prefixId

  // useTransition for batching state updates
  const [, startTransition] = useTransition()

  const [formData, setFormData] = useState<Partial<Prefix>>({
    name: '',
    service_id: 0,
    provider_id: 0,
    domain_id: 0,
    status: 0,
    owner: '',
    contact_name: '',
    contact_email: '',
    used_by: '',
    contract_end: '',
    contract_type_id: 0,
    lookup_service_type_id: 0,
    resolvable: false,
    id: 0,
  })

  const [originalData, setOriginalData] = useState<Partial<Prefix>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch data using react-query hooks
  const { data: providers = [], isLoading: isProvidersLoading } =
    useGetProviders()
  const { data: domains = [], isLoading: isDomainsLoading } = useGetDomains()
  const { data: services = [], isLoading: isServicesLoading } = useGetServices()
  const { data: contract_types = [], isLoading: isContractTypesLoading } =
    useGetCodelistContract()
  const { data: lookup_types = [], isLoading: isLookupTypesLoading } =
    useGetCodelistLookup()

  // Fetch prefix data in edit mode
  const { data: prefixData, isLoading: isPrefixLoading } = useGetPrefixById({
    id: prefixId,
  })

  // Mutations
  const addPrefixMutation = useAddPrefix()
  const updatePrefixMutation = useUpdatePrefix()

  // Initialize form data when in edit mode
  useEffect(() => {
    if (isEditMode && prefixData) {
      const d: Partial<Prefix> = {
        name: prefixData.name,
        service_id: prefixData.service_id || 0,
        provider_id: prefixData.provider_id || 0,
        domain_id: prefixData.domain_id || 0,
        owner: prefixData.owner,
        contact_name: prefixData.contact_name,
        contact_email: prefixData.contact_email,
        contract_end: prefixData.contract_end
          ? prefixData.contract_end.split('T')[0]
          : '',
        contract_type_id: prefixData.contract_type_id || 0,
        used_by: prefixData.used_by || '',
        status: prefixData.status || 0,
        lookup_service_type_id: prefixData.lookup_service_type_id || 0,
        resolvable: prefixData.resolvable || false,
        id: prefixData.id || 0,
      }

      // Batch state updates with useTransition
      startTransition(() => {
        setFormData(d)
        setOriginalData(d)
      })
    }
  }, [prefixData, isEditMode, startTransition])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    const numericFields = [
      'service_id',
      'provider_id',
      'domain_id',
      'status',
      'contract_type_id',
      'lookup_service_type_id',
    ]

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value
    setFormData((prev) => ({
      ...prev,
      contract_end: dateString
        ? new Date(dateString + 'T00:00:00Z').toISOString()
        : '',
    }))
    if (errors.contract_end) {
      setErrors((prev) => ({
        ...prev,
        contract_end: '',
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = formData.name
        ? t("msg_min_length_3")
        : t("msg_name_required")
    }
    if (!formData.owner || formData.owner.trim().length < 3) {
      newErrors.owner = formData.owner
        ? t("msg_min_length_3")
        : t("msg_owner_required")
    }
    if (!formData.contact_name || formData.contact_name.trim().length < 3) {
      newErrors.contact_name = formData.contact_name
        ? t("msg_min_length_3")
        : t("msg_contact_name_required")
    }
    if (!formData.contact_email) {
      newErrors.contact_email = t("msg_contact_email_required")
    } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = t("msg_email_match")
    }
    if (formData.used_by && formData.used_by.trim().length < 3) {
      newErrors.used_by = t("msg_min_length_3")
    }
    if (!formData.provider_id || formData.provider_id === 0) {
      newErrors.provider_id = t("msg_select_provider")
    }
    if (!formData.contract_type_id || formData.contract_type_id === 0) {
      newErrors.contract_type_id = t("msg_select_contract_type")
    }
    if (
      !formData.lookup_service_type_id ||
      formData.lookup_service_type_id === 0
    ) {
      newErrors.lookup_service_type_id = t("msg_select_lookup_type")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (isEditMode) {
      // Edit mode: only send changed fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const changedFields: Record<string, any> = {}
      for (const key in formData) {
        if (
          key in originalData &&
          formData[key as keyof Prefix] !== originalData[key as keyof Prefix]
        ) {
          changedFields[key] = formData[key as keyof Prefix]
        }
      }

      // If no changes, show message

      updatePrefixMutation.mutate(
        {
          id: prefixId!,
          payload: changedFields as Prefix,
        },
        {
          onSuccess: () => {
            setTimeout(() => {
              navigate('/prefixes/')
            }, 2000)
          },
          onError: (error) => {
            console.error(t("msg_update_prefix_error")+':', error)
          },
        },
      )
    } else {
      // Create mode
      const dataToSubmit: Partial<Prefix> = { ...formData }

      // Convert date to ISO string if it exists
      if (
        dataToSubmit.contract_end &&
        typeof dataToSubmit.contract_end === 'object'
      ) {
        dataToSubmit.contract_end = (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dataToSubmit.contract_end as any
        ).toISOString()
      }

      // Remove optional fields with default values
      if (dataToSubmit.service_id === 0) {
        delete dataToSubmit.service_id
      }
      if (dataToSubmit.domain_id === 0) {
        delete dataToSubmit.domain_id
      }

      addPrefixMutation.mutate(dataToSubmit as Prefix, {
        onSuccess: () => {
          setTimeout(() => {
            navigate('/prefixes/')
          }, 2000)
        },
        onError: (error) => {
          console.error(t("msg_add_prefix_error")+":", error)
        },
      })
    }
  }

  // Show loading state in edit mode
  if (isEditMode && isPrefixLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t("loading")}...</div>
      </div>
    )
  }

  const isSubmitting =
    (isEditMode && updatePrefixMutation.isPending) ||
    (!isEditMode && addPrefixMutation.isPending)

  return (
    <div className="min-h-screen bg-gray-50">
      <form onSubmit={onFormSubmit}>
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              {isEditMode ? (
                <>
                  <PencilIcon className="size-6" />
                  <span>{t("lbl_update_prefix")}</span>
                </>
              ) : (
                <>
                  <PlusIcon className="size-6" />
                    <span>{t("lbl_create_prefix")}</span>
                </>
              )}
            </h2>
            <p className="text-gray-500">
              <span className="text-red-500 font-bold">*</span>{t("msg_indicates_req")}
            </p>
          </div>

          {/* Prefix Details Section */}
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
              Prefix Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label
                    htmlFor="prefixName"
                    className="block text-sm font-bold text-gray-900"
                  >
                    <span className="text-red-500">*</span>
                    {t("lbl_name")}
                  </label>
                  <div className="group relative">
                    <span className="text-gray-400 cursor-help">
                      <InformationCircleIcon className="size-4 text-muted" />
                    </span>
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 bottom-full left-0 mb-2 w-48 z-10">
                      {t("tip_prefix_name")}
                    </div>
                  </div>
                </div>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  id="prefixName"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label
                    htmlFor="owner"
                    className="block text-sm font-bold text-gray-900"
                  >
                    <span className="text-red-500">*</span>
                    {t("lbl_owner")}
                  </label>
                  <div className="group relative">
                    <span className="text-gray-400 cursor-help">
                      <InformationCircleIcon className="size-4 text-muted" />
                    </span>
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 bottom-full left-0 mb-2 w-48 z-10">
                     {t("tip_owner")}
                    </div>
                  </div>
                </div>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.owner
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  id="owner"
                  name="owner"
                  value={formData.owner || ''}
                  onChange={handleInputChange}
                />
                {errors.owner && (
                  <p className="text-red-500 text-sm mt-1">{errors.owner}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label
                    htmlFor="prefixContactName"
                    className="block text-sm font-bold text-gray-900"
                  >
                    <span className="text-red-500">*</span>
                    {t("lbl_contact_name")}
                  </label>
                  <div className="group relative">
                    <span className="text-gray-400 cursor-help">
                      <InformationCircleIcon className="size-4 text-muted" />
                    </span>
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 bottom-full left-0 mb-2 w-48 z-10">
                     {t("tip_contact_name")}
                    </div>
                  </div>
                </div>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.contact_name
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  id="prefixContactName"
                  name="contact_name"
                  value={formData.contact_name || ''}
                  onChange={handleInputChange}
                />
                {errors.contact_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.contact_name}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label
                    htmlFor="prefixContactEmail"
                    className="block text-sm font-bold text-gray-900"
                  >
                    <span className="text-red-500">*</span>
                   {t("lbl_contact_email")}
                  </label>
                  <div className="group relative">
                    <span className="text-gray-400 cursor-help">
                      <InformationCircleIcon className="size-4 text-muted" />
                    </span>
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 bottom-full left-0 mb-2 w-48 z-10">
                     {t("tip_contact_email")}
                    </div>
                  </div>
                </div>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.contact_email
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  id="prefixContactEmail"
                  name="contact_email"
                  value={formData.contact_email || ''}
                  onChange={handleInputChange}
                />
                {errors.contact_email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.contact_email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label
                  htmlFor="usedBy"
                  className="block text-sm font-bold text-gray-900"
                >
                  {t("lbl_used_by")}
                </label>
                <div className="group relative">
                  <span className="text-gray-400 cursor-help">
                    <InformationCircleIcon className="size-4 text-muted" />
                  </span>
                  <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 bottom-full left-0 mb-2 w-48 z-10">
                   {t("tip_used_by")}
                  </div>
                </div>
              </div>
              <input
                type="text"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.used_by
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
                id="usedBy"
                name="used_by"
                value={formData.used_by || ''}
                onChange={handleInputChange}
              />
              {errors.used_by && (
                <p className="text-red-500 text-sm mt-1">{errors.used_by}</p>
              )}
            </div>
          </div>

          {/* Service Specific Information Section */}
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
              {t("msg_service_specific")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label
                    htmlFor="providerID"
                    className="block text-sm font-bold text-gray-900"
                  >
                    <span className="text-red-500">*</span>
                    {t("lbl_provider")}
                  </label>
                  <div className="group relative">
                    <span className="text-gray-400 cursor-help">
                      <InformationCircleIcon className="size-4 text-muted" />
                    </span>
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 bottom-full left-0 mb-2 w-48 z-10">
                      {t("tip_provider")}
                    </div>
                  </div>
                </div>
                <select
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.provider_id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  id="providerID"
                  name="provider_id"
                  value={formData.provider_id || ''}
                  onChange={handleInputChange}
                  disabled={isProvidersLoading}
                >
                  <option value="">
                    {isProvidersLoading ? t("lbl_loading") : t("lbl_select_provider")}
                  </option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
                {errors.provider_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {t("tip_provider") + errors.provider_id}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label
                    htmlFor="serviceID"
                    className="block text-sm font-bold text-gray-900"
                  >
                    {t("lbl_service")}
                  </label>
                  <div className="group relative">
                    <span className="text-gray-400 cursor-help">
                      <InformationCircleIcon className="size-4 text-muted" />
                    </span>
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 bottom-full left-0 mb-2 w-48 z-10">
                      {t("tip_service")}
                    </div>
                  </div>
                </div>
                <select
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.service_id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  id="serviceID"
                  name="service_id"
                  value={formData.service_id || ''}
                  onChange={handleInputChange}
                  disabled={isServicesLoading}
                >
                  <option value="">
                    {isServicesLoading ? t("lbl_loading") : t("lbl_select_service")}
                  </option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
                {errors.service_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {t("msg_must_select_service")}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label
                    htmlFor="domainID"
                    className="block text-sm font-bold text-gray-900"
                  >
                    {t("lbl_domain")}
                  </label>
                  <div className="group relative">
                    <span className="text-gray-400 cursor-help">
                      <InformationCircleIcon className="size-4 text-muted" />
                    </span>
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 bottom-full left-0 mb-2 w-48 z-10">
                      {t("tip_domain")}
                    </div>
                  </div>
                </div>
                <select
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.domain_id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  id="domainID"
                  name="domain_id"
                  value={formData.domain_id || ''}
                  onChange={handleInputChange}
                  disabled={isDomainsLoading}
                >
                  <option value="">
                    {isDomainsLoading ? t("lbl_loading") : t("lbl_select_domain")}
                  </option>
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.name}
                    </option>
                  ))}
                </select>
                {errors.domain_id && (
                  <p className="text-red-500 text-sm mt-1">
                     {t("msg_must_select_domain")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contract Details Section */}
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
              {t("lbl_contract_details")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label
                    htmlFor="prefixContractType"
                    className="block text-sm font-bold text-gray-900"
                  >
                    <span className="text-red-500">*</span>
                    {t("lbl_contract_type")}
                  </label>
                  <div className="group relative">
                    <span className="text-gray-400 cursor-help">
                      <InformationCircleIcon className="size-4 text-muted" />
                    </span>
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 bottom-full left-0 mb-2 w-48 z-10">
                      {t("tip_contract_type")}
                    </div>
                  </div>
                </div>
                <select
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.contract_type_id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  id="prefixContractType"
                  name="contract_type_id"
                  value={formData.contract_type_id || ''}
                  onChange={handleInputChange}
                  disabled={isContractTypesLoading}
                >
                  <option value="">
                    {isContractTypesLoading
                      ?  t("lbl_loading")
                      :  t("lbl_select_contract_type")}
                  </option>
                  {contract_types.map((contract) => (
                    <option key={contract.id} value={contract.id}>
                      {contract.name}
                    </option>
                  ))}
                </select>
                {errors.contract_type_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {t("lbl_contract_type") + errors.contract_type_id}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label
                    htmlFor="lookupServiceType"
                    className="block text-sm font-bold text-gray-900"
                  >
                    <span className="text-red-500">*</span>
                    {t("lbl_lookup_type")}
                  </label>
                  <div className="group relative">
                    <span className="text-gray-400 cursor-help">
                      <InformationCircleIcon className="size-4 text-muted" />
                    </span>
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 bottom-full left-0 mb-2 w-48 z-10">
                      {t("tip_lookup_type")}
                    </div>
                  </div>
                </div>
                <select
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lookup_service_type_id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  id="lookupServiceType"
                  name="lookup_service_type_id"
                  value={formData.lookup_service_type_id || ''}
                  onChange={handleInputChange}
                  disabled={isLookupTypesLoading}
                >
                  <option value="">
                    {isLookupTypesLoading ? t("lbl_lookup_type") : t("lbl_select_lookup_type")}
                  </option>
                  {lookup_types.map((lookup) => (
                    <option key={lookup.id} value={lookup.id}>
                      {lookup.name}
                    </option>
                  ))}
                </select>
                {errors.lookup_service_type_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {t("lbl_lookup_type") +
                      errors.lookup_service_type_id}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label
                    htmlFor="prefixContractEndDate"
                    className="block text-sm font-bold text-gray-900"
                  >
                    {t("lbl_contract_end_date")}
                  </label>
                  <div className="group relative">
                    <span className="text-gray-400 cursor-help">
                      <InformationCircleIcon className="size-4 text-muted" />
                    </span>
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 bottom-full left-0 mb-2 w-48 z-10">
                     {t("tip_contract_end_date")}
                    </div>
                  </div>
                </div>
                <input
                  type="date"
                  id="prefixContractEndDate"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.contract_end
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  onChange={handleDateChange}
                  value={
                    formData.contract_end
                      ? formData.contract_end.split('T')[0]
                      : ''
                  }
                />
                {errors.contract_end && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.contract_end}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label
                    htmlFor="status"
                    className="block text-sm font-bold text-gray-900"
                  >
                     {t("lbl_status")}
                  </label>
                  <div className="group relative">
                    <span className="text-gray-400 cursor-help">
                      <InformationCircleIcon className="size-4 text-muted" />
                    </span>
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 bottom-full left-0 mb-2 w-48 z-10">
                      {t("tip_status")}
                    </div>
                  </div>
                </div>
                <select
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.status
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  id="status"
                  name="status"
                  value={formData.status || ''}
                  onChange={handleInputChange}
                >
                  <option value="">{t("lbl_select_status")}</option>
                  <option value="1">{t("lbl_exists")}</option>
                  <option value="0">{t("lbl_missing")}</option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">
                    {t("lbl_select_status")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white font-semibold rounded-lg transition cursor-pointer"
            >
              {isSubmitting
                ? isEditMode
                  ? t("btn_updating")
                  : t("btn_creating")
                : isEditMode
                  ? t("btn_update")
                  : t("btn_create")}
            </button>
            <button
              type="button"
              onClick={() => navigate('/prefixes/')}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition cursor-pointer"
            >
              {t("btn_back")}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default PrefixEdit