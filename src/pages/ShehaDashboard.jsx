import React, { useState, useEffect } from 'react';
import {
  Box, Typography, useTheme, Button, useMediaQuery,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Paper
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
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const ShehaDashboard = () => {
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
        const response = await axios.get(`${apiUrl}cases/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        const patients = response.data.map(patient => ({
          ...patient,
          name: `${patient.patient.first_name} ${patient.patient.last_name}`,
          age: patient.patient.age,
          gender: patient.patient.gender,
          street: patient.patient.street,
          condition: patient.patient.condition,
          status: patient.patient.status,
          created_at: new Date(patient.date).toLocaleDateString(),
          updated_at: new Date(patient.date).toLocaleDateString()
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
        title = 'All Cases';
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
        title = 'Recovered Cases';
        break;
      case 'deceased':
        filtered = dashboardData.patients.filter(patient => patient.status === 'Dead');
        title = 'Deceased Cases';
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

  const handleUpdatePatient = (patient, e) => {
    e.stopPropagation(); // Prevent row click from triggering
    navigate(`/cases/${patient.id}/update`);
  };

  const handleRowClick = (patient) => {
    navigate(`/cases/${patient.id}`);
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
    { id: 'health_center', label: 'Health Center', minWidth: 120, sortable: true },
    { id: 'created_at', label: 'Date Reported', minWidth: 120, sortable: true },
    { id: 'actions', label: 'Actions', minWidth: 120, sortable: false },
  ];

  const Card = ({ title, value, icon, color, type }) => (
    <Box sx={{
      backgroundColor: theme.palette.background.paper,
      borderRadius: 2,
      p: 1.5,
      boxShadow: theme.shadows[2],
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1 20%',
      minWidth: isMobile ? '140px' : '180px',
      mx: 1,
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'scale(1.03)',
        boxShadow: theme.shadows[4]
      }
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
        <Box sx={{
          backgroundColor: color,
          color: theme.palette.getContrastText(color),
          p: 1,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold', color: color }}>
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
          p: 0,
          fontWeight: 'bold'
        }}
        onClick={() => handleOpenModal(type)}
        disabled={dashboardData.loading}
      >
        View Details →
      </Button>
    </Box>
  );

  // Process data for charts
  const monthlyCounts = {};
  dashboardData.patients.forEach(patient => {
    const month = new Date(patient.created_at).toLocaleString('default', { month: 'short' });
    monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
  });
  const barData = Object.entries(monthlyCounts).map(([month, count]) => ({ month, count }));

  const ageGroups = [
    { name: '0-5', min: 0, max: 5 },
    { name: '6-15', min: 6, max: 15 },
    { name: '16-25', min: 16, max: 25 },
    { name: '26-35', min: 26, max: 35 },
    { name: '36-45', min: 36, max: 45 },
    { name: '46-55', min: 46, max: 55 },
    { name: '56-65', min: 56, max: 65 },
    { name: '66+', min: 66, max: 120 }
  ];

  const pieData = ageGroups.map(group => ({
    name: group.name,
    value: dashboardData.patients.filter(p => p.age >= group.min && p.age <= group.max).length
  })).filter(group => group.value > 0);

  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
    '#8884d8', '#82ca9d', '#ffc658', '#ff7f50'
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', p: isMobile ? 1 : 3 }}>
      {user && (
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
        </Typography>
      )}

      {/* Summary Cards */}
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 2,
        py: 2,
        width: '100%',
        overflowX: 'auto',
        '&::-webkit-scrollbar': { height: '6px' },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.primary.main,
          borderRadius: 3
        }
      }}>
        <Card 
          title="TOTAL CASES" 
          value={dashboardData.totalCases} 
          icon={<CasesIcon fontSize="medium" />} 
          color={theme.palette.primary.main} 
          type="total" 
        />
        <Card 
          title="NEW CASES" 
          value={dashboardData.newCases} 
          icon={<NewCasesIcon fontSize="medium" />} 
          color={theme.palette.info.main} 
          type="new" 
        />
        <Card 
          title="RECOVERED" 
          value={dashboardData.recovered} 
          icon={<RecoveredIcon fontSize="medium" />} 
          color={theme.palette.success.main} 
          type="recovered" 
        />
        <Card 
          title="DECEASED" 
          value={dashboardData.deceased} 
          icon={<DeceasedIcon fontSize="medium" />} 
          color={theme.palette.error.main} 
          type="deceased" 
        />
      </Box>

      {/* Charts Section */}
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 3,
        width: '100%',
        mt: 3
      }}>
        {/* Monthly Trends Chart */}
        <Paper elevation={3} sx={{
          flex: 1,
          p: 2,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper
        }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Monthly Case Trends
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="count" 
                fill={theme.palette.primary.main} 
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Age Distribution Chart */}
        <Paper elevation={3} sx={{
          flex: isMobile ? 1 : 0.5,
          p: 2,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper
        }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Age Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={isMobile ? 100 : 120}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1500}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} cases`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Cases Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="xl"
        fullWidth
        sx={{ 
          '& .MuiDialog-paper': { 
            borderRadius: 2,
            maxHeight: '80vh'
          } 
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.common.white,
          py: 2,
          px: 3
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {modalTitle} ({filteredPatients.length})
          </Typography>
          <IconButton onClick={handleCloseModal} color="inherit">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <ModernTable
            columns={columns}
            data={sortedPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => ({
              ...row,
              actions: (
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={(e) => handleUpdatePatient(row, e)}
                  disabled={row.status === 'Dead'}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 'bold',
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: 'none'
                    }
                  }}
                >
                  {row.status !== 'Dead' ? 'Update' : 'Closed'}
                </Button>
              )
            }))}
            page={page}
            rowsPerPage={rowsPerPage}
            totalRows={filteredPatients.length}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            sortDirection={sortDirection}
            sortBy={sortBy}
            onSort={handleSort}
            onRowClick={handleRowClick}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: theme.palette.grey[100] }}>
          <Button 
            onClick={handleCloseModal} 
            variant="contained" 
            color="primary"
            sx={{
              fontWeight: 'bold',
              px: 3,
              py: 1
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShehaDashboard;