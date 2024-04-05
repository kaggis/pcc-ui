import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@fortawesome/fontawesome-free-solid";
import { faChartBar } from '@fortawesome/free-solid-svg-icons';
import "react-datepicker/dist/react-datepicker.css";
import DataManager from "../../api/DataManager";
import config from "../../config";
import DataTable from 'react-data-table-component';
import PrefixDetails from "./PrefixDetails";
import PrefixAdd from "./PrefixAdd"
import PrefixUpdate from "./PrefixUpdate"
import PrefixLookup from "./PrefixLookup"
import PrefixEditStats from "./PrefixEditStats";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import { StyleSheetManager } from 'styled-components';
import './prefix.css';


String.prototype.toPascalCase = function () {
  const words = this.match(/[a-z]+/gi);
  if (!words) return "";
  return words
    .map(function (w) {
      return w.charAt(0).toUpperCase() + w.substr(1).toLowerCase();
    })
    .join(" ");
};

const contract_type_t = {
  "CONTRACT": "CONTRACT",
  "PROJECT": "PROJECT",
  "OTHER": "OTHER"
};

const columns = [
  {
    name: 'Name',
    selector: row => row.name,
    sortable: true,
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
    name: 'Provider',
    selector: row => row.provider_name,
    sortable: true,
  },
  {
    name: 'Contract Type',
    selector: row => row.contract_type,
    sortable: true,
  },
  {
    name: 'Actions',
    cell: (row) => (
      <div className="btn-group">
        <Link className="btn btn-default btn-sm circular-button" to={`/prefixes/${row.id}`} title="View Details">
          <FontAwesomeIcon icon="list" />
        </Link>
        <Link className="btn btn-default btn-sm circular-button" to={`/prefixes/${row.id}/update`} title="Update Prefix">
          <FontAwesomeIcon icon="edit" />
        </Link>
        <Link className="btn btn-default btn-sm circular-button" to={`/prefixes/${row.id}/delete`} title="Delete Prefix">
          <FontAwesomeIcon icon="times" />
        </Link>
        <Link className="btn btn-default btn-sm circular-button" to={`/prefixes/editstatistics/${row.id}`} title="Edit Statistics">
          <FontAwesomeIcon icon={faChartBar} />
        </Link>
      </div>
    ),
  },
];

// Custom style for the table, to have a bigger font and colored rows on hover
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

  useEffect(() => {
    let DM = new DataManager(config.endpoint);
    // DM.getDomains().then((response) => setDomains(response));
    DM.getDomains()
      .then((response) => setDomains(response))
      .catch((error) => console.error("Error fetching domains:", error));

    DM.getPrefixes()
      .then((response) => setPrefixes(response))
      .catch((error) => console.error("Error fetching prefixes:", error));

    DM.getProviders()
      .then((response) => setProviders(response))
      .catch((error) => console.error("Error fetching providers:", error));

  }, []);

  const filteredPrefixesProviders = prefixes.filter(
    (item) => item.provider_name && item.provider_name.toLowerCase().includes(filterProvider.toLowerCase())
  );

  const filteredPrefixesByDomain = filteredPrefixesProviders.filter((item) => {
    return (
      (!filterDomains || item.domain_name === filterDomains) &&
      (!filterContactType || item.contract_type === filterContactType) &&
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
          <InputGroup id="filtering" className="mb-3">
            <InputGroup.Text id="domainSelectionText" style={{ borderColor: '#6C757D' }}> Domains </InputGroup.Text>
            <Form.Select id="domainSelection" name="formSelectDomain" aria-label="Domain Selection" onChange={(e) => setFilterDomains(e.target.value)} style={{ borderColor: '#6C757D' }} >
              <option value=''>All</option>
              {domains.length > 0 && domains.map((domain) => (
                <option key={domain.id} value={domain.name}>
                  {domain.name}
                </option>
              ))}
            </Form.Select>

            <InputGroup.Text id="contactSelectionText" style={{ borderColor: '#6C757D' }}> Contract Type </InputGroup.Text>
            <Form.Select id="contactSelection" name="formSelectContact" aria-label="Default select example" onChange={(e) => setFilterContactType(e.target.value)} style={{ borderColor: '#6C757D' }} >
              <option id="All" value=''>All</option>
              {Object.entries(contract_type_t).map((contract) => (
                <option id={contract[0]} key={"contract-" + contract[0]} value={contract[0]}>
                  {contract[0]}
                </option>
              ))}
            </Form.Select>

            <InputGroup.Text id="searchText" style={{ borderColor: '#6C757D' }}> Search </InputGroup.Text>

            <Form.Control id="searchField" name="filterText" aria-label="Input for searching the list" placeholder="Type to search ..." value={filterText} aria-describedby="button-addon2"
              onChange={(e) => setFilterText(e.target.value)} style={{ borderColor: '#6C757D' }} />

            <Button variant="outline-secondary" id="button-addon2" onClick={handleClear} >
              <FontAwesomeIcon icon="times" id="button-addon2" />
            </Button>

          </InputGroup>
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