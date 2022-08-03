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

// When the user clicks on div, open the popup
function myFunction() {
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
  }

