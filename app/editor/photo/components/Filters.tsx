"use client";

type FilterName =
  | "normal"
  | "grayscale"
  | "sepia"
  | "warm"
  | "cool"
  | "highContrast";

type FiltersProps = {
  activeFilter: FilterName;
  onFilterChange: (filter: FilterName) => void;
};

const filters: { id: FilterName; label: string }[] = [
  { id: "normal", label: "عادي" },
  { id: "grayscale", label: "أبيض وأسود" },
  { id: "sepia", label: "سيبيا" },
  { id: "warm", label: "دافئ" },
  { id: "cool", label: "بارد" },
  { id: "highContrast", label: "تباين قوي" },
];

export default function Filters({
  activeFilter,
  onFilterChange,
}: FiltersProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        overflowX: "auto",
        padding: "4px 0",
      }}
    >
      {filters.map((filter) => {
        const active = activeFilter === filter.id;

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onFilterChange(filter.id)}
            style={{
              flex: "0 0 auto",
              minWidth: "92px",
              height: "44px",
              padding: "0 12px",
              borderRadius: "12px",
              border: active
                ? "1px solid #fff"
                : "1px solid rgba(255,255,255,.1)",
              background: active ? "#272b34" : "#15171d",
              color: "#fff",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: active ? 700 : 500,
            }}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
