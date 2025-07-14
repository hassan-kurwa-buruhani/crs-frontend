import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import OverallLayout from './layouts/OverallLayout';
import { AuthProvider } from './context/AuthContext';
// import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import DoctorDashboard from './pages/DoctorDashboard';
import ShehaDashboard from './pages/ShehaDashboard';
import HealthSupervisorDashboard from './pages/HealthsupervisorDashboard';
import UpdatePatient from './pages/UpdatePatient';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});

const ProtectedLayout = () => {
  return (
    <ProtectedRoute>
      <OverallLayout>
        <Outlet /> {/* This is where child routes will render */}
      </OverallLayout>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public route - login as index page */}
            <Route path="/" element={<Login />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedLayout />}>
              {/* <Route path="/dashboard" element={<Dashboard />} /> */}
              <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
              <Route path="/sheha-dashboard" element={<ShehaDashboard />} />
              <Route path="/supervisor-dashboard" element={<HealthSupervisorDashboard />} />
              <Route path="/patients/:id/update" element={<UpdatePatient />} />
            </Route>
            
            {/* Redirect any unmatched paths */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;