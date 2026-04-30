"use client";

import { useEffect, useMemo, useState } from "react";

import type { ScreenLayoutConfig, ScreenLayoutRow } from "@bhutan/shared";

import { PageHeader } from "../../components/page-header";
import { adminApiFetch, getAdminToken } from "../../lib/api";

const seatTypes = ["REGULAR", "VIP", "BLOCKED"] as const;

type SeatType = (typeof seatTypes)[number];
type LegacySeatType = SeatType | "COUPLE";

type EditorRow = {
  id: string;
  rowLabel: string;
  seatCount: number;
  leftOffset: number;
  aisleAfter: string;
  defaultSeatType: SeatType;
  vipSeats: string;
  blockedSeats: string;
};

type ScreenRecord = {
  id: string;
  name: string;
  totalRows: number;
  totalColumns: number;
  layoutConfig?: ScreenLayoutConfig | null;
};

type SeatRecord = {
  id: string;
  rowLabel: string;
  rowIndex?: number;
  seatNumber: number;
  seatType: LegacySeatType;
  layoutColumn?: number;
  rowWidth?: number;
};

const parseCsvNumbers = (value: string) =>
  [...new Set(
    value
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isInteger(item) && item > 0)
  )].sort((a, b) => a - b);

const toCsv = (values: number[] | undefined) => (values && values.length > 0 ? values.join(", ") : "");

const buildDefaultRows = (rowCount: number, seatCount: number): EditorRow[] =>
  Array.from({ length: rowCount }, (_, index) => ({
    id: `row-${index + 1}`,
    rowLabel: String.fromCharCode(65 + index),
    seatCount,
    leftOffset: seatCount >= 12 && index >= rowCount - 2 ? 1 : 0,
    aisleAfter: seatCount >= 10 ? `${Math.ceil(seatCount / 2)}` : "",
    defaultSeatType: index >= rowCount - 2 ? "VIP" : "REGULAR",
    vipSeats: "",
    blockedSeats: ""
  }));

const rowsFromLayout = (layout: ScreenLayoutConfig | null | undefined, totalRows: number, totalColumns: number) => {
  if (!layout?.rows?.length) {
    return buildDefaultRows(totalRows || 8, Math.max(totalColumns || 10, 1));
  }

  return layout.rows.map((row, index) => ({
    id: `${row.rowLabel}-${index}`,
    rowLabel: row.rowLabel,
    seatCount: row.seatCount,
    leftOffset: row.leftOffset ?? 0,
    aisleAfter: toCsv(row.aisleAfter),
    defaultSeatType: (row.defaultSeatType ?? "REGULAR") as SeatType,
    vipSeats: toCsv(row.overrides?.filter((seat) => seat.seatType === "VIP" || seat.seatType === "COUPLE").map((seat) => seat.seatNumber)),
    blockedSeats: toCsv(row.overrides?.filter((seat) => seat.seatType === "BLOCKED" || seat.isBlocked).map((seat) => seat.seatNumber))
  }));
};

const toLayoutPayload = (rows: EditorRow[]): ScreenLayoutConfig => ({
  version: 1,
  rows: rows.map((row) => {
    const vipSeats = parseCsvNumbers(row.vipSeats);
    const blockedSeats = parseCsvNumbers(row.blockedSeats);

    const overrideMap = new Map<number, { seatNumber: number; seatType: SeatType; isBlocked?: boolean }>();

    for (const seatNumber of vipSeats) {
      overrideMap.set(seatNumber, { seatNumber, seatType: "VIP" });
    }

    for (const seatNumber of blockedSeats) {
      overrideMap.set(seatNumber, { seatNumber, seatType: "BLOCKED", isBlocked: true });
    }

    return {
      rowLabel: row.rowLabel.trim().toUpperCase(),
      seatCount: Math.max(1, Number(row.seatCount) || 1),
      leftOffset: Math.max(0, Number(row.leftOffset) || 0),
      aisleAfter: parseCsvNumbers(row.aisleAfter),
      defaultSeatType: row.defaultSeatType,
      overrides: [...overrideMap.values()]
    } satisfies ScreenLayoutRow;
  })
});

