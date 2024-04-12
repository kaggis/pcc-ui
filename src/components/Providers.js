import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import '@fortawesome/fontawesome-free-solid'
import DataManager from "../api/DataManager";
import config from "../config";
import DataTable from "react-data-table-component";

const Providers = () => {

  const [providers, setProviders] = useState([]);

  useEffect(() => {
    let DM = new DataManager(config.endpoint);
    DM.getProviders().then((response) => setProviders(response));
  }, []);


  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    }
  ];

  const customStyles = {
    headCells: {
      style: {
        color: "#202124",
        fontSize: "18px",
        backgroundColor: "#F4F6F8",
      },
    },
    rows: {
      style: {
        fontSize: "16px",
      },
      highlightOnHoverStyle: {
        backgroundColor: "rgb(199,218,255)",
        borderBottomColor: "#FFFFFF",
        borderRadius: "10px",
        outline: "1px solid #FFFFFF",
      },
    },
  };

  return (
    <div>
      {providers && (
        <div className="col mx-4 mt-4 prefix-table">
          <h2 className="view-title">
            <i><FontAwesomeIcon icon="building" size="lg" /></i>
            <span>Provider List</span>
          </h2>

          {providers.length > 0 && (
            <DataTable
              columns={columns}
              data={providers}
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
  );
};

export default Providers;
