// DOM Elements
const carForm = document.getElementById('car-form');
const maintenanceForm = document.getElementById('maintenance-form');
const carSelect = document.getElementById('carSelect');
const notification = document.getElementById('notification');
const carsTableBody = document.getElementById('cars-tbody');
const maintenanceTableBody = document.getElementById('maintenance-tbody');

// Search and filter elements
const carSearch = document.getElementById('car-search');
const carSort = document.getElementById('car-sort');
const maintenanceSearch = document.getElementById('maintenance-search');
const maintenanceFilter = document.getElementById('maintenance-filter');
const maintenanceSort = document.getElementById('maintenance-sort');

// Application State
let cars = [];
let records = [];
let filteredCars = [];
let filteredRecords = [];

// Notification Functions
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.style.background = type === 'success' ? '#27ae60' : '#e74c3c';
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

// Statistics Functions
function updateStats() {
    document.getElementById('total-cars').textContent = cars.length;
    document.getElementById('total-records').textContent = records.length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const recentRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });
    document.getElementById('recent-records').textContent = recentRecords.length;
}

// Validation Functions
function validateField(field, value, rules) {
    const formGroup = field.closest('.form-group');
    const errorMessage = formGroup.querySelector('.error-message') || createErrorMessage(formGroup);

    // Reset states
    formGroup.classList.remove('error', 'success');
    errorMessage.style.display = 'none';

    for (let rule of rules) {
        if (!rule.test(value)) {
            formGroup.classList.add('error');
            errorMessage.textContent = rule.message;
            errorMessage.style.display = 'block';
            return false;
        }
    }

    formGroup.classList.add('success');
    return true;
}

function createErrorMessage(formGroup) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    formGroup.appendChild(errorMessage);
    return errorMessage;
}

// Car validation rules
const carValidationRules = {
    make: [
        { test: (value) => value.trim().length > 0, message: 'Car make is required' },
        { test: (value) => value.trim().length >= 2, message: 'Make must be at least 2 characters' },
        { test: (value) => /^[a-zA-Z\s-]+$/.test(value), message: 'Make can only contain letters, spaces, and hyphens' }
    ],
    model: [
        { test: (value) => value.trim().length > 0, message: 'Car model is required' },
        { test: (value) => value.trim().length >= 1, message: 'Model must be at least 1 character' },
        { test: (value) => /^[a-zA-Z0-9\s-]+$/.test(value), message: 'Model can only contain letters, numbers, spaces, and hyphens' }
    ],
    year: [
        { test: (value) => !isNaN(value) && value !== '', message: 'Year must be a number' },
        { test: (value) => parseInt(value) >= 1900, message: 'Year must be 1900 or later' },
        { test: (value) => parseInt(value) <= new Date().getFullYear() + 1, message: `Year cannot be later than ${new Date().getFullYear() + 1}` }
    ]
};

// Maintenance validation rules
const maintenanceValidationRules = {
    carId: [
        { test: (value) => value !== '', message: 'Please select a car' }
    ],
    description: [
        { test: (value) => value.trim().length > 0, message: 'Service description is required' },
        { test: (value) => value.trim().length >= 5, message: 'Description must be at least 5 characters' },
        { test: (value) => value.trim().length <= 200, message: 'Description must be less than 200 characters' }
    ],
    date: [
        { test: (value) => value !== '', message: 'Date is required' },
        { test: (value) => new Date(value) <= new Date(), message: 'Date cannot be in the future' },
        { test: (value) => new Date(value) >= new Date('1950-01-01'), message: 'Date must be after 1950' }
    ]
};

// Car Management Functions
async function loadCars() {
    try {
        const response = await fetch('/cars');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        cars = await response.json();

        // Add maintenance count to each car
        for (let car of cars) {
            car.maintenanceCount = records.filter(record => record.car.id === car.id).length;
        }

        filteredCars = [...cars];
        renderCarsTable();
        updateCarSelect();
        updateMaintenanceFilter();
        updateStats();
    } catch (error) {
        console.error('Error loading cars:', error);
        carsTableBody.innerHTML = '<tr><td colspan="6" class="empty-cell">Error loading cars. Please try refreshing the page.</td></tr>';
        showNotification('Failed to load cars. Please try again.', 'error');
    }
}

