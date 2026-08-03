export const CLUB_MEMBERSHIP_COMMITMENT_FORM_ID = "form-club-membership-commitment";

export function getClubCommitmentContextKey(academyId: string): string {
  return `academy:${academyId}`;
}

export function buildClubMembershipCommitmentContent(clubName: string): string {
  return `Club Membership Commitment — ${clubName}

By signing below, I agree to be an active and responsible member of ${clubName} at Madonna High School.

I commit to:

• Remain actively involved in club activities throughout the school year
• Attend meetings, practices, rehearsals, and events unless I have an excused absence
• Communicate with club advisors or officers when I cannot attend
• Participate in fundraising and help my club raise money for its goals
• Represent Madonna High School with integrity, respect, and good sportsmanship
• Follow all school policies, club bylaws, and advisor expectations
• Support fellow members and contribute positively to our team or organization

I understand that membership is a commitment to my club, my school, and my teammates. Failure to meet these expectations may result in a conversation with my advisor and could affect my continued membership or leadership opportunities.

I confirm that I have read this commitment and agree to uphold these standards as a member of ${clubName}.`;
}
