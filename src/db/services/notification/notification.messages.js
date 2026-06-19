export const NotificationMessageGenerator = {
  Testing: {
    type: 1,
    generate() {
      return {
        type: this.type,
        message: "This is testing notification",
        title: "Notification Testing",
      };
    },
  },
};
