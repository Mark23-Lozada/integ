const RegisterModel = {
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
    }
};