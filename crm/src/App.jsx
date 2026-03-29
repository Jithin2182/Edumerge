import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Programs from './pages/Programs';
import Applicants from './pages/Applicants';
import CreateApplicant from './pages/CreateApplicant';
import ApplicantDetail from './pages/ApplicantDetail';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* All authenticated routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applicants" element={<Applicants />} />
            <Route path="/applicants/:id" element={<ApplicantDetail />} />

            {/* ADMIN + ADMISSION_OFFICER only */}
            <Route element={<PrivateRoute roles={['ADMIN', 'ADMISSION_OFFICER']} />}>
              <Route path="/programs" element={<Programs />} />
              <Route path="/applicants/new" element={<CreateApplicant />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;

