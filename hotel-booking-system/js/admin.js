// Админ панелінің JavaScript коды

// ==================== АДМИН АККАУНТЫ ====================
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "diploma2024";

// ==================== ДЕРЕКТЕР БАЗАСЫ ====================
let rooms = [];
let bookings = [];
let payments = [];

// ==================== БАСТАПҚЫ ЖҮКТЕУ ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Админ панелі жүктелуде...');
    checkAuth();
    loadData();
    addStyles();
});

// ==================== ДЕРЕКТЕРДІ ЖҮКТЕУ ====================
function loadData() {
    // Бөлмелерді жүктеу
    const savedRooms = localStorage.getItem('hotel_rooms');
    if (savedRooms) {
        rooms = JSON.parse(savedRooms);
    } else {
        rooms = [
            { id: 1, name: 'Стандарт №101', type: 'Стандарт', price: 15000, capacity: 2, status: 'available' },
            { id: 2, name: 'Люкс №201', type: 'Люкс', price: 35000, capacity: 3, status: 'available' },
            { id: 3, name: 'Отбасылық №301', type: 'Отбасылық', price: 45000, capacity: 5, status: 'available' }
        ];
        localStorage.setItem('hotel_rooms', JSON.stringify(rooms));
    }
    
    // Брондауларды жүктеу
    const savedBookings = localStorage.getItem('hotel_bookings');
    if (savedBookings) {
        bookings = JSON.parse(savedBookings);
    } else {
        bookings = [];
        localStorage.setItem('hotel_bookings', JSON.stringify(bookings));
    }
    
    // Төлемдерді жүктеу
    const savedPayments = localStorage.getItem('hotel_payments');
    if (savedPayments) {
        payments = JSON.parse(savedPayments);
    } else {
        payments = [];
        localStorage.setItem('hotel_payments', JSON.stringify(payments));
    }
    
    console.log('Деректер жүктелді:', { rooms, bookings, payments });
}

// ==================== АУТЕНТИФИКАЦИЯ ====================
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    
    if (!isLoggedIn) {
        showLoginForm();
    } else {
        showAdminPanel();
        displayAllData();
        updateStats();
    }
}

