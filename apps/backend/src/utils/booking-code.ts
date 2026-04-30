export const formatBookingCode = (year: number, sequence: number) =>
  `MOVI-${year}-${sequence.toString().padStart(6, "0")}`;
