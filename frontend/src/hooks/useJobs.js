import { useState, useEffect, useCallback } from 'react';
import jobService from '../services/jobService';

export const useJobs = (initialFilters = {}) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    count: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    employmentType: '',
    workArrangement: '',
    experienceLevel: '',
    minSalary: '',
    maxSalary: '',
    skills: '',
    page: 1,
    limit: 10,
    ...initialFilters,
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Remove empty filters
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await jobService.getAllJobs(cleanFilters);
      
      setJobs(response.jobs || []);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        total: response.total,
        count: response.count,
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  const changePage = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      department: '',
      employmentType: '',
      workArrangement: '',
      experienceLevel: '',
      minSalary: '',
      maxSalary: '',
      skills: '',
      page: 1,
      limit: 10,
    });
  };

  return {
    jobs,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    resetFilters,
    refetch: fetchJobs,
  };
};

export default useJobs;