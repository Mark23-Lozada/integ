// Landlord > Billings: every monthly installment of every active contract.
// Status is calculated on the server (api/billings.php) from the same payments Rent and Finance use.
const Billings = {
    template: `
        <div class="space-y-6 min-h-full pb-10 transition-all duration-500 ease-out">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4" data-aos="fade-right">
                <div>
                    <h1 class="text-3xl font-black text-gray-900 tracking-tight">Billings</h1>
                    <p class="text-sm text-gray-500 font-medium">Monthly installments of every active contract. The first bill is due one month after move-in.</p>
                </div>
                <div class="flex items-center gap-2">
                    <button @click="load" class="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all cursor-pointer">
                        <i class="fas fa-sync-alt" :class="{'fa-spin': loading}"></i> Refresh
                    </button>
                    <router-link to="/landlord/rent" class="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                        <i class="fa-solid fa-circle-plus"></i> Record Rent Payment
                    </router-link>
                </div>
            </div>
            <hr class="border-gray-100">

            <!-- Summary -->
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <div class="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-aos="fade-up" data-aos-delay="0">
                    <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total Billed</p>
                    <h3 class="text-2xl font-black text-gray-900 mt-1">{{ money(summary.total_billed) }}</h3>
                    <p class="text-[11px] text-gray-500 mt-1">{{ summary.bills_total }} bills &middot; {{ summary.bills_paid }} paid</p>
                </div>
                <div class="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-aos="fade-up" data-aos-delay="100">
                    <p class="text-xs font-semibold text-blue-700 uppercase tracking-wider">Collected</p>
                    <h3 class="text-2xl font-black text-gray-900 mt-1">{{ money(summary.collected) }}</h3>
                    <p class="text-[11px] text-gray-500 mt-1">Applied to bills (incl. downpayments)</p>
                </div>
                <div class="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-aos="fade-up" data-aos-delay="200">
                    <p class="text-xs font-semibold text-amber-700 uppercase tracking-wider">Outstanding</p>
                    <h3 class="text-2xl font-black text-gray-900 mt-1">{{ money(summary.outstanding) }}</h3>
                    <p class="text-[11px] text-gray-500 mt-1">Due this month: {{ money(summary.due_this_month) }}</p>
                </div>
                <div class="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" :class="summary.overdue_count > 0 ? 'border-rose-200 bg-rose-50/40' : 'border-gray-100'" data-aos="fade-up" data-aos-delay="300">
                    <p class="text-xs font-semibold text-rose-700 uppercase tracking-wider">Overdue</p>
                    <h3 class="text-2xl font-black mt-1" :class="summary.overdue_count > 0 ? 'text-rose-600' : 'text-gray-900'">{{ money(summary.overdue_amount) }}</h3>
                    <p class="text-[11px] text-gray-500 mt-1">{{ summary.overdue_count }} bills &middot; {{ summary.tenants_overdue }} tenants</p>
                </div>
            </div>

            <!-- Filters -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div class="relative w-full md:w-80">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400"><i class="fas fa-search text-xs"></i></span>
                    <input type="text" v-model="searchQuery" placeholder="Search tenant or unit..." class="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium bg-gray-50/50">
                </div>
                <div class="flex flex-wrap items-center gap-3">
                    <select v-model="statusFilter" class="px-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium bg-gray-50/50 cursor-pointer">
                        <option value="">All Status</option>
                        <option value="Overdue">Overdue</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Partial">Partial</option>
                        <option value="Paid">Paid</option>
                    </select>
                    <input type="month" v-model="monthFilter" class="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium bg-gray-50/50 cursor-pointer" title="Filter by due month">
                    <button v-if="searchQuery || statusFilter || monthFilter" @click="clearFilters" class="px-3 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer">Clear</button>
                </div>
            </div>

            <!-- Bills table -->
            <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden" data-aos="fade-up" data-aos-delay="100">
                <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 class="font-bold text-gray-800 text-base">Monthly Bills</h2>
                    <span class="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-bold border border-emerald-200/50">Showing {{ filtered.length }} bills</span>
                </div>
                <div class="overflow-x-auto max-h-[560px] overflow-y-auto custom-scrollbar">
                    <table class="w-full text-left border-collapse whitespace-nowrap text-xs">
                        <thead>
                            <tr class="bg-gray-50/70 text-gray-400 text-[11px] uppercase tracking-wider font-bold sticky top-0 z-10">
                                <th class="px-5 py-3">Tenant</th>
                                <th class="px-5 py-3">Unit</th>
                                <th class="px-5 py-3">#</th>
                                <th class="px-5 py-3">Due Date</th>
                                <th class="px-5 py-3">Amount</th>
                                <th class="px-5 py-3">Paid</th>
                                <th class="px-5 py-3">Balance</th>
                                <th class="px-5 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr v-if="loading && !loaded"><td colspan="8" class="px-5 py-8 text-center text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i> Loading...</td></tr>
                            <tr v-else-if="filtered.length === 0"><td colspan="8" class="px-5 py-8 text-center text-gray-400">No bills found.</td></tr>
                            <tr v-for="b in filtered" :key="b.bill_id" class="hover:bg-emerald-50/50 transition-colors">
                                <td class="px-5 py-3 font-bold text-gray-800">{{ b.tenant_name }}<span class="block text-[10px] font-medium text-gray-400">{{ b.contact_no }}</span></td>
                                <td class="px-5 py-3 font-bold text-emerald-600">{{ b.unit_name || 'Unassigned' }}</td>
                                <td class="px-5 py-3 text-gray-500 font-bold">{{ b.installment_no }}</td>
                                <td class="px-5 py-3 font-semibold text-gray-800">{{ b.due_date }}<span v-if="b.status === 'Overdue'" class="block text-[10px] font-bold text-rose-500">{{ Math.abs(b.days_until_due) }} days late</span></td>
                                <td class="px-5 py-3 text-gray-700">{{ money(b.amount) }}</td>
                                <td class="px-5 py-3 text-emerald-600 font-semibold">{{ money(b.paid_amount) }}</td>
                                <td class="px-5 py-3 font-bold" :class="b.balance > 0 ? 'text-rose-600' : 'text-gray-400'">{{ money(b.balance) }}</td>
                                <td class="px-5 py-3 text-center"><span :class="statusClass(b.status)" class="px-2.5 py-1 rounded-full text-[10px] font-bold inline-block">{{ b.status }}</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            bills: [],
            summary: { total_billed: 0, collected: 0, outstanding: 0, overdue_count: 0, overdue_amount: 0, due_this_month: 0, bills_total: 0, bills_paid: 0, tenants_overdue: 0 },
            searchQuery: '', statusFilter: '', monthFilter: '',
            loading: false, loaded: false, timer: null
        };
    },
    computed: {
        filtered() {
            const q = this.searchQuery.trim().toLowerCase();
            return this.bills.filter(b => {
                if (this.statusFilter && b.status !== this.statusFilter) return false;
                if (this.monthFilter && !b.due_date.startsWith(this.monthFilter)) return false;
                if (q && !((b.tenant_name || '').toLowerCase().includes(q) || (b.unit_name || '').toLowerCase().includes(q))) return false;
                return true;
            });
        }
    },
    methods: {
        money(v) { return '₱' + Number(v || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
        statusClass(s) {
            return { 'Paid': 'bg-emerald-100 text-emerald-700', 'Partial': 'bg-amber-100 text-amber-700', 'Unpaid': 'bg-gray-100 text-gray-600', 'Overdue': 'bg-rose-100 text-rose-700' }[s] || 'bg-gray-100 text-gray-600';
        },
        clearFilters() { this.searchQuery = ''; this.statusFilter = ''; this.monthFilter = ''; },
        async load() {
            this.loading = true;
            try {
                const res = await axios.get('api/billings.php');
                if (res.data && res.data.success) { this.bills = res.data.bills; this.summary = res.data.summary; }
            } catch (e) { console.error('Error loading billings', e); }
            this.loading = false; this.loaded = true;
        }
    },
    mounted() {
        this.load();
        this.timer = setInterval(this.load, 15000); // passive refresh (X-Passive GET)
    },
    beforeUnmount() { if (this.timer) clearInterval(this.timer); }
};
