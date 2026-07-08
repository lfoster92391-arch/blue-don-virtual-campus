import { notFound } from "next/navigation";

import { ModuleShellPage } from "@/components/modules/module-shell-page";
import { getModuleShell } from "@/config/module-shells";

export function createModulePage(slug: string) {
  return function ModulePage() {
    const config = getModuleShell(slug);

    if (!config) {
      notFound();
    }

    return <ModuleShellPage config={config} />;
  };
}
