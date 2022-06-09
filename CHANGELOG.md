# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.13.0](https://github.com/salesforcecli/sf-plugins-core/compare/v1.12.3...v1.13.0) (2022-06-09)

### Features

- catch method supports base and SfError ([2b9a038](https://github.com/salesforcecli/sf-plugins-core/commit/2b9a038713c77e1230e21f5cc6f8ae2a6aaab5be))

### Bug Fixes

- error can't be spread ([30930b7](https://github.com/salesforcecli/sf-plugins-core/commit/30930b74ff5e6b59116228d547362a284ad98388))

### [1.12.3](https://github.com/salesforcecli/sf-plugins-core/compare/v1.12.2...v1.12.3) (2022-05-04)

### Bug Fixes

- prevent multiple starts of progress bar ([8ec788c](https://github.com/salesforcecli/sf-plugins-core/commit/8ec788cfda452d2c227631fde64e01786f6f6a49))
- stop using once ([970fb80](https://github.com/salesforcecli/sf-plugins-core/commit/970fb808ad14a8d8bce0daabd78854c4a046e621))

### [1.12.2](https://github.com/salesforcecli/sf-plugins-core/compare/v1.12.1...v1.12.2) (2022-05-03)

### Bug Fixes

- update error message ([182cfa3](https://github.com/salesforcecli/sf-plugins-core/commit/182cfa30beb4e7fe052a0453d141e19ba7129647))

### [1.12.1](https://github.com/salesforcecli/sf-plugins-core/compare/v1.12.0...v1.12.1) (2022-04-20)

### Bug Fixes

- update config vars ([0c557b5](https://github.com/salesforcecli/sf-plugins-core/commit/0c557b59f6b833a6fe2812d9a765a2f006f57b01))

## [1.12.0](https://github.com/salesforcecli/sf-plugins-core/compare/v1.11.3...v1.12.0) (2022-04-18)

### Features

- adjusting message colors for accessibility ([6f873da](https://github.com/salesforcecli/sf-plugins-core/commit/6f873daf2e05c2ec0b52b357b15333a3b68e106e))

### [1.11.3](https://github.com/salesforcecli/sf-plugins-core/compare/v1.11.2...v1.11.3) (2022-04-12)

### Bug Fixes

- need await in order for the catch to be effective ([2805578](https://github.com/salesforcecli/sf-plugins-core/commit/28055783503177667620528b6246b252ff10cb7f))

### [1.11.2](https://github.com/salesforcecli/sf-plugins-core/compare/v1.11.1...v1.11.2) (2022-04-11)

### Bug Fixes

- optional orgs can be undefined ([412629d](https://github.com/salesforcecli/sf-plugins-core/commit/412629de689d7d73b7c2b0673b8e9b373cc957bc))
- throw if input provided but no org found ([10be468](https://github.com/salesforcecli/sf-plugins-core/commit/10be468c0c3e164fed171c947dbe437b2325605c))

### [1.11.1](https://github.com/salesforcecli/sf-plugins-core/compare/v1.11.0...v1.11.1) (2022-04-07)

### Bug Fixes

- adjust message formats ([5b62ced](https://github.com/salesforcecli/sf-plugins-core/commit/5b62cedeb522c08dcce01159a22060be72c1bf62))

## [1.11.0](https://github.com/salesforcecli/sf-plugins-core/compare/v1.10.0...v1.11.0) (2022-03-31)

### Features

- support error codes help section ([4852a4f](https://github.com/salesforcecli/sf-plugins-core/commit/4852a4f75bcc744febf276293ed5bf45080436e6))

## [1.10.0](https://github.com/salesforcecli/sf-plugins-core/compare/v1.9.0...v1.10.0) (2022-03-31)

### Features

- warn users when using a beta command ([2cf26f2](https://github.com/salesforcecli/sf-plugins-core/commit/2cf26f2d363a40b0739f082bfe4aedd62fd4531f))

## [1.9.0](https://github.com/salesforcecli/sf-plugins-core/compare/v1.8.1...v1.9.0) (2022-03-24)

### Features

- explain what a valid api version looks like ([4c5669a](https://github.com/salesforcecli/sf-plugins-core/commit/4c5669a969ef79eae1d4aec76f6cb20df92aae5e))

### [1.8.1](https://github.com/salesforcecli/sf-plugins-core/compare/v1.8.0...v1.8.1) (2022-03-24)

### Bug Fixes

- log errors to stderr ([9958d8e](https://github.com/salesforcecli/sf-plugins-core/commit/9958d8e49cf1fbe514026491d8d095651d1cb88b))

## [1.8.0](https://github.com/salesforcecli/sf-plugins-core/compare/v1.7.2...v1.8.0) (2022-03-17)

### Features

- confirms are timed ([9c89ee9](https://github.com/salesforcecli/sf-plugins-core/commit/9c89ee99901c7abefc11a811e8e4dda0c704ed1c))
- simplified confirm prompts ([ddf1364](https://github.com/salesforcecli/sf-plugins-core/commit/ddf1364a48fb384bd0ad66bc310a35abcef20d68))

### Bug Fixes

- better checking of hub ([8c92bfe](https://github.com/salesforcecli/sf-plugins-core/commit/8c92bfed8f0600ff03489abbb253b5b95c95128a))
- no unused, respects timeout ([c41c43e](https://github.com/salesforcecli/sf-plugins-core/commit/c41c43e5c480dc1dd914a86ec8c97a8af41369a1))
- use OptionFlag interface so that exactlyOne can be used ([0e65453](https://github.com/salesforcecli/sf-plugins-core/commit/0e65453dacb68a90f4af2387e571edbd4077ba1b))

### [1.7.2](https://github.com/salesforcecli/sf-plugins-core/compare/v1.7.1...v1.7.2) (2022-03-15)

### Bug Fixes

- need to pass ms to timedPrompt function ([f285e07](https://github.com/salesforcecli/sf-plugins-core/commit/f285e07525937798d0251da69c86c05cc683edfd))

### [1.7.1](https://github.com/salesforcecli/sf-plugins-core/compare/v1.7.0...v1.7.1) (2022-03-11)

### Bug Fixes

- add oclif enum to exports ([71ee6ac](https://github.com/salesforcecli/sf-plugins-core/commit/71ee6ac7942790ffc519512ade67330614ada51b))
- expose timed prompt in command class ([3b056c6](https://github.com/salesforcecli/sf-plugins-core/commit/3b056c668d3379ada6f85e2e5b5f6da76c1a3223))

## [1.7.0](https://github.com/salesforcecli/sf-plugins-core/compare/v1.6.1...v1.7.0) (2022-03-11)

### Features

- suppress progress bar output with env vars ([d2e8a84](https://github.com/salesforcecli/sf-plugins-core/commit/d2e8a849d7ca93b3dba538a26ce5f9ab7f858984))

### [1.6.1](https://github.com/salesforcecli/sf-plugins-core/compare/v1.6.0...v1.6.1) (2022-03-09)

### Bug Fixes

- erturn error - dont throw ([0ea70bc](https://github.com/salesforcecli/sf-plugins-core/commit/0ea70bc12cecd380a907323eba84ddb9d5a44e08))

## [1.6.0](https://github.com/salesforcecli/sf-plugins-core/compare/v1.5.3...v1.6.0) (2022-03-08)

### Features

- add timedPrompt method ([ea9e98c](https://github.com/salesforcecli/sf-plugins-core/commit/ea9e98c5bffdfc1e917d61006a91f4dba1f808f3))

### [1.5.3](https://github.com/salesforcecli/sf-plugins-core/compare/v1.5.2...v1.5.3) (2022-03-08)

### Bug Fixes

- expose styledHeader as func in sf command ([fd2dc48](https://github.com/salesforcecli/sf-plugins-core/commit/fd2dc48444be224a884c3b56d5604f4b854f1c0e))

### [1.5.2](https://github.com/salesforcecli/sf-plugins-core/compare/v1.5.1...v1.5.2) (2022-03-07)

### Bug Fixes

- add styled header function to sf command ([5cc0e8b](https://github.com/salesforcecli/sf-plugins-core/commit/5cc0e8bf60774918c2ebaf2ba5b465f3dd6caf15))
- retrhow ([eaebd44](https://github.com/salesforcecli/sf-plugins-core/commit/eaebd44d0028cedab92173ed30050757602d2c28))

### [1.5.1](https://github.com/salesforcecli/sf-plugins-core/compare/v1.5.0...v1.5.1) (2022-03-07)

## [1.5.0](https://github.com/salesforcecli/sf-plugins-core/compare/v1.4.1...v1.5.0) (2022-03-03)

### Features

- friendly default help for org flags ([f4d55b3](https://github.com/salesforcecli/sf-plugins-core/commit/f4d55b30c08e988c0231b97acce8ba2bc9733a06))

### [1.4.1](https://github.com/salesforcecli/sf-plugins-core/compare/v1.4.0...v1.4.1) (2022-03-02)

### Bug Fixes

- make toHelpSection types more friendly ([add364b](https://github.com/salesforcecli/sf-plugins-core/commit/add364b6be532dae6fb49f62164dad486b186347))

## [1.4.0](https://github.com/salesforcecli/sf-plugins-core/compare/v1.3.0...v1.4.0) (2022-03-02)

### Features

- common salesforce flags ([00ab4fc](https://github.com/salesforcecli/sf-plugins-core/commit/00ab4fc94d268b44dccb6a2de02fe4f720ff0fc0))
- debugging ([cc3fd1e](https://github.com/salesforcecli/sf-plugins-core/commit/cc3fd1e46134c08a4d76e79c74605e90e09abbb3))
- duration flag ([b11eaab](https://github.com/salesforcecli/sf-plugins-core/commit/b11eaabb0050961094f412d85c2bbbf4b183cd40))

### Bug Fixes

- error keys support createError ([f094c49](https://github.com/salesforcecli/sf-plugins-core/commit/f094c49f1ec1063fb05cdc74e1aab88e7ceb7f13))
- error message doesn't take params ([5d917bf](https://github.com/salesforcecli/sf-plugins-core/commit/5d917bf100d41077d2eaabcd89c41fa049ef6f21))
- wrong error name ([1b3bbbe](https://github.com/salesforcecli/sf-plugins-core/commit/1b3bbbeae9f3e888faf438fe8d1f4bfd6bdac2c9))

## [1.3.0](https://github.com/salesforcecli/sf-plugins-core/compare/v1.2.1...v1.3.0) (2022-02-23)

### Features

- add requiresProject property ([5ff0cf3](https://github.com/salesforcecli/sf-plugins-core/commit/5ff0cf34fffe896e1ed312585705ff13436e58cf))

### [1.2.1](https://github.com/salesforcecli/sf-plugins-core/compare/v1.2.0...v1.2.1) (2022-01-27)

### Bug Fixes

- protect against non-existent bar ([2d0dc37](https://github.com/salesforcecli/sf-plugins-core/commit/2d0dc37ce7fedfee4413ae91299de11c8cd9db93))

## [1.2.0](https://github.com/salesforcecli/sf-plugins-core/compare/v1.1.0...v1.2.0) (2022-01-27)

### Features

- expose ux methods in SfCommand ([8e58a93](https://github.com/salesforcecli/sf-plugins-core/commit/8e58a93a942d5a0305a77a82e938f778c59fcd16))

## [1.1.0](https://github.com/salesforcecli/sf-plugins-core/compare/v1.0.5...v1.1.0) (2022-01-03)

### Features

- add spinner methods ([f209f8f](https://github.com/salesforcecli/sf-plugins-core/commit/f209f8f4e6736b9de91e37f865d66b5356e5abec))

### Bug Fixes

- add status method ([9cf2069](https://github.com/salesforcecli/sf-plugins-core/commit/9cf20694d76e2509785b7c8faa4bd63ab190707e))
- make status a getter/setter ([441c55a](https://github.com/salesforcecli/sf-plugins-core/commit/441c55acd3d811664213e9801a8bcc270e3aca7b))

### [1.0.5](https://github.com/salesforcecli/sf-plugins-core/compare/v1.0.4...v1.0.5) (2021-12-16)

### Bug Fixes

- bump dependencies ([4f78d8c](https://github.com/salesforcecli/sf-plugins-core/commit/4f78d8c940aab41bb406c45a9df98f686e626d28))

### [1.0.4](https://github.com/salesforcecli/sf-plugins-core/compare/v1.0.3...v1.0.4) (2021-10-13)

### Bug Fixes

- bump module versions ([abdf5e3](https://github.com/salesforcecli/sf-plugins-core/commit/abdf5e37205b464a36393ca1887ce90a7c1ba302))

### [1.0.3](https://github.com/salesforcecli/sf-plugins-core/compare/v1.0.2...v1.0.3) (2021-10-12)

### [1.0.2](https://github.com/salesforcecli/sf-plugins-core/compare/v1.0.1...v1.0.2) (2021-10-11)

### Bug Fixes

- bump oclif and sfdx-core versions ([3d38a70](https://github.com/salesforcecli/sf-plugins-core/commit/3d38a70dcad79aa151529bf51d281f68fe92a3ce))

### [1.0.1](https://github.com/salesforcecli/sf-plugins-core/compare/v1.0.0...v1.0.1) (2021-10-06)

### Bug Fixes

- update inquirer ([067bbfb](https://github.com/salesforcecli/sf-plugins-core/commit/067bbfbbfcd271ae25260e6b83452093b1fe4deb))

## [1.0.0](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.28...v1.0.0) (2021-09-29)

### [0.0.28](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.27...v0.0.28) (2021-09-29)

### Bug Fixes

- allow empty message in logSensitive ([5b8edf5](https://github.com/salesforcecli/sf-plugins-core/commit/5b8edf509647887500d9e71b506939b3cc6945d9))

### [0.0.27](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.26...v0.0.27) (2021-09-29)

### Bug Fixes

- publish messages ([91a6aa6](https://github.com/salesforcecli/sf-plugins-core/commit/91a6aa6c396f9b33049407820d0b8bd9caaa30f4))

### [0.0.26](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.25...v0.0.26) (2021-09-29)

### Features

- logSensitive, capture warnings ([a8b3e76](https://github.com/salesforcecli/sf-plugins-core/commit/a8b3e76ff20806b136ee606797b84a70c8f5a528))

### [0.0.25](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.24...v0.0.25) (2021-09-21)

### Bug Fixes

- add envirnment type to env list ([8f020df](https://github.com/salesforcecli/sf-plugins-core/commit/8f020dfc8695be19a7fd1f4b811b8c2b8c321418))

### [0.0.24](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.23...v0.0.24) (2021-09-16)

### Bug Fixes

- allow null for EnvDisplay ([0868d3f](https://github.com/salesforcecli/sf-plugins-core/commit/0868d3f0ed23e28c53ce11cb447e41b9b0144ac1))

### [0.0.23](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.22...v0.0.23) (2021-09-15)

### Bug Fixes

- update to latest oclif/core and enable json flag ([b486ef1](https://github.com/salesforcecli/sf-plugins-core/commit/b486ef173b27ba465cc8fddf53e3a53d339f8734))

### [0.0.22](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.21...v0.0.22) (2021-09-15)

### Bug Fixes

- bump oclif/core ([c7a07f7](https://github.com/salesforcecli/sf-plugins-core/commit/c7a07f7671699197f3db93ec750e009eb9dfd56f))

### [0.0.21](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.20...v0.0.21) (2021-09-14)

### Bug Fixes

- move sf command to this repo ([968f80f](https://github.com/salesforcecli/sf-plugins-core/commit/968f80f0b8aecd0d47fe8d428c605117828f886f))

### [0.0.20](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.19...v0.0.20) (2021-09-14)

### [0.0.19](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.18...v0.0.19) (2021-09-13)

### Features

- add logout hook ([4a4d79b](https://github.com/salesforcecli/sf-plugins-core/commit/4a4d79bcd9f2017e70f75967bb0661ae3eb4aa4a))

### [0.0.18](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.17...v0.0.18) (2021-09-10)

### Bug Fixes

- missed export ([63086ae](https://github.com/salesforcecli/sf-plugins-core/commit/63086aee3dc26c6f674c0bad8054205ed3992597))

### [0.0.17](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.16...v0.0.17) (2021-09-10)

### Features

- add help section helper function ([379d14f](https://github.com/salesforcecli/sf-plugins-core/commit/379d14f45eedc46736f64bb5c37a7f906e235d4c))

### [0.0.16](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.15...v0.0.16) (2021-09-08)

### Bug Fixes

- bump oclif/core ([1cd3df6](https://github.com/salesforcecli/sf-plugins-core/commit/1cd3df66dde4d1e5386221e892aa01a7d504261c))

### [0.0.15](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.14...v0.0.15) (2021-08-31)

### Bug Fixes

- improve jsdocs ([e3e3784](https://github.com/salesforcecli/sf-plugins-core/commit/e3e3784954fc2d6b06f96459c824cf77795a9de9))
- improve jsdocs ([aefdd06](https://github.com/salesforcecli/sf-plugins-core/commit/aefdd06b164d413b3f3c4d51b36dea475efcc3ef))

### [0.0.14](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.13...v0.0.14) (2021-08-31)

### Bug Fixes

- improve env types ([e7a7c1d](https://github.com/salesforcecli/sf-plugins-core/commit/e7a7c1df001d02b60c31bcbe5abe4ab31d5faf8d))

### [0.0.13](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.12...v0.0.13) (2021-08-30)

### Bug Fixes

- update exports ([548ab46](https://github.com/salesforcecli/sf-plugins-core/commit/548ab4646bd1e2d79dbda0609551e6f805b69d09))

### [0.0.12](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.11...v0.0.12) (2021-08-30)

### Features

- support env display ([446af15](https://github.com/salesforcecli/sf-plugins-core/commit/446af15385ed57e7d5ebd40c4a4964b2bf326e16))

### [0.0.11](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.10...v0.0.11) (2021-08-30)

### Features

- rename to sf-plugins-core ([e51d6aa](https://github.com/salesforcecli/sf-plugins-core/commit/e51d6aa6879c085ae9efac990d6d406a79615088))

### [0.0.10](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.9...v0.0.10) (2021-08-10)

### Bug Fixes

- correct header to data column alignment ([a6d1baf](https://github.com/salesforcecli/sf-plugins-core/commit/a6d1bafd098443dcb4381f03fd7283594d263c8d))

### [0.0.9](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.8...v0.0.9) (2021-07-15)

### Bug Fixes

- rename ProjectDeployOptions to DeployOptions ([eafefcf](https://github.com/salesforcecli/sf-plugins-core/commit/eafefcfb55f73e96e2b0b08bb3129b6aa0fb6571))

### [0.0.8](https://github.com/salesforcecli/sf-plugins-core/compare/v0.0.7...v0.0.8) (2021-07-15)

### [0.0.7](https://github.com/salesforcecli/plugin-project-utils/compare/v0.0.6...v0.0.7) (2021-07-01)

### Features

- support deploy file ([99b4a81](https://github.com/salesforcecli/plugin-project-utils/commit/99b4a81b1a844714233a30679ae267c6866ba4a2))

### [0.0.6](https://github.com/salesforcecli/plugin-project-utils/compare/v0.0.5...v0.0.6) (2021-06-28)

### Bug Fixes

- allow empty log message ([1272215](https://github.com/salesforcecli/plugin-project-utils/commit/1272215b62a35e89072df2f02c1bab6c2999e056))

### [0.0.5](https://github.com/salesforcecli/plugin-project-utils/compare/v0.0.4...v0.0.5) (2021-06-28)

### Features

- add Prompter class ([7f7861f](https://github.com/salesforcecli/plugin-project-utils/commit/7f7861f68dc74d815a1bf2d668edd719496524ff))

### [0.0.4](https://github.com/salesforcecli/plugin-project-utils/compare/v0.0.3...v0.0.4) (2021-06-28)

### Bug Fixes

- update Options type ([f24a800](https://github.com/salesforcecli/plugin-project-utils/commit/f24a800409e026605f08717cd572e89afcdf35d0))

### [0.0.3](https://github.com/salesforcecli/plugin-project-utils/compare/v0.0.2...v0.0.3) (2021-06-28)

### Features

- add Deployables class ([0405a6b](https://github.com/salesforcecli/plugin-project-utils/commit/0405a6bdc78cf44237e1bd51efb2199c275678ca))

### [0.0.2](https://github.com/salesforcecli/plugin-project-utils/compare/v0.0.1...v0.0.2) (2021-06-24)

### 0.0.1 (2021-06-24)

### Features

- deployer interface ([fbfee1e](https://github.com/salesforcecli/plugin-project-utils/commit/fbfee1eb223c67ead31dfd6da65ed6d55c83015d))
