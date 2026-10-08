// Tenant dashboard: unit, contract, balance, next payment, monthly bills and recent payments.
// Everything comes from api/tenant_dashboard.php, which only ever returns the logged-in tenant's own data.
const TenantDashboard = {
    template: `
        <div class="space-y-6 min-h-full pb-10 transition-all duration-500 ease-out">
            <div class="flex flex-col gap-1" data-aos="fade-right">
                <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">My Dashboard</h1>
                <p class="text-sm text-gray-500 font-medium">Your unit, lease and monthly payments at a glance.</p>
            </div>
            <hr class="border-gray-100">

            <div v-if="loading" class="text-sm text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i> Loading...</div>
            <div v-else-if="error" class="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold px-5 py-4 rounded-2xl">{{ error }}</div>

            <template v-else>
                <div v-if="!contract" class="bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold px-5 py-4 rounded-2xl">
                    You have no active contract yet. Please contact your landlord.
                </div>

                <template v-else>
                    <!-- Reminder banner -->
                    <div v-if="summary.overdue_count > 0" class="bg-gradient-to-br from-rose-50/70 to-white border border-rose-200 px-5 py-4 rounded-2xl text-sm text-rose-700 font-semibold flex items-start gap-3">
                        <i class="fa-solid fa-triangle-exclamation mt-0.5"></i>
                        <span>You have {{ summary.overdue_count }} overdue {{ summary.overdue_count === 1 ? 'bill' : 'bills' }} ({{ money(overdueTotal) }}). Please settle with your landlord.</span>
                    </div>
                    <div v-else-if="nextDue && nextDue.days_until_due <= 3" class="bg-gradient-to-br from-amber-50/70 to-white border border-amber-200 px-5 py-4 rounded-2xl text-sm text-amber-700 font-semibold flex items-start gap-3">
                        <i class="fa-solid fa-clock mt-0.5"></i>
                        <span>Installment #{{ nextDue.installment_no }} ({{ money(nextDue.balance) }}) is due {{ dueText(nextDue) }}.</span>
                    </div>

                    <!-- Summary cards -->
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-aos="fade-up" data-aos-delay="0">
                            <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">My Unit</p>
                            <h3 class="text-2xl font-black text-gray-900 mt-1">{{ contract.unit_name || 'Unassigned' }}</h3>
                            <p class="text-xs text-gray-500 mt-1">Monthly rent: {{ money(contract.monthly_rent) }}</p>
                        </div>

                        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-aos="fade-up" data-aos-delay="100">
                            <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Contract</p>
                            <h3 class="text-base font-black text-gray-900 mt-1">{{ contract.start_date }} &rarr; {{ contract.end_date }}</h3>
                            <p class="text-xs text-gray-500 mt-1">{{ contract.contract_months }} months</p>
                        </div>

                        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-aos="fade-up" data-aos-delay="200">
                            <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Remaining Balance</p>
                            <h3 class="text-2xl font-black mt-1" :class="summary.remaining_balance > 0 ? 'text-rose-600' : 'text-emerald-600'">{{ money(summary.remaining_balance) }}</h3>
                            <div class="w-full bg-gray-200/80 h-2 rounded-full overflow-hidden mt-2">
                                <div class="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-1000" :style="{ width: summary.paid_percent + '%' }"></div>
                            </div>
                            <p class="text-[11px] text-gray-500 mt-1">{{ money(summary.total_paid) }} of {{ money(summary.total_contract) }} paid ({{ summary.paid_percent }}%)</p>
                        </div>

                        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-aos="fade-up" data-aos-delay="300">
                            <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Next Payment</p>
                            <template v-if="nextDue">
                                <h3 class="text-2xl font-black text-gray-900 mt-1">{{ money(nextDue.balance) }}</h3>
                                <p class="text-xs text-gray-500 mt-1">
                                    Installment #{{ nextDue.installment_no }} &middot; {{ nextDue.due_date }}
                                    <span :class="statusClass(nextDue.status)" class="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold">{{ nextDue.status }}</span>
                                </p>
                            </template>
                            <template v-else>
                                <h3 class="text-lg font-black text-emerald-600 mt-1">All bills paid</h3>
                                <p class="text-xs text-gray-500 mt-1">Nothing due. Thank you!</p>
                            </template>
                        </div>
                    </div>

                    <!-- Monthly bills -->
                    <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden" data-aos="fade-up" data-aos-delay="100">
                        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 class="font-bold text-gray-900 text-sm">Monthly Bills</h2>
                                <p class="text-xs text-gray-500 mt-0.5">One installment per month. The first one is due one month after move-in.</p>
                            </div>
                            <span class="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-bold border border-emerald-200/50">{{ summary.bills_paid }} / {{ summary.bills_total }} paid</span>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse whitespace-nowrap text-xs">
                                <thead>
                                    <tr class="bg-gray-50/70 text-gray-400 text-[11px] uppercase tracking-wider font-bold">
                                        <th class="px-6 py-3">#</th>
                                        <th class="px-6 py-3">Due Date</th>
                                        <th class="px-6 py-3">Amount</th>
                                        <th class="px-6 py-3">Paid</th>
                                        <th class="px-6 py-3">Balance</th>
                                        <th class="px-6 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    <tr v-for="b in bills" :key="b.id" class="hover:bg-emerald-50/50 transition-colors">
                                        <td class="px-6 py-3 font-bold text-gray-500">{{ b.installment_no }}</td>
                                        <td class="px-6 py-3 font-semibold text-gray-800">{{ b.due_date }}</td>
                                        <td class="px-6 py-3 text-gray-700">{{ money(b.amount) }}</td>
                                        <td class="px-6 py-3 text-emerald-600 font-semibold">{{ money(b.paid_amount) }}</td>
                                        <td class="px-6 py-3 font-bold" :class="b.balance > 0 ? 'text-rose-600' : 'text-gray-400'">{{ money(b.balance) }}</td>
                                        <td class="px-6 py-3 text-center"><span :class="statusClass(b.status)" class="px-2.5 py-1 rounded-full text-[10px] font-bold inline-block">{{ b.status }}</span></td>
                                    </tr>
                                    <tr v-if="bills.length === 0"><td colspan="6" class="px-6 py-8 text-center text-gray-400">No bills yet.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </template>

                <!-- Recent payments with receipts -->
                <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden" data-aos="fade-up" data-aos-delay="200">
                    <div class="px-6 py-4 border-b border-gray-100">
                        <h2 class="font-bold text-gray-900 text-sm">Recent Payments</h2>
                        <p class="text-xs text-gray-500 mt-0.5">Open or print the receipt of any payment.</p>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse whitespace-nowrap text-xs">
                            <thead>
                                <tr class="bg-gray-50/70 text-gray-400 text-[11px] uppercase tracking-wider font-bold">
                                    <th class="px-6 py-3">Date</th>
                                    <th class="px-6 py-3">Type</th>
                                    <th class="px-6 py-3">Amount</th>
                                    <th class="px-6 py-3 text-center">Receipt</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                <tr v-for="p in payments" :key="p.id" class="hover:bg-emerald-50/50 transition-colors">
                                    <td class="px-6 py-3 text-gray-700">{{ p.payment_date }}</td>
                                    <td class="px-6 py-3"><span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block bg-blue-100 text-blue-700">{{ p.payment_type }}</span></td>
                                    <td class="px-6 py-3 font-bold text-emerald-600">{{ money(p.amount) }}</td>
                                    <td class="px-6 py-3 text-center">
                                        <button @click="openReceipt(p.id)" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"><i class="fa-solid fa-print mr-1 text-emerald-600"></i> Receipt</button>
                                    </td>
                                </tr>
                                <tr v-if="payments.length === 0"><td colspan="4" class="px-6 py-8 text-center text-gray-400">No payments recorded yet.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </template>
        </div>
    `,
    data() {
        return { contract: null, summary: null, bills: [], nextDue: null, payments: [], loading: true, error: '', timer: null };
    },
    computed: {
        overdueTotal() {
            return this.bills.filter(b => b.status === 'Overdue').reduce((s, b) => s + Number(b.balance), 0);
        }
    },
    methods: {
        money(v) { return TenantPortal.money(v); },
        openReceipt(id) { TenantPortal.openReceipt(id); },
        statusClass(status) {
            return {
                'Paid': 'bg-emerald-100 text-emerald-700',
                'Partial': 'bg-amber-100 text-amber-700',
                'Unpaid': 'bg-gray-100 text-gray-600',
                'Overdue': 'bg-rose-100 text-rose-700'
            }[status] || 'bg-gray-100 text-gray-600';
        },
        dueText(b) {
            if (b.days_until_due === 0) return 'today';
            return 'in ' + b.days_until_due + (b.days_until_due === 1 ? ' day' : ' days') + ' (' + b.due_date + ')';
        },
        async load() {
            try {
                const res = await axios.get('api/tenant_dashboard.php');
                if (res.data && res.data.success) {
                    this.contract = res.data.contract;
                    this.summary = res.data.summary;
                    this.bills = res.data.bills || [];
                    this.nextDue = res.data.next_due;
                    this.payments = res.data.payments || [];
                    this.error = '';
                } else {
                    this.error = (res.data && res.data.message) || 'Could not load your information.';
                }
            } catch (e) {
                const d = e.response && e.response.data;
                if (d && d.must_change_password) {
                    // First login: the password popup is still open. Keep waiting, then load.
                    setTimeout(() => { if (this.timer !== null) this.load(); }, 1500);
                    return;
                }
                this.error = (d && d.message) || 'Could not reach the server.';
            }
            this.loading = false;
        }
    },
    mounted() {
        // Passive refresh (X-Passive GET): picks up payments the landlord records, without extending the session
        this.timer = setInterval(this.load, 30000);
        this.load();
    },
    beforeUnmount() {
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
    }
};
