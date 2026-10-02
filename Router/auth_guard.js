// ============================================================
// auth_guard.js - load AFTER Router/dashboard.js (see index.html)
// The SERVER session is the only source of truth, not localStorage.
// ============================================================
const AuthService = {
    async check() {
        try {
            const res = await axios.get('API/session_check.php', { params: { _: Date.now() } });
            const ok = !!(res.data && res.data.authenticated);
            if (ok) {
                localStorage.setItem('isAuthenticated', 'true');
                if (res.data.names) localStorage.setItem('adminName', res.data.names);
            } else {
                this.clearLocal();
            }
            return ok;
        } catch (e) {
            this.clearLocal();
            return false;
        }
    },
    clearLocal() {
        localStorage.removeItem('adminName');
        localStorage.removeItem('isAuthenticated');
        sessionStorage.clear();
    },
    async logout() {
        try { await axios.post('API/Logout.php'); } catch (e) { /* ignore */ }
        this.clearLocal();
    }
};

(function() {
    if (typeof router === 'undefined') return;

    const PUBLIC_PATHS = ['/login', '/register'];

    // 1) Every page change (including Back/Forward and pasted links) asks the server first
    router.beforeEach(async(to) => {
        const authed = await AuthService.check();
        const isPublic = PUBLIC_PATHS.includes(to.path);

        if (!authed && !isPublic) return { path: '/login', replace: true };
        if (authed && isPublic) return { path: '/dashboard', replace: true };
        return true;
    });

    function kickToLogin() {
        AuthService.clearLocal();
        const cur = router.currentRoute.value.path;
        if (!PUBLIC_PATHS.includes(cur)) router.replace('/login');
    }

    async function revalidate() {
        const cur = router.currentRoute.value.path;
        if (PUBLIC_PATHS.includes(cur)) return;
        if (!(await AuthService.check())) kickToLogin();
    }

    // 2) Any API call answered with 401 (session expired / logged out in another tab)
    axios.interceptors.response.use(
        (res) => res,
        (err) => {
            if (err.response && err.response.status === 401) kickToLogin();
            return Promise.reject(err);
        }
    );

    // Same for code that uses fetch() instead of axios
    const _fetch = window.fetch;
    window.fetch = async function(...args) {
        const res = await _fetch.apply(this, args);
        if (res.status === 401) kickToLogin();
        return res;
    };

    // 3) Browser Back button restoring an old page from cache (bfcache)
    window.addEventListener('pageshow', (e) => { if (e.persisted) revalidate(); });

    // 4) Coming back to this tab after logging out in another tab
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') revalidate();
    });

    // 5) Idle timeout: check every minute
    setInterval(revalidate, 60000);
})();