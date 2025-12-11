/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGetReverseLookupFilters, useReverseLookup } from '@/api/hooks/lookup'
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid'
import React from 'react'
import { useState, useMemo } from 'react'
import DataTable from 'react-data-table-component'
import { useTranslation } from 'react-i18next'

const customStyles = {
  headCells: {
    style: {
      color: '#202124',
      fontSize: '18px',
      backgroundColor: '#F4F6F8',
    },
  },
  rows: {
    style: {
      fontSize: '16px',
    },
    highlightOnHoverStyle: {
      backgroundColor: 'rgb(199,218,255)',
      borderBottomColor: '#FFFFFF',
      borderRadius: '10px',
      outline: '1px solid #FFFFFF',
    },
  },
}

const ExpandedComponent = ({ data }: { data: any }) => {
  const additionalData = data.values.filter((item: any) => item.type !== 'URL')

  return (
    <div className="m-4 text-base">
      {additionalData.map((item: any, index: number) => (
        <div key={index}>
          <pre className="text-xs overflow-auto bg-gray-100 p-2 rounded">
            {JSON.stringify(item.type, null, 2)}:
            {JSON.stringify(item.value, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  )
}

interface FilterFormState {
  [key: string]: string
}

const PrefixLookup = () => {
  const { t } = useTranslation();
  const { data: filters = [] } = useGetReverseLookupFilters()
  const reverseLookupMutation = useReverseLookup()

  const [pageIndex] = useState(0)
  const [pageSize] = useState(10)
  const [handles, setHandles] = useState<any[]>([])
  const [formState, setFormState] = useState<FilterFormState>({})
  const [checksumType, setChecksumType] = useState('CHECKSUM')

  // Initialize form state when filters load
  React.useEffect(() => {
    const initialState: FilterFormState = {}
    if (filters && filters.length > 0) {
      filters.forEach((f) => {
        if (f === 'RETRIEVE_RECORDS') {
          initialState[f] = 'false'
        } else if (f !== 'EMAIL') {
          initialState[f] = ''
        }
      })
    }
    initialState['checksum-option'] = 'CHECKSUM'
    initialState['checksum-value'] = ''
    setFormState(initialState)
  }, [filters])

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const handleChecksumTypeChange = (value: string) => {
    setChecksumType(value)
    handleFieldChange('checksum-option', value)
  }

  const handleChecksumValueChange = (value: string) => {
    handleFieldChange('checksum-value', value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = { ...formState }

    // Handle Checksum
    data['CHECKSUM'] = ''
    data['EUDAT_CHECKSUM'] = ''
    data[checksumType] = data['checksum-value'] || ''
    delete data['checksum-option']
    delete data['checksum-value']

    // FIXME: Workaround for the LOC filter. Move its value to URL filter and parse response
    let tmp = false
    if (data['LOC'] !== '') {
      data['URL'] = data['LOC']
      data['LOC'] = ''
      tmp = true
    }

    reverseLookupMutation.mutate(
      {
        pageIndex,
        pageSize,
        payload: { filters: data },
      },
      {
        onSuccess: (response) => {
          const flattenedHandles = response.data
          if (tmp) {
            const filtered = flattenedHandles.filter((r: any) =>
              r.values.some((v: any) => v['10320/LOC'] !== undefined),
            )
            setHandles(filtered)
          } else {
            setHandles(flattenedHandles)
          }

          // Reset LOC filter
          if (tmp) {
            const v = data['URL']
            data['URL'] = ''
            data['LOC'] = v
          }
        },
      },
    )
  }

  const handleClear = () => {
    const clearedState: FilterFormState = {}
    if (filters && filters.length > 0) {
      filters.forEach((f) => {
        if (f === 'RETRIEVE_RECORDS') {
          clearedState[f] = 'false'
        } else if (f !== 'EMAIL') {
          clearedState[f] = ''
        }
      })
    }
    clearedState['checksum-option'] = 'CHECKSUM'
    clearedState['checksum-value'] = ''
    setFormState(clearedState)
    setChecksumType('CHECKSUM')
    setHandles([])
  }

  const checksumOptions = filters.filter(
    (f) => f === 'CHECKSUM' || f === 'EUDAT_CHECKSUM',
  )

  const displayFilters = filters.filter(
    (f) => f !== 'CHECKSUM' && f !== 'EUDAT_CHECKSUM' && f !== 'EMAIL',
  )

  const columnsDetailed = useMemo(
    () => [
      {
        name: t("lbl_handle"),
        selector: (row: any) => row.handle,
        sortable: false,
        width: '500px',
      },
      {
        name: t("lbl_url"),
        selector: (row: any) => {
          const urlValue = row.values.find((item: any) => item.type === 'URL')
          return urlValue ? urlValue.value : ''
        },
        sortable: false,
      },
      {
        name: t("lbl_metadata"),
        cell: () => t("lbl_click_to_expand"),
        sortable: false,
        width: '200px',
      },
    ],
    [t],
  )

  const columns = useMemo(
    () => [
      {
        name: t("lbl_handle"),
        selector: (row: any) => row.handle,
        sortable: false,
      },
    ],
    [t],
  )

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col">
        <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <MagnifyingGlassIcon className="size-6 text-amber-500" />
          <span>{t("lbl_lookup")}</span>
        </h2>
        {filters && filters.length > 0 && (
          <>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4 bg-gray-100 p-4 shadow rounded">
                {displayFilters.map((f, i) => {
                  if (f === 'RETRIEVE_RECORDS') {
                    return (
                      <div key={`filter-div-${i}`} className="grid grid-cols-12 gap-4 items-start">
                        <label className="col-span-2 text-sm font-bold text-gray-900">
                          {f
                            .split('_')
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase(),
                            )
                            .join(' ')}
                        </label>
                        <div className="col-span-2">
                          <select
                            className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formState[f] || 'false'}
                            onChange={(e) =>
                              handleFieldChange(f, e.target.value)
                            }
                          >
                            <option value="true">True</option>
                            <option value="false">False</option>
                          </select>
                        </div>
                        <div className="col-span-8 text-sm text-gray-600">
                          {t("tip_retrieve_records")}
                        </div>
                      </div>
                    )
                  } else {
                    return (
                      <div key={`filter-div-${i}`} className="grid grid-cols-12 gap-4 items-start">
                        <label className="col-span-2 text-sm font-bold text-gray-900">
                          {f
                            .split('_')
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase(),
                            )
                            .join(' ')}
                        </label>
                        <div className="col-span-10">
                          <input
                            id={`formik-field-id-${f}`}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formState[f] || ''}
                            onChange={(e) =>
                              handleFieldChange(f, e.target.value)
                            }
                          />
                        </div>
                      </div>
                    )
                  }
                })}

                {checksumOptions.length > 0 && (
                  <div className="grid grid-cols-12 gap-4 items-start">
                    <label className="col-span-2 text-sm font-bold text-gray-900">
                      {t("lbl_checksum")}
                    </label>
                    <div className="col-span-4">
                      <select
                        id="formik-field-id-checksum-option"
                        className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={checksumType}
                        onChange={(e) =>
                          handleChecksumTypeChange(e.target.value)
                        }
                      >
                        {checksumOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-6">
                      <input
                        id="formik-field-id-checksum"
                        type="text"
                        className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formState['checksum-value'] || ''}
                        onChange={(e) =>
                          handleChecksumValueChange(e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="submit"
                  disabled={reverseLookupMutation.isPending}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-medium rounded-md transition-colors cursor-pointer"
                >
                  {reverseLookupMutation.isPending ? t("btn_searching") : t("btn_submit")}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium rounded-md transition-colors cursor-pointer"
                >
                  {t("btn_clear")}
                </button>
              </div>

              {reverseLookupMutation.isError && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                  <p className="text-sm font-medium text-red-800">
                    {t("msg_err_fetch_results")}
                  </p>
                </div>
              )}
            </form>

            <DataTable
              data={handles}
              defaultSortFieldId={1}
              theme="default"
              customStyles={customStyles}
              highlightOnHover
              pointerOnHover
              pagination
              {...(handles && handles.length > 0 && handles[0].values.length > 1
                ? {
                    columns: columnsDetailed,
                    expandableRows: true,
                    expandOnRowClicked: true,
                    expandableRowsComponent: ExpandedComponent,
                  }
                : {
                    columns: columns,
                  })}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default PrefixLookup