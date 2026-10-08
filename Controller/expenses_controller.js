// Expenses Controller - validation used by expenses_view.js
// Both validators return { isValid, message } (the view reads .isValid / .message)
const ExpensesController = {
    // One expense: title, category, amount, date (+ optional note and room)
    validateExpense(form) {
        const title = String(form.title || '').trim();
        if (!title) {
            return { isValid: false, message: 'Please enter a title for the expense.' };
        }
        if (title.length > 150) {
            return { isValid: false, message: 'The title is too long (max 150 characters).' };
        }
        if (!form.category) {
            return { isValid: false, message: 'Please choose a category.' };
        }
        const amt = Number(form.amount);
        if (!(amt > 0) || amt > 9999999) {
            return { isValid: false, message: 'Enter a valid amount.' };
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(form.expense_date || '')) {
            return { isValid: false, message: 'Please choose a valid expense date.' };
        }
        if ((form.description || '').length > 255) {
            return { isValid: false, message: 'The description is too long (max 255 characters).' };
        }
        return { isValid: true };
    },

    // A utility bill. Electricity and water are billed per room, so a room is required for them.
    validateBill(name, amount, billDate, unitId) {
        if (!name) {
            return { isValid: false, message: 'Missing bill type.' };
        }
        if (name !== 'WiFi' && !unitId) {
            return { isValid: false, message: 'Choose the room this ' + name.toLowerCase() + ' bill belongs to.' };
        }
        const amt = Number(amount);
        if (!(amt > 0) || amt > 9999999) {
            return { isValid: false, message: 'Enter a valid bill amount.' };
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(billDate || '')) {
            return { isValid: false, message: 'Enter a valid bill date.' };
        }
        return { isValid: true };
    },

    init() {
        console.log("Expenses Controller initialized successfully.");
    }
};

// I-initialize ang controller pag-load
ExpensesController.init();
