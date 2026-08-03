import { CampusVersionBanner } from "@/components/layout/campus-version-banner";
import { DashboardWidgetRenderer } from "@/components/dashboard/dashboard-widget-renderer";
import { getDashboardViewModel } from "@/services/dashboard-service";
import type { DashboardContext } from "@/config/dashboard-layouts";
import type { CampusUser } from "@/types/auth";

type DashboardContentProps = {
  user: CampusUser;
  showVersionBanner?: boolean;
  context?: DashboardContext;
};

export async function DashboardContent({
  user,
  showVersionBanner = true,
  context = {},
}: DashboardContentProps) {
  const viewModel = await getDashboardViewModel(user, context);

  const heroWidgets = viewModel.widgets.filter((widget) => widget.zone === "hero");
  const actionWidgets = viewModel.widgets.filter((widget) => widget.zone === "actions");
  const metricWidgets = viewModel.widgets.filter((widget) => widget.zone === "metrics");
  const adminWidgets = viewModel.widgets.filter((widget) => widget.zone === "admin");
  const mainWidgets = viewModel.widgets.filter((widget) => widget.zone === "main");
  const footerWidgets = viewModel.widgets.filter((widget) => widget.zone === "footer");

  return (
    <div className="flex flex-1 flex-col gap-6">
      {showVersionBanner ? <CampusVersionBanner /> : null}

      {heroWidgets.map((widget) => (
        <DashboardWidgetRenderer
          key={widget.id}
          widgetId={widget.id}
          user={user}
          data={viewModel.data}
          hasLinkedStudents={viewModel.hasLinkedStudents}
        />
      ))}

      {actionWidgets.map((widget) => (
        <DashboardWidgetRenderer
          key={widget.id}
          widgetId={widget.id}
          user={user}
          data={viewModel.data}
          hasLinkedStudents={viewModel.hasLinkedStudents}
        />
      ))}

      {metricWidgets.map((widget) => (
        <DashboardWidgetRenderer
          key={widget.id}
          widgetId={widget.id}
          user={user}
          data={viewModel.data}
          hasLinkedStudents={viewModel.hasLinkedStudents}
        />
      ))}

      {adminWidgets.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {adminWidgets.map((widget) => (
            <DashboardWidgetRenderer
              key={widget.id}
              widgetId={widget.id}
              user={user}
              data={viewModel.data}
              hasLinkedStudents={viewModel.hasLinkedStudents}
            />
          ))}
        </div>
      ) : null}

      {mainWidgets.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {mainWidgets.map((widget) => (
            <DashboardWidgetRenderer
              key={widget.id}
              widgetId={widget.id}
              user={user}
              data={viewModel.data}
              hasLinkedStudents={viewModel.hasLinkedStudents}
            />
          ))}
        </div>
      ) : null}

      {footerWidgets.map((widget) => (
        <DashboardWidgetRenderer
          key={widget.id}
          widgetId={widget.id}
          user={user}
          data={viewModel.data}
          hasLinkedStudents={viewModel.hasLinkedStudents}
        />
      ))}
    </div>
  );
}
