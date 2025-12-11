import { Link, useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import DataTable from 'react-data-table-component'
import type { CodeListItem, Prefix, TableItem } from '@/types/common'
import {
  ChartBarIcon,
  ListBulletIcon,
  PencilIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
} from '@heroicons/react/16/solid'

import { useGetCodelistContract } from '@/api/hooks/codelists'
import { useGetDomains } from '@/api/hooks/domains'
import { useGetAllPrefixes } from '@/api/hooks/prefixes'
import { useGetProviders } from '@/api/hooks/providers'
import { useTranslation } from 'react-i18next'

const customStyles = {
  headCells: {
    style: {
      color: '#202124',
      fontSize: '16px',
      backgroundColor: '#F4F6F8',
      fontWeight: '600',
    },
  },
  rows: {
    style: {
      fontSize: '14px',
      minHeight: '50px',
    },
    highlightOnHoverStyle: {
      backgroundColor: '#EFF6FF',
      borderBottomColor: '#FFFFFF',
      borderRadius: '8px',
    },
  },
  pagination: {
    style: {
      borderTopColor: '#E5E7EB',
    },
  },
}

interface SubHeaderProps {
  filterText: string
  setFilterText: (value: string) => void
  filterDomains: string
  setFilterDomains: (value: string) => void
  filterContactType: string
  setFilterContactType: (value: string) => void
  domainsData: TableItem[]
  contractTypesData: CodeListItem[]
  isDomainsLoading: boolean
  isContractTypesLoading: boolean
  onClearFilters: () => void
}

const SubHeaderComponent = ({
  filterText,
  setFilterText,
  filterDomains,
  setFilterDomains,
  filterContactType,
  setFilterContactType,
  domainsData,
  contractTypesData,
  isDomainsLoading,
  isContractTypesLoading,
  onClearFilters,
}: SubHeaderProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
        <div className="md:col-span-3">
          <select
            id="domainSelection"
            className="select select-bordered w-full"
            onChange={(e) => setFilterDomains(e.target.value)}
            disabled={isDomainsLoading}
            value={filterDomains}
          >
            <option value="">
              {isDomainsLoading ? t("lbl_loading_domains") : t("lbl_select_domain")}
            </option>
            {domainsData.length > 0 &&
              domainsData.map((domain) => (
                <option key={domain.id} value={domain.name}>
                  {domain.name}
                </option>
              ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            id="contractSelection"
            className="select select-bordered w-full"
            onChange={(e) => setFilterContactType(e.target.value)}
            disabled={isContractTypesLoading}
            value={filterContactType}
          >
            <option value="">
              {isContractTypesLoading
                ? t("lbl_loading_contracts") 
                : t("lbl_select_contract")}
            </option>
            {contractTypesData.length > 0 &&
              contractTypesData.map((contract) => (
                <option key={contract.id} value={contract.name}>
                  {contract.name}
                </option>
              ))}
          </select>
        </div>

        <div className="md:col-span-4">
          <input
            id="searchField"
            type="text"
            placeholder={t("lbl_search")}
            className="input input-bordered w-full"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <button
            onClick={onClearFilters}
            className="btn btn-outline w-full"
          >
            {t("btn_clear")}
          </button>
        </div>
      </div>
    </div>
  )
}

const Prefixes = () => {
  const { t } = useTranslation();
  const navigate = useNavigate()

  // State for filters
  const [filterText, setFilterText] = useState('')
  const [filterProvider, setFilterProvider] = useState('')
  const [filterDomains, setFilterDomains] = useState('')
  const [filterContactType, setFilterContactType] = useState('')
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false)
  const [activeProvider, setActiveProvider] = useState('')

  // Fetch data using react-query hooks
  const { data: domainsData = [], isLoading: isDomainsLoading } =
    useGetDomains()
  const { data: providersData = [], isLoading: isProvidersLoading } =
    useGetProviders()
  const { data: contractTypesData = [], isLoading: isContractTypesLoading } =
    useGetCodelistContract()

  // Fetch all prefixes with infinite query
  const {
    data: prefixesData,
    isLoading: isPrefixesLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetAllPrefixes()

  // Auto-load all pages
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && prefixesData) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, prefixesData])

  // Flatten all pages from infinite query
  const allPrefixes = useMemo(() => {
    if (!prefixesData?.pages) return []
    return prefixesData.pages.flatMap((page) => page.content || [])
  }, [prefixesData])

  // Filter prefixes
  const filteredPrefixesByProvider = useMemo(
    () =>
      allPrefixes.filter(
        (item) =>
          !filterProvider ||
          (item.provider_name &&
            item.provider_name
              .toLowerCase()
              .includes(filterProvider.toLowerCase())),
      ),
    [allPrefixes, filterProvider],
  )

  const filteredPrefixes = useMemo(
    () =>
      filteredPrefixesByProvider.filter((item) => {
        return (
          (!filterDomains || item.domain_name === filterDomains) &&
          (!filterContactType ||
            item.contract_type_name === filterContactType) &&
          Object.values(item).some(
            (value) =>
              value &&
              typeof value === 'string' &&
              value.toLowerCase().includes(filterText.toLowerCase()),
          )
        )
      }),
    [filteredPrefixesByProvider, filterText, filterDomains, filterContactType],
  )

  const handleClearFilters = () => {
    setResetPaginationToggle(!resetPaginationToggle)
    setFilterText('')
    setFilterDomains('')
    setFilterContactType('')
    setFilterProvider('')
    setActiveProvider('')
    const domainSelect = document.getElementById(
      'domainSelection',
    ) as HTMLSelectElement
    const contractSelect = document.getElementById(
      'contractSelection',
    ) as HTMLSelectElement
    if (domainSelect) domainSelect.selectedIndex = 0
    if (contractSelect) contractSelect.selectedIndex = 0
  }

  const columns = [
    {
      name: t("lbl_name"),
      selector: (row: Prefix) => row.name,
      sortable: true,
      width: '25%',
      cell: (row: Prefix) => (
        <div className="flex items-center gap-3 py-2">
          <div className="text-2xl">📦</div>
          <div>
            <div className="font-semibold text-gray-900">{row.name}</div>
            <div className="text-xs text-gray-500">by: {row.provider_name}</div>
          </div>
        </div>
      ),
    },
    {
      name: t("lbl_owner"),
      selector: (row: Prefix) => row.owner,
      sortable: true,
      width: '20%',
    },
    {
      name: t("lbl_domain"),
      selector: (row: Prefix) => row.domain_name,
      sortable: true,
      width: '20%',
    },
    {
      name: t("lbl_contract_type"),
      selector: (row: Prefix) => row.contract_type_name,
      sortable: true,
      width: '20%',
    },
    {
      name: t("lbl_actions"),
      width: '15%',
      cell: (row: Prefix) => (
        <div className="flex items-center gap-2">
          <div className="tooltip" data-tip={t("tip_view_details")}>
            <Link
              to={`/prefixes/${row.id}`}
              className="btn btn-sm btn-ghost text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
            >
              <ListBulletIcon className="size-4" />
            </Link>
          </div>
          <div className="tooltip" data-tip={t("tip_update_prefix")}>
            <Link
              to={`/prefixes/${row.id}/update`}
              className="btn btn-sm btn-ghost text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
              title="Update Prefix"
            >
              <PencilIcon className="size-4" />
            </Link>
          </div>
          <div className="tooltip" data-tip={t("tip_delete_prefix")}>
            <Link
              to={`/prefixes/${row.id}/delete`}
              className="btn btn-sm btn-ghost text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
              title="Delete Prefix"
            >
              <TrashIcon className="size-4" />
            </Link>
          </div>
          <div className="tooltip" data-tip={t("tip_edit_stats")}>
            <Link
              to={`/prefixes/editstatistics/${row.name}`}
              className="btn btn-sm btn-ghost text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
              title="Edit Statistics"
            >
              <ChartBarIcon className="size-4" />
            </Link>
          </div>
        </div>
      ),
    },
  ]



  const isLoading =
    isPrefixesLoading ||
    isDomainsLoading ||
    isProvidersLoading ||
    isFetchingNextPage

  return (
    <div className="min-h-screen">
      <div>
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl text-gray-900 flex items-center gap-3">
            <TagIcon className="size-8 text-amber-500" />
            <span>{t("lbl_prefix_list")}</span>
          </h1>
          <button
            onClick={() => navigate('/prefixes/add')}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white font-semibold rounded-lg transition cursor-pointer"
          >
            <div className="flex flex-row align-middle">
              <PlusIcon className="size-6 me-2" />
              <span>{t("btn_create_new")}</span>
            </div>
          </button>
        </div>

        {/* Provider Tabs */}
        <div>
          <div className="tabs tabs-lift tabs-xl">
            <input
              type="radio"
              name="provider_tabs"
              className="tab"
              aria-label="ALL"
              checked={activeProvider === ''}
              onChange={() => {
                setFilterProvider('')
                setActiveProvider('')
              }}
            />
            {providersData.map((provider) => (
              <input
                key={provider.id}
                type="radio"
                name="provider_tabs"
                className="tab"
                aria-label={provider.name}
                checked={activeProvider === provider.name}
                onChange={() => {
                  setFilterProvider(provider.name)
                  setActiveProvider(provider.name)
                }}
              />
            ))}
          </div>
        </div>

        {/* Filters and Table */}
        <div className="bg-white p-4">
          <SubHeaderComponent
            filterText={filterText}
            setFilterText={setFilterText}
            filterDomains={filterDomains}
            setFilterDomains={setFilterDomains}
            filterContactType={filterContactType}
            setFilterContactType={setFilterContactType}
            domainsData={domainsData}
            contractTypesData={contractTypesData}
            isDomainsLoading={isDomainsLoading}
            isContractTypesLoading={isContractTypesLoading}
            onClearFilters={handleClearFilters}
          />

          {domainsData.length > 0 && (
            <>
              <DataTable
                columns={columns}
                data={filteredPrefixes}
                defaultSortFieldId={1}
                theme="default"
                customStyles={customStyles}
                highlightOnHover
                pointerOnHover
                pagination
                paginationResetDefaultPage={resetPaginationToggle}
                progressPending={isFetchingNextPage}
              />

              {filteredPrefixes.length === 0 && !isFetchingNextPage && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {t("msg_no_prefix_match")}
                  </p>
                </div>
              )}
            </>
          )}

          {domainsData.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{t("msg_no_data")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { Prefixes }