import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Companies from './pages/Companies';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import Recommendations from './pages/Recommendations';
import MLPredictions from './pages/MLPredictions';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

function ProtectedRoute({ children }) {
  const user = localStorage.getItem('user');
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><AppLayout><Students /></AppLayout></ProtectedRoute>} />
        <Route path="/companies" element={<ProtectedRoute><AppLayout><Companies /></AppLayout></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><AppLayout><Jobs /></AppLayout></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><AppLayout><Applications /></AppLayout></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><AppLayout><Recommendations /></AppLayout></ProtectedRoute>} />
        <Route path="/ml" element={<ProtectedRoute><AppLayout><MLPredictions /></AppLayout></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
