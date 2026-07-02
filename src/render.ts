import boxen from "boxen";
import chalk from "chalk";

type RenderSponsorCardInput = {
  clickUrl: string;
  displayUrl: string;
  message: string;
  sponsorName: string;
};

function terminalLink(label: string, url: string): string {
  if (
    !process.stdout.isTTY ||
    process.env.TIPCLI_NO_HYPERLINK === "1" ||
    process.env.DEVBILLBOARD_NO_HYPERLINK === "1"
  ) {
    return label;
  }

  return `\u001B]8;;${url}\u0007${label}\u001B]8;;\u0007`;
}

export function renderSponsorCard(card: RenderSponsorCardInput): string {
  const content = [
    `${chalk.dim("Sponsored by")} ${chalk.bold(card.sponsorName)}`,
    card.message,
    chalk.dim(terminalLink(card.displayUrl, card.clickUrl)),
  ].join("\n");

  return boxen(content, {
    borderColor: "gray",
    borderStyle: "round",
    margin: 1,
    padding: 1,
  });
}
