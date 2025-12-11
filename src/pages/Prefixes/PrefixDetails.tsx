import { Link, useParams, useNavigate, Navigate } from 'react-router-dom'
import {
  ExclamationTriangleIcon,
  PencilIcon,
  TagIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/16/solid'
import {
  useDeletePrefix,
  useGetPrefixById,
  useGetStatisticsByPrefixId,
} from '@/api/hooks/prefixes'
import { useTranslation } from 'react-i18next'

interface PrefixDetailsProps {
  toDelete: boolean
}

const PrefixDetails = (props: PrefixDetailsProps) => {
  const { t } = useTranslation();
  const params = useParams()
  const navigate = useNavigate()

  const { data: prefixData } = useGetPrefixById({
    id: params.id || '',
  })

  const { data: stats } = useGetStatisticsByPrefixId({
    id: prefixData?.name,
  })

  const deletePrefix = useDeletePrefix()

  if (isNaN(Number(params.id))) {
    return <Navigate to="/" replace={true} />
  }



  const handleDelete = (id: string) => {
    deletePrefix.mutate(id, {
      onSuccess: () => {
        navigate('/prefixes')
      },
      onError: (error) => {
        console.error(t("msg_error_deleting_prefix"), error)
      },
    })
  }

  let deleteCard = null

  if (props.toDelete && prefixData != null) {
    deleteCard = (
      <div className="flex items-center justify-center modal modal-open">
        <div className="border border-error rounded max-w-md w-full bg-white">
          <div className="border-b border-error px-6 py-4 text-center">
            <span className="flex items-center justify-center gap-2 text-error">
              <ExclamationTriangleIcon className="size-6" />
              <strong>{t("lbl_prefix_deletion")}</strong>
            </span>
          </div>
          <div className="px-6 py-6 text-center">
            {t("msg_prefix_delete")}{' '}
            <strong>{prefixData?.name || ''}</strong> ?
          </div>
          <div className="px-6 py-4 text-center flex gap-2 justify-center">
            <button
              className="btn btn-error btn-outline"
              onClick={() => {
                handleDelete(params.id || '')
              }}
            >
              {t("btn_delete")}
            </button>
            <button
              onClick={() => {
                navigate('/prefixes')
              }}
              className="btn btn-default btn-outline"
            >
              {t("btn_cancel")}
            </button>
          </div>
        </div>
      </div>
    )
  } else {
    deleteCard = null
  }

  let numPidPercResolv = 0
  if (stats?.handles_count && stats?.handles_count > 0) {
    numPidPercResolv = (stats.resolvable_count * 100) / stats.handles_count
  }

  return (
    <div>
      {deleteCard}
      <div>
        {/* prefix info starts here */}
        <div className="flex gap-4">
          {/* left column (prefix side info panel) */}
          <div className="flex-1">
            <div className="border rounded border-gray-300 mt-4 text-center min-w-4">
              <span style={{ fontSize: '5rem' }}>📦</span>
              <h5 className="mx-4 pb-2 text-2xl border-b border-gray-300">
                {t("lbl_prefix")} {prefixData?.name}
              </h5>

              <div className="mb-2 p-4">
                <div className="m-1">
                  <label className="input">
                    <span className="label">Provider: </span>
                    <span> {prefixData?.provider_name}</span>
                  </label>
                </div>
                {prefixData && prefixData.owner && (
                  <div className="m-1">
                    <label className="input">
                      <span className="label">{t("lbl_owner")}: </span>
                      <span> {prefixData?.owner}</span>
                    </label>
                  </div>
                )}

                {prefixData && prefixData.contact_name && (
                  <div className="m-1">
                    <label className="input">
                      <span className="label">{t("lbl_contact_name")}: </span>
                      <span> {prefixData?.contact_name}</span>
                    </label>
                  </div>
                )}

                {prefixData && prefixData.contact_email && (
                  <div className="m-1">
                    <label className="input">
                      <span className="label">{t("lbl_contact_email")}: </span>
                      <span> {prefixData?.contact_email}</span>
                    </label>
                  </div>
                )}

                {prefixData && prefixData.contract_end && (
                  <div className="m-1">
                    <label className="input">
                      <span className="label">{t("lbl_contract_end")}: </span>
                      <span> {prefixData?.contract_end}</span>
                    </label>
                  </div>
                )}

                {prefixData && prefixData.contract_type_name && (
                  <div className="m-1">
                    <label className="input">
                      <span className="label">{t("lbl_contact_type")}: </span>
                      <span> {prefixData?.contract_type_name}</span>
                    </label>
                  </div>
                )}

                {prefixData && prefixData.lookup_service_type_name && (
                  <div className="m-1">
                    <label className="input">
                      <span className="label">{t("lbl_contact_type")}: </span>
                      <span> {prefixData?.lookup_service_type_name}</span>
                    </label>
                  </div>
                )}

                {prefixData && prefixData.used_by && (
                  <div className="m-1">
                    <label className="input">
                      <span className="label">{t("lbl_used_by")}: </span>
                      <span> {prefixData?.used_by}</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <>
            {/* middle layout column starts */}
            <div className="flex-1">
              {/* Handle number dashboard  */}
              <div className="border rounded border-gray-300 mt-4 text-center p-4 text-2xl">
                <div className="flex flex-row">
                  <div className="flex-1 text-left">{t("lbl_handles")}</div>
                  <div className="flex-1 flex justify-end items-center gap-2">
                    <code className="text-cyan-400">
                      {stats?.handles_count}
                    </code>
                    <span>
                      <TagIcon className="ms-2 size-6 text-gray-300" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Resolvable percentage dashboard element */}

              <div className="border rounded border-gray-300 mt-4 p-4 text-xl">
                <div className="flex flex-row">
                  <div className="flex-1 text-left">{t("lbl_resolvable")}</div>
                  <div className="flex-1 flex justify-end">
                    <code className="text-cyan-400">
                      {Math.round(numPidPercResolv)}
                    </code>
                  </div>
                </div>
                <div className="progress mt-2" style={{ height: '5px' }}>
                  <progress
                    className="progress progress-primary w-56"
                    value={numPidPercResolv}
                    max="100"
                  ></progress>
                </div>
              </div>
            </div>

            {/* third layout column (left)  */}
            <div className="flex-1">
              {/* User number dashboard element */}
              <div className="border rounded border-gray-300 mt-4 text-center p-4 text-2xl">
                <div className="flex flex-row">
                  <div className="flex-1 text-left">{t("lbl_users")}</div>
                  <div className="flex-1 flex justify-end items-center gap-2">
                    <code className="text-cyan-400">{1}</code>
                    <UserIcon className="ms-2 size-6 text-gray-300" />
                  </div>
                </div>
              </div>

              {/* Statistics dashboard element*/}
              <div className="border rounded border-gray-300 mt-4 p-4 text-xl">
                <span className="block pb-2 border-b border-gray-300">
                  {t("lbl_statistics")}
                </span>

                <div className="mt-2" style={{ fontSize: '1rem' }}>
                  <code className="text-green-500 font-bold">
                    {stats?.resolvable_count}
                  </code>{' '}
                  {t("out_of")}{' '}
                  <code className="text-cyan-400 font-bold">
                    {stats?.handles_count}
                  </code>{' '}
                  {t("resolvable")}
                  <br />
                  <code className="text-red-500 font-bold">
                    {stats?.unresolvable_count}
                  </code>{' '}
                  {t("out_of")}{' '}
                  <code className="text-cyan-400 font-bold">
                    {stats?.handles_count}
                  </code>{' '}
                  {t("non-resolvable")}
                  <br />
                  <code className="text-grey-500 font-bold">
                    {stats?.unchecked_count}
                  </code>{' '}
                  {t("out_of")}{' '}
                  <code className="text-cyan-400 font-bold">
                    {stats?.handles_count}
                  </code>{' '}
                  {t("unknown")}
                  <br />
                </div>
              </div>
            </div>
          </>

          {/* Edit/Delete prefix buttons  */}
        </div>

        <div className="text-center mx-auto mt-4 w-[400px]">
          <div className="join grid grid-cols-2">
            <Link
              className="join-item btn"
              to={`/prefixes/${prefixData?.id}/update`}
            >
              <PencilIcon className="size-6" /> {t("btn_update_prefix")}
            </Link>
            <Link
              className="join-item btn"
              to={`/prefixes/${prefixData?.id}/delete`}
            >
              <XMarkIcon className="size-6" /> {t("btn_delete_prefix")}
            </Link>
          </div>
        </div>

        {/* prefix info ends here */}

        <div className="card-footer"></div>
        <br />
        {props.toDelete === false ? (
          <button
            onClick={() => {
              navigate('/prefixes/')
            }}
            className="btn btn-dark"
          >
            {t("btn_back")}
          </button>
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}

export default PrefixDetails
