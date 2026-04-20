import React, { Component } from "react";
import TutorialDataService from "../services/tutorial.service";
import { Link, withRouter } from "react-router-dom";

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

class TutorialsList extends Component {
  constructor(props) {
    super(props);

    const queryParams = new URLSearchParams(this.props.location.search);
    
    this.state = {
      tutorials: [],
      currentTutorial: null,
      currentIndex: -1,
      searchTitle: queryParams.get("title") || "",
      status: queryParams.get("status") || "",
      sortBy: queryParams.get("sortBy") || "newest",
      minDescriptionLength: parseInt(queryParams.get("minDescriptionLength")) || 0
    };

    this.onChangeSearchTitle = this.onChangeSearchTitle.bind(this);
    this.onChangeStatus = this.onChangeStatus.bind(this);
    this.onChangeSortBy = this.onChangeSortBy.bind(this);
    this.onChangeMinDescriptionLength = this.onChangeMinDescriptionLength.bind(this);
    this.retrieveTutorials = this.retrieveTutorials.bind(this);
    this.refreshList = this.refreshList.bind(this);
    this.setActiveTutorial = this.setActiveTutorial.bind(this);
    this.removeAllTutorials = this.removeAllTutorials.bind(this);
    this.resetFilters = this.resetFilters.bind(this);
    this.debouncedUpdateUrlAndFetch = debounce(this.updateUrlAndFetch.bind(this), 300);
  }

  componentDidMount() {
    this.retrieveTutorials();
  }

  updateUrlAndFetch() {
    const { searchTitle, status, sortBy, minDescriptionLength } = this.state;
    const queryParams = new URLSearchParams();
    
    if (searchTitle) queryParams.set("title", searchTitle);
    if (status) queryParams.set("status", status);
    if (sortBy && sortBy !== "newest") queryParams.set("sortBy", sortBy);
    if (minDescriptionLength > 0) queryParams.set("minDescriptionLength", minDescriptionLength);
    
    const queryString = queryParams.toString();
    const newPath = `/tutorials${queryString ? `?${queryString}` : ""}`;
    
    this.props.history.push(newPath);
    this.retrieveTutorials();
  }

  onChangeSearchTitle(e) {
    const searchTitle = e.target.value;
    this.setState({ searchTitle }, () => {
      this.debouncedUpdateUrlAndFetch();
    });
  }

  onChangeStatus(e) {
    const status = e.target.value;
    this.setState({ status }, () => {
      this.updateUrlAndFetch();
    });
  }

  onChangeSortBy(e) {
    const sortBy = e.target.value;
    this.setState({ sortBy }, () => {
      this.updateUrlAndFetch();
    });
  }

  onChangeMinDescriptionLength(e) {
    const minDescriptionLength = parseInt(e.target.value);
    this.setState({ minDescriptionLength }, () => {
      this.debouncedUpdateUrlAndFetch();
    });
  }

  retrieveTutorials() {
    const { searchTitle, status, sortBy, minDescriptionLength } = this.state;
    
    const params = {};
    if (searchTitle) params.title = searchTitle;
    if (status) params.status = status;
    if (sortBy) params.sortBy = sortBy;
    if (minDescriptionLength > 0) params.minDescriptionLength = minDescriptionLength;

    TutorialDataService.getAll(params)
      .then(response => {
        this.setState({
          tutorials: response.data,
          currentTutorial: null,
          currentIndex: -1
        });
        console.log("Tutorials retrieved:", response.data);
      })
      .catch(e => {
        console.error("Error retrieving tutorials:", e);
      });
  }

  refreshList() {
    this.retrieveTutorials();
    this.setState({
      currentTutorial: null,
      currentIndex: -1
    });
  }

  setActiveTutorial(tutorial, index) {
    this.setState({
      currentTutorial: tutorial,
      currentIndex: index
    });
  }

  removeAllTutorials() {
    TutorialDataService.deleteAll()
      .then(response => {
        console.log(response.data);
        this.refreshList();
      })
      .catch(e => {
        console.log(e);
      });
  }

  resetFilters() {
    this.setState({
      searchTitle: "",
      status: "",
      sortBy: "newest",
      minDescriptionLength: 0
    }, () => {
      this.props.history.push("/tutorials");
      this.retrieveTutorials();
    });
  }

