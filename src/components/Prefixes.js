import React, { useEffect, useState, useMemo } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import '@fortawesome/fontawesome-free-solid'

import DataManager from "../api/DataManager";
import Table from "./Table";

import config from "../config";

const status_t = {
  "0": "Missing",
  "1": "Exists"
};


const Prefixes = () => {
  let navigate = useNavigate();
  const [prefixes, setPrefixes] = useState([]);

  useEffect(() => {
    let DM = new DataManager(config.endpoint);
    DM.getPrefixes().then((response) => setPrefixes(response));
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.name,
        id: "name",
        cell: (info) => info.getValue(),
        header: () => <span>Name</span>,
        footer: null,
      },
      {
        accessorFn: (row) => row.owner,
        id: "owner",
        cell: (info) => info.getValue(),
        header: () => <span>Owner</span>,
        footer: null,
      },
      {
        accessorFn: (row) => row.domain_name,
        id: "domain",
        cell: (info) => info.getValue(),
        header: () => <span>Domain</span>,
        footer: null,
      },
      {
        accessorFn: (row) => row.provider_name,
        id: "provider",
        cell: (info) => info.getValue(),
        header: () => <span>Provider</span>,
        footer: null,
      },
      {
        id: "action",
        cell: props => (

          <div className="edit-buttons">
            <Link className="btn btn-light btn-sm ml-1 mr-1" to={`/prefixes/${props.row.original.id}`} >
              <FontAwesomeIcon icon="list" />
            </Link>
            <Link className="btn btn-light btn-sm ml-1 mr-1" to={`/prefixes/${props.row.original.id}/update`} >
              <FontAwesomeIcon icon="edit" />
            </Link>
            <Link className="btn btn-light btn-sm ml-1 mr-1" to={`/prefixes/${props.row.original.id}/delete`} >
              <FontAwesomeIcon icon="times" />
            </Link>
          </div>
        ),

        header: () => <span>Description</span>,
        footer: null,
        enableColumnFilter: false,
      }
      ,
    ],
    []
  );

  return (
    <div>
      {prefixes &&
        <div className="container">
          <div className="row d-flex justify-content-between mb-4">
            <div className="col col-10"></div>
            <div className="col col-2 text-end">
              <button
                onClick={() => {
                  navigate("/prefixes/add");
                }}
                className="btn btn-secondary"
              >
                <FontAwesomeIcon className="mr-2" icon="plus" size="lg" /> Create New
              </button>
            </div>
          </div>
          <div className="row d-flex flex-column justify-content-between">
            <Table columns={columns} data={prefixes} />
          </div>
        </div>
      }
    </div>
  );
};

