const Dashboard = {
    template: `
        <div class="space-y-6 min-h-full pb-10 transition-all duration-500 ease-out">

            <!-- Top Header Section na may Fade-in animation -->
            <div class="flex flex-col gap-1 transform transition-all duration-500 hover:translate-x-1">
                <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight transition-colors duration-300 hover:text-emerald-800">Dashboard Overview</h1>
                <p class="text-sm text-gray-500 font-medium">Welcome back! Here is the summary of your property performance.</p>
            </div>
            <hr class="border-gray-100 transition-all duration-500 hover:border-emerald-500/50">

            <!-- Top Section: 50% Left Big Card & 50% Right Small Boxes -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                <!-- Left Big Card (Revenue, Donut Graph & Stats) na may 3D lift at glow hover -->
               <div class="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-emerald-950/10 transition-all duration-500 transform hover:-translate-y-1.5 flex flex-col justify-between group border border-gray-100 relative overflow-hidden">
    <!-- Decorative Blur Background Glow -->
    <div class="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
    
    <div>
        <!-- Top Section -->
        <div class="flex justify-between items-start relative z-10">
            <div>
                <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider transition-all duration-300 group-hover:text-emerald-700">Total Collected Revenue</p>
                <h3 class="text-4xl font-extrabold text-gray-900 mt-2 tracking-tight transition-transform duration-300 group-hover:scale-[1.02] origin-left">₱{{ formatMoney(totalCollected) }}</h3>
            </div>
            <div class="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full border border-emerald-200/60 shadow-sm flex items-center gap-1.5 transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-105">
                <span>{{ currentMonthName }} Active</span>
            </div>
        </div>
        
        <!-- Circular / Donut Graph Section -->
        <div class="mt-5 bg-gray-50/80 p-4 rounded-xl border border-gray-100 backdrop-blur-sm flex items-center justify-around transition-all duration-300 group-hover:bg-emerald-50/30 group-hover:border-emerald-200/50 relative z-10">
            <div class="relative w-28 h-28 flex items-center justify-center transform transition-transform duration-500 group-hover:scale-110">
                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path class="text-gray-200" stroke-width="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path class="text-emerald-500 transition-all duration-1000 group-hover:text-emerald-600" stroke-dasharray="75, 100" stroke-width="3.5" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div class="absolute flex flex-col items-center justify-center text-center">
                    <span class="text-lg font-black text-gray-900 transition-transform duration-300 group-hover:scale-110">{{ occupancyRate }}%</span>
                    <span class="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Occupancy</span>
                </div>
            </div>
            
            <!-- Legend / Stats list inside -->
            <div class="flex flex-col gap-2 text-xs">
                <div class="flex items-center gap-2 transition-transform duration-300 hover:translate-x-1">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm animate-pulse"></span>
                    <span class="text-gray-700 font-medium">Occupied: {{ occupiedRoomsCount }}</span>
                </div>
                <div class="flex items-center gap-2 transition-transform duration-300 hover:translate-x-1">
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></span>
                    <span class="text-gray-700 font-medium">Available: {{ availableRoomsCount }}</span>
                </div>
                <div class="flex items-center gap-2 transition-transform duration-300 hover:translate-x-1">
                    <span class="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></span>
                    <span class="text-gray-700 font-medium">Total Units: {{ units.length }}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Bottom Stats Grid -->
    <div class="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 gap-4 bg-gray-50/80 p-4 rounded-xl backdrop-blur-sm relative z-10 transition-all duration-300 group-hover:bg-emerald-50/30">
        <div class="transform transition-transform duration-300 hover:translate-x-1">
            <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Occupied Units</p>
            <h4 class="text-xl font-bold text-gray-900 mt-1">{{ occupiedRoomsCount }} / {{ units.length }}</h4>
        </div>
        
        <div class="transform transition-transform duration-300 hover:translate-x-1">
            <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total Tenants</p>
            <h4 class="text-xl font-bold text-gray-900 mt-1">{{ tenants.length }}</h4>
        </div>
    </div>
</div>
                <!-- Right Stacked Cards -->
                <div class="flex flex-col gap-3 justify-between">
                    <!-- Box 1: Rooms Status -->
                    <div class="bg-gradient-to-br from-blue-50/50 to-white border border-blue-100/80 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 group">
                        <div class="flex justify-between items-center mb-3">
                            <p class="text-xs font-semibold text-blue-900 uppercase tracking-wider transition-colors duration-300 group-hover:text-blue-700">Rooms Status</p>
                            <div class="px-2.5 py-1 text-blue-700 bg-blue-100/80 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-105">
                                <i class="fa-solid fa-door-closed"></i> Total: {{ units.length }}
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3 pt-3 border-t border-blue-100/60">
                            <div class="transition-transform duration-300 group-hover:translate-x-1">
                                <span class="text-xs text-gray-500 font-medium">Available</span>
                                <p class="text-lg font-bold text-gray-900 mt-0.5 group-hover:text-blue-600 transition-colors">{{ availableRoomsCount }}</p>
                            </div>
                            <div class="transition-transform duration-300 group-hover:translate-x-1">
                                <span class="text-xs text-gray-500 font-medium">Occupied</span>
                                <p class="text-lg font-bold text-gray-900 mt-0.5 group-hover:text-blue-600 transition-colors">{{ occupiedRoomsCount }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Box 2: Total Expenses -->
                    <div class="bg-gradient-to-br from-rose-50/50 to-white border border-rose-100/80 px-5 py-4 rounded-2xl shadow-sm hover:shadow-xl hover:border-rose-300 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-between group">
                        <div>
                            <p class="text-xs font-semibold text-rose-900 uppercase tracking-wider transition-colors duration-300 group-hover:text-rose-700">Total Expenses</p>
                            <h4 class="text-xl font-bold text-gray-900 mt-0.5 tracking-tight group-hover:text-rose-600 transition-colors">₱{{ formatMoney(computedTotalExpenses) }}</h4>
                        </div>
                        <div class="p-3 bg-rose-500/10 text-rose-600 text-sm font-semibold rounded-xl shadow-xs transition-all duration-300 group-hover:bg-rose-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-6">
                            <i class="fa-solid fa-file-invoice-dollar"></i>
                        </div>
                    </div>

                    <!-- Box 3: Monthly & Yearly Revenue -->
                    <div class="grid grid-cols-2 gap-3">
    <!-- Monthly Revenue Card (Yellow / Warning Theme) -->
    <div class="bg-gradient-to-br from-amber-50/60 to-white border border-amber-200/80 p-4 rounded-2xl shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 transform hover:-translate-y-1 group">
        <p class="text-[11px] font-semibold text-amber-800 uppercase tracking-wider group-hover:text-amber-900 transition-colors">Monthly Revenue</p>
        <h4 class="text-lg font-bold text-gray-900 mt-1 truncate group-hover:text-amber-600 transition-colors">₱{{ formatMoney(currentMonthRevenue) }}</h4>
    </div>
    
    <!-- Yearly Revenue Card (Original Indigo Theme) -->
    <div class="bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100/80 p-4 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1 group">
        <p class="text-[11px] font-semibold text-indigo-900 uppercase tracking-wider group-hover:text-indigo-700 transition-colors">Yearly Revenue</p>
        <h4 class="text-lg font-bold text-gray-900 mt-1 truncate group-hover:text-indigo-600 transition-colors">₱{{ formatMoney(currentYearRevenue) }}</h4>
    </div>
</div>
                </div>

            </div>

            <!-- Wave Graph Section with #081a10 Background -->
           <div class="bg-white border border-gray-100 p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 text-gray-900 relative overflow-hidden group">
    <!-- Subtle Background Glow -->
    <div class="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
    
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
            <h3 class="text-base font-bold text-gray-900 tracking-wide transition-all duration-300 group-hover:translate-x-1">Financial Line Trend</h3>
            <p class="text-xs text-gray-500 mt-0.5">Accurate tracking of revenue and expenses with smooth wave shading</p>
        </div>
        
        <!-- Filter Controls -->
        <div class="flex items-center gap-3">
            <div class="bg-gray-100/80 border border-gray-200/60 p-1 rounded-xl flex items-center gap-1 shadow-inner">
                <button @click="timeFilter = 'monthly'" :class="timeFilter === 'monthly' ? 'bg-emerald-500 text-white font-bold shadow-md scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'" class="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer">Monthly</button>
                <button @click="timeFilter = 'yearly'" :class="timeFilter === 'yearly' ? 'bg-emerald-500 text-white font-bold shadow-md scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'" class="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer">Yearly</button>
            </div>
        </div>
    </div>

    <!-- Chart Container -->
    <div class="relative h-56 w-full pt-6 relative z-10">
        <svg class="w-full h-40 overflow-visible" viewBox="0 0 500 140">
            <defs>
                <linearGradient id="revenueWaveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#34d399" stop-opacity="0.35" />
                    <stop offset="100%" stop-color="#34d399" stop-opacity="0.0" />
                </linearGradient>
                <linearGradient id="expenseWaveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.3" />
                    <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.0" />
                </linearGradient>
            </defs>

            <!-- Grid Lines -->
            <line x1="0" y1="0" x2="500" y2="0" stroke="#e2e8f0" stroke-opacity="0.8" stroke-dasharray="4" />
            <line x1="0" y1="45" x2="500" y2="45" stroke="#e2e8f0" stroke-opacity="0.8" stroke-dasharray="4" />
            <line x1="0" y1="90" x2="500" y2="90" stroke="#e2e8f0" stroke-opacity="0.8" stroke-dasharray="4" />
            <line x1="0" y1="135" x2="500" y2="135" stroke="#cbd5e1" stroke-opacity="1" />

            <!-- Smooth Area Wave Fills -->
            <path :d="revenueAreaPath" fill="url(#revenueWaveGradient)" class="transition-all duration-700 ease-in-out" />
            <path :d="expenseAreaPath" fill="url(#expenseWaveGradient)" class="transition-all duration-700 ease-in-out" />

            <!-- Smooth Curved Lines (Waves) -->
            <path :d="expenseCurvePath" fill="none" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round" class="transition-all duration-700 ease-in-out filter drop-shadow-sm" />
            <path :d="revenueCurvePath" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" class="transition-all duration-700 ease-in-out filter drop-shadow-sm" />

            <!-- Points & Labels -->
            <g v-for="(pt, idx) in revenuePoints" :key="'rev-'+idx" class="transition-transform duration-300 hover:scale-125 origin-center cursor-pointer">
                <circle :cx="pt.x" :cy="pt.y" r="4.5" fill="#ffffff" stroke="#34d399" stroke-width="2.5" class="transition-all duration-300 hover:r-7" />
                <text :x="pt.x" :y="pt.y - 12" font-size="9" font-weight="700" fill="#059669" text-anchor="middle" class="filter drop-shadow-sm">{{ formatCompact(pt.value) }}</text>
            </g>

            <g v-for="(pt, idx) in expensePoints" :key="'exp-'+idx" class="transition-transform duration-300 hover:scale-125 origin-center cursor-pointer">
                <circle :cx="pt.x" :cy="pt.y" r="4.5" fill="#ffffff" stroke="#f43f5e" stroke-width="2.5" class="transition-all duration-300 hover:r-7" />
                <text :x="pt.x" :y="pt.y + 18" font-size="9" font-weight="700" fill="#e11d48" text-anchor="middle" class="filter drop-shadow-sm">{{ formatCompact(pt.value) }}</text>
            </g>
        </svg>

        <!-- X-Axis Labels -->
        <div class="flex justify-between text-xs font-semibold text-gray-500 px-2 mt-2">
            <span v-for="(item, index) in activeTrends" :key="index" class="transition-colors duration-300 hover:text-gray-900">{{ item.label }}</span>
        </div>
    </div>

    <!-- Legend -->
    <div class="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100 text-xs font-semibold relative z-10">
        <div class="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500/40 animate-pulse"></span>
            <span class="text-gray-700">Revenue</span>
        </div>
        <div class="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-sm shadow-rose-500/40"></span>
            <span class="text-gray-700">Expenses</span>
        </div>
    </div>
</div>

            <!-- Bottom Section: Tables -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                <!-- Table 1: All Active Tenants List -->
                <div class="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col group">
                    <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                        <div>
                            <h3 class="text-sm font-bold text-gray-900 transition-colors duration-300 group-hover:text-emerald-800">All Active Tenants List</h3>
                            <p class="text-xs text-gray-500 mt-0.5">Master record of registered tenants</p>
                        </div>
                        <span class="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-xs font-semibold rounded-full border border-emerald-500/20 transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-105">
                            Total: {{ tenants.length }}
                        </span>
                    </div>

                    <div class="overflow-x-auto max-h-[300px] overflow-y-auto custom-scrollbar">
                        <table v-if="tenants.length > 0" class="w-full text-left text-xs">
                            <thead class="text-[11px] font-semibold text-gray-400 uppercase bg-gray-50/70 sticky top-0 z-10">
                                <tr>
                                    <th class="p-3 rounded-l-xl">Tenant Name</th>
                                    <th class="p-3">Room</th>
                                    <th class="p-3">Contact No.</th>
                                    <th class="p-3 rounded-r-xl text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-50">
                                <tr v-for="(t, index) in tenants" :key="index" class="hover:bg-emerald-50/60 transition-all duration-200 transform hover:scale-[1.01]">
                                    <td class="p-3 font-semibold text-gray-900">{{ t.fullname }}</td>
                                    <td class="p-3 text-gray-600 font-medium">{{ t.unit_name || 'Unassigned' }}</td>
                                    <td class="p-3 text-gray-600 font-medium">{{ t.contact_no || 'N/A' }}</td>
                                    <td class="p-3 text-right">
                                        <span class="inline-block px-2.5 py-1 text-[10px] font-semibold rounded-full border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 transition-all duration-300 hover:scale-105">
                                            {{ t.downpayment_status || t.status || 'Active' }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div v-else class="flex flex-col items-center justify-center py-12 text-center">
                            <i class="fa-solid fa-users text-gray-300 text-3xl mb-2 animate-bounce"></i>
                            <p class="text-xs font-medium text-gray-400">No tenants registered yet.</p>
                        </div>
                    </div>
                </div>

                <!-- Table 2: Fully Paid / Cleared Accounts -->
                <div class="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col group">
                    <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                        <div>
                            <h3 class="text-sm font-bold text-gray-900 transition-colors duration-300 group-hover:text-emerald-800">Fully Paid Accounts</h3>
                            <p class="text-xs text-gray-500 mt-0.5">Cleared accounts based on contract status</p>
                        </div>
                        <span class="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-xs font-semibold rounded-full border border-emerald-500/20 transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-105">
                            {{ fullyPaidTenants.length }} Paid
                        </span>
                    </div>

                    <div class="overflow-y-auto max-h-[300px] custom-scrollbar">
                        <table v-if="fullyPaidTenants.length > 0" class="w-full text-left text-xs">
                            <thead class="text-[11px] font-semibold text-gray-400 uppercase bg-gray-50/70 sticky top-0 z-10">
                                <tr>
                                    <th class="p-3 rounded-l-xl">Name</th>
                                    <th class="p-3">Room</th>
                                    <th class="p-3 rounded-r-xl text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-50">
                                <tr v-for="(t, index) in fullyPaidTenants" :key="index" class="hover:bg-emerald-50/60 transition-all duration-200 transform hover:scale-[1.01]">
                                    <td class="p-3 font-semibold text-gray-900 truncate max-w-[120px]">{{ t.fullname }}</td>
                                    <td class="p-3 text-gray-600 font-medium">{{ t.unit_name || 'Unassigned' }}</td>
                                    <td class="p-3 text-right">
                                        <span class="inline-block px-2.5 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold rounded-full border border-emerald-500/20 transition-all duration-300 hover:scale-105">
                                            Cleared
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div v-else class="flex flex-col items-center justify-center py-12 text-center">
                            <i class="fa-solid fa-circle-check text-gray-300 text-3xl mb-2 animate-bounce"></i>
                            <p class="text-xs font-medium text-gray-400">No fully paid records.</p>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    `,
    data() {
        return {
            units: [],
            tenants: [],
            totalCollected: 0,
            computedTotalExpenses: 0,
            timeFilter: 'monthly',
            monthlyTrends: [],
            yearlyTrends: []
        };
    },
    computed: {
        currentMonthName() {
            const date = new Date();
            return date.toLocaleString('default', { month: 'long' });
        },
        occupiedRoomsCount() {
            if (!this.units || this.units.length === 0) return 0;
            return this.units.filter(unit => unit.isOccupied == 1 || unit.isOccupied === true).length;
        },
        availableRoomsCount() {
            if (!this.units || this.units.length === 0) return 0;
            return this.units.filter(unit => unit.isOccupied == 0 || unit.isOccupied === false).length;
        },
        occupancyRate() {
            if (!this.units || this.units.length === 0) return 0;
            return Math.round((this.occupiedRoomsCount / this.units.length) * 100);
        },
        fullyPaidTenants() {
            if (!this.tenants) return [];
            return this.tenants.filter(tenant =>
                tenant.downpayment_status === 'Paid' ||
                tenant.downpayment_status === 'Fully Paid' ||
                tenant.status === 'Paid'
            );
        },
        currentMonthRevenue() {
            if (this.monthlyTrends.length > 0) {
                return this.monthlyTrends[this.monthlyTrends.length - 1].revenue;
            }
            return this.totalCollected;
        },
        currentYearRevenue() {
            if (this.yearlyTrends.length > 0) {
                return this.yearlyTrends[this.yearlyTrends.length - 1].revenue;
            }
            return this.totalCollected;
        },
        activeTrends() {
            return this.timeFilter === 'monthly' ? this.monthlyTrends : this.yearlyTrends;
        },
        maxGraphValue() {
            const trends = this.activeTrends;
            if (!trends || trends.length === 0) return 1000;
            const allRev = trends.map(t => t.revenue);
            const allExp = trends.map(t => t.expense);
            const peak = Math.max(...allRev, ...allExp, 1000);
            return peak * 1.2;
        },
        revenuePoints() {
            const maxVal = this.maxGraphValue;
            const trends = this.activeTrends;
            if (!trends || trends.length === 0) return [];
            const widthStep = 500 / (trends.length - 1 || 1);
            return trends.map((item, index) => {
                const x = index * widthStep;
                const y = 135 - Math.min(Math.max((item.revenue / maxVal) * 135, 10), 130);
                return { x, y, value: item.revenue };
            });
        },
        expensePoints() {
            const maxVal = this.maxGraphValue;
            const trends = this.activeTrends;
            if (!trends || trends.length === 0) return [];
            const widthStep = 500 / (trends.length - 1 || 1);
            return trends.map((item, index) => {
                const x = index * widthStep;
                const y = 135 - Math.min(Math.max((item.expense / maxVal) * 135, 10), 130);
                return { x, y, value: item.expense };
            });
        },
        revenueCurvePath() {
            return this.getSmoothCurvePath(this.revenuePoints);
        },
        expenseCurvePath() {
            return this.getSmoothCurvePath(this.expensePoints);
        },
        revenueAreaPath() {
            const pts = this.revenuePoints;
            if (pts.length === 0) return '';
            const curve = this.revenueCurvePath;
            const lastX = pts[pts.length - 1].x;
            const firstX = pts[0].x;
            return `${curve} L ${lastX} 135 L ${firstX} 135 Z`;
        },
        expenseAreaPath() {
            const pts = this.expensePoints;
            if (pts.length === 0) return '';
            const curve = this.expenseCurvePath;
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
            return Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        },
        formatCompact(value) {
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
            return value;
        },
        generateDynamicMonths() {
            const months = [];
            const currentDate = new Date();
            for (let i = -3; i <= 2; i++) {
                const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
                months.push({
                    label: d.toLocaleString('default', { month: 'short' }),
                    revenue: 0,
                    expense: 0
                });
            }
            this.monthlyTrends = months;
        },
        async loadData() {
            try {
                this.generateDynamicMonths();
                const data = await DashboardController.loadDashboardData();
                this.units = data.units || [];
                this.tenants = data.tenants || [];
                this.totalCollected = data.totalCollected || 0;
                this.computedTotalExpenses = data.computedTotalExpenses || 0;

                if (data.yearlyTrends && data.yearlyTrends.length > 0) {
                    this.yearlyTrends = data.yearlyTrends;
                } else {
                    const currentYear = new Date().getFullYear();
                    this.yearlyTrends = [
                        { label: String(currentYear - 3), revenue: 0, expense: 0 },
                        { label: String(currentYear - 2), revenue: 0, expense: 0 },
                        { label: String(currentYear - 1), revenue: 0, expense: 0 },
                        { label: String(currentYear), revenue: this.totalCollected || 0, expense: this.computedTotalExpenses || 0 }
                    ];
                }

                if (this.monthlyTrends.length > 0) {
                    const currentMonthIdx = this.monthlyTrends.findIndex(m => m.label === this.currentMonthName);
                    const targetIdx = currentMonthIdx !== -1 ? currentMonthIdx : this.monthlyTrends.length - 1;
                    this.monthlyTrends[targetIdx].revenue = this.totalCollected || 0;
                    this.monthlyTrends[targetIdx].expense = this.computedTotalExpenses || 0;
                }
            } catch (e) {
                console.error("Error loading dashboard view data", e);
            }
        }
    },
    // Idagdag o palitan sa loob ng Dashboard object:
    mounted() {
        this.loadData();
        // Automatic AJAX refresh every 5 seconds
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