import type { ShowtimeStatus } from "@prisma/client";
import { addMinutes } from "date-fns";

export const BOOKING_GRACE_MINUTES = 30;

export type ShowtimeBookingStatus = "UPCOMING" | "OPEN" | "CLOSED" | "COMPLETED" | "CANCELLED";

type ShowtimeStateInput = {
  status: ShowtimeStatus;
  startTime: Date;
  endTime: Date;
};

export const getBookingCutoffTime = (startTime: Date) => addMinutes(startTime, BOOKING_GRACE_MINUTES);

export const getShowtimeBookingState = (showtime: ShowtimeStateInput, now = new Date()) => {
  const bookingClosesAt = getBookingCutoffTime(showtime.startTime);

  if (showtime.status === "CANCELLED") {
    return {
      bookingStatus: "CANCELLED" as const,
      canBook: false,
      bookingClosesAt
    };
  }

  if (showtime.status === "COMPLETED" || now > showtime.endTime) {
    return {
      bookingStatus: "COMPLETED" as const,
      canBook: false,
      bookingClosesAt
    };
  }

  if (now > bookingClosesAt) {
    return {
      bookingStatus: "CLOSED" as const,
      canBook: false,
      bookingClosesAt
    };
  }

  return {
    bookingStatus: now < showtime.startTime ? ("UPCOMING" as const) : ("OPEN" as const),
    canBook: true,
    bookingClosesAt
  };
};

export const decorateShowtimeState = <T extends ShowtimeStateInput>(showtime: T, now = new Date()) => ({
  ...showtime,
  ...getShowtimeBookingState(showtime, now),
  serverTime: now
});
