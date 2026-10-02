const LoginView = {
    template: `
        <div class="flex items-center justify-center min-h-screen w-screen bg-gradient-to-br from-gray-50 via-gray-100 to-emerald-50/30 font-sans px-4 relative overflow-hidden">
            <!-- Decorative Blur Background Glow -->
            <div class="absolute w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20 animate-pulse"></div>
            <div class="absolute w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20 animate-pulse" style="animation-duration: 4s;"></div>
            
            <!-- Main Container with Slide / Fade Transition Animation -->
            <transition name="slide-fade" appear>
                <div class="relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/40 p-8 rounded-3xl shadow-2xl hover:shadow-emerald-500/10 transition-all duration-700 z-10 group">
                    
                    <!-- Header / Logo with Smooth Entry -->
                    <div class="text-center mb-8 transform transition-transform duration-500 group-hover:-translate-y-1" data-aos="fade-down" data-aos-delay="150">
                        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 transition-all duration-300">
                            Pocket<span class="text-emerald-600 drop-shadow-sm">Pads</span>
                        </h1>
                        <p class="text-sm text-gray-500 font-medium mt-1">Sign in to your account to manage properties</p>
                    </div>

                    <form @submit.prevent="handleLogin" class="space-y-5">
                        <div class="transform transition-all duration-300 hover:translate-x-0.5" data-aos="fade-up" data-aos-delay="250">
                            <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Gmail Address</label>
                            <input type="email" v-model="username" placeholder="example@gmail.com" required
                                class="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-200/80 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 transition-all duration-300 text-sm shadow-inner">
                        </div>

                        <div class="transform transition-all duration-300 hover:translate-x-0.5" data-aos="fade-up" data-aos-delay="350">
                            <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Password</label>
                            <input type="password" v-model="password" placeholder="••••••••" required
                                class="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-200/80 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 transition-all duration-300 text-sm shadow-inner">
                        </div>

                        <!-- Button with Swipe Light Effect, Scale, and Loading Spinner -->
                        <button type="submit" :disabled="isLoading" data-aos="zoom-in" data-aos-delay="450"
                            class="relative overflow-hidden w-full mt-2 py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold tracking-wide shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-600/40 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] cursor-pointer transition-all duration-300 text-sm group/btn">
                            
                            <!-- Swipe Light Effect on Hover -->
                            <span class="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></span>

                            <span v-if="!isLoading" class="relative z-10 flex items-center justify-center gap-2">
                                Sign In
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                            <span v-else class="relative z-10 flex items-center justify-center gap-2">
                                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </span>
                        </button>
                    </form>

                    <!-- Conditional Register Link: Automatically hides or adapts if an account already exists -->
                    <div class="text-center mt-6 text-xs text-gray-500 transition-all duration-500" data-aos="fade-up" data-aos-delay="550">
                        <transition name="fade" mode="out-in">
                            <p v-if="!hasExistingAccount">
                                Don't have an account? 
                                <router-link to="/register" class="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline ml-1 transition-colors">Register</router-link>
                            </p>
                            <p v-else class="text-gray-400 italic">
                                System account already secured.
                            </p>
                        </transition>
                    </div>
                </div>
            </transition>
        </div>
    `,
    data() {
        return {
            username: '',
            password: '',
            isLoading: false,
            hasExistingAccount: false
        }
    },
    async mounted() {
        await this.checkUserAccountStatus();
    },
    methods: {
        async checkUserAccountStatus() {
            try {
                const response = await axios.get('api/check_user.php');
                if (response.data && response.data.hasUser) {
                    this.hasExistingAccount = true;
                }
            } catch (error) {
                console.error("Error checking existing user:", error);
            }
        },
        async handleLogin() {
            this.isLoading = true;

            // Calls the controller method with validation support
            const result = await LoginController.processLogin(this.username, this.password);

            this.isLoading = false;

            if (result.status === 'success') {
                localStorage.setItem('adminName', result.names);
                localStorage.setItem('isAuthenticated', 'true');

                Swal.fire({
                    icon: 'success',
                    title: 'Login Successful!',
                    text: result.message,
                    background: '#ffffff',
                    color: '#111827',
                    confirmButtonColor: '#10b981',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    this.$router.push('/dashboard');
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: result.message,
                    background: '#ffffff',
                    color: '#111827',
                    confirmButtonColor: '#10b981'
                });
            }
        }
    }
};

// CSS Transitions injected dynamically for Vue <transition> components
const style = document.createElement('style');
style.innerHTML = `
    .slide-fade-enter-active {
        transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .slide-fade-leave-active {
        transition: all 0.4s cubic-bezier(0.5, 0, 0.7, 1);
    }
    .slide-fade-enter-from, .slide-fade-leave-to {
        transform: translateY(30px) scale(0.95);
        opacity: 0;
    }
    .fade-enter-active, .fade-leave-active {
        transition: opacity 0.3s ease;
    }
    .fade-enter-from, .fade-leave-to {
        opacity: 0;
    }
`;
document.head.appendChild(style);