const Finance = {
    template: `
        <div class="space-y-6 min-h-full pb-10 transition-all duration-700 ease-out">
            <!-- Header & Action Button -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 transform transition-all duration-500 hover:translate-x-1" data-aos="fade-right">
                <div>
                    <h1 class="text-3xl font-black text-gray-900 tracking-tight transition-colors duration-300 hover:text-emerald-800">Finance & Transaction Reports</h1>
                    <p class="text-sm text-gray-500 font-medium">Track collections, monthly and annual revenue, net remaining income, and tenant transactions.</p>
                </div>
                <button @click="loadData" class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer active:scale-95">
                    <i class="fas fa-sync-alt" :class="{'fa-spin': loading}"></i> Refresh
                </button>
            </div>
            <hr class="border-gray-100 transition-all duration-500 hover:border-emerald-500/50">

            <!-- Dashboard Layout: 50-50 Split with Smooth 3D Hover Animations -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
                <!-- Left: 50% - Total Collections + Progress Breakdown -->
                <div class="bg-white border border-gray-100 p-6 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-emerald-950/15 transition-all duration-500 transform hover:-translate-y-2 flex flex-col justify-between relative overflow-hidden group" data-aos="fade-up" data-aos-delay="0">
                    <div class="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                    
                    <div class="relative z-10">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 transition-colors duration-300 group-hover:text-emerald-700">NET COLLECTIONS (AFTER EXPENSES)</p>
                                <h3 class="text-4xl font-black text-gray-900 transition-transform duration-300 group-hover:scale-[1.03] origin-left" >₱ {{ formatMoney(netTotalCollections) }}</h3>
                            </div>
                            <span class="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-xl text-xs font-bold flex items-center gap-1.5 h-fit border border-emerald-200/60 shadow-sm transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-3">
                                <i class="fas fa-wallet"></i> Cash on Hand
                            </span>
                        </div>

                        <!-- Gross vs Expenses breakdown -->
                        <div class="mt-6 space-y-2.5 pt-4 border-t border-gray-50 bg-gray-50/80 p-4 rounded-xl backdrop-blur-sm transition-all duration-500 group-hover:bg-emerald-50/40 group-hover:shadow-inner">
                            <div class="flex justify-between text-xs font-bold">
                                <span class="text-gray-600">Gross collected (all time)</span>
                                <span class="text-gray-900">₱ {{ formatMoney(totalCollected) }}</span>
                            </div>
                            <div class="flex justify-between text-xs font-bold">
                                <span class="text-gray-600">Less: approved expenses</span>
                                <span class="text-rose-600">- ₱ {{ formatMoney(allSpent) }}</span>
                            </div>
                            <div class="flex justify-between text-sm font-black border-t border-gray-200 pt-2.5">
                                <span class="text-gray-800">Net cash on hand</span>
                                <span class="text-emerald-600">₱ {{ formatMoney(netTotalCollections) }}</span>
                            </div>
                            <div class="flex items-center justify-between text-[11px] text-gray-500 pt-1 font-medium">
                                <span>This year ({{ currentYear }}): ₱ {{ formatMoney(yearlyCollected) }}</span>
                                <span>Total Records: {{ finances.length }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 relative z-10 transition-colors duration-300 group-hover:text-gray-700">
                        <span>All registered tenant transactions.</span>
                        <span class="font-bold text-emerald-600 transition-transform duration-300 group-hover:translate-x-1">Financial Dashboard &rarr;</span>
                    </div>
                </div>

                <!-- Right: 50% - Two Boxes with Two Data Entries Each and 3D Effects -->
                <div class="flex flex-col gap-4 justify-between">
                    <!-- Box 1: This Month & This Year -->
                    <div class="bg-white border border-gray-100 p-5 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-indigo-950/10 transition-all duration-500 transform hover:-translate-y-1.5 flex flex-col justify-between relative overflow-hidden group flex-1" data-aos="fade-up" data-aos-delay="100">
                        <div class="absolute -left-10 -top-10 w-36 h-36 bg-indigo-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-100 relative z-10">
                            <!-- Data 1: This Month -->
                            <div class="flex items-center justify-between pr-0 md:pr-4 group/item">
                                <div>
                                    <p class="text-[10px] font-bold text-amber-800 uppercase tracking-wider group-hover/item:text-amber-900 transition-colors">THIS MONTH ({{ currentMonthName }})</p>
                                    <h3 class="text-xl font-black text-gray-900 mt-0.5 group-hover/item:text-amber-600 transition-colors duration-300 transform group-hover/item:scale-105 origin-left" v-countup>₱ {{ formatMoney(monthlyCollected) }}</h3>
                                </div>
                                <span class="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl text-xs transition-all duration-300 group-hover/item:bg-amber-500 group-hover/item:text-white group-hover/item:scale-110 shadow-sm">
                                    <i class="fas fa-calendar-alt"></i>
                                </span>
                            </div>
                            <!-- Data 2: This Year -->
                            <div class="flex items-center justify-between pl-0 md:pl-4 pt-3 md:pt-0 group/item">
                                <div>
                                    <p class="text-[10px] font-bold text-indigo-900 uppercase tracking-wider group-hover/item:text-indigo-700 transition-colors">THIS YEAR ({{ currentYear }})</p>
                                    <h3 class="text-xl font-black text-gray-900 mt-0.5 group-hover/item:text-indigo-600 transition-colors duration-300 transform group-hover/item:scale-105 origin-left" v-countup>₱ {{ formatMoney(yearlyCollected) }}</h3>
                                </div>
                                <span class="p-2.5 bg-indigo-500/10 text-indigo-600 rounded-xl text-xs transition-all duration-300 group-hover/item:bg-indigo-500 group-hover/item:text-white group-hover/item:scale-110 shadow-sm">
                                    <i class="fas fa-chart-line"></i>
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Box 2: Total Tenant Balance & Net Income -->
                    <div class="bg-white border border-gray-100 p-5 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-emerald-950/10 transition-all duration-500 transform hover:-translate-y-1.5 flex flex-col justify-between relative overflow-hidden group flex-1" data-aos="fade-up" data-aos-delay="200">
                        <div class="absolute -right-10 -bottom-10 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-100 relative z-10">
                            <!-- Data 1: Total Tenant Balance -->
                            <div class="flex items-center justify-between pr-0 md:pr-4 group/item">
                                <div>
                                    <p class="text-[10px] font-bold text-teal-900 uppercase tracking-wider group-hover/item:text-teal-700 transition-colors">Total Tenant Balance</p>
                                    <h3 class="text-xl font-black text-gray-900 mt-0.5 group-hover/item:text-teal-600 transition-colors duration-300 transform group-hover/item:scale-105 origin-left" v-countup>₱ {{ formatMoney(totalTenantBalances) }}</h3>
                                </div>
                                <span class="p-2.5 bg-teal-500/10 text-teal-600 rounded-xl text-xs transition-all duration-300 group-hover/item:bg-teal-500 group-hover/item:text-white group-hover/item:scale-110 shadow-sm">
                                    <i class="fas fa-file-invoice-dollar"></i>
                                </span>
                            </div>
                            <!-- Data 2: Net Income -->
                            <div class="flex items-center justify-between pl-0 md:pl-4 pt-3 md:pt-0 group/item">
                                <div>
                                    <p class="text-[10px] font-bold text-blue-900 uppercase tracking-wider group-hover/item:text-blue-700 transition-colors">Net This Month (After Expenses)</p>
                                    <h3 class="text-xl font-black text-black mt-0.5 group-hover/item:text-blue-800 transition-colors duration-300 transform group-hover/item:scale-105 origin-left" v-countup>₱ {{ formatMoney(remainingNetIncome) }}</h3>
                                </div>
                                <span class="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl text-xs transition-all duration-300 shadow-sm">
                                    <i class="fas fa-piggy-bank"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                    <!-- Box 3: Leftover Last Month -->
                    <div class="bg-white border border-gray-100 p-5 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-emerald-950/10 transition-all duration-500 transform hover:-translate-y-1.5 relative overflow-hidden group flex-1" data-aos="fade-up" data-aos-delay="300">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-100 relative z-10">
                            <div class="flex items-center justify-between pr-0 md:pr-4 group/item">
                                <div>
                                    <p class="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">LEFTOVER LAST MONTH ({{ lastMonthName }})</p>
                                    <h3 class="text-xl font-black text-gray-900 mt-0.5 group-hover/item:text-emerald-600 transition-colors duration-300">₱ {{ formatMoney(lastMonthLeftover) }}</h3>
                                </div>
                                <span class="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl text-xs transition-all duration-300 group-hover/item:bg-emerald-500 group-hover/item:text-white shadow-sm">
                                    <i class="fas fa-history"></i>
                                </span>
                            </div>
                            <div class="pl-0 md:pl-4 pt-3 md:pt-0 text-xs space-y-1.5 flex flex-col justify-center">
                                <div class="flex justify-between font-bold"><span class="text-gray-500">Collected</span><span class="text-gray-900">₱ {{ formatMoney(lastMonth.collected) }}</span></div>
                                <div class="flex justify-between font-bold"><span class="text-gray-500">Approved expenses</span><span class="text-rose-600">- ₱ {{ formatMoney(lastMonth.spent) }}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- MONTHLY EXPENSE BUDGET (30% of this month's collections) -->
            <div class="bg-white border border-gray-100 p-6 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-amber-950/10 transition-all duration-500 relative overflow-hidden group" data-aos="fade-up" data-aos-delay="0">
                <div class="absolute -left-12 -top-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                <div class="relative z-10">
                    <div class="flex flex-col md:flex-row md:items-start justify-between gap-3">
                        <div>
                            <p class="text-xs font-bold text-amber-700 uppercase tracking-wider">Available Expense Budget - {{ currentMonthName }} {{ currentYear }}</p>
                            <h3 class="text-3xl font-black text-gray-900 mt-1">₱ {{ formatMoney(ms.budgetAvailable) }}</h3>
                            <p class="text-[11px] text-gray-500 mt-1 font-medium">{{ budgetPercent }}% of this month's payments (₱ {{ formatMoney(ms.budgetPool) }}) + unused budget carried over from earlier months (₱ {{ formatMoney(ms.carryOver) }}).</p>
                        </div>
                        <span class="px-3 py-1.5 rounded-xl text-xs font-bold h-fit border shadow-sm" :class="budgetBadgeClass">{{ budgetStatusText }}</span>
                    </div>

                    <div class="mt-5 w-full bg-gray-200 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
                        <div class="h-full rounded-full transition-all duration-1000" :class="budgetBarClass" :style="{ width: budgetUsedPct + '%' }"></div>
                    </div>
                    <div class="flex justify-between text-[11px] text-gray-500 font-medium mt-1.5">
                        <span>{{ budgetUsedPct.toFixed(0) }}% of the budget used</span>
                        <span>Pending approval: ₱ {{ formatMoney(ms.pending) }}</span>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                        <div class="bg-blue-50/60 border border-blue-100 rounded-2xl p-3.5">
                            <p class="text-[10px] font-bold text-blue-900 uppercase tracking-wider">Collected This Month</p>
                            <p class="text-lg font-black text-gray-900 mt-1">₱ {{ formatMoney(ms.collected) }}</p>
                        </div>
                        <div class="bg-rose-50/60 border border-rose-100 rounded-2xl p-3.5">
                            <p class="text-[10px] font-bold text-rose-900 uppercase tracking-wider">Budget Used</p>
                            <p class="text-lg font-black text-gray-900 mt-1">₱ {{ formatMoney(ms.budgetUsed) }}</p>
                        </div>
                        <div class="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5">
                            <p class="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">Budget Remaining</p>
                            <p class="text-lg font-black text-gray-900 mt-1">₱ {{ formatMoney(ms.budgetRemaining) }}</p>
                        </div>
                        <div class="bg-amber-50/60 border border-amber-200 rounded-2xl p-3.5">
                            <p class="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Over Budget (from profit)</p>
                            <p class="text-lg font-black" :class="ms.overflow > 0 ? 'text-rose-600' : 'text-gray-900'">₱ {{ formatMoney(ms.overflow) }}</p>
                        </div>
                    </div>
                    <p class="text-[11px] text-gray-400 mt-4">Only approved expenses are counted (see Expenses &amp; Budget). Unused budget carries over to the next month, so you are never back to zero.</p>
                </div>
            </div>

            <!-- FINANCIAL WAVE GRAPH SECTION -->
            <div class="bg-white border border-gray-100 p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 text-gray-900 relative overflow-hidden group" data-aos="zoom-in-up" data-aos-delay="0">
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
                        <path :d="financeAreaPath" fill="url(#financeWaveGradient)" class="transition-all duration-700 ease-in-out pp-chart-area" />

                        <!-- Smooth Curved Line (Wave) -->
                        <path :d="financeCurvePath" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" pathLength="1" class="transition-all duration-700 ease-in-out filter drop-shadow-sm pp-chart-line" />

                        <!-- Points & Labels -->
                        <g v-for="(pt, idx) in financePoints" :key="'fin-'+idx" class="transition-transform duration-300 hover:scale-150 origin-center cursor-pointer pp-chart-point" :style="{ animationDelay: (idx * 80 + 500) + 'ms' }">
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
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md" data-aos="fade-up" data-aos-delay="100">
                <div class="relative w-full md:w-80">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                        <i class="fas fa-search text-xs"></i>
                    </span>
                    <input type="text" v-model="searchQuery" placeholder="Search tenant, unit, or payment type..." 
                        class="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium bg-gray-50/50 transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/20">
                </div>

                <div class="flex items-center gap-3 w-full md:w-auto">
                    <select v-model="selectedYear" class="px-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium bg-gray-50/50 cursor-pointer transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/20">
                        <option value="">All Years</option>
                        <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
                    </select>

                    <select v-model="selectedMonth" class="px-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium bg-gray-50/50 cursor-pointer transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/20">
                        <option value="">All Months</option>
                        <option value="01">January</option>
                        <option value="02">February</option>
                        <option value="03">March</option>
                        <option value="04">April</option>
                        <option value="05">May</option>
                        <option value="06">June</option>
                        <option value="07">July</option>
                        <option value="08">August</option>
                        <option value="09">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                    </select>
                </div>
            </div>

            <!-- Transactions Table -->
            <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg" data-aos="fade-up" data-aos-delay="200">
                <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 class="font-bold text-gray-800 text-base">Transaction List</h2>
                    <span class="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-bold border border-emerald-200/50 transition-all duration-300 hover:scale-105">
                        Showing {{ filteredFinances.length }} records
                    </span>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-gray-50/70 text-gray-400 text-[10px] uppercase tracking-wider font-bold">
                                <th class="px-6 py-3">Date</th>
                                <th class="px-6 py-3">Tenant Name</th>
                                <th class="px-6 py-3">Unit</th>
                               
                                <th class="px-6 py-3">Amount</th>
                                <th class="px-6 py-3">30% to Budget</th>
                                <th class="px-6 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 text-xs text-gray-700">
                            <tr v-if="loading && !initialLoaded">
                                <td colspan="6" class="px-6 py-8 text-center text-gray-400">
                                    <i class="fas fa-spinner fa-spin mr-2"></i> Loading data...
                                </td>
                            </tr>
                            <tr v-else-if="filteredFinances.length === 0">
                                <td colspan="6" class="px-6 py-8 text-center text-gray-400">
                                    No transactions found.
                                </td>
                            </tr>
                            <tr v-for="item in filteredFinances" :key="item.id" class="hover:bg-emerald-50/50 transition-all duration-200">
                                <td class="px-6 py-4 font-medium text-gray-900">
                                    
                                    <div class="text-[11px] text-black">{{ item.payment_date }}</div>
                                </td>
                                <td class="px-6 py-4 font-bold text-gray-800">{{ item.tenant_name }}</td>
                                <td class="px-6 py-4">
                                    <span class="bg-blue-100 text-blue-600 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors duration-200 hover:bg-gray-200">
                                        {{ item.unit_name || 'N/A' }}
                                    </span>
                                </td>
                                
                                <td class="px-6 py-4 font-black text-emerald-600 text-sm">₱ {{ formatMoney(item.amount) }}</td>
                                <td class="px-6 py-4 font-bold text-amber-600 text-xs">₱ {{ formatMoney(item.amount * budgetRate) }}</td>
                                <td class="px-6 py-4 text-center">
                                    <span class="px-3 py-1 rounded-full text-[11px] font-bold border transition-transform duration-200 hover:scale-110 inline-block"
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
            remainingNetIncome: 0,
            cashOnHand: null,
            allSpent: 0,
            lastMonth: { collected: 0, spent: 0, net: 0 },
            budgetRate: 0.30,
            ms: { collected: 0, budgetPool: 0, carryOver: 0, budgetAvailable: 0, budgetUsed: 0, budgetRemaining: 0, overflow: 0, totalSpent: 0, pending: 0, netProfit: 0 },
            loading: false,
            initialLoaded: false,
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
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const idx = new Date().getMonth();
            return months[idx];
        },
        // Total na kinita MINUS aprubadong expenses (hindi bababa sa 0)
        netTotalCollections() {
            if (this.cashOnHand === null) return Math.max(0, Number(this.totalCollected) || 0);
            return Math.max(0, this.cashOnHand);
        },
        lastMonthLeftover() {
            return Math.max(0, this.lastMonth.net);
        },
        lastMonthName() {
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const d = new Date();
            const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
            return months[prev.getMonth()] + (prev.getFullYear() !== d.getFullYear() ? ' ' + prev.getFullYear() : '');
        },
        budgetPercent() {
            return Math.round(this.budgetRate * 100);
        },
        budgetUsedPct() {
            const pool = Number(this.ms.budgetAvailable) || 0;
            return pool > 0 ? Math.min(100, (Number(this.ms.budgetUsed) / pool) * 100) : 0;
        },
        budgetBarClass() {
            if (this.ms.overflow > 0 || this.budgetUsedPct >= 100) return 'bg-gradient-to-r from-rose-400 to-rose-600';
            if (this.budgetUsedPct >= 80) return 'bg-gradient-to-r from-amber-400 to-amber-600';
            return 'bg-gradient-to-r from-emerald-400 to-emerald-600';
        },
        budgetBadgeClass() {
            if (this.ms.overflow > 0) return 'bg-rose-50 text-rose-600 border-rose-200';
            if (this.budgetUsedPct >= 80) return 'bg-amber-50 text-amber-700 border-amber-200';
            return 'bg-emerald-50 text-emerald-600 border-emerald-200';
        },
        budgetStatusText() {
            if (this.ms.overflow > 0) return 'Over budget';
            if (this.budgetUsedPct >= 80) return 'Almost used up';
            return 'Within budget';
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
            return val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
        // Ligtas na pag-parse ng JSON kahit may sumingit na warning/BOM sa unahan ng response
        async fetchJson(url) {
            const response = await fetch(url, { cache: 'no-store' });
            const text = (await response.text()).trim();
            const firstBrace = text.indexOf('{');
            const firstBracket = text.indexOf('[');
            let startIndex = 0;
            if (firstBrace !== -1 && firstBracket !== -1) startIndex = Math.min(firstBrace, firstBracket);
            else if (firstBrace !== -1) startIndex = firstBrace;
            else if (firstBracket !== -1) startIndex = firstBracket;
            return JSON.parse(startIndex > 0 ? text.substring(startIndex) : text);
        },
        async loadTenantBalances() {
            try {
                const data = await this.fetchJson('api/rent.php?action=balances');
                if (data && data.success && data.balances) {
                    this.totalTenantBalances = data.balances.reduce((sum, t) => sum + parseFloat(t.remaining_balance || 0), 0);
                }
            } catch (e) {
                console.error("Error loading tenant balances:", e);
            }
        },
        async loadExpenseFinancials() {
            try {
                // Laging ang kasalukuyang buwan (oras ng device) ang hinihingi, hindi ang oras ng server
                const d = new Date();
                const ym = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
                const data = await this.fetchJson('api/expenses_api.php?month=' + ym + '&year=' + d.getFullYear());
                if (data && data.success) {
                    if (data.budgetRate) this.budgetRate = Number(data.budgetRate);
                    if (data.monthStats) {
                        const m = data.monthStats;
                        this.ms = {
                            collected: Number(m.collected) || 0,
                            budgetPool: Number(m.budgetPool) || 0,
                            carryOver: Number(m.carryOver) || 0,
                            budgetAvailable: Number(m.budgetAvailable) || 0,
                            budgetUsed: Number(m.budgetUsed) || 0,
                            budgetRemaining: Number(m.budgetRemaining) || 0,
                            overflow: Number(m.overflow) || 0,
                            totalSpent: Number(m.totalSpent) || 0,
                            pending: Number(m.pending) || 0,
                            netProfit: Number(m.netProfit) || 0
                        };
                    }
                    if (data.prevMonthStats) {
                        const p = data.prevMonthStats;
                        const c = Number(p.collected) || 0;
                        const sp = Number(p.totalSpent) || 0;
                        this.lastMonth = { collected: c, spent: sp, net: c - sp };
                    }
                    // Kinita ngayong buwan MINUS aprubadong gastos ngayong buwan (hindi bababa sa 0)
                    this.remainingNetIncome = Math.max(0, this.ms.netProfit);
                    // All-time: nakolekta MINUS lahat ng aprubadong gastos
                    if (data.cashOnHand !== undefined && data.cashOnHand !== null) {
                        this.cashOnHand = Number(data.cashOnHand) || 0;
                    }
                    if (data.allSpent !== undefined && data.allSpent !== null) {
                        this.allSpent = Number(data.allSpent) || 0;
                    }
                }
            } catch (e) {
                console.error("Error loading expense financials:", e);
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
            await this.loadExpenseFinancials();
            this.loading = false;
            this.initialLoaded = true;
        }
    },
    mounted() {
        this.loadData();
        this.autoRefreshTimer = setInterval(() => {
            this.loadData();
        }, 15000);
    },
    beforeUnmount() {
        if (this.autoRefreshTimer) {
            clearInterval(this.autoRefreshTimer);
        }
    }
};