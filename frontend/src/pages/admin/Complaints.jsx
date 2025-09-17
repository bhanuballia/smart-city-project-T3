import React, { useState, useEffect } from "react";
import axios from "../../api/axios";

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    cityRegion: "",
    problemRelated: ""
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    resolution: "",
    assignedTo: ""
  });

  useEffect(() => {
    fetchComplaints();
  }, [filters, pagination.current]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current,
        limit: 10,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ""))
      });

      const response = await axios.get(`/api/complaints?${params}`);
      setComplaints(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setError("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComplaint = async (complaintId) => {
    try {
      const response = await axios.put(`/api/complaints/${complaintId}`, updateForm);
      
      // Update the complaint in the list
      setComplaints(prev => 
        prev.map(complaint => 
          complaint._id === complaintId ? response.data.data : complaint
        )
      );
      
      setSelectedComplaint(null);
      setUpdateForm({ status: "", resolution: "", assignedTo: "" });
      alert("Complaint updated successfully!");
    } catch (error) {
      console.error("Error updating complaint:", error);
      alert("Failed to update complaint");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Resolved": return "bg-green-100 text-green-800";
      case "Closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Low": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📋 Complaint Management</h1>
        <p className="text-gray-600">Manage and track citizen complaints</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="p-2 border rounded-lg"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
            className="p-2 border rounded-lg"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <select
            value={filters.cityRegion}
            onChange={(e) => setFilters({...filters, cityRegion: e.target.value})}
            className="p-2 border rounded-lg"
          >
            <option value="">All Regions</option>
            <option value="Gomti Nagar">Gomti Nagar</option>
            <option value="Haazaratganj">Haazaratganj</option>
            <option value="Kaiserbagh">Kaiserbagh</option>
          </select>

          <select
            value={filters.problemRelated}
            onChange={(e) => setFilters({...filters, problemRelated: e.target.value})}
            className="p-2 border rounded-lg"
          >
            <option value="">All Problem Types</option>
            <option value="Water">Water</option>
            <option value="Electricity">Electricity</option>
            <option value="Waste">Waste</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complaint #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Citizen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Problem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complaints.map((complaint) => (
                <tr key={complaint._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {complaint.complaintNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{complaint.name}</div>
                      <div className="text-gray-500">{complaint.contact}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{complaint.problemRelated}</div>
                      {complaint.otherProblem && (
                        <div className="text-gray-500 text-xs">{complaint.otherProblem}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {complaint.cityRegion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedComplaint(complaint)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View/Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPagination({...pagination, current: Math.max(1, pagination.current - 1)})}
              disabled={pagination.current === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination({...pagination, current: Math.min(pagination.pages, pagination.current + 1)})}
              disabled={pagination.current === pagination.pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((pagination.current - 1) * 10) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(pagination.current * 10, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPagination({...pagination, current: Math.max(1, pagination.current - 1)})}
                  disabled={pagination.current === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination({...pagination, current: Math.min(pagination.pages, pagination.current + 1)})}
                  disabled={pagination.current === pagination.pages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Complaint #{selectedComplaint.complaintNumber}
                </h3>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-700">Citizen Information</h4>
                  <p><strong>Name:</strong> {selectedComplaint.name}</p>
                  <p><strong>Age:</strong> {selectedComplaint.age}</p>
                  <p><strong>Contact:</strong> {selectedComplaint.contact}</p>
                  <p><strong>Email:</strong> {selectedComplaint.email}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Address</h4>
                  <p><strong>House No:</strong> {selectedComplaint.houseNo}</p>
                  <p><strong>Street:</strong> {selectedComplaint.street}</p>
                  <p><strong>Region:</strong> {selectedComplaint.cityRegion}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-700">Problem Details</h4>
                <p><strong>Type:</strong> {selectedComplaint.problemRelated}</p>
                {selectedComplaint.otherProblem && (
                  <p><strong>Other:</strong> {selectedComplaint.otherProblem}</p>
                )}
                <p><strong>Description:</strong></p>
                <p className="bg-gray-100 p-3 rounded mt-2">{selectedComplaint.explanation}</p>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-700">Update Complaint</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={updateForm.status || selectedComplaint.status}
                      onChange={(e) => setUpdateForm({...updateForm, status: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedComplaint.priority)}`}>
                      {selectedComplaint.priority}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resolution</label>
                  <textarea
                    value={updateForm.resolution || selectedComplaint.resolution || ""}
                    onChange={(e) => setUpdateForm({...updateForm, resolution: e.target.value})}
                    placeholder="Enter resolution details..."
                    className="w-full p-2 border rounded-lg"
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateComplaint(selectedComplaint._id)}
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                >
                  Update Complaint
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
