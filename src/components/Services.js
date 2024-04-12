import React, { useEffect, useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import '@fortawesome/fontawesome-free-solid'
import DataManager from "../api/DataManager";
import config from "../config";
import DataTable from "react-data-table-component";

const Services = () => {

  const [services, setServices] = useState([]);

  useEffect(() => {
    let DM = new DataManager(config.endpoint);
    DM.getServices().then((response) => setServices(response));
  }, []);

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
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
      {services && (
        <div className="col mx-4 mt-4 prefix-table">
          <h2 className="view-title">
            <i><FontAwesomeIcon icon="flag" size="lg" /></i>
            <span>Service List</span>
          </h2>

          {services.length > 0 && (
            <DataTable
              columns={columns}
              data={services}
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

export default Services;
