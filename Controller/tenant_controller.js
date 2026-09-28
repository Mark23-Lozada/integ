const TenantController = {
    validateBirthdate(birthdateString, nameLabel = "Tenant") {
        if (!birthdateString) {
            return { isValid: false, message: `Please enter the birthdate for ${nameLabel}!` };
        }

        const today = new Date();
        const bday = new Date(birthdateString);

        if (isNaN(bday.getTime())) {
            return { isValid: false, message: `Invalid birthdate format for ${nameLabel}!` };
        }

        if (bday > today) {
            return { isValid: false, message: `Future dates are not allowed for ${nameLabel}'s birthday!` };
        }

        let age = today.getFullYear() - bday.getFullYear();
        const m = today.getMonth() - bday.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < bday.getDate())) {
            age--;
        }

        if (age < 18) {
            return { isValid: false, message: `${nameLabel} not allowed: Age must be 18 or older.` };
        }

        if (age > 90) {
            return { isValid: false, message: `${nameLabel} not allowed: Age must not exceed 89 years old.` };
        }

        return { isValid: true };
    },

    validateMemberAge(ageVal, nameLabel = "Family Member") {
        const age = parseInt(ageVal);
        if (isNaN(age) || age < 1 || age > 100) {
            return { isValid: false, message: `${nameLabel} age must be between 1 and 100 years old (101 pataas ay bawal).` };
        }
        return { isValid: true };
    },

    // Bagong Validation para sa Relationship batay sa Age
    validateRelationshipAndAge(relationship, age, nameLabel = "Family Member") {
        const rel = (relationship || '').toLowerCase().trim();
        const numAge = parseInt(age);

        if (['wife', 'husband', 'father', 'mother', 'brother', 'sister', 'grandmother', 'grandfather'].includes(rel)) {
            if (numAge < 18) {
                return { isValid: false, message: `${nameLabel}: Relationship "${relationship}" must be 18 years old or older!` };
            }
        }

        if (['minor child'].includes(rel)) {
            if (numAge >= 18) {
                return { isValid: false, message: `${nameLabel}: "Minor Child" must be below 18 years old!` };
            }
        }

        if (['adult child'].includes(rel)) {
            if (numAge < 18) {
                return { isValid: false, message: `${nameLabel}: "Adult Child" must be 18 years old or older!` };
            }
        }

        return { isValid: true };
    },

    validateValidID(idType, idNumber) {
        if (!idNumber || !idNumber.trim()) {
            return { isValid: false, message: "Please enter a Valid ID Number!" };
        }

        const cleanId = idNumber.trim();
        const cleanDigits = cleanId.replace(/[-\s]/g, '');

        switch (idType) {
            case 'PhilSys National ID':
                if (!/^\d{16}$/.test(cleanDigits)) {
                    return { isValid: false, message: "The PhilSys National ID must consist of exactly 16 digits." };
                }
                break;
            case 'UMID / SSS':
                if (!/^\d{10,12}$/.test(cleanDigits)) {
                    return { isValid: false, message: "The UMID / SSS ID number must be 10 to 12 digits." };
                }
                break;
            case "Driver's License":
                if (!/^[A-Za-z]\d{2}-\d{2}-\d{6}$/.test(cleanId) && !/^[A-Za-z]\d{11}$/.test(cleanDigits)) {
                    return { isValid: false, message: "Invalid Driver's License format." };
                }
                break;
            case 'Passport':
                if (!/^[A-Za-z]\d{7}$/.test(cleanDigits)) {
                    return { isValid: false, message: "The Passport number must start with a letter followed by 7 digits." };
                }
                break;
            default:
                if (cleanId.length < 5) {
                    return { isValid: false, message: "The Valid ID number must not be less than 5 characters." };
                }
                break;
        }

        return { isValid: true };
    },

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    validatePhoneNumber(phone) {
        const phoneRegex = /^(09|\+639)\d{9}$/;
        return phoneRegex.test(phone);
    },

    validateDownpayment(amount, unit, contractMonths) {
        const dp = parseFloat(amount) || 0;
        const minDp = parseFloat(unit.downpayment) || 0;
        const monthlyRate = parseFloat(unit.rate) || 0;
        const totalRequiredRate = monthlyRate * parseInt(contractMonths || 1);

        if (dp < 0) {
            return { isValid: false, message: "Negative amounts are not allowed for downpayment!" };
        }

        const stringVal = amount ? amount.toString().replace('.', '') : '';
        if (stringVal.length > 5 || dp > 99999) {
            return { isValid: false, message: "Error: Downpayment can only be up to 5 digits (Maximum: ₱99,999)!" };
        }

        if (dp < minDp) {
            return { isValid: false, message: `The downpayment of ₱${dp} is lower than the minimum required downpayment (₱${minDp})!` };
        }

        if (dp > totalRequiredRate) {
            return { isValid: false, message: `Error: Downpayment exceeds the total contract amount!` };
        }

        return { isValid: true };
    },

    async handleFormSubmit(form, selectedUnit, existingTenants = []) {
        if (!form.fullname || !form.contact_no || !form.email) {
            Swal.fire('Input Error', 'Please fill out all required fields including the email.', 'warning');
            return false;
        }

        if (!this.validateEmail(form.email)) {
            Swal.fire('Validation Error', 'Invalid email address format!', 'warning');
            return false;
        }

        if (!this.validatePhoneNumber(form.contact_no)) {
            Swal.fire('Validation Error', 'Invalid contact number format!', 'warning');
            return false;
        }

        if (!this.validatePhoneNumber(form.emergency_contact_no)) {
            Swal.fire('Validation Error', 'Invalid emergency contact number format!', 'warning');
            return false;
        }

        const normalizeName = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

        const cleanName = normalizeName(form.fullname);
        const cleanEmName = normalizeName(form.emergency_contact_name);

        if (cleanName && cleanEmName && cleanName === cleanEmName) {
            Swal.fire('Validation Error', 'The Tenant name and Emergency Contact name cannot be the same!', 'warning');
            return false;
        }

        if (form.contact_no.trim() === form.emergency_contact_no.trim()) {
            Swal.fire('Validation Error', 'The Tenant contact number and Emergency Contact number cannot be the same!', 'warning');
            return false;
        }

        for (let t of existingTenants) {
            const existingCleanName = normalizeName(t.fullname);
            if (existingCleanName === cleanName) {
                Swal.fire('Duplicate Error', `An existing tenant with a similar name already exists: "${t.fullname}"!`, 'error');
                return false;
            }
            if (t.email && t.email.toLowerCase().trim() === form.email.toLowerCase().trim()) {
                Swal.fire('Duplicate Error', 'This email address is already registered to another tenant!', 'error');
                return false;
            }
            if (t.contact_no && t.contact_no.trim() === form.contact_no.trim()) {
                Swal.fire('Duplicate Error', 'This contact number is already used by another tenant!', 'error');
                return false;
            }
        }

        const mainBdayCheck = this.validateBirthdate(form.birthdate, form.fullname || "Main Tenant");
        if (!mainBdayCheck.isValid) {
            Swal.fire('Input Error', mainBdayCheck.message, 'warning');
            return false;
        }

        const idCheck = this.validateValidID(form.valid_id_type, form.valid_id_number);
        if (!idCheck.isValid) {
            Swal.fire('Valid ID Verification', idCheck.message, 'warning');
            return false;
        }

        if (selectedUnit) {
            const dpCheck = this.validateDownpayment(form.downpayment_amount, selectedUnit, form.contract_months);
            if (!dpCheck.isValid) {
                Swal.fire('Downpayment Verification', dpCheck.message, 'error');
                return false;
            }
        }

        if (Array.isArray(form.members) && form.members.length > 0) {
            let hasWife = false;
            let hasHusband = false;
            const memberNamesSet = new Set();

            for (let i = 0; i < form.members.length; i++) {
                const member = form.members[i];
                const memberName = member.fullname || `Member #${i + 1}`;
                const cleanMemberName = normalizeName(memberName);
                const rel = (member.relationship || '').toLowerCase().trim();

                if (cleanMemberName === cleanName || cleanMemberName === cleanEmName) {
                    Swal.fire('Validation Error', `The family member name "${memberName}" cannot be the same as the Tenant or Emergency Contact!`, 'warning');
                    return false;
                }

                if (memberNamesSet.has(cleanMemberName)) {
                    Swal.fire('Duplicate Error', `There is a duplicate name among the family members ("${memberName}")!`, 'error');
                    return false;
                }
                memberNamesSet.add(cleanMemberName);

                if (rel === 'wife') {
                    if (hasWife) {
                        Swal.fire('Validation Error', 'Only one "Wife" is allowed!', 'warning');
                        return false;
                    }
                    hasWife = true;
                }

                if (rel === 'husband') {
                    if (hasHusband) {
                        Swal.fire('Validation Error', 'Only one "Husband" is allowed!', 'warning');
                        return false;
                    }
                    hasHusband = true;
                }

                // Family Member Age Validation (1 to 100)
                const ageCheck = this.validateMemberAge(member.member_age, memberName);
                if (!ageCheck.isValid) {
                    Swal.fire('Family Member Age Error', ageCheck.message, 'warning');
                    return false;
                }

                // Relationship & Age Cross-Validation
                const relAgeCheck = this.validateRelationshipAndAge(member.relationship, member.member_age, memberName);
                if (!relAgeCheck.isValid) {
                    Swal.fire('Relationship & Age Mismatch', relAgeCheck.message, 'warning');
                    return false;
                }
            }
        }

        return true;
    }
};