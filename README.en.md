# IAP — Interaction Accommodation Protocol

English / [日本語](README.md)

**A proposal from partial-standards for making the conditions of collaboration explicit.**

Maintained and edited by [@aidhidesupport](https://github.com/aidhidesupport). Specification: 0.2-draft. Basic implementation: 0.2.5. Updated: 2026-09-23.

IAP is a draft specification for agreeing on goals, completion criteria, communication, checks, and how to pause and resume work. It aims to preserve a person's choices when working with other people, AI, and services. It grew out of difficulties experienced by people with neurodevelopmental differences. Using it does not require disclosing a diagnosis or an IQ score.

The proposal is published as part of partial-standards. The Codex integration is an experimental release with the core workflow implemented: checking completion criteria, correcting and checking again, drafting a summary, invalidating stale assessments, and pausing or resuming. The current trial is intended for people who can run terminal commands on macOS or Linux. You can start with the bundled fictional example.

Installation by other people and reduced workload in real projects remain unverified. Release 0.2.5 passed 80 distribution tests in each of four environments. The full workflow with actual Codex was checked in 0.2.4; repeating it with 0.2.5 remains a next technical check. See [evidence and limitations](STATUS.md). IAP is a draft proposal, not an adopted standard or an official MCP extension.

## The first example: a PM, a developer, and Codex

The PM and developer are **different people**. The PM provides the goal and completion criteria. The developer works with Codex to inspect intermediate results, make corrections, run tests, and check the results again within the agreed scope.

The developer shares a short summary and asks the PM for decisions that change the goal, criteria, or scope. Routine corrections do not wait for the PM's approval each time. A tool's assessment that criteria are met is separate from the PM accepting the work.

## Start here

- [Quickstart in English](QUICKSTART.en.md): a fictional request, each person's role, and local checks, with optional installation, pausing, and removal in a temporary folder.
- [Website, role guides and 99-second demo](https://aidhidesupport.github.io/iap/) (Japanese).
- [Developer guide](CODEX_GUIDE.md) and [PM guide](PM_GUIDE.md) (Japanese).
- [Current evidence and limitations](STATUS.md) and [distribution tests](DISTRIBUTION_TESTS.md) (Japanese).
- [Specification](IAP_SPEC.md), [conformance and counterexamples](CONFORMANCE_CASES.md), and [roadmap](ROADMAP.md) (Japanese).

The demo uses a fictional case. It is an explanation, not a recording of a real project's results. Technical checks do not establish reduced workload or better outcomes for real PM/developer pairs.

The website provides guides and downloads. You run the bundled example in your terminal. Installing the Codex integration is a separate step; the documented and tested setup uses Codex CLI. There is no dedicated GUI covering installation through sharing, and the earlier manual web prototype does not synchronize with the Codex integration.

The current outreach sequence is to help individuals discover the proposal online, try the fictional example, and return questions or counterexamples. Real PM/developer pilots remain a later validation step; securing a company pilot is not a prerequisite for this outreach. Trying the example does not establish continued use in personal projects.

## Get the implementation or contribute

[Download 0.2.5](https://aidhidesupport.github.io/iap/downloads/iap-codex-0.2.5.tar.gz) and its [SHA-256 checksum](https://aidhidesupport.github.io/iap/downloads/iap-codex-0.2.5.sha256). The local example requires macOS or Linux and Node.js 22.13 or later. Trying the bundled example does not require a PM, a Codex login, or additional npm packages.

Browse the [implementation and tests](codex/) or the [website source](website/). [Contributing instructions](CONTRIBUTING.md#development-and-contributions) explain how to run checks and submit changes. Questions, unclear requirements, installation problems, and small fictional counterexamples are welcome in [Issues](https://github.com/aidhidesupport/iap/issues). Do not include customer material, private logs, credentials, or personal information.

## Use and support

Documentation is available under **CC BY 4.0**. The basic implementation, including its bundled documentation and tests, is available under **Apache-2.0**. Commercial use is allowed under the applicable license; a donation or separate commercial permission is not required. Costs of other tools remain subject to their providers' terms.

See [license scope](LICENSE.md), [full CC BY 4.0 text](LICENSE-CC-BY-4.0.txt), [full Apache-2.0 text](LICENSE-APACHE-2.0.txt), and [brand policy](BRAND.md). Preserve required attribution and notices, identify modifications, and do not present an independent implementation as an official endorsement. These licenses do not grant trademark rights.

Support for maintaining the proposal is voluntary. It does not buy priority work, promised features, deadlines, or control over specification decisions. See the [participation and support page](SUPPORT.md) for the current status.
