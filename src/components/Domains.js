import React, { useEffect, useState } from "react";
import DataManager from "../api/DataManager";
import DataTable from "react-data-table-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@fortawesome/fontawesome-free-solid";
import config from "../config";
import "react-datepicker/dist/react-datepicker.css";

const Domains = () => {
  const [domains, setDomains] = useState([]);

  useEffect(() => {
    let DM = new DataManager(config.endpoint);
    DM.getDomains().then((response) => setDomains(response));
  }, []);

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      width: "300px", 
    },
    {
      name: 'Description',
      selector: row => row.description,
      sortable: true,
      cell: (row) => (
        <div className="row">
          <div className="m-2">
            <div>{row.description} </div>
          </div>
        </div>
      ),
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
      {domains && (
        <div className="col mx-4 mt-4 prefix-table">
          <h2 className="view-title">
            <i><FontAwesomeIcon icon="bookmark" size="lg" /></i>
            <span>Domain List</span>
          </h2>

          {domains.length > 0 && (
            <DataTable
              columns={columns}
              data={domains}
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

export default Domains;
