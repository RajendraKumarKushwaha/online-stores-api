const Address = require("../models/address.model.js");
const Order = require("../models/order.model.js");
const OrderItem = require("../models/orderItems.js");
const cartService = require("./cart.service.js");


// async function createOrder(user, shippingAddress) {

//     let address;

//     if (shippingAddress._id) {
//         let existAddress = await Address.findById(shippingAddress._id);
//         address = existAddress;

//     } else {
//         address = new Address(shippingAddress);
//         address.user = user;
//         await address.save();
        
//         console.log("user.address", user.address)

//         if (!user.address) {
//             user.address = []; // Initialize if undefined
//         }
//         user.address.push(address);
//         await user.save();
//     }

//     const cart = await cartService.findUserCart(user._id);
// if (!cart.cartItems || cart.cartItems.length === 0) {
//    throw new Error('Cart is empty. Cannot create order.');
// }
//     const orderItems = [];

//     for (const item of cart.cartItems) {
       
//         const orderItem = new OrderItem({
//             price: item.price,
//             product: item.product,
//             quantity: item.quantity,
//             size: item.size,
//             userId: item.userId,  
//             discountedprice: item.totalDiscountedPrice,  

//         });
//         const createdOrderItem = await orderItem.save();
//         orderItems.push(createdOrderItem)
//     }

//     const createdOrder = new Order({
//         user,
//         orderItems,
//         totalPrice: cart.totalPrice,
//         totalDiscountedPrice: cart.totalDiscountedPrice,
//         discount: cart.discount,
//         totalItem: cart.totalItem,
//         shippingAddress: address,
//     })

//     const savedOrder = await createdOrder.save();

//     return savedOrder;
// }

async function createOrder(user, shippingAddress) {

    let address;

    if (shippingAddress._id) {
        let existAddress = await Address.findById(shippingAddress._id);
        address = existAddress;
    } else {
        address = new Address(shippingAddress);
        address.user = user;
        await address.save();

        if (!user.address) {
            user.address = []; // Initialize if undefined
        }
        user.address.push(address);
        await user.save();
    }

    const cart = await cartService.findUserCart(user._id);
    
    // Check if there are no items in the cart
    if (!cart.cartItems || cart.cartItems.length === 0) {
        throw new Error('Cart is empty. Cannot create order.');
    }

    const orderItems = [];

    for (const item of cart.cartItems) {
        if (!item.userId || item.discountedPrice == null) {
            console.log("Invalid cart item:", item);
            continue; // Skip this item if required fields are missing
        }
          console.log(`price, ${item.price}, `)
        const orderItem = new OrderItem({
            price: item.price,
            product: item.product,
            quantity: item.quantity,
            size: item.size,
            userId: item.userId,  // Ensure userId is passed
            discountedPrice: item.discountedPrice,  // Ensure discountedPrice is passed
        });

        const createdOrderItem = await orderItem.save();
        orderItems.push(createdOrderItem);
    }

    const createdOrder = new Order({
        user,
        orderItems,
        totalPrice: cart.totalPrice,
        totalDiscountedPrice: cart.totalDiscountedPrice,
        discount: cart.discount,
        totalItem: cart.totalItem,
        shippingAddress: address,
    });

    const savedOrder = await createdOrder.save();

    return savedOrder;
}








async function placeOrder(orderId) {
    const order = findOrderById(orderId);

    order.orderStatus = "PLACED";
    order.paymentDetails.status = "COMPLETED";

    return await order.save();

}

async function confirmedOrder(orderId) {
    const order = findOrderById(orderId);

    order.orderStatus = "CONFIRMED";

    return await order.save();

}

async function shipOrder(orderId) {
    const order = findOrderById(orderId);

    order.orderStatus = "SHIPPED";

    return await order.save();

}

async function deliverOrder(orderId) {
    const order = findOrderById(orderId);

    order.orderStatus = "DELIVERED";

    return await order.save();

}

async function cancelOrder(orderId) {
    const order = findOrderById(orderId);

    order.orderStatus = "CANCELLED";

    return await order.save();

}

async function findOrderById(orderId) {

    const order = await Order.findById(orderId)
        .populate("user")
        .populate({ path: "orderItems", populate: ({ path: "product" }) })
        .populate("shippingAddress")

    return order;
}

// for Admin

async function usersOrderHistory(userId) {

    try {

        const orders = await Order.find({ user: userId, orderStatus: "PLACED" })
            .populate({ path: "orderItems", populate: { path: "product" } }).lean()

        return orders;

    } catch (error) {
        throw new Error(error.message)

    }

}

async function getAllOrders() {
    return await Order.find()
        .populate({ path: "orderItems", populate: { path: "product" } }).lean()
}

async function deleteOrder(orderId) {

    const order = await findOrderById(orderId)
    await Order.findByIdAndDelete(order._id)

}

module.exports = { createOrder, placeOrder, confirmedOrder, shipOrder, deliverOrder, cancelOrder, findOrderById, usersOrderHistory, getAllOrders, deleteOrder } 