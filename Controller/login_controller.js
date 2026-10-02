const LoginController = {
    async checkIfUserExists() {
        try {
            const response = await axios.get('api/check_user.php');
            return response.data;
        } catch (error) {
            console.error("Error checking user existence:", error);
            return { status: 'error', hasUser: false };
        }
    },

    async processRegistration(gmail, password, confirmPassword) {
        if (!gmail || !password || !confirmPassword) {
            return { status: 'error', message: 'Please fill in all fields.' };
        }

        const gmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!gmailRegex.test(gmail)) {
            return { status: 'error', message: 'Please provide a valid Gmail address.' };
        }

        if (password.length < 6) {
            return { status: 'error', message: 'Password must be at least 6 characters long.' };
        }

        if (password !== confirmPassword) {
            return { status: 'error', message: 'Passwords do not match!' };
        }

        try {
            const response = await axios.post('api/register.php', { gmail, password });
            return response.data;
        } catch (error) {
            console.error("Registration error:", error);
            return { status: 'error', message: 'A server error occurred during registration.' };
        }
    },

    async processLogin(gmail, password) {
        // Validation for empty inputs
        if (!gmail || !password) {
            return { status: 'error', message: 'Please enter your Gmail and password.' };
        }

        // Validation for proper email/Gmail format
        const gmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!gmailRegex.test(gmail)) {
            return { status: 'error', message: 'Please enter a valid Gmail format.' };
        }

        try {
            const response = await axios.post('api/Login.php', { gmail, password });
            return response.data;
        } catch (error) {
            console.error("Login error:", error);
            return { status: 'error', message: 'Network or server connection error.' };
        }
    }
};