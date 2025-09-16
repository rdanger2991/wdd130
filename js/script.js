// Fonctionnalités générales du site
$(document).ready(function() {
    // Initialisation des tooltips Bootstrap
    $('[data-toggle="tooltip"]').tooltip();
    
    // Gestion de l'affichage du panier
    updateCartCount();
    
    // Animation au défilement
    $(window).scroll(function() {
        $('.fade-in').each(function() {
            var position = $(this).offset().top;
            var scrollPosition = $(window).scrollTop() + $(window).height();
            
            if (position < scrollPosition) {
                $(this).addClass('visible');
            }
        });
    });
    
    // Gestion de la recherche
    $('.navbar-form').submit(function(e) {
        e.preventDefault();
        var searchTerm = $(this).find('input').val();
        if (searchTerm.length > 2) {
            window.location.href = 'catalogue.html?search=' + encodeURIComponent(searchTerm);
        }
    });
    
    // Gestion des produits
    $('.add-to-cart').click(function() {
        var productId = $(this).data('id');
        addToCart(productId, 1);
    });
    
    $('.quick-view').click(function() {
        var productId = $(this).data('id');
        showQuickView(productId);
    });
});

// Fonctions du panier
function addToCart(productId, quantity) {
    // Récupérer le panier actuel du localStorage
    var cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Vérifier si le produit est déjà dans le panier
    var existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            quantity: quantity,
            added_at: new Date().toISOString()
        });
    }
    
    // Sauvegarder le panier mis à jour
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Mettre à jour l'affichage du panier
    updateCartCount();
    
    // Afficher une notification
    showNotification('Produit ajouté au panier!', 'success');
}

function updateCartCount() {
    var cart = JSON.parse(localStorage.getItem('cart')) || [];
    var totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    $('.cart-count').text(totalItems);
}

function showNotification(message, type) {
    // Créer une notification toast
    var toast = $('<div class="alert alert-' + type + ' alert-dismissible fade in" role="alert" style="position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 250px;">')
        .append('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
        .append(message);
    
    // Ajouter la notification au body
    $('body').append(toast);
    
    // Supprimer automatiquement après 3 secondes
    setTimeout(function() {
        toast.alert('close');
    }, 3000);
}

function showQuickView(productId) {
    // Charger les détails du produit via AJAX
    $.get('api/product.php?id=' + productId, function(data) {
        // Créer une modal avec les détails du produit
        var modal = $('#quickViewModal');
        if (modal.length === 0) {
            modal = $('<div class="modal fade" id="quickViewModal" tabindex="-1" role="dialog"></div>');
            $('body').append(modal);
        }
        
        // Contenu de la modal
        modal.html(`
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title">${data.name}</h4>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-sm-6">
                                <img src="${data.image}" class="img-responsive" alt="${data.name}">
                            </div>
                            <div class="col-sm-6">
                                <p class="product-price">${data.price} €</p>
                                <p>${data.description}</p>
                                <div class="form-group">
                                    <label for="quantity">Quantité:</label>
                                    <input type="number" id="quantity" class="form-control" value="1" min="1">
                                </div>
                                <button class="btn btn-primary btn-block add-to-cart-modal" data-id="${data.id}">Ajouter au panier</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        // Afficher la modal
        modal.modal('show');
        
        // Gérer l'ajout au panier depuis la modal
        $('.add-to-cart-modal').click(function() {
            var quantity = parseInt($('#quantity').val());
            addToCart(productId, quantity);
            modal.modal('hide');
        });
    });
}