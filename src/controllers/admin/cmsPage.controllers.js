import { ResponseMessages, ValidationMessages } from "../../constants.js";
import CmsPageService from "../../db/services/cmsPage.services.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";

async function upsertCmsPage(req, res, next) {
  try {
    const slug = req.params.slug.toString().toLowerCase();

    const payload = {
      title: req.body.title,
      content: req.body.content,
    };

    const doc = await CmsPageService.upsertCmsPage(slug, payload);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, doc, ResponseMessages.UPDATED));
  } catch (err) {
    return next(err);
  }
}

async function getCmsPage(req, res, next) {
  try {
    const slug = req.params.slug.toString().toLowerCase();
    const doc = await CmsPageService.getCmsPageBySlug(slug);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, doc, ResponseMessages.FETCHED));
  } catch (err) {
    return next(err);
  }
}

export { upsertCmsPage, getCmsPage };
