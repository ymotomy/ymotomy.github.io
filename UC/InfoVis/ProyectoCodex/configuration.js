d3.csv("../Proyecto/data/dataset.csv", row => {
  const numberOrNull = value => {
    const parsed = Number(String(value || "").trim());
    return Number.isFinite(parsed) && String(value || "").trim() !== "" ? parsed : null;
  };
  return {
    messier: String(row.Messier || "").trim(),
    ngc: String(row.NGC || "").trim(),
    type: String(row.Object_Type || "").trim(),
    magnitude: numberOrNull(row.Magnitude),
    constellation: String(row.Constellation || "").trim(),
    distance: numberOrNull(row.Distance),
    discoverer: String(row.Discoverer || "").trim(),
    year: String(row.Year || "").trim(),
    name: String(row.Name || "").trim(),
    dimensions: numberOrNull(row.Dimensions)
  };
}).then(rows => {
  window.initializeMessierCatalog(rows);
}).catch(error => {
  console.error("No se pudo cargar el catálogo Messier.", error);
  d3.select("#data-error").property("hidden", false);
});