import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import { env } from "../config/index.js";
import { emailVerificationMailgenContent } from "../templates/emailVerification.template.js";
import { forgotPasswordMailgenContent } from "../templates/forgotPassword.template.js";
import { orderConfirmationMailgenContent } from "../templates/orderConfirmation.template.js";

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Node Boilerplate",
    link: "https://chetanukani.vercel.app/",
  },
});

/**
 *
 * @param {{email: string; subject: string; mailgenContent: Mailgen.Content; }} options
 */
const sendEmail = async (options) => {
  // Generate the plaintext version of the e-mail (for clients that do not support HTML)
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

  // Generate an HTML email with the provided contents
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  // Create a nodemailer transporter instance which is responsible to send a mail
  const transporter = nodemailer.createTransport(
    {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    },
    {
      from: `${process.env.SMTP_SENDER_NAME} <${process.env.SMTP_USER}>`,
    }
  );

  const mail = {
    to: options.email, // receiver's mail
    subject: options.subject, // mail subject
    text: emailTextual, // mailgen content textual variant
    html: emailHtml, // mailgen content html variant
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    // As sending email is not strongly coupled to the business logic it is not worth to raise an error when email sending fails
    // So it's better to fail silently rather than breaking the app
    console.error(
      "Email service failed silently. Make sure you have provided your credentials in the .env file"
    );
    console.error("Error: ", error);
  }
};

export {
  sendEmail,
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  orderConfirmationMailgenContent,
};
