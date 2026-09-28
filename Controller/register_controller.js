const RegisterController = {
    async processRegistration(gmail, password, confirmPassword, names) {
        if (!gmail || !password || !confirmPassword || !names) {
            return { status: 'error', message: 'Lahat ng fields ay kinakailangan punan.' };
        }

        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!gmailRegex.test(gmail)) {
            return { status: 'error', message: 'Mangyaring maglagay ng valid na Gmail address (hal. name@gmail.com).' };
        }

        if (password !== confirmPassword) {
            return { status: 'error', message: 'Hindi magkatugma ang password at confirm password.' };
        }

        if (password.length < 6) {
            return { status: 'error', message: 'Ang password ay dapat hindi bababa sa 6 na karakter.' };
        }

        // Ginawa nang 'gmail' ang property sa halip na 'username'
        const userData = {
            gmail: gmail,
            password: password,
            names: names
        };

        const result = await RegisterModel.register(userData);
        return result;
    }
};