const PrefixDetails = (props) => {

  let params = useParams();
  let navigate = useNavigate();
  const [prefixes, setPrefixes] = useState([]);

  let DM = new DataManager(config.endpoint);

  let prefix = {}
  if (prefixes) {
    prefixes.forEach((p) => {
      if (String(p.id) === params.id) {
        prefix = p;
      }
    });
  }

  useEffect(() => {
    DM.getPrefixes().then((response) => setPrefixes(response));
  }, []);

  if (isNaN(Number(params.id))) {
    return (<Navigate to="/" replace={true} />);
  }

  const handleDelete = (id) => {
    DM.deletePrefix(id).then((response) => navigate("/prefixes"));
  }

  let deleteCard = null;

  if (props.toDelete) {
    deleteCard = (
      <div className="container">
        <div className="card border-danger mb-2">
          <div className="card-header border-danger text-danger text-center">
            <h5>
              <FontAwesomeIcon
                className="mx-3"
                icon="exclamation-triangle"
              />
              <strong>Prefix Deletion</strong>
            </h5>
          </div>
          <div className=" card-body border-danger text-center">
            Are you sure you want to delete prefix: <strong>{prefix.name}</strong> ?
          </div>
          <div className="card-footer border-danger text-danger text-center">
            <button
              className="btn btn-danger mr-2"
              onClick={() => {
                handleDelete(params.id);
              }}
            >
              Delete
            </button>
            <button
              onClick={() => {
                navigate("/prefixes");
              }}
              className="btn btn-dark"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    deleteCard = null;
  }

  return (
    <div>
      {deleteCard}
      <div className="container">
        <div className="card">
          <div className="card-header text-start">
            <h2>Prefix: {prefix && prefix.name}</h2>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col">
                <FontAwesomeIcon icon="list" size="8x" />
              </div>
              <div className="col d-flex flex-column justify-content-between">
                <div className="row">
                  <div className="col col-2 d-flex justify-content-start">
                    <span className="badge bg-dark">Service:</span>
                  </div>
                  <div className="col col-10 d-flex justify-content-start">
                    {prefix && prefix.service_name}
                  </div>
                </div>
                <div className="row">
                  <div className="col col-2 d-flex justify-content-start">
                    <span className="badge bg-dark">Provider:</span>
                  </div>
                  <div className="col col-10 d-flex justify-content-start">
                    {prefix && prefix.provider_name}
                  </div>
                </div>
                <div className="row">
                  <div className="col col-2 d-flex justify-content-start">
                    <span className="badge bg-dark">Domain:</span>
                  </div>
                  <div className="col col-10 d-flex justify-content-start">
                    {prefix && prefix.domain_name}
                  </div>
                </div>
                <div className="row">
                  <div className="col col-2 d-flex justify-content-start">
                    <span className="badge bg-dark">Owner:</span>
                  </div>
                  <div className="col col-10 d-flex justify-content-start">
                    {prefix && prefix.owner}
                  </div>
                </div>
                <div className="row">
                  <div className="col col-2 d-flex justify-content-start">
                    <span className="badge bg-dark">Used by:</span>
                  </div>
                  <div className="col col-10 d-flex justify-content-start">
                    {prefix && prefix.used_by}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer"></div>
        {props.toDelete === false ?
          <button
            onClick={() => {
              navigate("/prefixes/");
            }}
            className="btn btn-dark"
          >
            Back
          </button>
          :
          <></>
        }
      </div>
    </div>
  )
}

const PrefixAdd = () => {

  let navigate = useNavigate();

  const [name, setName] = useState("");
  const [service_id, setServiceID] = useState("");
  const [provider_id, setProviderID] = useState("");
  const [domain_id, setDomainID] = useState("");
  const [owner, setOwner] = useState("");
  const [used_by, setUsedBy] = useState("");
  const [status, setStatus] = useState("1");

  const [providers, setProviders] = useState([]);
  useEffect(() => {
    let DM = new DataManager(config.endpoint);
    DM.getProviders().then((response) => { setProviders(response); setProviderID(response[0].id) });
  }, []);

  const [domains, setDomains] = useState([]);
  useEffect(() => {
    let DM = new DataManager(config.endpoint);
    DM.getDomains().then((response) => { setDomains(response); setDomainID(response[0].id) });
  }, []);

  const [services, setServices] = useState([]);
  useEffect(() => {
    let DM = new DataManager(config.endpoint);
    DM.getServices().then((response) => { setServices(response); setServiceID(response[0].id) });
  }, []);

  const handleNameChange = (event) => {
    setName(event.target.value);
  }

  const handleServiceIDChange = (event) => {
    setServiceID(event.target.value);
  }

  const handleProviderIDChange = (event) => {
    setProviderID(event.target.value);
  }

  const handleDomainIDChange = (event) => {
    setDomainID(event.target.value);
  }

  const handleOwnerChange = (event) => {
    setOwner(event.target.value);
  }

  const handleUsedByChange = (event) => {
    setUsedBy(event.target.value);
  }

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  }

  const handleSubmit = (event) => {
    let DM = new DataManager(config.endpoint);

    const data = {
      "name": name,
      "service_id": service_id,
      "provider_id": provider_id,
      "domain_id": domain_id,
      "owner": owner,
      "used_by": used_by,
      "status": status,
    }

    DM.addPrefix(data).then((response) => { navigate("/prefixes/") });
    event.preventDefault();
  }

  if (providers) {
    return (
      <div className="container">
        <form onSubmit={handleSubmit}>
          <div className="row text-start">
            <div className="mb-3">
              <label htmlFor="prefixName" className="form-label fw-bold">Name</label>
              <input type="text" value={name} onChange={handleNameChange} className="form-control" id="prefixName" aria-describedby="prefixNameHelp" />
            </div>
            <div className="mb-3">
              <label htmlFor="serviceID" className="form-label fw-bold">Service</label>
              <select className="form-select" onChange={handleServiceIDChange} value={service_id}>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>{service.name} </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="providerID" className="form-label fw-bold">Provider</label>
              <select className="form-select" onChange={handleProviderIDChange} value={provider_id}>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>{provider.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="domainID" className="form-label fw-bold">Domain</label>
              <select className="form-select" onChange={handleDomainIDChange} value={domain_id}>
                {domains.map((domain) => (
                  <option key={domain.id} value={domain.id}>{domain.name} </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="owner" className="form-label fw-bold">Owner</label>
              <input type="text" value={owner} onChange={handleOwnerChange} className="form-control" id="owner" />
            </div>
            <div className="mb-3">
              <label htmlFor="usedBy" className="form-label fw-bold">Used by</label>
              <input type="text" value={used_by} onChange={handleUsedByChange} className="form-control" id="usedBy" />
            </div>
            <div className="mb-3">
              <label htmlFor="status" className="form-label fw-bold">Status</label>
              <select className="form-select" onChange={handleStatusChange} value={status}>
                <option key="status-0" value="1">{status_t["1"]}</option>
                <option key="status-1" value="0">{status_t["0"]}</option>
              </select>
            </div>
          </div>
          <div className="row text-end">
            <div className="column col-10"></div>
            <div className="column col-2 d-flex justify-content-end">
              <button type="submit" value="Submit" className="btn btn-primary" style={{ marginRight: "1rem" }}>Create</button>
              <button
                onClick={() => {
                  navigate("/prefixes/");
                }}
                className="btn btn-dark"
              >
                Back
              </button>
            </div>
          </div>
        </form>
      </div>
    )
  }
  else {
    return (<></>)
  }
}

const PrefixUpdate = () => {
  let params = useParams();
  let navigate = useNavigate();

  const [updated, setUpdated] = useState({});

  useEffect(() => {
    let DM = new DataManager(config.endpoint);
    DM.getPrefixes(params.id).then((response) => {
      setName(response.name);
      setServiceID(response.service_id);
      setProviderID(response.provider_id);
      setDomainID(response.provider_id);
      setOwner(response.owner);
      setUsedBy(response.used_by);
      setStatus(response.status);
    });
  }, []);

  const [name, setName] = useState("");
  const [service_id, setServiceID] = useState("");
  const [provider_id, setProviderID] = useState("");
  const [domain_id, setDomainID] = useState("");
  const [owner, setOwner] = useState("");
  const [used_by, setUsedBy] = useState("");
  const [status, setStatus] = useState("");

  const [providers, setProviders] = useState([]);
  useEffect(() => {
    let DM = new DataManager(config.endpoint);
    DM.getProviders().then((response) => { setProviders(response) });
  }, []);

  const [domains, setDomains] = useState([]);
  useEffect(() => {
    let DM = new DataManager(config.endpoint);
    DM.getDomains().then((response) => { setDomains(response) });
  }, []);

  const [services, setServices] = useState([]);
  useEffect(() => {
    let DM = new DataManager(config.endpoint);
    DM.getServices().then((response) => { setServices(response) });
  }, []);

  const handleNameChange = (event) => {
    setName(event.target.value);
    setUpdated({ ...updated, "name": event.target.value });
  }

  const handleServiceIDChange = (event) => {
    setServiceID(event.target.value);
    setUpdated({ ...updated, "service_id": event.target.value });
  }

  const handleProviderIDChange = (event) => {
    setProviderID(event.target.value);
    setUpdated({ ...updated, "provider_id": event.target.value });
  }

  const handleDomainIDChange = (event) => {
    setDomainID(event.target.value);
    setUpdated({ ...updated, "domain_id": event.target.value });
  }

  const handleOwnerChange = (event) => {
    setOwner(event.target.value);
    setUpdated({ ...updated, "owner": event.target.value });
  }

  const handleUsedByChange = (event) => {
    setUsedBy(event.target.value);
    setUpdated({ ...updated, "used_by": event.target.value });
  }

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setUpdated({ ...updated, "status": event.target.value });
  }

  const handleSubmit = (event) => {
    let DM = new DataManager(config.endpoint);
    let method = "PATCH";

    const data = {
      "name": name,
      "service_id": service_id,
      "provider_id": provider_id,
      "domain_id": domain_id,
      "owner": owner,
      "used_by": used_by,
      "status": status,
    }

    let updated_keys = Object.keys(updated);
    let total_keys = Object.keys(data);
    if (updated_keys.filter(x => total_keys.includes(x)).length === total_keys.length) {
      for (const [key,] of Object.entries(updated)) {
        if (updated[key] === data[key]) {
          method = "PUT";
        }
      }
    }

    DM.updatePrefix(params.id, method, updated).then((response) => { navigate("/prefixes") });
    event.preventDefault();
  }

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="text-start">
        <div className="row">
          <div className="mb-3">
            <label htmlFor="prefixName" className="form-label fw-bold">Name</label>
            <input type="text" value={name} onChange={handleNameChange} className="form-control" id="prefixName" aria-describedby="prefixNameHelp" />
          </div>
          <div className="mb-3">
            <label htmlFor="serviceID" className="form-labe fw-bold">Service</label>
            <select className="form-select" onChange={handleServiceIDChange} value={service_id}>
              {services.map((service) => (
                <option key={service.id} value={service.id}>{service.name} </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="providerID" className="form-label fw-bold">Provider</label>
            <select className="form-select" onChange={handleProviderIDChange} value={provider_id}>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>{provider.name} </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="domainID" className="form-label fw-bold">Domain</label>
            <select className="form-select" onChange={handleDomainIDChange} value={domain_id}>
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>{domain.name} </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="owner" className="form-label fw-bold">Owner</label>
            <input type="text" value={owner} onChange={handleOwnerChange} className="form-control" id="owner" />
          </div>
          <div className="mb-3">
            <label htmlFor="usedBy" className="form-label fw-bold">Used by</label>
            <input type="text" value={used_by} onChange={handleUsedByChange} className="form-control" id="usedBy" />
          </div>
          <div className="mb-3">
            <label htmlFor="status" className="form-label fw-bold">Status</label>
            <select className="form-select" onChange={handleStatusChange} value={status}>
              <option key="status-0" value="1">{status_t["1"]}</option>
              <option key="status-1" value="0">{status_t["0"]}</option>
            </select>
          </div>
        </div>
        <div className="row text-end">
          <div className="column col-10"></div>
          <div className="column col-2 d-flex justify-content-end">
            <button type="submit" value="Submit" className="btn btn-primary" style={{ marginRight: "1rem" }}>Update</button>
            <button
              onClick={() => {
                navigate("/prefixes/");
              }}
              className="btn btn-dark"
            >
              Back
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export { Prefixes, PrefixDetails, PrefixAdd, PrefixUpdate };