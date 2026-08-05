export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { assertProductionConfiguration } = await import("./lib/config");
  assertProductionConfiguration();
}
