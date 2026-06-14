import { Router } from "express";
import passport from "passport";
import { UserRolesEnum } from "../constants.js";
import { userLoginValidator, userRegisterValidator } from "../validators/user/user.validators.js";
import { validate } from "../validators/validate.js";
import { registerUser, loginUser, logoutUser, getProfile } from "../controllers/user/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()

router.route('/register').post(userRegisterValidator(), validate, registerUser)
router.route('/login').post(userLoginValidator(), validate, loginUser)


router.route('/logout').post(verifyJWT, logoutUser)
router.route('/profile').get(verifyJWT, getProfile)

export default router
