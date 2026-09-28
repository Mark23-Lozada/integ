const DashboardController = {
    async loadDashboardData() {
        try {
            let units = [];
            let tenants = [];
            let totalCollected = 0;
            let computedTotalExpenses = 0;
            let yearlyTrends = [];

            // 1. Kunin ang listahan ng units mula sa units.php
            try {
                const unitsRes = await fetch('api/units.php');
                const unitsData = await unitsRes.json();
                if (unitsData.success && Array.isArray(unitsData.units)) {
                    units = unitsData.units;
                } else if (Array.isArray(unitsData)) {
                    units = unitsData;
                }
            } catch (err) {
                console.warn("Failed to fetch units list", err);
            }

            // 2. Kunin ang listahan ng tenants mula sa tenants.php
            try {
                const tenantsRes = await // Baguhin mula sa maling path patungo dito:
                fetch('API/tenant.php')
                const tenantsData = await tenantsRes.json();
                if (Array.isArray(tenantsData)) {
                    tenants = tenantsData;
                }
            } catch (err) {
                console.warn("Failed to fetch tenants list", err);
            }

            // 3. Kunin ang collected revenue mula sa finance.php
            try {
                const financeRes = await fetch('api/finance.php');
                const financeData = await financeRes.json();
                if (financeData.success) {
                    totalCollected = financeData.totalCollected || 0;
                }
            } catch (err) {
                console.warn("Failed to fetch finance data", err);
            }

            // 4. Kunin ang total expenses mula sa localStorage o API kung mayroon
            const savedExpenses = localStorage.getItem('expenses');
            if (savedExpenses) {
                try {
                    const expenseList = JSON.parse(savedExpenses);
                    computedTotalExpenses = expenseList.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
                } catch (e) {
                    console.error("Error parsing expenses", e);
                }
            }

            return {
                units,
                tenants,
                totalCollected,
                computedTotalExpenses,
                yearlyTrends
            };
        } catch (e) {
            console.error("Error in DashboardController.loadDashboardData:", e);
            return {
                units: [],
                tenants: [],
                totalCollected: 0,
                computedTotalExpenses: 0,
                yearlyTrends: []
            };
        }
    }
};