function showLoginForm() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    if (sidebar) sidebar.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';
    
    const loginHTML = `
        <div class="login-container">
            <div class="login-box">
                <div class="login-header">
                    <i class="fas fa-hotel"></i>
                    <h2>Grand Hotel</h2>
                    <p>Админ панеліне кіру</p>
                </div>
                <form id="loginForm" class="login-form">
                    <div class="input-group">
                        <i class="fas fa-user"></i>
                        <input type="text" id="username" placeholder="Логин" value="admin">
                    </div>
                    <div class="input-group">
                        <i class="fas fa-lock"></i>
                        <input type="password" id="password" placeholder="Құпия сөз" value="diploma2024">
                    </div>
                    <button type="submit" class="login-btn">
                        <i class="fas fa-sign-in-alt"></i> Кіру
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', loginHTML);
    
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            window.location.reload();
        } else {
            showNotification('Қате логин немесе құпия сөз!', 'error');
        }
    });
}

function showAdminPanel() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    if (sidebar) sidebar.style.display = 'block';
    if (mainContent) mainContent.style.display = 'block';
    
    const loginContainer = document.querySelector('.login-container');
    if (loginContainer) loginContainer.remove();
}

// ==================== СЕКЦИЯЛАРДЫ АУЫСТЫРУ ====================
function showSection(section) {
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('roomsSection').style.display = 'none';
    document.getElementById('bookingsSection').style.display = 'none';
    document.getElementById('paymentsSection').style.display = 'none';
    document.getElementById('reportsSection').style.display = 'none';
    
    document.getElementById(section + 'Section').style.display = 'block';
    
    document.querySelectorAll('.sidebar-menu a').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (section === 'rooms') displayRooms();
    if (section === 'bookings') displayBookings();
    if (section === 'payments') displayPayments();
}

// ==================== БАРЛЫҚ ДЕРЕКТЕРДІ КӨРСЕТУ ====================
function displayAllData() {
    displayRooms();
    displayBookings();
    displayPayments();
    displayRecentBookings();
    displayDashboardCharts();
}

// ==================== DASHBOARD ГРАФИКТЕРІ ====================
function displayDashboardCharts() {
    // Бөлмелер статусы
    const available = rooms.filter(r => r.status === 'available').length;
    const booked = rooms.filter(r => r.status === 'booked').length;
    const maintenance = rooms.filter(r => r.status === 'maintenance').length;
    
    // Статистиканы жаңарту
    document.getElementById('statAvailable').textContent = available;
    document.getElementById('statBooked').textContent = booked;
    document.getElementById('statMaintenance').textContent = maintenance;
    
    // Апталық табыс
    const weeklyTotal = bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.total || 0), 0);
    document.getElementById('weeklyTotal').textContent = weeklyTotal.toLocaleString() + ' ₸';
}

// ==================== БӨЛМЕЛЕРДІ КӨРСЕТУ ====================
function displayRooms() {
    const tableBody = document.getElementById('roomsTable');
    if (!tableBody) return;
    
    const availableCount = rooms.filter(r => r.status === 'available').length;
    const bookedCount = rooms.filter(r => r.status === 'booked').length;
    
    document.getElementById('availableRooms').textContent = availableCount;
    document.getElementById('bookedRooms').textContent = bookedCount;
    
    if (rooms.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Бөлмелер жоқ</td></tr>`;
        return;
    }
    
    tableBody.innerHTML = rooms.map(room => `
        <tr>
            <td>${room.id}</td>
            <td><strong>${room.name}</strong></td>
            <td>${room.type || 'Стандарт'}</td>
            <td>${(room.price || 0).toLocaleString()} ₸</td>
            <td>${room.capacity || 2} адам</td>
            <td>
                <span class="status-badge ${room.status || 'available'}">
                    ${room.status === 'available' ? 'Бос' : 
                      room.status === 'booked' ? 'Брондалған' : 'Жөндеуде'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewRoom(${room.id})" title="Көру">👁️</button>
                    <button class="action-btn edit" onclick="editRoom(${room.id})" title="Өңдеу">✏️</button>
                    <button class="action-btn delete" onclick="deleteRoom(${room.id})" title="Жою">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ==================== БРОНДАУЛАРДЫ КӨРСЕТУ ====================
function displayBookings() {
    const tableBody = document.getElementById('bookingsTable');
    if (!tableBody) return;
    
    if (bookings.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center;">Брондаулар жоқ</td></tr>`;
        return;
    }
    
    tableBody.innerHTML = bookings.map(booking => `
        <tr>
            <td>#${booking.id}</td>
            <td><strong>${booking.guestName || 'Аты жоқ'}</strong></td>
            <td>${booking.roomName || 'Бөлме жоқ'}</td>
            <td>${booking.checkIn || 'Көрсетілмеген'}</td>
            <td>${booking.checkOut || 'Көрсетілмеген'}</td>
            <td>
                <span class="status-badge ${booking.status || 'pending'}">
                    ${booking.status === 'confirmed' ? 'Расталған' : 'Күтілуде'}
                </span>
            </td>
            <td>${(booking.total || 0).toLocaleString()} ₸</td>
            <td>${booking.paymentMethod || 'Көрсетілмеген'}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewBooking(${booking.id})" title="Көру">👁️</button>
                    <button class="action-btn edit" onclick="confirmBooking(${booking.id})" title="Растау">✅</button>
                    <button class="action-btn delete" onclick="deleteBooking(${booking.id})" title="Жою">❌</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function displayRecentBookings() {
    const tableBody = document.getElementById('recentBookings');
    if (!tableBody) return;
    
    const recent = bookings.slice(-5).reverse();
    
    if (recent.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Брондаулар жоқ</td></tr>`;
        return;
    }
    
    tableBody.innerHTML = recent.map(booking => `
        <tr>
            <td>#${booking.id}</td>
            <td>${booking.guestName || 'Аты жоқ'}</td>
            <td>${booking.roomName || 'Бөлме жоқ'}</td>
            <td>${booking.checkIn || 'Көрсетілмеген'}</td>
            <td>${booking.checkOut || 'Көрсетілмеген'}</td>
            <td>
                <span class="status-badge ${booking.status || 'pending'}">
                    ${booking.status === 'confirmed' ? 'Расталған' : 'Күтілуде'}
                </span>
            </td>
            <td>${(booking.total || 0).toLocaleString()} ₸</td>
        </tr>
    `).join('');
}

