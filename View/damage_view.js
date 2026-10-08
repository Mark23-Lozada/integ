// Landlord > Building Management > Damage Report: review tenant reports, update the status,
// and record the repair cost as a "Repairs" expense linked to the report.
const DamageReports = {
    template: `
        <div class="space-y-6 min-h-full pb-10 transition-all duration-500 ease-out">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4" data-aos="fade-right">
                <div>
                    <h1 class="text-3xl font-black text-gray-900 tracking-tight">Damage Reports</h1>
                    <p class="text-sm text-gray-500 font-medium">Reports sent by tenants. Update the status and record what the repair cost.</p>
                </div>
                <button @click="load" class="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all cursor-pointer">
                    <i class="fas fa-sync-alt" :class="{'fa-spin': loading}"></i> Refresh
                </button>
            </div>
            <hr class="border-gray-100">

            <div class="grid grid-cols-2 xl:grid-cols-4 gap-5">
                <div class="bg-white border border-amber-200/80 p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-aos="fade-up" data-aos-delay="0">
                    <p class="text-xs font-semibold text-amber-800 uppercase tracking-wider">Pending</p>
                    <h3 class="text-2xl font-black text-gray-900 mt-1">{{ counts['Pending'] }}</h3>
                </div>
                <div class="bg-white border border-blue-100 p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-aos="fade-up" data-aos-delay="100">
                    <p class="text-xs font-semibold text-blue-800 uppercase tracking-wider">In Progress</p>
                    <h3 class="text-2xl font-black text-gray-900 mt-1">{{ counts['In Progress'] }}</h3>
                </div>
                <div class="bg-white border border-emerald-100 p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-aos="fade-up" data-aos-delay="200">
                    <p class="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Resolved</p>
                    <h3 class="text-2xl font-black text-gray-900 mt-1">{{ counts['Resolved'] }}</h3>
                </div>
                <div class="bg-white border border-rose-100 p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-aos="fade-up" data-aos-delay="300">
                    <p class="text-xs font-semibold text-rose-800 uppercase tracking-wider">Repair Costs Recorded</p>
                    <h3 class="text-2xl font-black text-gray-900 mt-1">{{ money(repairCost) }}</h3>
                </div>
            </div>

            <div class="bg-gray-100/80 border border-gray-200/60 p-1 rounded-xl inline-flex items-center gap-1 shadow-inner">
                <button v-for="t in tabs" :key="t" @click="tab = t" :class="tab === t ? 'bg-emerald-500 text-white font-bold shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'" class="px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer">{{ t }}</button>
            </div>

            <div v-if="loading && !loaded" class="text-sm text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i> Loading...</div>
            <div v-else-if="filtered.length === 0" class="bg-white border border-gray-100 rounded-2xl p-10 text-center text-sm text-gray-400 shadow-sm">
                <i class="fa-solid fa-clipboard-check text-3xl text-gray-300 mb-2 block"></i> No reports here.
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <div v-for="r in filtered" :key="r.id" class="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-3">
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <h3 class="text-sm font-bold text-gray-900 break-words">{{ r.title }}</h3>
                            <p class="text-[11px] text-gray-500 mt-0.5">
                                <b class="text-gray-700">{{ r.tenant_name || 'Former tenant' }}</b>
                                <span v-if="r.unit_name"> &middot; <span class="text-emerald-600 font-bold">{{ r.unit_name }}</span></span>
                                &middot; {{ r.created_at }}
                            </p>
                        </div>
                        <span :class="statusClass(r.status)" class="px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0">{{ r.status }}</span>
                    </div>

                    <p class="text-xs text-gray-600 leading-relaxed whitespace-pre-line break-words">{{ r.description }}</p>
                    <a v-if="Number(r.has_photo)" :href="photoUrl(r)" target="_blank" rel="noopener">
                        <img :src="photoUrl(r)" alt="Damage photo" class="h-32 rounded-xl border border-gray-200 object-cover hover:opacity-90 transition-opacity">
                    </a>

                    <div class="bg-gray-50/80 border border-gray-100 rounded-xl p-3 space-y-2">
                        <div class="flex flex-col sm:flex-row gap-2">
                            <select v-model="edits[r.id].status" class="sm:w-40 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500 cursor-pointer bg-white">
                                <option>Pending</option><option>In Progress</option><option>Resolved</option>
                            </select>
                            <input type="text" v-model="edits[r.id].note" maxlength="1000" placeholder="Note for the tenant (optional)" class="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500 bg-white">
                        </div>
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-[11px] text-gray-500">Repair cost recorded: <b class="text-gray-800">{{ money(r.expense_total) }}</b></span>
                            <div class="flex items-center gap-2">
                                <button @click="openExpense(r)" class="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"><i class="fa-solid fa-peso-sign mr-1"></i> Record repair cost</button>
                                <button @click="save(r)" :disabled="!changed(r)" class="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal: record the repair cost as an expense -->
            <div v-if="expense.open" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-gray-100 space-y-4">
                    <div class="pb-3 border-b border-gray-100">
                        <h3 class="text-lg font-extrabold text-gray-900 tracking-tight">Record repair cost</h3>
                        <p class="text-xs text-gray-500 mt-0.5">Saved as a pending "Repairs" expense linked to this report. Approve it on the Expenses page.</p>
                    </div>
                    <form @submit.prevent="saveExpense" class="space-y-3">
                        <div>
                            <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Title</label>
                            <input type="text" v-model="expense.title" maxlength="150" class="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Amount (₱)</label>
                                <input type="number" step="0.01" min="0" v-model="expense.amount" placeholder="0.00" class="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400">
                            </div>
                            <div>
                                <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Date</label>
                                <input type="date" v-model="expense.date" class="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400">
                            </div>
                        </div>
                        <div>
                            <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                            <textarea v-model="expense.description" rows="3" maxlength="255" class="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"></textarea>
                        </div>
                        <div class="flex justify-end gap-3 pt-3 border-t border-gray-100">
                            <button type="button" @click="expense.open = false" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer">Cancel</button>
                            <button type="submit" class="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md cursor-pointer">Save expense</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            reports: [], counts: { 'Pending': 0, 'In Progress': 0, 'Resolved': 0 }, repairCost: 0,
            edits: {}, tab: 'All', tabs: ['All', 'Pending', 'In Progress', 'Resolved'],
            loading: false, loaded: false, timer: null,
            expense: { open: false, report: null, title: '', amount: '', date: '', description: '' }
        };
    },
    computed: {
        filtered() { return this.tab === 'All' ? this.reports : this.reports.filter(r => r.status === this.tab); }
    },
    methods: {
        money(v) { return '₱' + Number(v || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
        photoUrl(r) { return 'api/damage_photo.php?id=' + r.id; },
        statusClass(s) {
            return { 'Pending': 'bg-amber-100 text-amber-700', 'In Progress': 'bg-blue-100 text-blue-700', 'Resolved': 'bg-emerald-100 text-emerald-700' }[s] || 'bg-gray-100 text-gray-600';
        },
        today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
        changed(r) { const e = this.edits[r.id]; return e && (e.status !== r.status || (e.note || '') !== (r.landlord_note || '')); },
        async load() {
            this.loading = true;
            try {
                const res = await axios.get('api/damage_reports.php');
                if (res.data && res.data.success) {
                    this.reports = res.data.reports;
                    this.counts = res.data.counts;
                    this.repairCost = res.data.repair_cost;
                    // A card the landlord has already started editing keeps its unsaved changes
                    const next = {};
                    res.data.reports.forEach(r => {
                        const old = this.edits[r.id];
                        const dirty = old && (old.status !== old.serverStatus || old.note !== old.serverNote);
                        next[r.id] = dirty
                            ? Object.assign(old, { serverStatus: r.status, serverNote: r.landlord_note || '' })
                            : { status: r.status, note: r.landlord_note || '', serverStatus: r.status, serverNote: r.landlord_note || '' };
                    });
                    this.edits = next;
                }
            } catch (e) { console.error('Error loading damage reports', e); }
            this.loading = false; this.loaded = true;
        },
        async save(r) {
            const e = this.edits[r.id];
            const res = await axios.post('api/damage_reports.php', { id: r.id, status: e.status, landlord_note: e.note });
            if (res.data && res.data.success) {
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: res.data.message, showConfirmButton: false, timer: 2000 });
                await this.load();
            } else {
                Swal.fire('Could not update', (res.data && res.data.message) || 'Something went wrong.', 'error');
            }
        },
        openExpense(r) {
            this.expense = { open: true, report: r, title: 'Repair: ' + r.title, amount: '', date: this.today(), description: (r.description || '').slice(0, 255) };
        },
        async saveExpense() {
            const x = this.expense;
            if (!x.title.trim() || !(Number(x.amount) > 0) || !x.date) {
                Swal.fire('Missing details', 'Enter a title, an amount and a date.', 'warning'); return;
            }
            const res = await axios.post('api/expenses_api.php', {
                action: 'add', category: 'Repairs', title: x.title.trim(), description: x.description.trim(),
                amount: Number(x.amount), expense_date: x.date, unit_id: x.report.unit_id || null, damage_report_id: x.report.id
            });
            if (res.data && res.data.success) {
                this.expense.open = false;
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: res.data.message, showConfirmButton: false, timer: 2500 });
                await this.load();
            } else {
                Swal.fire('Could not save', (res.data && res.data.message) || 'Something went wrong.', 'error');
            }
        }
    },
    mounted() {
        this.load();
        this.timer = setInterval(this.load, 20000); // passive refresh
    },
    beforeUnmount() { if (this.timer) clearInterval(this.timer); }
};
