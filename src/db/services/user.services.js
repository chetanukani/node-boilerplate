import { TableFields } from "../../constants.js";
import Util from "../../utils/util.js";
import { User } from "../models/user.models.js";

class UserService {
  static addUser = async (userObj) => {
    const user = new User({ ...userObj });
    return await user.save();
  };

  static findUserByEmail = (email) => {
    return new ProjectionBuilder(async function () {
      return await User.findOne({ [TableFields.email]: email }, this);
    });
  };

  static findUserById = (id) => {
    return new ProjectionBuilder(async function () {
      return await User.findById(id, this);
    });
  };

  static findByForgotToken = (hashedToken) => {
    return new ProjectionBuilder(async function () {
      return await User.findOne(
        {
          forgotPasswordToken: hashedToken,
          forgotPasswordExpiry: { $gt: Date.now() },
        },
        this
      );
    });
  };

  static updateUser = async (userId, updatedFields) => {
    await User.findByIdAndUpdate(userId, {
      ...updatedFields,
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
      projection[TableFields.avatar] = 1;
      projection[TableFields.email] = 1;
      projection[TableFields.username] = 1;
      projection[TableFields.role] = 1;
      return this;
    };

    this.withPassword = () => {
      projection[TableFields.password] = 1;
      return this;
    };

    this.withLoginType = () => {
      projection[TableFields.loginType] = 1;
      return this;
    };

    this.withRole = () => {
      projection[TableFields.role] = 1;
      return this;
    };

    this.withAuthTokens = () => {
      projection[TableFields.email] = 1;
      projection[TableFields.username] = 1;
      projection[TableFields.role] = 1;
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

export default UserService;
