/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Org, SfError, OrgConfigProperties } from '@salesforce/core';
import { MockTestOrgData, shouldThrow, TestContext } from '@salesforce/core/lib/testSetup';
import { assert, expect, config } from 'chai';
import { getHubOrThrow, getOrgOrThrow, maybeGetHub, maybeGetOrg } from '../../../src/flags/orgFlags';

config.truncateThreshold = 0;

describe('org flags', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();
  const testHub = new MockTestOrgData();
  // set these into the "cache" to avoid "server checks"
  testOrg.isDevHub = false;
  testHub.isDevHub = true;

  beforeEach(async () => {
    await $$.stubAuths(testOrg, testHub);
  });
  afterEach(async () => {
    $$.restore();
  });

  describe('requiredOrg', () => {
    it('has input, returns org', async () => {
      const retrieved = await getOrgOrThrow(testOrg.username);
      expect(retrieved.getOrgId()).to.equal(testOrg.orgId);
    });
    // skipped tests are waiting for a fix to core/testSetup https://github.com/forcedotcom/sfdx-core/pull/748
    it.skip('has input, no org found => throw', async () => {
      try {
        await shouldThrow(getOrgOrThrow('nope@bad.fail'));
      } catch (e) {
        assert(e instanceof SfError);
        expect(e).to.have.property('name', 'NamedOrgNotFound');
      }
    });
    it('no input, uses default', async () => {
      await $$.stubConfig({ [OrgConfigProperties.TARGET_ORG]: testOrg.username });
      expect(await getOrgOrThrow()).to.be.instanceOf(Org);
    });
    it('no input, no default => throw', async () => {
      await $$.stubConfig({});
      try {
        await shouldThrow(getOrgOrThrow());
      } catch (e) {
        assert(e instanceof SfError);
        expect(e).to.have.property('name', 'NoDefaultEnvError');
      }
    });
  });
  describe('optionalOrg', () => {
    it('has input, returns org', async () => {
      const retrieved = await maybeGetOrg(testOrg.username);
      expect(retrieved.getOrgId()).to.equal(testOrg.orgId);
    });
    it.skip('has input, no org => throw', async () => {
      try {
        await shouldThrow(maybeGetOrg('nope@bad.fail'));
      } catch (e) {
        assert(e instanceof SfError);
        expect(e).to.have.property('name', 'NamedOrgNotFound');
      }
    });
    it('no input, uses default', async () => {
      await $$.stubConfig({ [OrgConfigProperties.TARGET_ORG]: testOrg.username });
      expect(await maybeGetOrg()).to.be.instanceOf(Org);
    });
    it('no input, no default => ok', async () => {
      expect(await maybeGetOrg()).to.be.undefined;
    });
  });
  describe('requiredHub', () => {
    it('has input, returns org', async () => {
      expect(await getHubOrThrow(testHub.username)).to.be.instanceOf(Org);
    });
    it('has input, finds org that is not a hub => throw', async () => {
      try {
        await shouldThrow(getHubOrThrow(testOrg.username));
      } catch (e) {
        assert(e instanceof SfError);
        expect(e).to.have.property('name', 'NotADevHubError');
      }
    });
    it.skip('has input, no org => throw', async () => {
      try {
        await shouldThrow(maybeGetHub('nope@bad.fail'));
      } catch (e) {
        assert(e instanceof SfError);
        expect(e).to.have.property('name', 'NamedOrgNotFound');
      }
    });
    it('no input, uses default', async () => {
      await $$.stubConfig({ [OrgConfigProperties.TARGET_DEV_HUB]: testHub.username });
      const retrieved = await getHubOrThrow();
      expect(retrieved).to.be.instanceOf(Org);
      expect(retrieved.getOrgId()).to.equal(testHub.orgId);
    });
    it('no input, uses default but is not a hub => throw', async () => {
      await $$.stubConfig({ [OrgConfigProperties.TARGET_DEV_HUB]: testOrg.username });
      try {
        await shouldThrow(getHubOrThrow());
      } catch (e) {
        assert(e instanceof SfError);
        expect(e).to.have.property('name', 'NotADevHubError');
      }
    });
    it('no input, no default => throws', async () => {
      await $$.stubConfig({});
      try {
        await shouldThrow(getHubOrThrow());
      } catch (e) {
        assert(e instanceof SfError);
        expect(e).to.have.property('name', 'NoDefaultDevHubError');
      }
    });
  });
  describe('optionalHub', () => {
    it('has input, returns org', async () => {
      const retrieved = await maybeGetHub(testHub.username);
      expect(retrieved).to.be.instanceOf(Org);
    });
    it('has input, finds org that is not a hub => throw', async () => {
      try {
        await shouldThrow(maybeGetHub(testOrg.username));
      } catch (e) {
        assert(e instanceof SfError);
        expect(e).to.have.property('name', 'NotADevHubError');
      }
    });
    it.skip('has input, no org => throws', async () => {
      try {
        await shouldThrow(maybeGetHub('nope@bad.fail'));
      } catch (e) {
        assert(e instanceof SfError);
        expect(e).to.have.property('name', 'NamedOrgNotFound');
      }
    });
    it('no input, uses default', async () => {
      await $$.stubConfig({ [OrgConfigProperties.TARGET_DEV_HUB]: testHub.username });
      const retrieved = await maybeGetHub();
      expect(retrieved).to.be.instanceOf(Org);
      expect(retrieved.getOrgId()).to.equal(testHub.orgId);
    });
    it('no input, uses default but is not a hub => throw', async () => {
      await $$.stubConfig({ [OrgConfigProperties.TARGET_DEV_HUB]: testOrg.username });
      try {
        await shouldThrow(maybeGetHub());
      } catch (e) {
        assert(e instanceof SfError);
        expect(e).to.have.property('name', 'NotADevHubError');
      }
    });
    it('no input, no default => ok', async () => {
      await $$.stubConfig({});
      expect(await maybeGetHub()).to.be.undefined;
    });
  });
});
