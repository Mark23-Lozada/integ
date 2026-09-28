const Rent = {
    template: `
        <div class="space-y-6 min-h-full pb-10 transition-all duration-500 ease-out">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 transform transition-all duration-500 hover:translate-x-1">
                <div>
                    <h1 class="text-3xl font-black text-gray-900 tracking-tight transition-colors duration-300 hover:text-emerald-800">Rent Payment & Balance Tracker</h1>
                    <p class="text-sm text-gray-500 font-medium">Subaybayan ang buwanang bayarin, balanse, at mag-record ng monthly rent payments.</p>
                </div>
                <button @click="fetchData" class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                    <i class="fas fa-sync-alt" :class="{'fa-spin': loading}"></i> I-refresh
                </button>
            </div>
            <hr class="border-gray-100 transition-all duration-500 hover:border-emerald-500/50">

            <!-- Summary Cards na may 3D lift at glow -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div class="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-between group">
                    <div>
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">Total Collected This Month</p>
                        <h3 class="text-2xl font-black text-gray-900 mt-1 group-hover:text-emerald-700 transition-colors">₱{{ totalCollected.toLocaleString() }}</h3>
                    </div>
                    <div class="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl text-lg transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110">
                        <i class="fa-solid fa-wallet"></i>
                    </div>
                </div>

                <div class="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-between group">
                    <div>
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">Fully Paid Accounts</p>
                        <h3 class="text-2xl font-black text-emerald-600 mt-1 group-hover:scale-105 origin-left transition-transform">{{ fullyPaidCount }}</h3>
                    </div>
                    <div class="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl text-lg transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>
                </div>

                <div class="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-between group">
                    <div>
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider group-hover:text-amber-600 transition-colors">Total Partial Accounts</p>
                        <h3 class="text-2xl font-black text-amber-500 mt-1 group-hover:scale-105 origin-left transition-transform">{{ totalPartialCount }}</h3>
                    </div>
                    <div class="p-3 bg-amber-500/10 text-amber-500 rounded-xl text-lg transition-all duration-300 group-hover:bg-amber-500 group-hover:text-white group-hover:scale-110">
                        <i class="fa-solid fa-clock-rotate-left"></i>
                    </div>
                </div>
            </div>

            <!-- RENT COLLECTION WAVE GRAPH SECTION (Idinagdag na hiling) -->
            <div class="bg-white border border-gray-100 p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 text-gray-900 relative overflow-hidden group">
                <div class="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                
                <!-- Graph Header & Filter -->
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 relative z-10">
                    <div>
                        <h3 class="text-base font-bold text-gray-900 tracking-wide transition-all duration-300 group-hover:translate-x-1">Rent Payment Collection Trend</h3>
                        <p class="text-xs text-gray-500 mt-0.5">Visual representation of rent earnings and trends with smooth wave shading</p>
                    </div>
                    
                    <div class="flex items-center gap-3">
                        <div class="bg-gray-100/80 border border-gray-200/60 p-1 rounded-xl flex items-center gap-1 shadow-inner">
                            <button @click="timeFilter = 'monthly'" :class="timeFilter === 'monthly' ? 'bg-emerald-500 text-white font-bold shadow-md scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'" class="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer">Monthly</button>
                            <button @click="timeFilter = 'yearly'" :class="timeFilter === 'yearly' ? 'bg-emerald-500 text-white font-bold shadow-md scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'" class="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer">Yearly</button>
                        </div>
                    </div>
                </div>

                <!-- SVG Graph Container -->
                <div class="relative h-56 w-full pt-6 relative z-10">
                    <svg class="w-full h-40 overflow-visible" viewBox="0 0 500 140">
                        <defs>
                            <linearGradient id="rentWaveGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="#34d399" stop-opacity="0.35" />
                                <stop offset="100%" stop-color="#34d399" stop-opacity="0.0" />
                            </linearGradient>
                        </defs>

                        <!-- Grid Lines -->
                        <line x1="0" y1="0" x2="500" y2="0" stroke="#e2e8f0" stroke-opacity="0.8" stroke-dasharray="4" />
                        <line x1="0" y1="45" x2="500" y2="45" stroke="#e2e8f0" stroke-opacity="0.8" stroke-dasharray="4" />
                        <line x1="0" y1="90" x2="500" y2="90" stroke="#e2e8f0" stroke-opacity="0.8" stroke-dasharray="4" />
                        <line x1="0" y1="135" x2="500" y2="135" stroke="#cbd5e1" stroke-opacity="1" />

                        <!-- Smooth Area Wave Fill -->
                        <path :d="rentAreaPath" fill="url(#rentWaveGradient)" class="transition-all duration-700 ease-in-out" />

                        <!-- Smooth Curved Line (Wave) -->
                        <path :d="rentCurvePath" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" class="transition-all duration-700 ease-in-out filter drop-shadow-sm" />

                        <!-- Points & Labels -->
                        <g v-for="(pt, idx) in rentPoints" :key="'rent-'+idx" class="transition-transform duration-300 hover:scale-125 origin-center cursor-pointer">
                            <circle :cx="pt.x" :cy="pt.y" r="4.5" fill="#ffffff" stroke="#34d399" stroke-width="2.5" class="transition-all duration-300 hover:r-7" />
                            <text :x="pt.x" :y="pt.y - 12" font-size="9" font-weight="700" fill="#059669" text-anchor="middle" class="filter drop-shadow-sm">{{ formatCompact(pt.value) }}</text>
                        </g>
                    </svg>

                    <!-- X-Axis Labels -->
                    <div class="flex justify-between text-xs font-semibold text-gray-500 px-2 mt-2">
                        <span v-for="(item, index) in activeRentTrends" :key="index" class="transition-colors duration-300 hover:text-gray-900">{{ item.label }}</span>
                    </div>
                </div>

                <!-- Legend -->
                <div class="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100 text-xs font-semibold relative z-10">
                    <div class="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500/40 animate-pulse"></span>
                        <span class="text-gray-700">Rent Collection Trend ({{ timeFilter === 'monthly' ? 'Monthly' : 'Yearly' }})</span>
                    </div>
                </div>
            </div>

            <!-- TAB NAVIGATION -->
            <div class="flex gap-2 border-b border-gray-200 pb-2">
                <button @click="activeTab = 'balances'" :class="activeTab === 'balances' ? 'bg-emerald-600 text-white shadow-sm scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'" class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer">
                    <i class="fa-solid fa-scale-balanced mr-2"></i> Tenant Balances & Accounts
                </button>
                <button @click="activeTab = 'history'" :class="activeTab === 'history' ? 'bg-emerald-600 text-white shadow-sm scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'" class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer">
                    <i class="fa-solid fa-receipt mr-2"></i> Payment History Logs
                </button>
            </div>

            <!-- TABLE 1: TENANT BALANCES -->
            <div v-if="activeTab === 'balances'" class="space-y-4">
                <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div class="relative w-full sm:w-80">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </span>
                        <input type="text" v-model="searchQuery" placeholder="Hanapin ang pangalan o unit..." class="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-700 focus:outline-none focus:border-emerald-500 font-medium">
                    </div>

                    <div class="w-full sm:w-auto flex items-center gap-2">
                        <select v-model="statusFilter" class="w-full sm:w-48 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer">
                            <option value="">Lahat ng Status</option>
                            <option value="Fully Paid">Fully Paid</option>
                            <option value="Partial">Partial</option>
                            <option value="Unpaid">Unpaid</option>
                        </select>
                    </div>
                </div>

                <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div class="p-3 bg-gray-50 border-b border-gray-100 font-bold text-xs text-gray-700 flex justify-between items-center">
                        <span>Listahan ng Umuupa at Kasalukuyang Balanse</span>
                        <span class="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-bold border border-emerald-200/50">Nagpapakita ng {{ filteredBalances.length }} na tala</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse whitespace-nowrap text-xs">
                            <thead>
                                <tr class="bg-gray-50/50 border-b border-gray-100 font-bold text-gray-400 uppercase tracking-wider text-[11px]">
                                    <th class="py-2.5 px-4">Tenant Name</th>
                                    <th class="py-2.5 px-4">Assigned Unit</th>
                                    <th class="py-2.5 px-4">Contract Term</th>
                                    <th class="py-2.5 px-4">Monthly Rate</th>
                                    <th class="py-2.5 px-4">Total Contract</th>
                                    <th class="py-2.5 px-4">Total Paid</th>
                                    <th class="py-2.5 px-4">Remaining Balance</th>
                                    <th class="py-2.5 px-4 text-center">Status</th>
                                    <th class="py-2.5 px-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                <tr v-for="t in filteredBalances" :key="t.id" class="hover:bg-emerald-50/50 transition-colors">
                                    <td class="py-3 px-4 font-bold text-gray-800">{{ t.fullname }}</td>
                                    <td class="py-3 px-4 font-bold text-emerald-600">{{ t.unit_name || 'Unassigned' }}</td>
                                    <td class="py-3 px-4 text-gray-600 font-semibold">
                                        {{ t.contract_months ? (t.contract_months >= 12 && t.contract_months % 12 === 0 ? (t.contract_months / 12) + (t.contract_months / 12 > 1 ? ' Years' : ' Year') : t.contract_months + ' Months') : 'N/A' }}
                                    </td>
                                    <td class="py-3 px-4 text-gray-600">₱{{ parseFloat(t.monthly_rent || 0).toLocaleString() }}</td>
                                    <td class="py-3 px-4 text-gray-700 font-semibold">₱{{ parseFloat(t.total_contract_amount || 0).toLocaleString() }}</td>
                                    <td class="py-3 px-4 text-emerald-600 font-semibold">₱{{ parseFloat(t.total_paid || 0).toLocaleString() }}</td>
                                    <td class="py-3 px-4 text-rose-600 font-black">₱{{ parseFloat(t.remaining_balance || 0).toLocaleString() }}</td>
                                    <td class="py-3 px-4 text-center">
                                        <span :class="{'bg-emerald-100 text-emerald-700': t.payment_status=='Fully Paid', 'bg-amber-100 text-amber-700': t.payment_status=='Partial', 'bg-rose-100 text-rose-700': t.payment_status=='Unpaid'}" class="px-2.5 py-1 rounded-full text-[10px] font-bold inline-block">
                                            {{ t.payment_status || 'Unpaid' }}
                                        </span>
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        <button v-if="t.payment_status !== 'Fully Paid'" @click="quickPay(t)" class="px-3 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm">
                                            <i class="fa-solid fa-circle-plus mr-1"></i> Pay Rent
                                        </button>
                                        <span v-else class="text-gray-400 font-medium italic text-[11px]">Fully Paid</span>
                                    </td>
                                </tr>
                                <tr v-if="filteredBalances.length === 0">
                                    <td colspan="9" class="py-8 text-center text-gray-400">Walang nakitang tenant records.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- TABLE 2: PAYMENT HISTORY -->
            <div v-if="activeTab === 'history'" class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div class="p-3 bg-gray-50 border-b border-gray-100 font-bold text-xs text-gray-700">Kasaysayan ng Lahat ng Transaksyon sa Pagbabayad (Finances)</div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse whitespace-nowrap text-xs">
                        <thead>
                            <tr class="bg-gray-50/50 border-b border-gray-100 font-bold text-gray-400 uppercase tracking-wider text-[11px]">
                                <th class="py-2.5 px-4">Transaction ID</th>
                                <th class="py-2.5 px-4">Tenant Name</th>
                                <th class="py-2.5 px-4">Unit</th>
                                <th class="py-2.5 px-4">Payment Type</th>
                                <th class="py-2.5 px-4">Amount Paid</th>
                                <th class="py-2.5 px-4">Payment Date</th>
                                <th class="py-2.5 px-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr v-for="h in history" :key="h.id" class="hover:bg-emerald-50/50 transition-colors">
                                <td class="py-3 px-4 font-bold text-gray-500">#{{ h.id }}</td>
                                <td class="py-3 px-4 font-bold text-gray-800">{{ h.tenant_name }}</td>
                                <td class="py-3 px-4 font-semibold text-emerald-600">{{ h.unit_name }}</td>
                                <td class="py-3 px-4">
                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block bg-blue-100 text-blue-700">
                                        {{ h.payment_type }}
                                    </span>
                                </td>
                                <td class="py-3 px-4 font-bold text-emerald-600">₱{{ parseFloat(h.amount).toLocaleString() }}</td>
                                <td class="py-3 px-4 text-gray-600">{{ h.payment_date }}</td>
                                <td class="py-3 px-4 text-center">
                                    <button @click="viewReceipt(h)" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors cursor-pointer">
                                        <i class="fa-solid fa-print mr-1 text-emerald-600"></i> Print Receipt
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="history.length === 0">
                                <td colspan="7" class="py-8 text-center text-gray-400">Wala pang naitalang transaksyon sa pagbabayad.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- PAYMENT MODAL FORM -->
            <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl transform transition-all">
                    <div class="flex justify-between items-center border-b pb-3">
                        <h3 class="text-lg font-bold text-gray-900"><i class="fa-solid fa-peso-sign text-emerald-600 mr-2"></i> Record Monthly Payment</h3>
                        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"><i class="fa-solid fa-xmark"></i></button>
                    </div>

                    <form @submit.prevent="submitPayment" class="space-y-4 text-sm">
                        <div>
                            <label class="block font-semibold text-gray-700 mb-1">Tenant</label>
                            <input type="text" :value="form.tenant_name + ' (' + form.unit_name + ')'" disabled class="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-100 font-bold text-gray-800">
                        </div>

                        <div>
                            <label class="block font-semibold text-gray-700 mb-1">Halaga ng Ibabayad (Amount)</label>
                            <input type="number" step="0.01" v-model="form.amount_paid" required class="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 font-bold" placeholder="0.00">
                            <p class="text-[11px] text-gray-400 mt-1" v-if="form.tenant_id">
                                Natitirang Balanse (Contract): ₱{{ parseFloat(form.remaining_balance).toLocaleString() }}
                            </p>
                        </div>

                        <div class="flex justify-end gap-2 pt-3 border-t">
                            <button type="button" @click="closeModal" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 font-bold rounded-xl cursor-pointer transition-colors">Cancel</button>
                            <button type="submit" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm cursor-pointer transition-colors">Submit Payment</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            activeTab: 'balances',
            balances: [],
            history: [],
            showModal: false,
            searchQuery: '',
            statusFilter: '',
            loading: false,
            timeFilter: 'monthly',
            monthlyTrends: [],
            yearlyTrends: [],
            form: {
                tenant_id: '',
                tenant_name: '',
                unit_name: '',
                monthly_rent: 0,
                total_contract_amount: 0,
                total_paid_so_far: 0,
                amount_paid: '',
                remarks: 'Monthly Rent',
                remaining_balance: 0
            }
        };
    },
    computed: {
        totalCollected() {
            return this.history.reduce((sum, h) => sum + parseFloat(h.amount || 0), 0);
        },
        fullyPaidCount() {
            return this.balances.filter(t => t.payment_status === 'Fully Paid').length;
        },
        totalPartialCount() {
            return this.balances.filter(t => t.payment_status === 'Partial').length;
        },
        filteredBalances() {
            return this.balances.filter(t => {
                const matchesSearch =
                    t.fullname.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    (t.unit_name && t.unit_name.toLowerCase().includes(this.searchQuery.toLowerCase()));

                const matchesStatus = this.statusFilter === '' || t.payment_status === this.statusFilter;

                return matchesSearch && matchesStatus;
            });
        },
        activeRentTrends() {
            return this.timeFilter === 'monthly' ? this.monthlyTrends : this.yearlyTrends;
        },
        maxRentGraphValue() {
            const trends = this.activeRentTrends;
            if (!trends || trends.length === 0) return 1000;
            const allVals = trends.map(t => t.value);
            const peak = Math.max(...allVals, 1000);
            return peak * 1.2;
        },
        rentPoints() {
            const maxVal = this.maxRentGraphValue;
            const trends = this.activeRentTrends;
            if (!trends || trends.length === 0) return [];
            const widthStep = 500 / (trends.length - 1 || 1);
            return trends.map((item, index) => {
                const x = index * widthStep;
                const y = 135 - Math.min(Math.max((item.value / maxVal) * 135, 10), 130);
                return { x, y, value: item.value };
            });
        },
        rentCurvePath() {
            return this.getSmoothCurvePath(this.rentPoints);
        },
        rentAreaPath() {
            const pts = this.rentPoints;
            if (pts.length === 0) return '';
            const curve = this.rentCurvePath;
            const lastX = pts[pts.length - 1].x;
            const firstX = pts[0].x;
            return `${curve} L ${lastX} 135 L ${firstX} 135 Z`;
        }
    },
    methods: {
        getSmoothCurvePath(points) {
            if (points.length === 0) return '';
            if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

            let path = `M ${points[0].x} ${points[0].y}`;
            for (let i = 0; i < points.length - 1; i++) {
                const p0 = points[i];
                const p1 = points[i + 1];
                const cpX = (p0.x + p1.x) / 2;
                path += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
            }
            return path;
        },
        formatCompact(value) {
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
            return value;
        },
        generateDynamicRentTrends() {
            // Buwanan (Monthly Trends) mula sa history data
            const months = [];
            const currentDate = new Date();
            for (let i = -3; i <= 2; i++) {
                const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
                const monthStr = String(d.getMonth() + 1).padStart(2, '0');
                const yearStr = d.getFullYear();

                const monthTotal = this.history
                    .filter(item => item.payment_date && item.payment_date.startsWith(`${yearStr}-${monthStr}`))
                    .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

                months.push({
                    label: d.toLocaleString('default', { month: 'short' }),
                    value: monthTotal
                });
            }
            this.monthlyTrends = months;

            // Taunang (Yearly Trends) mula sa history data
            const currentYearNum = new Date().getFullYear();
            const yearsList = [currentYearNum - 3, currentYearNum - 2, currentYearNum - 1, currentYearNum];
            this.yearlyTrends = yearsList.map(yr => {
                const yrStr = String(yr);
                const yrTotal = this.history
                    .filter(item => item.payment_date && item.payment_date.startsWith(yrStr))
                    .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
                return {
                    label: yrStr,
                    value: yrTotal
                };
            });
        },
        async fetchData() {
            this.loading = true;
            this.balances = await RentModel.getTenantBalances();
            this.history = await RentModel.getPaymentHistory();
            this.generateDynamicRentTrends();
            this.loading = false;
        },
        closeModal() {
            this.showModal = false;
        },
        quickPay(tenant) {
            this.form.tenant_id = tenant.id;
            this.form.tenant_name = tenant.fullname;
            this.form.unit_name = tenant.unit_name || 'Unassigned';
            this.form.monthly_rent = parseFloat(tenant.monthly_rent) || 0;
            this.form.total_contract_amount = parseFloat(tenant.total_contract_amount) || 0;
            this.form.total_paid_so_far = parseFloat(tenant.total_paid) || 0;
            this.form.remaining_balance = parseFloat(tenant.remaining_balance) || 0;

            const remainingBal = this.form.remaining_balance;
            const monthlyRate = this.form.monthly_rent;

            this.form.amount_paid = monthlyRate > 0 ? Math.min(monthlyRate, remainingBal) : remainingBal;
            this.showModal = true;
        },
        async submitPayment() {
            const paymentPayload = {
                tenant_id: this.form.tenant_id,
                tenant_name: this.form.tenant_name,
                unit_name: this.form.unit_name,
                amount: parseFloat(this.form.amount_paid),
                payment_type: 'Monthly Rent',
                status: 'Paid'
            };

            const res = await RentModel.recordPayment(paymentPayload);
            if (res.success) {
                this.closeModal();
                this.fetchData();
                Swal.fire('Success!', res.message, 'success');
            } else {
                Swal.fire('Error!', res.message, 'error');
            }
        },
        viewReceipt(historyItem) {
            Swal.fire({
                title: 'Receipt Details',
                html: `<div class="text-left text-xs space-y-2">
                    <p><strong>Transaction ID:</strong> #${historyItem.id}</p>
                    <p><strong>Tenant Name:</strong> ${historyItem.tenant_name}</p>
                    <p><strong>Unit:</strong> ${historyItem.unit_name}</p>
                    <p><strong>Payment Type:</strong> ${historyItem.payment_type}</p>
                    <p><strong>Amount:</strong> ₱${parseFloat(historyItem.amount).toLocaleString()}</p>
                    <p><strong>Date:</strong> ${historyItem.payment_date}</p>
                </div>`,
                confirmButtonText: 'OK'
            });
        }
    },
    mounted() {
        this.fetchData();
        // Automatic AJAX refresh every 5 seconds (5000 ms)
        this.autoRefreshTimer = setInterval(() => {
            this.fetchData();
        }, 5000);
    },
    beforeUnmount() {
        if (this.autoRefreshTimer) {
            clearInterval(this.autoRefreshTimer);
        }
    }
};