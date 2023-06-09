
const ProductClassModel = require("../models/product.js");
const Cart = require("../models/cart.js");

exports.getProducts = (req, res, next) => {
    //const products = adminData.products;
    //products already exists in this file no no need to define it

    //on fetchAll call, send this function that will be called to retrieve render 
    //based on the product status empty-array or data
    //*read file then pass read-products into this function to pass to the rendered ejs
    ProductClassModel.fetchAll(products => {
        res.render("shop/product-list", {prods: products, myTitle: "All Products page", path:"/products"});

    });


    //console.log("shop.js is logging: ", products );

};

//express js gives us a params object on our request
//access our productId because its used in the routes js files
exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    //console.log("prodId", prodId);
    ProductClassModel.findMyId(prodId, product => {
        //console.log(product);
        res.render("shop/product-details", {product: product, myTitle: product.title, path: "/products"});
    });
    //res.redirect("/");
}

//main-page
exports.getIndex = (req, res, next) => {
    ProductClassModel.fetchAll(products => {
        res.render("shop/index.ejs", {prods: products, myTitle: "Shop page", path:"/"});

    });
};


//relevant to add-to-cart button on ejs which passes productId
exports.postCart = (req, res, next) => {
    //retrieve the product id from the incoming request
    //then fetch our product in the database/file
    //add to our cart
    //productId is the name used in the view file form on hidden input
    const prodId = req.body.productId;
    //console.log(prodId);

    ProductClassModel.findMyId(prodId, (product) => {
        Cart.addProduct(prodId, product.price);
    });

    res.redirect("/cart");

};

exports.getCart = (req, res, next) => {             //router
    Cart.getCart(cart => {                          //returns cart to use in render
        
        ProductClassModel.fetchAll(products => {    //returns all my products
            const cartProducts = [];
            for (product of products) {             //for each product
                const cartProductData = cart.products.find(prod => prod.id === product.id);
                //find in cart products the product matching fetchAll products

                if (cartProductData) {
                    cartProducts.push({productData: product, qty: cartProductData.qty });
                }
            }
            res.render("shop/cart", {
                path: "/cart",
                myTitle: "Your Cart",
                products: cartProducts
            });
        });   

    });
};


exports.postCartDeleteProduct = (req, res, next) => {
    //need to remove product from the cart not the product it self
    const prodId = req.body.productId;
    //get the price
    ProductClassModel.findMyId(prodId, product => {
        Cart.deleteProduct(prodId, product.price);
        res.redirect("/cart");
    });
}


exports.getCheckout = (req, res, next) => {
    res.render("shop/checkout", {
        path: "/checkout",
        myTitle: "Checkout"
    });
};


exports.getOrders = (req, res, next) => {
    res.render("shop/orders", {
        path: "/orders",
        myTitle: "Your Orders"
    });
};