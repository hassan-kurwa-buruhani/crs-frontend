import React, { useState, useEffect } from 'react';
import {
  Box, Typography, useTheme, Button, useMediaQuery,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  LocalHospital as CasesIcon,
  PersonAdd as NewCasesIcon,
  Healing as RecoveredIcon,
  SentimentVeryDissatisfied as DeceasedIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ModernTable from '../components/Table';
import { useNavigate } from 'react-router-dom';


import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();

  const [dashboardData, setDashboardData] = useState({
    totalCases: 0,
    newCases: 0,
    recovered: 0,
    deceased: 0,
    loading: true,
    patients: []
  });

  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDirection, setSortDirection] = useState('asc');
  const [sortBy, setSortBy] = useState('first_name');

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await axios.get(`${apiUrl}doctor/patients/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        const patients = response.data.map(patient => ({
          ...patient,
          name: `${patient.first_name} ${patient.last_name}`,
          created_at: new Date(patient.created_at).toLocaleDateString(),
          updated_at: new Date(patient.updated_at).toLocaleDateString()
        }));

        const today = new Date().toISOString().split('T')[0];

        setDashboardData({
          totalCases: patients.length,
          newCases: patients.filter(patient =>
            new Date(patient.created_at).toISOString().split('T')[0] === today
          ).length,
          recovered: patients.filter(patient => patient.status === 'Recovered').length,
          deceased: patients.filter(patient => patient.status === 'Dead').length,
          loading: false,
          patients: patients
        });
      } catch (error) {
        console.error('Error fetching patient data:', error);
        setDashboardData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchPatientData();
  }, []);

  const handleOpenModal = (type) => {
    let filtered = [];
    let title = '';

    switch (type) {
      case 'total':
        filtered = dashboardData.patients;
        title = 'All Patients';
        break;
      case 'new':
        const today = new Date().toISOString().split('T')[0];
        filtered = dashboardData.patients.filter(patient =>
          new Date(patient.created_at).toISOString().split('T')[0] === today
        );
        title = 'New Cases Today';
        break;
      case 'recovered':
        filtered = dashboardData.patients.filter(patient => patient.status === 'Recovered');
        title = 'Recovered Patients';
        break;
      case 'deceased':
        filtered = dashboardData.patients.filter(patient => patient.status === 'Dead');
        title = 'Deceased Patients';
        break;
      default:
        filtered = [];
    }

    setFilteredPatients(filtered);
    setModalTitle(title);
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (columnId) => {
    const isAsc = sortBy === columnId && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(columnId);
  };

  const handleUpdatePatient = (patient) => {
    navigate(`/patients/${patient.id}/update`);
    };

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const isAsc = sortDirection === 'asc';
    if (a[sortBy] < b[sortBy]) return isAsc ? -1 : 1;
    if (a[sortBy] > b[sortBy]) return isAsc ? 1 : -1;
    return 0;
  });

  const columns = [
    { id: 'name', label: 'Patient Name', minWidth: 150, sortable: true },
    { id: 'age', label: 'Age', minWidth: 50, sortable: true },
    { id: 'gender', label: 'Gender', minWidth: 80, sortable: true },
    { id: 'street', label: 'Street', minWidth: 100, sortable: true },
    { id: 'condition', label: 'Condition', minWidth: 100, sortable: true },
    { id: 'status', label: 'Status', minWidth: 100, sortable: true },
    { id: 'created_at', label: 'Date Registered', minWidth: 120, sortable: true },
    { id: 'actions', label: 'Actions', minWidth: 120, sortable: false },
  ];

  const Card = ({ title, value, icon, color, type }) => (
    <Box sx={{
      backgroundColor: theme.palette.background.paper,
      borderRadius: 2,
      p: 1.2,
      boxShadow: theme.shadows[1],
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1 20%',
      minWidth: isMobile ? '140px' : '160px',
      mx: 1
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
        <Box sx={{
          backgroundColor: color,
          color: theme.palette.getContrastText(color),
          p: 0.7,
          borderRadius: '50%',
          display: 'flex'
        }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 'bold' }}>
        {dashboardData.loading ? '...' : value.toLocaleString()}
      </Typography>
      <Button
        variant="text"
        size="small"
        sx={{
          mt: 'auto',
          alignSelf: 'flex-start',
          color: theme.palette.primary.main,
          textTransform: 'none',
          p: 0
        }}
        onClick={() => handleOpenModal(type)}
        disabled={dashboardData.loading}
      >
        View →
      </Button>
    </Box>
  );

  const monthlyCounts = {};
  dashboardData.patients.forEach(patient => {
    const month = new Date(patient.created_at).toLocaleString('default', { month: 'short' });
    monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
  });
  const barData = Object.entries(monthlyCounts).map(([month, count]) => ({ month, count }));

  const ageGroups = [
    { name: '0-5', min: 0, max: 5 },
    { name: '6-15', min: 6, max: 15 },
    { name: '16-20', min: 16, max: 20 },
    { name: '21-30', min: 21, max: 30 },
    { name: '31-40', min: 31, max: 40 },
    { name: '41-50', min: 41, max: 50 },
    { name: '51-60', min: 51, max: 60 },
    { name: '61-70', min: 61, max: 70 },
    { name: '71-80', min: 71, max: 80 },
  ];
  const pieData = ageGroups.map(group => ({
    name: group.name,
    value: dashboardData.patients.filter(p => p.age >= group.min && p.age <= group.max).length
  })).filter(group => group.value > 0);

  const COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1',
    '#ff7f50', '#a4de6c', '#d0ed57'
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Cholera Outbreak Dashboard
      </Typography>
      {user && (
        <Typography variant="subtitle2" color="text.secondary">
          Welcome, Dr. {user.first_name}
        </Typography>
      )}

      <Box sx={{
        display: 'flex',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        gap: 2,
        py: 1.5,
        maxWidth: '100%',
        '&::-webkit-scrollbar': { height: '4px' },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.divider,
          borderRadius: 2
        }
      }}>
        <Card title="TOTAL CASES" value={dashboardData.totalCases} icon={<CasesIcon fontSize="small" />} color={theme.palette.primary.light} type="total" />
        <Card title="NEW CASES" value={dashboardData.newCases} icon={<NewCasesIcon fontSize="small" />} color={theme.palette.info.light} type="new" />
        <Card title="RECOVERED" value={dashboardData.recovered} icon={<RecoveredIcon fontSize="small" />} color={theme.palette.success.light} type="recovered" />
        <Card title="DECEASED" value={dashboardData.deceased} icon={<DeceasedIcon fontSize="small" />} color={theme.palette.error.light} type="deceased" />
      </Box>

      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 3,
        width: '100%',
        mt: 2
      }}>
        <Box sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          p: 2,
          boxShadow: theme.shadows[1],
          flex: '1',
        }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Monthly Case Trends
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="month" stroke={theme.palette.text.primary} />
              <YAxis allowDecimals={false} stroke={theme.palette.text.primary} />
              <Tooltip />
              <Bar dataKey="count" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          p: 2,
          boxShadow: theme.shadows[1],
          flex: isMobile ? '0 0 auto' : '0 0 30%',
        }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Age Group Breakdown
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                label
                outerRadius={isMobile ? 80 : 100}
                fill={theme.palette.primary.main}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: 2 } }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.common.white
        }}>
          {modalTitle}
          <Button onClick={handleCloseModal} color="inherit" sx={{ minWidth: 0 }}>
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <ModernTable
            columns={columns}
            data={sortedPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => ({
              ...row,
              actions: row.status !== 'Dead' ? (
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleUpdatePatient(row)}
                >
                  update
                </Button>
              ) : null
            }))}
            page={page}
            rowsPerPage={rowsPerPage}
            totalRows={filteredPatients.length}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            sortDirection={sortDirection}
            sortBy={sortBy}
            onSort={handleSort}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorDashboard;
