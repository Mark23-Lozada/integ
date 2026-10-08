// Two portals, one app:
//   /landlord/*  -> DashboardLayout  (role: landlord)
//   /tenant/*    -> TenantLayout     (role: tenant)
// The role is enforced by router.beforeEach in auth_guard.js (meta.role) AND by the API (require_role).
const routes = [{
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        component: LoginView
    },
    {
        path: '/register',
        component: RegisterView
    },
    {
        path: '/landlord',
        component: DashboardLayout,
        meta: { role: 'landlord' },
        redirect: '/landlord/dashboard',
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'chat', component: LandlordChat },
            { path: 'tenants', component: Tenants },
            { path: 'damage-report', component: DamageReports },
            { path: 'units', component: Units },
            { path: 'finance', component: Finance },
            { path: 'billings', component: Billings },
            { path: 'rent', component: Rent },
            { path: 'expenses', component: Expenses }
        ]
    },
    {
        path: '/tenant',
        component: TenantLayout,
        meta: { role: 'tenant' },
        redirect: '/tenant/dashboard',
        children: [
            { path: 'dashboard', component: TenantDashboard },
            { path: 'chat', component: TenantChat },
            { path: 'damage-report', component: TenantDamage }
            // { path: 'payment', component: ... }  <- Online Payment: you are building this one
        ]
    },
    // Old landlord links (#/units ...) keep working
    ...['dashboard', 'units', 'tenants', 'rent', 'expenses', 'finance'].map(p => ({ path: '/' + p, redirect: '/landlord/' + p })),
    {
        path: '/:pathMatch(.*)*',
        redirect: '/login'
    }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes
});
