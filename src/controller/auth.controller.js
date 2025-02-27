const userService = require("../services/user.service.js");
const jwtProvider = require("../config/jwtProvider.js");
const bcrypt = require("bcrypt");
const cartService = require("../services/cart.service.js")

const register = async (req, res) => {

    try {

        const user =await userService.createUser(req.body);
        const jwt = jwtProvider.generateToken(user._id);

         await cartService.createCart(user._id);

        return res.status(200).send({ jwt, message: "registered success" })

    } catch (error) {
        console.error(error); // Log full error for debugging
        return res.status(500).send({ error: error.message || JSON.stringify(error) || "Something went wrong" });
        //return res.status(500).send({error: error.message}|| "something went wrong")

    }

}

const login = async (req, res) => {
    try {

        const { password, email } = req.body;

        const user = await userService.getUserByEmail(email);

        if (!user) {
            return res.status(404).send({message: "user not found with email: ", email})
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            return res.status(401).send({message:"Invalid Password"});
        }

        const jwt = jwtProvider.generateToken(user._id);
        return res.status(200).send({jwt, message:" login success"});
   
        
    } catch (error) {
        return res.status(500).send({error: error.message})
    }
}

module.exports = {register, login};