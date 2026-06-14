import { Category } from "../../models/category.models.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body
    const category = await Category.create({
        name
    })
    return res.status(201).json(new ApiResponse(200, category, 'Category created successfully'))
})

const listCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find()
    return res.status(201).json(new ApiResponse(200, categories, 'Categories fetched successfully'))
})

const getCategoryById = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) {
        throw new ApiError(404, "Category does not exist");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, category, "Category fetched successfully"));
});

const updateCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const { name } = req.body;
    const category = await Category.findByIdAndUpdate(
        categoryId,
        {
            $set: {
                name,
            },
        },
        { returnDocument: 'after' }
    );
    if (!category) {
        throw new ApiError(404, "Category does not exist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, category, "Category updated successfully"));
});

const deleteCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
        throw new ApiError(404, "Category does not exist");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { deletedCategory: category },
                "Category deleted successfully"
            )
        );
});

export { createCategory, listCategories, getCategoryById, updateCategory, deleteCategory }
