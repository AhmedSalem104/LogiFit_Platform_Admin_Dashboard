import { QA_AGENT_CATALOG } from './qa-agent-catalog';

describe('QA agent catalog', () => {
  it('defines exactly the six production QA responsibilities with unique scopes', () => {
    expect(QA_AGENT_CATALOG.length).toBe(6);
    expect(new Set(QA_AGENT_CATALOG.map((agent) => agent.id)).size).toBe(6);
    expect(new Set(QA_AGENT_CATALOG.map((agent) => agent.scope)).size).toBe(6);

    for (const agent of QA_AGENT_CATALOG) {
      expect(agent.name).toBeTruthy();
      expect(agent.responsibility).toBeTruthy();
      expect(agent.inputs.length).toBeGreaterThan(0);
      expect(agent.outputs.length).toBeGreaterThan(0);
      expect(agent.evidence.length).toBeGreaterThan(0);
      expect(agent.testCases.length).toBeGreaterThan(0);
      expect(agent.securityControls.length).toBeGreaterThan(0);
      expect(agent.conflictPolicy.length).toBeGreaterThan(0);
      expect(agent.releaseGates.length).toBeGreaterThan(0);
      expect(new Set(agent.testCases.map((test) => test.id)).size).toBe(agent.testCases.length);
    }
  });

  it('keeps security and release gates explicit', () => {
    const security = QA_AGENT_CATALOG.find((agent) => agent.id === 'security');
    const release = QA_AGENT_CATALOG.find((agent) => agent.id === 'release-health');

    expect(security?.securityControls.join(' ')).toContain('allowlist');
    expect(security?.testCases.some((test) => test.id === 'SEC-001')).toBeTrue();
    expect(release?.releaseGates.join(' ')).toContain('health 200 Healthy');
    expect(release?.testCases.some((test) => test.id === 'REL-003')).toBeTrue();
  });
});
