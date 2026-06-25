import { ResponseMessages, ValidationMessages } from "../../constants.js";
import CmsPageService from "../../db/services/cmsPage.services.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";

const upsertCmsPage = asyncHandler(async (req, res) => {
  const slug = req.params.slug.toString().toLowerCase();

  const payload = {
    title: req.body.title,
    content: req.body.content,
  };

  const doc = await CmsPageService.upsertCmsPage(slug, payload);

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, doc, ResponseMessages.UPDATED));
});

const getCmsPage = asyncHandler(async (req, res) => {
  const slug = req.params.slug.toString().toLowerCase();
  const doc = await CmsPageService.getCmsPageBySlug(slug);

  if (!doc) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      ValidationMessages.RecordNotFound
    );
  }

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, doc, ResponseMessages.FETCHED));
});

export { upsertCmsPage, getCmsPage };
