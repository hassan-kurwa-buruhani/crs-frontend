import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import ModernTable from '../components/Table';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext'; 

const CaseReports = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination + sorting
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await axios.get(`${apiUrl}cases/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        console.log('Case:', response);
        setCases(response.data);
      } catch (error) {
        console.error('Error fetching cases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const handleDelete = async (caseId) => {
    const confirmed = window.confirm('Are you sure you want to delete this case report?');
    if (!confirmed) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      await axios.delete(`${apiUrl}cases/${caseId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      // Remove from local state
      setCases((prev) => prev.filter((c) => c.id !== caseId));
    } catch (error) {
      console.error('Error deleting case:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (columnId) => {
    const isAsc = sortBy === columnId && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(columnId);
  };

  const sortedCases = [...cases].sort((a, b) => {
    const isAsc = sortDirection === 'asc';
    if (a[sortBy] < b[sortBy]) return isAsc ? -1 : 1;
    if (a[sortBy] > b[sortBy]) return isAsc ? 1 : -1;
    return 0;
  });

  const columns = [
    { id: 'id', label: 'ID', minWidth: 50, sortable: true },
    {
      id: 'patient',
      label: 'Patient',
      minWidth: 150,
      sortable: false,
      format: (value) =>
        `${value.first_name} ${value.last_name} (${value.age} yrs)`
    },
    {
      id: 'health_center',
      label: 'Health Center',
      minWidth: 150,
      sortable: false,
    },
    {
      id: 'doctor_full_name',
      label: 'Doctor',
      minWidth: 150,
      sortable: false,
    },
    {
      id: 'district',
      label: 'District',
      minWidth: 120,
      sortable: false,
    },
    {
      id: 'date',
      label: 'Date',
      minWidth: 100,
      sortable: true,
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 200,
      sortable: false,
    },
  ];

  return (
    <Box sx={{ p: 5 }}>
      <Typography variant="h4" sx={{ mb: 6 }}>
        Case Reports
      </Typography>

      {user && !['Doctor', 'HealthSupervisor'].includes(user.role) && (
        <Box sx={{ mb: 2 }}>
          <Button variant="primary" onClick={() => navigate('/cases/new')}>
            + Add New Report
          </Button>
        </Box>
      )}

      <ModernTable
        columns={columns}
        data={sortedCases.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={cases.length}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        sortDirection={sortDirection}
        sortBy={sortBy}
        onSort={handleSort}
        onRowClick={(row) => navigate(`/cases/${row.id}`)}
      />

      {loading && (
        <Typography sx={{ mt: 2 }}>
          Loading cases...
        </Typography>
      )}
    </Box>
  );
};

export default CaseReports;
