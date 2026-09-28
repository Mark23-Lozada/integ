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
        path: '/',
        component: DashboardLayout,
        beforeEnter: (to, from, next) => {
            if (!localStorage.getItem('isAuthenticated')) {
                next('/login');
            } else {
                next();
            }
        },
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'units', component: Units },
            { path: 'tenants', component: Tenants },
            { path: 'rent', component: Rent },
            { path: 'expenses', component: Expenses },
            { path: 'finance', component: Finance }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/login'
    }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes
});