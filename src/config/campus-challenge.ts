export type CampusChallenge = {
  title: string;
  theme: string;
  description: string;
  progress: number;
  rewards: string[];
  endsLabel: string;
};

/** Current featured campus challenge. Swap to a data source when challenges ship. */
export const CURRENT_CAMPUS_CHALLENGE: CampusChallenge = {
  title: "Kindness Month",
  theme: "Service & Faith",
  description: "Log an act of kindness or a service hour every week this month.",
  progress: 63,
  rewards: ["500 XP", "Blue Don Coins", "Limited badge"],
  endsLabel: "Ends in 9 days",
};
