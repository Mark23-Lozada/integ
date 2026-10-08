// ---------- Shared conversation component (used by the landlord AND the tenant chat) ----------
const ChatThread = {
    props: { messages: { type: Array, default: () => [] }, me: String, title: String, subtitle: String, disabled: Boolean },
    emits: ['send'],
    template: `
        <div class="flex flex-col h-full min-h-0">
            <div class="px-5 py-3 border-b border-gray-100 bg-white shrink-0">
                <p class="text-sm font-bold text-gray-900 truncate">{{ title }}</p>
                <p v-if="subtitle" class="text-[11px] text-gray-500 truncate">{{ subtitle }}</p>
            </div>
            <div ref="box" class="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-2 bg-gray-50/60 custom-scrollbar">
                <p v-if="messages.length === 0" class="text-center text-xs text-gray-400 font-medium pt-10">
                    <i class="fa-regular fa-comments text-3xl text-gray-300 mb-2 block"></i> No messages yet. Say hello!
                </p>
                <div v-for="m in messages" :key="m.id" :class="m.sender_role === me ? 'flex justify-end' : 'flex justify-start'">
                    <div :class="m.sender_role === me ? 'bg-emerald-500 text-white rounded-2xl rounded-br-md' : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-md shadow-sm'" class="max-w-[78%] px-4 py-2.5">
                        <p class="text-xs whitespace-pre-wrap break-words leading-relaxed">{{ m.body }}</p>
                        <p :class="m.sender_role === me ? 'text-white/70' : 'text-gray-400'" class="text-[10px] mt-1 text-right">{{ stamp(m.created_at) }}</p>
                    </div>
                </div>
            </div>
            <form @submit.prevent="send" class="p-3 border-t border-gray-100 bg-white flex items-end gap-2 shrink-0">
                <textarea v-model="text" rows="1" maxlength="1000" :disabled="disabled" @keydown.enter.exact.prevent="send" placeholder="Type a message... (Enter to send)" class="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 resize-none max-h-28"></textarea>
                <button type="submit" :disabled="disabled || !text.trim()" class="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"><i class="fa-solid fa-paper-plane"></i></button>
            </form>
        </div>
    `,
    data() { return { text: '' }; },
    watch: {
        'messages.length'() { this.$nextTick(this.scrollBottom); },
        title() { this.text = ''; this.$nextTick(this.scrollBottom); }
    },
    methods: {
        stamp(s) { return (s || '').slice(5, 16).replace('-', '/'); }, // "10/06 14:32"
        scrollBottom() { const b = this.$refs.box; if (b) b.scrollTop = b.scrollHeight; },
        send() {
            const t = this.text.trim();
            if (!t) return;
            this.$emit('send', t);
            this.text = '';
        }
    },
    mounted() { this.scrollBottom(); }
};

