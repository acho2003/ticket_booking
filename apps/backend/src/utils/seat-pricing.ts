import type { SeatType } from "@prisma/client";

export const resolveSeatPrice = (
  seatType: SeatType,
  prices: { regularPrice: number; vipPrice: number; couplePrice: number }
) => {
  if (seatType === "VIP") {
    return prices.vipPrice;
  }

  if (seatType === "COUPLE") {
    return prices.couplePrice;
  }

  return prices.regularPrice;
};
