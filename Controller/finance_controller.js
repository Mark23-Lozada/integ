const FinanceController = {
    // Logic para makuha ang mga transaksyon at ihanda para sa View/Dashboard
    async loadFinances() {
        const response = await FinanceModel.getAllFinances();
        if (response.success) {
            return {
                success: true,
                data: response.data,
                totalCollected: response.totalCollected
            };
        } else {
            return {
                success: false,
                data: [],
                totalCollected: 0,
                message: response.message || "Nabigong kuhanin ang mga tala sa pananalapi."
            };
        }
    },

    // Logic para sa pag-validate at pag-save ng transaksyon
    async saveTransaction(formdata) {
        if (!formdata.tenant_name || formdata.amount <= 0) {
            return {
                success: false,
                message: "Mangyaring punan ang pangalan ng tenant at maglagay ng wastong halaga."
            };
        }

        const payload = {
            tenant_id: formdata.tenant_id || null,
            tenant_name: formdata.tenant_name,
            unit_name: formdata.unit_name || 'Unassigned',
            payment_type: formdata.payment_type || 'Monthly Rent',
            amount: parseFloat(formdata.amount),
            payment_date: formdata.payment_date || new Date().toISOString().slice(0, 19).replace('T', ' '),
            status: formdata.status || 'Paid'
        };

        const result = await FinanceModel.addFinanceRecord(payload);
        return result;
    }
};