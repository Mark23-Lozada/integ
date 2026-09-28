const UnitModel = {
    async getAll() {
        try {
            const response = await fetch('api/units.php');
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (e) {
            console.error("Error fetching units from database", e);
            return [];
        }
    },

    async saveFormData(formData) {
        try {
            const response = await fetch('api/units.php', {
                method: 'POST',
                body: formData
            });
            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (err) {
                console.error("Non-JSON response received:", text);
                return await this.getAll();
            }

            if (result && result.success) {
                return await this.getAll();
            } else {
                console.error("Server error:", result ? result.message : 'Unknown error');
                return await this.getAll();
            }
        } catch (e) {
            console.error("Error saving unit", e);
            return [];
        }
    },

    async delete(id) {
        try {
            const response = await fetch(`api/units.php?id=${id}`, {
                method: 'DELETE'
            });
            const text = await response.text();
            try {
                const result = JSON.parse(text);
                if (result && !result.success) {
                    console.error("Server error on delete:", result.message);
                }
            } catch (err) {
                console.error("Non-JSON delete response:", text);
            }
            return await this.getAll();
        } catch (e) {
            console.error("Error deleting unit", e);
            return [];
        }
    }
};