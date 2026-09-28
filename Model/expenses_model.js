const ExpensesModel = {
    // Kinukuha ang lahat ng datos mula sa API
    async fetchFinanceData() {
        try {
            const response = await fetch('api/expenses_api.php');
            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Error sa pagkuha ng finance data:", error);
            return { success: false, message: "Network Error" };
        }
    },

    // Pag-save ng bagong gastusin o utility bill
    async saveExpense(formData) {
        try {
            const response = await fetch('api/expenses_api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Error sa pag-save ng gastusin:", error);
            return { success: false, message: "Network Error" };
        }
    },

    // Pag-approve ng gastusin upang awtomatikong magbawas sa pondo (finances)
    async approveExpense(expenseId) {
        try {
            const response = await fetch('api/expenses_api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve', id: expenseId })
            });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Error sa pag-approve ng gastusin:", error);
            return { success: false, message: "Network Error" };
        }
    }
};