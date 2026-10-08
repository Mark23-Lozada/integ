const TenantModel = {
    async getAll() {
        try {
            const response = await fetch('api/tenant.php');
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (e) {
            console.error("Error fetching tenants", e);
            return [];
        }
    },

    async getAvailableUnits() {
        try {
            const response = await fetch('api/tenant.php?action=available_units');
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (e) {
            console.error("Error fetching available units", e);
            return [];
        }
    },

    async save(formData) {
        try {
            const response = await fetch('api/tenant.php', {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (e) {
            console.error("Error saving tenant", e);
            return { success: false, message: "Network error occurred." };
        }
    },

    async renewContract(formData) {
        try {
            const response = await fetch('api/tenant.php?action=renew_contract', {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (e) {
            console.error("Error renewing contract", e);
            return { success: false, message: "Network error occurred." };
        }
    },

    async createAccount(tenantId) {
        try {
            const formData = new FormData();
            formData.append('tenant_id', tenantId);
            const response = await fetch('api/tenant.php?action=create_account', {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (e) {
            console.error("Error creating tenant login", e);
            return { success: false, message: "Network error occurred." };
        }
    },

    async delete(id) {
        try {
            const response = await fetch(`api/tenant.php?id=${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (e) {
            console.error("Error deleting tenant", e);
            return { success: false, message: "Network error occurred." };
        }
    }
};