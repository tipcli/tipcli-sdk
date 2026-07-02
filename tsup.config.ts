import { defineConfig } from "tsup";

export default defineConfig({
  bundle: true,
  clean: true,
  dts: true,
  entry: ["src/index.ts", "src/bin.ts", "src/cli.ts"],
  format: ["esm", "cjs"],
  sourcemap: true,
  target: "node20",
});
