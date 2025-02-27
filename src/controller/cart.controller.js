const cartService = require("../services/cart.service.js");

const findUserCart = async(req,res)=>{
    const user =await  req.user;
    console.log("user",user)

    try {
        if (!req.user) {
            return res.status(400).json({ error: "User not found in request" });
        }
        const cart = await cartService.findUserCart(user);
        return res.status(200).send(cart);
    } catch (error) {
        console.error("Error in findUserCart:", error); // Log error for debugging
        return res.status(500).json({ error: error.message || "Internal Server Error" });
        //return res.status(500).send({error:error.message})
        
    }
    
}

const addItemToCart = async(req,res)=>{
    const user = req.user;

    try {
        const cartItem = await cartService.addCartItem(user._id, req.body);
        return res.status(200).send(cartItem);
    } catch (error) {
        return res.status(500).send({error:error.message})
        
    }
    
}

module.exports = {findUserCart, addItemToCart}