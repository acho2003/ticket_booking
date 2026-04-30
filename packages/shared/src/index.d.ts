export declare const APP_NAME = "Movi";
export declare const USER_ROLES: readonly ["CUSTOMER", "THEATRE_ADMIN", "SUPER_ADMIN"];
export type UserRole = (typeof USER_ROLES)[number];
export declare const MOVIE_STATUSES: readonly ["NOW_SHOWING", "UPCOMING", "ENDED"];
export type MovieStatus = (typeof MOVIE_STATUSES)[number];
export declare const SEAT_TYPES: readonly ["REGULAR", "VIP", "COUPLE", "BLOCKED"];
export type SeatType = (typeof SEAT_TYPES)[number];
export declare const SEAT_STATUSES: readonly ["AVAILABLE", "SELECTED", "RESERVED", "BOOKED", "BLOCKED"];
export type SeatStatus = (typeof SEAT_STATUSES)[number];
export declare const BOOKING_STATUSES: readonly ["RESERVED", "CONFIRMED", "CANCELLED"];
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export declare const PAYMENT_STATUSES: readonly ["PAY_AT_COUNTER", "PAID", "UNPAID"];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export declare const SHOWTIME_STATUSES: readonly ["ACTIVE", "CANCELLED", "COMPLETED"];
export type ShowtimeStatus = (typeof SHOWTIME_STATUSES)[number];
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
export interface ScreenSeat {
    id: string;
    screenId: string;
    rowLabel: string;
    seatNumber: number;
    seatCode: string;
    seatType: SeatType;
    isBlocked: boolean;
    status?: SeatStatus;
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
export declare const seatTypeColors: Record<SeatStatus | SeatType, string>;
export declare const formatCurrency: (amount: number) => string;
