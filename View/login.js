const LoginView = {
    template: `
        <div class="flex items-center justify-center min-h-screen w-screen bg-[#0b0e11] font-sans px-4">
            <div class="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div class="relative w-full max-w-md bg-[#121619] border border-[#1e252b] p-8 rounded-2xl shadow-2xl z-10">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-extrabold tracking-wider text-white">
                        Pocket<span class="text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.7)]">Pads</span>
                    </h1>
                    <p class="text-sm text-gray-400 mt-2">Sign in to your account</p>
                </div>

                <form @submit.prevent="handleLogin" class="space-y-4">
                    <div>
                        <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Gmail Address</label>
                        <input type="email" v-model="username" placeholder="example@gmail.com" required
                            class="w-full px-4 py-3 bg-[#0b0e11] border border-[#1e252b] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400">
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Password</label>
                        <input type="password" v-model="password" placeholder="••••••••" required
                            class="w-full px-4 py-3 bg-[#0b0e11] border border-[#1e252b] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400">
                    </div>

                    <button type="submit" 
                        class="w-full mt-2 py-3.5 px-4 rounded-xl bg-cyan-400 text-white font-bold tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-cyan-500 cursor-pointer transition-all">
                        Sign In
                    </button>
                </form>

                <div class="text-center mt-6 text-xs text-gray-400">
                    <p>Don't have an account? <router-link to="/register" class="text-cyan-400 font-semibold hover:underline ml-1">Register</router-link></p>
                </div>
            </div>
        </div>
    `,
    data() {
        return { username: '', password: '' }
    },
    methods: {
        async handleLogin() {
            try {
                const response = await axios.post('api/Login.php', {
                    gmail: this.username,
                    password: this.password
                });

                if (response.data.status === 'success') {
                    localStorage.setItem('adminName', response.data.names);
                    localStorage.setItem('isAuthenticated', 'true');

                    Swal.fire({
                        icon: 'success',
                        title: 'Login Successful!',
                        text: response.data.message,
                        background: '#121619',
                        color: '#fff',
                        confirmButtonColor: '#22d3ee',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        this.$router.push('/dashboard');
                    });
                } else {
                    Swal.fire({ icon: 'error', title: 'Login Failed', text: response.data.message, background: '#121619', color: '#fff', confirmButtonColor: '#22d3ee' });
                }
            } catch (error) {
                console.error(error);
                Swal.fire({ icon: 'error', title: 'Server Error', text: 'Something went wrong.', background: '#121619', color: '#fff', confirmButtonColor: '#22d3ee' });
            }
        }
    }
};