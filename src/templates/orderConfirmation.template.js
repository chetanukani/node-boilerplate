/**
 * @param {string} username
 * @param {any[]} items
 * @param {number} totalCost
 * @returns {import("mailgen").Content}
 */
export const orderConfirmationMailgenContent = (username, items, totalCost) => {
  return {
    body: {
      name: username,
      intro: "Your order has been processed successfully.",
      table: {
        data: items?.map((item) => {
          return {
            item: item.product?.name,
            price: "INR " + item.product?.price + "/-",
            quantity: item.quantity,
          };
        }),
        columns: {
          customWidth: {
            item: "20%",
            price: "15%",
            quantity: "15%",
          },
          customAlignment: {
            price: "right",
            quantity: "right",
          },
        },
      },
      outro: [
        `Total order cost: INR ${totalCost}/-`,
        "You can check the status of your order and more in your order history",
      ],
    },
  };
};
