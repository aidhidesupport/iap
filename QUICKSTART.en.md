# Understand IAP through one request

English / [日本語](QUICKSTART.md) · [Overview](README.en.md)

2026-09-23. This is a fictional example of the partial-standards proposal, not evidence from a real project. The PM and developer are different people. You can start with this outline in your existing chat.

## 1. The PM states the goal and completion criteria

| Item | Agreement v1 |
|---|---|
| Goal | Check a CSV amount total with both valid and invalid input |
| Deliverable | Execution results and a report for each completion criterion |
| Valid input | One column, no header; three lines containing 100, 200, 300 must total 600 yen |
| Invalid input | Three lines containing 100, abc, 300 must identify the error on line 2 and must not finalize a total |
| Out of scope | Login, authentication, a database, and a general import platform |
| Artifact to inspect | The agreed text file containing the verification report |
| Next step | Run both specified inputs and record the results |
| Sharing | Send progress, remaining work, next step, and questions through the existing chat |

Amounts are integer yen. Decimals, quoting, and multiple columns are outside this example. Record a change to the agreement as v2, and do not reuse an old assessment or reply as approval for new conditions.

## 2. The developer and Codex work, correct, and check

| Intermediate result | What it means | Next step |
|---|---|---|
| Only login design is progressing; the CSV has not been run | Work has expanded outside the agreed scope | Return to the CSV checks |
| Valid input totals 600; invalid input has not been checked | One criterion has evidence; the other remains unchecked | Run the invalid input |
| The report includes the total and the line-2 error, with execution evidence | Each criterion can be assessed against the results | Prepare the submission |

Incomplete work is not automatically a scope violation. The developer handles corrections within the agreement. Ask the PM when the goal, completion criteria, or scope needs to change.

## 3. Share the essentials

> Progress: Confirmed 600 yen for valid input.\
> Remaining: Invalid-input check.\
> Next step: Run input with text on line 2 and record the result.\
> Questions for the PM: None at present.

Routine work can continue without waiting for a reply to this update. The PM's acceptance remains separate from Codex's assessment that criteria are met. On interruption, record the next step needed to resume.

## 4. Try the bundled local example

Use macOS or Linux with Node.js 22.13 or later. Run these commands in a new, empty folder. No PM, Codex login, or additional npm packages are needed for this check.

```sh
curl -fLO https://aidhidesupport.github.io/iap/downloads/iap-codex-0.2.5.tar.gz
curl -fLO https://aidhidesupport.github.io/iap/downloads/iap-codex-0.2.5.sha256
shasum -a 256 -c iap-codex-0.2.5.sha256
tar -xzf iap-codex-0.2.5.tar.gz
cd iap-codex-0.2.5
npm test
node checkpoint.mjs observe example
node checkpoint.mjs verify example
node checkpoint.mjs share example
```

Expect `valid: true` and `ready: false` from verification. The fixture deliberately contains unfinished CSV verification and work outside scope. This result means the example is being interpreted as intended, not that the requested work is complete. The generated summary uses Japanese field labels in this release.

These commands check the fixture and generate local records. They do not install hooks into another project or send a message. The checksum detects changed or damaged files; it is not an independent signature.

## 5. Optionally try installation, pausing, and removal

Continue from the extracted `iap-codex-0.2.5` folder. This creates a separate temporary project containing only the fictional artifact. No PM or Codex login is needed to check these local operations.

```sh
iap_trial=$(mktemp -d)
cp example/artifact.txt "$iap_trial/artifact.txt"
node manage.mjs install "$iap_trial" example/.iap/contract.json
node manage.mjs doctor "$iap_trial"
node "$iap_trial/.iap/checkpoint.mjs" pause "$iap_trial"
node "$iap_trial/.iap/checkpoint.mjs" resume "$iap_trial"
```

Installation places `.iap`, `.codex/hooks.json`, `AGENTS.md`, and Git exclusions in the temporary project. Expect `installed: true`, then `configured: true`, then `paused: true` and `paused: false`. `configured` checks local files; `runtimeActivation: "not_verified"` means this has not tested hooks in a running Codex session. Pausing IAP does not stop Codex itself.

Keep any Codex session using this temporary project closed while removing the installation. The first command previews the changes; the second applies them.

```sh
node manage.mjs uninstall "$iap_trial"
node manage.mjs uninstall "$iap_trial" --apply
printf '%s\n' "$iap_trial"
```

Expect `dryRun: true` in the preview and `uninstalled: true` after applying. Removal preserves the contract, records, backups, licenses, and Git exclusions. The last command shows the temporary folder so you can inspect what remains. Delete that disposable folder when you no longer need its fictional records; do not use this as a reason to delete `.codex` or `AGENTS.md` in an existing project.

For use in a real project and hook activation, continue with the [developer guide](CODEX_GUIDE.md) (Japanese). [The PM guide](PM_GUIDE.md) explains receiving summaries and returning decisions. The [trial runbook](PILOT_RUNBOOK.md) keeps each person's time and feedback separate; leave unknown measurements unknown. Successful local checks do not establish that another person can follow the guide or that real collaboration becomes easier.

Documentation is CC BY 4.0; the implementation and bundled materials are Apache-2.0. Donations are not required. See [license scope](LICENSE.md).
