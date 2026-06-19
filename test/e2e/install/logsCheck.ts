/**
 * Enables verbose logging in an AdGuardHome.yaml payload.
 * Keeps original formatting and updates only the first matched "verbose" key.
 */
export function enableVerboseLogging(configYaml: string): string {
  const verbosePattern = /^(\s*verbose:\s*)(true|false)(\s*(?:#.*)?)$/m;
  const match = configYaml.match(verbosePattern);
  if (!match) {
    throw new Error('AdGuardHome.yaml must contain a top-level "verbose" setting');
  }
  if (match[2] === 'true') {
    return configYaml;
  }
  return configYaml.replace(verbosePattern, '$1true$3');
}
