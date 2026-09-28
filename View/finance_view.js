const Finance = {
    template: `
        <div class="space-y-6 min-h-full pb-10 transition-all duration-500 ease-out">
            <!-- Header & Action Button -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 transform transition-all duration-500 hover:translate-x-1">
                <div>
                    <h1 class="text-3xl font-black text-gray-900 tracking-tight transition-colors duration-300 hover:text-emerald-800">Finance & Transaction Reports</h1>
                    <p class="text-sm text-gray-500 font-medium">Subaybayan ang mga koleksyon, buwanan at taunang kita, at transaksyon ng mga tenant.</p>
                </div>
                <button @click="loadData" class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                    <i class="fas fa-sync-alt" :class="{'fa-spin': loading}"></i> I-refresh
                </button>
            </div>
            <hr class="border-gray-100 transition-all duration-500 hover:border-emerald-500/50">

            <!-- Dashboard Layout: 50-50 Split na balanse ang height na may 3D lift -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
                <!-- Left: 50% - Kabuuang Koleksyon + Progress Breakdown -->
                <div class="bg-white border border-gray-100 p-6 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-emerald-950/10 transition-all duration-500 transform hover:-translate-y-1.5 flex flex-col justify-between relative overflow-hidden group">
                    <div class="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                    
                    <div class="relative z-10">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 transition-colors duration-300 group-hover:text-emerald-700">KABUUANG KOLEKSYON</p>
                                <h3 class="text-4xl font-black text-gray-900 transition-transform duration-300 group-hover:scale-[1.02] origin-left">₱ {{ formatMoney(totalCollected) }}</h3>
                            </div>
                            <span class="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-xl text-xs font-bold flex items-center gap-1.5 h-fit border border-emerald-200/60 shadow-sm transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-105">
                                <i class="fas fa-wallet"></i> Total Pool
                            </span>
                        </div>

                        <!-- Progress Bar & Stats -->
                        <div class="mt-6 space-y-3 pt-4 border-t border-gray-50 bg-gray-50/80 p-4 rounded-xl backdrop-blur-sm transition-all duration-300 group-hover:bg-emerald-50/30">
                            <div class="flex justify-between text-xs font-bold">
                                <span class="text-gray-600">Taunang Target / Progress</span>
                                <span class="text-gray-900">₱ {{ formatMoney(yearlyCollected) }} ({{ currentYear }})</span>
                            </div>
                            <div class="w-full bg-gray-200 h-3 rounded-full overflow-hidden flex">
                                <div class="bg-emerald-500 h-full transition-all duration-500 shadow-sm animate-pulse" style="width: 100%"></div>
                            </div>
                            <div class="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                                <span>Buwanan: ₱ {{ formatMoney(monthlyCollected) }}</span>
                                <span>Total Records: {{ finances.length }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 relative z-10">
                        <span>Lahat ng rehistradong transaksyon ng mga tenant.</span>
                        <span class="font-bold text-emerald-600">Financial Dashboard</span>
                    </div>
                </div>

                <!-- Right: 50% - 3 Nakapatong na Cards (Monthly, Yearly, Total Tenant Balances) -->
                <div class="flex flex-col gap-3.5 justify-between">
                    <!-- Monthly Collection Box -->
                    <div class="bg-gradient-to-br from-amber-50/60 to-white border border-amber-200/80 px-6 py-4 rounded-2xl shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-between flex-1 group">
                        <div>
                            <p class="text-[11px] font-bold text-amber-800 uppercase tracking-wider group-hover:text-amber-900 transition-colors">NGAYONG BUWAN ({{ currentMonthName }})</p>
                            <h3 class="text-2xl font-black text-gray-900 mt-0.5 group-hover:text-amber-600 transition-colors">₱ {{ formatMoney(monthlyCollected) }}</h3>
                        </div>
                        <span class="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl text-xs transition-all duration-300 group-hover:bg-amber-500 group-hover:text-white group-hover:scale-110">
                            <i class="fas fa-calendar-alt"></i>
                        </span>
                    </div>

                    <!-- Yearly Collection Box -->
                    <div class="bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100/80 px-6 py-4 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-between flex-1 group">
                        <div>
                            <p class="text-[11px] font-bold text-indigo-900 uppercase tracking-wider group-hover:text-indigo-700 transition-colors">NGAYONG TAON ({{ currentYear }})</p>
                            <h3 class="text-2xl font-black text-gray-900 mt-0.5 group-hover:text-indigo-600 transition-colors">₱ {{ formatMoney(yearlyCollected) }}</h3>
                        </div>
                        <span class="p-2.5 bg-indigo-500/10 text-indigo-600 rounded-xl text-xs transition-all duration-300 group-hover:bg-indigo-500 group-hover:text-white group-hover:scale-110">
                            <i class="fas fa-chart-line"></i>
                        </span>
                    </div>

                    <!-- Total Tenant Remaining Balances Box (Pinalitan ang Average Transaction) -->
                    <div class="bg-gradient-to-br from-teal-50/50 to-white border border-teal-100/80 px-6 py-4 rounded-2xl shadow-sm hover:shadow-xl hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-between flex-1 group">
                        <div>
                            <p class="text-[11px] font-bold text-teal-900 uppercase tracking-wider group-hover:text-teal-700 transition-colors">KABUUANG BALANSE NG MGA TENANT</p>
                            <h3 class="text-2xl font-black text-gray-900 mt-0.5 group-hover:text-teal-600 transition-colors">₱ {{ formatMoney(totalTenantBalances) }}</h3>
                        </div>
                        <span class="p-2.5 bg-teal-500/10 text-teal-600 rounded-xl text-xs transition-all duration-300 group-hover:bg-teal-500 group-hover:text-white group-hover:scale-110">
                            <i class="fas fa-file-invoice-dollar"></i>
                        </span>
                    </div>
                </div>
            </div>

            <!-- FINANCIAL WAVE GRAPH SECTION -->
            <div class="bg-white border border-gray-100 p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 text-gray-900 relative overflow-hidden group">
                <div class="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                
                <!-- Graph Header & Filter -->
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 relative z-10">
                    <div>
                        <h3 class="text-base font-bold text-gray-900 tracking-wide transition-all duration-300 group-hover:translate-x-1">Financial Collection Line Trend</h3>
                        <p class="text-xs text-gray-500 mt-0.5">Visual representation of revenue collection trends with smooth wave shading</p>
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
                            <linearGradient id="financeWaveGradient" x1="0" y1="0" x2="0" y2="1">
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
                        <path :d="financeAreaPath" fill="url(#financeWaveGradient)" class="transition-all duration-700 ease-in-out" />

                        <!-- Smooth Curved Line (Wave) -->
                        <path :d="financeCurvePath" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" class="transition-all duration-700 ease-in-out filter drop-shadow-sm" />

                        <!-- Points & Labels -->
                        <g v-for="(pt, idx) in financePoints" :key="'fin-'+idx" class="transition-transform duration-300 hover:scale-125 origin-center cursor-pointer">
                            <circle :cx="pt.x" :cy="pt.y" r="4.5" fill="#ffffff" stroke="#34d399" stroke-width="2.5" class="transition-all duration-300 hover:r-7" />
                            <text :x="pt.x" :y="pt.y - 12" font-size="9" font-weight="700" fill="#059669" text-anchor="middle" class="filter drop-shadow-sm">{{ formatCompact(pt.value) }}</text>
                        </g>
                    </svg>

                    <!-- X-Axis Labels -->
                    <div class="flex justify-between text-xs font-semibold text-gray-500 px-2 mt-2">
                        <span v-for="(item, index) in activeFinanceTrends" :key="index" class="transition-colors duration-300 hover:text-gray-900">{{ item.label }}</span>
                    </div>
                </div>

                <!-- Legend -->
                <div class="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100 text-xs font-semibold relative z-10">
                    <div class="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500/40 animate-pulse"></span>
                        <span class="text-gray-700">Collection Trend ({{ timeFilter === 'monthly' ? 'Monthly' : 'Yearly' }})</span>
                    </div>
                </div>
            </div>

            <!-- Filters & Search Bar -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div class="relative w-full md:w-80">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                        <i class="fas fa-search text-xs"></i>
                    </span>
                    <input type="text" v-model="searchQuery" placeholder="Maghanap ng tenant, unit, o uri ng bayad..." 
                        class="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium bg-gray-50/50">
                </div>

                <div class="flex items-center gap-3 w-full md:w-auto">
                    <select v-model="selectedYear" class="px-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium bg-gray-50/50 cursor-pointer">
                        <option value="">Lahat ng Taon</option>
                        <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
                    </select>

                    <select v-model="selectedMonth" class="px-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium bg-gray-50/50 cursor-pointer">
                        <option value="">Lahat ng Buwan</option>
                        <option value="01">Enero</option>
                        <option value="02">Pebrero</option>
                        <option value="03">Marso</option>
                        <option value="04">Abril</option>
                        <option value="05">Mayo</option>
                        <option value="06">Hunyo</option>
                        <option value="07">Hulyo</option>
                        <option value="08">Agosto</option>
                        <option value="09">Setyembre</option>
                        <option value="10">Oktubre</option>
                        <option value="11">Nobyembre</option>
                        <option value="12">Disyembre</option>
                    </select>
                </div>
            </div>

            <!-- Transactions Table -->
            <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 class="font-bold text-gray-800 text-base">Listahan ng mga Transaksyon</h2>
                    <span class="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-bold border border-emerald-200/50">
                        Nagpapakita ng {{ filteredFinances.length }} na tala
                    </span>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-gray-50/70 text-gray-400 text-[10px] uppercase tracking-wider font-bold">
                                <th class="px-6 py-3">ID / Petsa</th>
                                <th class="px-6 py-3">Pangalan ng Tenant</th>
                                <th class="px-6 py-3">Unit</th>
                                <th class="px-6 py-3">Uri ng Bayad</th>
                                <th class="px-6 py-3">Halaga</th>
                                <th class="px-6 py-3 text-center">Katayuan</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 text-xs text-gray-700">
                            <tr v-if="loading">
                                <td colspan="6" class="px-6 py-8 text-center text-gray-400">
                                    <i class="fas fa-spinner fa-spin mr-2"></i> Naglalaman ng mga datos...
                                </td>
                            </tr>
                            <tr v-else-if="filteredFinances.length === 0">
                                <td colspan="6" class="px-6 py-8 text-center text-gray-400">
                                    Walang nakitang transaksyon.
                                </td>
                            </tr>
                            <tr v-for="item in filteredFinances" :key="item.id" class="hover:bg-emerald-50/50 transition-colors">
                                <td class="px-6 py-4 font-medium text-gray-900">
                                    <div class="font-bold">#{{ item.id }}</div>
                                    <div class="text-[11px] text-gray-400">{{ item.payment_date }}</div>
                                </td>
                                <td class="px-6 py-4 font-bold text-gray-800">{{ item.tenant_name }}</td>
                                <td class="px-6 py-4">
                                    <span class="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-[11px] font-semibold">
                                        {{ item.unit_name || 'N/A' }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 font-medium">{{ item.payment_type }}</td>
                                <td class="px-6 py-4 font-black text-emerald-600 text-sm">₱ {{ formatMoney(item.amount) }}</td>
                                <td class="px-6 py-4 text-center">
                                    <span class="px-3 py-1 rounded-full text-[11px] font-bold border"
                                        :class="item.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'">
                                        {{ item.status }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    `,
    data() {
        return {
            finances: [],
            totalCollected: 0,
            totalTenantBalances: 0,
            loading: false,
            searchQuery: '',
            selectedYear: '',
            selectedMonth: '',
            currentYear: new Date().getFullYear().toString(),
            currentMonth: String(new Date().getMonth() + 1).padStart(2, '0'),
            timeFilter: 'monthly',
            monthlyTrends: [],
            yearlyTrends: []
        };
    },
    computed: {
        currentMonthName() {
            const months = ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'];
            const idx = new Date().getMonth();
            return months[idx];
        },
        monthlyCollected() {
            return this.finances
                .filter(item => {
                    if (!item.payment_date) return false;
                    return item.payment_date.startsWith(`${this.currentYear}-${this.currentMonth}`);
                })
                .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
        },
        yearlyCollected() {
            return this.finances
                .filter(item => {
                    if (!item.payment_date) return false;
                    return item.payment_date.startsWith(this.currentYear);
                })
                .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
        },
        availableYears() {
            const years = new Set();
            this.finances.forEach(item => {
                if (item.payment_date && item.payment_date.length >= 4) {
                    years.add(item.payment_date.substring(0, 4));
                }
            });
            return Array.from(years).sort().reverse();
        },
        filteredFinances() {
            return this.finances.filter(item => {
                const matchesSearch =
                    (item.tenant_name && item.tenant_name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                    (item.unit_name && item.unit_name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                    (item.payment_type && item.payment_type.toLowerCase().includes(this.searchQuery.toLowerCase()));

                let matchesYear = true;
                let matchesMonth = true;

                if (this.selectedYear && item.payment_date) {
                    matchesYear = item.payment_date.startsWith(this.selectedYear);
                }
                if (this.selectedMonth && item.payment_date) {
                    const parts = item.payment_date.split('-');
                    if (parts.length >= 2) {
                        matchesMonth = parts[1] === this.selectedMonth;
                    }
                }

                return matchesSearch && matchesYear && matchesMonth;
            });
        },
        activeFinanceTrends() {
            return this.timeFilter === 'monthly' ? this.monthlyTrends : this.yearlyTrends;
        },
        maxFinanceGraphValue() {
            const trends = this.activeFinanceTrends;
            if (!trends || trends.length === 0) return 1000;
            const allVals = trends.map(t => t.value);
            const peak = Math.max(...allVals, 1000);
            return peak * 1.2;
        },
        financePoints() {
            const maxVal = this.maxFinanceGraphValue;
            const trends = this.activeFinanceTrends;
            if (!trends || trends.length === 0) return [];
            const widthStep = 500 / (trends.length - 1 || 1);
            return trends.map((item, index) => {
                const x = index * widthStep;
                const y = 135 - Math.min(Math.max((item.value / maxVal) * 135, 10), 130);
                return { x, y, value: item.value };
            });
        },
        financeCurvePath() {
            return this.getSmoothCurvePath(this.financePoints);
        },
        financeAreaPath() {
            const pts = this.financePoints;
            if (pts.length === 0) return '';
            const curve = this.financeCurvePath;
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
        formatMoney(value) {
            let val = parseFloat(value || 0);
            return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        },
        formatCompact(value) {
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
            return value;
        },
        generateDynamicFinanceTrends() {
            const months = [];
            const currentDate = new Date();
            for (let i = -3; i <= 2; i++) {
                const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
                const monthStr = String(d.getMonth() + 1).padStart(2, '0');
                const yearStr = d.getFullYear();

                const monthTotal = this.finances
                    .filter(item => item.payment_date && item.payment_date.startsWith(`${yearStr}-${monthStr}`))
                    .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

                months.push({
                    label: d.toLocaleString('default', { month: 'short' }),
                    value: monthTotal
                });
            }
            this.monthlyTrends = months;

            const currentYearNum = new Date().getFullYear();
            const yearsList = [currentYearNum - 3, currentYearNum - 2, currentYearNum - 1, currentYearNum];
            this.yearlyTrends = yearsList.map(yr => {
                const yrStr = String(yr);
                const yrTotal = this.finances
                    .filter(item => item.payment_date && item.payment_date.startsWith(yrStr))
                    .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
                return {
                    label: yrStr,
                    value: yrTotal
                };
            });
        },
        async loadTenantBalances() {
            try {
                // Palitan ang 'rent.php' ng tamang pangalan ng PHP file mo (hal. 'finance.php')
                const response = await fetch('api/rent.php?action=balances');
                const data = await response.json();
                if (data && data.success && data.balances) {
                    this.totalTenantBalances = data.balances.reduce((sum, t) => sum + parseFloat(t.remaining_balance || 0), 0);
                }
            } catch (e) {
                console.error("Error loading tenant balances:", e);
            }
        },
        async loadData() {
            this.loading = true;
            const res = await FinanceController.loadFinances();
            if (res.success) {
                this.finances = res.data;
                this.totalCollected = res.totalCollected;
                this.generateDynamicFinanceTrends();
            } else {
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Error', res.message, 'error');
                }
            }
            await this.loadTenantBalances();
            this.loading = false;
        }
    },
    mounted() {
        this.loadData();
        this.autoRefreshTimer = setInterval(() => {
            this.loadData();
        }, 5000);
    },
    beforeUnmount() {
        if (this.autoRefreshTimer) {
            clearInterval(this.autoRefreshTimer);
        }
    }
};