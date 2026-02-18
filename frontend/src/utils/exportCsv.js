export const exportLocationsCsv = (locations) => {
  const rows = [
    ["Latitude", "Longitude", "Time"],
    ...locations.map(l => [
      l.latitude,
      l.longitude,
      new Date(l.created_at).toLocaleString()
    ])
  ];

  const csv = rows.map(r => r.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "location-history.csv";
  a.click();
};
