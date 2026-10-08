// Tenant > Building Management > Damage Report: send a report to the landlord and follow its status.
const TenantDamage = {
    template: `
        <div class="space-y-6 min-h-full pb-10 transition-all duration-500 ease-out">
            <div class="flex flex-col gap-1" data-aos="fade-right">
                <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Damage Report</h1>
                <p class="text-sm text-gray-500 font-medium">Something broken in your unit? Tell your landlord and follow the repair here.</p>
            </div>
            <hr class="border-gray-100">

            <div class="grid grid-cols-1 xl:grid-cols-5 gap-6">
                <!-- New report -->
                <form @submit.prevent="submit" class="xl:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4 h-fit" data-aos="fade-up">
                    <h2 class="text-sm font-bold text-gray-900"><i class="fa-solid fa-screwdriver-wrench text-emerald-600 mr-2"></i> New report</h2>
                    <div>
                        <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Title</label>
                        <input type="text" v-model="form.title" maxlength="150" placeholder="e.g. Leaking faucet in the kitchen" class="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400">
                    </div>
                    <div>
                        <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">What happened?</label>
                        <textarea v-model="form.description" rows="4" maxlength="1000" placeholder="Describe the damage and where it is" class="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"></textarea>
                        <p class="text-[10px] text-gray-400 text-right">{{ form.description.length }} / 1000</p>
                    </div>
                    <div>
                        <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Photo (optional, JPG / PNG / WEBP, max 3 MB)</label>
                        <input type="file" ref="photo" accept="image/jpeg,image/png,image/webp" @change="onFile" class="block w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-semibold hover:file:bg-emerald-100 cursor-pointer">
                        <p v-if="fileName" class="text-[11px] text-gray-500 mt-1">{{ fileName }}</p>
                    </div>
                    <button type="submit" :disabled="sending" class="w-full px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ sending ? 'Sending...' : 'Send report' }}
                    </button>
                </form>

                <!-- My reports -->
                <div class="xl:col-span-3 space-y-4" data-aos="fade-up" data-aos-delay="100">
                    <div v-if="loading" class="text-sm text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i> Loading...</div>
                    <div v-else-if="reports.length === 0" class="bg-white border border-gray-100 rounded-2xl p-10 text-center text-sm text-gray-400 shadow-sm">
                        <i class="fa-solid fa-clipboard-check text-3xl text-gray-300 mb-2 block"></i> You have not sent any reports yet.
                    </div>
                    <div v-for="r in reports" :key="r.id" class="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-3">
                        <div class="flex items-start justify-between gap-3">
                            <div class="min-w-0">
                                <h3 class="text-sm font-bold text-gray-900 break-words">{{ r.title }}</h3>
                                <p class="text-[11px] text-gray-400 mt-0.5">{{ r.created_at }} <span v-if="r.unit_name">&middot; {{ r.unit_name }}</span></p>
                            </div>
                            <span :class="statusClass(r.status)" class="px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0">{{ r.status }}</span>
                        </div>
                        <p class="text-xs text-gray-600 leading-relaxed whitespace-pre-line break-words">{{ r.description }}</p>
                        <a v-if="Number(r.has_photo)" :href="photoUrl(r)" target="_blank" rel="noopener">
                            <img :src="photoUrl(r)" alt="Damage photo" class="h-32 rounded-xl border border-gray-200 object-cover hover:opacity-90 transition-opacity">
                        </a>
                        <div v-if="r.landlord_note" class="bg-emerald-50/60 border border-emerald-100 rounded-xl px-4 py-3">
                            <p class="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Landlord's note</p>
                            <p class="text-xs text-gray-700 mt-0.5 whitespace-pre-line break-words">{{ r.landlord_note }}</p>
                        </div>
                        <p v-if="r.resolved_at" class="text-[11px] text-emerald-600 font-semibold"><i class="fa-solid fa-circle-check mr-1"></i> Resolved on {{ r.resolved_at }}</p>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return { reports: [], loading: true, sending: false, form: { title: '', description: '' }, file: null, fileName: '', timer: null };
    },
    methods: {
        photoUrl(r) { return 'api/damage_photo.php?id=' + r.id; },
        statusClass(s) {
            return { 'Pending': 'bg-amber-100 text-amber-700', 'In Progress': 'bg-blue-100 text-blue-700', 'Resolved': 'bg-emerald-100 text-emerald-700' }[s] || 'bg-gray-100 text-gray-600';
        },
        onFile(e) {
            const f = e.target.files[0];
            this.file = null; this.fileName = '';
            if (!f) return;
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
                Swal.fire('Photo', 'Only JPG, PNG or WEBP photos are allowed.', 'warning'); e.target.value = ''; return;
            }
            if (f.size > 3 * 1024 * 1024) {
                Swal.fire('Photo', 'The photo is too large (maximum 3 MB).', 'warning'); e.target.value = ''; return;
            }
            this.file = f; this.fileName = f.name;
        },
        async load() {
            try {
                const res = await axios.get('api/tenant_damage.php');
                if (res.data && res.data.success) this.reports = res.data.reports;
            } catch (e) { console.error('Error loading reports', e); }
            this.loading = false;
        },
        async submit() {
            const title = this.form.title.trim(), description = this.form.description.trim();
            if (title.length < 3) { Swal.fire('Title needed', 'Please enter a short title (at least 3 characters).', 'warning'); return; }
            if (description.length < 5) { Swal.fire('Description needed', 'Please describe the damage (at least 5 characters).', 'warning'); return; }

            this.sending = true;
            try {
                const fd = new FormData();
                fd.append('title', title);
                fd.append('description', description);
                if (this.file) fd.append('photo', this.file);
                const res = await axios.post('api/tenant_damage.php', fd);
                if (res.data && res.data.success) {
                    Swal.fire({ icon: 'success', title: 'Report sent', text: res.data.message, timer: 1800, showConfirmButton: false });
                    this.form = { title: '', description: '' };
                    this.file = null; this.fileName = '';
                    if (this.$refs.photo) this.$refs.photo.value = '';
                    await this.load();
                } else {
                    Swal.fire('Could not send', (res.data && res.data.message) || 'Something went wrong.', 'error');
                }
            } catch (e) {
                Swal.fire('Could not send', (e.response && e.response.data && e.response.data.message) || 'Could not reach the server.', 'error');
            }
            this.sending = false;
        }
    },
    mounted() {
        this.load();
        this.timer = setInterval(this.load, 30000); // passive refresh: status changes appear by themselves
    },
    beforeUnmount() { if (this.timer) clearInterval(this.timer); }
};
