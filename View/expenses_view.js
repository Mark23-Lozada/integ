const Expenses = {
    template: `
        <div class="space-y-6 min-h-full pb-10 transition-all duration-500 ease-out">

            <!-- Header -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex flex-col gap-1 transform transition-all duration-500 hover:translate-x-1" data-aos="fade-right">
                    <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight transition-colors duration-300 hover:text-emerald-800">Expenses &amp; Budget</h1>
                    <p class="text-sm text-gray-500 font-medium">{{ budgetPercent }}% of each month's collected rent goes to the Monthly Budget.</p>
                </div>
                <button @click="openAddModal" class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                    <i class="fa-solid fa-plus"></i> Add Expenses
                </button>
            </div>
            <hr class="border-gray-100 transition-all duration-500 hover:border-emerald-500/50">

            <!-- Month picker -->
            <div class="flex flex-wrap items-center gap-3">
                <div class="bg-gray-100/80 border border-gray-200/60 p-1 rounded-xl flex items-center gap-1 shadow-inner">
                    <input type="month" v-model="month" @change="onMonthChange" class="bg-white px-3 py-1.5 text-xs font-semibold rounded-lg text-gray-700 outline-none cursor-pointer shadow-sm">
                </div>
                <span class="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full border border-emerald-200/60 shadow-sm">{{ monthLabel }}</span>
            </div>

            <!-- Top section: budget card + stacked boxes -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

                <!-- Monthly budget card -->
                <div class="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-emerald-950/10 transition-all duration-500 transform hover:-translate-y-1.5 flex flex-col justify-between group border border-gray-100 relative overflow-hidden" data-aos="fade-up" data-aos-delay="0">
                    <div class="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                    <div>
                        <div class="flex justify-between items-start relative z-10">
                            <div>
                                <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider transition-all duration-300 group-hover:text-emerald-700">Available Budget</p>
                                <h3 class="text-4xl font-extrabold text-gray-900 mt-2 tracking-tight transition-transform duration-300 group-hover:scale-[1.02] origin-left" v-countup>{{ money(ms.budgetAvailable) }}</h3>
                                <p class="text-[11px] text-gray-500 mt-1 font-medium">{{ budgetPercent }}% of this month: {{ money(ms.budgetPool) }} + carried over: {{ money(ms.carryOver) }}</p>
                            </div>
                            <div class="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full border border-emerald-200/60 shadow-sm transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-105">{{ monthLabel }}</div>
                        </div>

                        <div class="mt-5 bg-gray-50/80 p-4 rounded-xl border border-gray-100 backdrop-blur-sm flex items-center justify-around transition-all duration-300 group-hover:bg-emerald-50/30 group-hover:border-emerald-200/50 relative z-10">
                            <div class="relative w-28 h-28 flex items-center justify-center transform transition-transform duration-500 group-hover:scale-110">
                                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path class="text-gray-200" stroke-width="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path :class="donutColor" class="transition-all duration-1000" :stroke-dasharray="budgetUsedPct + ', 100'" stroke-width="3.5" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                </svg>
                                <div class="absolute flex flex-col items-center justify-center text-center">
                                    <span class="text-lg font-black text-gray-900 transition-transform duration-300 group-hover:scale-110">{{ budgetUsedPct.toFixed(0) }}%</span>
                                    <span class="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Used</span>
                                </div>
                            </div>
                            <div class="flex flex-col gap-2 text-xs">
                                <div class="flex items-center gap-2 transition-transform duration-300 hover:translate-x-1">
                                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm animate-pulse"></span>
                                    <span class="text-gray-700 font-medium">Used: {{ money(ms.budgetUsed) }}</span>
                                </div>
                                <div class="flex items-center gap-2 transition-transform duration-300 hover:translate-x-1">
                                    <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></span>
                                    <span class="text-gray-700 font-medium">Remaining: {{ money(ms.budgetRemaining) }}</span>
                                </div>
                                <div class="flex items-center gap-2 transition-transform duration-300 hover:translate-x-1">
                                    <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></span>
                                    <span class="text-gray-700 font-medium">Over budget: {{ money(ms.overflow) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 gap-4 bg-gray-50/80 p-4 rounded-xl backdrop-blur-sm relative z-10 transition-all duration-300 group-hover:bg-emerald-50/30">
                        <div class="transform transition-transform duration-300 hover:translate-x-1">
                            <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Collected This Month</p>
                            <h4 class="text-xl font-bold text-gray-900 mt-1" v-countup>{{ money(ms.collected) }}</h4>
                        </div>
                        <div class="transform transition-transform duration-300 hover:translate-x-1">
                            <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Net Profit</p>
                            <h4 class="text-xl font-bold mt-1" :class="ms.netProfit >= 0 ? 'text-gray-900' : 'text-rose-600'">{{ money(ms.netProfit) }}</h4>
                        </div>
                    </div>
                </div>

                <!-- Right stacked cards -->
                <div class="flex flex-col gap-3 justify-between">
                    <div class="bg-gradient-to-br from-blue-50/50 to-white border border-blue-100/80 px-5 py-4 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-between group" data-aos="fade-up" data-aos-delay="100">
                        <div>
                            <p class="text-xs font-semibold text-blue-900 uppercase tracking-wider transition-colors duration-300 group-hover:text-blue-700">Rent Collected</p>
                            <h4 class="text-xl font-bold text-gray-900 mt-0.5 tracking-tight group-hover:text-blue-600 transition-colors" v-countup>{{ money(ms.collected) }}</h4>
                            <p class="text-[11px] text-gray-500 mt-0.5">All payments received in {{ monthLabel }}</p>
                        </div>
                        <div class="p-3 bg-blue-500/10 text-blue-600 text-sm font-semibold rounded-xl transition-all duration-300 group-hover:bg-blue-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-6"><i class="fa-solid fa-peso-sign"></i></div>
                    </div>

                    <div class="bg-gradient-to-br from-rose-50/50 to-white border border-rose-100/80 px-5 py-4 rounded-2xl shadow-sm hover:shadow-xl hover:border-rose-300 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-between group" data-aos="fade-up" data-aos-delay="200">
                        <div>
                            <p class="text-xs font-semibold text-rose-900 uppercase tracking-wider transition-colors duration-300 group-hover:text-rose-700">Approved Expenses</p>
                            <h4 class="text-xl font-bold text-gray-900 mt-0.5 tracking-tight group-hover:text-rose-600 transition-colors" v-countup>{{ money(ms.totalSpent) }}</h4>
                            <p class="text-[11px] text-gray-500 mt-0.5">Only approved items are counted</p>
                        </div>
                        <div class="p-3 bg-rose-500/10 text-rose-600 text-sm font-semibold rounded-xl transition-all duration-300 group-hover:bg-rose-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-6"><i class="fa-solid fa-file-invoice-dollar"></i></div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-gradient-to-br from-amber-50/60 to-white border border-amber-200/80 p-4 rounded-2xl shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 transform hover:-translate-y-1 group" data-aos="fade-up" data-aos-delay="0">
                            <p class="text-[11px] font-semibold text-amber-800 uppercase tracking-wider group-hover:text-amber-900 transition-colors">Over Budget</p>
                            <h4 class="text-lg font-bold text-gray-900 mt-1 truncate group-hover:text-amber-600 transition-colors" v-countup>{{ money(ms.overflow) }}</h4>
                        </div>
                        <div class="bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100/80 p-4 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1 group" data-aos="fade-up" data-aos-delay="100">
                            <p class="text-[11px] font-semibold text-indigo-900 uppercase tracking-wider group-hover:text-indigo-700 transition-colors">Pending Approval</p>
                            <h4 class="text-lg font-bold text-gray-900 mt-1 truncate group-hover:text-indigo-600 transition-colors" v-countup>{{ money(ms.pending) }}</h4>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Budget notice -->
            <div v-if="ms.overflow > 0" class="bg-gradient-to-br from-rose-50/60 to-white border border-rose-200/80 px-5 py-4 rounded-2xl shadow-sm text-sm text-rose-700 font-semibold flex items-start gap-3">
                <i class="fa-solid fa-triangle-exclamation mt-0.5"></i>
                <span>This month is {{ money(ms.overflow) }} over the Monthly Budget. The excess was taken from profit and does not affect other months.</span>
            </div>
            <div v-else-if="pendingOver > 0" class="bg-gradient-to-br from-amber-50/60 to-white border border-amber-200/80 px-5 py-4 rounded-2xl shadow-sm text-sm text-amber-700 font-semibold flex items-start gap-3">
                <i class="fa-solid fa-circle-info mt-0.5"></i>
                <span>{{ money(ms.pending) }} is pending. If everything is approved, you will be {{ money(pendingOver) }} over the Monthly Budget.</span>
            </div>
            <div v-else class="bg-gray-50/80 border border-gray-100 px-5 py-3 rounded-2xl text-xs text-gray-500 font-medium">
                Spending within the budget is free to approve. If an expense goes over, you will be asked to confirm and the excess is deducted from profit. Unused budget carries over to the next month.
            </div>

            <!-- Utility bills -->
            <div class="bg-white border border-gray-100 p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 relative overflow-hidden group" data-aos="fade-up" data-aos-delay="200">
                <div class="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                <div class="mb-5 relative z-10">
                    <h3 class="text-base font-bold text-gray-900 tracking-wide transition-all duration-300 group-hover:translate-x-1">Utility Bills</h3>
                    <p class="text-xs text-gray-500 mt-0.5">Latest bill compared with the previous one. Click a card to add a bill or see its history.</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                    <div v-for="u in utilityCards" :key="u.key" @click="openUtilityModal(u)" :class="u.card" class="bg-gradient-to-br to-white border p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
                        <div class="flex justify-between items-center mb-3">
                            <p class="text-xs font-semibold uppercase tracking-wider" :class="u.text">{{ u.label }}</p>
                            <div class="p-2.5 rounded-xl text-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" :class="u.iconBg"><i :class="u.icon"></i></div>
                        </div>
                        <p class="text-[11px] text-gray-500 font-medium">{{ u.b.currentMonth ? monthText(u.b.currentMonth) + ' bill' : 'No bill recorded yet' }}</p>
                        <h4 class="text-2xl font-bold text-gray-900 mt-0.5" v-countup>{{ money(u.b.current) }}</h4>
                        <div v-if="u.b.previousMonth" class="mt-3 pt-3 border-t border-gray-100 text-xs space-y-1">
                            <p class="text-gray-500">Previous ({{ monthText(u.b.previousMonth) }}): <span class="font-semibold text-gray-700">{{ money(u.b.previous) }}</span></p>
                            <p v-if="u.b.diff !== 0" class="font-bold" :class="u.b.isIncrease ? 'text-rose-600' : 'text-emerald-600'">
                                <i :class="u.b.isIncrease ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down'"></i>
                                {{ u.b.isIncrease ? 'Up ' : 'Down ' }}{{ money(Math.abs(u.b.diff)) }} ({{ u.b.percentage }}%)
                            </p>
                            <p v-else class="font-bold text-gray-500">No change</p>
                        </div>
                        <p v-else-if="u.b.currentMonth" class="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">No earlier bill to compare with yet.</p>
                    </div>
                </div>
            </div>

            <!-- Expenses for the month -->
            <div class="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group" data-aos="fade-up" data-aos-delay="0">
                <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                    <div>
                        <h3 class="text-sm font-bold text-gray-900 transition-colors duration-300 group-hover:text-emerald-800">Expenses for {{ monthLabel }}</h3>
                        <p class="text-xs text-gray-500 mt-0.5">Approve a pending item to count it against the budget</p>
                    </div>
                    <span class="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-xs font-semibold rounded-full border border-emerald-500/20 transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-105">
                        Approved: {{ money(ms.totalSpent) }}
                    </span>
                </div>
                <div class="overflow-x-auto max-h-[420px] overflow-y-auto custom-scrollbar">
                    <table v-if="expenses.length > 0" class="w-full text-left text-xs">
                        <thead class="text-[11px] font-semibold text-gray-400 uppercase bg-gray-50/70 sticky top-0 z-10">
                            <tr>
                                <th class="p-3 rounded-l-xl">Date</th>
                                <th class="p-3">Category</th>
                                <th class="p-3">Item</th>
                                <th class="p-3">Amount</th>
                                <th class="p-3">Status</th>
                                <th class="p-3 rounded-r-xl text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            <tr v-for="exp in expenses" :key="exp.id" class="hover:bg-emerald-50/60 transition-all duration-200">
                                <td class="p-3 text-gray-600 font-medium">{{ exp.expense_date }}</td>
                                <td class="p-3 font-semibold text-gray-900">{{ exp.category }}</td>
                                <td class="p-3 text-gray-600 font-medium">{{ exp.sub_category }}<span v-if="exp.description" class="block text-[10px] text-gray-400">{{ exp.description }}</span></td>
                                <td class="p-3 font-bold text-rose-600">{{ money(exp.amount) }}</td>
                                <td class="p-3">
                                    <span :class="exp.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'" class="inline-block px-2.5 py-1 text-[10px] font-semibold rounded-full border">{{ exp.status }}</span>
                                    <span v-if="exp.status === 'Approved' && Number(exp.overflow_amount) > 0" class="inline-block ml-1 px-2.5 py-1 text-[10px] font-semibold rounded-full border bg-rose-500/10 text-rose-600 border-rose-500/20">Over {{ money(exp.overflow_amount) }}</span>
                                </td>
                                <td class="p-3 text-right space-x-1">
                                    <button v-if="exp.status === 'Pending'" @click="approveExpense(exp.id)" title="Approve" class="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all duration-200 hover:scale-105 cursor-pointer"><i class="fa-solid fa-check"></i></button>
                                    <button @click="deleteExpense(exp.id)" title="Delete" class="px-2.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all duration-200 hover:scale-105 cursor-pointer"><i class="fa-solid fa-trash"></i></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-else class="flex flex-col items-center justify-center py-12 text-center">
                        <i class="fa-solid fa-receipt text-gray-300 text-3xl mb-2 animate-bounce"></i>
                        <p class="text-xs font-medium text-gray-400">No expenses recorded for this month.</p>
                    </div>
                </div>
            </div>

            <!-- Year summary -->
            <div class="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group" data-aos="fade-up" data-aos-delay="100">
                <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                    <div>
                        <h3 class="text-sm font-bold text-gray-900 transition-colors duration-300 group-hover:text-emerald-800">Year Summary</h3>
                        <p class="text-xs text-gray-500 mt-0.5">Totals for the whole year. Click a month to open it.</p>
                    </div>
                    <div class="bg-gray-100/80 border border-gray-200/60 p-1 rounded-xl shadow-inner">
                        <select v-model.number="year" @change="load" class="bg-white px-3 py-1.5 text-xs font-semibold rounded-lg text-gray-700 outline-none cursor-pointer shadow-sm">
                            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
                        </select>
                    </div>
                </div>

                
                <div class="overflow-x-auto custom-scrollbar">
                    <table class="w-full text-left text-xs">
                        <thead class="text-[11px] font-semibold text-gray-400 uppercase bg-gray-50/70">
                            <tr>
                                <th class="p-3 rounded-l-xl">Month</th>
                                <th class="p-3 text-right">Collected</th>
                                <th class="p-3 text-right">Budget ({{ budgetPercent }}%)</th>
                                <th class="p-3 text-right">Expenses</th>
                                <th class="p-3 text-right">Over Budget</th>
                                <th class="p-3 rounded-r-xl text-right">Net Profit</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            <tr v-for="m in yr.months" :key="m.month" @click="goToMonth(m.month)" :class="isSelectedMonth(m.month) ? 'bg-emerald-50/60' : ''" class="hover:bg-emerald-50/60 transition-all duration-200 cursor-pointer">
                                <td class="p-3 font-semibold text-gray-900">{{ monthNames[m.month - 1] }}</td>
                                <td class="p-3 text-right text-gray-600 font-medium">{{ money(m.collected) }}</td>
                                <td class="p-3 text-right text-amber-600 font-medium">{{ money(m.budgetPool) }}</td>
                                <td class="p-3 text-right text-rose-600 font-medium">{{ money(m.spent) }}</td>
                                <td class="p-3 text-right font-medium" :class="m.overflow > 0 ? 'text-rose-600 font-bold' : 'text-gray-300'">{{ money(m.overflow) }}</td>
                                <td class="p-3 text-right font-bold" :class="m.netProfit >= 0 ? 'text-gray-900' : 'text-rose-600'">{{ money(m.netProfit) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p class="text-xs text-gray-400 mt-4">Cash on hand (all time, collected minus approved expenses): <span class="font-bold text-gray-600">{{ money(cashOnHand) }}</span></p>
            </div>

            <!-- Modal: add expenses (several items) -->
            <div v-if="showModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
                    <div class="pb-4 border-b border-gray-100">
                        <h3 class="text-lg font-extrabold text-gray-900 tracking-tight">Add Expenses</h3>
                        <p class="text-xs text-gray-500 mt-0.5">Add as many items as you need in one save. For electricity, water, and internet, click a utility card instead.</p>
                    </div>
                    <form @submit.prevent="saveExpense" class="space-y-4">
                        <div>
                            <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Expense date</label>
                            <input type="date" v-model="form.expense_date" required class="w-full sm:w-56 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400">
                        </div>

                        <div class="space-y-2">
                            <div class="hidden sm:grid grid-cols-12 gap-2 text-[11px] font-semibold text-gray-400 uppercase px-1">
                                <span class="col-span-2">Category</span>
                                <span class="col-span-4">Item</span>
                                <span class="col-span-1">Qty</span>
                                <span class="col-span-2">Unit Price</span>
                                <span class="col-span-2 text-right">Subtotal</span>
                            </div>
                            <div v-for="(item, i) in form.items" :key="item.key" class="grid grid-cols-12 gap-2 items-center">
                                <select v-model="item.category" class="col-span-12 sm:col-span-2 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400">
                                    <option value="Supplies">Supplies</option>
                                    <option value="Repairs">Repairs</option>
                                    <option value="Taxes & Permits">Taxes &amp; Permits (BIR, Mayor's permit, RPT)</option>
                                    <option value="Salaries & Benefits">Salaries &amp; Benefits (SSS, PhilHealth, Pag-IBIG)</option>
                                    <option value="Admin/Others">Admin / Other</option>
                                </select>
                                <input type="text" v-model="item.sub_category" :id="'item-name-' + item.key" placeholder="Enter Materials" class="col-span-12 sm:col-span-4 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400">
                                <input type="number" min="1" step="1" v-model="item.qty" title="Quantity" class="col-span-3 sm:col-span-1 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400">
                                <input type="number" step="0.01" min="0" v-model="item.price" @keydown.enter.prevent="nextRow(i)" placeholder="0.00" title="Price of one" class="col-span-4 sm:col-span-2 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400">
                                <span class="col-span-4 sm:col-span-2 text-right text-sm font-bold text-gray-700">{{ money(lineTotal(item)) }}</span>
                                <button type="button" @click="removeItem(i)" :disabled="form.items.length === 1" title="Remove item" class="col-span-1 text-gray-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"><i class="fa-solid fa-xmark"></i></button>
                            </div>
                            <button type="button" @click="addItem" class="w-full py-2.5 border-2 border-dashed border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/5 text-sm font-bold rounded-xl transition-all duration-300 cursor-pointer"><i class="fa-solid fa-plus"></i> Add another item</button>
                            <p class="text-[11px] text-gray-400">One row per kind of item. Press Enter in the price field to jump to the next row.</p>
                        </div>

                        <div>
                            <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Note (optional, applies to all items)</label>
                            <input type="text" v-model="form.description" placeholder="e.g. Bought at the market" class="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400">
                        </div>

                        <div class="flex justify-between items-center bg-gray-50/80 border border-gray-100 rounded-xl px-4 py-3">
                            <span class="text-sm font-semibold text-gray-600">Total ({{ filledItems.length }} {{ filledItems.length === 1 ? 'item' : 'items' }})</span>
                            <span class="text-lg font-extrabold text-rose-600">{{ money(formTotal) }}</span>
                        </div>

                        <p v-if="formOverBudget" class="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                            This total is more than the remaining budget ({{ money(ms.budgetRemaining) }}). When approved, the excess will be taken from profit.
                        </p>

                        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button type="button" @click="showModal = false" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer">Cancel</button>
                            <button type="submit" class="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer">Save All</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Modal: utility bill -->
            <div v-if="showUtility" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[85vh] overflow-y-auto">
                    <div class="flex justify-between items-center pb-4 border-b border-gray-100">
                        <h3 class="text-lg font-extrabold text-gray-900 tracking-tight">{{ utility.title }}</h3>
                        <button @click="showUtility = false" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer">Close</button>
                    </div>

                    <div class="bg-gray-50/80 border border-gray-100 rounded-xl p-4 space-y-3">
                        <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Add a bill</p>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Amount (₱)</label>
                                <input type="number" step="0.01" min="0" v-model="billForm.amount" placeholder="0.00" class="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400">
                            </div>
                            <div>
                                <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Bill date</label>
                                <input type="date" v-model="billForm.expense_date" class="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400">
                            </div>
                        </div>
                        <p class="text-[11px] text-gray-400">The month of the date is the bill month. For an October bill, pick a date in October.</p>
                        <button type="button" @click="saveBill" class="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer">Save Bill</button>
                    </div>

                    <div>
                        <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">History</p>
                        <div v-if="utilityHistory.length === 0" class="flex flex-col items-center justify-center py-8 text-center">
                            <i class="fa-solid fa-file-invoice text-gray-300 text-3xl mb-2 animate-bounce"></i>
                            <p class="text-xs font-medium text-gray-400">No bills recorded yet.</p>
                        </div>
                        <ul v-else class="divide-y divide-gray-50">
                            <li v-for="h in utilityHistory" :key="h.id" class="py-2.5 flex justify-between items-center text-xs hover:bg-emerald-50/60 transition-all duration-200 px-2 rounded-lg">
                                <span class="text-gray-600 font-medium">{{ h.expense_date }}
                                    <span :class="h.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'" class="ml-1 inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full border">{{ h.status }}</span>
                                </span>
                                <span class="font-bold text-rose-600">{{ money(h.amount) }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        const month = this.currentMonth();
        return {
            month,
            year: Number(month.slice(0, 4)),
            budgetPercent: 30,
            ms: { collected: 0, budgetPool: 0, carryOver: 0, budgetAvailable: 0, budgetUsed: 0, budgetRemaining: 0, overflow: 0, totalSpent: 0, pending: 0, netProfit: 0 },
            expenses: [],
            billComparison: {
                electricity: { current: 0, previous: 0, diff: 0, percentage: 0, isIncrease: true, currentMonth: null, previousMonth: null },
                water: { current: 0, previous: 0, diff: 0, percentage: 0, isIncrease: true, currentMonth: null, previousMonth: null },
                internet: { current: 0, previous: 0, diff: 0, percentage: 0, isIncrease: true, currentMonth: null, previousMonth: null }
            },
            yr: { totals: { collected: 0, budgetPool: 0, budgetUsed: 0, overflow: 0, spent: 0, netProfit: 0 }, months: [] },
            cashOnHand: 0,
            utilities: [{
                    key: 'electricity',
                    label: 'Electricity',
                    title: 'Electricity Bill',
                    name: 'Electricity',
                    search: 'Electric,Meralco,Kuryente',
                    icon: 'fa-solid fa-bolt',
                    card: 'from-amber-50/60 border-amber-200/80 hover:border-amber-400',
                    text: 'text-amber-800',
                    iconBg: 'bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white'
                },
                {
                    key: 'water',
                    label: 'Water',
                    title: 'Water Bill',
                    name: 'Water',
                    search: 'Water,Tubig,Maynilad,Manila Water',
                    icon: 'fa-solid fa-faucet-drip',
                    card: 'from-blue-50/50 border-blue-100/80 hover:border-blue-300',
                    text: 'text-blue-900',
                    iconBg: 'bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white'
                },
                {
                    key: 'internet',
                    label: 'Internet',
                    title: 'Internet Bill',
                    name: 'WiFi',
                    search: 'WiFi,Internet,Converge,PLDT,Globe',
                    icon: 'fa-solid fa-wifi',
                    card: 'from-purple-50/60 border-purple-200/80 hover:border-purple-400',
                    text: 'text-purple-800',
                    iconBg: 'bg-purple-500/10 text-purple-600 group-hover:bg-purple-500 group-hover:text-white'
                }
            ],
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            showModal: false,
            showUtility: false,
            utility: { title: '', name: '', search: '' },
            utilityHistory: [],
            itemSeq: 0,
            billForm: { amount: '', expense_date: '' },
            form: { expense_date: '', description: '', items: [] }
        };
    },
    computed: {
        monthLabel() {
            return this.monthText(this.month);
        },
        budgetUsedPct() {
            return this.ms.budgetAvailable > 0 ? Math.min(100, (this.ms.budgetUsed / this.ms.budgetAvailable) * 100) : 0;
        },
        donutColor() {
            if (this.ms.overflow > 0 || this.budgetUsedPct >= 100) return 'text-rose-500';
            if (this.budgetUsedPct >= 80) return 'text-amber-500';
            return 'text-emerald-500';
        },
        pendingOver() {
            return Math.max(0, this.ms.pending - this.ms.budgetRemaining);
        },
        utilityCards() {
            return this.utilities.map(u => ({...u, b: this.billComparison[u.key] }));
        },
        filledItems() {
            return this.form.items.filter(it => it.sub_category.trim() !== '' && Number(it.qty) > 0 && Number(it.price) > 0);
        },
        formTotal() {
            return this.filledItems.reduce((sum, it) => sum + this.lineTotal(it), 0);
        },
        formOverBudget() {
            return this.formTotal > 0 && (this.form.expense_date || '').startsWith(this.month) && this.formTotal > this.ms.budgetRemaining;
        },
        yearOptions() {
            const now = new Date().getFullYear();
            return [now - 3, now - 2, now - 1, now, now + 1];
        }
    },
    created() { this.load(); },
    methods: {
        // ---------- Helpers ----------
        currentMonth() {
            const d = new Date();
            return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        },
        today() {
            const d = new Date();
            return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        },
        monthText(ym) {
            if (!ym) return '';
            const [y, m] = ym.split('-');
            return this.monthNames[Number(m) - 1] + ' ' + y;
        },
        isSelectedMonth(m) {
            return this.month === this.year + '-' + String(m).padStart(2, '0');
        },
        money(val) {
            return '₱' + Number(val || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        },
        lineTotal(it) {
            const qty = Number(it.qty) || 0;
            const price = Number(it.price) || 0;
            return Math.round(qty * price * 100) / 100;
        },

        // ---------- SweetAlert ----------
        toast(ok, text) {
            if (window.Swal) {
                Swal.fire({ toast: true, position: 'top-end', icon: ok ? 'success' : 'error', title: text, showConfirmButton: false, timer: 3500, timerProgressBar: true });
            } else {
                window.alert(text);
            }
        },
        alertBox(icon, title, text) {
            if (window.Swal) return Swal.fire({ icon, title, text, confirmButtonColor: '#10b981' });
            window.alert(title + (text ? ': ' + text : ''));
        },
        async confirmBox({ icon = 'warning', title, text, confirmText = 'Yes', color = '#10b981' }) {
            if (window.Swal) {
                const r = await Swal.fire({ icon, title, text, showCancelButton: true, confirmButtonText: confirmText, cancelButtonText: 'Cancel', confirmButtonColor: color, cancelButtonColor: '#9ca3af', reverseButtons: true });
                return r.isConfirmed;
            }
            return window.confirm(title + (text ? '\n' + text : ''));
        },

        // ---------- API ----------
        async api(options = {}, query = '') {
            try {
                const res = await fetch('api/expenses_api.php' + query, options);
                return await res.json();
            } catch (e) {
                this.alertBox('error', 'Connection problem', 'Could not reach the server. Please try again.');
                return { success: false };
            }
        },
        post(payload) {
            return this.api({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        },
        async load() {
            const data = await this.api({ cache: 'no-store' }, '?month=' + encodeURIComponent(this.month) + '&year=' + this.year);
            if (!data.success) return;
            this.budgetPercent = Math.round((data.budgetRate || 0.3) * 100);
            // Bawal negative: kapag lampas ang gastos, 0 ang ipapakita (nakikita pa rin ang "Over budget")
            const noNeg = (v) => Math.max(0, Number(v) || 0);
            this.ms = {...data.monthStats, netProfit: noNeg(data.monthStats && data.monthStats.netProfit) };
            this.expenses = data.expenses || [];
            this.billComparison = data.billComparison;
            const yr = data.year || {};
            this.yr = {
                ...yr,
                totals: {...(yr.totals || {}), netProfit: noNeg(yr.totals && yr.totals.netProfit) },
                months: (yr.months || []).map(m => ({...m, netProfit: noNeg(m.netProfit) }))
            };
            this.cashOnHand = noNeg(data.cashOnHand);
        },
        async onMonthChange() {
            if (!this.month) return;
            this.year = Number(this.month.slice(0, 4));
            await this.load();
        },
        goToMonth(m) {
            this.month = this.year + '-' + String(m).padStart(2, '0');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.load();
        },

        // ---------- Add expenses ----------
        focusItem(key) {
            this.$nextTick(() => {
                const el = document.getElementById('item-name-' + key);
                if (el) el.focus();
            });
        },
        newItem() {
            this.itemSeq += 1;
            return { key: this.itemSeq, category: 'Supplies', sub_category: '', qty: 1, price: '' };
        },
        addItem() {
            const it = this.newItem();
            this.form.items.push(it);
            this.focusItem(it.key);
        },
        nextRow(i) {
            if (i >= this.form.items.length - 1) this.addItem();
            else this.focusItem(this.form.items[i + 1].key);
        },
        removeItem(i) { if (this.form.items.length > 1) this.form.items.splice(i, 1); },
        openAddModal() {
            this.form = {
                expense_date: this.month === this.currentMonth() ? this.today() : this.month + '-01',
                description: '',
                items: [this.newItem(), this.newItem(), this.newItem()]
            };
            this.showModal = true;
        },
        async saveExpense() {
            // Fully empty rows are ignored; a row with only a name or only a price is an error
            const incomplete = this.form.items.some(it => (it.sub_category.trim() !== '') !== (Number(it.price) > 0) || (it.sub_category.trim() !== '' && !(Number(it.qty) > 0)));
            if (incomplete) { this.alertBox('warning', 'Incomplete item', 'Each item needs a name, a quantity, and a price.'); return; }
            if (this.filledItems.length === 0) { this.alertBox('warning', 'No items', 'Add at least one item before saving.'); return; }

            const items = this.filledItems.map(it => ({
                category: it.category,
                sub_category: Number(it.qty) > 1 ? it.sub_category.trim() + ' (' + Number(it.qty) + ' x ' + this.money(it.price) + ')' : it.sub_category.trim(),
                amount: this.lineTotal(it)
            }));
            const batchCheck = ExpensesController.validateBatch(this.form.expense_date, this.form.description, items);
            if (!batchCheck.isValid) { this.alertBox('warning', 'Please check your entries', batchCheck.message); return; }

            const result = await this.post({ action: 'add_many', expense_date: this.form.expense_date, description: this.form.description, items });
            if (!result.success) { this.alertBox('error', 'Could not save', result.message || 'Something went wrong.'); return; }

            this.showModal = false;
            this.toast(true, result.message);
            if (this.form.expense_date) this.month = this.form.expense_date.slice(0, 7);
            this.year = Number(this.month.slice(0, 4));
            await this.load();
        },

        // ---------- Approve / delete ----------
        async approveExpense(id) {
            let result = await this.post({ action: 'approve', id });
            if (result.needs_confirmation) {
                const ok = await this.confirmBox({ icon: 'warning', title: 'Over budget', text: result.message, confirmText: 'Approve anyway' });
                if (!ok) return;
                result = await this.post({ action: 'approve', id, confirm_overbudget: true });
            }
            if (result.success) this.toast(true, result.message);
            else if (result.message) this.alertBox('error', 'Could not approve', result.message);
            await this.load();
        },
        async deleteExpense(id) {
            const ok = await this.confirmBox({ icon: 'warning', title: 'Delete this expense?', text: 'This cannot be undone.', confirmText: 'Delete', color: '#e11d48' });
            if (!ok) return;
            const result = await this.post({ action: 'delete', id });
            if (result.success) this.toast(true, result.message);
            else this.alertBox('error', 'Could not delete', result.message || 'Something went wrong.');
            await this.load();
        },

        // ---------- Utility bills ----------
        async openUtilityModal(u) {
            this.utility = { title: u.title, name: u.name, search: u.search };
            this.utilityHistory = [];
            this.billForm = { amount: '', expense_date: this.today() };
            this.showUtility = true;
            await this.loadUtilityHistory();
        },
        async loadUtilityHistory() {
            const data = await this.api({}, '?action=utility_history&sub_category=' + encodeURIComponent(this.utility.search));
            if (data.success) this.utilityHistory = data.history || [];
        },
        async saveBill() {
            if (!(Number(this.billForm.amount) > 0) || !this.billForm.expense_date) {
                this.alertBox('warning', 'Missing details', 'Enter the bill amount and date.');
                return;
            }
            const billCheck = ExpensesController.validateBill(this.utility.name, this.billForm.amount, this.billForm.expense_date);
            if (!billCheck.isValid) { this.alertBox('warning', 'Please check the bill', billCheck.message); return; }

            const result = await this.post({ action: 'add', category: 'Utilities', sub_category: this.utility.name, amount: Number(this.billForm.amount), expense_date: this.billForm.expense_date, description: '' });
            if (!result.success) { this.alertBox('error', 'Could not save', result.message || 'Something went wrong.'); return; }
            this.billForm.amount = '';
            this.toast(true, result.message);
            await this.loadUtilityHistory();
            await this.load();
        }
    }
};