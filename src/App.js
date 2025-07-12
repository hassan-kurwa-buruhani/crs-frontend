import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OverallLayout from './layouts/OverallLayout';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login'; // Import your Login component
import ProtectedRoute from './components/ProtectedRoute'; // You'll need to create this
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            {/* Login page without layout */}
            <Route path="/" element={<Login />} />
            
            {/* All protected routes with layout */}
            <Route element={
              <OverallLayout>
                {/* <ProtectedRoute /> */}
              </OverallLayout>
            }>
              {/* <Route path="/" element={<Dashboard />} /> */}
              <Route path="/dashboard" element={<Dashboard />} />
              {/* Add more protected routes as needed */}
              {/* <Route path="/users" element={<Users />} /> */}
              {/* <Route path="/settings" element={<Settings />} /> */}
            </Route>
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