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
                <div class="brand-icon">💰</div>
                ExpenseTracker
            </a>

            <!-- Desktop links -->
            <ul class="navbar-links">
                <li>
                    <a href="dashboard.html" class="${isActive('dashboard.html')}">
                        <span class="nav-icon">🏠</span> Dashboard
                    </a>
                </li>
                <li>
                    <a href="budget.html" class="${isActive('budget.html')}">
                        <span class="nav-icon">📊</span> Budget
                    </a>
                </li>
                <li>
                    <a href="setBudget.html" class="${isActive('setBudget.html')}">
                        <span class="nav-icon">⚙️</span> Set Budget
                    </a>
                </li>
                <li>
                    <a href="savings.html" class="${isActive('savings.html')}">
                        <span class="nav-icon">🎯</span> Savings
                    </a>
                </li>
                <li>
                    <a href="analytics.html" class="${isActive('analytics.html')}">
                        <span class="nav-icon">📈</span> Analytics
                    </a>
                </li>
                <li>
                    <a href="export.html" class="${isActive('export.html')}">
                        <span class="nav-icon">📥</span> Export
                    </a>
                </li>
                <li>
                    <a href="forum.html" class="${isActive('forum.html')}">
                        <span class="nav-icon">💬</span> Forum
                    </a>
                </li>
                <li>
                    <a href="profile.html" class="${isActive('profile.html')}">
                        <span class="nav-icon">👤</span> Profile
                    </a>
                </li>
            </ul>

            <!-- Right actions -->
            <div class="navbar-actions">
                <button class="navbar-logout" id="logoutBtn" aria-label="Logout">
                    🚪 Logout
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
            <span>🏠</span> Dashboard
        </a>
        <a href="budget.html" class="${isActive('budget.html')}" role="menuitem">
            <span>📊</span> Budget
        </a>
        <a href="setBudget.html" class="${isActive('setBudget.html')}" role="menuitem">
            <span>⚙️</span> Set Budget
        </a>
        <a href="savings.html" class="${isActive('savings.html')}" role="menuitem">
            <span>🎯</span> Savings
        </a>
        <a href="analytics.html" class="${isActive('analytics.html')}" role="menuitem">
            <span>📈</span> Analytics
        </a>
        <a href="export.html" class="${isActive('export.html')}" role="menuitem">
            <span>📥</span> Export
        </a>
        <a href="forum.html" class="${isActive('forum.html')}" role="menuitem">
            <span>💬</span> Forum
        </a>
        <a href="profile.html" class="${isActive('profile.html')}" role="menuitem">
            <span>👤</span> Profile
        </a>
        <button class="mobile-menu-logout" id="mobileLogoutBtn">🚪 Logout</button>
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
