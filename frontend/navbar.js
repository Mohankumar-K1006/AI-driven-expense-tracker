/**
 * navbar.js
 * Injects the top navigation bar into any page that includes this script.
 * Usage: <script src="navbar.js"></script>  (before closing </body>)
 */

(function () {
    /* ── Detect current page to mark active link ── */
    const page = location.pathname.split('/').pop() || 'dashboard.html';

    function isActive(href) {
        return page === href ? 'active' : '';
    }

    /* ── Navbar HTML ── */
    const navbarHTML = `
    <nav class="navbar" role="navigation" aria-label="Main navigation">
        <div class="navbar-inner">

            <!-- Brand -->
            <a href="dashboard.html" class="navbar-brand">
                <div class="brand-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                </div>
                ExpenseTracker
            </a>

            <!-- Desktop links -->
            <ul class="navbar-links">
                <li>
                    <a href="dashboard.html" class="${isActive('dashboard.html')}">
                        Dashboard
                    </a>
                </li>
                <li>
                    <a href="budget.html" class="${isActive('budget.html')}">
                        Budget
                    </a>
                </li>
                <li>
                    <a href="setBudget.html" class="${isActive('setBudget.html')}">
                        Set Budget
                    </a>
                </li>
                <li>
                    <a href="savings.html" class="${isActive('savings.html')}">
                        Savings
                    </a>
                </li>
                <li>
                    <a href="analytics.html" class="${isActive('analytics.html')}">
                        Analytics
                    </a>
                </li>
                <li>
                    <a href="export.html" class="${isActive('export.html')}">
                        Export
                    </a>
                </li>
                <li>
                    <a href="forum.html" class="${isActive('forum.html')}">
                        Forum
                    </a>
                </li>
                <li>
                    <a href="profile.html" class="${isActive('profile.html')}">
                        Profile
                    </a>
                </li>
            </ul>

            <!-- Right actions -->
            <div class="navbar-actions">
                <button class="navbar-logout" id="logoutBtn" aria-label="Logout">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Logout
                </button>
                <button class="hamburger" id="hamburgerBtn" aria-label="Toggle menu" aria-expanded="false">
                    <span></span><span></span><span></span>
                </button>
            </div>

        </div>
    </nav>

    <!-- Mobile menu -->
    <div class="mobile-menu" id="mobileMenu" role="menu">
        <a href="dashboard.html" class="${isActive('dashboard.html')}" role="menuitem">
            Dashboard
        </a>
        <a href="budget.html" class="${isActive('budget.html')}" role="menuitem">
            Budget
        </a>
        <a href="setBudget.html" class="${isActive('setBudget.html')}" role="menuitem">
            Set Budget
        </a>
        <a href="savings.html" class="${isActive('savings.html')}" role="menuitem">
            Savings
        </a>
        <a href="analytics.html" class="${isActive('analytics.html')}" role="menuitem">
            Analytics
        </a>
        <a href="export.html" class="${isActive('export.html')}" role="menuitem">
            Export
        </a>
        <a href="forum.html" class="${isActive('forum.html')}" role="menuitem">
            Forum
        </a>
        <a href="profile.html" class="${isActive('profile.html')}" role="menuitem">
            Profile
        </a>
        <button class="mobile-menu-logout" id="mobileLogoutBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
        </button>
    </div>
    `;

    /* ── Inject at the very top of <body> ── */
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);

    /* ── Hamburger toggle ── */
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    hamburger.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    /* Close mobile menu when clicking outside */
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
            mobileMenu.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });

    /* ── Logout handler ── */
    function logout() {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }

    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('mobileLogoutBtn').addEventListener('click', logout);

})();
