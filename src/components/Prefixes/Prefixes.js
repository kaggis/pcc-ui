import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@fortawesome/fontawesome-free-solid";
import { faList, faEdit, faChartBar, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import "react-datepicker/dist/react-datepicker.css";
import DataManager from "../../api/DataManager";
import config from "../../config";
import DataTable from 'react-data-table-component';
import PrefixDetails from "./PrefixDetails";
import PrefixAdd from "./PrefixAdd";
import PrefixUpdate from "./PrefixUpdate";
import PrefixLookup from "./PrefixLookup";
import PrefixEditStats from "./PrefixEditStats";
import { StyleSheetManager } from 'styled-components';
import './prefix.css';
import { OverlayTrigger, Tooltip, Button, Tab, Tabs, Form } from 'react-bootstrap';

String.prototype.toPascalCase = function () {
  const words = this.match(/[a-z]+/gi);
  if (!words) return "";
  return words
    .map(function (w) {
      return w.charAt(0).toUpperCase() + w.substr(1).toLowerCase();
    })
    .join(" ");
};

const tooltipList = (
  <Tooltip id="tooltip">View Details</Tooltip>
);
const tooltipEdit = (
  <Tooltip id="tooltip">Update Prefix</Tooltip>
);
const tooltipTimes = (
  <Tooltip id="tooltip">Delete Prefix</Tooltip>
);
const tooltipChartBar = (
  <Tooltip id="tooltip">Edit Statistics</Tooltip>
);

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
};

