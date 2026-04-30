import type { SeatType } from "@prisma/client";

type SeatOverride = {
  seatNumber: number;
  seatType: SeatType;
  isBlocked?: boolean;
};

export type ScreenLayoutRow = {
  rowLabel: string;
  seatCount: number;
  leftOffset?: number;
  rightOffset?: number;
  aisleAfter?: number[];
  defaultSeatType?: SeatType;
  overrides?: SeatOverride[];
};

export type ScreenLayoutConfig = {
  version: 1;
  rows: ScreenLayoutRow[];
};

type LegacySeatTypeMap = Array<{
  rowLabel: string;
  seatNumber: number;
  seatType: SeatType;
  isBlocked?: boolean;
}>;

type SeatLayoutShape = {
  id?: string;
  rowLabel: string;
  seatNumber: number;
  seatCode: string;
  seatType: SeatType;
  isBlocked: boolean;
};

const normalizeAisleAfter = (values: number[] | undefined, seatCount: number) =>
  [...new Set((values ?? []).filter((value) => value > 0 && value < seatCount))].sort((a, b) => a - b);

const normalizeRowLabel = (value: string) => value.trim().toUpperCase();

const normalizeRow = (row: ScreenLayoutRow): ScreenLayoutRow => ({
  rowLabel: normalizeRowLabel(row.rowLabel),
  seatCount: row.seatCount,
  leftOffset: Math.max(0, row.leftOffset ?? 0),
  rightOffset: Math.max(0, row.rightOffset ?? 0),
  aisleAfter: normalizeAisleAfter(row.aisleAfter, row.seatCount),
  defaultSeatType: row.defaultSeatType ?? "REGULAR",
  overrides: (row.overrides ?? [])
    .filter((override) => override.seatNumber > 0 && override.seatNumber <= row.seatCount)
    .map((override) => ({
      seatNumber: override.seatNumber,
      seatType: override.seatType,
      isBlocked: override.isBlocked
    }))
});

export const buildDefaultLayoutConfig = (
  totalRows: number,
  totalColumns: number,
  seatTypeMap?: LegacySeatTypeMap
): ScreenLayoutConfig => {
  const rowLabels = Array.from({ length: totalRows }, (_, index) => String.fromCharCode(65 + index));

  const overrideMap = new Map<string, SeatOverride[]>();

  for (const entry of seatTypeMap ?? []) {
    const key = normalizeRowLabel(entry.rowLabel);
    const rowOverrides = overrideMap.get(key) ?? [];
    rowOverrides.push({
      seatNumber: entry.seatNumber,
      seatType: entry.seatType,
      isBlocked: entry.isBlocked
    });
    overrideMap.set(key, rowOverrides);
  }

  return {
    version: 1,
    rows: rowLabels.map((rowLabel) =>
      normalizeRow({
        rowLabel,
        seatCount: totalColumns,
        leftOffset: 0,
        rightOffset: 0,
        aisleAfter: totalColumns >= 10 ? [Math.ceil(totalColumns / 2)] : [],
        overrides: overrideMap.get(rowLabel) ?? []
      })
    )
  };
};

export const normalizeLayoutConfig = (config: ScreenLayoutConfig): ScreenLayoutConfig => ({
  version: 1,
  rows: config.rows.map(normalizeRow)
});

export const validateLayoutConfig = (config: ScreenLayoutConfig) => {
  const normalized = normalizeLayoutConfig(config);
  const labels = normalized.rows.map((row) => row.rowLabel);

  if (new Set(labels).size !== labels.length) {
    throw new Error("Each row label must be unique");
  }

  return normalized;
};

export const buildSeatsFromLayout = (screenId: string, config: ScreenLayoutConfig) => {
  const normalized = validateLayoutConfig(config);

  const seats = normalized.rows.flatMap((row) =>
    Array.from({ length: row.seatCount }, (_, index) => {
      const seatNumber = index + 1;
      const override = row.overrides?.find((entry) => entry.seatNumber === seatNumber);
      const seatType = override?.seatType ?? row.defaultSeatType ?? "REGULAR";
      const isBlocked = override?.isBlocked ?? seatType === "BLOCKED";

      return {
        screenId,
        rowLabel: row.rowLabel,
        seatNumber,
        seatCode: `${row.rowLabel}${seatNumber}`,
        seatType,
        isBlocked
      };
    })
  );

  const totalColumns = normalized.rows.reduce((largest, row) => {
    const rowWidth =
      (row.leftOffset ?? 0) +
      row.seatCount +
      (row.rightOffset ?? 0) +
      (row.aisleAfter?.length ?? 0);

    return Math.max(largest, rowWidth);
  }, 0);

  return {
    config: normalized,
    seats,
    totalRows: normalized.rows.length,
    totalColumns: Math.max(totalColumns, 1)
  };
};

export const decorateSeatsWithLayout = <T extends SeatLayoutShape>(
  seats: T[],
  config: ScreenLayoutConfig | null | undefined
) => {
  const normalized =
    config && Array.isArray(config.rows) && config.rows.length > 0
      ? validateLayoutConfig(config)
      : null;

  const rowLookup = new Map(
    (normalized?.rows ?? []).map((row, rowIndex) => [row.rowLabel, { row, rowIndex }] as const)
  );

  return seats.map((seat) => {
    const rowMeta = rowLookup.get(normalizeRowLabel(seat.rowLabel));

    if (!rowMeta) {
      return {
        ...seat,
        rowIndex: seat.rowLabel.charCodeAt(0) - 65,
        layoutColumn: seat.seatNumber,
        rowWidth: seat.seatNumber
      };
    }

    const aisleCountBefore =
      rowMeta.row.aisleAfter?.filter((value) => value < seat.seatNumber).length ?? 0;
    const layoutColumn = (rowMeta.row.leftOffset ?? 0) + seat.seatNumber + aisleCountBefore;
    const rowWidth =
      (rowMeta.row.leftOffset ?? 0) +
      rowMeta.row.seatCount +
      (rowMeta.row.rightOffset ?? 0) +
      (rowMeta.row.aisleAfter?.length ?? 0);

    return {
      ...seat,
      rowIndex: rowMeta.rowIndex,
      layoutColumn,
      rowWidth
    };
  });
};
