import type { z } from "zod";
import type { Context, Tool } from "@/tools/types";
import { FeatureFlagDeleteSchema } from "@/schema/tool-inputs";

const schema = FeatureFlagDeleteSchema;

type Params = z.infer<typeof schema>;

export const deleteHandler = async (context: Context, params: Params) => {
	const { flagKey } = params;
	const projectId = await context.getProjectId();

	const flagResult = await context.api.featureFlags({ projectId }).findByKey({ key: flagKey });
	if (!flagResult.success) {
		throw new Error(`Failed to find feature flag: ${flagResult.error.message}`);
	}

	if (!flagResult.data) {
		return {
			content: [{ type: "text", text: "Feature flag is already deleted." }],
		};
	}

	const deleteResult = await context.api.featureFlags({ projectId }).delete({
		flagId: flagResult.data.id,
	});
	if (!deleteResult.success) {
		throw new Error(`Failed to delete feature flag: ${deleteResult.error.message}`);
	}

	return {
		content: [{ type: "text", text: JSON.stringify(deleteResult.data) }],
	};
};

const tool = (): Tool<typeof schema> => ({
	name: "delete-feature-flag",
	description: `
        - Use this tool to delete a feature flag in the project.
    `,
	schema,
	handler: deleteHandler,
});

export default tool;
