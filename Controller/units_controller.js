const UnitsController = {
    async loadUnits() {
        return await UnitModel.getAll();
    },

    async saveUnit(isEditing, activeUnitId, form, rawFiles, currentUnits) {
        if (!form.name || form.name.trim() === '') {
            return { success: false, message: 'Room / Unit name is required.' };
        }

        if (isEditing) {
            const originalUnit = currentUnits.find(u => u.id == activeUnitId);
            if (originalUnit && originalUnit.isOccupied) {
                return { success: false, message: 'Bawal i-edit ang unit na ito dahil kasalukuyan itong occupied!' };
            }
        }

        const trimmedName = form.name.trim().toLowerCase();
        const isDuplicate = currentUnits.some(unit => {
            if (isEditing && unit.id == activeUnitId) return false;
            return unit.name.trim().toLowerCase() === trimmedName;
        });

        if (isDuplicate) {
            return { success: false, message: 'Bawal ang duplicate! Mayroon nang ganitong pangalan ng Room o Unit.' };
        }

        if (form.rate <= 0 || form.rate > 50000) {
            return { success: false, message: 'Monthly rent rate must be greater than 0 and cannot exceed ₱50,000.' };
        }

        if (form.downpayment < 0 || form.downpayment > 5000) {
            return { success: false, message: 'Downpayment cannot exceed ₱5,000 and cannot be negative.' };
        }


        if (form.status === 'Occupied') {
            form.isOccupied = true;
        } else {
            form.isOccupied = false;
        }

        const formData = new FormData();
        formData.append('name', form.name.trim());
        formData.append('type', form.type);
        formData.append('rate', form.rate);
        formData.append('downpayment', form.downpayment);
        formData.append('description', form.description || '');
        formData.append('status', form.status || 'Available');
        formData.append('isOccupied', form.isOccupied ? 1 : 0);
        formData.append('tenantName', form.tenantName || '');

        if (isEditing) {
            formData.append('id', activeUnitId);
            formData.append('existingImage', form.image || '');
            formData.append('existingKitchenImage', form.kitchenImage || '');
            formData.append('existingDiningImage', form.diningImage || '');
        }

        if (rawFiles.image) formData.append('image', rawFiles.image);
        if (rawFiles.kitchenImage) formData.append('kitchenImage', rawFiles.kitchenImage);
        if (rawFiles.diningImage) formData.append('diningImage', rawFiles.diningImage);

        const updatedUnits = await UnitModel.saveFormData(formData);
        return { success: true, units: updatedUnits };
    },

    async deleteUnit(unit) {
        if (unit.isOccupied) {
            return {
                success: false,
                message: "Hindi maaring idelete ang unit na ito dahil ito ay kasalukuyang occupied!"
            };
        }

        const updatedUnits = await UnitModel.delete(unit.id);
        return { success: true, units: updatedUnits };
    },

    handleFileChange(event, fieldName, formObj, rawFilesObj) {
        const file = event.target.files[0];
        if (file) {
            rawFilesObj[fieldName] = file;
            const reader = new FileReader();
            reader.onload = (e) => { formObj[fieldName] = e.target.result; };
            reader.readAsDataURL(file);
        }
    },

    handleDrop(event, fieldName, formObj, rawFilesObj) {
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            rawFilesObj[fieldName] = file;
            const reader = new FileReader();
            reader.onload = (e) => { formObj[fieldName] = e.target.result; };
            reader.readAsDataURL(file);
        }
    }
};