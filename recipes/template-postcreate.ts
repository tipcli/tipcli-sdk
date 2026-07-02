import { showSponsorCard } from "@tipcli/sdk";

async function finishTemplateInstall(projectName: string): Promise<void> {
  console.log(`Created ${projectName}.`);
  console.log("Next: cd into the project and run pnpm dev.");

  await showSponsorCard({
    publisherKey: process.env.TIPCLI_PUBLISHER_KEY,
    surface: "template-postcreate",
    category: "frontend",
  });
}

await finishTemplateInstall(process.argv[2] ?? "my-app");
