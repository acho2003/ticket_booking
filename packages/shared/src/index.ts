export const APP_NAME = "Movi";

export const USER_ROLES = ["CUSTOMER", "THEATRE_ADMIN", "SUPER_ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const MOVIE_STATUSES = ["NOW_SHOWING", "UPCOMING", "ENDED"] as const;
export type MovieStatus = (typeof MOVIE_STATUSES)[number];

export const SEAT_TYPES = ["REGULAR", "VIP", "COUPLE", "BLOCKED"] as const;
export type SeatType = (typeof SEAT_TYPES)[number];

export const SEAT_STATUSES = ["AVAILABLE", "SELECTED", "RESERVED", "BOOKED", "BLOCKED"] as const;
export type SeatStatus = (typeof SEAT_STATUSES)[number];

export const BOOKING_STATUSES = ["RESERVED", "CONFIRMED", "CANCELLED"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_STATUSES = ["PAY_AT_COUNTER", "PAID", "UNPAID"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const SHOWTIME_STATUSES = ["ACTIVE", "CANCELLED", "COMPLETED"] as const;
export type ShowtimeStatus = (typeof SHOWTIME_STATUSES)[number];

export const SHOWTIME_BOOKING_STATUSES = ["UPCOMING", "OPEN", "CLOSED", "COMPLETED", "CANCELLED"] as const;
export type ShowtimeBookingStatus = (typeof SHOWTIME_BOOKING_STATUSES)[number];

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
}

export interface MovieSummary {
  id: string;
  title: string;
  description: string;
  genre: string;
  language: string;
  durationMinutes: number;
  rating: string;
  posterUrl: string;
  trailerUrl?: string | null;
  regularPrice: number;
  vipPrice: number;
  couplePrice: number;
  releaseDate: string;
  status: MovieStatus;
}

export interface TheatreSummary {
  id: string;
  name: string;
  city: string;
  location: string;
  description?: string | null;
  contactNumber: string;
}

export interface ScreenLayoutSeatOverride {
  seatNumber: number;
  seatType: SeatType;
  isBlocked?: boolean;
}

export interface ScreenLayoutRow {
  rowLabel: string;
  seatCount: number;
  leftOffset?: number;
  rightOffset?: number;
  aisleAfter?: number[];
  defaultSeatType?: SeatType;
  overrides?: ScreenLayoutSeatOverride[];
}

export interface ScreenLayoutConfig {
  version: 1;
  rows: ScreenLayoutRow[];
}

export interface ScreenSeat {
  id: string;
  screenId: string;
  rowLabel: string;
  seatNumber: number;
  seatCode: string;
  seatType: SeatType;
  isBlocked: boolean;
  rowIndex?: number;
  layoutColumn?: number;
  rowWidth?: number;
  status?: SeatStatus;
  canBook?: boolean;
  bookingStatus?: ShowtimeBookingStatus;
  bookingClosesAt?: string;
  price?: number;
}

export interface ShowtimeSummary {
  id: string;
  movieId: string;
  theatreId: string;
  screenId: string;
  startTime: string;
  endTime: string;
  regularPrice: number;
  vipPrice: number;
  couplePrice: number;
  status: ShowtimeStatus;
  bookingStatus?: ShowtimeBookingStatus;
  bookingClosesAt?: string;
  canBook?: boolean;
  serverTime?: string;
  movie?: MovieSummary;
  theatre?: TheatreSummary;
}

export interface BookingSeatSummary {
  id: string;
  seatId: string;
  seatCode: string;
  price: number;
}

export interface BookingSummary {
  id: string;
  bookingCode: string;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  showtime: ShowtimeSummary;
  bookingSeats: BookingSeatSummary[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface SeatGenerationInput {
  screenName: string;
  rows: string[];
  columns: number[];
}

export const seatTypeColors: Record<SeatStatus | SeatType, string> = {
  AVAILABLE: "#D9F99D",
  SELECTED: "#FBBF24",
  RESERVED: "#93C5FD",
  BOOKED: "#F87171",
  BLOCKED: "#374151",
  REGULAR: "#22C55E",
  VIP: "#8B5CF6",
  COUPLE: "#EC4899"
};

export const formatCurrency = (amount: number) => `Nu. ${amount.toFixed(2)}`;
