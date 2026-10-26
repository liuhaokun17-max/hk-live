import { test } from "node:test";
import assert from "node:assert/strict";
import { formatAqhi, formatTemp, nextTrain } from "./format.js";

test("formatTemp returns -- when the station list is empty", () => {
  assert.equal(formatTemp({ temperature: { data: [] } }), "--");
});

test("formatTemp finds the Observatory regardless of station order", () => {
  const report = {
    temperature: {
      data: [
        { place: "Kwun Tong", value: 31, unit: "C" },
        { place: "Hong Kong Observatory", value: 29, unit: "C" }
      ]
    }
  };

  assert.equal(formatTemp(report), "29°C");
});

test("formatTemp returns -- when the station is absent", () => {
  assert.equal(formatTemp({ temperature: { data: [{ place: "Sai Kung", value: 30, unit: "C" }] } }), "--");
});

test("formatAqhi returns the AQHI and health risk for an exact station name", () => {
  const readings = [
    { station: "Central/Western", aqhi: 3, health_risk: "Low" },
    { station: "Central", aqhi: 5, health_risk: "Moderate" }
  ];

  assert.equal(formatAqhi(readings, "Central/Western"), "3 (Low)");
  assert.equal(formatAqhi(readings, "Central"), "5 (Moderate)");
});

test("formatAqhi returns -- for a missing station", () => {
  assert.equal(formatAqhi([{ station: "Central", aqhi: 5, health_risk: "Moderate" }], "Atlantis"), "--");
});

test("nextTrain converts ttnt from a string to minutes", () => {
  const schedule = { status: 1, data: { "ISL-HKU": { UP: [{ dest: "CHW", ttnt: "3" }] } } };

  assert.equal(nextTrain(schedule, "ISL", "HKU"), "3 min to CHW");
});

test("nextTrain handles an arriving train after number conversion", () => {
  const schedule = { status: 1, data: { "ISL-HKU": { UP: [{ dest: "CHW", ttnt: "0" }] } } };

  assert.equal(nextTrain(schedule, "ISL", "HKU", { CHW: "Chai Wan" }), "Arriving now, to Chai Wan");
});

test("nextTrain throws when the feed reports status 0", () => {
  assert.throws(
    () => nextTrain({ status: 0, message: "The contents are empty!" }, "ISL", "XXX"),
    /contents are empty/
  );
});
