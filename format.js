const UNAVAILABLE = "--";

export function formatTemp(report, stationName = "Hong Kong Observatory") {
  const readings = report?.temperature?.data;

  if (!Array.isArray(readings)) {
    return UNAVAILABLE;
  }

  const station = readings.find((reading) => reading.place === stationName);

  if (!station || typeof station.value !== "number" || typeof station.unit !== "string") {
    return UNAVAILABLE;
  }

  return `${station.value}°${station.unit}`;
}

export function formatAqhi(readings, stationName) {
  if (!Array.isArray(readings)) {
    return UNAVAILABLE;
  }

  const station = readings.find((reading) => reading.station === stationName);

  if (!station || typeof station.aqhi !== "number" || typeof station.health_risk !== "string") {
    return UNAVAILABLE;
  }

  return `${station.aqhi} (${station.health_risk})`;
}

export function nextTrain(schedule, line, stationCode, destinationNames = {}) {
  if (schedule?.status !== 1) {
    throw new Error(schedule?.message || "MTR returned an unsuccessful station status.");
  }

  const trains = schedule?.data?.[`${line}-${stationCode}`]?.UP;

  if (!Array.isArray(trains) || trains.length === 0) {
    return "No upcoming train";
  }

  const train = trains[0];
  const minutes = Number(train?.ttnt);

  if (!Number.isInteger(minutes) || minutes < 0 || typeof train?.dest !== "string") {
    throw new Error("The next train reading is invalid.");
  }

  const destination = destinationNames[train.dest] || train.dest;
  return minutes === 0 ? `Arriving now, to ${destination}` : `${minutes} min to ${destination}`;
}
