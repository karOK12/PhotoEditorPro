"use client";

type AdjustmentsProps = {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  onBrightnessChange: (value: number) => void;
  onContrastChange: (value: number) => void;
  onSaturationChange: (value: number) => void;
  onTemperatureChange: (value: number) => void;
};

export default function Adjustments({
  brightness,
  contrast,
  saturation,
  temperature,
  onBrightnessChange,
  onContrastChange,
  onSaturationChange,
  onTemperatureChange,
}: AdjustmentsProps) {
  const rows = [
    {
      label: "السطوع",
      value: brightness,
      min: 0,
      max: 200,
      onChange: onBrightnessChange,
    },
    {
      label: "التباين",
      value: contrast,
      min: 0,
      max: 200,
      onChange: onContrastChange,
    },
    {
      label: "التشبّع",
      value: saturation,
      min: 0,
      max: 200,
      onChange: onSaturationChange,
    },
    {
      label: "الحرارة",
      value: temperature,
      min: -100,
      max: 100,
      onChange: onTemperatureChange,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gap: "14px",
        padding: "16px",
        borderRadius: "18px",
        background: "#111318",
        border: "1px solid rgba(255,255,255,.08)",
      }}
    >
      {rows.map((item) => (
        <label
          key={item.label}
          style={{
            display: "grid",
            gap: "8px",
            color: "#e5e7eb",
            fontSize: "13px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{item.label}</span>
            <span style={{ color: "#94a3b8" }}>{item.value}</span>
          </div>

          <input
            type="range"
            min={item.min}
            max={item.max}
            value={item.value}
            onChange={(event) =>
              item.onChange(Number(event.target.value))
            }
            style={{
              width: "100%",
              accentColor: "#ffffff",
            }}
          />
        </label>
      ))}
    </div>
  );
}
