import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Budget from './pages/Budget';
import SetBudget from './pages/SetBudget';
import Savings from './pages/Savings';
import Export from './pages/Export';
import Forum from './pages/Forum';
import Profile from './pages/Profile';

function ProtectedPage({ children }) {
    return (
        <ProtectedRoute>
            <Layout>{children}</Layout>
        </ProtectedRoute>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Protected routes */}
                    <Route path="/" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
                    <Route path="/analytics" element={<ProtectedPage><Analytics /></ProtectedPage>} />
                    <Route path="/budget" element={<ProtectedPage><Budget /></ProtectedPage>} />
                    <Route path="/set-budget" element={<ProtectedPage><SetBudget /></ProtectedPage>} />
                    <Route path="/savings" element={<ProtectedPage><Savings /></ProtectedPage>} />
                    <Route path="/export" element={<ProtectedPage><Export /></ProtectedPage>} />
                    <Route path="/forum" element={<ProtectedPage><Forum /></ProtectedPage>} />
                    <Route path="/profile" element={<ProtectedPage><Profile /></ProtectedPage>} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