// ==================== ТӨЛЕМДЕРДІ КӨРСЕТУ ====================
function displayPayments() {
    const tableBody = document.getElementById('paymentsTable');
    if (!tableBody) return;
    
    // Төлемдерді брондаулардан алу
    const paymentData = bookings.map(booking => ({
        id: booking.id,
        guestName: booking.guestName,
        amount: booking.total,
        method: booking.paymentMethod,
        cardNumber: booking.cardNumber ? maskCardNumber(booking.cardNumber) : 'Көрсетілмеген',
        status: booking.status === 'confirmed' ? 'Төленді' : 'Күтілуде',
        date: booking.checkIn
    }));
    
    if (paymentData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Төлемдер жоқ</td></tr>`;
        return;
    }
    
    tableBody.innerHTML = paymentData.map(payment => `
        <tr>
            <td>#${payment.id}</td>
            <td>${payment.guestName}</td>
            <td>${payment.amount.toLocaleString()} ₸</td>
            <td>${payment.method}</td>
            <td>${payment.cardNumber}</td>
            <td>
                <span class="status-badge ${payment.status === 'Төленді' ? 'confirmed' : 'pending'}">
                    ${payment.status}
                </span>
            </td>
            <td>${payment.date}</td>
        </tr>
    `).join('');
}

// Карта нөмірін маскалау (тек соңғы 4 цифр)
function maskCardNumber(cardNumber) {
    if (!cardNumber) return 'Көрсетілмеген';
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length >= 4) {
        return '**** **** **** ' + cleaned.slice(-4);
    }
    return cardNumber;
}

// ==================== БРОНДАУДЫ КӨРУ ====================
function viewBooking(id) {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
        let paymentInfo = '';
        if (booking.paymentMethod === 'visa' || booking.paymentMethod === 'mastercard') {
            paymentInfo = `\nКарта: ${maskCardNumber(booking.cardNumber)}\nКарта иесі: ${booking.cardHolder || 'Көрсетілмеген'}`;
        } else if (booking.paymentMethod === 'kaspi') {
            paymentInfo = `\nKaspi телефон: ${booking.kaspiPhone || 'Көрсетілмеген'}`;
        } else if (booking.paymentMethod === 'paypal') {
            paymentInfo = `\nPayPal: ${booking.paypalEmail || 'Көрсетілмеген'}`;
        }
        
        alert(`
📋 БРОНДАУ АҚПАРАТЫ
════════════════════
Қонақ: ${booking.guestName}
Бөлме: ${booking.roomName}
Келу: ${booking.checkIn}
Кету: ${booking.checkOut}
Статус: ${booking.status === 'confirmed' ? 'Расталған' : 'Күтілуде'}
Сома: ${booking.total.toLocaleString()} ₸
Төлем әдісі: ${booking.paymentMethod}
Телефон: ${booking.phone || 'Жоқ'}
Email: ${booking.email || 'Жоқ'}${paymentInfo}
        `);
    }
}

// ==================== СТАТИСТИКАНЫ ЖАҢАРТУ ====================
function updateStats() {
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter(r => r.status === 'available').length;
    const bookedRooms = rooms.filter(r => r.status === 'booked').length;
    const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
    
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    
    const totalRevenue = bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.total || 0), 0);
    
    const avgPrice = rooms.length > 0 
        ? Math.round(rooms.reduce((sum, r) => sum + (r.price || 0), 0) / rooms.length) 
        : 0;
    
    // Статистиканы жаңарту
    document.getElementById('totalRooms').textContent = totalRooms;
    document.getElementById('availableRooms').textContent = availableRooms;
    document.getElementById('bookedRooms').textContent = bookedRooms;
    document.getElementById('avgPrice').textContent = avgPrice.toLocaleString() + ' ₸';
    
    // Қосымша статистика
    console.log('📊 СТАТИСТИКА:', {
        'Барлық бөлмелер': totalRooms,
        'Бос бөлмелер': availableRooms,
        'Брондалған': bookedRooms,
        'Жөндеуде': maintenanceRooms,
        'Барлық брондау': totalBookings,
        'Расталған': confirmedBookings,
        'Күтілуде': pendingBookings,
        'Жалпы табыс': totalRevenue.toLocaleString() + ' ₸'
    });
}

// ==================== БӨЛМЕ ҚОСУ ====================
function showAddRoomForm() {
    document.getElementById('addRoomForm').style.display = 'block';
}

function hideAddRoomForm() {
    document.getElementById('addRoomForm').style.display = 'none';
    document.getElementById('roomForm').reset();
}

function addRoom(event) {
    event.preventDefault();
    
    const newRoom = {
        id: rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1,
        name: document.getElementById('roomName').value,
        type: document.getElementById('roomType').value,
        price: parseInt(document.getElementById('roomPrice').value),
        capacity: parseInt(document.getElementById('roomCapacity').value),
        status: 'available'
    };
    
    rooms.push(newRoom);
    localStorage.setItem('hotel_rooms', JSON.stringify(rooms));
    displayRooms();
    hideAddRoomForm();
    updateStats();
    displayDashboardCharts();
    showNotification('Жаңа бөлме қосылды!', 'success');
}

// ==================== БРОНДАУДЫ РАСТАУ ====================
function confirmBooking(id) {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
        booking.status = 'confirmed';
        localStorage.setItem('hotel_bookings', JSON.stringify(bookings));
        displayBookings();
        displayRecentBookings();
        updateStats();
        displayDashboardCharts();
        showNotification('Брондау расталды!', 'success');
    }
}

function deleteBooking(id) {
    if (confirm('Бұл брондауды жойғыңыз келе ме?')) {
        bookings = bookings.filter(b => b.id !== id);
        localStorage.setItem('hotel_bookings', JSON.stringify(bookings));
        displayBookings();
        displayRecentBookings();
        updateStats();
        displayDashboardCharts();
        showNotification('Брондау жойылды!', 'success');
    }
}

// ==================== PDF ЭКСПОРТ ====================
function exportBookingsToPDF() {
    if (bookings.length === 0) {
        showNotification('Экспорттайтын деректер жоқ!', 'error');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text('Grand Hotel - Брондаулар тізімі', 14, 22);
        doc.setFontSize(11);
        doc.text(`Күні: ${new Date().toLocaleDateString('kk-KZ')}`, 14, 32);
        
        const tableColumn = ["ID", "Қонақ", "Бөлме", "Келу", "Кету", "Статус", "Сома", "Төлем"];
        const tableRows = [];
        
        bookings.forEach(booking => {
            tableRows.push([
                booking.id,
                booking.guestName || 'Аты жоқ',
                booking.roomName || 'Бөлме жоқ',
                booking.checkIn || 'Көрсетілмеген',
                booking.checkOut || 'Көрсетілмеген',
                booking.status === 'confirmed' ? 'Расталған' : 'Күтілуде',
                (booking.total || 0) + ' ₸',
                booking.paymentMethod || 'Көрсетілмеген'
            ]);
        });
        
        doc.autoTable({
            startY: 40,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [196, 164, 132] }
        });
        
        doc.save('brondaular.pdf');
        showNotification('PDF файлы жүктелді!', 'success');
    } catch (error) {
        console.error('PDF қатесі:', error);
        showNotification('PDF экспорттау кезінде қате пайда болды!', 'error');
    }
}

// ==================== EXCEL ЭКСПОРТ ====================
function exportBookingsToExcel() {
    if (bookings.length === 0) {
        showNotification('Экспорттайтын деректер жоқ!', 'error');
        return;
    }
    
    try {
        const wsData = [
            ['ID', 'Қонақ', 'Бөлме', 'Келу', 'Кету', 'Статус', 'Сома (₸)', 'Төлем әдісі', 'Телефон', 'Email']
        ];
        
        bookings.forEach(booking => {
            wsData.push([
                booking.id,
                booking.guestName || 'Аты жоқ',
                booking.roomName || 'Бөлме жоқ',
                booking.checkIn || 'Көрсетілмеген',
                booking.checkOut || 'Көрсетілмеген',
                booking.status === 'confirmed' ? 'Расталған' : 'Күтілуде',
                booking.total || 0,
                booking.paymentMethod || 'Көрсетілмеген',
                booking.phone || '',
                booking.email || ''
            ]);
        });
        
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Брондаулар');
        XLSX.writeFile(wb, 'brondaular.xlsx');
        
        showNotification('Excel файлы жүктелді!', 'success');
    } catch (error) {
        console.error('Excel қатесі:', error);
        showNotification('Excel экспорттау кезінде қате пайда болды!', 'error');
    }
}

// ==================== ХАБАРЛАНДЫРУ ====================
function showNotification(message, type = 'info') {
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        `;
        document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ==================== СТИЛЬДЕРДІ ҚОСУ ====================
function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .login-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }
        
        .login-box {
            background: white;
            padding: 50px;
            border-radius: 30px;
            box-shadow: 0 30px 60px rgba(0,0,0,0.3);
            width: 100%;
            max-width: 400px;
            animation: slideIn 0.5s ease;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .login-header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .login-header i {
            font-size: 60px;
            color: #667eea;
            margin-bottom: 20px;
        }
        
        .login-header h2 {
            font-size: 28px;
            color: #333;
        }
        
        .input-group {
            position: relative;
            margin-bottom: 20px;
        }
        
        .input-group i {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
        }
        
        .input-group input {
            width: 100%;
            padding: 15px 15px 15px 45px;
            border: 2px solid #eee;
            border-radius: 12px;
            font-size: 16px;
        }
        
        .login-btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            cursor: pointer;
        }
        
        .action-buttons {
            display: flex;
            gap: 5px;
        }
        
        .action-btn {
            width: 35px;
            height: 35px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s;
        }
        
        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 10px rgba(0,0,0,0.2);
        }
        
        .action-btn.view { background: #3498db; color: white; }
        .action-btn.edit { background: #f39c12; color: white; }
        .action-btn.delete { background: #e74c3c; color: white; }
        
        .status-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .status-badge.available { background: #d4edda; color: #155724; }
        .status-badge.booked { background: #fff3cd; color: #856404; }
        .status-badge.confirmed { background: #d4edda; color: #155724; }
        .status-badge.pending { background: #fff3cd; color: #856404; }
        
        .notification {
            padding: 15px 25px;
            border-radius: 10px;
            margin-bottom: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease;
        }
        
        .notification.success { background: #d4edda; color: #155724; }
        .notification.error { background: #f8d7da; color: #721c24; }
        .notification.info { background: #cce5ff; color: #004085; }
    `;
    
    document.head.appendChild(style);
}

// ==================== ШЫҒУ ====================
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.reload();
}