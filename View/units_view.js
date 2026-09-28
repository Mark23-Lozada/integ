const Units = {
    template: `
        <div class="space-y-6 min-h-full pb-10 transition-all duration-500 ease-out">
            <!-- Header & Action Button -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 transform transition-all duration-500 hover:translate-x-1">
                <div>
                    <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight transition-colors duration-300 hover:text-emerald-800 flex items-center gap-3">
                        <span class="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl text-xl shadow-inner border border-emerald-100/50">
                            <i class="fa-solid fa-door-open"></i>
                        </span>
                        Units & Rooms Management
                    </h1>
                    <p class="text-sm text-gray-500 font-medium mt-1">Manage your boarding house rooms, bedspaces, and view unit photo galleries seamlessly.</p>
                </div>
                <button @click="openAddModal" class="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 cursor-pointer group">
                    <i class="fa-solid fa-plus group-hover:rotate-90 transition-transform duration-300"></i> Add New Unit/Room
                </button>
            </div>
            <hr class="border-gray-100 transition-all duration-500 hover:border-emerald-500/50">

            <!-- Dashboard Layout: 50-50 Split -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
                <!-- Left: 50% - Total Rooms + Occupancy Breakdown -->
                <div class="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-emerald-950/10 transition-all duration-500 transform hover:-translate-y-1.5 flex flex-col justify-between group border border-gray-100 relative overflow-hidden">
                    <!-- Decorative Blur Background Glow -->
                    <div class="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                    
                    <div>
                        <div class="flex items-center justify-between relative z-10">
                            <div>
                                <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wider transition-all duration-300 group-hover:text-emerald-700">TOTAL ROOMS / UNITS</p>
                                <h3 class="text-4xl font-extrabold text-gray-900 mt-2 tracking-tight transition-transform duration-300 group-hover:scale-[1.02] origin-left">{{ units.length }}</h3>
                            </div>
                            <span class="px-3.5 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full border border-emerald-200/60 shadow-sm flex items-center gap-1.5 transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-105">
                                <i class="fa-solid fa-door-closed"></i> Active Pool
                            </span>
                        </div>

                        <!-- Occupancy Progress at Breakdown -->
                        <div class="mt-5 bg-gray-50/80 p-4 rounded-xl border border-gray-100 backdrop-blur-sm relative z-10 transition-all duration-300 group-hover:bg-emerald-50/30 group-hover:border-emerald-200/50 space-y-3">
                            <div class="flex justify-between text-xs font-bold">
                                <span class="text-gray-600">Occupancy Rate</span>
                                <span class="text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/50">{{ occupancyPercentage }}% Full</span>
                            </div>
                            <!-- Progress Bar -->
                            <div class="w-full bg-gray-200/80 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
                                <div class="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-1000 ease-out shadow-sm" :style="{ width: occupancyPercentage + '%' }"></div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium relative z-10">
                        <span class="flex items-center gap-1.5"><i class="fa-solid fa-chart-pie text-emerald-600"></i> Pangkalahatang estadistika ng mga silid.</span>
                        <span class="text-gray-900 font-bold">Real-time update</span>
                    </div>
                </div>

                <!-- Right: 50% - 3 Stacked Cards (Available, Occupied, Unavailable) -->
                <div class="flex flex-col gap-3 justify-between">
                    <!-- Available Rooms Box -->
                    <div class="bg-gradient-to-br from-emerald-50/50 to-white border border-emerald-100/80 px-5 py-4 rounded-2xl shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-between group">
                        <div>
                            <p class="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider group-hover:text-emerald-700 transition-colors">AVAILABLE</p>
                            <h3 class="text-xl font-bold text-gray-900 mt-0.5 group-hover:text-emerald-600 transition-colors">{{ availableCount }}</h3>
                        </div>
                        <span class="p-3 bg-emerald-500/10 text-emerald-600 text-sm font-semibold rounded-xl shadow-xs transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-6">
                            <i class="fa-solid fa-bed"></i>
                        </span>
                    </div>

                    <!-- Occupied Units Box -->
                    <div class="bg-gradient-to-br from-amber-50/50 to-white border border-amber-200/80 px-5 py-4 rounded-2xl shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-between group">
                        <div>
                            <p class="text-[11px] font-semibold text-amber-900 uppercase tracking-wider group-hover:text-amber-700 transition-colors">OCCUPIED</p>
                            <h3 class="text-xl font-bold text-gray-900 mt-0.5 group-hover:text-amber-600 transition-colors">{{ occupiedCount }}</h3>
                        </div>
                        <span class="p-3 bg-amber-500/10 text-amber-600 text-sm font-semibold rounded-xl shadow-xs transition-all duration-300 group-hover:bg-amber-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-6">
                            <i class="fa-solid fa-users"></i>
                        </span>
                    </div>

                    <!-- Unavailable Rooms Box -->
                    <div class="bg-gradient-to-br from-rose-50/50 to-white border border-rose-100/80 px-5 py-4 rounded-2xl shadow-sm hover:shadow-xl hover:border-rose-300 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-between group">
                        <div>
                            <p class="text-[11px] font-semibold text-rose-900 uppercase tracking-wider group-hover:text-rose-700 transition-colors">UNAVAILABLE</p>
                            <h3 class="text-xl font-bold text-gray-900 mt-0.5 group-hover:text-rose-600 transition-colors">{{ unavailableCount }}</h3>
                        </div>
                        <span class="p-3 bg-rose-500/10 text-rose-600 text-sm font-semibold rounded-xl shadow-xs transition-all duration-300 group-hover:bg-rose-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-6">
                            <i class="fa-solid fa-ban"></i>
                        </span>
                    </div>
                </div>
            </div>

            <!-- Filter Tabs & Search / Type Filters -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-100 p-4 rounded-2xl shadow-xl">
                <!-- Tabs -->
                <div class="bg-gray-100/80 border border-gray-200/60 p-1 rounded-xl flex items-center gap-1 shadow-inner overflow-x-auto">
                    <button @click="currentTab = 'all'" :class="currentTab === 'all' ? 'bg-emerald-500 text-white font-bold shadow-md scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'" class="px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer shrink-0">
                        All Units 
                    </button>
                    <button @click="currentTab = 'available'" :class="currentTab === 'available' ? 'bg-emerald-500 text-white font-bold shadow-md scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'" class="px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer shrink-0">
                        Available 
                    </button>
                    <button @click="currentTab = 'occupied'" :class="currentTab === 'occupied' ? 'bg-emerald-500 text-white font-bold shadow-md scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'" class="px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer shrink-0">
                        Occupied
                    </button>
                    <button @click="currentTab = 'unavailable'" :class="currentTab === 'unavailable' ? 'bg-emerald-500 text-white font-bold shadow-md scale-105' : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'" class="px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer shrink-0">
                        Unavailable
                    </button>
                </div>

                <!-- Search and Type Filter Controls -->
                <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <!-- Search Input -->
                    <div class="relative w-full sm:w-64">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                            <i class="fa-solid fa-magnifying-glass text-xs"></i>
                        </span>
                        <input v-model="searchQuery" type="text" placeholder="Search room name..." class="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium bg-gray-50/50 transition-all duration-300" />
                    </div>

                    <!-- Type Dropdown Filter -->
                    <div class="w-full sm:w-auto">
                        <select v-model="selectedType" class="w-full sm:w-auto px-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium bg-gray-50/50 cursor-pointer transition-all duration-300">
                            <option value="">All Types</option>
                            <option value="Standard Room">Standard Room</option>
                            <option value="Bedspace">Bedspace</option>
                            <option value="Partition Room">Partition Room</option>
                            <option value="Studio Apartment">Studio Apartment</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Units Grid View with Transition Group -->
            <transition-group name="unit-list" tag="div" v-if="filteredUnits.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div v-for="unit in filteredUnits" :key="unit.id" class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-emerald-950/10 transition-all duration-500 transform hover:-translate-y-1.5 flex flex-col justify-between group">
                    <div>
                        <div class="relative h-48 w-full bg-gray-100 overflow-hidden cursor-pointer" @click="openGallery(unit)">
                            <img :src="unit.image || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'" alt="Unit Image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <span class="text-white text-xs font-semibold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20 shadow-lg transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                                    <i class="fa-solid fa-images text-emerald-400"></i> View Photos (Room, Kitchen, Dining)
                                </span>
                            </div>
                        </div>

                        <div class="p-5 pb-2">
                            <div class="flex items-start justify-between gap-2 mb-2">
                                <div>
                                    <span class="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 tracking-wider border border-emerald-200/50 shadow-xs">{{ unit.type }}</span>
                                    <h3 class="text-base font-bold text-gray-900 mt-1.5 group-hover:text-emerald-700 transition-colors duration-300">{{ unit.name }}</h3>
                                </div>
                                <span :class="unit.status === 'Unavailable' ? 'bg-rose-50 text-rose-600 border-rose-200/60' : (unit.isOccupied ? 'bg-amber-50 text-amber-600 border-amber-200/60' : 'bg-emerald-50 text-emerald-600 border-emerald-200/60')" class="px-2.5 py-1 text-[10px] font-semibold rounded-full border flex items-center gap-1.5 shadow-xs">
                                    <span :class="unit.status === 'Unavailable' ? 'bg-rose-500' : (unit.isOccupied ? 'bg-amber-500' : 'bg-emerald-500')" class="w-1.5 h-1.5 rounded-full animate-ping"></span>
                                    {{ unit.status }}
                                </span>
                            </div>
                            
                            <p class="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{{ unit.description || 'Standard boarding house room equipped with basic utilities.' }}</p>

                            <div class="space-y-2 py-3 border-t border-b border-gray-100 text-xs bg-gray-50/50 -mx-5 px-5">
                                <div class="flex justify-between text-gray-600">
                                    <span class="font-medium text-gray-400">Monthly Rate:</span>
                                    <span class="font-bold text-gray-900 text-sm">₱{{ formatMoney(unit.rate) }}</span>
                                </div>
                                <div class="flex justify-between text-gray-600">
                                    <span class="font-medium text-gray-400">Downpayment:</span>
                                    <span class="font-bold text-emerald-600 text-sm">₱{{ formatMoney(unit.downpayment) }}</span>
                                </div>
                                <div class="flex justify-between text-gray-600">
                                    <span class="font-medium text-gray-400">Tenant Assigned:</span>
                                    <span class="font-semibold text-gray-800 bg-white px-2 py-0.5 rounded-md border border-gray-100 shadow-2xs">{{ unit.tenantName || 'None' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center justify-between px-5 pb-5 pt-3">
                        <div class="flex items-center gap-2">
                            <button @click="openGallery(unit)" class="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-emerald-500 hover:text-white rounded-xl transition-all duration-300 cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95">
                                <i class="fa-solid fa-eye"></i> Gallery
                            </button>
                            <button v-if="!unit.isOccupied" @click="openEditModal(unit)" class="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-300 cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95">
                                <i class="fa-solid fa-pen-to-square"></i> Edit
                            </button>
                        </div>
                        <button @click="deleteUnit(unit)" :class="unit.isOccupied ? 'opacity-40 cursor-not-allowed text-gray-400 bg-transparent' : 'text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white shadow-xs active:scale-95'" class="px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer flex items-center gap-1">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </transition-group>

            <!-- Empty State -->
            <div v-if="filteredUnits.length === 0" class="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-xl animate-fade-in">
                <div class="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner border border-emerald-100">
                    <i class="fa-solid fa-house-chimney"></i>
                </div>
                <h3 class="text-sm font-bold text-gray-800">No Units Found</h3>
                <p class="text-xs text-gray-400 mt-1 mb-4">Walang nakitang unit na tugma sa iyong hinahanap o filter.</p>
                <button @click="openAddModal" class="px-4 py-2 bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md hover:bg-emerald-600 hover:scale-105 transition-all cursor-pointer">
                    Add Your First Room
                </button>
            </div>

            <!-- Add / Edit Modal Form -->
            <transition name="modal-fade">
                <div v-if="showAddModal" class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div class="bg-white border border-gray-100 rounded-2xl max-w-3xl w-full shadow-2xl flex flex-col my-auto max-h-[90vh]">
                        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0 bg-gray-50/50 rounded-t-2xl">
                            <div>
                                <h3 class="text-base font-bold text-gray-900 tracking-tight">{{ isEditing ? 'Edit Unit / Room' : 'Add New Boarding House Unit' }}</h3>
                                <p class="text-xs text-gray-500 mt-0.5">Fill in details and upload room photos (Max Rent: ₱50k, Max DP: ₱5k).</p>
                            </div>
                            <button @click="closeModal" class="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all duration-300 cursor-pointer shadow-xs">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div class="px-6 py-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
                            <form @submit.prevent="validateAndSave" class="space-y-5">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Room / Unit Name / No.</label>
                                        <input v-model="form.name" type="text" required placeholder="e.g. Room 101" class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium bg-gray-50/50 transition-all duration-300" />
                                    </div>

                                    <div>
                                        <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Type</label>
                                        <select v-model="form.type" class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium bg-gray-50/50 cursor-pointer transition-all duration-300">
                                            <option value="Standard Room">Standard Room</option>
                                            <option value="Bedspace">Bedspace</option>
                                            <option value="Partition Room">Partition Room</option>
                                            <option value="Studio Apartment">Studio Apartment</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Monthly Rent Rate (₱)</label>
                                        <input v-model.number="form.rate" type="number" min="0" max="50000" maxlength="5" @input="limitInputLength('rate', 5)" required placeholder="e.g. 3500" class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium bg-gray-50/50 transition-all duration-300" />
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Downpayment (₱)</label>
                                        <input v-model.number="form.downpayment" type="number" min="0" max="5000" maxlength="5" @input="limitInputLength('downpayment', 5)" required placeholder="e.g. 1000" class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium bg-gray-50/50 transition-all duration-300" />
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Unit Status</label>
                                        <select v-model="form.status" class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium bg-gray-50/50 cursor-pointer transition-all duration-300">
                                            <option value="Available">Available</option>
                                            <option value="Unavailable">Unavailable</option>
                                        </select>
                                    </div>
                                </div>

                                <!-- Image Upload Section -->
                                <div class="space-y-3 pt-2 border-t border-gray-100">
                                    <h4 class="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                        <i class="fa-solid fa-camera text-emerald-600"></i> Unit Photos
                                    </h4>
                                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <!-- Main Room -->
                                        <div>
                                            <label class="block text-xs font-semibold text-gray-700 mb-1">Main Room</label>
                                            <div @dragover.prevent @drop.prevent="handleDrop($event, 'image')" class="relative border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-xl text-center bg-gray-50/50 hover:bg-emerald-50/30 transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center h-32 overflow-hidden shadow-inner">
                                                <input type="file" @change="handleFileChange($event, 'image')" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10">
                                                <div v-if="!form.image" class="space-y-1 p-3 group-hover:scale-105 transition-transform">
                                                    <i class="fa-solid fa-cloud-arrow-up text-gray-400 group-hover:text-emerald-500 text-xl transition-colors"></i>
                                                    <p class="text-[10px] text-gray-500 font-medium">Drop image or click</p>
                                                </div>
                                                <template v-else>
                                                    <img :src="form.image" class="absolute inset-0 w-full h-full object-cover">
                                                    <button type="button" @click.stop="form.image = ''; rawFiles.image = null;" class="absolute top-2 right-2 z-20 w-6 h-6 bg-black/70 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-xs transition-colors shadow-md cursor-pointer">
                                                        <i class="fa-solid fa-xmark"></i>
                                                    </button>
                                                </template>
                                            </div>
                                        </div>

                                        <!-- Kitchen Area -->
                                        <div>
                                            <label class="block text-xs font-semibold text-gray-700 mb-1">Kitchen Area</label>
                                            <div @dragover.prevent @drop.prevent="handleDrop($event, 'kitchenImage')" class="relative border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-xl text-center bg-gray-50/50 hover:bg-emerald-50/30 transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center h-32 overflow-hidden shadow-inner">
                                                <input type="file" @change="handleFileChange($event, 'kitchenImage')" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10">
                                                <div v-if="!form.kitchenImage" class="space-y-1 p-3 group-hover:scale-105 transition-transform">
                                                    <i class="fa-solid fa-cloud-arrow-up text-gray-400 group-hover:text-emerald-500 text-xl transition-colors"></i>
                                                    <p class="text-[10px] text-gray-500 font-medium">Drop image or click</p>
                                                </div>
                                                <template v-else>
                                                    <img :src="form.kitchenImage" class="absolute inset-0 w-full h-full object-cover">
                                                    <button type="button" @click.stop="form.kitchenImage = ''; rawFiles.kitchenImage = null;" class="absolute top-2 right-2 z-20 w-6 h-6 bg-black/70 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-xs transition-colors shadow-md cursor-pointer">
                                                        <i class="fa-solid fa-xmark"></i>
                                                    </button>
                                                </template>
                                            </div>
                                        </div>

                                        <!-- Dining Area -->
                                        <div>
                                            <label class="block text-xs font-semibold text-gray-700 mb-1">Dining Area</label>
                                            <div @dragover.prevent @drop.prevent="handleDrop($event, 'diningImage')" class="relative border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-xl text-center bg-gray-50/50 hover:bg-emerald-50/30 transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center h-32 overflow-hidden shadow-inner">
                                                <input type="file" @change="handleFileChange($event, 'diningImage')" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10">
                                                <div v-if="!form.diningImage" class="space-y-1 p-3 group-hover:scale-105 transition-transform">
                                                    <i class="fa-solid fa-cloud-arrow-up text-gray-400 group-hover:text-emerald-500 text-xl transition-colors"></i>
                                                    <p class="text-[10px] text-gray-500 font-medium">Drop image or click</p>
                                                </div>
                                                <template v-else>
                                                    <img :src="form.diningImage" class="absolute inset-0 w-full h-full object-cover">
                                                    <button type="button" @click.stop="form.diningImage = ''; rawFiles.diningImage = null;" class="absolute top-2 right-2 z-20 w-6 h-6 bg-black/70 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-xs transition-colors shadow-md cursor-pointer">
                                                        <i class="fa-solid fa-xmark"></i>
                                                    </button>
                                                </template>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Description / Inclusions</label>
                                    <textarea v-model="form.description" rows="2" placeholder="e.g. Includes water & electric sub-meter" class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium bg-gray-50/50 transition-all duration-300"></textarea>
                                </div>
                            </form>
                        </div>

                        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl shrink-0">
                            <button type="button" @click="closeModal" class="px-5 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors cursor-pointer">Cancel</button>
                            <button type="button" @click="validateAndSave" class="px-6 py-2.5 text-xs font-semibold bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-95">{{ isEditing ? 'Update Changes' : 'Save Unit' }}</button>
                        </div>
                    </div>
                </div>
            </transition>

            <!-- Gallery Modal -->
            <transition name="modal-fade">
                <div v-if="showGalleryModal" class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden">
                    <div class="bg-white border border-gray-100 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh]">
                        <div class="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 shrink-0">
                            <div>
                                <h3 class="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                    <i class="fa-solid fa-images text-emerald-600"></i> {{ activeUnitGallery.name }} - Photo Gallery
                                </h3>
                                <p class="text-xs text-gray-400 mt-0.5">Kitchen, Dining, and Room overview</p>
                            </div>
                            <button @click="showGalleryModal = false" class="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-rose-50 hover:text-rose-500 transition-all cursor-pointer shadow-xs">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                            <div class="space-y-1.5 group">
                                <span class="text-xs font-semibold text-gray-700 flex items-center gap-1.5"><i class="fa-solid fa-bed text-emerald-600"></i> Main Room / Bedspace</span>
                                <div class="h-40 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm relative group">
                                    <img :src="activeUnitGallery.image || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                                </div>
                            </div>
                            <div class="space-y-1.5 group">
                                <span class="text-xs font-semibold text-gray-700 flex items-center gap-1.5"><i class="fa-solid fa-utensils text-emerald-600"></i> Kitchen Area</span>
                                <div class="h-40 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm relative group">
                                    <img :src="activeUnitGallery.kitchenImage || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                                </div>
                            </div>
                            <div class="space-y-1.5 sm:col-span-2 group">
                                <span class="text-xs font-semibold text-gray-700 flex items-center gap-1.5"><i class="fa-solid fa-chair text-emerald-600"></i> Dining Area</span>
                                <div class="h-44 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm relative group">
                                    <img :src="activeUnitGallery.diningImage || 'https://images.unsplash.com/photo-1617806118233-18e1c0c9aa23?auto=format&fit=crop&w=800&q=80'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end pt-4 mt-4 border-t border-gray-100 shrink-0">
                            <button @click="showGalleryModal = false" class="px-5 py-2 text-xs font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all cursor-pointer shadow-md active:scale-95">Close Gallery</button>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    `,
    data() {
        return {
            units: [],
            currentTab: 'all',
            searchQuery: '',
            selectedType: '',
            showAddModal: false,
            showGalleryModal: false,
            isEditing: false,
            activeUnitId: null,
            activeUnitGallery: {},
            form: {
                name: '',
                type: 'Standard Room',
                rate: '',
                downpayment: '',
                image: '',
                kitchenImage: '',
                diningImage: '',
                description: '',
                status: 'Available',
                isOccupied: false,
                tenantName: ''
            },
            rawFiles: {
                image: null,
                kitchenImage: null,
                diningImage: null
            }
        };
    },
    computed: {
        occupiedCount() {
            return this.units ? this.units.filter(u => u.isOccupied).length : 0;
        },
        availableCount() {
            return this.units ? this.units.filter(u => !u.isOccupied && u.status !== 'Unavailable').length : 0;
        },
        unavailableCount() {
            return this.units ? this.units.filter(u => u.status === 'Unavailable').length : 0;
        },
        occupancyPercentage() {
            if (!this.units || this.units.length === 0) return 0;
            return Math.round((this.occupiedCount / this.units.length) * 100);
        },
        filteredUnits() {
            if (!this.units) return [];

            let result = this.units;

            if (this.currentTab === 'available') {
                result = result.filter(u => !u.isOccupied && u.status !== 'Unavailable');
            } else if (this.currentTab === 'occupied') {
                result = result.filter(u => u.isOccupied);
            } else if (this.currentTab === 'unavailable') {
                result = result.filter(u => u.status === 'Unavailable');
            }

            if (this.selectedType) {
                result = result.filter(u => u.type === this.selectedType);
            }

            if (this.searchQuery.trim() !== '') {
                const query = this.searchQuery.toLowerCase();
                result = result.filter(u => u.name && u.name.toLowerCase().includes(query));
            }

            return result;
        }
    },
    methods: {
        limitInputLength(field, maxLength) {
            if (this.form[field] !== null && this.form[field] !== undefined) {
                let valStr = String(this.form[field]);
                if (valStr.length > maxLength) {
                    this.form[field] = Number(valStr.slice(0, maxLength));
                }
            }
        },
        formatMoney(value) {
            return Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        },
        async loadUnits() {
            this.units = await UnitsController.loadUnits();
        },
        openAddModal() {
            this.isEditing = false;
            this.activeUnitId = null;
            this.form = {
                name: '',
                type: 'Standard Room',
                rate: '',
                downpayment: '',
                image: '',
                kitchenImage: '',
                diningImage: '',
                description: '',
                status: 'Available',
                isOccupied: false,
                tenantName: ''
            };
            this.rawFiles = { image: null, kitchenImage: null, diningImage: null };
            this.showAddModal = true;
            document.body.style.overflow = 'hidden';
        },
        openEditModal(unit) {
            this.isEditing = true;
            this.activeUnitId = unit.id;
            this.form = {
                name: unit.name,
                type: unit.type,
                rate: unit.rate,
                downpayment: unit.downpayment || 0,
                image: unit.image || '',
                kitchenImage: unit.kitchenImage || '',
                diningImage: unit.diningImage || '',
                description: unit.description || '',
                status: unit.status || 'Available',
                isOccupied: unit.isOccupied || false,
                tenantName: unit.tenantName || ''
            };
            this.rawFiles = { image: null, kitchenImage: null, diningImage: null };
            this.showAddModal = true;
            document.body.style.overflow = 'hidden';
        },
        closeModal() {
            this.showAddModal = false;
            document.body.style.overflow = 'auto';
        },
        async validateAndSave() {
            const result = await UnitsController.saveUnit(this.isEditing, this.activeUnitId, this.form, this.rawFiles, this.units);

            if (!result.success) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: result.message,
                    confirmButtonColor: '#10b981'
                });
                return;
            }

            this.units = result.units;
            this.closeModal();

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: this.isEditing ? 'Unit updated successfully.' : 'New unit added successfully.',
                timer: 1500,
                showConfirmButton: false
            });
        },
        async deleteUnit(unit) {
            if (unit.isOccupied) {
                Swal.fire({
                    icon: 'error',
                    title: 'Bawal Idelete',
                    text: 'Hindi maaaring idelete ang unit na ito dahil kasalukuyan itong occupied.',
                    confirmButtonColor: '#10b981'
                });
                return;
            }

            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#9ca3af',
                confirmButtonText: 'Yes, delete it!'
            }).then(async(result) => {
                if (result.isConfirmed) {
                    const res = await UnitsController.deleteUnit(unit);
                    if (!res.success) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops!',
                            text: res.message,
                            confirmButtonColor: '#10b981'
                        });
                        return;
                    }

                    this.units = res.units;
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'The unit has been deleted.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            });
        },
        openGallery(unit) {
            this.activeUnitGallery = unit;
            this.showGalleryModal = true;
            document.body.style.overflow = 'hidden';
        },
        handleFileChange(event, fieldName) {
            UnitsController.handleFileChange(event, fieldName, this.form, this.rawFiles);
        },
        handleDrop(event, fieldName) {
            UnitsController.handleDrop(event, fieldName, this.form, this.rawFiles);
        }
    },
    mounted() {
        this.loadUnits();
    }
};