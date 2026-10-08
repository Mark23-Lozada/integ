const DashboardLayout = {
    template: `
        <div class="flex w-full h-screen font-sans text-gray-800 bg-[#f8fafc] overflow-hidden selection:bg-[#86ef1c] selection:text-white">
            <!-- Fixed Sidebar (Wala nang scrollbar) -->
            <div class="w-64 bg-[#163832] border-r shadow-sm flex flex-col p-6 z-20 h-screen fixed left-0 top-0 shrink-0 transition-all duration-300" data-aos="fade-right" data-aos-duration="800">
                <!-- Brand / Logo -->
                <div class="mb-6" data-aos="fade-down" data-aos-delay="150">
                    <div class="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                        Pocket<span class="transition-transform duration-300 hover:scale-105">Pads</span>
                    </div>
                    <p class="text-xs text-gray-300 mt-1 font-medium">Cozy Apartment & Budget Journal</p>
                </div>
                
               <!-- Navigation Links (grouped) -->
                <nav class="flex flex-col gap-1 flex-1 min-h-0 overflow-y-auto pr-1">
                    <template v-for="sec in sections" :key="sec.title">
                        <p class="px-3.5 pt-3 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">{{ sec.title }}</p>
                        <router-link v-for="l in sec.links" :key="l.to" :to="l.to" class="nav-link group relative overflow-hidden flex items-center gap-3 px-3.5 py-2.5 text-[15px] font-medium rounded-xl text-white hover:bg-[#86ef1c]/15 hover:translate-x-1.5 transition-all duration-200">
                            <i :class="'fa-solid ' + l.icon + ' w-5 text-center'"></i> {{ l.label }}
                            <span v-if="l.badge && counts[l.badge] > 0" class="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">{{ counts[l.badge] > 99 ? '99+' : counts[l.badge] }}</span>
                        </router-link>
                    </template>
                </nav>

                <!-- Logout Button -->
                <button @click="logout" data-aos="fade-up" data-aos-delay="550" class="mt-3 w-full py-3 px-4 rounded-xl border border-gray-700 text-gray-300 font-medium text-base bg-[#235347] hover:bg-red-500 hover:text-white hover:border-transparent shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2">
                    <i class="fa-solid fa-right-from-bracket"><span></span></i> Logout
                </button>
            </div>

            <!-- Main Content Area -->
            <div class="flex-1 ml-64 p-8 h-screen overflow-y-auto animate-fadeIn flex flex-col">
                <!-- Dashboard Header with Admin Name -->
                <div class="flex justify-between items-center bg-transparent border border-gray-100 px-6 py-4 rounded-2xl shadow-sm mb-6 shrink-0" data-aos="fade-down" data-aos-delay="100">
                    <div style="display: flex; flex-direction: row; gap: 0.25rem;">
                        <span class="text-xl font-extrabold text-[#081a10] uppercase ">Welcome back,</span>
                        <p style="margin-left: 10px;" class="text-xl  font-extrabold text-black">{{ adminName }}</p>
                    </div>
                    <div data-aos="zoom-in" data-aos-delay="500" class="flex items-center gap-2 px-3 py-1.5 bg-[#86ef1c]/10 text-emerald-700 rounded-xl text-xs font-semibold border border-[#86ef1c]/30">
                        <i class="fa-solid fa-circle-check"></i> Active Admin
                    </div>
                </div>

                <!-- Router View Content -->
                <div class="flex-1">
                    <router-view v-slot="{ Component, route }">
                        <transition name="pp-page" mode="out-in">
                            <component :is="Component" :key="route.path" />
                        </transition>
                    </router-view>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            adminName: 'Admin',
            counts: { pending_damage: 0, unread_chat: 0 },
            countsTimer: null,
            sections: [
                { title: 'Dashboard', links: [
                    { to: '/landlord/dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
                    { to: '/landlord/chat', icon: 'fa-comments', label: 'Chat', badge: 'unread_chat' }
                ] },
                { title: 'Building Management', links: [
                    { to: '/landlord/tenants', icon: 'fa-users', label: 'Tenants' },
                    { to: '/landlord/damage-report', icon: 'fa-screwdriver-wrench', label: 'Damage Report', badge: 'pending_damage' },
                    { to: '/landlord/units', icon: 'fa-building', label: 'Units' }
                ] },
                { title: 'Billings', links: [
                    { to: '/landlord/finance', icon: 'fa-chart-line', label: 'Finance' },
                    { to: '/landlord/billings', icon: 'fa-file-invoice', label: 'Billings' },
                    { to: '/landlord/rent', icon: 'fa-file-invoice-dollar', label: 'Rent' },
                    { to: '/landlord/expenses', icon: 'fa-wallet', label: 'Expenses' }
                ] }
            ]
        }
    },
    methods: {
        // Menu badges: pending damage reports + unread tenant messages (passive GET, never extends the session)
        async loadCounts() {
            try {
                const res = await axios.get('api/landlord_counts.php');
                if (res.data && res.data.success) this.counts = { pending_damage: res.data.pending_damage, unread_chat: res.data.unread_chat };
            } catch (e) { /* the guard handles 401 */ }
        },
        fetchAdminName() {
            const savedName = localStorage.getItem('adminName');
            if (savedName) {
                this.adminName = savedName;
            } else {
                this.adminName = 'Admin';
            }
        },
        logout() {
            Swal.fire({
                title: 'Are you sure?',
                text: 'You will be logged out of your session.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#081a10',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, logout',
                cancelButtonText: 'Cancel'
            }).then(async(result) => {
                if (result.isConfirmed) {
                    await AuthService.logout(); // destroys the PHP session + clears localStorage
                    this.$router.replace('/login'); // replace = walang balik sa dashboard
                }
            });
        }
    },
    mounted() {
        this.fetchAdminName();
        this.loadCounts();
        this.countsTimer = setInterval(this.loadCounts, 30000);
        window.addEventListener('pp-refresh-counts', this.loadCounts); // pages ask for a refresh after reading chat / reports
    },
    beforeUnmount() {
        if (this.countsTimer) clearInterval(this.countsTimer);
        window.removeEventListener('pp-refresh-counts', this.loadCounts);
    }
};