function renderCarsTable() {
    if (filteredCars.length === 0) {
        carsTableBody.innerHTML = '<tr><td colspan="6" class="empty-cell">No cars found</td></tr>';
        return;
    }

    carsTableBody.innerHTML = filteredCars.map(car => `
        <tr>
            <td><strong>${car.id}</strong></td>
            <td class="car-info-cell">${escapeHtml(car.make)}</td>
            <td class="car-info-cell">${escapeHtml(car.model)}</td>
            <td>${car.year}</td>
            <td><span class="record-count">${car.maintenanceCount || 0}</span></td>
            <td>
                <button class="action-btn btn-view" onclick="viewCarDetails(${car.id})">View</button>
                <button class="action-btn btn-delete" onclick="confirmDeleteCar(${car.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function updateCarSelect() {
    carSelect.innerHTML = '<option value="">Choose a car...</option>';

    cars.forEach(car => {
        const option = document.createElement('option');
        option.value = car.id;
        option.textContent = `${car.make} ${car.model} (${car.year}) - ID: ${car.id}`;
        carSelect.appendChild(option);
    });
}

async function addCar(carData) {
    try {
        const response = await fetch('/cars', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(carData)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || `HTTP error! status: ${response.status}`);
        }

        const newCar = await response.json();
        newCar.maintenanceCount = 0;
        cars.push(newCar);
        filteredCars = [...cars];
        renderCarsTable();
        updateCarSelect();
        updateMaintenanceFilter();
        updateStats();
        showNotification(`${newCar.make} ${newCar.model} added successfully!`);
        return true;
    } catch (error) {
        console.error('Error adding car:', error);
        showNotification('Error adding car: ' + error.message, 'error');
        return false;
    }
}

// Maintenance Record Functions
async function loadRecords() {
    try {
        const response = await fetch('/maintenance');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        records = await response.json();

        // Add car details and calculate days ago
        records.forEach(record => {
            const car = cars.find(c => c.id === record.car.id);
            if (car) {
                record.carInfo = `${car.make} ${car.model}`;
            }

            const recordDate = new Date(record.date);
            const today = new Date();
            const diffTime = Math.abs(today - recordDate);
            record.daysAgo = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        });

        filteredRecords = [...records];
        renderMaintenanceTable();
        updateStats();
        loadCars(); // Reload to update maintenance counts
    } catch (error) {
        console.error('Error loading maintenance records:', error);
        maintenanceTableBody.innerHTML = '<tr><td colspan="6" class="empty-cell">Error loading records. Please try refreshing the page.</td></tr>';
        showNotification('Failed to load maintenance records. Please try again.', 'error');
    }
}

function renderMaintenanceTable() {
    if (filteredRecords.length === 0) {
        maintenanceTableBody.innerHTML = '<tr><td colspan="6" class="empty-cell">No maintenance records found</td></tr>';
        return;
    }

    maintenanceTableBody.innerHTML = filteredRecords.map(record => {
        const date = new Date(record.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        let daysClass = 'recent';
        if (record.daysAgo > 30) daysClass = 'moderate';
        if (record.daysAgo > 90) daysClass = 'old';

        return `
            <tr>
                <td><strong>${formattedDate}</strong></td>
                <td><span class="record-count">${record.car.id}</span></td>
                <td class="car-info-cell">${record.carInfo || 'Unknown Car'}</td>
                <td>${escapeHtml(record.description)}</td>
                <td class="days-ago ${daysClass}">${record.daysAgo} days ago</td>
                <td>
                    <button class="action-btn btn-view" onclick="viewMaintenanceDetails(${record.id})">View</button>
                    <button class="action-btn btn-delete" onclick="confirmDeleteMaintenance(${record.id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateMaintenanceFilter() {
    maintenanceFilter.innerHTML = '<option value="all">All Cars</option>';

    cars.forEach(car => {
        const option = document.createElement('option');
        option.value = car.id;
        option.textContent = `${car.make} ${car.model} (ID: ${car.id})`;
        maintenanceFilter.appendChild(option);
    });
}

async function addMaintenanceRecord(recordData) {
    try {
        const response = await fetch('/maintenance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(recordData)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || `HTTP error! status: ${response.status}`);
        }

        await response.json();
        loadRecords(); // Reload to get updated data
        showNotification('Maintenance record added successfully!');
        return true;
    } catch (error) {
        console.error('Error adding maintenance record:', error);
        showNotification('Error adding maintenance record: ' + error.message, 'error');
        return false;
    }
}

// Search and Filter Functions
function filterCars() {
    const searchTerm = carSearch.value.toLowerCase();
    const sortBy = carSort.value;

    filteredCars = cars.filter(car =>
        car.make.toLowerCase().includes(searchTerm) ||
        car.model.toLowerCase().includes(searchTerm) ||
        car.year.toString().includes(searchTerm) ||
        car.id.toString().includes(searchTerm)
    );

    // Sort cars
    filteredCars.sort((a, b) => {
        switch(sortBy) {
            case 'make': return a.make.localeCompare(b.make);
            case 'year': return b.year - a.year;
            case 'model': return a.model.localeCompare(b.model);
            default: return a.id - b.id;
        }
    });

    renderCarsTable();
}

function filterMaintenance() {
    const searchTerm = maintenanceSearch.value.toLowerCase();
    const filterCar = maintenanceFilter.value;
    const sortBy = maintenanceSort.value;

    filteredRecords = records.filter(record => {
        const matchesSearch =
            record.description.toLowerCase().includes(searchTerm) ||
            (record.carInfo && record.carInfo.toLowerCase().includes(searchTerm)) ||
            record.car.id.toString().includes(searchTerm);

        const matchesFilter = filterCar === 'all' || record.car.id.toString() === filterCar;

        return matchesSearch && matchesFilter;
    });

    // Sort records
    filteredRecords.sort((a, b) => {
        switch(sortBy) {
            case 'date-asc': return new Date(a.date) - new Date(b.date);
            case 'date-desc': return new Date(b.date) - new Date(a.date);
            case 'car': return a.car.id - b.car.id;
            default: return new Date(b.date) - new Date(a.date);
        }
    });

    renderMaintenanceTable();
}

// Modal Functions (for future use)
function viewCarDetails(carId) {
    const car = cars.find(c => c.id === carId);
    if (!car) return;

    const carRecords = records.filter(r => r.car.id === carId);
    let message = `Car Details:\n${car.make} ${car.model} (${car.year})\n\n`;
    message += `Total Maintenance Records: ${carRecords.length}\n\n`;

    if (carRecords.length > 0) {
        message += "Recent Maintenance:\n";
        carRecords.slice(0, 3).forEach(record => {
            message += `• ${record.date}: ${record.description}\n`;
        });
    }

    alert(message);
}

function viewMaintenanceDetails(recordId) {
    const record = records.find(r => r.id === recordId);
    if (!record) return;

    const message = `Maintenance Details:\n\nDate: ${record.date}\nCar: ${record.carInfo || 'Unknown'} (ID: ${record.car.id})\nDescription: ${record.description}\nDays Ago: ${record.daysAgo}`;
    alert(message);
}

function confirmDeleteCar(carId) {
    const car = cars.find(c => c.id === carId);
    if (!car) return;

    const carRecords = records.filter(r => r.car.id === carId);
    let message = `Are you sure you want to delete ${car.make} ${car.model}?`;

    if (carRecords.length > 0) {
        message += `\n\nThis will also affect ${carRecords.length} maintenance record(s).`;
    }

    if (confirm(message)) {
        // Note: Implement delete functionality based on your backend API
        showNotification('Delete functionality would be implemented here', 'error');
    }
}

function confirmDeleteMaintenance(recordId) {
    if (confirm('Are you sure you want to delete this maintenance record?')) {
        // Note: Implement delete functionality based on your backend API
        showNotification('Delete functionality would be implemented here', 'error');
    }
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setupRealTimeValidation() {
    // Car form validation
    const makeField = document.getElementById('make');
    const modelField = document.getElementById('model');
    const yearField = document.getElementById('year');

    makeField.addEventListener('input', (e) => validateField(e.target, e.target.value, carValidationRules.make));
    modelField.addEventListener('input', (e) => validateField(e.target, e.target.value, carValidationRules.model));
    yearField.addEventListener('input', (e) => validateField(e.target, e.target.value, carValidationRules.year));

    // Maintenance form validation
    const carSelectField = document.getElementById('carSelect');
    const descriptionField = document.getElementById('description');
    const dateField = document.getElementById('date');

    carSelectField.addEventListener('change', (e) => validateField(e.target, e.target.value, maintenanceValidationRules.carId));
    descriptionField.addEventListener('input', (e) => validateField(e.target, e.target.value, maintenanceValidationRules.description));
    dateField.addEventListener('change', (e) => validateField(e.target, e.target.value, maintenanceValidationRules.date));
}

// Event Listeners
carForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        make: carForm.make.value.trim(),
        model: carForm.model.value.trim(),
        year: parseInt(carForm.year.value)
    };

    // Validate all fields
    const isValidMake = validateField(carForm.make, formData.make, carValidationRules.make);
    const isValidModel = validateField(carForm.model, formData.model, carValidationRules.model);
    const isValidYear = validateField(carForm.year, carForm.year.value, carValidationRules.year);

    if (!isValidMake || !isValidModel || !isValidYear) {
        showNotification('Please fix the errors above', 'error');
        return;
    }

    const success = await addCar(formData);
    if (success) {
        carForm.reset();
        // Clear validation states
        document.querySelectorAll('#car-form .form-group').forEach(group => {
            group.classList.remove('error', 'success');
            const errorMsg = group.querySelector('.error-message');
            if (errorMsg) errorMsg.style.display = 'none';
        });
    }
});

maintenanceForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        carId: maintenanceForm.carId.value,
        description: maintenanceForm.description.value.trim(),
        date: maintenanceForm.date.value
    };

    // Validate all fields
    const isValidCar = validateField(maintenanceForm.carId, formData.carId, maintenanceValidationRules.carId);
    const isValidDescription = validateField(maintenanceForm.description, formData.description, maintenanceValidationRules.description);
    const isValidDate = validateField(maintenanceForm.date, formData.date, maintenanceValidationRules.date);

    if (!isValidCar || !isValidDescription || !isValidDate) {
        showNotification('Please fix the errors above', 'error');
        return;
    }

    const recordData = {
        car: { id: parseInt(formData.carId) },
        description: formData.description,
        date: formData.date
    };

    const success = await addMaintenanceRecord(recordData);
    if (success) {
        maintenanceForm.reset();
        // Reset date to today and clear validation states
        document.getElementById('date').valueAsDate = new Date();
        document.querySelectorAll('#maintenance-form .form-group').forEach(group => {
            group.classList.remove('error', 'success');
            const errorMsg = group.querySelector('.error-message');
            if (errorMsg) errorMsg.style.display = 'none';
        });
    }
});

// Search and filter event listeners
carSearch.addEventListener('input', filterCars);
carSort.addEventListener('change', filterCars);
maintenanceSearch.addEventListener('input', filterMaintenance);
maintenanceFilter.addEventListener('change', filterMaintenance);
maintenanceSort.addEventListener('change', filterMaintenance);

// Initialize Application
function initializeApp() {
    // Set today's date as default for maintenance form
    document.getElementById('date').valueAsDate = new Date();

    // Setup real-time validation
    setupRealTimeValidation();

    // Load initial data
    loadCars();
    loadRecords();

    // Auto-refresh every 5 minutes
    setInterval(() => {
        loadCars();
        loadRecords();
    }, 300000);
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}