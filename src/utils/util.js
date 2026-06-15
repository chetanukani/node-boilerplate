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
};

export default Util;
