document.addEventListener('DOMContentLoaded', async () => {
    // Set Greeting
    await setGreeting();

    // Load Orders
    await loadOrders();
});

// Fetch and Display Orders
async function loadOrders() {
    const fullOrigin = window.location.origin;
    const apiUrl = "http://electronic-shop-env.eba-t639vept.us-east-1.elasticbeanstalk.com";
    const token = localStorage.getItem('access_token');
    const orderList = document.getElementById('order-list');

    if (!token) {
        orderList.innerHTML = `<p class="no-orders">Please log in to view your orders.</p>`;
        return;
    }

    try {
        const response = await fetch(`${apiUrl}:8000/api/orders/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const orders = await response.json();
        console.log('Orders API Response:', orders); // Debugging the response

        if (response.ok) {
            if (Array.isArray(orders) && orders.length === 0) {
                orderList.innerHTML = `<p class="no-orders">You have no orders at the moment. Start shopping!</p>`;
            } else if (Array.isArray(orders)) {
                orderList.innerHTML = ''; // Clear any existing content
                orders.forEach(order => {
                    const orderCard = `
                        <div class="order-card">
                            <h3>Order #${order.id}</h3>
                            <p><strong>Product:</strong> ${order.product.name}</p>
                            <p><strong>Quantity:</strong> ${order.quantity}</p>
                            <p><strong>Total Price:</strong> $${order.total_price}</p>
                            <p><strong>Address:</strong> ${order.address}</p>
                            <p><strong>Ordered At:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                            <button onclick="downloadReceipt(${order.id})">Download Receipt</button>
                        </div>
                    `;
                    orderList.innerHTML += orderCard;
                });
            } else {
                throw new Error('Unexpected data format');
            }
        } else {
            const errorData = await response.json();
            orderList.innerHTML = `<p class="error-message">Error: ${errorData.message || 'Failed to load orders.'}</p>`;
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        orderList.innerHTML = `<p class="error-message">An error occurred. Please try again later.</p>`;
    }
}

// Download Receipt Function
async function downloadReceipt(orderId) {
    const fullOrigin = window.location.origin;
    const apiUrl = "http://electronic-shop-env.eba-t639vept.us-east-1.elasticbeanstalk.com";
    const token = localStorage.getItem('access_token');

    try {
        const response = await fetch(`${apiUrl}:8000/api/orders/${orderId}/receipt/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            const receiptUrl = data.receipt_url; // Assuming 'receipt_url' is the key in the response JSON
            if (receiptUrl) {
                const downloadLink = document.createElement('a');
                downloadLink.href = receiptUrl;
                downloadLink.setAttribute('target', '_blank');  // Open in a new tab
                downloadLink.innerText = 'Download/View Receipt';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            } else {
                alert('Receipt URL not found.');
            }
        } else {
            const errorData = await response.json(); // Assuming the server sends a readable error message
            alert(`Failed to download receipt: ${errorData.message || 'Unknown error'}.`);
        }
    } catch (error) {
        console.error('Error downloading receipt:', error);
        alert('An error occurred while downloading the receipt.');
    }
}


// Set Greeting for Navbar
async function setGreeting() {
    const fullOrigin = window.location.origin;
    const apiUrl = "http://electronic-shop-env.eba-t639vept.us-east-1.elasticbeanstalk.com";
    const greetingElement = document.getElementById('greeting');
    const token = localStorage.getItem('access_token');

    if (!token) {
        greetingElement.innerText = 'Welcome, Guest';
        return;
    }

    try {
        const response = await fetch(`${apiUrl}:8000/api/user/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const user = await response.json();
            greetingElement.innerText = `Welcome, ${user.username}`;
        } else {
            greetingElement.innerText = 'Welcome, Guest';
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        greetingElement.innerText = 'Welcome, Guest';
    }
}

// Logout Functionality
document.getElementById('logout-link').addEventListener('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    alert('You have been logged out.');
    window.location.href = 'login.html';
});
