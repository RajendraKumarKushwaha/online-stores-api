
const CartItems = require("../models/cartItem.model.js");
const userService = require("./user.service.js");

async function updateCartItem(userId, cartItemId, cartItemData) {

    try {

        const item = await CartItems.findById(cartItemId).populate("product");

        if (!item) {
            throw new Error("Cart Item not found");
        }

        const user = await userService.findUserById(userId);

        if (!user) {
            throw new Error("user not found :", userId)
        }
           console.log("product", item.product)
        if (user._id.toString() === userId.toString()) {
            item.quantity = cartItemData.quantity;
            item.price = item.quantity * item.product.price;
            item.discountedPrice = item.quantity * item.product.discountedPrice;
            const updatedCartItem = await item.save();
            return updatedCartItem;
        } else {
            throw new Error("You can't update this cart item");
        }
    } catch (error) {
        throw new Error(error.message)

    }

}

async function removeCartItem(userId, cartItemId) {

    const cartItem = await findCartItemById(cartItemId);
    const user = await userService.findUserById(userId);

    if (user._id.toString() === cartItem.userId.toString()) {
        await CartItems.findByIdAndDelete(cartItemId)

    }
    else {
        throw new Error("You can't remove another user item");
    }


}

async function findCartItemById(cartItemId) {
    const cartItem = await CartItems.findById(cartItemId);
    if (cartItem) {
        return cartItem;
    } else {
        throw new Error(`Cart Item not found with id: ${cartItemId}`);
    }
}


module.exports = { updateCartItem, removeCartItem, findCartItemById }