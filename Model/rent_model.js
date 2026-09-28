const RentModel = {
    async getTenantBalances() {
        try {
            const response = await fetch('API/rent.php?action=balances');
            const data = await response.json();
            return Array.isArray(data) ? data : (data.balances || []);
        } catch (e) {
            console.error("Error fetching tenant balances", e);
            return [];
        }
    },

    async getPaymentHistory() {
        try {
            const response = await fetch('API/finance.php');
            const data = await response.json();
            return Array.isArray(data) ? data : (data.data || []);
        } catch (e) {
            console.error("Error fetching payment history", e);
            return [];
        }
    },

    async recordPayment(paymentData) {
        try {
            const response = await fetch('API/finance.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });
            return await response.json();
        } catch (e) {
            console.error("Error recording payment", e);
            return { success: false, message: "Network error occurred." };
        }
    }
};