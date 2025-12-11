import { useEffect, useState, useTransition } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { PrefixStats } from '@/types/common'
import {
  useGetStatisticsByPrefixId,
  useUpdateStatisticsByPrefixId,
} from '@/api/hooks/prefixes'
import { useTranslation } from 'react-i18next'
import { InformationCircleIcon } from '@heroicons/react/16/solid'

const PrefixEditStats = () => {
  const { t } = useTranslation();
  const params = useParams()
  const navigate = useNavigate()
  const prefixId = params.id

  // useTransition for batching state updates
  const [, startTransition] = useTransition()

  const [prefixStatistics, setPrefixStatistics] = useState<PrefixStats>({
    prefix: '',
    handles_count: 0,
    resolvable_count: 0,
    unresolvable_count: 0,
    unchecked_count: 0,
  })

  const [originalStats, setOriginalStats] = useState<PrefixStats>({
    prefix: '',
    handles_count: 0,
    resolvable_count: 0,
    unresolvable_count: 0,
    unchecked_count: 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  

  // Fetch statistics data
  const {
    data: statsData,
    isLoading: isStatsLoading
  } = useGetStatisticsByPrefixId({
    id: prefixId,
  })

  // Update statistics mutation
  const updateStatsMutation = useUpdateStatisticsByPrefixId()

  // Initialize statistics when data is fetched
  useEffect(() => {
    if (statsData) {
      const stats: PrefixStats = {
        prefix: statsData?.prefix || '',
        handles_count: parseInt(statsData.handles_count?.toString() || '0', 10),
        resolvable_count: parseInt(
          statsData.resolvable_count?.toString() || '0',
          10,
        ),
        unresolvable_count: parseInt(
          statsData.unresolvable_count?.toString() || '0',
          10,
        ),
        unchecked_count: parseInt(
          statsData.unchecked_count?.toString() || '0',
          10,
        ),
      }

      // Batch state updates with useTransition
      startTransition(() => {
        setPrefixStatistics(stats)
        setOriginalStats(stats)
      })
    }
  }, [statsData, startTransition])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numValue = value === '' ? 0 : parseInt(value, 10)

    if (isNaN(numValue) || numValue < 0) {
      return
    }

    setPrefixStatistics((prev) => ({
      ...prev,
      [name]: numValue,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (prefixStatistics.handles_count < 0) {
      newErrors.handles_count = 'Must be a positive number'
    }
    if (prefixStatistics.resolvable_count < 0) {
      newErrors.resolvable_count = 'Must be a positive number'
    }
    if (prefixStatistics.unresolvable_count < 0) {
      newErrors.unresolvable_count = 'Must be a positive number'
    }
    if (prefixStatistics.unchecked_count < 0) {
      newErrors.unchecked_count = 'Must be a positive number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Check if there are any changes
    const hasChanges =
      prefixStatistics.handles_count !== originalStats.handles_count ||
      prefixStatistics.resolvable_count !== originalStats.resolvable_count ||
      prefixStatistics.unresolvable_count !==
        originalStats.unresolvable_count ||
      prefixStatistics.unchecked_count !== originalStats.unchecked_count

    if (!hasChanges) {
      return
    }

    const stats: Partial<PrefixStats> = {
      handles_count: prefixStatistics.handles_count,
      resolvable_count: prefixStatistics.resolvable_count,
      unresolvable_count: prefixStatistics.unresolvable_count,
      unchecked_count: prefixStatistics.unchecked_count,
    }

    updateStatsMutation.mutate(
      {
        id: prefixId!,
        payload: stats,
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            navigate('/prefixes/');
          }, 2000)
        },
        onError: (error) => {
          console.error('Error updating statistics:', error);
        },
      },
    )
  }

  const isLoading = isStatsLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t("lbl_loading")}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit}>
        <div className="max-w-2xl mx-auto p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t("lbl_edit_statistics")}
            </h2>
            <p className="text-gray-500">
              {t("lbl_prefix")}:{' '}
              <span className="font-semibold text-gray-700">
                {statsData?.prefix}
              </span>
            </p>
          </div>

          {/* Statistics Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
               {t("lbl_prefix_statistics")}
            </h3>

            <div className="space-y-6">
              {/* Handles Count */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label
                    htmlFor="handles_count"
                    className="block text-sm font-bold text-gray-900"
                  >
                    {t("lbl_handles")}
                  </label>
                  <div className="group relative">
                    <span className="text-gray-400 cursor-help"><InformationCircleIcon className="size-4 text-muted" /></span>
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 bottom-full left-0 mb-2 w-48 z-10">
                      {t("tip_handles")}
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  id="handles_count"
                  name="handles_count"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.handles_count
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  min="0"
                  value={prefixStatistics.handles_count}
                  onChange={handleChange}
                />
                {errors.handles_count && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.handles_count}
                  </p>
                )}
              </div>

              {/* Resolvable Count */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label
                    htmlFor="resolvable_count"
                    className="block text-sm font-bold text-gray-900"
                  >
                    {t("lbl_resolvable")}
                  </label>
                  <div className="group relative">
                    <span className="text-gray-400 cursor-help"><InformationCircleIcon className="size-4 text-muted" /></span>
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 bottom-full left-0 mb-2 w-48 z-10">
                      {t("tip_resolvable")}
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  id="resolvable_count"
                  name="resolvable_count"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.resolvable_count
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  min="0"
                  value={prefixStatistics.resolvable_count}
                  onChange={handleChange}
                />
                {errors.resolvable_count && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.resolvable_count}
                  </p>
                )}
              </div>

              {/* Unresolvable Count */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label
                    htmlFor="unresolvable_count"
                    className="block text-sm font-bold text-gray-900"
                  >
                    {t("lbl_non_resolvable")}
                  </label>
                  <div className="group relative">
                    <span className="text-gray-400 cursor-help"><InformationCircleIcon className="size-4 text-muted" /></span>
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 bottom-full left-0 mb-2 w-48 z-10">
                      {t("tip_non_resolvable")}
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  id="unresolvable_count"
                  name="unresolvable_count"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.unresolvable_count
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  min="0"
                  value={prefixStatistics.unresolvable_count}
                  onChange={handleChange}
                />
                {errors.unresolvable_count && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.unresolvable_count}
                  </p>
                )}
              </div>

              {/* Unchecked Count */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label
                    htmlFor="unchecked_count"
                    className="block text-sm font-bold text-gray-900"
                  >
                    {t("lbl_unchecked")}
                  </label>
                  <div className="group relative">
                    <span className="text-gray-400 cursor-help"><InformationCircleIcon className="size-4 text-muted" /></span>
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 bottom-full left-0 mb-2 w-48 z-10">
                      {t("tip_unchecked")}
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  id="unchecked_count"
                  name="unchecked_count"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.unchecked_count
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  min="0"
                  value={prefixStatistics.unchecked_count}
                  onChange={handleChange}
                />
                {errors.unchecked_count && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.unchecked_count}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="submit"
              disabled={updateStatsMutation.isPending}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 text-white font-semibold rounded-lg transition cursor-pointer"
            >
              {updateStatsMutation.isPending ? t("btn_updating") : t("btn_update")}
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

export default PrefixEditStats