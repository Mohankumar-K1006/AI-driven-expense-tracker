const API_BASE = 'http://localhost:8080';

function getHeaders(json = true) {
    const headers = {};
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = token;
    if (json) {
        headers['Content-Type'] = 'application/json';
        headers['Accept'] = 'application/json';
    }
    return headers;
}

async function request(url, options = {}) {
    const res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: { ...getHeaders(options.json !== false), ...options.headers },
    });
    return res;
}

// ── Auth ──
export const authApi = {
    login: (data) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    forgotPassword: (data) => request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
    resetPassword: (token, data) => request(`/api/auth/reset-password/${token}`, { method: 'POST', body: JSON.stringify(data) }),
};

// ── Transactions ──
export const transactionApi = {
    add: (data) => request('/api/transactions/add', { method: 'POST', body: JSON.stringify(data) }),
    getAll: () => request('/api/transactions/all'),
    delete: (id) => request(`/api/transactions/${id}`, { method: 'DELETE' }),
    update: (id, data) => request(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    summary: () => request('/api/transactions/summary'),
};

// ── Analytics ──
export const analyticsApi = {
    summary: () => request('/api/analytics/summary'),
    category: () => request('/api/analytics/category'),
    monthly: () => request('/api/analytics/monthly'),
    incomeVsExpense: () => request('/api/analytics/income-vs-expense'),
};

// ── Budget ──
export const budgetApi = {
    set: (data) => request('/api/budget/set', { method: 'POST', body: JSON.stringify(data) }),
    analysis: () => request('/api/budget/analysis'),
};

// ── Savings ──
export const savingsApi = {
    add: (data) => request('/api/savings/add', { method: 'POST', body: JSON.stringify(data) }),
    getAll: () => request('/api/savings/all'),
    addMoney: (id, data) => request(`/api/savings/${id}/add-money`, { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/savings/${id}`, { method: 'DELETE' }),
};

// ── Forum ──
export const forumApi = {
    getPosts: (community) => request(`/api/forum/posts${community ? `?community=${community}` : ''}`),
    getCommunities: () => request('/api/forum/communities'),
    createPost: (data) => request('/api/forum/posts', { method: 'POST', body: JSON.stringify(data) }),
    toggleLike: (id) => request(`/api/forum/posts/${id}/like`, { method: 'POST' }),
    addComment: (id, data) => request(`/api/forum/posts/${id}/comment`, { method: 'POST', body: JSON.stringify(data) }),
};

// ── Profile ──
export const profileApi = {
    get: () => request('/api/profile'),
    update: (data) => request('/api/profile', { method: 'PUT', body: JSON.stringify(data) }),
};

// ── Export ──
export const exportApi = {
    csv: () => request('/api/export/csv', { json: false }),
    pdf: () => request('/api/export/pdf', { json: false }),
};

// ── Suggestions ──
export const suggestionApi = {
    get: () => request('/api/suggestions'),
};