function LayoutPreview({ seats, onSeatClick }: { seats: SeatRecord[]; onSeatClick?: (seat: SeatRecord) => void }) {
  const grouped = useMemo(() => {
    const rows = seats.reduce<Record<string, SeatRecord[]>>((accumulator, seat) => {
      accumulator[seat.rowLabel] = [...(accumulator[seat.rowLabel] ?? []), seat];
      return accumulator;
    }, {});

    return Object.entries(rows)
      .map(([rowLabel, rowSeats]) => [
        rowLabel,
        [...rowSeats].sort(
          (left, right) =>
            (left.rowIndex ?? 0) - (right.rowIndex ?? 0) ||
            (left.layoutColumn ?? left.seatNumber) - (right.layoutColumn ?? right.seatNumber)
        )
      ] as const)
      .sort((left, right) => (left[1][0]?.rowIndex ?? 0) - (right[1][0]?.rowIndex ?? 0));
  }, [seats]);

  const maxWidth = seats.reduce(
    (largest, seat) => Math.max(largest, seat.rowWidth ?? seat.layoutColumn ?? seat.seatNumber),
    0
  );
  const previewColumns = Math.max(maxWidth, 10);

  return (
    <div className="layout-preview-shell">
      <div className="layout-preview-stage">
        <div className="layout-preview-screen">
          <div className="layout-preview-screen-bar">Screen</div>
          <p className="muted">Seats face forward. Aisles and gaps reflect the saved hall layout.</p>
        </div>

        <div className="layout-preview-map">
          {grouped.map(([rowLabel, rowSeats]) => {
            return (
              <div key={rowLabel} className="layout-preview-row">
                <span className="layout-preview-label">{rowLabel}</span>
                <div className="layout-preview-lane-shell">
                  <div
                    className="layout-preview-lane"
                    style={{
                      gridTemplateColumns: `repeat(${previewColumns}, minmax(0, 1fr))`
                    }}
                  >
                    {rowSeats.map((seat) => {
                      const layoutColumn = seat.layoutColumn ?? seat.seatNumber;

                      return (
                        <div
                          key={seat.id}
                          className="layout-preview-seat-wrap"
                          style={{ gridColumn: `${layoutColumn}` }}
                        >
                          <button
                            type="button"
                            className={`seat-block seat-${seat.seatType}`}
                            onClick={() => onSeatClick?.(seat)}
                            title={`${seat.rowLabel}${seat.seatNumber}`}
                          >
                            {seat.seatNumber}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <span className="layout-preview-label layout-preview-label-end">{rowLabel}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function SeatLayoutEditorPage() {
  const token = getAdminToken();
  const [theatres, setTheatres] = useState<any[]>([]);
  const [screens, setScreens] = useState<ScreenRecord[]>([]);
  const [selectedTheatreId, setSelectedTheatreId] = useState("");
  const [selectedScreenId, setSelectedScreenId] = useState("");
  const [rows, setRows] = useState<EditorRow[]>([]);
  const [seats, setSeats] = useState<SeatRecord[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedScreen = screens.find((screen) => screen.id === selectedScreenId) ?? null;

  useEffect(() => {
    void adminApiFetch<any[]>("/theatres")
      .then((result) => {
        setTheatres(result);
        if (result[0]) {
          setSelectedTheatreId(result[0].id);
        }
      })
      .catch((requestError) =>
        setError(requestError instanceof Error ? requestError.message : "Failed to load theatres")
      );
  }, []);

  useEffect(() => {
    if (!selectedTheatreId || !token) {
      return;
    }

    void adminApiFetch<ScreenRecord[]>(`/admin/theatres/${selectedTheatreId}/screens`, { token })
      .then((result) => {
        setScreens(result);
        if (result[0]) {
          setSelectedScreenId((current) =>
            result.some((screen) => screen.id === current) ? current : result[0].id
          );
        } else {
          setSelectedScreenId("");
          setRows([]);
          setSeats([]);
        }
      })
      .catch((requestError) =>
        setError(requestError instanceof Error ? requestError.message : "Failed to load screens")
      );
  }, [selectedTheatreId, token]);

  useEffect(() => {
    if (!selectedScreen) {
      return;
    }

    setRows(rowsFromLayout(selectedScreen.layoutConfig, selectedScreen.totalRows, selectedScreen.totalColumns));
  }, [selectedScreen]);

  useEffect(() => {
    if (!selectedScreenId) {
      return;
    }

    void adminApiFetch<SeatRecord[]>(`/screens/${selectedScreenId}/seats`)
      .then(setSeats)
      .catch((requestError) =>
        setError(requestError instanceof Error ? requestError.message : "Failed to load seats")
      );
  }, [selectedScreenId]);

  const summary = useMemo(() => {
    const totalSeats = rows.reduce((total, row) => total + Number(row.seatCount || 0), 0);
    const widestRow = rows.reduce((largest, row) => {
      const width = Number(row.seatCount || 0) + Number(row.leftOffset || 0) + parseCsvNumbers(row.aisleAfter).length;
      return Math.max(largest, width);
    }, 0);

    return {
      totalRows: rows.length,
      totalSeats,
      widestRow
    };
  }, [rows]);

  const updateRow = (rowId: string, field: keyof EditorRow, value: string | number) => {
    setRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    const nextIndex = rows.length;
    setRows((current) => [
      ...current,
      {
        id: `row-${Date.now()}`,
        rowLabel: String.fromCharCode(65 + Math.min(nextIndex, 25)),
        seatCount: current[current.length - 1]?.seatCount ?? 10,
        leftOffset: 0,
        aisleAfter: "",
        defaultSeatType: "REGULAR",
        vipSeats: "",
        blockedSeats: ""
      }
    ]);
  };

  const removeRow = (rowId: string) => {
    setRows((current) => current.filter((row) => row.id !== rowId));
  };

  const saveLayout = async () => {
    if (!selectedScreenId || !token || rows.length === 0) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await adminApiFetch(`/admin/screens/${selectedScreenId}/generate-seats`, {
        method: "POST",
        token,
        body: {
          layout: toLayoutPayload(rows)
        }
      });

      const [updatedScreens, updatedSeats] = await Promise.all([
        adminApiFetch<ScreenRecord[]>(`/admin/theatres/${selectedTheatreId}/screens`, { token }),
        adminApiFetch<SeatRecord[]>(`/screens/${selectedScreenId}/seats`)
      ]);

      setScreens(updatedScreens);
      setSeats(updatedSeats);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to save layout");
    } finally {
      setSaving(false);
    }
  };

  const cycleSeatType = async (seat: SeatRecord) => {
    const currentSeatType: SeatType = seat.seatType === "COUPLE" ? "VIP" : seat.seatType;
    const index = seatTypes.indexOf(currentSeatType);
    const nextSeatType = seatTypes[(index + 1) % seatTypes.length];

    try {
      await adminApiFetch(`/admin/seats/${seat.id}`, {
        method: "PATCH",
        token,
        body: {
          seatType: nextSeatType,
          isBlocked: nextSeatType === "BLOCKED"
        }
      });

      const updated = await adminApiFetch<SeatRecord[]>(`/screens/${selectedScreenId}/seats`);
      setSeats(updated);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to update seat");
    }
  };

  return (
    <div className="grid">
      <PageHeader
        title="Seat Layout Editor"
        subtitle="Design every screen independently with custom rows, aisles, offsets, and seat mixes. Save the layout, then fine-tune individual seats in the live hall preview."
      />

      <section className="grid two-col">
        <div className="form-card stack">
          <div className="form-split">
            <div className="field-group">
              <label className="field-label">Theatre</label>
              <select className="select" value={selectedTheatreId} onChange={(event) => setSelectedTheatreId(event.target.value)}>
                {theatres.map((theatre) => (
                  <option key={theatre.id} value={theatre.id}>
                    {theatre.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Screen</label>
              <select className="select" value={selectedScreenId} onChange={(event) => setSelectedScreenId(event.target.value)}>
                {screens.map((screen) => (
                  <option key={screen.id} value={screen.id}>
                    {screen.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="layout-summary-row">
            <span className="pill primary">{summary.totalRows} rows</span>
            <span className="pill primary">{summary.totalSeats} seats</span>
            <span className="pill primary">{summary.widestRow} width units</span>
          </div>

          <div className="layout-row-list">
            {rows.map((row, index) => (
              <div key={row.id} className="layout-row-card">
                <div className="layout-row-card-header">
                  <strong>Row {index + 1}</strong>
                  <button className="btn ghost sm" onClick={() => removeRow(row.id)} disabled={rows.length <= 1}>
                    Remove
                  </button>
                </div>

                <div className="layout-row-grid">
                  <div className="field-group">
                    <label className="field-label">Label</label>
                    <input className="field" value={row.rowLabel} onChange={(event) => updateRow(row.id, "rowLabel", event.target.value)} />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Seats in row</label>
                    <input className="field" type="number" min={1} value={row.seatCount} onChange={(event) => updateRow(row.id, "seatCount", Number(event.target.value))} />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Left offset</label>
                    <input className="field" type="number" min={0} value={row.leftOffset} onChange={(event) => updateRow(row.id, "leftOffset", Number(event.target.value))} />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Base seat type</label>
                    <select className="select" value={row.defaultSeatType} onChange={(event) => updateRow(row.id, "defaultSeatType", event.target.value as SeatType)}>
                      {seatTypes.filter((type) => type !== "BLOCKED").map((type) => (
                        <option key={type} value={type}>
                          {type === "REGULAR" ? "First Class" : "Balcony"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="field-group">
                    <label className="field-label">Aisles after seat numbers</label>
                    <input className="field" value={row.aisleAfter} onChange={(event) => updateRow(row.id, "aisleAfter", event.target.value)} placeholder="Example: 4, 8" />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Balcony seats</label>
                    <input className="field" value={row.vipSeats} onChange={(event) => updateRow(row.id, "vipSeats", event.target.value)} placeholder="Example: 1, 2, 3" />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Blocked seats</label>
                    <input className="field" value={row.blockedSeats} onChange={(event) => updateRow(row.id, "blockedSeats", event.target.value)} placeholder="Example: 1, 12" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error ? <p className="error">{error}</p> : null}

          <div className="btn-row">
            <button className="btn secondary" onClick={addRow}>
              Add Row
            </button>
            <button className="btn" onClick={saveLayout} disabled={!selectedScreenId || saving}>
              {saving ? "Saving layout..." : "Save Layout"}
            </button>
          </div>
        </div>

        <div className="table-card stack">
          <div className="section-intro">
            <h3>Live Hall Preview</h3>
            <p className="muted">Click a seat after saving to cycle between First Class, Balcony, and Blocked.</p>
          </div>

          <div className="btn-row">
            {seatTypes.map((type) => (
              <span key={type} className={`pill seat-${type}`}>
                {type === "REGULAR" ? "First Class" : type === "VIP" ? "Balcony" : "Blocked"}
              </span>
            ))}
          </div>

          {seats.length > 0 ? (
            <LayoutPreview seats={seats} onSeatClick={cycleSeatType} />
          ) : (
            <div className="empty-state">
              <h3>No seats generated yet</h3>
              <p>Save the layout to generate the exact hall preview for this screen.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
