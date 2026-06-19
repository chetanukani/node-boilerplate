import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
const FCM_MAX_TOKEN_LIMIT = 499; // (actual limit is 500)

let admin;

export function initFirebaseAdmin() {
  if (getApps().length) return getApps()[0];

  admin = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });

  return admin;
}

function chunkArray(arr, size) {
  const res = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

function createObj(
  tokens,
  message,
  type,
  title = "Node boilerplate",
  metadata
) {
  const defaultSound = "default";
  const defaultChannelId = "default";
  const messageObj = {
    tokens,
    data: {
      type: type + "",
      ...(metadata ? JSON.parse(JSON.stringify(metadata)) : {}),
      sound: defaultSound,
    },
    android: {
      notification: {
        sound: defaultSound,
        channelId: defaultChannelId,
      },
    },
    apns: {
      payload: {
        aps: {
          sound: defaultSound,
        },
      },
    },
  };
  if (message) {
    messageObj.notification = {};
    messageObj.notification["title"] = title;
    messageObj.notification["body"] = message;
  }
  return messageObj;
}

export async function sendNotificationToTokens(
  tokens = [],
  { message, type, title, messageObj }
) {
  initFirebaseAdmin();
  const messaging = getMessaging();

  const chunks = chunkArray(tokens, FCM_MAX_TOKEN_LIMIT);
  const results = { successCount: 0, failureCount: 0, errors: [] };

  for (const chunk of chunks) {
    try {
      const obj = createObj(message, type, title, messageObj);
      const resp = await messaging.sendEachForMulticast(
        createObj(tokens, message, type, title, messageObj)
      );
      results.successCount += resp.successCount;
      results.failureCount += resp.failureCount;
      resp.responses.forEach((r, idx) => {
        if (r.error) {
          results.errors.push({ token: chunk[idx], error: r.error });
        }
      });
    } catch (err) {
      results.errors.push({ error: err });
    }
  }

  return results;
}

export default { sendNotificationToTokens };
