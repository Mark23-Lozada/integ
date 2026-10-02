const Tenants = {
    template: `
        <div class="space-y-6 min-h-full pb-10 transition-all duration-500 ease-out">
            <!-- Header & Action Button -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 transform transition-all duration-500 hover:translate-x-1" data-aos="fade-right">
                <div>
                    <h1 class="text-3xl font-black text-gray-900 tracking-tight transition-colors duration-300 hover:text-emerald-800">Family & Contract Directory</h1>
                    <p class="text-sm text-gray-500 font-medium">Monitor tenants, move-in agreements, downpayments, and lease contracts.</p>
                </div>
                <button @click="openModal" class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer">
                    <i class="fa-solid fa-user-plus"></i> Register Tenant
                </button>
            </div>
            <hr class="border-gray-100 transition-all duration-500 hover:border-emerald-500/50">

            <!-- Summary Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div class="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-500 transform hover:-translate-y-1 flex items-center justify-between group relative overflow-hidden" data-aos="fade-up" data-aos-delay="0">
                    <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                    <div class="relative z-10">
                        <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider group-hover:text-emerald-700 transition-colors">Total Head Tenants</p>
                        <h3 class="text-2xl font-black text-gray-900 mt-1 transition-transform duration-300 group-hover:scale-105 origin-left" v-countup>{{ tenants.length }}</h3>
                    </div>
                    <div class="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl text-lg shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 group-hover:scale-110 relative z-10"><i class="fa-solid fa-user-tie"></i></div>
                </div>

                <div class="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-500 transform hover:-translate-y-1 flex items-center justify-between group relative overflow-hidden" data-aos="fade-up" data-aos-delay="100">
                    <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                    <div class="relative z-10">
                        <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider group-hover:text-emerald-700 transition-colors">Active Contracts</p>
                        <h3 class="text-2xl font-black text-emerald-600 mt-1 transition-transform duration-300 group-hover:scale-105 origin-left" v-countup>{{ activeCount }}</h3>
                    </div>
                    <div class="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl text-lg shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 group-hover:scale-110 relative z-10"><i class="fa-solid fa-file-contract"></i></div>
                </div>

                <div class="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-500 transform hover:-translate-y-1 flex items-center justify-between group relative overflow-hidden" data-aos="fade-up" data-aos-delay="200">
                    <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                    <div class="relative z-10">
                        <p class="text-xs font-semibold text-amber-600 uppercase tracking-wider group-hover:text-amber-700 transition-colors">Fully Paid Downpayment</p>
                        <h3 class="text-2xl font-black text-amber-500 mt-1 transition-transform duration-300 group-hover:scale-105 origin-left" v-countup>{{ paidCount }}</h3>
                    </div>
                    <div class="p-3 bg-amber-500/10 text-amber-500 rounded-xl text-lg shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 group-hover:scale-110 relative z-10"><i class="fa-solid fa-wallet"></i></div>
                </div>
            </div>

            <!-- Search and Filter Section -->
            <div class="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md" data-aos="fade-up" data-aos-delay="0">
                <div class="flex-1 relative">
                    <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input type="text" v-model="searchQuery" placeholder="Search by Tenant Name..." class="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-all duration-300">
                </div>
                <div class="md:w-64">
                    <select v-model="paymentFilter" class="w-full px-4 py-2 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer transition-all duration-300">
                        <option value="All">All Payment Status</option>
                        <option value="Paid">Fully Paid</option>
                        <option value="Partial">Partial Payment</option>
                        <option value="Not Paid">Not Paid / Unpaid</option>
                    </select>
                </div>
            </div>

            <!-- TAB NAVIGATION -->
            <div class="flex gap-2 border-b border-gray-200 pb-2">
                <button @click="activeTab = 'personal'" :class="activeTab === 'personal' ? 'bg-emerald-500 text-white shadow-md scale-105' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200'" class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer flex items-center gap-2">
                    <i class="fa-solid fa-id-card"></i> Personal Info Table
                </button>
                <button @click="activeTab = 'tenant'" :class="activeTab === 'tenant' ? 'bg-emerald-500 text-white shadow-md scale-105' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200'" class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer flex items-center gap-2">
                    <i class="fa-solid fa-house-chimney"></i> Lease & Contract Table
                </button>
            </div>

            <!-- TABLE 1: PERSONAL INFO -->
            <div v-if="activeTab === 'personal'" class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl" data-aos="fade-up" data-aos-delay="100">
                <div class="overflow-x-auto max-h-[500px] custom-scrollbar">
                    <table class="w-full text-left border-collapse whitespace-nowrap text-xs">
                        <thead>
                            <tr class="bg-gray-50/80 border-b border-gray-100 font-bold text-gray-400 uppercase tracking-wider text-[11px] sticky top-0 z-10">
                                <th class="py-3 px-4">Full Name</th>
                                <th class="py-3 px-4">Gender</th>
                                <th class="py-3 px-4">Birthdate</th>
                                <th class="py-3 px-4">Contact Number</th>
                                <th class="py-3 px-4">Email Address</th>
                                <th class="py-3 px-4">Provincial Address</th>
                                <th class="py-3 px-4">Valid ID Type</th>
                                <th class="py-3 px-4">Valid ID Number</th>
                                <th class="py-3 px-4">Emergency Name</th>
                                <th class="py-3 px-4">Emergency Number</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            <tr v-for="t in filteredTenants" :key="t.id" class="hover:bg-emerald-50/40 transition-all duration-200 transform hover:scale-[1.005]">
                                <td class="py-3 px-4 font-bold text-gray-900">{{ t.fullname }}</td>
                                <td class="py-3 px-4 text-gray-600">{{ t.gender }}</td>
                                <td class="py-3 px-4 text-gray-600">{{ t.birthdate }}</td>
                                <td class="py-3 px-4 text-gray-600">{{ t.contact_no }}</td>
                                <td class="py-3 px-4 text-gray-600">{{ t.email || 'N/A' }}</td>
                                <td class="py-3 px-4 text-gray-600">{{ t.province_address }}</td>
                                <td class="py-3 px-4 text-gray-600 font-semibold">{{ t.valid_id_type }}</td>
                                <td class="py-3 px-4 text-gray-600">{{ t.valid_id_number }}</td>
                                <td class="py-3 px-4 text-gray-600 font-medium">{{ t.emergency_contact_name }}</td>
                                <td class="py-3 px-4 text-gray-600">{{ t.emergency_contact_no }}</td>
                            </tr>
                            <tr v-if="filteredTenants.length === 0">
                                <td colspan="10" class="text-center py-12 text-gray-400 font-medium">No tenants found matching your filter criteria.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- TABLE 2: TENANT, CONTRACT & LEASE DETAILS -->
            <div v-if="activeTab === 'tenant'" class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl" data-aos="fade-up" data-aos-delay="200">
                <div class="overflow-x-auto max-h-[500px] custom-scrollbar">
                    <table class="w-full text-left border-collapse whitespace-nowrap text-xs">
                        <thead>
                            <tr class="bg-gray-50/80 border-b border-gray-100 font-bold text-gray-400 uppercase tracking-wider text-[11px] sticky top-0 z-10">
                                <th class="py-3 px-4">Tenant Name</th>
                                <th class="py-3 px-4">Assigned Room</th>
                                <th class="py-3 px-4">Move-in Date</th>
                                <th class="py-3 px-4">Contract Expiration</th>
                                <th class="py-3 px-4">Duration</th>
                                <th class="py-3 px-4">Payment  Status</th>
                                <th class="py-3 px-4 text-center">Contract Document</th>
                                <th class="py-3 px-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            <tr v-for="t in filteredTenants" :key="t.id" class="hover:bg-emerald-50/40 transition-all duration-200 transform hover:scale-[1.005]">
                                <td class="py-3 px-4 font-bold text-gray-900">{{ t.fullname }}</td>
                                <td class="py-3 px-4 font-bold text-emerald-600">{{ t.unit_name || 'Unassigned' }}</td>
                                <td class="py-3 px-4 text-gray-600">{{ t.contract_start || t.start_date }}</td>
                                <td class="py-3 px-4 font-semibold text-rose-600">{{ t.contract_end || 'N/A' }}</td>
                                <td class="py-3 px-4 text-gray-600">{{ t.contract_months }} Mos</td>
                                <td class="py-3 px-4">
                                    <span :class="{
                                        'bg-emerald-100 text-emerald-700 border-emerald-200': getStatusBadge(t) === 'Paid' || getStatusBadge(t) === 'Fully Paid',
                                        'bg-amber-100 text-amber-700 border-amber-200': getStatusBadge(t) === 'Partial',
                                        'bg-rose-100 text-rose-700 border-rose-200': getStatusBadge(t) === 'Not Paid' || getStatusBadge(t) === 'Unpaid'
                                    }" class="px-2.5 py-1 rounded-full text-[10px] font-bold inline-block border shadow-xs transition-transform duration-300 hover:scale-105">
                                        {{ getStatusBadge(t) }}
                                    </span>
                                </td>
                                <td class="py-3 px-4 text-center">
                                    <button @click="openContractDocument(t)" class="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-105 cursor-pointer shadow-xs">
                                        <i class="fa-solid fa-file-lines mr-1"></i> View Contract
                                    </button>
                                </td>
                                <td class="py-3 px-4 text-center space-x-1">
                                    <button @click="openRenewModal(t)" class="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-105 cursor-pointer shadow-xs">
                                        <i class="fa-solid fa-file-pen mr-1"></i> Renew Contract
                                    </button>
                                    <button @click="deleteTenant(t.id)" class="px-2.5 py-1.5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl transition-all duration-300 hover:scale-110 cursor-pointer shadow-xs" title="Delete Tenant">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="filteredTenants.length === 0">
                                <td colspan="8" class="text-center py-12 text-gray-400 font-medium">No lease records found.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal Form for Registering Tenant -->
            <div v-if="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto transition-all duration-500">
                <div class="bg-white rounded-3xl max-w-3xl w-full p-8 space-y-5 my-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto custom-scrollbar transform transition-all duration-500 scale-100">
                    <div class="flex justify-between items-center border-b border-gray-100 pb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-base shadow-sm">
                                <i class="fa-solid fa-user-plus"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-black text-gray-900">Register Family Tenant</h3>
                                <p class="text-xs text-gray-400 font-medium">Fill in essential information and verified lease agreements</p>
                            </div>
                        </div>
                        <button @click="closeModal" class="w-9 h-9 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 flex items-center justify-center transition-all duration-300 cursor-pointer"><i class="fa-solid fa-xmark text-sm"></i></button>
                    </div>

                    <form @submit.prevent="submitTenant" class="space-y-5 text-sm">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block font-semibold text-gray-700 mb-1.5">Full Name</label>
                                <input type="text" v-model="form.fullname" required class="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-emerald-500 transition-all duration-300" placeholder="Juan Dela Cruz">
                            </div>
                            <div>
                                <label class="block font-semibold text-gray-700 mb-1.5">Contact Number</label>
                                <input type="text" v-model="form.contact_no" required maxlength="11" class="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-emerald-500 transition-all duration-300" placeholder="09123456789">
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label class="block font-semibold text-gray-700 mb-1.5">Birthdate (Ages 18-89)</label>
                                <input type="date" v-model="form.birthdate" required class="birthdate-picker w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-emerald-500 cursor-pointer transition-all duration-300">
                            </div>
                            <div>
                                <label class="block font-semibold text-gray-700 mb-1.5">Gender</label>
                                <select v-model="form.gender" class="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-emerald-500 transition-all duration-300">
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label class="block font-semibold text-gray-700 mb-1.5">Email Address</label>
                                <input type="email" v-model="form.email" required class="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-emerald-500 transition-all duration-300" placeholder="name@gmail.com">
                            </div>
                        </div>

                        <div>
                            <label class="block font-semibold text-gray-700 mb-1.5">Provincial / Permanent Address</label>
                            <input type="text" v-model="form.province_address" required class="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-emerald-500 transition-all duration-300" placeholder="Barangay, Municipality, Province">
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block font-semibold text-gray-700 mb-1.5">Valid ID Type</label>
                                <select v-model="form.valid_id_type" class="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-emerald-500 transition-all duration-300">
                                    <option value="PhilSys National ID">PhilSys National ID</option>
                                    <option value="UMID / SSS">UMID / SSS</option>
                                    <option value="Driver's License">Driver's License</option>
                                    <option value="Passport">Passport</option>
                                    <option value="TIN ID">TIN ID</option>
                                    <option value="PhilHealth ID">PhilHealth ID</option>
                                    <option value="Pag-IBIG ID">Pag-IBIG ID</option>
                                    <option value="PRC ID">PRC ID</option>
                                    <option value="Postal ID">Postal ID</option>
                                </select>
                            </div>
                            <div>
                                <label class="block font-semibold text-gray-700 mb-1.5">Valid ID Number</label>
                                <input type="text" v-model="form.valid_id_number" required class="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-emerald-500 transition-all duration-300" placeholder="ID Number">
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 shadow-inner">
                            <div>
                                <label class="block font-semibold text-gray-700 mb-1.5">Emergency Contact Name</label>
                                <input type="text" v-model="form.emergency_contact_name" required class="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-emerald-500 transition-all duration-300" placeholder="Name">
                            </div>
                            <div>
                                <label class="block font-semibold text-gray-700 mb-1.5">Emergency Contact Number</label>
                                <input type="text" v-model="form.emergency_contact_no" required maxlength="11" class="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-emerald-500 transition-all duration-300" placeholder="09xxxxxxxxx">
                            </div>
                        </div>

                        <!-- Household Members Section -->
                        <div class="pt-2 border-t border-gray-100">
                            <div class="flex justify-between items-center mb-3">
                                <div class="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <i class="fa-solid fa-users text-emerald-600"></i> Family Members (Age 1 - 100)
                                </div>
                                <button type="button" @click="addMember" class="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer flex items-center gap-1.5 shadow-xs">
                                    <i class="fa-solid fa-plus"></i> Add Member
                                </button>
                            </div>
                            
                            <div v-for="(member, index) in form.members" :key="index" class="flex flex-col sm:flex-row gap-2.5 items-center mb-3 bg-gray-50/60 p-3 rounded-2xl border border-gray-200/80 transition-all duration-300 hover:shadow-sm">
                                <input type="text" v-model="member.fullname" placeholder="Full Name" required class="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-all duration-300">
                                
                                <select v-model="member.relationship" required class="w-full sm:w-44 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer transition-all duration-300">
                                    <option disabled value="">Select Relationship</option>
                                    <option value="Wife">Wife</option>
                                    <option value="Husband">Husband</option>
                                    <option value="Minor Child">Minor Child (Below 18)</option>
                                    <option value="Adult Child">Adult Child (18+)</option>
                                    <option value="Father">Father</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Brother">Brother</option>
                                    <option value="Sister">Sister</option>
                                    <option value="Other Relative">Other Relative</option>
                                </select>

                                <input type="number" 
                                       v-model.number="member.member_age" 
                                       placeholder="Age (1-100)" 
                                       min="1" 
                                       max="100" 
                                       oninput="if(this.value > 100) this.value = 100; if(this.value < 1 && this.value !== '') this.value = 1;" 
                                       required 
                                       class="w-full sm:w-32 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-all duration-300">
                                <button type="button" @click="removeMember(index)" class="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer"><i class="fa-solid fa-trash text-xs"></i></button>
                            </div>
                        </div>

                        <!-- Contract & Lease Terms Setup -->
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                            <div>
                                <label class="block font-semibold text-gray-700 mb-1.5">Assign Room / Unit</label>
                                <select v-model="form.unit_id" required class="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-emerald-500 cursor-pointer transition-all duration-300">
                                    <option disabled value="">Select a Unit</option>
                                    <option v-for="unit in availableUnits" :value="unit.id">
                                        {{ unit.name }} (Rate: ₱{{ unit.rate }} | Min DP: ₱{{ unit.downpayment }})
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label class="block font-semibold text-gray-700 mb-1.5">Move-in Date (Start)</label>
                                <input type="date" v-model="form.start_date" required class="movein-picker w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-emerald-500 cursor-pointer transition-all duration-300">
                            </div>
                            <div>
                                <label class="block font-semibold text-gray-700 mb-1.5">Contract Duration</label>
                                <select v-model="form.contract_months" class="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-emerald-500 cursor-pointer transition-all duration-300">
                                    <option :value="3">3 Months</option>
                                    <option :value="6">6 Months</option>
                                    <option :value="12">1 Year</option>
                                </select>
                            </div>
                        </div>

                        <!-- Payment Type & Amount Section -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                            <div>
                                <label class="block font-semibold text-gray-700 mb-1.5">Payment Option</label>
                                <select v-model="form.payment_type" :disabled="!form.unit_id" class="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
                                    <option disabled value="">Select Payment Option</option>
                                    <option value="Downpayment">Downpayment (DP)</option>
                                    <option value="Full Payment">Full Payment</option>
                                </select>
                            </div>
                            <div>
                                <div class="flex justify-between items-center mb-1.5">
                                    <label class="block font-semibold text-gray-700">
                                        {{ form.payment_type === 'Full Payment' ? 'Full Payment Amount' : 'Downpayment Amount' }}
                                    </label>
                                    <span class="text-xs font-bold text-gray-500" v-if="form.unit_id">
                                        {{ form.payment_type === 'Full Payment' ? 'Required Rate:' : 'Required Min DP:' }} 
                                        <span class="text-emerald-600">₱{{ (form.payment_type === 'Full Payment' ? getSelectedUnitRate() : getSelectedUnitMinDp()).toLocaleString() }}</span>
                                    </span>
                                </div>
                                <input type="number" 
                                       v-model="form.downpayment_amount" 
                                       :disabled="!form.unit_id || !form.payment_type"
                                       required 
                                       maxlength="5"
                                       oninput="if(this.value.length > 5) this.value = this.value.slice(0, 5);"
                                       class="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300" 
                                       placeholder="0.00">
                                
                                <div class="mt-1.5 text-xs font-bold" v-if="form.unit_id && form.payment_type && form.downpayment_amount !== ''">
                                    <template v-if="form.payment_type === 'Full Payment'">
                                        <span v-if="parseFloat(form.downpayment_amount) < getSelectedUnitRate()" class="text-rose-500">
                                            <i class="fa-solid fa-triangle-exclamation mr-1"></i> [g] Status: Underpaid (Deficit of ₱{{ (getSelectedUnitRate() - parseFloat(form.downpayment_amount)).toLocaleString() }})
                                        </span>
                                        <span v-else-if="parseFloat(form.downpayment_amount) > getSelectedUnitRate()" class="text-rose-500">
                                            <i class="fa-solid fa-triangle-exclamation mr-1"></i> [g] Status: Overpayment Not Allowed for Full Payment (Excess of ₱{{ (parseFloat(form.downpayment_amount) - getSelectedUnitRate()).toLocaleString() }})
                                        </span>
                                        <span v-else class="text-emerald-600">
                                            <i class="fa-solid fa-circle-check mr-1"></i> [g] Status: Exact Full Payment Match
                                        </span>
                                    </template>
                                    <template v-else>
                                        <span v-if="parseFloat(form.downpayment_amount) < getSelectedUnitMinDp()" class="text-rose-500">
                                            <i class="fa-solid fa-triangle-exclamation mr-1"></i> [g] Status: Underpaid / Insufficient Downpayment (Deficit of ₱{{ (getSelectedUnitMinDp() - parseFloat(form.downpayment_amount)).toLocaleString() }})
                                        </span>
                                        <span v-else-if="parseFloat(form.downpayment_amount) > getSelectedUnitRate()" class="text-rose-500">
                                            <i class="fa-solid fa-triangle-exclamation mr-1"></i> [g] Status: Cannot Exceed Monthly Unit Rate (₱{{ getSelectedUnitRate().toLocaleString() }})
                                        </span>
                                        <span v-else-if="parseFloat(form.downpayment_amount) > getSelectedUnitMinDp()" class="text-emerald-600">
                                            <i class="fa-solid fa-circle-check mr-1"></i> [g] Status: Overpaid / Valid Downpayment (Excess of ₱{{ (parseFloat(form.downpayment_amount) - getSelectedUnitMinDp()).toLocaleString() }})
                                        </span>
                                        <span v-else class="text-emerald-600">
                                            <i class="fa-solid fa-circle-check mr-1"></i> [g] Status: Exact Downpayment Match
                                        </span>
                                    </template>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button type="button" @click="closeModal" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all duration-300 cursor-pointer">Cancel</button>
                            <button type="submit" class="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer">Review Contract & Save</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- CONTRACT DOCUMENT POPUP MODAL WITH TERMS CHECKBOX -->
            <div v-if="showContractModal" class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto transition-all duration-500">
                <div class="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 my-8 shadow-2xl relative text-gray-800 border border-gray-100 transform transition-all duration-500 scale-100">
                    <button @click="cancelContractReview" class="absolute top-6 right-6 w-9 h-9 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 flex items-center justify-center transition-all duration-300 cursor-pointer"><i class="fa-solid fa-xmark"></i></button>
                    
                    <div class="text-center border-b border-gray-100 pb-4">
                        <h2 class="text-xl font-black uppercase tracking-wider text-gray-900">RESIDENTIAL LEASE AGREEMENT REVIEW</h2>
                        <p class="text-xs text-gray-400 mt-1">Republic of the Philippines | Please review details before saving to database</p>
                    </div>

                    <div class="space-y-4 text-xs leading-relaxed text-justify max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        <div class="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 space-y-1.5 shadow-inner">
                            <p><strong>Tenant Name (LESSEE):</strong> {{ viewingContract.fullname }}</p>
                            <p><strong>Contact Number / Email:</strong> {{ viewingContract.contact_no }} / {{ viewingContract.email || 'N/A' }}</p>
                            <p><strong>Permanent Address:</strong> {{ viewingContract.province_address }}</p>
                            <p><strong>Assigned Room / Unit:</strong> <span class="text-emerald-600 font-bold">{{ viewingContract.unit_name }}</span></p>
                            <p><strong>Start Date / Duration:</strong> {{ viewingContract.start_date || viewingContract.contract_start }} ({{ viewingContract.contract_months }} Months)</p>
                            <p v-if="viewingContract.calculated_end_date"><strong>Calculated New Expiration:</strong> <span class="text-rose-600 font-bold">{{ viewingContract.calculated_end_date }}</span></p>
                            <p v-if="viewingContract.payment_type"><strong>Payment Option & Amount:</strong> <span class="font-bold text-emerald-600">{{ viewingContract.payment_type }} (₱{{ parseFloat(viewingContract.downpayment_amount || 0).toLocaleString() }})</span></p>
                        </div>
                        <p class="text-gray-500">
                            By checking the box below, you certify that all provided information is accurate and that the lessee agrees to all lease conditions, timely payments, and property maintenance regulations before final database registration.
                        </p>
                    </div>

                    <!-- Checkbox Confirmation inside Contract Modal -->
                    <div v-if="contractMode !== 'view'" class="flex items-center gap-2.5 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/60 shadow-xs">
                        <input type="checkbox" id="popupContractAgreed" v-model="viewingContractAgreed" class="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer">
                        <label for="popupContractAgreed" class="text-xs text-gray-700 font-semibold cursor-pointer select-none">
                            I have read and verified all contract terms and lease details. Proceed to save this record into the database.
                        </label>
                    </div>

                    <div class="flex justify-end gap-3 pt-2">
                        <button type="button" @click="cancelContractReview" :disabled="isSaving" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                            {{ contractMode === 'view' ? 'Close' : 'Back to Edit' }}
                        </button>
                        <button v-if="contractMode !== 'view'" type="button" @click="contractMode === 'renewal' ? confirmAndSaveRenewal() : confirmAndSaveTenant()" :disabled="!viewingContractAgreed || isSaving" class="px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-emerald-600 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                            {{ isSaving ? 'Saving...' : 'I Agree & Save to Database' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Renewal Modal -->
            <div v-if="showRenewModal" class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all duration-500">
                <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100 transform transition-all duration-500 scale-100">
                    <h3 class="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                        <i class="fa-solid fa-file-contract text-emerald-600"></i> Add New Contract (Renewal)
                    </h3>
                    <form @submit.prevent="prepareRenewalContractReview" class="space-y-4 text-sm">
                        <div>
                            <label class="block font-semibold text-gray-700 mb-1.5">New Contract Start Date</label>
                            <input type="date" v-model="renewalForm.start_date" required class="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 cursor-pointer transition-all duration-300">
                        </div>
                        <div>
                            <label class="block font-semibold text-gray-700 mb-1.5">Extension Duration</label>
                            <select v-model="renewalForm.contract_months" class="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 cursor-pointer transition-all duration-300">
                                <option :value="3">3 Months Extension</option>
                                <option :value="6">6 Months Extension</option>
                                <option :value="12">1 Year Extension</option>
                            </select>
                        </div>

                        <!-- Live Calculated Extension End Date -->
                        <div class="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-xs text-emerald-800 font-semibold">
                            <i class="fa-solid fa-calendar-check mr-1.5"></i> New Expiration Date: {{ calculatedRenewalEndDate }}
                        </div>

                        <div class="flex justify-end gap-2 pt-3 border-t border-gray-100">
                            <button type="button" @click="showRenewModal = false" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 font-bold rounded-xl cursor-pointer transition-all duration-300">Cancel</button>
                            <button type="submit" class="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl cursor-pointer shadow-md transition-all duration-300">Review New Contract</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            tenants: [],
            availableUnits: [],
            rentBalances: [],
            searchQuery: '',
            paymentFilter: 'All',
            activeTab: 'personal',
            showModal: false,
            showRenewModal: false,
            showContractModal: false,
            contractMode: 'register', // 'register' | 'renewal' | 'view'
            isSaving: false,
            selectedTenantForRenewal: {},
            viewingContract: {},
            viewingContractAgreed: false,
            form: createEmptyTenantForm(),
            renewalForm: { tenant_id: '', unit_id: '', start_date: '', contract_months: 6 }
        };
    },
    computed: {
        activeCount() {
            return this.tenants.filter(t => t.contract_status === 'Active' || !t.contract_status).length;
        },
        paidCount() {
            return this.tenants.filter(t => this.getStatusBadge(t) === 'Paid' || this.getStatusBadge(t) === 'Fully Paid').length;
        },
        filteredTenants() {
            return this.tenants.filter(t => {
                const searchLower = this.searchQuery.toLowerCase();
                const matchName = t.fullname.toLowerCase().includes(searchLower);
                let matchPayment = true;
                const badge = this.getStatusBadge(t);

                if (this.paymentFilter === 'Paid') {
                    matchPayment = badge === 'Paid' || badge === 'Fully Paid';
                } else if (this.paymentFilter === 'Partial') {
                    matchPayment = badge === 'Partial';
                } else if (this.paymentFilter === 'Not Paid') {
                    matchPayment = badge === 'Not Paid' || badge === 'Unpaid';
                }
                return matchName && matchPayment;
            });
        },
        calculatedRenewalEndDate() {
            if (!this.renewalForm.start_date) return 'N/A';
            const start = new Date(this.renewalForm.start_date);
            if (isNaN(start.getTime())) return 'N/A';
            start.setMonth(start.getMonth() + parseInt(this.renewalForm.contract_months || 0));
            return start.toISOString().split('T')[0];
        }
    },
    methods: {
        getStatusBadge(tenant) {
            // Unahin ang nakukuhang totoong status mula sa Rent Balance Tracker
            const balanceInfo = this.rentBalances.find(b => b.id == tenant.id || b.tenant_id == tenant.id);
            if (balanceInfo && balanceInfo.payment_status) {
                return balanceInfo.payment_status;
            }
            // Fallback sa tenant record property
            return tenant.downpayment_status || tenant.payment_status || 'Unpaid';
        },
        initFlatpickr() {
            this.$nextTick(() => {
                if (typeof flatpickr !== 'undefined') {
                    const today = new Date();
                    // Only init inputs that don't have a flatpickr yet (updated() runs on every keystroke)
                    const fresh = (sel) => Array.from(document.querySelectorAll(sel)).filter(el => !el._flatpickr);

                    const maxYearHead = today.getFullYear() - 18;
                    const minYearHead = today.getFullYear() - 89;
                    const maxDateHeadStr = `${maxYearHead}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                    const minDateHeadStr = `${minYearHead}-01-01`;

                    flatpickr(fresh(".birthdate-picker"), {
                        dateFormat: "Y-m-d",
                        altFormat: "F j, Y",
                        allowInput: true,
                        minDate: minDateHeadStr,
                        maxDate: maxDateHeadStr
                    });

                    // Move-in date: today or later only
                    flatpickr(fresh(".movein-picker"), {
                        dateFormat: "Y-m-d",
                        altFormat: "F j, Y",
                        allowInput: true,
                        minDate: "today"
                    });

                    flatpickr(fresh("input[type='date']:not(.birthdate-picker):not(.movein-picker)"), {
                        dateFormat: "Y-m-d",
                        altFormat: "F j, Y",
                        allowInput: true
                    });
                }
            });
        },
        async fetchTenants() {
            this.tenants = await TenantModel.getAll();
            if (typeof RentModel !== 'undefined' && RentModel.getTenantBalances) {
                this.rentBalances = await RentModel.getTenantBalances();
            }
        },
        async openModal() {
            try {
                this.availableUnits = await TenantModel.getAvailableUnits();
            } catch (err) {
                console.error('Failed to load units', err);
            }
            // NOTE: hindi na nire-reset dito ang form para di mawala ang data
            this.showModal = true;
            this.initFlatpickr();
        },
        // Explicit cancel / X lang ang nagbubura ng laman ng form
        closeModal() {
            this.showModal = false;
            this.resetForm();
        },
        resetForm() {
            this.form = createEmptyTenantForm();
        },
        addMember() {
            this.form.members.push({ fullname: '', relationship: '', member_age: '' });
        },
        removeMember(index) { this.form.members.splice(index, 1); },
        getSelectedUnitMinDp() {
            const unit = this.availableUnits.find(u => u.id == this.form.unit_id);
            return unit ? parseFloat(unit.downpayment) : 0;
        },
        getSelectedUnitRate() {
            const unit = this.availableUnits.find(u => u.id == this.form.unit_id);
            return unit ? parseFloat(unit.rate) : 0;
        },
        // Lahat ng validation ng Register form. Nagbabalik ng list ng errors (empty = valid)
        validateTenantForm() {
            const f = this.form;
            const errors = [];
            const phoneRegex = /^09\d{9}$/;
            const peso = (n) => '₱' + Number(n).toLocaleString();
            const unit = this.availableUnits.find(u => u.id == f.unit_id);

            if (!String(f.fullname || '').trim()) errors.push('Full Name is required.');

            if (!phoneRegex.test(String(f.contact_no || ''))) errors.push('Contact Number must be 11 digits and start with 09 (e.g. 09123456789).');
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(f.email || ''))) errors.push('Please enter a valid Email Address.');

            if (!f.birthdate) {
                errors.push('Birthdate is required.');
            } else {
                const b = new Date(f.birthdate);
                if (isNaN(b.getTime())) {
                    errors.push('Birthdate is invalid.');
                } else {
                    const t = new Date();
                    let age = t.getFullYear() - b.getFullYear();
                    const m = t.getMonth() - b.getMonth();
                    if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
                    if (age < 18 || age > 89) errors.push(`Head tenant must be 18 to 89 years old (computed age: ${age}).`);
                }
            }

            if (!String(f.province_address || '').trim()) errors.push('Provincial / Permanent Address is required.');
            if (!String(f.valid_id_number || '').trim()) errors.push('Valid ID Number is required.');
            if (!String(f.emergency_contact_name || '').trim()) errors.push('Emergency Contact Name is required.');
            if (!phoneRegex.test(String(f.emergency_contact_no || ''))) errors.push('Emergency Contact Number must be 11 digits and start with 09.');

            // Duplicate check laban sa existing tenants
            const sameContact = this.tenants.some(t => String(t.contact_no) === String(f.contact_no));
            if (sameContact) errors.push('This Contact Number is already registered to another tenant.');
            const sameEmail = f.email && this.tenants.some(t => t.email && String(t.email).toLowerCase() === String(f.email).toLowerCase());
            if (sameEmail) errors.push('This Email Address is already registered to another tenant.');
            const sameId = this.tenants.some(t => t.valid_id_type === f.valid_id_type && String(t.valid_id_number).toLowerCase() === String(f.valid_id_number).toLowerCase());
            if (sameId) errors.push('This Valid ID is already registered to another tenant.');

            // Family members
            f.members.forEach((m, i) => {
                const label = `Family Member #${i + 1}`;
                if (!String(m.fullname || '').trim()) errors.push(`${label}: Full Name is required.`);
                if (!m.relationship) errors.push(`${label}: Select a relationship.`);
                const age = Number(m.member_age);
                if (!m.member_age || isNaN(age) || age < 1 || age > 100) {
                    errors.push(`${label}: Age must be between 1 and 100.`);
                } else if (m.relationship === 'Minor Child' && age >= 18) {
                    errors.push(`${label}: A Minor Child must be below 18.`);
                } else if (m.relationship === 'Adult Child' && age < 18) {
                    errors.push(`${label}: An Adult Child must be 18 or above.`);
                }
            });

            // Unit, dates, payment
            if (!f.unit_id) errors.push('Please select a Room / Unit.');

            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            if (!f.start_date) errors.push('Move-in Date is required.');
            else if (f.start_date < todayStr) errors.push('Move-in Date cannot be in the past.');

            if (!f.payment_type) {
                errors.push('Please select a Payment Option.');
            } else if (unit) {
                const amt = parseFloat(f.downpayment_amount);
                const rate = this.getSelectedUnitRate();
                const minDp = this.getSelectedUnitMinDp();
                if (isNaN(amt) || amt <= 0) {
                    errors.push('Payment amount is required.');
                } else if (f.payment_type === 'Full Payment') {
                    if (amt < rate) errors.push(`Underpaid: Full Payment must be exactly ${peso(rate)} (deficit of ${peso(rate - amt)}).`);
                    else if (amt > rate) errors.push(`Overpayment not allowed for Full Payment: must be exactly ${peso(rate)} (excess of ${peso(amt - rate)}).`);
                } else {
                    if (amt < minDp) errors.push(`Insufficient Downpayment: minimum is ${peso(minDp)} (deficit of ${peso(minDp - amt)}).`);
                    else if (amt > rate) errors.push(`Downpayment cannot exceed the Monthly Unit Rate (${peso(rate)}).`);
                }
            }

            return errors;
        },
        async submitTenant() {
            // 1) May error? Swal muna, mananatili sa Register modal (buo ang data), HINDI pa lalabas ang contract
            const errors = this.validateTenantForm();
            if (errors.length) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Please fix the following',
                    html: '<div style="text-align:left;font-size:14px;line-height:1.6">' + errors.map(e => '• ' + e).join('<br>') + '</div>'
                });
                return;
            }

            const selectedUnit = this.availableUnits.find(u => u.id == this.form.unit_id);

            // 2) Existing controller check (kung meron pang ibang rules dun)
            let result;
            try {
                result = await TenantController.handleFormSubmit(this.form, selectedUnit, this.tenants);
            } catch (err) {
                console.error('Validation failed', err);
                await Swal.fire('Error', 'Something went wrong while validating the form. Please try again.', 'error');
                return;
            }
            // Ang controller ay pwedeng magbalik ng true/false O object ({ isValid, message })
            let passed = !!result;
            if (result && typeof result === 'object') {
                const flag = ['isValid', 'valid', 'success'].find(k => k in result);
                if (flag) passed = result[flag] === true;
                if (!passed && result.message) await Swal.fire('Validation Error', result.message, 'error');
            }
            if (!passed) return;

            // 3) Valid na -> saka pa lang lalabas ang contract para i-check
            this.viewingContract = {
                ...JSON.parse(JSON.stringify(this.form)),
                unit_name: selectedUnit ? selectedUnit.name : ''
            };
            this.viewingContractAgreed = false;
            this.contractMode = 'register';
            this.showModal = false;
            this.showContractModal = true;
        },
        async confirmAndSaveTenant() {
            if (this.isSaving) return;
            if (!this.viewingContractAgreed) {
                Swal.fire('Agreement Required', 'You must check the confirmation box regarding the contract details before saving.', 'warning');
                return;
            }

            this.isSaving = true;
            let res;
            try {
                const formData = new FormData();
                for (let key in this.form) {
                    if (key === 'members') {
                        formData.append('members', JSON.stringify(this.form.members));
                    } else {
                        formData.append(key, this.form[key]);
                    }
                }
                res = await TenantModel.save(formData);
            } catch (err) {
                console.error('Save tenant failed', err);
            }
            this.isSaving = false;

            // If the model returns nothing (server error / empty response), still show a message
            if (!res) {
                res = { success: false, message: 'The server did not return a valid response. Please try again, or check API/tenant.php for errors.' };
            }

            if (res.success) {
                // Success -> isara lahat, linisin ang form, i-refresh ang table
                this.showContractModal = false;
                this.viewingContractAgreed = false;
                this.resetForm();
                this.fetchTenants();
                Swal.fire('Successfully Registered!', res.message, 'success');
            } else {
                // Error -> Swal muna, tapos balik sa Register form na buo pa ang data
                await Swal.fire('Registration Failed', res.message, 'error');
                this.cancelContractReview();
            }
        },
        // Balik sa form (register / renewal) nang hindi nawawala ang data. Close lang kapag view-only.
        cancelContractReview() {
            const mode = this.contractMode;
            this.showContractModal = false;
            this.viewingContractAgreed = false;
            if (mode === 'register') {
                this.showModal = true;
                this.initFlatpickr();
            } else if (mode === 'renewal') {
                this.showRenewModal = true;
                this.initFlatpickr();
            }
        },
        openContractDocument(tenant) {
            this.contractMode = 'view';
            this.viewingContract = tenant;
            this.viewingContractAgreed = true;
            this.showContractModal = true;
        },
        async openRenewModal(tenant) {
            const balances = await RentModel.getTenantBalances();
            const tenantBalanceInfo = balances.find(b => b.id == tenant.id);
            if (tenantBalanceInfo && tenantBalanceInfo.remaining_balance > 0) {
                Swal.fire(
                    'Bawal Mag-extend!',
                    `Hindi pa fully paid si ${tenant.fullname}. May natitira pang balanse na ₱${parseFloat(tenantBalanceInfo.remaining_balance).toLocaleString()}. Kailangan munang maging Fully Paid bago makapag-extend ng bagong kontrata.`,
                    'warning'
                );
                return;
            }

            this.selectedTenantForRenewal = tenant;
            this.renewalForm.tenant_id = tenant.id;
            this.renewalForm.unit_id = tenant.unit_id;
            this.renewalForm.start_date = new Date().toISOString().split('T')[0];
            this.renewalForm.contract_months = 6;
            this.showRenewModal = true;
            this.initFlatpickr();
        },
        prepareRenewalContractReview() {
            const renewCheck = TenantController.validateRenewal(this.renewalForm, this.selectedTenantForRenewal);
            if (!renewCheck.isValid) {
                Swal.fire('Renewal Error', renewCheck.message, 'warning');
                return;
            }

            this.showRenewModal = false;
            this.contractMode = 'renewal';
            this.viewingContract = {
                fullname: this.selectedTenantForRenewal.fullname,
                contact_no: this.selectedTenantForRenewal.contact_no,
                email: this.selectedTenantForRenewal.email,
                province_address: this.selectedTenantForRenewal.province_address,
                unit_name: this.selectedTenantForRenewal.unit_name,
                start_date: this.renewalForm.start_date,
                contract_months: this.renewalForm.contract_months,
                calculated_end_date: this.calculatedRenewalEndDate
            };
            this.viewingContractAgreed = false;
            this.showContractModal = true;
        },
        async confirmAndSaveRenewal() {
            if (this.isSaving) return;
            if (!this.viewingContractAgreed) {
                Swal.fire('Agreement Required', 'You must check the confirmation box regarding the contract details before saving.', 'warning');
                return;
            }

            this.isSaving = true;
            let res;
            try {
                const formData = new FormData();
                for (let key in this.renewalForm) formData.append(key, this.renewalForm[key]);
                res = await TenantModel.renewContract(formData);
            } catch (err) {
                console.error('Renew contract failed', err);
            }
            this.isSaving = false;

            if (!res) {
                res = { success: false, message: 'The server did not return a valid response. Please try again.' };
            }

            if (res.success) {
                this.showContractModal = false;
                this.viewingContractAgreed = false;
                this.fetchTenants();
                Swal.fire('Success!', res.message, 'success');
            } else {
                // Error -> Swal muna, tapos balik sa Renewal form na buo pa ang data
                await Swal.fire('Error!', res.message, 'error');
                this.cancelContractReview();
            }
        },
        async deleteTenant(id) {
            const confirm = await Swal.fire({
                title: 'Are you sure?',
                text: "This will delete the tenant record and contract history, but finance records will be safely retained.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#f43f5e',
                confirmButtonText: 'Yes, delete it!'
            });
            if (confirm.isConfirmed) {
                const res = await TenantModel.delete(id);
                if (res.success) {
                    Swal.fire('Deleted!', res.message, 'success');
                    this.fetchTenants();
                } else {
                    Swal.fire('Error!', res.message, 'error');
                }
            }
        }
    },
    mounted() {
        this.fetchTenants();
        this.initFlatpickr();
    },
    updated() {
        this.initFlatpickr();
    }
};

// Fresh copy of the registration form (used on first load and after a successful save / explicit cancel)
const createEmptyTenantForm = () => ({
    fullname: '',
    birthdate: '',
    gender: 'Male',
    contact_no: '',
    email: '',
    province_address: '',
    valid_id_type: 'PhilSys National ID',
    valid_id_number: '',
    emergency_contact_name: '',
    emergency_contact_no: '',
    unit_id: '',
    start_date: '',
    contract_months: 6,
    payment_type: '',
    downpayment_amount: '',
    members: []
});