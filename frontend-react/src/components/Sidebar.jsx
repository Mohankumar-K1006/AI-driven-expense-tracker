import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, BarChart3, Wallet, DollarSign, PiggyBank,
    Download, MessageSquare, User, LogOut
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
    const [open, setOpen] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/login');
    }

    function closeSidebar() {
        setOpen(false);
    }

    return (
        <>
            <button
                className={`sidebar-toggle ${open ? 'open' : ''}`}
                onClick={() => setOpen(!open)}
                aria-label="Toggle sidebar"
                aria-expanded={open}
            >
                <span></span><span></span><span></span>
            </button>

            <div
                className={`sidebar-overlay ${open ? 'visible' : ''}`}
                onClick={closeSidebar}
            />

            <aside className={`sidebar ${open ? 'open' : ''}`} role="navigation" aria-label="Main navigation">
                <NavLink to="/" className="sidebar-brand" onClick={closeSidebar}>
                    <div className="brand-icon">
                        <Wallet size={20} />
                    </div>
                    <span className="brand-text">ExpenseTracker</span>
                </NavLink>

                <nav className="sidebar-nav">
                    <div className="sidebar-section">Main</div>
                    <NavLink to="/" end onClick={closeSidebar} id="nav-dashboard">
                        <span className="nav-icon"><LayoutDashboard size={20} /></span>
                        <span className="nav-label">Dashboard</span>
                    </NavLink>
                    <NavLink to="/analytics" onClick={closeSidebar} id="nav-analytics">
                        <span className="nav-icon"><BarChart3 size={20} /></span>
                        <span className="nav-label">Analytics</span>
                    </NavLink>

                    <div className="sidebar-section">Finance</div>
                    <NavLink to="/budget" onClick={closeSidebar} id="nav-budget">
                        <span className="nav-icon"><Wallet size={20} /></span>
                        <span className="nav-label">Budget</span>
                    </NavLink>
                    <NavLink to="/set-budget" onClick={closeSidebar} id="nav-set-budget">
                        <span className="nav-icon"><DollarSign size={20} /></span>
                        <span className="nav-label">Set Budget</span>
                    </NavLink>
                    <NavLink to="/savings" onClick={closeSidebar} id="nav-savings">
                        <span className="nav-icon"><PiggyBank size={20} /></span>
                        <span className="nav-label">Savings</span>
                    </NavLink>

                    <div className="sidebar-section">Tools</div>
                    <NavLink to="/export" onClick={closeSidebar} id="nav-export">
                        <span className="nav-icon"><Download size={20} /></span>
                        <span className="nav-label">Export</span>
                    </NavLink>
                    <NavLink to="/forum" onClick={closeSidebar} id="nav-forum">
                        <span className="nav-icon"><MessageSquare size={20} /></span>
                        <span className="nav-label">Community</span>
                    </NavLink>
                    <NavLink to="/profile" onClick={closeSidebar} id="nav-profile">
                        <span className="nav-icon"><User size={20} /></span>
                        <span className="nav-label">Profile</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <button className="sidebar-logout" onClick={handleLogout} aria-label="Logout">
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
