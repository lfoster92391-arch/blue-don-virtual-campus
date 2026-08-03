import { CampusVoicePolls } from "@/components/culture/campus-voice-polls";
import { ShellPage } from "@/components/layout/shell-page";
import { getCampusPolls } from "@/services/madonna-culture-service";

export default function CampusVoicePage() {
  const polls = getCampusPolls();

  return (
    <ShellPage
      title="Campus Voice"
      description="Moderated polls on spirit week themes, Homecoming, and student-led decisions."
    >
      <CampusVoicePolls initialPolls={polls} />
    </ShellPage>
  );
}
