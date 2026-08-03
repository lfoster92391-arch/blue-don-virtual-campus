/**
 * Campus Weather Station — Madonna High School, Weirton, WV
 */

export const CAMPUS_WEATHER_LOCATION = {
  name: "Madonna High School",
  city: "Weirton",
  state: "WV",
  latitude: 40.18,
  longitude: -80.59,
  timezone: "America/New_York",
} as const;

export const CAMPUS_WEATHER_LABELS = {
  stationTitle: "Campus Weather Station",
  stationDescription:
    "Live conditions for outdoor athletics, recess, and campus activities at Madonna.",
  source: "Open-Meteo",
  updatedPrefix: "Updated",
  unavailable: "Weather data temporarily unavailable",
} as const;

export type AthleticCondition = "excellent" | "good" | "fair" | "poor";
export type RecessRecommendation =
  | "great-outdoors"
  | "caution"
  | "indoor-recommended"
  | "indoor-required";

export const ATHLETIC_CONDITION_LABELS: Record<AthleticCondition, string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

export const RECESS_RECOMMENDATION_LABELS: Record<RecessRecommendation, string> = {
  "great-outdoors": "Great for outdoor recess",
  caution: "Use caution outdoors",
  "indoor-recommended": "Indoor recess recommended",
  "indoor-required": "Keep recess indoors",
};

/** Thresholds for deriving campus guidance from live readings */
export const CAMPUS_WEATHER_THRESHOLDS = {
  /** Cache weather data for 20 minutes */
  revalidateSeconds: 20 * 60,
  athletic: {
    tempIdealMinF: 50,
    tempIdealMaxF: 82,
    tempFairMinF: 40,
    tempFairMaxF: 90,
    precipFairPercent: 40,
    precipPoorPercent: 60,
    windFairMph: 18,
    windPoorMph: 25,
    uvFair: 7,
    uvPoor: 9,
    aqiFair: 100,
    aqiPoor: 150,
  },
  recess: {
    tempGreatMinF: 55,
    tempGreatMaxF: 78,
    tempCautionMinF: 45,
    tempCautionMaxF: 85,
    precipCautionPercent: 25,
    precipIndoorPercent: 50,
    uvCaution: 6,
    uvIndoor: 8,
    aqiCaution: 75,
    aqiIndoor: 125,
    windCautionMph: 15,
  },
} as const;
