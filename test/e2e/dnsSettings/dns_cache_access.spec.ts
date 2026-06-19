import { test, expect } from '../runtime/fixtures';
import { setDnsConfig, setAccessConfig, getDnsInfo } from '../shared/dns/dns-settings.ts';

test.describe('DNS Cache & Access Tests (Cases 4108, 4109, 4110, 4112)', () => {
  // Case #4112: Allowed Clients. Queries run from inside the container (client
  // 127.0.0.1), so access control by that IP is exercised directly.
  test('4112 — Allowed clients: allow/deny combined', async ({ agh, api }) => {
    await setDnsConfig(agh.baseUrl, { upstream_dns: ['8.8.8.8'] }, api.authHeaders);

    // 1. Allow only 1.2.3.4 -> localhost (the in-container client) must be refused.
    await setAccessConfig(agh.baseUrl, {
      allowed_clients: ['1.2.3.4'],
      disallowed_clients: [],
      blocked_hosts: [],
    }, api.authHeaders);
    // AGH drops queries from disallowed clients (no response), so a blocked
    // query surfaces as a timeout rather than a clean answer.
    const refused = await agh.dnslookup('example.com', { type: 'A', timeoutSec: 3 });
    expect(refused.status, 'Should block the in-container client when only 1.2.3.4 is allowed').not.toBe('NOERROR');

    // 2. Reset (allow all)
    await setAccessConfig(agh.baseUrl, { allowed_clients: [] }, api.authHeaders);
    const allowed = await agh.dnslookup('example.com', { type: 'A' });
    expect(allowed.status, 'Should allow the in-container client again').toBe('NOERROR');

    // 3. Disallow localhost
    await setAccessConfig(agh.baseUrl, { disallowed_clients: ['127.0.0.1'] }, api.authHeaders);
    const blocked = await agh.dnslookup('example.com', { type: 'A', timeoutSec: 3 });
    expect(blocked.status, 'Should block the in-container client when 127.0.0.1 is disallowed').not.toBe('NOERROR');

    await setAccessConfig(agh.baseUrl, { disallowed_clients: [] }, api.authHeaders);
  });
});
