// Клиент панелінің JavaScript коды

// ==================== ДЕРЕКТЕРДІ ЖҮКТЕУ ====================
let rooms = [];
let bookings = [];
let selectedPaymentMethod = '';

// LocalStorage-дан деректерді жүктеу
function loadData() {
    const savedRooms = localStorage.getItem('hotel_rooms');
    if (savedRooms) {
        rooms = JSON.parse(savedRooms);
        rooms = rooms.map(room => {
            if (!room.amenities) {
                room.amenities = ['Wi-Fi', 'TV', 'Кондиционер'];
            }
            if (!room.image) {
                room.image = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
            }
            return room;
        });
    } else {
        rooms = [
            {
                id: 1,
                name: 'Стандарт №101',
                type: 'Стандарт',
                price: 15000,
                capacity: 2,
                area: 25,
                bed: 'Бір үлкен төсек',
                status: 'available',
                description: 'Жайлы стандарт бөлме',
                image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                amenities: ['Wi-Fi', 'TV', 'Кондиционер']
            },
            {
                id: 2,
                name: 'Люкс №201',
                type: 'Люкс',
                price: 35000,
                capacity: 3,
                area: 45,
                bed: 'Үлкен патша төсегі',
                status: 'available',
                description: 'Кең люкс бөлме',
                image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                amenities: ['Wi-Fi', 'TV', 'Джакузи']
            },
            {
                id: 3,
                name: 'Отбасылық №301',
                type: 'Отбасылық',
                price: 45000,
                capacity: 5,
                area: 65,
                bed: 'Үлкен отбасылық',
                status: 'available',
                description: 'Үлкен отбасыларға арналған',
                image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                amenities: ['Wi-Fi', '2 TV', 'Балаларға арналған орын']
            }
        ];
        localStorage.setItem('hotel_rooms', JSON.stringify(rooms));
    }
    
    const savedBookings = localStorage.getItem('hotel_bookings');
    if (savedBookings) {
        bookings = JSON.parse(savedBookings);
    } else {
        bookings = [];
        localStorage.setItem('hotel_bookings', JSON.stringify(bookings));
    }
}

// ==================== БАСТАПҚЫ ЖҮКТЕУ ====================
document.addEventListener('DOMContentLoaded', function() {
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 1000);
    }
    
    loadData();
    displayRooms();
    initEventListeners();
    setDefaultDates();
});

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
function initEventListeners() {
    const userBtn = document.getElementById('userBtn');
    if (userBtn) {
        userBtn.addEventListener('click', showLoginModal);
    }
    
    const bookNowBtn = document.getElementById('bookNowBtn');
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', () => {
            document.getElementById('rooms').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSearch);
    }
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    const bookingModalForm = document.getElementById('bookingModalForm');
    if (bookingModalForm) {
        bookingModalForm.addEventListener('submit', handleBookingConfirm);
    }
}

// ==================== БӨЛМЕЛЕРДІ КӨРСЕТУ ====================
function displayRooms(filter = 'all') {
    const grid = document.getElementById('roomsGrid');
    if (!grid) return;
    
    let filteredRooms = rooms;
    
    if (filter !== 'all') {
        filteredRooms = rooms.filter(room => room.type === filter);
    }
    
    filteredRooms = filteredRooms.filter(room => room.status === 'available');
    
    if (filteredRooms.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <i class="fas fa-bed" style="font-size: 50px; color: #ccc;"></i>
                <h3>Қолжетімді бөлмелер жоқ</h3>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filteredRooms.map(room => {
        const amenities = room.amenities || ['Wi-Fi', 'TV', 'Кондиционер'];
        
        return `
        <div class="room-card" data-id="${room.id}">
            <div class="room-image">
                <img src="${room.image}" alt="${room.name}" loading="lazy">
                <span class="room-badge">${room.type}</span>
            </div>
            <div class="room-info">
                <h3>${room.name}</h3>
                <p class="room-description">${room.description}</p>
                <div class="room-details">
                    <span><i class="fas fa-user"></i> ${room.capacity} адам</span>
                    <span><i class="fas fa-ruler"></i> ${room.area} м²</span>
                </div>
                <div class="room-amenities">
                    ${amenities.slice(0, 3).map(a => `<span class="amenity-tag">${a}</span>`).join('')}
                </div>
                <div class="room-price">
                    <div class="price">${room.price.toLocaleString()} ₸ <span>/ түн</span></div>
                    <button class="btn-book" onclick="openBookingModal(${room.id})">
                        <i class="fas fa-credit-card"></i> Брондау
                    </button>
                </div>
            </div>
        </div>
    `}).join('');
}

// ==================== БРОНДАУ ІЗДЕУ ====================
function handleBookingSearch(e) {
    e.preventDefault();
    
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const adults = parseInt(document.getElementById('adults').value);
    const children = parseInt(document.getElementById('children').value);
    const roomType = document.getElementById('roomType').value;
    
    if (!checkIn || !checkOut) {
        showNotification('Келу және кету күндерін таңдаңыз!', 'error');
        return;
    }
    
    displayRooms(roomType === 'all' ? 'all' : roomType);
    document.getElementById('rooms').scrollIntoView({ behavior: 'smooth' });
}

// ==================== ФИЛЬТР БАТЫРМАЛАРЫ ====================
function handleFilterClick(e) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    displayRooms(e.target.dataset.filter);
}