const Prefixes = () => {
  let navigate = useNavigate();
  const [prefixes, setPrefixes] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [filterProvider, setFilterProvider] = useState('');
  const [filterDomains, setFilterDomains] = useState('');
  const [filterContactType, setFilterContactType] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [key, setTabKey] = useState('');
  const [providers, setProviders] = useState([]);
  const [domains, setDomains] = useState([]);
  const [contract_types, setContractTypes] = useState([]);

  useEffect(() => {
    let DM = new DataManager(config.endpoint);
    DM.getDomains()
      .then((response) => setDomains(response))
      .catch((error) => console.error("Error fetching domains:", error));

    DM.getPrefixes()
      .then((response) => setPrefixes(response))
      .catch((error) => console.error("Error fetching prefixes:", error));

    DM.getProviders()
      .then((response) => setProviders(response))
      .catch((error) => console.error("Error fetching providers:", error));

    DM.getCodelistContract()
      .then((response) => setContractTypes(response))
      .catch((error) => console.error("Error fetching Contracts:", error));
  }, []);

  const idToName = {};
  contract_types.forEach(type => {
    idToName[type.id] = type.name;
  });

  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      cell: (row) => (
        <div className="row">
          <div className="col-4" style={{ fontSize: "2rem" }}>
            📦
          </div>
          <div className="col-8">
            <div>{row.name} </div>
            <div style={{ color: 'gray', fontSize: '12px' }}>by: {row.provider_name}</div>
          </div>
        </div>
      ),
    },
    {
      name: 'Owner',
      selector: row => row.owner,
      sortable: true,
    },
    {
      name: 'Domain',
      selector: row => row.domain_name,
      sortable: true,
    },
    {
      name: 'Contract Type',
      selector: row => row.contract_type_name,
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="btn-group">
          <OverlayTrigger placement="top" overlay={tooltipList}>
            <Button variant="light" size="sm" onClick={() => window.location.href = `/prefixes/${row.id}`}>
              <FontAwesomeIcon icon={faList} />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={tooltipEdit}>
            <Button variant="light" size="sm" onClick={() => window.location.href = `/prefixes/${row.id}/update`}>
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={tooltipTimes}>
            <Button variant="light" size="sm" onClick={() => window.location.href = `/prefixes/${row.id}/delete`}>
              <FontAwesomeIcon icon={faTrashCan} />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={tooltipChartBar}>
            <Button variant="light" size="sm" onClick={() => window.location.href = `/prefixes/editstatistics/${row.id}`}>
              <FontAwesomeIcon icon={faChartBar} />
            </Button>
          </OverlayTrigger>
        </div>
      ),
    },
  ];

  const filteredPrefixesProviders = prefixes.filter(
    (item) => item.provider_name && item.provider_name.toLowerCase().includes(filterProvider.toLowerCase())
  );

  const filteredPrefixesByDomain = filteredPrefixesProviders.filter((item) => {
    return (
      (!filterDomains || item.domain_name === filterDomains) &&
      (!filterContactType || item.contract_type_name === filterContactType) &&
      Object.values(item).some((value) => value && typeof value === 'string' && value.toLowerCase().includes(filterText.toLowerCase()))
    );
  });  

  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      setResetPaginationToggle(!resetPaginationToggle);
      setFilterText('');
      setFilterDomains('');
      setFilterContactType('');
      selectAllOption();
    };

    function selectAllOption() {
      var selectElement = document.getElementById("domainSelection");
      selectElement.selectedIndex = 0;
      var selectElement = document.getElementById("contactSelection");
      selectElement.selectedIndex = 0;
    }

    return (
      <>
        <div className="col-12">
          <div className="row mb-3">
            <div className="col-3">
              <Form.Select id="domainSelection" name="formSelectDomain" aria-label="Domain Selection" onChange={(e) => setFilterDomains(e.target.value)}   >
                <option value=''>Select Domain</option>
                {domains.length > 0 && domains.map((domain) => (
                  <option key={domain.id} value={domain.name}>
                    {domain.name}
                  </option>
                ))}
              </Form.Select>
            </div><div className="col-3">
              <Form.Select id="contactSelection" name="formSelectContact" aria-label="Contact Selection" onChange={(e) => setFilterContactType(e.target.value)}   >
                <option id="All" value=''>Select Contract</option>
                {contract_types.length > 0 && contract_types.map((contract) => (
                  <option key={contract.id} value={contract.name}>
                    {contract.name}
                  </option>
                ))}
              </Form.Select>
            </div><div className="col-5">
              <Form.Control id="searchField" name="filterText" aria-label="Input for searching the list" placeholder="Search ..." value={filterText} aria-describedby="button-addon2"
                onChange={(e) => setFilterText(e.target.value)} />
            </div><div className="col-1">
              <Button variant="outline-primary" id="button-addon2" onClick={handleClear} >
                Clear
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }, [filterText, domains, filterDomains, filterContactType]);

  return (
    <div>
      {prefixes && (
        <div className="col mx-4 mt-4 prefix-table">
          <h2 className="view-title">
            <i> <FontAwesomeIcon icon="tags" size="lg" /></i>
            <span>Prefix List</span>
            <button className="btn btn-secondary mb-2" onClick={() => { navigate("/prefixes/add"); }}>
              <FontAwesomeIcon icon="plus" size="lg" /> Create new
            </button>
          </h2>

          <Tabs id="justify-tab-example" className="mb-3" justify activeKey={key} onSelect={(k) => { setFilterProvider(k), setTabKey(k) }} >
            <Tab eventKey="" title={<span style={{ fontSize: '18px' }}><b>ALL</b></span>} active></Tab>
            {providers.map((provider) => (
              <Tab key={provider.id} eventKey={provider.name} title={<span style={{ fontSize: '18px' }}>{provider.name}</span>} />
            ))}
          </Tabs>

          <StyleSheetManager shouldForwardProp={(prop) => prop !== 'align'}>
            {domains.length > 0 && (
              <DataTable
                columns={columns}
                data={filteredPrefixesByDomain}
                defaultSortFieldId={1}
                theme="default"
                customStyles={customStyles}
                highlightOnHover
                pointerOnHover
                pagination
                paginationResetDefaultPage={resetPaginationToggle}
                subHeader
                subHeaderComponent={subHeaderComponentMemo}
              />
            )}
          </StyleSheetManager>
        </div>
      )}
    </div>
  );
};

export { Prefixes, PrefixDetails, PrefixAdd, PrefixUpdate, PrefixLookup, PrefixEditStats };