// DOM Elements
const carList = document.getElementById('car-list');
const carForm = document.getElementById('car-form');
const recordList = document.getElementById('record-list');
const maintenanceForm = document.getElementById('maintenance-form');
const carSelect = document.getElementById('carSelect');
const notification = document.getElementById('notification');

// Application State
let cars = [];
let records = [];

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

// Car Management Functions
async function loadCars() {
    try {
        const response = await fetch('/cars');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        cars = await response.json();
        renderCars();
        updateCarSelect();
        updateStats();
    } catch (error) {
        console.error('Error loading cars:', error);
        carList.innerHTML = '<div class="empty-state"><h3>Error loading cars</h3><p>Please check your connection and try refreshing the page.</p></div>';
        showNotification('Failed to load cars. Please try again.', 'error');
    }
}

function renderCars() {
    carList.innerHTML = '';

    if (cars.length === 0) {
        carList.innerHTML = `
            <div class="empty-state">
                <h3>No cars added yet</h3>
                <p>Add your first car using the form above!</p>
            </div>
        `;
        return;
    }

    cars.forEach(car => {
        const carCard = document.createElement('div');
        carCard.className = 'car-card';
        carCard.innerHTML = `
            <div class="car-info">
                <h3>${escapeHtml(car.make)} ${escapeHtml(car.model)}</h3>
                <div class="car-details">
                    <span>Year: ${car.year}</span>
                    <span class="car-id">ID: ${car.id}</span>
                </div>
            </div>
        `;
        carList.appendChild(carCard);
    });
}

function updateCarSelect() {
    carSelect.innerHTML = '<option value="">Choose a car...</option>';

    cars.forEach(car => {
        const option = document.createElement('option');
        option.value = car.id;
        option.textContent = `${car.make} ${car.model} (${car.year})`;
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newCar = await response.json();
        cars.push(newCar);
        renderCars();
        updateCarSelect();
        updateStats();
        showNotification('Car added successfully!');
        return true;
    } catch (error) {
        console.error('Error adding car:', error);
        showNotification('Error adding car. Please try again.', 'error');
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
        renderRecords();
        updateStats();
    } catch (error) {
        console.error('Error loading maintenance records:', error);
        recordList.innerHTML = '<div class="empty-state"><h3>Error loading records</h3><p>Please check your connection and try refreshing the page.</p></div>';
        showNotification('Failed to load maintenance records. Please try again.', 'error');
    }
}

function renderRecords() {
    recordList.innerHTML = '';

    if (records.length === 0) {
        recordList.innerHTML = `
            <div class="empty-state">
                <h3>No maintenance records yet</h3>
                <p>Add your first maintenance record using the form above!</p>
            </div>
        `;
        return;
    }

    // Sort records by date (newest first)
    const sortedRecords = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedRecords.forEach(record => {
        const recordItem = document.createElement('div');
        recordItem.className = 'maintenance-item';

        const date = new Date(record.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        recordItem.innerHTML = `
            <div class="maintenance-header">
                <span class="maintenance-car">Car ${record.car.id}</span>
                <span class="maintenance-date">${formattedDate}</span>
            </div>
            <div class="maintenance-description">${escapeHtml(record.description)}</div>
        `;
        recordList.appendChild(recordItem);
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        await response.json();
        loadRecords(); // Reload to get updated data
        showNotification('Maintenance record added successfully!');
        return true;
    } catch (error) {
        console.error('Error adding maintenance record:', error);
        showNotification('Error adding maintenance record. Please try again.', 'error');
        return false;
    }
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function validateCarForm(formData) {
    const { make, model, year } = formData;

    if (!make.trim()) {
        showNotification('Please enter a car make.', 'error');
        return false;
    }

    if (!model.trim()) {
        showNotification('Please enter a car model.', 'error');
        return false;
    }

    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear + 1) {
        showNotification(`Please enter a valid year between 1900 and ${currentYear + 1}.`, 'error');
        return false;
    }

    return true;
}

function validateMaintenanceForm(formData) {
    const { carId, description, date } = formData;

    if (!carId) {
        showNotification('Please select a car.', 'error');
        return false;
    }

    if (!description.trim()) {
        showNotification('Please enter a service description.', 'error');
        return false;
    }

    if (!date) {
        showNotification('Please select a date.', 'error');
        return false;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (selectedDate > today) {
        showNotification('Maintenance date cannot be in the future.', 'error');
        return false;
    }

    return true;
}

// Event Listeners
carForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        make: carForm.make.value.trim(),
        model: carForm.model.value.trim(),
        year: parseInt(carForm.year.value)
    };

    if (!validateCarForm(formData)) {
        return;
    }

    const success = await addCar(formData);
    if (success) {
        carForm.reset();
    }
});

maintenanceForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        carId: parseInt(maintenanceForm.carId.value),
        description: maintenanceForm.description.value.trim(),
        date: maintenanceForm.date.value
    };

    if (!validateMaintenanceForm(formData)) {
        return;
    }

    const recordData = {
        car: { id: formData.carId },
        description: formData.description,
        date: formData.date
    };

    const success = await addMaintenanceRecord(recordData);
    if (success) {
        maintenanceForm.reset();
        // Reset date to today
        document.getElementById('date').valueAsDate = new Date();
    }
});

// Initialize Application
function initializeApp() {
    // Set today's date as default for maintenance form
    document.getElementById('date').valueAsDate = new Date();

    // Load initial data
    loadCars();
    loadRecords();

}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}