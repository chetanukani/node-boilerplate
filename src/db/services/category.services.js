import { TableFields } from "../../constants.js";
import Util from "../../utils/util.js";
import { MongoUtil } from "../index.js";
import { Category } from "../models/category.models.js";

class CategoryService {
  static addCategory = async (category) => {
    return Category.create(category);
  };

  static updateCategory = async (categoryId, updatedFields) => {
    return Category.findByIdAndUpdate(
      categoryId,
      {
        ...updatedFields,
      },
      {
        returnDocument: "after",
      }
    );
  };

  static deleteCategory = async (categoryId, updatedFields) => {
    return Category.findByIdAndDelete(categoryId);
  };

  static getCategoryById = (id, lean = false) => {
    return new ProjectionBuilder(async function () {
      return Category.findOne({ [TableFields.ID]: id }, this).lean(lean);
    });
  };

  static getCategoryByIds = (ids, lean = false) => {
    return new ProjectionBuilder(async function () {
      return Category.find(
        { [TableFields.ID]: { $in: ids.map((a) => MongoUtil.toObjectId(a)) } },
        this
      ).lean(lean);
    });
  };

  static listCategory = (filter = {}) => {
    return new ProjectionBuilder(async function () {
      const limit = filter.limit || 0;
      const skip = filter.skip || 0;
      const sortKey = filter.sortKey || TableFields.createdAt;
      const sortOrder = filter.sortOrder || -1;
      const needCount = Util.parseBoolean(filter.needCount);
      const searchTerm = filter.searchTerm;

      const qry = {};
      if (searchTerm) {
        qry["$or"] = [
          {
            [TableFields.name_]: {
              $regex: Util.wrapWithRegexQry(searchTerm),
              $options: "i",
            },
          },
        ];
      }

      const populateFields = this.populate;
      const projectionFields = { ...this };
      delete projectionFields.populate;

      const [total, records] = await Promise.all([
        needCount ? Category.countDocuments(qry) : undefined,
        Category.find(qry, projectionFields)
          .limit(parseInt(limit))
          .skip(parseInt(skip))
          .sort({ [sortKey]: parseInt(sortOrder) })
          .populate(populateFields),
      ]);

      return { total, records };
    });
  };
}

class ProjectionBuilder {
  constructor(methodToExecute) {
    const projection = { populate: {} };

    this.withId = () => {
      projection[TableFields.ID] = 1;
      return this;
    };

    this.withName = () => {
      projection[TableFields.name_] = 1;
      return this;
    };

    this.execute = async () => {
      if (Object.keys(projection.populate).length === 0) {
        delete projection.populate;
      } else {
        projection.populate = Object.values(projection.populate);
      }
      return methodToExecute.call(projection);
    };
  }
}

export default CategoryService;
