import DataTable from 'react-data-table-component'
import { BookmarkIcon } from '@heroicons/react/16/solid'
import type { TableItem } from '@/types/common'
import { useGetDomains } from '@/api/hooks/domains';
import { useTranslation } from 'react-i18next';

const Domains = () => {
  const { t } = useTranslation();
  const { data } = useGetDomains();


  const columns = [
    {
      name: t("lbl_name"),
      selector: (row: TableItem) => row.name,
      sortable: true,
      width: '300px',
    },
    {
      name: t("lbl_description"),
      selector: (row: TableItem) => row.description,
      sortable: true,
      cell: (row: TableItem) => (
        <div className="m-2">
          <div className="text-wrap">{row.description} </div>
        </div>
      ),
    },
  ]

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

  return (
    <div>
      {data && (
        <div className="mx-4 mt-4">
          <div className="flex flex-row mb-2">
            <BookmarkIcon className="size-8 me-2 text-amber-500" />
            <span className="text-2xl">{t("lbl_domain_list")}</span>
          </div>

          {data.length > 0 && (
            <DataTable
              columns={columns}
              data={data}
              defaultSortFieldId={1}
              theme="default"
              customStyles={customStyles}
              highlightOnHover
              pointerOnHover
              pagination
            />
          )}
        </div>
      )}
    </div>
  )
}

export default Domains
