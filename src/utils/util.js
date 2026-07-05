import crypto from "crypto";
import moment from "moment";
import { MediaTypes } from "../constants.js";

const Util = class {
  static parseBoolean(b) {
    return (b + "").toLowerCase() == "true";
  }

  static escapeRegex(textStr = "") {
    return textStr.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
  }

  static wrapWithRegexQry(textStr = "") {
    return new RegExp(Util.escapeRegex(textStr));
  }

  static formatToDdMmYyyyWithTime(dateObj, utcOffset = 0) {
    if (utcOffset) {
      utcOffset = parseInt(utcOffset);
    } else {
      utcOffset = 0;
    }
    return moment(dateObj).utcOffset(-utcOffset).format("DD/MM/YYYY, hh:mm A"); //01/01/2021 00:00 AM
  }

  static formatDateWithDdMmmYyyy() {
    return moment().format("DD-MMM-YYYY");
  }

  static removeTime(dateObj) {
    if (!dateObj) {
      return;
    }
    let year = dateObj.getUTCFullYear();
    let month = dateObj.getUTCMonth() + 1;
    let dt = dateObj.getUTCDate();
    if (dt < 10) {
      dt = "0" + dt;
    }
    if (month < 10) {
      month = "0" + month;
    }
    return year + "-" + month + "-" + dt;
  }

  /**
   * Create a SHA-256 hex digest for the provided token
   * @param {string} token
   * @returns {string}
   */
  static hashToken(token) {
    return crypto.createHash("sha256").update(String(token)).digest("hex");
  }

  /**
   * Generate a cryptographically strong JTI (UUID-like). Uses
   * crypto.randomUUID when available, otherwise falls back to random bytes.
   * @returns {string}
   */
  static generateJti() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return crypto.randomBytes(16).toString("hex");
  }

  static getMediaType = (mimeType) => {
    if (mimeType.startsWith("image/")) {
      return MediaTypes.Image;
    } else if (mimeType.startsWith("video/")) {
      return MediaTypes.Video;
    } else if (mimeType.startsWith("audio/")) {
      return MediaTypes.Audio;
    } else if (mimeType == "application/pdf") {
      return MediaTypes.Pdf;
    } else if (
      mimeType == "application/vnd.ms-excel" ||
      mimeType ==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return MediaTypes.Excel;
    } else if (
      mimeType == "application/msword" ||
      mimeType ==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return MediaTypes.Doc;
    }
    return MediaTypes.Image;
  };
};

export default Util;
