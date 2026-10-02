const RegisterView = {
    template: `
        <div class="flex items-center justify-center min-h-screen w-screen bg-[#0b0e11] font-sans px-4">
            <div class="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div class="relative w-full max-w-md bg-[#121619] border border-[#1e252b] p-8 rounded-2xl shadow-2xl z-10" data-aos="zoom-in" data-aos-duration="800">
                <div class="text-center mb-8" data-aos="fade-down" data-aos-delay="150">
                    <h1 class="text-3xl font-extrabold tracking-wider text-white">
                        Pocket<span class="text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.7)]">Pads</span>
                    </h1>
                    <p class="text-sm text-gray-400 mt-2">Create a new account to get started</p>
                </div>

                <form @submit.prevent="handleRegister" class="space-y-4">
                    <div data-aos="fade-up" data-aos-delay="200">
                        <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Admin Full Name</label>
                        <input type="text" v-model="names" placeholder="Enter your full name" required
                            class="w-full px-4 py-3 bg-[#0b0e11] border border-[#1e252b] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400">
                    </div>

                    <div data-aos="fade-up" data-aos-delay="300">
                        <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Gmail Address</label>
                        <input type="email" v-model="username" placeholder="example@gmail.com" required
                            class="w-full px-4 py-3 bg-[#0b0e11] border border-[#1e252b] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400">
                    </div>

                    <div data-aos="fade-up" data-aos-delay="400">
                        <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Password</label>
                        <input type="password" v-model="password" placeholder="••••••••" required
                            class="w-full px-4 py-3 bg-[#0b0e11] border border-[#1e252b] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400">
                    </div>

                    <div data-aos="fade-up" data-aos-delay="500">
                        <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Confirm Password</label>
                        <input type="password" v-model="confirmPassword" placeholder="••••••••" required
                            class="w-full px-4 py-3 bg-[#0b0e11] border border-[#1e252b] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400">
                    </div>

                    <button type="submit" data-aos="zoom-in" data-aos-delay="650" 
                        class="w-full mt-2 py-3.5 px-4 rounded-xl bg-cyan-400 text-white font-bold tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-cyan-500 cursor-pointer transition-all">
                        Create Account
                    </button>
                </form>

                <div class="text-center mt-6 text-xs text-gray-400" data-aos="fade-up" data-aos-delay="750">
                    <p>Already have an account? <router-link to="/login" class="text-cyan-400 font-semibold hover:underline ml-1">Sign In</router-link></p>
                </div>
            </div>
        </div>
    `,
    data() {
        return { names: '', username: '', password: '', confirmPassword: '' }
    },
    methods: {
        async handleRegister() {
            // Full validation (name, Gmail, password strength) before calling the server
            const check = RegisterController.validate(this.username, this.password, this.confirmPassword, this.names);
            if (check.status !== 'success') {
                Swal.fire({
                    icon: 'error',
                    title: 'Please check your details',
                    text: check.message,
                    background: '#121619',
                    color: '#fff',
                    confirmButtonColor: '#22d3ee'
                });
                return;
            }
            this.names = check.names;
            this.username = check.gmail;

            if (this.password !== this.confirmPassword) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Passwords do not match!',
                    background: '#121619',
                    color: '#fff',
                    confirmButtonColor: '#22d3ee'
                });
                return;
            }

            try {
                const response = await axios.post('API/Register.php', {
                    gmail: this.username,
                    password: this.password,
                    names: this.names
                });

                if (response.data.status === 'success') {
                    // Success alert in English, redirecting to Login page afterwards
                    Swal.fire({
                        icon: 'success',
                        title: 'Registration Successful!',
                        text: 'Your account has been created. Please sign in.',
                        background: '#121619',
                        color: '#fff',
                        confirmButtonColor: '#22d3ee',
                        timer: 2000,
                        showConfirmButton: true
                    }).then(() => {
                        // Diretso sa login page pagkatapos mag-register
                        this.$router.push('/login');
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Registration Failed',
                        text: response.data.message,
                        background: '#121619',
                        color: '#fff',
                        confirmButtonColor: '#22d3ee'
                    });
                }
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Server Error',
                    text: 'Something went wrong.',
                    background: '#121619',
                    color: '#fff',
                    confirmButtonColor: '#22d3ee'
                });
            }
        }
    }
};