const DashboardModel = {
    async getDashboardData() {
        try {
            // Kunin ang units
            const unitsRes = await fetch('api/units.php');
            const unitsJson = await unitsRes.json();
            const unitList = Array.isArray(unitsJson) ? unitsJson : (unitsJson.units || []);

            // Kunin ang tenants mula sa tenants.php
            const tenantsRes = await fetch('api/tenants.php');
            const tenantsList = await tenantsRes.json();
            const tenants = Array.isArray(tenantsList) ? tenantsList : [];

            // Kunin ang kabuuang nakolektang bayad mula sa finance.php
            let totalCollected = 0;
            try {
                const financeRes = await fetch('api/finance.php');
                const financeJson = await financeRes.json();
                if (financeJson.success) {
                    totalCollected = financeJson.totalCollected || 0;
                }
            } catch (err) {
                console.warn("Error fetching finance records", err);
            }

            // Kwentahin ang available at occupied units
            let occupiedRoomsCount = 0;
            let availableRoomsCount = 0;

            unitList.forEach(unit => {
                if (unit.isOccupied) {
                    occupiedRoomsCount++;
                } else {
                    availableRoomsCount++;
                }
            });

            return {
                success: true,
                units: unitList,
                tenants: tenants,
                totalCollected: totalCollected,
                totalUnits: unitList.length,
                occupiedRoomsCount: occupiedRoomsCount,
                availableRoomsCount: availableRoomsCount
            };
        } catch (e) {
            console.error("Error fetching dashboard data", e);
            return {
                success: false,
                units: [],
                tenants: [],
                totalCollected: 0,
                totalUnits: 0,
                occupiedRoomsCount: 0,
                availableRoomsCount: 0
            };
        }
    }
};