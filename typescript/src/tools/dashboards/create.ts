import type { z } from "zod";
import type { Context, Tool } from "@/tools/types";
import { getProjectBaseUrl } from "@/lib/utils/api";
import { DashboardCreateSchema } from "@/schema/tool-inputs";

const schema = DashboardCreateSchema;

type Params = z.infer<typeof schema>;

export const createHandler = async (context: Context, params: Params) => {
	const { data } = params;
	const projectId = await context.getProjectId();
	const dashboardResult = await context.api.dashboards({ projectId }).create({ data });

	if (!dashboardResult.success) {
		throw new Error(`Failed to create dashboard: ${dashboardResult.error.message}`);
	}

	const dashboardWithUrl = {
		...dashboardResult.data,
		url: `${getProjectBaseUrl(projectId)}/dashboard/${dashboardResult.data.id}`,
	};

	return { content: [{ type: "text", text: JSON.stringify(dashboardWithUrl) }] };
};

const tool = (): Tool<typeof schema> => ({
	name: "dashboard-create",
	description: `
        - Create a new dashboard in the project.
        - Requires name and optional description, tags, and other properties.
    `,
	schema,
	handler: createHandler,
});

export default tool;
