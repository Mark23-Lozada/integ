const Expenses = {
    template: `
        <div class="space-y-6 min-h-full pb-10">
            <!-- Header & Action Button -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 class="text-3xl font-black text-gray-900 tracking-tight">Boarding House Finances & Expenses</h1>
                    <p class="text-sm text-gray-500 font-medium">Subaybayan ang net balance, buwanang kita, utility bills (Meralco, Tubig, WiFi), at supplies.</p>
                </div>
                <button @click="showModal = true" class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#E8736B] hover:bg-[#d4625a] text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                    <i class="fa-solid fa-plus"></i> Magdagdag ng Gastusin (Supplies / Repairs)
                </button>
            </div>
            <hr class="border-gray-100">

            <!-- Summary Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div class="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Net Balance (Pondo)</p>
                        <h3 class="text-2xl font-black text-emerald-600 mt-1">{{ formatCurrency(netBalance) }}</h3>
                    </div>
                    <div class="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl text-lg">
                        <i class="fa-solid fa-wallet"></i>
                    </div>
                </div>

                <div class="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Kabuuang Koleksyon (Finance)</p>
                        <h3 class="text-2xl font-black text-blue-600 mt-1">{{ formatCurrency(totalCollected) }}</h3>
                    </div>
                    <div class="p-3 bg-blue-500/10 text-blue-600 rounded-xl text-lg">
                        <i class="fa-solid fa-peso-sign"></i>
                    </div>
                </div>

                <div class="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Na-approve na Gastusin</p>
                        <h3 class="text-2xl font-black text-rose-500 mt-1">{{ formatCurrency(totalExpenses) }}</h3>
                    </div>
                    <div class="p-3 bg-rose-500/10 text-rose-500 rounded-xl text-lg">
                        <i class="fa-solid fa-file-invoice-dollar"></i>
                    </div>
                </div>
            </div>

            <!-- ========================================== -->
            <!-- BAGONG DASHBOARD: UTILITY BILLS ANALYTICS  -->
            <!-- ========================================== -->
            <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-6">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-700/60 pb-4">
                    <div>
                        <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                            <i class="fa-solid fa-chart-line"></i> Hiwalay na Dashboard ng Bills
                        </div>
                        <h2 class="text-xl font-black tracking-tight">Utility Bills Monthly Percentage & Trend Analysis</h2>
                        <p class="text-xs text-slate-400">Paghahambing ng gastusin ngayon kumpara noong nakaraang buwan para sa Meralco, Tubig, at WiFi.</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <!-- Meralco Analytics Card -->
                    <div @click="openUtilityModal('Meralco (Kuryente)', 'Meralco')" class="bg-slate-800/80 border border-slate-700 hover:border-amber-500/60 p-5 rounded-2xl space-y-4 cursor-pointer transition-all group">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold uppercase text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">Kuryente</span>
                            <i class="fa-solid fa-bolt text-amber-400 text-lg group-hover:scale-110 transition-transform"></i>
                        </div>
                        <div>
                            <p class="text-xs text-slate-400">Ngayong Buwan</p>
                            <h4 class="text-2xl font-black text-white mt-0.5">{{ formatCurrency(billComparison.meralco.current) }}</h4>
                            <p class="text-[11px] text-slate-400 mt-1">Noong Nakaraan: <span class="text-slate-200 font-semibold">{{ formatCurrency(billComparison.meralco.previous) }}</span></p>
                        </div>
                        <div class="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold">
                            <span :class="billComparison.meralco.isIncrease ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'" class="px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                                <i :class="billComparison.meralco.isIncrease ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down'"></i>
                                {{ Math.abs(billComparison.meralco.percentage) }}% {{ billComparison.meralco.isIncrease ? 'Itinaas' : 'Bumaba' }}
                            </span>
                            <span class="text-slate-400 group-hover:text-amber-400">I-manage <i class="fa-solid fa-chevron-right text-[10px]"></i></span>
                        </div>
                    </div>

                    <!-- Tubig Analytics Card -->
                    <div @click="openUtilityModal('Manila Water / Maynilad (Tubig)', 'Tubig')" class="bg-slate-800/80 border border-slate-700 hover:border-blue-500/60 p-5 rounded-2xl space-y-4 cursor-pointer transition-all group">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold uppercase text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg">Tubig</span>
                            <i class="fa-solid fa-faucet-drip text-blue-400 text-lg group-hover:scale-110 transition-transform"></i>
                        </div>
                        <div>
                            <p class="text-xs text-slate-400">Ngayong Buwan</p>
                            <h4 class="text-2xl font-black text-white mt-0.5">{{ formatCurrency(billComparison.water.current) }}</h4>
                            <p class="text-[11px] text-slate-400 mt-1">Noong Nakaraan: <span class="text-slate-200 font-semibold">{{ formatCurrency(billComparison.water.previous) }}</span></p>
                        </div>
                        <div class="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold">
                            <span :class="billComparison.water.isIncrease ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'" class="px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                                <i :class="billComparison.water.isIncrease ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down'"></i>
                                {{ Math.abs(billComparison.water.percentage) }}% {{ billComparison.water.isIncrease ? 'Itinaas' : 'Bumaba' }}
                            </span>
                            <span class="text-slate-400 group-hover:text-blue-400">I-manage <i class="fa-solid fa-chevron-right text-[10px]"></i></span>
                        </div>
                    </div>

                    <!-- WiFi Analytics Card -->
                    <div @click="openUtilityModal('PLDT / Globe / Converge (WiFi / Internet)', 'WiFi')" class="bg-slate-800/80 border border-slate-700 hover:border-purple-500/60 p-5 rounded-2xl space-y-4 cursor-pointer transition-all group">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold uppercase text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg">Internet</span>
                            <i class="fa-solid fa-wifi text-purple-400 text-lg group-hover:scale-110 transition-transform"></i>
                        </div>
                        <div>
                            <p class="text-xs text-slate-400">Ngayong Buwan</p>
                            <h4 class="text-2xl font-black text-white mt-0.5">{{ formatCurrency(billComparison.wifi.current) }}</h4>
                            <p class="text-[11px] text-slate-400 mt-1">Noong Nakaraan: <span class="text-slate-200 font-semibold">{{ formatCurrency(billComparison.wifi.previous) }}</span></p>
                        </div>
                        <div class="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold">
                            <span :class="billComparison.wifi.isIncrease ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'" class="px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                                <i :class="billComparison.wifi.isIncrease ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down'"></i>
                                {{ Math.abs(billComparison.wifi.percentage) }}% {{ billComparison.wifi.isIncrease ? 'Itinaas' : 'Bumaba' }}
                            </span>
                            <span class="text-slate-400 group-hover:text-purple-400">I-manage <i class="fa-solid fa-chevron-right text-[10px]"></i></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Listahan ng Gastusin -->
            <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Listahan ng mga Gastusin (Supplies, Repairs, at Admin)</h3>
                
                <div v-if="!expenses || expenses.length === 0" class="py-8 text-center text-gray-400 text-xs">
                    Wala pang nakatalang gastusin sa ngayon.
                </div>

                <div v-else class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                                <th class="p-3">Petsa</th>
                                <th class="p-3">Kategorya</th>
                                <th class="p-3">Pangalan / Uri</th>
                                <th class="p-3">Halaga</th>
                                <th class="p-3">Status</th>
                                <th class="p-3 text-center">Aksyon</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr v-for="exp in expenses" :key="exp.id">
                                <td class="p-3 text-gray-600">{{ exp.expense_date }}</td>
                                <td class="p-3 font-semibold text-gray-800">{{ exp.category }}</td>
                                <td class="p-3 text-gray-600">
                                    {{ exp.sub_category }}
                                    <div v-if="exp.description" class="text-xs text-gray-400">{{ exp.description }}</div>
                                </td>
                                <td class="p-3 font-bold text-rose-600">{{ formatCurrency(exp.amount) }}</td>
                                <td class="p-3">
                                    <span :class="exp.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'" class="px-2.5 py-1 rounded-full text-xs font-bold">
                                        {{ exp.status }}
                                    </span>
                                </td>
                                <td class="p-3 text-center space-x-1">
                                    <button v-if="exp.status === 'Pending'" @click="approveExpense(exp.id)" class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer" title="Approve">
                                        <i class="fa-solid fa-check"></i>
                                    </button>
                                    <button @click="deleteExpense(exp.id)" class="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer" title="Delete">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- MODAL PARA SA PAGDAGDAG NG GASTUSIN -->
            <div v-if="showModal" class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4">
                    <div class="flex justify-between items-center border-b pb-3">
                        <h3 class="text-lg font-bold text-gray-900">Magdagdag ng Gastusin (Supplies / Repairs)</h3>
                        <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 cursor-pointer">
                            <i class="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>

                    <form @submit.prevent="saveExpense" class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Kategorya</label>
                            <select v-model="form.category" @change="onCategoryChange" class="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-emerald-500">
                                <option value="Supplies">Supplies (Pang-araw-araw na bibilhin)</option>
                                <option value="Repairs">Repairs & Maintenance</option>
                                <option value="Admin/Others">Admin & Permits</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Uri / Pangalan ng Gastusin</label>
                            <select v-model="form.sub_category" class="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-emerald-500">
                                <option v-for="sub in currentSubCategories" :value="sub">{{ sub }}</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Halaga (₱)</label>
                            <input type="number" step="0.01" v-model="form.amount" placeholder="Hal. 1500.00" required class="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-emerald-500">
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Petsa ng Gastusin</label>
                            <input type="date" v-model="form.expense_date" required class="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-emerald-500">
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Deskripsyon (Opsyonal)</label>
                            <textarea v-model="form.description" placeholder="Karagdagang detalye..." rows="2" class="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-emerald-500"></textarea>
                        </div>

                        <div class="flex justify-end gap-3 pt-3 border-t">
                            <button type="button" @click="showModal = false" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl cursor-pointer">Kanselahin</button>
                            <button type="submit" class="px-5 py-2 bg-[#E8736B] hover:bg-[#d4625a] text-white text-sm font-bold rounded-xl shadow-sm cursor-pointer">I-save ang Gastusin</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- MODAL PARA SA UTILITY BILLS -->
            <div v-if="showUtilityModal" class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center border-b pb-3">
                        <div>
                            <h3 class="text-lg font-bold text-gray-900">Pamamahala ng Bill: {{ utilityModalTitle }}</h3>
                            <p class="text-xs text-gray-500">Tignan ang mga nakaraang buwan o magpasok ng bagong bill para sa kasalukuyang buwan.</p>
                        </div>
                        <button @click="showUtilityModal = false" class="text-gray-400 hover:text-gray-600 cursor-pointer">
                            <i class="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>

                    <!-- Form para sa pag-enter ng bagong bill -->
                    <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                        <h4 class="text-xs font-bold uppercase text-gray-700"><i class="fa-solid fa-plus-circle mr-1 text-emerald-600"></i> Mag-enter ng Bagong Bill</h4>
                        <form @submit.prevent="saveUtilityBill" class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1">Halaga (₱)</label>
                                <input type="number" step="0.01" v-model="utilityForm.amount" placeholder="Hal. 2500.00" required class="w-full border border-gray-200 rounded-xl p-2 text-sm bg-white focus:outline-emerald-500">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1">Petsa ng Bill</label>
                                <input type="date" v-model="utilityForm.expense_date" required class="w-full border border-gray-200 rounded-xl p-2 text-sm bg-white focus:outline-emerald-500">
                            </div>
                            <div class="flex items-end">
                                <button type="submit" class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer transition-all">I-save ang Bill</button>
                            </div>
                        </form>
                    </div>

                    <!-- Listahan ng Past Months Bills -->
                    <div>
                        <h4 class="text-xs font-bold uppercase text-gray-700 mb-3"><i class="fa-solid fa-clock-rotate-left mr-1 text-blue-600"></i> Kasaysayan ng mga Nakaraang Buwan</h4>
                        <div v-if="!utilityHistory || utilityHistory.length === 0" class="py-6 text-center text-gray-400 text-xs bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                            Wala pang nakatalang kasaysayan para sa bill na ito.
                        </div>
                        <div v-else class="overflow-x-auto max-h-60 overflow-y-auto border border-gray-100 rounded-xl">
                            <table class="w-full text-left text-sm">
                                <thead class="bg-gray-50 text-xs uppercase text-gray-500 sticky top-0">
                                    <tr>
                                        <th class="p-3">Petsa</th>
                                        <th class="p-3">Halaga</th>
                                        <th class="p-3">Status</th>
                                        <th class="p-3 text-center">Aksyon</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    <tr v-for="item in utilityHistory" :key="item.id">
                                        <td class="p-3 text-gray-600">{{ item.expense_date }}</td>
                                        <td class="p-3 font-bold text-gray-900">{{ formatCurrency(item.amount) }}</td>
                                        <td class="p-3">
                                            <span :class="item.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'" class="px-2 py-0.5 rounded-full text-[11px] font-bold">
                                                {{ item.status }}
                                            </span>
                                        </td>
                                        <td class="p-3 text-center space-x-1">
                                            <button v-if="item.status === 'Pending'" @click="approveExpense(item.id); openUtilityModal(utilityModalTitle, utilityModalKey)" class="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg cursor-pointer" title="Approve">
                                                <i class="fa-solid fa-check"></i>
                                            </button>
                                            <button @click="deleteExpense(item.id, true)" class="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg cursor-pointer" title="Delete">
                                                <i class="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="flex justify-end pt-3 border-t">
                        <button type="button" @click="showUtilityModal = false" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl cursor-pointer">Isara</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            loading: false,
            totalCollected: 0,
            totalExpenses: 0,
            netBalance: 0,
            expenses: [],
            billComparison: {
                meralco: { current: 0, previous: 0, percentage: 0, isIncrease: false },
                water: { current: 0, previous: 0, percentage: 0, isIncrease: false },
                wifi: { current: 0, percentage: 0, isIncrease: false }
            },
            showModal: false,
            showUtilityModal: false,
            utilityModalTitle: '',
            utilityModalKey: '',
            utilityHistory: [],
            form: {
                category: 'Supplies',
                sub_category: 'Sabon / Pamahid sa Sahig',
                amount: '',
                expense_date: new Date().toISOString().split('T')[0],
                description: ''
            },
            utilityForm: {
                amount: '',
                expense_date: new Date().toISOString().split('T')[0]
            },
            subCategoryOptions: {
                'Supplies': [
                    'Sabon / Pamahid sa Sahig',
                    'Tissue / Pamalit na Ilaw',
                    'Basurahan at Cleaning Tools'
                ],
                'Repairs': [
                    'Ayos ng tubo / Gripo',
                    'Ayos ng kuryente / Saksakan',
                    'Pintura / Sira ng Pintuan'
                ],
                'Admin/Others': [
                    'Permiso / LGU / Business Permit',
                    'Iba pang bayarin'
                ]
            }
        };
    },
    computed: {
        currentSubCategories() {
            return this.subCategoryOptions[this.form.category] || [];
        }
    },
    created() {
        this.fetchExpenses();
    },
    methods: {
        async fetchExpenses() {
            try {
                const response = await fetch('api/expenses_api.php');
                const text = await response.text();

                let result;
                try {
                    result = JSON.parse(text);
                } catch (e) {
                    console.error("Server Response (Not JSON):", text);
                    return;
                }

                if (result.success) {
                    this.totalCollected = result.totalCollected !== undefined ? result.totalCollected : 0;
                    this.totalExpenses = result.totalExpenses !== undefined ? result.totalExpenses : 0;
                    this.netBalance = result.netBalance !== undefined ? result.netBalance : 0;
                    this.expenses = result.expenses || [];
                    if (result.billComparison) {
                        this.billComparison = result.billComparison;
                    }
                }
            } catch (error) {
                console.error("Error fetching expenses:", error);
            }
        },
        onCategoryChange() {
            const subs = this.subCategoryOptions[this.form.category];
            if (subs && subs.length > 0) {
                this.form.sub_category = subs[0];
            }
        },
        async saveExpense() {
            if (!this.form.amount || this.form.amount <= 0) {
                Swal.fire({ icon: 'warning', title: 'Invalid na Halaga', text: 'Mangyaring maglagay ng wastong halaga.' });
                return;
            }

            try {
                const response = await fetch('api/expenses_api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.form)
                });
                const result = await response.json();

                Swal.fire({
                    icon: result.success ? 'success' : 'error',
                    title: result.success ? 'Tagumpay!' : 'Paalala',
                    text: result.message,
                    timer: 2000,
                    showConfirmButton: false
                });

                if (result.success) {
                    this.showModal = false;
                    this.form.amount = '';
                    this.form.description = '';
                    this.fetchExpenses();
                }
            } catch (error) {
                console.error("Error saving expense:", error);
            }
        },
        async openUtilityModal(title, key) {
            this.utilityModalTitle = title;
            this.utilityModalKey = key;
            this.utilityForm.amount = '';
            this.utilityForm.expense_date = new Date().toISOString().split('T')[0];

            try {
                const response = await fetch(`api/expenses_api.php?action=utility_history&sub_category=${encodeURIComponent(key)}`);
                const result = await response.json();
                if (result.success) {
                    this.utilityHistory = result.history || [];
                }
            } catch (error) {
                console.error("Error fetching utility history:", error);
                this.utilityHistory = [];
            }

            this.showUtilityModal = true;
        },
        async saveUtilityBill() {
            if (!this.utilityForm.amount || this.utilityForm.amount <= 0) {
                Swal.fire({ icon: 'warning', title: 'Invalid na Halaga', text: 'Mangyaring maglagay ng wastong halaga ng bill.' });
                return;
            }

            const payload = {
                category: 'Utilities',
                sub_category: this.utilityModalTitle,
                amount: this.utilityForm.amount,
                expense_date: this.utilityForm.expense_date,
                description: 'Buwanang Utility Bill (PH)'
            };

            try {
                const response = await fetch('api/expenses_api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();

                Swal.fire({
                    icon: result.success ? 'success' : 'error',
                    title: result.success ? 'Tagumpay!' : 'Paalala',
                    text: result.message,
                    timer: 2000,
                    showConfirmButton: false
                });

                if (result.success) {
                    this.utilityForm.amount = '';
                    this.fetchExpenses();
                    this.openUtilityModal(this.utilityModalTitle, this.utilityModalKey);
                }
            } catch (error) {
                console.error("Error saving utility bill:", error);
            }
        },
        async approveExpense(id) {
            const confirmResult = await Swal.fire({
                title: 'Sigurado ka ba?',
                text: "Ito ay awtomatikong magbabawas sa pondo ng Boarding House.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#10B981',
                cancelButtonColor: '#EF4444',
                confirmButtonText: 'Oo, i-approve!',
                cancelButtonText: 'Kanselahin'
            });

            if (!confirmResult.isConfirmed) return;

            try {
                const response = await fetch('api/expenses_api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'approve', id: id })
                });
                const result = await response.json();

                Swal.fire({
                    icon: result.success ? 'success' : 'error',
                    title: result.success ? 'Tagumpay!' : 'Hindi Matuloy',
                    text: result.message
                });

                if (result.success) {
                    this.fetchExpenses();
                    if (this.showUtilityModal) {
                        this.openUtilityModal(this.utilityModalTitle, this.utilityModalKey);
                    }
                }
            } catch (error) {
                console.error("Error approving expense:", error);
            }
        },
        async deleteExpense(id, isUtility = false) {
            const confirmResult = await Swal.fire({
                title: 'Burahin ang gastusin na ito?',
                text: "Hindi na ito maibabalik kapag na-delete.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#EF4444',
                cancelButtonColor: '#6B7280',
                confirmButtonText: 'Oo, burahin!',
                cancelButtonText: 'Kanselahin'
            });

            if (!confirmResult.isConfirmed) return;

            try {
                const response = await fetch('api/expenses_api.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'delete', id: id })
                });
                const result = await response.json();

                Swal.fire({
                    icon: result.success ? 'success' : 'error',
                    title: result.success ? 'Nabura na!' : 'Hindi Matuloy',
                    text: result.message,
                    timer: 2000,
                    showConfirmButton: false
                });

                if (result.success) {
                    this.fetchExpenses();
                    if (isUtility && this.showUtilityModal) {
                        this.openUtilityModal(this.utilityModalTitle, this.utilityModalKey);
                    }
                }
            } catch (error) {
                console.error("Error deleting expense:", error);
            }
        },
        formatCurrency(val) {
            return '₱' + Number(val || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    }git 
};