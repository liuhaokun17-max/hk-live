import { formatAqhi, formatTemp, nextTrain } from "./format.js";

const WEATHER_URL = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en";
const WEATHER_STATION = "Hong Kong Observatory";
const AIR_URL = "https://dashboard.data.gov.hk/api/aqhi-individual?format=json";
const AIR_STATION = "Central/Western";
const MTR_URL = "https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=ISL&sta=HKU";

const weatherValue = document.querySelector("#weather-value");
const weatherUnit = document.querySelector("#weather-unit");
const weatherStatus = document.querySelector("#weather-status");
const weatherUpdated = document.querySelector("#weather-updated");
const airValue = document.querySelector("#air-value");
const airPlace = document.querySelector("#air-place");
const airRisk = document.querySelector("#air-risk");
const airStatus = document.querySelector("#air-status");
const transportMinutes = document.querySelector("#transport-minutes");
const transportDestination = document.querySelector("#transport-destination");
const transportStatus = document.querySelector("#transport-status");
const localTime = document.querySelector("#local-time");

function formatHongKongDateTime(dateString) {
  const hasTimezone = /Z$|[+-]\d{2}:\d{2}$/.test(dateString);
  const date = new Date(hasTimezone ? dateString : `${dateString}+08:00`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("The update time is invalid.");
  }

  return new Intl.DateTimeFormat("en-HK", {
    timeZone: "Asia/Hong_Kong",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

function updateHongKongClock() {
  localTime.textContent = new Intl.DateTimeFormat("en-HK", {
    timeZone: "Asia/Hong_Kong",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(new Date());
}

function showWeatherError(message) {
  weatherValue.textContent = "--";
  weatherUnit.textContent = "°C";
  weatherUpdated.textContent = "Unavailable";
  weatherStatus.textContent = message;
  weatherStatus.dataset.state = "error";
}

function showAirError(message) {
  airValue.textContent = "--";
  airPlace.textContent = AIR_STATION;
  airRisk.textContent = "Health risk: --";
  airStatus.textContent = message;
  airStatus.dataset.state = "error";
}

function showTransportError(message) {
  transportMinutes.textContent = "--";
  transportDestination.textContent = "Destination code: --";
  transportStatus.textContent = message;
  transportStatus.dataset.state = "error";
}

async function loadWeather() {
  weatherStatus.textContent = "Loading the latest observation…";
  weatherStatus.dataset.state = "loading";

  try {
    const response = await fetch(WEATHER_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Weather service returned ${response.status}.`);
    }

    const report = await response.json();
    const formattedTemperature = formatTemp(report, WEATHER_STATION);

    if (formattedTemperature === "--") {
      throw new Error(`No reading was found for ${WEATHER_STATION}.`);
    }

    weatherValue.textContent = formattedTemperature;
    weatherUnit.textContent = "";
    weatherUpdated.textContent = formatHongKongDateTime(report.updateTime);
    weatherStatus.textContent = "Live observation received.";
    weatherStatus.dataset.state = "ready";
  } catch (error) {
    console.error("Unable to load weather data:", error);
    showWeatherError("Weather data is unavailable. Please try again later.");
  }
}

async function loadAirQuality() {
  airStatus.textContent = "Loading the latest reading…";
  airStatus.dataset.state = "loading";

  try {
    const response = await fetch(AIR_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Air quality service returned ${response.status}.`);
    }

    const readings = await response.json();

    if (!Array.isArray(readings)) {
      throw new Error("Air quality data is missing.");
    }

    const formattedAqhi = formatAqhi(readings, AIR_STATION);

    if (formattedAqhi === "--") {
      throw new Error(`No complete reading was found for ${AIR_STATION}.`);
    }

    airValue.textContent = formattedAqhi;
    airPlace.textContent = AIR_STATION;
    airRisk.textContent = "";
    airStatus.textContent = "Live reading received.";
    airStatus.dataset.state = "ready";
  } catch (error) {
    console.error("Unable to load air quality data:", error);
    showAirError("Air quality data is unavailable. Please try again later.");
  }
}

async function loadTransport() {
  transportStatus.textContent = "Loading the next train…";
  transportStatus.dataset.state = "loading";

  try {
    const response = await fetch(MTR_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`MTR service returned ${response.status}.`);
    }

    const schedule = await response.json();

    const formattedTrain = nextTrain(schedule, "ISL", "HKU");
    transportMinutes.textContent = formattedTrain;
    transportDestination.textContent = "";
    transportStatus.textContent = formattedTrain === "No upcoming train"
      ? "No upcoming train in this direction."
      : "Next Island Line train from HKU.";
    transportStatus.dataset.state = "ready";
  } catch (error) {
    console.error("Unable to load transport data:", error);
    showTransportError("Transport data is unavailable. Please try again later.");
  }
}

updateHongKongClock();
setInterval(updateHongKongClock, 1000);
loadWeather();
loadAirQuality();
loadTransport();
