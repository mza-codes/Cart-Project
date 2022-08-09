function refreshCart(proId) {
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'get',
        success: (response) => {
            if (response.status) {
                let count = $('#cart-count').html()
                count = parseInt(count) + 1
                $('#cart-count').html(count)
            }
            alert('Item Added to Cart Successfully')
        }
    })
}

function addToWishlist(proId) {
    $.ajax({
        url: '/add-to-wishlist/' + proId,
        method: 'get',
        success: (response) => {
            if (response.status) {
                let count = $('#wishlist-count').html()
                count = parseInt(count) + 1
                $('#wishlist-count').html(count)
                alert('Item Wishlisted')
            }else{
                alert('Item Already Exist !')
            }
            
        }
    })
}

function delFromWishlist(proId) {
    $.ajax({
        url: '/delfromwishlist/' + proId,
        method: 'get',
        success: (response) => {
            if (response) {
                let count = $('#wishlist-count').html()
                count = parseInt(count) - 1
                $('#wishlist-count').html(count)
                alert('Item Removed')
                location.reload()
            }else{
                alert('Failed Task !')
            }
            
        }
    })
}

function delFromCart(cartId, proId) {
    let quantity = 1
    let count = -1              // here i use the remove if qty is 1 action by manually setting desired values !
    $.ajax({
        url: '/changeQty',
        data: {
            cart: cartId,
            product: proId,
            count: count,
            quantity: quantity
        },
        method: 'post',
        success: (response) => {
            console.log(response)
            if (response.removed) {
                alert('Item removed from cart !')
                location.reload()
            } else {
                document.getElementById(proId).innerHTML = quantity + count
            }

        }
    })

}

// function online(value) {
//     document.getElementById('selection').innerHTML = 'You have Selected Online Payment Method'
// }
// function cod(value) {
//     document.getElementById('selection').innerHTML = 'You have Selected Cash On Delivery Payment Method'
// }

function payNow(orderId,total){
    $.ajax({
        url: '/pay-online/',
        data: {
            orderId:orderId,
            total:total,
        },
        method: 'post',
        success: (response) => {
            if (response.initiatePayment) {
                doOnlinePayment(response)
            }else{
                alert('Failed !')
            }
        }
    })
}

$("#checkout-form").submit((e) => {
    e.preventDefault()
    $.ajax({
        url: '/place-order',
        method: 'post',
        data: $('#checkout-form').serialize(),
        success: (response) => {
            if (response.codSuccess) {
                location.href = '/order-success'
            } else if (response.initiatePayment) {
                console.log('LOGGING XX3 RESPONSE AJAX AREA',response)
                doOnlinePayment(response)
            }
        }
    })
})
function doOnlinePayment(order) {
    var options = {
        "key": "rzp_test_IvGWMBpENteAE2", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "XCart",
        "description": "Test Transaction xCart",
        "image": '',
        "order_id": order.id,
        "handler": function (response) {

            verifyPayment(response, order)
        },
        "prefill": {
            "name": order.address.fullname,
            "email": order.address.email,
            "pincode":order.address.pincode,
            "contact": order.address.mobile,
        },
        "notes": {
            "landmark": order.address.landmark
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    //--Razorpay Calling
    var rzp1 = new Razorpay(options);
    rzp1.open();
}
function verifyPayment(payment, order) {
    $.ajax({
        url: '/verify-payment',
        "headers": {
            "Content-Type": "application/json"
        },
        data: JSON.stringify({ payment}),
        //data: {
        //payment,
        //  order,
        //},
        method: 'post',
        success: (response) => {
            if (response.status) {
                location.href = '/order-success'
            } else {
                alert('PAYMENT FAILED')
            }

        }
    })
}

// When the user clicks on div, open the popup
function miniCart() {
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
  }