  hasActiveFilters() {
    const { searchTitle, status, sortBy, minDescriptionLength } = this.state;
    return searchTitle !== "" || status !== "" || sortBy !== "newest" || minDescriptionLength > 0;
  }

  renderEmptyState() {
    return (
      <div className="text-center py-5">
        <div className="mb-4">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6c757d"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="9" x2="15" y2="9" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </div>
        <h5 className="text-muted mb-2">No tutorials found</h5>
        <p className="text-muted mb-4">
          Try adjusting your search or filter criteria
        </p>
        {this.hasActiveFilters() && (
          <button
            className="btn btn-primary"
            onClick={this.resetFilters}
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  render() {
    const { searchTitle, tutorials, currentTutorial, currentIndex, status, sortBy, minDescriptionLength } = this.state;

    return (
      <div className="list row">
        <div className="col-md-12">
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by title"
              value={searchTitle}
              onChange={this.onChangeSearchTitle}
            />
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <div className="row align-items-end">
                <div className="col-md-3 mb-3 mb-md-0">
                  <label className="form-label font-weight-bold">Status</label>
                  <select
                    className="form-control"
                    value={status}
                    onChange={this.onChangeStatus}
                  >
                    <option value="">All</option>
                    <option value="published">Published</option>
                    <option value="unpublished">Unpublished</option>
                  </select>
                </div>

                <div className="col-md-3 mb-3 mb-md-0">
                  <label className="form-label font-weight-bold">Sort By</label>
                  <select
                    className="form-control"
                    value={sortBy}
                    onChange={this.onChangeSortBy}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>

                <div className="col-md-4 mb-3 mb-md-0">
                  <label className="form-label font-weight-bold">
                    Min Description Length: {minDescriptionLength} chars
                  </label>
                  <input
                    type="range"
                    className="custom-range"
                    min="0"
                    max="500"
                    step="10"
                    value={minDescriptionLength}
                    onChange={this.onChangeMinDescriptionLength}
                  />
                  <small className="form-text text-muted">
                    Filter by description length (0 = no filter)
                  </small>
                </div>

                <div className="col-md-2 text-md-right">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={this.resetFilters}
                    disabled={!this.hasActiveFilters()}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <h4>Tutorials List</h4>

          {tutorials && tutorials.length > 0 ? (
            <>
              <ul className="list-group">
                {tutorials.map((tutorial, index) => (
                  <li
                    className={
                      "list-group-item " +
                      (index === currentIndex ? "active" : "")
                    }
                    onClick={() => this.setActiveTutorial(tutorial, index)}
                    key={index}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span>{tutorial.title}</span>
                      <span
                        className={`badge ${
                          tutorial.published ? "badge-success" : "badge-warning"
                        }`}
                      >
                        {tutorial.published ? "Published" : "Pending"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              <button
                className="m-3 btn btn-sm btn-danger"
                onClick={this.removeAllTutorials}
              >
                Remove All
              </button>
            </>
          ) : (
            this.renderEmptyState()
          )}
        </div>

        <div className="col-md-6">
          {currentTutorial ? (
            <div>
              <h4>Tutorial</h4>
              <div>
                <label>
                  <strong>Title:</strong>
                </label>{" "}
                {currentTutorial.title}
              </div>
              <div>
                <label>
                  <strong>Description:</strong>
                </label>{" "}
                {currentTutorial.description}
              </div>
              <div>
                <label>
                  <strong>Description Length:</strong>
                </label>{" "}
                {currentTutorial.description ? currentTutorial.description.length : 0} chars
              </div>
              <div>
                <label>
                  <strong>Status:</strong>
                </label>{" "}
                {currentTutorial.published ? "Published" : "Pending"}
              </div>
              <div>
                <label>
                  <strong>Created At:</strong>
                </label>{" "}
                {currentTutorial.createdAt ? new Date(currentTutorial.createdAt).toLocaleString() : "N/A"}
              </div>

              <Link
                to={"/tutorials/" + currentTutorial.id}
                className="badge badge-warning"
              >
                Edit
              </Link>
            </div>
          ) : (
            <div>
              <br />
              <p>Please click on a Tutorial...</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default withRouter(TutorialsList);
