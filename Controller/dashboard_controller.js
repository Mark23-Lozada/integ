const DashboardController = {
    async loadDashboardData() {
        try {
            let units = [];
            let tenants = [];
            let totalCollected = 0;
            let computedTotalExpenses = 0;
            let yearlyTrends = [];

            // 1. Kunin ang listahan ng units mula sa units.php[cite: 1]
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

            // 2. Kunin ang listahan ng tenants mula sa tenant.php[cite: 1]
            try {
                const tenantsRes = await fetch('API/tenant.php');
                const tenantsData = await tenantsRes.json();
                if (Array.isArray(tenantsData)) {
                    tenants = tenantsData;
                }
            } catch (err) {
                console.warn("Failed to fetch tenants list", err);
            }

            // 3. Kunin ang collected revenue mula sa finance.php[cite: 1]
            try {
                const financeRes = await fetch('api/finance.php');
                const financeData = await financeRes.json();
                if (financeData.success) {
                    totalCollected = financeData.totalCollected || 0;
                }
            } catch (err) {
                console.warn("Failed to fetch finance data", err);
            }

            // 4. Kunin ang expenses data diretso mula sa expenses_api.php
            try {
                const currentMonth = new Date().toISOString().slice(0, 7);
                const expensesRes = await fetch(`api/expenses_api.php?month=${currentMonth}`);
                const expensesData = await expensesRes.json();

                if (expensesData.success) {
                    // Kunin ang totalSpent mula sa monthStats ng expenses_api
                    if (expensesData.monthStats && typeof expensesData.monthStats.totalSpent !== 'undefined') {
                        computedTotalExpenses = expensesData.monthStats.totalSpent;
                    } else if (Array.isArray(expensesData.expenses)) {
                        computedTotalExpenses = expensesData.expenses
                            .filter(exp => exp.status === 'Approved')
                            .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
                    }

                    if (expensesData.year && expensesData.year.months) {
                        yearlyTrends = expensesData.year.months;
                    }
                }
            } catch (err) {
                console.warn("Failed to fetch expenses from expenses_api.php", err);
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