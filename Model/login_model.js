const LoginModel = {
    async checkUserExists() {
        try {
            const response = await fetch('api/check_user.php');
            return await response.json();
        } catch (error) {
            return { status: 'error', hasUser: false };
        }
    },

    async register(userData) {
        try {
            const response = await fetch('api/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (error) {
            return { status: 'error', message: 'Network or server error occurred.' };
        }
    },

    async login(credentials) {
        try {
            const response = await fetch('api/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            return await response.json();
        } catch (error) {
            return { status: 'error', message: 'Network or server error occurred.' };
        }
    }
};