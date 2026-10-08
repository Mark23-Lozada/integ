// Tenant > Dashboard > Chat: the conversation with the landlord.
const TenantChat = {
    components: { ChatThread },
    template: `
        <div class="space-y-6 min-h-full pb-6 transition-all duration-500 ease-out">
            <div class="flex flex-col gap-1" data-aos="fade-right">
                <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Chat</h1>
                <p class="text-sm text-gray-500 font-medium">Send a message to your landlord.</p>
            </div>
            <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden" style="height: calc(100vh - 17rem); min-height: 420px;" data-aos="fade-up">
                <chat-thread :messages="messages" me="tenant" title="Landlord" subtitle="Replies appear here automatically" :disabled="sending" @send="send"></chat-thread>
            </div>
        </div>
    `,
    data() { return { messages: [], lastId: 0, sending: false, timer: null }; },
    methods: {
        refreshCounts() { window.dispatchEvent(new Event('pp-refresh-counts')); }, // menu badge
        async load() {
            try {
                const res = await axios.get('api/tenant_chat.php', { params: { after_id: this.lastId } });
                if (res.data && res.data.success && res.data.messages.length) {
                    this.messages = this.messages.concat(res.data.messages);
                    this.lastId = this.messages[this.messages.length - 1].id;
                    this.refreshCounts();
                }
            } catch (e) { /* the guard handles 401 */ }
        },
        async send(text) {
            this.sending = true;
            try {
                const res = await axios.post('api/tenant_chat.php', { body: text });
                if (res.data && res.data.success) { await this.load(); }
                else Swal.fire('Could not send', (res.data && res.data.message) || 'Something went wrong.', 'error');
            } catch (e) {
                Swal.fire('Could not send', (e.response && e.response.data && e.response.data.message) || 'Could not reach the server.', 'error');
            }
            this.sending = false;
        }
    },
    mounted() {
        this.load();
        this.timer = setInterval(this.load, 4000); // passive polling
    },
    beforeUnmount() { clearInterval(this.timer); this.refreshCounts(); }
};
