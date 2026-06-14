import { Router } from "express";
import { categoryRequestBodyValidator } from "../validators/category.validators.js";
import { createCategory, listCategories, getCategoryById, updateCategory, deleteCategory } from '../controllers/products/category.controllers.js'
import { validate } from "../validators/validate.js";
import { mongoIdPathVariableValidator } from "../validators/common/mongodb.validators.js";

const router = Router()


router.route('/')
    .post(categoryRequestBodyValidator(), validate, createCategory)
    .get(listCategories)
// router.route('/').get(listCategories)

router.route('/:categoryId')
    .get(mongoIdPathVariableValidator('categoryId'), validate, getCategoryById)
    .patch(
        categoryRequestBodyValidator(),
        mongoIdPathVariableValidator('categoryId'), validate, updateCategory)
    .delete(mongoIdPathVariableValidator('categoryId'), validate, deleteCategory)

export default router