// ---------- Landlord > Dashboard > Chat ----------
const LandlordChat = {
    components: { ChatThread },
    template: `
        <div class="space-y-6 min-h-full pb-6 transition-all duration-500 ease-out">
            <div class="flex flex-col gap-1" data-aos="fade-right">
                <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Chat</h1>
                <p class="text-sm text-gray-500 font-medium">Talk to your tenants. Only tenants with a portal login appear here.</p>
            </div>

            <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex" style="height: calc(100vh - 17rem); min-height: 420px;" data-aos="fade-up">
                <!-- Threads -->
                <div class="w-72 shrink-0 border-r border-gray-100 flex flex-col min-h-0">
                    <div class="p-3 border-b border-gray-100">
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400"><i class="fas fa-search text-xs"></i></span>
                            <input type="text" v-model="search" placeholder="Search tenant..." class="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-gray-50/50">
                        </div>
                    </div>
                    <div class="flex-1 overflow-y-auto custom-scrollbar">
                        <p v-if="!loadedThreads" class="p-4 text-xs text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i> Loading...</p>
                        <p v-else-if="filteredThreads.length === 0" class="p-6 text-center text-xs text-gray-400 font-medium">No tenants with a portal login yet.<br>Use "Create Login" on the Tenants page.</p>
                        <button v-for="t in filteredThreads" :key="t.tenant_id" @click="select(t.tenant_id)" :class="activeId === t.tenant_id ? 'bg-emerald-50' : 'hover:bg-gray-50'" class="w-full text-left px-4 py-3 border-b border-gray-50 transition-colors cursor-pointer">
                            <div class="flex items-center justify-between gap-2">
                                <p class="text-xs font-bold text-gray-900 truncate">{{ t.fullname }}</p>
                                <span v-if="t.unread > 0" class="min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{{ t.unread }}</span>
                            </div>
                            <p class="text-[10px] text-emerald-600 font-bold">{{ t.unit_name || 'Unassigned' }}</p>
                            <p class="text-[11px] text-gray-500 truncate mt-0.5">{{ t.last_body ? (t.last_sender === 'landlord' ? 'You: ' : '') + t.last_body : 'No messages yet' }}</p>
                        </button>
                    </div>
                </div>

                <!-- Conversation -->
                <div class="flex-1 min-w-0 min-h-0">
                    <chat-thread v-if="active" :messages="messages" me="landlord" :title="active.fullname" :subtitle="active.unit_name || 'Unassigned'" :disabled="sending" @send="send"></chat-thread>
                    <div v-else class="h-full flex flex-col items-center justify-center text-center text-sm text-gray-400 font-medium">
                        <i class="fa-regular fa-comments text-4xl text-gray-300 mb-2"></i> Select a tenant to start chatting.
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return { threads: [], loadedThreads: false, search: '', activeId: null, messages: [], lastId: 0, sending: false, threadsTimer: null, msgTimer: null };
    },
    computed: {
        active() { return this.threads.find(t => t.tenant_id === this.activeId) || null; },
        filteredThreads() {
            const q = this.search.trim().toLowerCase();
            return q ? this.threads.filter(t => (t.fullname || '').toLowerCase().includes(q) || (t.unit_name || '').toLowerCase().includes(q)) : this.threads;
        }
    },
    methods: {
        refreshCounts() { window.dispatchEvent(new Event('pp-refresh-counts')); }, // menu badge
        async loadThreads() {
            try {
                const res = await axios.get('api/chat.php', { params: { action: 'threads' } });
                if (res.data && res.data.success) this.threads = res.data.threads;
            } catch (e) { /* the guard handles 401 */ }
            this.loadedThreads = true;
        },
        async select(id) {
            this.activeId = id; this.messages = []; this.lastId = 0;
            await this.loadMessages();
        },
        async loadMessages() {
            const id = this.activeId;
            if (!id) return;
            try {
                const res = await axios.get('api/chat.php', { params: { tenant_id: id, after_id: this.lastId } });
                if (id !== this.activeId) return; // the landlord switched conversation meanwhile
                if (res.data && res.data.success && res.data.messages.length) {
                    this.messages = this.messages.concat(res.data.messages);
                    this.lastId = this.messages[this.messages.length - 1].id;
                    this.loadThreads(); this.refreshCounts();
                }
            } catch (e) { /* ignore */ }
        },
        async send(text) {
            if (!this.activeId) return;
            this.sending = true;
            try {
                const res = await axios.post('api/chat.php', { tenant_id: this.activeId, body: text });
                if (res.data && res.data.success) { await this.loadMessages(); }
                else Swal.fire('Could not send', (res.data && res.data.message) || 'Something went wrong.', 'error');
            } catch (e) {
                Swal.fire('Could not send', 'Could not reach the server.', 'error');
            }
            this.sending = false;
        }
    },
    mounted() {
        this.loadThreads();
        // Passive polling (X-Passive GET): new messages appear by themselves, the session still times out when idle
        this.threadsTimer = setInterval(this.loadThreads, 8000);
        this.msgTimer = setInterval(this.loadMessages, 4000);
    },
    beforeUnmount() {
        clearInterval(this.threadsTimer); clearInterval(this.msgTimer);
        this.refreshCounts();
    }
};
