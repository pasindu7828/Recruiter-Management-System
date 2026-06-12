import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Search,
  ChevronDown,
  Plus,
  Download,
  Trash2,
  ChevronLeft
} from 'lucide-react';
import { getAllUsers, deleteUser } from '../../services/userService';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getAllUsers();
        // Defensive mapping based on common API response structures
        let usersArray = [];
        if (Array.isArray(data)) {
          usersArray = data;
        } else if (data && Array.isArray(data.users)) {
          usersArray = data.users;
        } else if (data && Array.isArray(data.data)) {
          usersArray = data.data;
        }
        setUsers(usersArray);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(u => (u._id || u.id) !== userId));
      } catch (err) {
        alert(err.message || 'Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter((user) => {
    const displayName = user.name || (user.firstName ? `${user.firstName} ${user.lastName || ''}` : '');

    const matchesSearch =
      displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());

    const statusVal = user.status || 'Active';
    const roleVal = user.role || 'N/A';

    // Exclude Admin accounts from display
    if (roleVal.toLowerCase() === 'admin') {
      return false;
    }

    // Case-insensitive match for roles and status
    const matchesRole = roleFilter === 'All Roles' ||
      roleVal.toLowerCase() === roleFilter.toLowerCase();

    const matchesStatus = statusFilter === 'All Status' ||
      statusVal.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleExport = () => {
    if (filteredUsers.length === 0) {
      alert('No users to export');
      return;
    }

    const headers = ['Name', 'Email', 'Role', 'Mobile No', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => {
        const displayName = user.name || (user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Unknown User');
        const email = user.email || '';
        const role = user.role || 'N/A';
        const phone = user.phone || 'N/A';
        const statusVal = user.status || 'Active';
        
        return [
          `"${displayName.replace(/"/g, '""')}"`,
          `"${email.replace(/"/g, '""')}"`,
          `"${role.replace(/"/g, '""')}"`,
          `"${phone.replace(/"/g, '""')}"`,
          `"${statusVal.replace(/"/g, '""')}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'users_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Calculate generic available roles/status from users for the filters
  // (Alternatively, we can keep the hardcoded ones if preferred)

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-[#f0f0f5] font-sans text-gray-800 flex flex-col">
      <Header active="User Management" role="admin" />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-28">

      {/* Breadcrumb Section */}
      {/* <div className="flex items-center text-sm text-gray-500 mb-6">
        <span className="hover:text-gray-700 cursor-pointer">Admin</span>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="font-medium text-gray-900">User Management</span>
      </div> */}

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-500 text-lg">Manage system users</p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset page on filter changes
              }}
            />
          </div>

          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer w-full md:w-auto"
            >
              <option>All Roles</option>
              <option>HR Manager</option>
              <option>Recruiter</option>
              {/* <option>Admin</option> */}
              <option>Interviewer</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer w-full md:w-auto"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Disabled</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Users ({filteredUsers.length})</h2>
          <button 
            onClick={handleExport}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading users...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : currentUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No users found.</div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Mobile No</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  {/* <th className="px-6 py-4 font-medium">Last Login</th> */}
                  <th className="px-6 py-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentUsers.map((user) => {
                  const uniqueId = user._id || user.id;
                  const displayName = user.name || (user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Unknown User');
                  const avatarUrl = user.avatar || user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
                  const statusVal = user.status || 'Active'; // default if missing

                  return (
                    <tr key={uniqueId} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                          <div>
                            <div className="font-semibold text-gray-900">{displayName}</div>
                            <div className="text-gray-500 text-xs mt-0.5">{user.email || 'No email provided'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">{user.role || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-500">{user.phone || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${statusVal === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {statusVal}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(uniqueId)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 inline-flex items-center justify-center"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination Section */}
      {
        !loading && !error && filteredUsers.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
            <div className="mb-4 sm:mb-0">
              Showing <span className="font-medium text-gray-900">{indexOfFirstUser + 1}</span> to <span className="font-medium text-gray-900">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of <span className="font-medium text-gray-900">{filteredUsers.length}</span> users
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              {getPageNumbers().map(num => (
                <button
                  key={num}
                  onClick={() => paginate(num)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium transition-colors ${currentPage === num
                    ? 'bg-[#4c1d95] text-white'
                    : 'border border-transparent hover:bg-gray-100 text-gray-600'
                    }`}
                >
                  {num}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors ml-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )
      }
      </main>

      <Footer />
    </div >
  );
}
