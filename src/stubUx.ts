/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

// intentionally keep sinon out of dependencies since this is meant for test-time only
// eslint-disable-next-line import/no-extraneous-dependencies
import { SinonSandbox } from 'sinon';
import { SfCommand } from './sfCommand.js';
import { Spinner } from './ux/spinner.js';
import { Ux } from './ux/ux.js';

/**
 * Stub methods on the Ux class.
 * Even if you plan to make no assertions, this will silence the output to keep your test results clean
 *
 * @example
 * ```
 * import { stubUx } from '@salesforce/sf-plugins-core';
 * let stubUxStubs: ReturnType<typeof stubUx>;
 *
 * // inside your beforeEach, $$ is a SinonSandbox
 * stubUxStubs = stubUx($$.SANDBOX);
 *
 * // inside some test
 * expect(stubUxStubs.log.args.flat()).to.deep.include(`foo`);
 * ```
 *
 */
export function stubUx(sandbox: SinonSandbox) {
  return {
    log: sandbox.stub(Ux.prototype, 'log'),
    warn: sandbox.stub(Ux.prototype, 'warn'),
    table: sandbox.stub(Ux.prototype, 'table'),
    url: sandbox.stub(Ux.prototype, 'url'),
    styledHeader: sandbox.stub(Ux.prototype, 'styledHeader'),
    styledObject: sandbox.stub(Ux.prototype, 'styledObject'),
    styledJSON: sandbox.stub(Ux.prototype, 'styledJSON'),
  };
}

/**
 * Stub methods on the Ux class.
 * Even if you plan to make no assertions, this will silence the output to keep your test results clean
 *
 * @example
 * ```
 * import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
 * let stubSfCommandUxStubs: ReturnType<typeof stubSfCommandUx>;
 *
 * // inside your beforeEach, $$ is a SinonSandbox
 * cmdStubs = stubSfCommandUx($$.SANDBOX);
 *
 * // inside some test
 * expect(cmdStubs.warn.args.flat()).to.deep.include(`foo`);
 * ```
 *
 */
export function stubSfCommandUx(sandbox: SinonSandbox) {
  return {
    log: sandbox.stub(SfCommand.prototype, 'log'),
    logJson: sandbox.stub(SfCommand.prototype, 'logJson'),
    logToStderr: sandbox.stub(SfCommand.prototype, 'logToStderr'),
    logSuccess: sandbox.stub(SfCommand.prototype, 'logSuccess'),
    logSensitive: sandbox.stub(SfCommand.prototype, 'logSensitive'),
    info: sandbox.stub(SfCommand.prototype, 'info'),
    warn: sandbox.stub(SfCommand.prototype, 'warn'),
    table: sandbox.stub(SfCommand.prototype, 'table'),
    url: sandbox.stub(SfCommand.prototype, 'url'),
    styledHeader: sandbox.stub(SfCommand.prototype, 'styledHeader'),
    styledObject: sandbox.stub(SfCommand.prototype, 'styledObject'),
    styledJSON: sandbox.stub(SfCommand.prototype, 'styledJSON'),
  };
}

/**
 * Stub the SfCommand spinner.
 * Even if you plan to make no assertions, this will silence the output to keep your test results clean
 *
 * @example
 * ```
 * import { stubSpinner } from '@salesforce/sf-plugins-core';
 * let spinnerStubs: ReturnType<typeof stubSpinner>;
 *
 * // inside your beforeEach, $$ is a SinonSandbox
 * spinnerStubs = stubSpinner($$.SANDBOX);
 *
 * // inside some test
 * expect(spinnerStubs.callCount).equals(1);
 * ```
 *
 */
export function stubSpinner(sandbox: SinonSandbox) {
  return {
    start: sandbox.stub(Spinner.prototype, 'start'),
    stop: sandbox.stub(Spinner.prototype, 'stop'),
  };
}

/**
 * Stub the SfCommand prompter.
 *
 * @example
 * ```
 * import { stubPrompter } from '@salesforce/sf-plugins-core';
 * let prompterStubs: ReturnType<typeof stubPrompter>;
 *
 * // inside your beforeEach, $$ is a SinonSandbox
 * prompterStubs = stubPrompter($$.SANDBOX);
 *
 * // inside some test
 * expect(prompterStubs.confirm.firstCall.args[0]).to.equal(
 *     messages.getMessage('confirmDelete', ['scratch', testOrg.username])
 *   );
 * ```
 *
 */
export function stubPrompter(sandbox: SinonSandbox) {
  return {
    secret: sandbox.stub(SfCommand.prototype, 'secretPrompt'),
    confirm: sandbox.stub(SfCommand.prototype, 'confirm'),
  };
}
