import Stripe from "stripe";
import { env } from "../config/index.js";
import { ValidationMessages } from "../constants.js";
import { ApiError } from "./ApiError.js";
import { StatusCodes } from "http-status-codes";

let stripeClient = null;

const assertStripeConfig = () => {
  if (!env.ENABLE_STRIPE) {
    throw new ApiError(
      StatusCodes.SERVICE_UNAVAILABLE,
      ValidationMessages.StripeNotEnabled
    );
  }

  if (!env.STRIPE_SECRET_KEY) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "STRIPE_SECRET_KEY is not configured"
    );
  }
};

class StripeService {
  static isEnabled = () => env.ENABLE_STRIPE && Boolean(env.STRIPE_SECRET_KEY);

  static getClient = () => {
    assertStripeConfig();

    if (!stripeClient) {
      stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
        apiVersion: "2026-05-27.dahlia",
      });
    }

    return stripeClient;
  };

  static getPublishableKey = () => env.STRIPE_PUBLISHABLE_KEY || null;

  static getDefaultCurrency = () =>
    (env.STRIPE_DEFAULT_CURRENCY || "usd").toLowerCase();

  static getCheckoutSuccessUrl = () =>
    env.STRIPE_CHECKOUT_SUCCESS_URL ||
    `${env.FRONTEND_URL || env.HOST_URL}/payment/success`;

  static getCheckoutCancelUrl = () =>
    env.STRIPE_CHECKOUT_CANCEL_URL ||
    `${env.FRONTEND_URL || env.HOST_URL}/payment/cancel`;

  /**
   * Product prices in this boilerplate are stored in major currency units (e.g. dollars).
   * Stripe expects the smallest unit (e.g. cents).
   */
  static toStripeAmount = (amount) => Math.round(Number(amount) * 100);

  static fromStripeAmount = (amount) => Number(amount) / 100;

  static buildWebhookEvent = (rawBody, signature) => {
    assertStripeConfig();

    if (!env.STRIPE_WEBHOOK_SECRET) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "STRIPE_WEBHOOK_SECRET is not configured"
      );
    }

    if (!signature) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Missing Stripe-Signature header"
      );
    }

    try {
      return StripeService.getClient().webhooks.constructEvent(
        rawBody,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Webhook signature verification failed: ${error.message}`
      );
    }
  };
}

export default StripeService;
