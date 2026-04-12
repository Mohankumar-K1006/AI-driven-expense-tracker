/**
 * navbar.js
 * Injects a left sidebar navigation into any page that includes this script.
 * Usage: <script src="navbar.js"></script>  (before closing </body>)
 */

(function () {
    /* ── Detect current page to mark active link ── */
    const page = location.pathname.split('/').pop() || 'dashboard.html';

    function isActive(href) {
        return page === href ? 'active' : '';
    }

    /* ── SVG Icon Helper ── */
    const icons = {
        dashboard: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
        budget: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>',
        setBudget: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
        savings: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2"/><path d="M2 9.1C1.3 9.5 1 10 1 10.8V14h2"/><circle cx="12.5" cy="11.5" r=".5"/></svg>',
        analytics: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        exportIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
        forum: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
        profile: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        logout: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
        wallet: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>'
    };

    /* ── Sidebar HTML ── */
    const sidebarHTML = `
    <button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle sidebar" aria-expanded="false">
        <span></span><span></span><span></span>
    </button>

    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <aside class="sidebar" id="sidebar" role="navigation" aria-label="Main navigation">

        <!-- Brand -->
        <a href="dashboard.html" class="sidebar-brand">
            <div class="brand-icon">${icons.wallet}</div>
            <span class="brand-text">ExpenseTracker</span>
        </a>

        <!-- Nav Links -->
        <nav class="sidebar-nav">
            <div class="sidebar-section">Main</div>
            <a href="dashboard.html" class="${isActive('dashboard.html')}" id="nav-dashboard">
                <span class="nav-icon">${icons.dashboard}</span>
                <span class="nav-label">Dashboard</span>
            </a>
            <a href="analytics.html" class="${isActive('analytics.html')}" id="nav-analytics">
                <span class="nav-icon">${icons.analytics}</span>
                <span class="nav-label">Analytics</span>
            </a>

            <div class="sidebar-section">Finance</div>
            <a href="budget.html" class="${isActive('budget.html')}" id="nav-budget">
                <span class="nav-icon">${icons.budget}</span>
                <span class="nav-label">Budget</span>
            </a>
            <a href="setBudget.html" class="${isActive('setBudget.html')}" id="nav-set-budget">
                <span class="nav-icon">${icons.setBudget}</span>
                <span class="nav-label">Set Budget</span>
            </a>
            <a href="savings.html" class="${isActive('savings.html')}" id="nav-savings">
                <span class="nav-icon">${icons.savings}</span>
                <span class="nav-label">Savings</span>
            </a>

            <div class="sidebar-section">Tools</div>
            <a href="export.html" class="${isActive('export.html')}" id="nav-export">
                <span class="nav-icon">${icons.exportIcon}</span>
                <span class="nav-label">Export</span>
            </a>
            <a href="forum.html" class="${isActive('forum.html')}" id="nav-forum">
                <span class="nav-icon">${icons.forum}</span>
                <span class="nav-label">Community</span>
            </a>
            <a href="profile.html" class="${isActive('profile.html')}" id="nav-profile">
                <span class="nav-icon">${icons.profile}</span>
                <span class="nav-label">Profile</span>
            </a>
        </nav>

        <!-- Footer -->
        <div class="sidebar-footer">
            <button class="sidebar-logout" id="sidebarLogoutBtn" aria-label="Logout">
                ${icons.logout}
                <span>Logout</span>
            </button>
        </div>

    </aside>
    `;

    /* ── Inject at the very top of <body> ── */
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

    /* ── Sidebar toggle (mobile) ── */
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    function openSidebar() {
        sidebar.classList.add('open');
        toggleBtn.classList.add('open');
        overlay.classList.add('visible');
        toggleBtn.setAttribute('aria-expanded', 'true');
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        toggleBtn.classList.remove('open');
        overlay.classList.remove('visible');
        toggleBtn.setAttribute('aria-expanded', 'false');
    }

    toggleBtn.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    overlay.addEventListener('click', closeSidebar);

    /* Close sidebar on navigation (mobile) */
    sidebar.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });

    /* ── Logout handler ── */
    function logout() {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }

    document.getElementById('sidebarLogoutBtn').addEventListener('click', logout);

})();
