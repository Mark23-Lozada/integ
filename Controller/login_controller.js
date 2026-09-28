const LoginController = {
    async checkIfUserExists() {
        return await LoginModel.checkUserExists();
    },

    async processRegistration(gmail, password, confirmPassword) {
        if (!gmail || !password || !confirmPassword) {
            return { status: 'error', message: 'Please fill in all fields.' };
        }
        if (password !== confirmPassword) {
            return { status: 'error', message: 'Passwords do not match!' };
        }
        return await LoginModel.register({ gmail, password });
    },

    async processLogin(gmail, password) {
        if (!gmail || !password) {
            return { status: 'error', message: 'Please enter Gmail and password.' };
        }
        return await LoginModel.login({ gmail, password });
    }

};