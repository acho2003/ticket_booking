import type { SeatType } from "@prisma/client";

export const PLATFORM_SERVICE_FEE_NU = 15;

export type ShowtimePriceInput = {
  regularPrice: number;
  vipPrice: number;
  couplePrice?: number | null;
};

export function normalizeTwoClassPrices<T extends ShowtimePriceInput>(prices: T) {
  return {
    ...prices,
    regularPrice: Number(prices.regularPrice),
    vipPrice: Number(prices.vipPrice),
    // Kept for legacy schema/API compatibility. Product-wise, COUPLE maps to Balcony.
    couplePrice: Number(prices.vipPrice)
  };
}

export function resolveSeatPrice(seatType: SeatType, prices: ShowtimePriceInput) {
  const normalizedPrices = normalizeTwoClassPrices(prices);

  if (seatType === "VIP" || seatType === "COUPLE") {
    return normalizedPrices.vipPrice;
  }

  return normalizedPrices.regularPrice;
}

