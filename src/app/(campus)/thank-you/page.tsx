import { ThankYouWall } from "@/components/culture/thank-you-wall";
import { ShellPage } from "@/components/layout/shell-page";
import { getThankYouMessages } from "@/services/madonna-culture-service";

export default function ThankYouPage() {
  const messages = getThankYouMessages();

  return (
    <ShellPage
      title="Thank You Wall"
      description="Share gratitude with teachers, coaches, staff, and the Madonna community."
    >
      <ThankYouWall initialMessages={messages} />
    </ShellPage>
  );
}
