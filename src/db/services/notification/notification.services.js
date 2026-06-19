import { User } from "../../models/user.models.js";
import { Notification } from "../../models/notification.models.js";
import { sendNotificationToTokens } from "../../../utils/notification.js";
import { TableFields } from "../../../constants.js";
import { NotificationMessageGenerator } from "./notification.messages.js";
import { title } from "process";

function createNotificationObject(
  userId,
  message,
  type,
  metadata = "",
  title = ""
) {
  const notificationObj = {
    [TableFields.user]: userId,
    [TableFields.message]: message,
    [TableFields.type]: type,
  };

  if (metadata) {
    notificationObj[TableFields.metadata] = metadata;
  }
  if (title) {
    notificationObj[TableFields.title] = title;
  }
  return notificationObj;
}

class NotificationService {
  static invalidTokensHandler = async (tokens = []) => {
    await User.updateMany(
      {
        [TableFields.fcmTokens + "." + TableFields.token]: { $in: tokens },
      },
      {
        $pull: {
          [TableFields.fcmTokens]: { [TableFields.token]: { $in: tokens } },
        },
      }
    );
  };

  /**
   * Send notification to a user by id and prune invalid tokens
   * @param {string} userId
   * @param {{notification?:{title:string,body:string}, data?:object}} message
   */
  static async sendNotificationToUserById(userId) {
    if (!userId) return;

    const user = await User.findById(userId, {
      [TableFields.fcmTokens]: {
        $map: {
          input: "$" + TableFields.fcmTokens,
          as: "b",
          in: "$$b." + TableFields.token,
        },
      },
    }).lean();
    if (!user) return;

    const msg = NotificationMessageGenerator.Testing.generate();
    const metadataObj = {
      order: "123", //This may be anything this is just an example
    };
    await Notification.create(
      createNotificationObject(
        user[TableFields.ID],
        msg.message,
        msg.type,
        metadataObj,
        msg.title
      )
    );
    const fcmObj = {
      message: msg.message,
      type: msg.type,
      title: msg.title,
      metadataObj,
    };
    const result = await sendNotificationToTokens(
      user[TableFields.fcmTokens],
      fcmObj
    );

    // Remove invalid tokens from user (keep this logic, it's useful and simple)
    if (result.errors && result.errors.length) {
      const badTokens = getBadFcmTokens(result.errors);
      if (badTokens.length) {
        await this.invalidTokensHandler(badTokens);
      }
    }
  }
}

function getBadFcmTokens(errors = []) {
  const badTokenErrorCodes = new Set([
    "messaging/registration-token-not-registered",
    "messaging/invalid-registration-token",
    "messaging/invalid-argument",
  ]);

  return errors
    .filter((e) => badTokenErrorCodes.has(e.error?.code))
    .map((e) => e.token)
    .filter(Boolean);
}

export default NotificationService;
