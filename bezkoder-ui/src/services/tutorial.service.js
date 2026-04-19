import http from "../http-common";

class TutorialDataService {
  getAll(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.title) queryParams.append("title", params.title);
    if (params.status) queryParams.append("status", params.status);
    if (params.minDescriptionLength)
      queryParams.append("minDescriptionLength", params.minDescriptionLength);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);

    const queryString = queryParams.toString();
    return http.get(`/tutorials${queryString ? `?${queryString}` : ""}`);
  }

  get(id) {
    return http.get(`/tutorials/${id}`);
  }

  create(data) {
    return http.post("/tutorials", data);
  }

  update(id, data) {
    return http.put(`/tutorials/${id}`, data);
  }

  delete(id) {
    return http.delete(`/tutorials/${id}`);
  }

  deleteAll() {
    return http.delete(`/tutorials`);
  }

  findByTitle(title) {
    return http.get(`/tutorials?title=${title}`);
  }
}

export default new TutorialDataService();
