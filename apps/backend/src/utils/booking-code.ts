export const formatBookingCode = (year: number, sequence: number) =>
  `BMB-${year}-${sequence.toString().padStart(6, "0")}`;
