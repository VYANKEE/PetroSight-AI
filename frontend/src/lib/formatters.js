export function formatDemand(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function formatCompact(value) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

export function createCsvDownload(filename, rows) {
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function mergeForecastSeries(historical = [], forecast = [], historyKey = "value") {
  const historyRows = historical.map((row) => ({
    label: row.month === "Annual" ? String(row.year) : `${row.month} ${row.year}`,
    historical: row[historyKey],
    forecast: null,
    lower: null,
    upper: null,
    year: row.year,
    month: row.month,
  }));

  const forecastRows = forecast.map((row) => ({
    label: row.month === "Annual" ? String(row.year) : `${row.month} ${row.year}`,
    historical: null,
    forecast: row.forecast_value,
    lower: row.confidence_lower,
    upper: row.confidence_upper,
    confidenceGap: row.confidence_upper - row.confidence_lower,
    year: row.year,
    month: row.month,
  }));

  return [...historyRows, ...forecastRows];
}
