import { Command } from "commander";
import { showSponsorCard } from "@tipcli/sdk";

const program = new Command();

program
  .name("shipit")
  .description("Example CLI with one human-visible TipCLI sponsor card.")
  .action(async () => {
    console.log("Build complete.");

    await showSponsorCard({
      publisherKey: process.env.TIPCLI_PUBLISHER_KEY,
      surface: "cli-completion-summary",
      category: "devops",
    });
  });

await program.parseAsync(process.argv);
