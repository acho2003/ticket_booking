"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = exports.seatTypeColors = exports.SHOWTIME_STATUSES = exports.PAYMENT_STATUSES = exports.BOOKING_STATUSES = exports.SEAT_STATUSES = exports.SEAT_TYPES = exports.MOVIE_STATUSES = exports.USER_ROLES = exports.APP_NAME = void 0;
exports.APP_NAME = "Bhutan Movie Booking Platform";
exports.USER_ROLES = ["CUSTOMER", "THEATRE_ADMIN", "SUPER_ADMIN"];
exports.MOVIE_STATUSES = ["NOW_SHOWING", "UPCOMING", "ENDED"];
exports.SEAT_TYPES = ["REGULAR", "VIP", "COUPLE", "BLOCKED"];
exports.SEAT_STATUSES = ["AVAILABLE", "SELECTED", "RESERVED", "BOOKED", "BLOCKED"];
exports.BOOKING_STATUSES = ["RESERVED", "CONFIRMED", "CANCELLED"];
exports.PAYMENT_STATUSES = ["PAY_AT_COUNTER", "PAID", "UNPAID"];
exports.SHOWTIME_STATUSES = ["ACTIVE", "CANCELLED", "COMPLETED"];
exports.seatTypeColors = {
    AVAILABLE: "#D9F99D",
    SELECTED: "#FBBF24",
    RESERVED: "#93C5FD",
    BOOKED: "#F87171",
    BLOCKED: "#374151",
    REGULAR: "#22C55E",
    VIP: "#8B5CF6",
    COUPLE: "#EC4899"
};
const formatCurrency = (amount) => `Nu. ${amount.toFixed(2)}`;
exports.formatCurrency = formatCurrency;
