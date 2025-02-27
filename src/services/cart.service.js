const Cart = require("../models/cart.model");
const CartItems = require("../models/cartItem.model");
const Product = require("../models/product.model");

async function createCart(user) {

    try {
        const cart = new Cart({ user });
        const createdCart = await cart.save();
        return createdCart;

    } catch (error) {
        throw new Error(error.message);

    }


}

async function findUserCart(userId) {

    try {
        let cart = await Cart.findOne({ user: userId })
        if (!cart) {
            throw new Error("Cart not found for user");
        }

        let cartItems = await CartItems.find({ cart: cart._id }).populate("product");

        cart.cartItems = cartItems;

        let totalPrice = 0;
        let totalDiscountedPrice = 0;
        let totalItem = 0;

        for (let cartItem of cart.cartItems) {
            totalPrice += cartItem.price;
            totalDiscountedPrice += cartItem.discountedPrice;
            totalItem += cartItem.quantity;
        }

        cart.totalPrice = totalPrice;
        cart.totalItem = totalItem;
        cart.discount = totalPrice - totalDiscountedPrice;

        return cart;

    } catch (error) {
        console.error("Error in findUserCart:", error); // Log the error for debugging
        throw new Error(error.message || "Something went wrong in findUserCart");
    }
}

// async function addCartItem(userId, req) {

//     try {
//         const cart = await Cart.findOne({ user: userId });
//         if (!cart) {
//             throw new Error("Cart not found for this user.");
//         }

//         const product = await Product.findById(req.productId);
//         if (!product) {
//             throw new Error("Product not found.");
//         }


//         const isPresent = await CartItems.findOne({ cart: cart._id, product: product._id, userId });

//         if (!isPresent) {
//             const cartItem = new CartItems({
//                 product: product._id,
//                 cart: cart._id,
//                 quantity: 1,
//                 userId,
//                 price: product.price,
//                 size: req.size,
//                 discountedPrice: product.discountedPrice,
//             })

//             const createdCartItem = await cartItem.save();
//             cart.cartItems.push(createdCartItem);
//             await cart.save();

//             return "Item added to cart";
//         }
//     } catch (error) {
//         console.error("Cart Service Error:", error);  // ✅ Log actual error
//         throw new Error(error.message || "An error occurred while adding to cart.");
//         //throw new Error({ error: error.message })
//     }
// }

async function addCartItem(userId, req) {
    try {
        let cart = await Cart.findOne({ user: userId });

        // ✅ Create a cart if it does not exist
        if (!cart) {
            cart = new Cart({
                user: userId,
                cartItems: [],
                totalPrice: 0,
                totalItem: 0,
                totalDiscountedPrice: 0,
                discount: 0
            });
            await cart.save();
        }

        const product = await Product.findById(req.productId);
        if (!product) {
            throw new Error("Product not found.");
        }

        // ✅ Check if the product is already in the cart
        let cartItem = await CartItems.findOne({ cart: cart._id, product: product._id, userId });

        if (cartItem) {
            // ✅ If item exists, increase quantity
            cartItem.quantity += 1;
            cartItem.price += product.price;
            cartItem.discountedPrice += product.discountedPrice;
            await cartItem.save();
        } else {
            // ✅ If item does not exist, create a new cart item
            cartItem = new CartItems({
                product: product._id,
                cart: cart._id,
                quantity: 1,
                userId,
                price: product.price,
                size: req.size,
                discountedPrice: product.discountedPrice,
            });

            const createdCartItem = await cartItem.save();
            cart.cartItems.push(createdCartItem._id);
        }

        // ✅ Update cart totals
        cart.totalPrice += product.price;
        cart.totalDiscountedPrice += product.discountedPrice;
        cart.totalItem += 1;
        cart.discount = cart.totalPrice - cart.totalDiscountedPrice;

        await cart.save();

        return { message: "Item added to cart" };

    } catch (error) {
        console.error("Cart Service Error:", error);
        throw new Error(error.message || "An error occurred while adding to cart.");
    }
}


module.exports = { createCart, findUserCart, addCartItem }