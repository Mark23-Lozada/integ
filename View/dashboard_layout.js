const DashboardLayout = {
    template: `
        <div class="flex w-full h-screen font-sans text-gray-800 bg-[#f8fafc] overflow-hidden selection:bg-[#86ef1c] selection:text-white">
            <!-- Fixed Sidebar (Wala nang scrollbar) -->
            <div class="w-64 bg-[#163832] border-r shadow-sm flex flex-col p-6 z-20 h-screen fixed left-0 top-0 shrink-0 transition-all duration-300">
                <!-- Brand / Logo -->
                <div class="mb-6">
                    <div class="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                        Pocket<span class="transition-transform duration-300 hover:scale-105">Pads</span>
                    </div>
                    <p class="text-xs text-gray-300 mt-1 font-medium">Cozy Apartment & Budget Journal</p>
                </div>
                
               <!-- Navigation Links -->
<nav class="flex flex-col gap-1.5">
    <router-link to="/dashboard" class="nav-link group relative overflow-hidden flex items-center gap-3 px-3.5 py-3 text-base font-medium rounded-xl text-white hover:bg-[#86ef1c]/15 hover:translate-x-1.5 transition-all duration-200">
        <i class="fa-solid fa-chart-pie w-5 text-center "><span></span></i> Dashboard
    </router-link>
    <router-link to="/units" class="nav-link group relative overflow-hidden flex items-center gap-3 px-3.5 py-3 text-base font-medium rounded-xl text-white hover:bg-[#86ef1c]/15 hover:translate-x-1.5 transition-all duration-200">
        <i class="fa-solid fa-building w-5 text-center "><span></span></i> Units
    </router-link>
    <router-link to="/tenants" class="nav-link group relative overflow-hidden flex items-center gap-3 px-3.5 py-3 text-base font-medium rounded-xl text-white hover:bg-[#86ef1c]/15 hover:translate-x-1.5 transition-all duration-200">
        <i class="fa-solid fa-users w-5 text-center "><span></span></i> Tenants
    </router-link>
    <router-link to="/rent" class="nav-link group relative overflow-hidden flex items-center gap-3 px-3.5 py-3 text-base font-medium rounded-xl text-white hover:bg-[#86ef1c]/15 hover:translate-x-1.5 transition-all duration-200">
        <i class="fa-solid fa-file-invoice-dollar w-5 text-center "><span></span></i> Rent
    </router-link>
    <router-link to="/expenses" class="nav-link group relative overflow-hidden flex items-center gap-3 px-3.5 py-3 text-base font-medium rounded-xl text-white hover:bg-[#86ef1c]/15 hover:translate-x-1.5 transition-all duration-200">
        <i class="fa-solid fa-wallet w-5 text-center "><span></span></i> Expenses
    </router-link>
    <router-link to="/finance" class="nav-link group relative overflow-hidden flex items-center gap-3 px-3.5 py-3 text-base font-medium rounded-xl text-white hover:bg-[#86ef1c]/15 hover:translate-x-1.5 transition-all duration-200">
        <i class="fa-solid fa-chart-line w-5 text-center "><span></span></i> Finance
    </router-link>
</nav>

                <!-- Logout Button -->
                <button @click="logout" class="mt-auto w-full py-3 px-4 rounded-xl border border-gray-700 text-gray-300 font-medium text-base bg-[#235347] hover:bg-red-500 hover:text-white hover:border-transparent shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2">
                    <i class="fa-solid fa-right-from-bracket"><span></span></i> Logout
                </button>
            </div>

            <!-- Main Content Area -->
            <div class="flex-1 ml-64 p-8 h-screen overflow-y-auto animate-fadeIn flex flex-col">
                <!-- Dashboard Header with Admin Name -->
                <div class="flex justify-between items-center bg-transparent border border-gray-100 px-6 py-4 rounded-2xl shadow-sm mb-6 shrink-0">
                    <div style="display: flex; flex-direction: row; gap: 0.25rem;">
                        <span class="text-xl font-extrabold text-[#081a10] uppercase ">Welcome back,</span>
                        <p style="margin-left: 10px;" class="text-xl  font-extrabold text-black">{{ adminName }}</p>
                    </div>
                    <div class="flex items-center gap-2 px-3 py-1.5 bg-[#86ef1c]/10 text-emerald-700 rounded-xl text-xs font-semibold border border-[#86ef1c]/30">
                        <i class="fa-solid fa-circle-check"></i> Active Admin
                    </div>
                </div>

                <!-- Router View Content -->
                <div class="flex-1">
                    <router-view></router-view>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            adminName: 'Admin'
        }
    },
    methods: {
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
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem('adminName');
                    this.$router.push('/login');
                }
            });
        }
    },
    mounted() {
        this.fetchAdminName();
    }
};