// ==================== КҮНДЕРДІ ОРНАТУ ====================
function setDefaultDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const checkIn = document.getElementById('checkIn');
    const checkOut = document.getElementById('checkOut');
    
    if (checkIn) {
        checkIn.min = today.toISOString().split('T')[0];
        checkIn.value = today.toISOString().split('T')[0];
    }
    
    if (checkOut) {
        checkOut.min = tomorrow.toISOString().split('T')[0];
        checkOut.value = nextWeek.toISOString().split('T')[0];
    }
}

// ==================== ТӨЛЕМ ӘДІСІН ТАҢДАУ ====================
function selectPayment(method) {
    document.querySelectorAll('.payment-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.payment-card').classList.add('selected');
    selectedPaymentMethod = method;
    
    // Төлем әдісін сақтау
    if (document.getElementById('bookingPaymentSelect')) {
        document.getElementById('bookingPaymentSelect').value = method;
        updatePaymentMethod();
    }
    
    showNotification(`${method} төлем әдісі таңдалды`, 'success');
}

// ==================== ТӨЛЕМ ӘДІСІН ЖАҢАРТУ ====================
function updatePaymentMethod() {
    const method = document.getElementById('bookingPaymentSelect').value;
    
    // Барлық қосымша өрістерді жасыру
    document.getElementById('cardDetails').style.display = 'none';
    document.getElementById('kaspiDetails').style.display = 'none';
    document.getElementById('paypalDetails').style.display = 'none';
    
    // Таңдалған әдіске сәйкес өрістерді көрсету
    if (method === 'visa' || method === 'mastercard') {
        document.getElementById('cardDetails').style.display = 'block';
    } else if (method === 'kaspi') {
        document.getElementById('kaspiDetails').style.display = 'block';
    } else if (method === 'paypal') {
        document.getElementById('paypalDetails').style.display = 'block';
    }
    
    // Төлем батырмасының мәтінін өзгерту
    const payButton = document.getElementById('payButton');
    if (method === 'kaspi') {
        payButton.innerHTML = '<i class="fas fa-mobile-alt"></i> Kaspi арқылы төлеу';
    } else if (method === 'paypal') {
        payButton.innerHTML = '<i class="fab fa-paypal"></i> PayPal арқылы төлеу';
    } else {
        payButton.innerHTML = '<i class="fas fa-lock"></i> Картамен төлеу';
    }
}

// ==================== БРОНДАУ МОДАЛЬДЫ ТЕРЕЗЕСІ ====================
function openBookingModal(roomId) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    
    document.getElementById('bookingRoomId').value = room.id;
    document.getElementById('bookingRoomName').value = room.name;
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    document.getElementById('bookingCheckIn').value = today.toISOString().split('T')[0];
    document.getElementById('bookingCheckOut').value = tomorrow.toISOString().split('T')[0];
    
    updateBookingTotal();
    document.getElementById('bookingModal').style.display = 'flex';
    
    // Төлем әдісін бастапқы күйге келтіру
    document.getElementById('bookingPaymentSelect').value = '';
    document.getElementById('cardDetails').style.display = 'none';
    document.getElementById('kaspiDetails').style.display = 'none';
    document.getElementById('paypalDetails').style.display = 'none';
}

function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
}

function updateBookingTotal() {
    const checkIn = document.getElementById('bookingCheckIn').value;
    const checkOut = document.getElementById('bookingCheckOut').value;
    const roomId = parseInt(document.getElementById('bookingRoomId').value);
    
    if (!checkIn || !checkOut) return;
    
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    
    const days = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const total = room.price * days;
    
    document.getElementById('bookingTotal').innerHTML = `Жалпы сома: ${total.toLocaleString()} ₸`;
}

