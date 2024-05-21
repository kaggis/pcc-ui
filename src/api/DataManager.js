class DataManager {
  endpoint = "";
  token = "";
  headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  constructor(endpoint, token) {
    this.endpoint = endpoint;
    this.token = token;
  }

  doSend(method = "POST", url = "", data = {}) {
    return fetch(url, {
      method: method,
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: this.headers,
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((result) => {
        return result;
      })
      .catch((error) => console.log(error));
  }

  doGet(url, resourceName) {
    return fetch(url, { headers: this.headers })
      .then((res) => res.json())
      .then((result) => {
        return result;
      })
      .catch((error) => console.log(error));
  }

  getDomains() {
    let url = this.endpoint + "/domains";
    return this.doGet(url, "domains");
  }

  getProviders() {
    let url = this.endpoint + "/providers";
    return this.doGet(url, "providers");
  }

  getPrefixes(id) {
    if (id) {
      return this.doGet(this.endpoint + "/prefixes/" + id, "prefixes");
    }
    else {

      let url = this.endpoint + "/prefixes";
      let allPrefixes = []; // all prefixes

      const fetchPage = async (page) => {
        const response = await this.doGet(`${url}?page=${page}`);
        const { content, links } = response;

        allPrefixes = allPrefixes.concat(content);

        const nextPageLink = links.find(link => link.rel === 'next');
        if (nextPageLink) {
          const nextPage = new URL(nextPageLink.href).searchParams.get('page');
          await fetchPage(nextPage);
        }
      };

      return fetchPage(1)
        .then(() => allPrefixes)
        .catch((error) => console.error("Error fetching prefixes:", error));
    }
  }

  updateStatisticsByPrefixID(id, data) {
    let url = this.endpoint + "/prefixes/" + id + "/statistics";
    return this.doSend("POST", url, data);
  }

  getStatisticsByPrefixID(id) {
    let url = this.endpoint + "/prefixes/" + id + "/statistics";
    return this.doGet(url, "pid_count");
  }

  getServices() {
    let url = this.endpoint + "/services";
    return this.doGet(url, "services");
  }

  getReverseLookUpFilters() {
    let url = this.endpoint + "/reverse-lookup/filters";
    return this.doGet(url, "filters");
  }

  getReverseLookUpTypes() {
    let url = this.endpoint + "/reverse-lookup/types";
    return this.doGet(url, "filters");
  }

  getCodelist() {
    let url = this.endpoint + "/codelist";
    return this.doGet(url, "codelist");
  }

  getCodelistCategory(category) {
    let url = this.endpoint + "/codelist";
    url += `?category=${category}`;
    return this.doGet(url, "codelist");
  }

  getCodelistLookup() {
    let url = this.endpoint + "/codelist?category=lookup_service_type";
    return this.doGet(url, "codelist");
  }

  getCodelistContract() {
    let url = this.endpoint + "/codelist?category=contract_type";
    return this.doGet(url, "codelist");
  }

  addPrefix(data) {
    let url = this.endpoint + "/prefixes";
    return this.doSend("POST", url, data);
  }

  reverseLookUp(pageIndex, pageSize, data) {
    let url = this.endpoint + "/reverse-lookup";
    url += `?page=${pageIndex}`;
    url += `&limit=${pageSize}`;
    return this.doSend("POST", url, data);
  }

  deletePrefix(id) {
    let url;
    if (id) {
      url = this.endpoint + "/prefixes/" + id;
    }
    return this.doSend("DELETE", url, {});
  }

  updatePrefix(id, method, data) {
    let url;
    if (id) {
      url = this.endpoint + "/prefixes/" + id;
    }
    return this.doSend(method, url, data);
  }
}

export default DataManager;