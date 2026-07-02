import { showSponsorCard } from "@tipcli/sdk";

type AgentRun = {
  changedFiles: number;
  checksPassed: string[];
  summary: string;
};

export async function printAgentRunSummary(run: AgentRun): Promise<void> {
  console.log(run.summary);
  console.log(`Changed files: ${run.changedFiles}`);
  console.log(`Checks: ${run.checksPassed.join(", ") || "none"}`);

  await showSponsorCard({
    publisherKey: process.env.TIPCLI_PUBLISHER_KEY,
    surface: "agent-run-summary",
    category: "ai",
  });
}

await printAgentRunSummary({
  changedFiles: 3,
  checksPassed: ["typecheck", "unit tests"],
  summary: "Agent finished the requested refactor.",
});
