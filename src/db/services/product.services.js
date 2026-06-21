import { TableFields } from "../../constants.js";
import Util from "../../utils/util.js";
import { Product } from "../models/product.models.js";

class ProductService {
  static addProduct = async (productObj) => {
    const product = new Product({ ...productObj });
    return product.save();
  };

  static addProducts = async (products) => {
    return Product.insertMany(products, { ordered: true });
  };

  static getProductById = (id, lean = false) => {
    return new ProjectionBuilder(async function () {
      return Product.findOne({ [TableFields.ID]: id }, this).lean(lean);
    });
  };

  static listProduct = (filter = {}) => {
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
        needCount ? Product.countDocuments(qry) : undefined,
        Product.find(qry, projectionFields)
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

    this.withBasicInfo = () => {
      projection[TableFields.name_] = 1;
      projection[TableFields.description] = 1;
      projection[TableFields.price] = 1;
      projection[TableFields.stock] = 1;
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

export default ProductService;
