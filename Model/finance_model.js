const FinanceModel = {
    // Kunin ang lahat ng finance records at kabuuang koleksyon mula sa backend
    async getAllFinances() {
        try {
            const response = await fetch('api/finance.php', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Error fetching finance data:", error);
            return { success: false, data: [], totalCollected: 0, message: "Network error" };
        }
    },

    // Magdagdag ng bagong finance/payment record sa database
    async addFinanceRecord(financeData) {
        try {
            const response = await fetch('api/finance.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(financeData)
            });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Error saving finance record:", error);
            return { success: false, message: "Network error habang nagse-save." };
        }
    }
};