// ==================== БРОНДАУДЫ РАСТАУ ЖӘНЕ ТӨЛЕУ ====================
function handleBookingConfirm(e) {
    e.preventDefault();
    
    const roomId = parseInt(document.getElementById('bookingRoomId').value);
    const room = rooms.find(r => r.id === roomId);
    const paymentMethod = document.getElementById('bookingPaymentSelect').value;
    
    if (!paymentMethod) {
        showNotification('Төлем әдісін таңдаңыз!', 'error');
        return;
    }
    
    // Төлем деректерін тексеру
    if (paymentMethod === 'visa' || paymentMethod === 'mastercard') {
        const cardNumber = document.getElementById('cardNumber').value;
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCvv = document.getElementById('cardCvv').value;
        
        if (!cardNumber || !cardExpiry || !cardCvv) {
            showNotification('Карта деректерін толтырыңыз!', 'error');
            return;
        }
        
        // Қарапайым валидация
        if (cardNumber.replace(/\s/g, '').length !== 16) {
            showNotification('Карта нөмірі 16 саннан тұруы керек!', 'error');
            return;
        }
        
        if (cardCvv.length !== 3) {
            showNotification('CVV коды 3 саннан тұруы керек!', 'error');
            return;
        }
    }
    
    if (paymentMethod === 'kaspi') {
        const kaspiPhone = document.getElementById('kaspiPhone').value;
        if (!kaspiPhone) {
            showNotification('Kaspi телефон нөмірін енгізіңіз!', 'error');
            return;
        }
    }
    
    if (paymentMethod === 'paypal') {
        const paypalEmail = document.getElementById('paypalEmail').value;
        if (!paypalEmail) {
            showNotification('PayPal email енгізіңіз!', 'error');
            return;
        }
    }
    
    // Төлемді өңдеу (тест режимі)
    processPayment(room, paymentMethod);
}

function processPayment(room, paymentMethod) {
    showNotification('Төлем өңделуде...', 'info');
    
    // Төлемді имитациялау (2 секунд)
    setTimeout(() => {
        const booking = {
            id: Date.now(),
            roomId: room.id,
            roomName: room.name,
            guestName: document.getElementById('bookingName').value,
            phone: document.getElementById('bookingPhone').value,
            email: document.getElementById('bookingEmail').value,
            checkIn: document.getElementById('bookingCheckIn').value,
            checkOut: document.getElementById('bookingCheckOut').value,
            paymentMethod: paymentMethod,
            status: 'confirmed',
            total: calculateTotal(room.price),
            date: new Date().toISOString()
        };
        
        bookings.push(booking);
        localStorage.setItem('hotel_bookings', JSON.stringify(bookings));
        
        room.status = 'booked';
        localStorage.setItem('hotel_rooms', JSON.stringify(rooms));
        
        closeBookingModal();
        
        // Сәтті төлем модальды терезесін көрсету
        document.getElementById('successModal').style.display = 'flex';
        
        // Бөлмелер тізімін жаңарту
        displayRooms();
        
        // Email растау (имитация)
        setTimeout(() => {
            showNotification(`Растау хаты ${booking.email} жіберілді`, 'success');
        }, 1000);
    }, 2000);
}

function calculateTotal(pricePerNight) {
    const checkIn = document.getElementById('bookingCheckIn').value;
    const checkOut = document.getElementById('bookingCheckOut').value;
    const days = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    
    // Комиссияны есептеу
    const paymentMethod = document.getElementById('bookingPaymentSelect').value;
    let total = pricePerNight * days;
    
    if (paymentMethod === 'visa' || paymentMethod === 'mastercard') {
        total = total * 1.015; // 1.5% комиссия
    } else if (paymentMethod === 'paypal') {
        total = total * 1.02; // 2% комиссия
    }
    
    return Math.round(total);
}

// ==================== КІРУ ЖӘНЕ ТІРКЕЛУ ====================
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function showRegisterModal() {
    closeLoginModal();
    document.getElementById('registerModal').style.display = 'flex';
}

function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
}

function handleLogin(e) {
    e.preventDefault();
    showNotification('Жүйеге сәтті кірдіңіз!', 'success');
    closeLoginModal();
    document.getElementById('userBtn').innerHTML = '<i class="fas fa-user-check"></i>';
}

function handleRegister(e) {
    e.preventDefault();
    showNotification('Тіркелу сәтті аяқталды!', 'success');
    closeRegisterModal();
}

// ==================== ХАБАРЛАНДЫРУ ====================
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
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

// ==================== ТЕРЕЗЕНІ ЖАБУ ====================
window.onclick = function(event) {
    const modals = ['loginModal', 'registerModal', 'bookingModal', 'successModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// ==================== КҮНДЕРДІ ЖАҢАРТУ ====================
document.getElementById('bookingCheckIn')?.addEventListener('change', updateBookingTotal);
document.getElementById('bookingCheckOut')?.addEventListener('change', updateBookingTotal);
document.getElementById('bookingPaymentSelect')?.addEventListener('change', function() {
    updatePaymentMethod();
    updateBookingTotal();
});

// Карта нөмірін форматтау
document.getElementById('cardNumber')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\s/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += value[i];
    }
    e.target.value = formatted;
});

// Тек сандарды енгізу
document.getElementById('cardCvv')?.addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
});

document.getElementById('cardExpiry')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    
    if (value.length > 2) {
        e.target.value = value.slice(0, 2) + '/' + value.slice(2);
    } else {
        e.target.value = value;
    }
});