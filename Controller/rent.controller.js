const RentController = {
    validatePayment(amountPaid, remainingBalance) {
        const paid = parseFloat(amountPaid) || 0;
        const balance = parseFloat(remainingBalance) || 0;

        if (paid <= 0) {
            return { isValid: false, message: "Ang halaga ng bayad ay dapat mas mataas sa zero (0)!" };
        }

        if (amountPaid.toString().replace('.', '').length > 5) {
            return { isValid: false, message: "Bawal lumagpas sa 5 digits ang halaga ng bayad!" };
        }

        if (paid > balance) {
            return { isValid: false, message: `Bawal ang sumobrang bayad! Ang natitirang balanse ay ₱${balance.toLocaleString()} lamang.` };
        }

        return { isValid: true };
    },

    calculatePaymentRemarks(amountPaid, remainingBalance) {
        const paid = parseFloat(amountPaid) || 0;
        const balance = parseFloat(remainingBalance) || 0;

        if (paid >= balance && balance > 0) {
            return 'Paid';
        } else {
            return 'Partial';
        }
    },

    async handlePaymentSubmit(form, selectedTenant) {
        const balance = selectedTenant ? parseFloat(selectedTenant.remaining_balance) || 0 : parseFloat(form.remaining_balance) || 0;
        const paid = parseFloat(form.amount_paid) || 0;

        if (form.amount_paid.toString().replace('.', '').length > 5) {
            Swal.fire({
                icon: 'error',
                title: 'Lumagpas sa Limitasyon',
                text: `Hanggang 5 digits lamang ang pinapayagang halaga ng bayad.`
            });
            return false;
        }

        if (paid > balance) {
            Swal.fire({
                icon: 'error',
                title: 'Bawal ang Sobrang Bayad',
                text: `Ang inilagay mong halaga ay lumampas sa natitirang balanse. Ang maximum na maaari mong bayaran ay ₱${balance.toLocaleString()} lamang.`
            });
            return false;
        }

        const validation = this.validatePayment(form.amount_paid, balance);
        if (!validation.isValid) {
            Swal.fire('Veripikasyon sa Pagbabayad', validation.message, 'warning');
            return false;
        }

        return true;
    },

    showReceiptModal(data) {
        RentController.printReceipt(data);
    },

    printReceipt(data) {
        const paymentId = data.payment_id || data.id || 'NEW';
        const monthly = parseFloat(data.monthly_rent || 0);
        const contractMonths = parseInt(data.contract_months || 1);
        const totalContract = data.total_contract_amount || (monthly * contractMonths);
        const downpayment = parseFloat(data.downpayment_amount || 0);
        const amountPaid = parseFloat(data.amount_paid || 0);
        const remaining = parseFloat(data.remaining_balance !== undefined ? data.remaining_balance : (totalContract - downpayment - amountPaid));

        let membersHtml = '';
        if (data.members && data.members.length > 0) {
            membersHtml = `
                <div class="section-box">
                    <div class="section-title">Mga Kasama sa Unit (Occupants)</div>
                    <table class="members-table">
                        <thead>
                            <tr>
                                <th>Pangalan</th>
                                <th>Relasyon</th>
                                <th>Birthdate</th>
                            </tr>
                        </thead>
                        <tbody>`;
            data.members.forEach(m => {
                membersHtml += `
                    <tr>
                        <td><b>${m.fullname || 'N/A'}</b></td>
                        <td>${m.relationship || 'N/A'}</td>
                        <td>${m.birthdate || 'N/A'}</td>
                    </tr>`;
            });
            membersHtml += `</tbody></table></div>`;
        } else {
            membersHtml = `
                <div class="section-box">
                    <div class="section-title">Mga Kasama sa Unit (Occupants)</div>
                    <div style="font-size: 11px; color: #666; font-style: italic;">Walang nakarehistrong kasama / Mag-isa sa unit</div>
                </div>`;
        }

        const printWindow = window.open('', '_blank', 'height=800,width=650');

        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Official Receipt - #${paymentId}</title>
                    <style>
                        * { box-sizing: border-box; }
                        body { 
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                            padding: 20px; 
                            color: #333; 
                            font-size: 12px; 
                            line-height: 1.5; 
                            background: #fff;
                        }
                        .receipt-card {
                            max-width: 600px;
                            margin: 0 auto;
                            border: 1px solid #e5e7eb;
                            border-radius: 12px;
                            padding: 24px;
                        }
                        .header { 
                            text-align: center; 
                            margin-bottom: 20px; 
                            border-bottom: 2px solid #E8736B; 
                            padding-bottom: 12px; 
                        }
                        .header h2 { 
                            margin: 0; 
                            color: #E8736B; 
                            font-size: 22px; 
                            font-weight: 800;
                            letter-spacing: 0.5px; 
                        }
                        .header .subtitle { 
                            font-size: 11px; 
                            color: #6b7280; 
                            margin-top: 4px; 
                            font-weight: 500;
                        }
                        .grid-2 { 
                            display: grid; 
                            grid-template-columns: 1fr 1fr; 
                            gap: 12px; 
                            margin-bottom: 15px; 
                        }
                        .info-box { 
                            border: 1px solid #e5e7eb; 
                            padding: 12px; 
                            border-radius: 8px; 
                            background: #f9fafb; 
                        }
                        .box-title { 
                            font-weight: 700; 
                            font-size: 11px; 
                            text-transform: uppercase; 
                            color: #374151; 
                            border-bottom: 1px solid #e5e7eb; 
                            padding-bottom: 6px; 
                            margin-bottom: 8px; 
                            letter-spacing: 0.5px;
                        }
                        .row { 
                            display: flex; 
                            justify-content: space-between; 
                            margin-bottom: 4px; 
                        }
                        .row span:first-child { color: #6b7280; }
                        .row span:last-child { color: #111827; font-weight: 600; text-align: right; }
                        
                        .section-box {
                            border: 1px solid #e5e7eb;
                            padding: 12px;
                            border-radius: 8px;
                            background: #f9fafb;
                            margin-bottom: 15px;
                        }
                        .section-title { 
                            font-weight: 700; 
                            font-size: 11px; 
                            text-transform: uppercase; 
                            color: #374151; 
                            margin-bottom: 8px; 
                            border-bottom: 1px solid #e5e7eb;
                            padding-bottom: 6px;
                            letter-spacing: 0.5px;
                        }
                        .members-table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            font-size: 11px; 
                        }
                        .members-table th, .members-table td { 
                            border: 1px solid #e5e7eb; 
                            padding: 6px 8px; 
                            text-align: left; 
                        }
                        .members-table th { 
                            background: #f3f4f6; 
                            color: #374151;
                            font-weight: 700;
                        }
                        .payment-summary { 
                            border: 2px dashed #E8736B; 
                            padding: 14px; 
                            border-radius: 8px; 
                            background: #fffdfd; 
                        }
                        .payment-summary .box-title {
                            color: #E8736B;
                            border-color: #fbd5d3;
                        }
                        .amount-highlight { 
                            color: #059669; 
                            font-size: 16px !important; 
                            font-weight: 800 !important; 
                        }
                        .balance-highlight { 
                            color: #dc2626; 
                            font-weight: 800 !important; 
                        }
                        .footer { 
                            text-align: center; 
                            font-size: 10px; 
                            color: #9ca3af; 
                            margin-top: 20px; 
                            border-top: 1px solid #f3f4f6; 
                            padding-top: 10px; 
                        }
                        @media print {
                            body { padding: 0; background: #fff; }
                            .receipt-card { border: none; box-shadow: none; padding: 0; max-width: 100%; }
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt-card">
                        <div class="header">
                            <h2>OFFICIAL RENT RECEIPT</h2>
                            <div class="subtitle">Property Management System &bull; Dasmariñas, Cavite</div>
                        </div>

                        <div class="grid-2">
                            <div class="info-box">
                                <div class="box-title">Impormasyon ng Umuupa</div>
                                <div class="row"><span>Pangalan:</span> <span>${data.fullname || 'N/A'}</span></div>
                                <div class="row"><span>Contact No:</span> <span>${data.contact_no || 'N/A'}</span></div>
                                <div class="row"><span>Email:</span> <span style="word-break: break-all; max-width: 130px;">${data.email || 'N/A'}</span></div>
                                <div class="row"><span>Address:</span> <span style="max-width: 130px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${data.province_address || 'N/A'}">${data.province_address || 'N/A'}</span></div>
                                <div class="row"><span>Valid ID:</span> <span>${data.valid_id_type || 'N/A'}</span></div>
                                <div class="row"><span>ID Number:</span> <span>${data.valid_id_number || 'N/A'}</span></div>
                            </div>

                            <div class="info-box">
                                <div class="box-title">Kontrata & Emergency</div>
                                <div class="row"><span>Assigned Unit:</span> <span style="color: #E8736B;">${data.unit_name || 'N/A'}</span></div>
                                <div class="row"><span>Monthly Rate:</span> <span>₱${monthly.toLocaleString()}</span></div>
                                <div class="row"><span>Total Contract:</span> <span>₱${totalContract.toLocaleString()}</span></div>
                                <div class="row"><span>Contact Person:</span> <span>${data.emergency_contact_name || 'N/A'}</span></div>
                                <div class="row"><span>Emergency No:</span> <span>${data.emergency_contact_no || 'N/A'}</span></div>
                            </div>
                        </div>

                        ${membersHtml}

                        <div class="payment-summary">
                            <div class="box-title">Detalye ng Transaksyon sa Pagbabayad</div>
                            <div class="row"><span>Transaction ID:</span> <span>#${paymentId}</span></div>
                            <div class="row"><span>Petsa ng Bayad:</span> <span>${data.payment_date || new Date().toLocaleString()}</span></div>
                            <div class="row" style="margin: 8px 0; border-top: 1px dashed #fbd5d3; padding-top: 8px;">
                                <span>Halagang Ibinayad:</span> 
                                <span class="amount-highlight">₱${amountPaid.toLocaleString()}</span>
                            </div>
                            <div class="row"><span>Remarks / Status:</span> <span style="color: #0284c7;">${data.remarks || 'Paid'}</span></div>
                            <div class="row" style="border-top: 1px solid #e5e7eb; padding-top: 6px; margin-top: 6px;">
                                <span>Natitirang Balanse:</span> 
                                <span class="balance-highlight">₱${remaining.toLocaleString()}</span>
                            </div>
                        </div>

                        <div class="footer">
                            Maraming salamat sa iyong napapanahong pagbabayad! • Ito ay awtomatikong nabuong resibo ng sistema.
                        </div>
                    </div>

                    <script>
                        window.onload = function() {
                            window.focus();
                            setTimeout(function() {
                                window.print();
                            }, 300);
                        };

                        window.onafterprint = function() {
                            window.close();
                        };

                        let mediaQueryList = window.matchMedia('print');
                        mediaQueryList.addListener(function(mql) {
                            if (!mql.matches) {
                                window.close();
                            }
                        });
                    </script>
                </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    }
};