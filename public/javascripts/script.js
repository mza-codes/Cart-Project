function refreshCart(proId){
    console.log('display from function refreshCart next proId');
    console.log(proId);
        $.ajax({
            url:'/add-to-cart/'+proId,
            method:'get',
            success:(response)=>{
                if(response.status){
                    let count = $('#cart-count').html()
                    count = parseInt(count)+1
                    $('#cart-count').html(count)
                }
                //window.alert(response)
                addedToCart()
                
            }
        })
    }

function addedToCart() {
    alert("Item Added to Cart Successfully");
}
