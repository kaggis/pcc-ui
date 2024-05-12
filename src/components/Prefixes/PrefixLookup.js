import React, { useEffect, useState, useMemo, useRef } from "react";
import { Formik, Field, Form } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DataManager from "../../api/DataManager";
import config from "../../config";
import DataTable from "react-data-table-component";
import './prefix.css';

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

const ExpandedComponent = ({ data }) => {
    const additionalData = data.values.filter(item => item.type !== 'URL');

    return (
        <div className="m-4" style={{ fontSize: '16px' }}>
            {additionalData.map((item, index) => (
                <div key={index}>
                    <pre>{JSON.stringify(item.type, null, 2)}:
                        {JSON.stringify(item.value, null, 2)}</pre>
                </div>
            ))}
        </div>
    );
};

const PrefixLookup = () => {
    const [filters, setReverseLookUpFilters] = useState([]);
    const [handles, setHandles] = useState([]);
    const [handlesNextPage, setHandlesNextPage] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        let DM = new DataManager(config.endpoint);
        DM.getReverseLookUpFilters().then((response) => setReverseLookUpFilters(response));
    }, []);

    useEffect(() => {
        let DM = new DataManager(config.endpoint);
        if (ref.current !== null) {
            DM.reverseLookUp(pageIndex, pageSize, { filters: ref.current.values }).then((response) => {
                setHandles(flattenHandles(response));
            });
            DM.reverseLookUp(pageIndex + 1, pageSize, { filters: ref.current.values }).then(
                (response) => {
                    setHandlesNextPage(flattenHandles(response));
                }
            );
        }

    }, [pageIndex, pageSize]);

    const ref = useRef(null);
    const checksumType = useRef("CHECKSUM");
    const checksumValue = useRef("");

    let filtersDiv = [];

    const columnsDetailed = useMemo(
        () => [
            {
                name: "Handle",
                selector: (row) => row.handle,
                sortable: false,
                width: '500px'
            },
            {
                name: "URL",
                selector: (row) => {
                    const urlValue = row.values.find(item => item.type === 'URL');
                    return urlValue ? urlValue.value : '';
                },
                sortable: false,
            },
            {
                name: "Metadata",
                cell: (row) => ("Click to expand"),
                sortable: false,
                width: '200px'
            },

        ],
        []
    );

    const columns = useMemo(
        () => [
            {
                name: "Handle",
                selector: (row) => row.handle,
                sortable: false,
            },
        ],
        []
    );

    const filtersDivCreate = () => {
        filtersDiv = [];
        let checksumOptions = [];
        filters &&
            filters.length > 0 &&
            filters.forEach((f, i) => {
                if (f === "RETRIEVE_RECORDS") {
                    filtersDiv.push(
                        <div key={"filter-div-" + i} className="mb-3 row">
                            <label className="col-sm-2 form-label fw-bold">{f.toPascalCase()}
                            </label>
                            <div className="col-sm-2">
                                <Field className="form-select" as="select" name={f}>
                                    <option value="true">True</option>
                                    <option value="false">False</option>
                                </Field>
                            </div>
                            <div className="col-sm-8" style={{ color: "gray" }}>
                                If set to True: the output will be a full Handle record. if set to False: the output
                                will be a list of Handles.
                            </div>
                        </div>
                    );
                } else if (f === "CHECKSUM" || f === "EUDAT_CHECKSUM") {
                    checksumOptions.push(
                        <option key={"checksum-option-" + i} value={f}>
                            {f}
                        </option>
                    );
                } else if (f === "EMAIL") {
                    // Does not display anything
                } else {
                    filtersDiv.push(
                        <div key={"filter-div-" + i} className="mb-3 row">
                            <label className="col-sm-2 form-label fw-bold">{f.toPascalCase()}
                            </label>
                            <div className="col-sm-10">
                                <Field
                                    id={"formik-field-id-" + f}
                                    type="text"
                                    className="form-control"
                                    name={f}
                                ></Field>
                            </div>
                        </div>
                    );
                }
            });
        if (checksumOptions) {
            filtersDiv.push(
                <div key={"filter-div-checksum"} className="mb-3 row">
                    <label className="col-sm-2 form-label fw-bold">Checksum
                    </label>
                    <div className="col-sm-4">
                        <Field
                            id={"formik-field-id-checksum-option"}
                            className="form-select"
                            as="select"
                            name="checksum-option"
                            onChange={(e) => {
                                ref.current.handleChange(e);
                                checksumType.current = e.currentTarget.value;
                            }}
                        >
                            {checksumOptions}
                        </Field>
                    </div>
                    <div className="col-sm-6">
                        <Field
                            id={"formik-field-id-checksum"}
                            type="text"
                            className="form-control"
                            name="checksum-value"
                            onChange={(e) => {
                                ref.current.handleChange(e);
                                checksumValue.current = e.currentTarget.value;
                            }}
                        ></Field>
                    </div>
                </div>
            );
        }
    };

    const filtersFormikInitialize = () => {
        let d = {};
        if (filters) {
            filters.forEach((f) => {
                if (f === "RETRIEVE_RECORDS") {
                    d[f] = "false";
                } else {
                    d[f] = "";
                }
            });
        }
        d["checksum-option"] = "CHECKSUM";
        d["checksum-value"] = "";
        return d;
    };

    const formikSetValues = () => {
        let d = {};
        if (filters) {
            filters.forEach((f) => {
                if (f === "RETRIEVE_RECORDS") {
                    d[f] = "false";
                } else {
                    d[f] = "";
                }
            });
        }
        d["checksum-option"] = "CHECKSUM";
        d["checksum-value"] = "";
        ref.current.setValues(d);
    };

    const flattenHandles = (handles) => {
        return handles;
    };

    filtersDivCreate();

    return (
        <div className="container-fluid">
            <div className="row">
                <h2 className="view-title">
                    <i> <FontAwesomeIcon icon="search" size="lg" /></i>
                    <span>Lookup</span>
                </h2>
                {filters && filters.length > 0 && (
                    <>
                        <Formik
                            innerRef={ref}
                            enableReinitialize={true}
                            initialValues={filtersFormikInitialize()}
                            onSubmit={(data) => {
                                // Handle Checksum
                                data["CHECKSUM"] = "";
                                data["EUDAT_CHECKSUM"] = "";
                                data[checksumType.current] = checksumValue.current;
                                delete data["checksum-option"];
                                delete data["checksum-value"];
                                // FIXME: Workaround for the LOC filter. Move its value to URL filter and parse response
                                let tmp = false;
                                if (data["LOC"] !== "") {
                                    data["URL"] = data["LOC"];
                                    data["LOC"] = "";
                                    tmp = true;
                                }
                                let DM = new DataManager(config.endpoint);
                                if (ref.current !== null) {
                                    DM.reverseLookUp(pageIndex, pageSize, { filters: data }).then((response) => {
                                        if (tmp) {
                                            response.map((r) => {
                                                r.values.map((v) => {
                                                    if (v["10320/LOC"] !== undefined) {
                                                        setHandles(flattenHandles(response));
                                                    }
                                                });
                                            });
                                        } else {
                                            setHandles(flattenHandles(response));
                                        }
                                    });
                                    DM.reverseLookUp(pageIndex + 1, pageSize, { filters: ref.current.values }).then(
                                        (response) => {
                                            if (tmp) {
                                                response.map((r) => {
                                                    if (r["values"].length > 0) {
                                                        r.values.map((v) => {
                                                            if (v["10320/LOC"] !== undefined) {
                                                                setHandlesNextPage(flattenHandles(response));
                                                            }
                                                        });
                                                    }
                                                });
                                            } else {
                                                setHandlesNextPage(flattenHandles(response));
                                            }
                                        }
                                    );
                                }
                                // FIXME: Revert the LOC filter value
                                if (tmp) {
                                    let v = data["URL"];
                                    data["URL"] = "";
                                    data["LOC"] = v;
                                    tmp = false;
                                }
                                // This is crucial because the keys that are forbidden for the API call are
                                // necessary for the formik
                                data["checksum-option"] = checksumType.current;
                                data["checksum-value"] = checksumValue.current;
                            }}
                        >
                            <Form>
                                <div className="form-group">
                                    {filtersDiv}
                                </div>

                                <div className="row">
                                    <div className="text-end mb-2">
                                        <button type="submit" className="btn btn-bd-warning" id="button-addon2">
                                            Submit
                                        </button> &nbsp;
                                        <button className="btn btn-outline-primary" id="button-addon2"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                formikSetValues();
                                            }} >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            </Form>
                        </Formik>
                        <br />
                        <br />
                        <DataTable
                            data={handles}
                            defaultSortFieldId={1}
                            theme="default"
                            customStyles={customStyles}
                            highlightOnHover
                            pointerOnHover
                            pagination
                            {...(handles && handles.length > 0 && handles[0].values.length > 1 ? {
                                columns: columnsDetailed,
                                expandableRows: true,
                                expandOnRowClicked: true,
                                expandableRowsComponent: ExpandedComponent
                            } : {
                                columns: columns
                            })} />
                    </>
                )}
            </div>
        </div>
    );
};

export default PrefixLookup;
