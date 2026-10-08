// Small shared helpers for the tenant portal (used by the layout bell and the dashboard)
const TenantPortal = {
    money(v) {
        return '₱' + Number(v || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    // Loads the tenant's OWN receipt from the server and prints it with the same
    // receipt layout the landlord already uses (RentController.printReceipt).
    async openReceipt(paymentId) {
        try {
            const res = await axios.get('api/tenant_receipt.php', { params: { id: paymentId } });
            if (res.data && res.data.success) {
                RentController.printReceipt(res.data.receipt);
            } else {
                Swal.fire('Receipt', (res.data && res.data.message) || 'Receipt not found.', 'error');
            }
        } catch (e) {
            Swal.fire('Receipt', (e.response && e.response.data && e.response.data.message) || 'Could not load the receipt.', 'error');
        }
    }
};

const TenantLayout = {
    template: `
        <div class="flex w-full h-screen font-sans text-gray-800 bg-[#f8fafc] overflow-hidden selection:bg-[#86ef1c] selection:text-white">
            <!-- Fixed Sidebar -->
            <div class="w-64 bg-[#163832] border-r shadow-sm flex flex-col p-6 z-20 h-screen fixed left-0 top-0 shrink-0 transition-all duration-300" data-aos="fade-right" data-aos-duration="800">
                <div class="mb-6" data-aos="fade-down" data-aos-delay="150">
                    <div class="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                        Pocket<span class="transition-transform duration-300 hover:scale-105">Pads</span>
                    </div>
                    <p class="text-xs text-gray-300 mt-1 font-medium">Tenant Portal</p>
                </div>

                <nav class="flex flex-col gap-1.5">
                    <p class="px-3.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Dashboard</p>
                    <router-link to="/tenant/dashboard" class="nav-link group relative overflow-hidden flex items-center gap-3 px-3.5 py-3 text-base font-medium rounded-xl text-white hover:bg-[#86ef1c]/15 hover:translate-x-1.5 transition-all duration-200">
                        <i class="fa-solid fa-chart-pie w-5 text-center"></i> Dashboard
                    </router-link>
                    <router-link to="/tenant/chat" class="nav-link group relative overflow-hidden flex items-center gap-3 px-3.5 py-3 text-base font-medium rounded-xl text-white hover:bg-[#86ef1c]/15 hover:translate-x-1.5 transition-all duration-200">
                        <i class="fa-solid fa-comments w-5 text-center"></i> Chat
                        <span v-if="chatUnread > 0" class="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">{{ chatUnread > 99 ? '99+' : chatUnread }}</span>
                    </router-link>

                    <p class="px-3.5 pt-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Payment</p>
                    <div class="flex items-center gap-3 px-3.5 py-3 text-base font-medium rounded-xl text-white/40 cursor-not-allowed select-none" title="Coming soon">
                        <i class="fa-solid fa-credit-card w-5 text-center"></i> Online Payment
                        <span class="ml-auto text-[9px] font-bold uppercase bg-white/10 px-1.5 py-0.5 rounded">Soon</span>
                    </div>

                    <p class="px-3.5 pt-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Building Management</p>
                    <router-link to="/tenant/damage-report" class="nav-link group relative overflow-hidden flex items-center gap-3 px-3.5 py-3 text-base font-medium rounded-xl text-white hover:bg-[#86ef1c]/15 hover:translate-x-1.5 transition-all duration-200">
                        <i class="fa-solid fa-screwdriver-wrench w-5 text-center"></i> Damage Report
                    </router-link>
                </nav>

                <button @click="logout" class="mt-auto w-full py-3 px-4 rounded-xl border border-gray-700 text-gray-300 font-medium text-base bg-[#235347] hover:bg-red-500 hover:text-white hover:border-transparent shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2">
                    <i class="fa-solid fa-right-from-bracket"></i> Logout
                </button>
            </div>

            <!-- Main Content Area -->
            <div class="flex-1 ml-64 p-8 h-screen overflow-y-auto flex flex-col">
                <div class="flex justify-between items-center bg-transparent border border-gray-100 px-6 py-4 rounded-2xl shadow-sm mb-6 shrink-0" data-aos="fade-down" data-aos-delay="100">
                    <div style="display: flex; flex-direction: row; gap: 0.25rem;">
                        <span class="text-xl font-extrabold text-[#081a10] uppercase">Welcome,</span>
                        <p style="margin-left: 10px;" class="text-xl font-extrabold text-black">{{ tenantName }}</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <!-- Notification bell: payment reminders + receipts -->
                        <div class="relative">
                            <button @click.stop="toggleBell" title="Notifications" class="relative w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-emerald-700 hover:border-emerald-300 shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center">
                                <i class="fa-solid fa-bell"></i>
                                <span v-if="unread > 0" class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow">{{ unread > 9 ? '9+' : unread }}</span>
                            </button>

                            <div v-if="bellOpen" @click.stop class="absolute right-0 mt-2 w-96 max-w-[90vw] max-h-[28rem] overflow-y-auto bg-white border border-gray-100 rounded-2xl shadow-2xl z-40">
                                <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
                                    <p class="text-sm font-bold text-gray-900">Notifications</p>
                                    <span class="text-[11px] text-gray-400 font-medium">Reminders &amp; receipts</span>
                                </div>
                                <div v-if="items.length === 0" class="px-4 py-10 text-center text-xs text-gray-400 font-medium">
                                    <i class="fa-regular fa-bell-slash text-2xl text-gray-300 mb-2 block"></i> Nothing here yet.
                                </div>
                                <div v-for="(n, i) in items" :key="i" :class="n.is_new ? 'bg-emerald-50/50' : ''" class="px-4 py-3 border-b border-gray-50 flex items-start gap-3">
                                    <div :class="iconClass(n)" class="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0"><i :class="iconName(n)"></i></div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-xs font-bold text-gray-900">{{ n.title }}</p>
                                        <p class="text-xs text-gray-600 mt-0.5 leading-snug">{{ n.message }}</p>
                                        <div class="flex items-center justify-between mt-1.5">
                                            <span class="text-[10px] text-gray-400 font-medium">{{ n.date }}</span>
                                            <button v-if="n.type === 'receipt'" @click="openReceipt(n.payment_id)" class="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors"><i class="fa-solid fa-print mr-1"></i> Receipt</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 px-3 py-1.5 bg-[#86ef1c]/10 text-emerald-700 rounded-xl text-xs font-semibold border border-[#86ef1c]/30">
                            <i class="fa-solid fa-circle-check"></i> Tenant
                        </div>
                    </div>
                </div>

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
        return { tenantName: 'Tenant', unread: 0, chatUnread: 0, items: [], bellOpen: false, bellTimer: null };
    },
    methods: {
        iconName(n) {
            if (n.type === 'receipt') return 'fa-solid fa-receipt';
            return n.level === 'overdue' ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-clock';
        },
        iconClass(n) {
            if (n.type === 'receipt') return 'bg-emerald-100 text-emerald-600';
            return n.level === 'overdue' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600';
        },
        // Background polling: sent with X-Passive by the guard, so it never keeps the session alive
        async loadNotifications() {
            try {
                const res = await axios.get('api/tenant_notifications.php');
                if (res.data && res.data.success) {
                    this.items = res.data.items;
                    this.unread = res.data.unread;
                    this.chatUnread = res.data.chat_unread || 0;
                }
            } catch (e) { /* the guard already handles 401 */ }
        },
        async toggleBell() {
            this.bellOpen = !this.bellOpen;
            if (!this.bellOpen) return;
            await this.loadNotifications();   // fresh list, new items still highlighted
            this.unread = 0;
            try { await axios.post('api/tenant_notifications.php'); } catch (e) { /* ignore */ }
        },
        closeBell() { this.bellOpen = false; },
        openReceipt(id) { TenantPortal.openReceipt(id); },
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
                    await AuthService.logout();
                    this.$router.replace('/login');
                }
            });
        },
        // First login: the tenant still has the temporary password the landlord gave.
        // The popup cannot be dismissed; the only other way out is to log out.
        async forcePasswordChange() {
            const result = await Swal.fire({
                title: 'Set your own password',
                html: '<p style="font-size:14px;margin-bottom:8px">Your landlord gave you a temporary password. Choose a new one (at least 8 characters) to continue.</p>' +
                    '<input id="pw-current" type="password" class="swal2-input" placeholder="Temporary password">' +
                    '<input id="pw-new" type="password" class="swal2-input" placeholder="New password">' +
                    '<input id="pw-confirm" type="password" class="swal2-input" placeholder="Confirm new password">',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showCancelButton: true,
                cancelButtonText: 'Log out',
                confirmButtonText: 'Change password',
                confirmButtonColor: '#10b981',
                focusConfirm: false,
                preConfirm: async() => {
                    const cur = document.getElementById('pw-current').value;
                    const nw = document.getElementById('pw-new').value;
                    const cf = document.getElementById('pw-confirm').value;
                    if (!cur || !nw || !cf) { Swal.showValidationMessage('Please fill in all fields.'); return false; }
                    if (nw.length < 8) { Swal.showValidationMessage('New password must be at least 8 characters.'); return false; }
                    if (nw !== cf) { Swal.showValidationMessage('The new passwords do not match.'); return false; }
                    const res = await AuthService.changePassword(cur, nw);
                    if (!res.success) { Swal.showValidationMessage(res.message || 'Could not change the password.'); return false; }
                    return true;
                }
            });

            if (result.isConfirmed) {
                Swal.fire({ icon: 'success', title: 'Password changed', timer: 1500, showConfirmButton: false });
            } else {
                await AuthService.logout();
                this.$router.replace('/login');
            }
        }
    },
    async mounted() {
        this.tenantName = localStorage.getItem('adminName') || 'Tenant';
        document.addEventListener('click', this.closeBell);
        window.addEventListener('pp-refresh-counts', this.loadNotifications); // chat page asks for a badge refresh
        if (AuthService.mustChange) {
            await this.forcePasswordChange();
        }
        this.loadNotifications();
        this.bellTimer = setInterval(this.loadNotifications, 60000);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.closeBell);
        window.removeEventListener('pp-refresh-counts', this.loadNotifications);
        if (this.bellTimer) clearInterval(this.bellTimer);
    }
};
