import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate, Navigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DataManager from "../../api/DataManager";
import config from "../../config";


const PrefixDetails = (props) => {
    let params = useParams();
    let navigate = useNavigate();
    const [prefixes, setPrefixes] = useState([]);
    const [prefixStatistics, setPrefixStatistics] = useState({});
    const [numPidTotal, setNumPidTotal] = useState(0);
    const [numPidResolv, setNumPidResolv] = useState(0);
    const [numPidNonResolv,setNumPidNonResolv]  = useState(0);
    const [numPidUnknown, setNumPidUnknown] = useState(0);
    const [numPidPercResolv, setNumPidPercResolv] = useState(0);
    const [numUsers, setNumUsers] = useState(1);

    let prefix = {};
    if (prefixes) {
        prefixes.forEach((p) => {
            if (String(p.id) === params.id) {
                prefix = p;
            }
        });
    }

    useEffect(() => {
        let DM = new DataManager(config.endpoint);
        DM.getPrefixes()
        .then((response) => setPrefixes(response))
        .catch((error) => console.error("Error fetching prefixes:", error));
    }, []);

    useEffect(() => {
        let DM = new DataManager(config.endpoint);
        let prefix = {};
        if (prefixes) {
            prefixes.forEach((p) => {
                if (String(p.id) === params.id) {
                    prefix = p;
                }
            });
        }
        if (prefix.name !== undefined) {
            DM.getStatisticsByPrefixID(prefix.name)
            .then((response) => { setPrefixStatistics(response);})
            .catch((error) => console.error("Error fetching statistics:", error));
        }
    }, [prefix]);

    if (isNaN(Number(params.id))) {
        return <Navigate to="/" replace={true} />;
    }

    const handleDelete = (id) => {
        let DM = new DataManager(config.endpoint);
        DM.deletePrefix(id)
        .then(() => navigate("/prefixes"))
        .catch((error) => console.error("Error deleting prefixes:", error));
    };

    let deleteCard = null;

    if (props.toDelete) {
        deleteCard = (
            <div className="container">
                <div className="card border-danger mb-2">
                    <div className="card-header border-danger text-danger text-center">
                        <h5>
                            <FontAwesomeIcon className="mx-3" icon="exclamation-triangle" />
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
                            }}>
                            Delete
                        </button>
                        <button
                            onClick={() => {
                                navigate("/prefixes");
                            }}
                            className="btn btn-dark">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    } else {
        deleteCard = null;
    }

    // if data available process the numbers
    useEffect(() => {
        if(prefixStatistics){
            if (prefixStatistics.handles_count !== undefined) {
                setNumPidTotal(parseInt(prefixStatistics.handles_count));
                setNumPidResolv(parseInt(prefixStatistics.resolvable_count));
                setNumPidNonResolv(parseInt(prefixStatistics.unresolvable_count));
                setNumPidUnknown(parseInt(prefixStatistics.unchecked_count));
                if (parseInt(prefixStatistics.handles_count) !== 0) {
                    setNumPidPercResolv((parseInt(prefixStatistics.resolvable_count) * 100) / parseInt(prefixStatistics.handles_count));
                } else {
                    setNumPidPercResolv(0);
                }
            }
        }
    }, [prefixStatistics]);

    return (
        <div>
            {deleteCard}
            <div className="container">

                {/* prefix info starts here */}
                <div className="row">
                    {/* left column (prefix side info panel) */}
                    <div className="col-4">
                        <div className="card mt-4 text-center">
                            <span style={{ 'fontSize': '5rem' }}>📦</span>
                            <h5 className="mx-4 pb-2 border-bottom">Prefix: {prefix && prefix.name}</h5>

                            <div className="row px-4 py-2">
                                <div className="row">
                                    <div className="col-auto">
                                        <div className="input-group mb-2">
                                            <div className="input-group-prepend">
                                                <div className="input-group-text">Service: </div>
                                            </div>
                                            <span type="text" className="form-control" > {prefix && prefix.service_name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-auto">
                                        <div className="input-group mb-2">
                                            <div className="input-group-prepend">
                                                <div className="input-group-text">Provider: </div>
                                            </div>
                                            <span type="text" className="form-control" > {prefix && prefix.provider_name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-auto">
                                        <div className="input-group mb-2">
                                            <div className="input-group-prepend">
                                                <div className="input-group-text">Domain: </div>
                                            </div>
                                            <span type="text" className="form-control" > {prefix && prefix.domain_name}</span>
                                        </div>
                                    </div>
                                </div>

                                {prefix && prefix.owner &&
                                    <div className="row">
                                        <div className="col-auto">
                                            <div className="input-group mb-2">
                                                <div className="input-group-prepend">
                                                    <div className="input-group-text">Owner: </div>
                                                </div>
                                                <span type="text" className="form-control" > {prefix.owner}</span>
                                            </div>
                                        </div>
                                    </div>

                                }
                                {prefix && prefix.contact_name &&
                                    <div className="row">
                                        <div className="col-auto">
                                            <div className="input-group mb-2">
                                                <div className="input-group-prepend">
                                                    <div className="input-group-text">Contact Name: </div>
                                                </div>
                                                <span type="text" className="form-control" > {prefix.contact_name}</span>
                                            </div>
                                        </div>
                                    </div>
                                }
                                {prefix && prefix.contact_email &&
                                    <div className="row">
                                        <div className="col-auto">
                                            <div className="input-group mb-2">
                                                <div className="input-group-prepend">
                                                    <div className="input-group-text">Contact Email: </div>
                                                </div>
                                                <span type="text" className="form-control" > {prefix.contact_email}</span>
                                            </div>
                                        </div>
                                    </div>
                                }
                                {prefix && prefix.contract_end &&
                                    <div className="row">
                                        <div className="col-auto">
                                            <div className="input-group mb-2">
                                                <div className="input-group-prepend">
                                                    <div className="input-group-text">Contract End: </div>
                                                </div>
                                                <span type="text" className="form-control" > {prefix.contract_end}</span>
                                            </div>
                                        </div>
                                    </div>
                                }
                                {prefix && prefix.contract_type_name &&
                                    <div className="row">
                                        <div className="col-auto">
                                            <div className="input-group mb-2">
                                                <div className="input-group-prepend">
                                                    <div className="input-group-text">Contract Type: </div>
                                                </div>
                                                <span type="text" className="form-control" > {prefix.contract_type_name}</span>
                                            </div>
                                        </div>
                                    </div>
                                }
                                {prefix && prefix.lookup_service_type_name &&
                                    <div className="row">
                                        <div className="col-auto">
                                            <div className="input-group mb-2">
                                                <div className="input-group-prepend">
                                                    <div className="input-group-text">Lookup Type: </div>
                                                </div>
                                                <span type="text" className="form-control" > {prefix.lookup_service_type_name}</span>
                                            </div>
                                        </div>
                                    </div>
                                }
                                {prefix && prefix.used_by &&
                                    <div className="row">
                                        <div className="col-auto">
                                            <div className="input-group mb-2">
                                                <div className="input-group-prepend">
                                                    <div className="input-group-text">Used By: </div>
                                                </div>
                                                <span type="text" className="form-control" > {prefix.used_by}</span>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>

                    </div>

                    <>
                        {/* middle layout column starts */}
                        <div className="col-4">

                            {/* Handle number dashboard  */}
                            <div className="card mt-4 px-4 py-2">
                                <div className="row" style={{ 'fontSize': '1.6rem' }}>
                                    <div className="col-6">
                                        Handles
                                    </div>
                                    <div className="col-6" style={{ 'textAlign': 'right' }}>
                                        <code className="num num-default">{numPidTotal}</code>
                                        {" "}<i style={{ 'color': 'lightgrey' }}><FontAwesomeIcon icon="tags" /></i>
                                    </div>
                                </div>
                            </div>


                            {/* Resolvable percentage dashboard element */}
                            <div className="card mt-4 px-4 py-3">
                                <div className="row" style={{ 'fontSize': '1.26rem', 'fontWeight': '500' }}>
                                    <div className="col-6">
                                        Resolvable
                                    </div>
                                    <div className="col-6" style={{ 'textAlign': 'right' }}>
                                        <code style={{ 'fontWeight': 'bold' }} className="num-default">{Math.round(numPidPercResolv)}%</code>
                                    </div>
                                </div>
                                <div className="progress mt-2" style={{ "height": "5px" }}>
                                    <div className="progress-bar" role="progressbar" style={{ 'width': numPidPercResolv + '%' }} aria-valuenow={{ numPidPercResolv }} aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                            </div>

                        </div>


                        {/* third layout column (left)  */}
                        <div className="col-4">
                            {/* User number dashboard element */}
                            <div className="card mt-4 px-4 py-2">
                                <div className="row" style={{ 'fontSize': '1.6rem' }}>
                                    <div className="col-6">
                                        Users
                                    </div>
                                    <div className="col-6" style={{ 'textAlign': 'right' }}>
                                        <code className="num num-default">{numUsers}</code>
                                        {" "}<i style={{ 'color': 'lightgrey' }}><FontAwesomeIcon icon="user" /></i>
                                    </div>
                                </div>

                            </div>


                            {/* Statistics dashboard element*/}
                            <div className="card mt-4 px-4 py-3">
                                <span className="border-bottom pb-1" style={{ 'fontSize': '1.26rem', 'fontWeight': '500' }}>Statistics</span>
                                <div className="mt-2" style={{ 'fontSize': '1rem' }}>
                                    <code className="num-sm num-ok">{numPidResolv}</code> out of <code className="num-sm num-default">{numPidTotal}</code> resolvable<br />
                                    <code className="num-sm num-critical">{numPidNonResolv}</code> out of <code className="num-sm num-default">{numPidTotal}</code> non-resolvable<br />
                                    <code className="num-sm num-unknown">{numPidUnknown}</code> out of <code className="num-sm num-default">{numPidTotal}</code> unknown<br />
                                </div>
                            </div>

                        </div>
                    </>


                    {/* Edit/Delete prefix buttons  */}
                    <div className="text-center mt-4">
                        <div className="btn-group shadow">
                            <Link
                                className="btn btn-secondary"
                                to={`/prefixes/${prefix.id}/update`}>
                                <FontAwesomeIcon icon="edit" /> Update Prefix
                            </Link>
                            <Link
                                className="btn btn-secondary"
                                to={`/prefixes/${prefix.id}/delete`}>
                                <FontAwesomeIcon icon="times" /> Delete Prefix
                            </Link>
                        </div>
                    </div>


                </div>

                {/* prefix info ends here */}



                <div className="card-footer">

                </div>
                <br />
                {props.toDelete === false ? (
                    <button
                        onClick={() => {
                            navigate("/prefixes/");
                        }}
                        className="btn btn-dark">
                        Back
                    </button>
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
};


export default PrefixDetails;