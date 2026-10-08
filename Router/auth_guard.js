// ============================================================
// auth_guard.js - load AFTER Router/dashboard.js (see index.html)
// The SERVER session is the only source of truth, not localStorage.
// Roles: 'landlord' -> /landlord/*, 'tenant' -> /tenant/*
// ============================================================
const AuthService = {
    role: null, // 'landlord' | 'tenant' (from the server session)
    mustChange: false, // tenant still has the temporary password

    homeFor(role) {
        return role === 'tenant' ? '/tenant/dashboard' : '/landlord/dashboard';
    },
    // touch = true  -> counts as real user activity (resets the server idle timer)
    // touch = false -> passive check only (timer keeps running)
    async check(touch = false) {
        try {
            const params = { _: Date.now() };
            if (touch) params.touch = 1;
            const res = await axios.get('api/session_check.php', { params });
            const ok = !!(res.data && res.data.authenticated);
            if (ok) {
                this.role = res.data.role || null;
                this.mustChange = !!res.data.mustChangePassword;
                localStorage.setItem('isAuthenticated', 'true');
                if (this.role) localStorage.setItem('role', this.role);
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
        this.role = null;
        this.mustChange = false;
        localStorage.removeItem('adminName');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('role');
        sessionStorage.clear();
    },
    async changePassword(current, next) {
        try {
            const res = await axios.post('api/change_password.php', { current_password: current, new_password: next });
            if (res.data && res.data.success) this.mustChange = false;
            return res.data;
        } catch (e) {
            return { success: false, message: 'Network or server error.' };
        }
    },
    async logout() {
        try { await axios.post('api/logout.php'); } catch (e) { /* ignore */ }
        this.clearLocal();
    }
};

(function() {
    if (typeof router === 'undefined') return;

    const PUBLIC_PATHS = ['/login', '/register'];

    // 1) Every page change (including Back/Forward and pasted links) asks the server first,
    //    then checks that the route belongs to the user's role.
    router.beforeEach(async(to) => {
        const authed = await AuthService.check(true); // navigating = real user activity
        const isPublic = PUBLIC_PATHS.includes(to.path);

        if (!authed && !isPublic) return { path: '/login', replace: true };
        if (authed && isPublic) return { path: AuthService.homeFor(AuthService.role), replace: true };

        // Wrong portal (e.g. a tenant typing #/landlord/finance) -> back to their own home
        const needed = to.matched.map(r => r.meta && r.meta.role).find(Boolean);
        if (authed && needed && needed !== AuthService.role) {
            return { path: AuthService.homeFor(AuthService.role), replace: true };
        }
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

    // Background polling must not keep the session alive: every GET is sent with X-Passive: 1
    // (auth.php then skips the idle-timer reset). POST/PUT/DELETE = real user actions, they count.
    axios.interceptors.request.use((config) => {
        if (String(config.method || 'get').toLowerCase() === 'get') {
            config.headers = config.headers || {};
            config.headers['X-Passive'] = '1';
        }
        return config;
    });

    // Same for code that uses fetch() instead of axios
    const _fetch = window.fetch;
    window.fetch = async function(input, init) {
        init = init || {};
        const method = String(init.method || (input && input.method) || 'GET').toUpperCase();
        if (method === 'GET') {
            const h = new Headers(init.headers || (typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined));
            h.set('X-Passive', '1');
            init = Object.assign({}, init, { headers: h });
        }
        const res = await _fetch.call(this, input, init);
        if (res.status === 401) kickToLogin();
        return res;
    };

    // Real user activity (mouse / keyboard / touch) tells the server "still here", at most once a minute
    let lastPing = 0;
    function userActive() {
        const now = Date.now();
        if (now - lastPing < 60000) return;
        if (PUBLIC_PATHS.includes(router.currentRoute.value.path)) return;
        lastPing = now;
        AuthService.check(true);
    }
    ['mousedown', 'keydown', 'touchstart', 'wheel'].forEach(ev =>
        window.addEventListener(ev, userActive, { passive: true, capture: true }));

    // 3) Browser Back button restoring an old page from cache (bfcache)
    window.addEventListener('pageshow', (e) => { if (e.persisted) revalidate(); });

    // 4) Coming back to this tab after logging out in another tab
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') revalidate();
    });

    // 5) Idle timeout: passive check every minute (does NOT extend the session)
    setInterval(revalidate, 60000);
})();
