# GitHub Codespaces Setup

This guide moves AILO Marketer from a local laptop folder to GitHub Codespaces so the project can continue from a browser or mobile device.

## 1. Create a GitHub Repository

Create a new repository on GitHub.

Recommended settings:

- Repository name: `ailo-marketer`
- Visibility: Private
- Do not initialize with README
- Do not add a GitHub `.gitignore`
- Do not add a license yet

## 2. Install Git on the Laptop

Check whether Git is available:

```powershell
git --version
```

If it is not available, install Git for Windows:

https://git-scm.com/download/win

After installation, open a new PowerShell window.

## 3. Push This Project to GitHub

Run these commands from the laptop:

```powershell
cd C:\ailo-marketer
git init
git add .
git commit -m "Initial AILO marketer pipeline"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_ID/ailo-marketer.git
git push -u origin main
```

Replace `YOUR_GITHUB_ID` with your GitHub username or organization.

## 4. Open Codespaces

On GitHub:

```text
Repository page
-> Code
-> Codespaces
-> Create codespace on main
```

The Codespace will use `.devcontainer/devcontainer.json` and run:

```bash
node src/check_structure.js
```

## 5. Run the Pipeline in Codespaces

Inside the Codespaces terminal:

```bash
node src/generate_drafts.js --template
node src/approve_draft.js outputs/drafts/driver-worklog-automation.json
node src/publish_dry_run.js outputs/approved/driver-worklog-automation.json
```

## 6. Add OpenAI API Key

For AI-generated Korean marketing drafts, add the API key as a Codespaces secret.

GitHub repository:

```text
Settings
-> Secrets and variables
-> Codespaces
-> New repository secret
```

Secret name:

```text
OPENAI_API_KEY
```

Then rebuild or restart the Codespace and run:

```bash
node src/generate_drafts.js
```

## 7. Mobile Workflow

From a mobile browser:

```text
github.com
-> repository
-> Code
-> Codespaces
-> open existing codespace
```

Mobile is best for:

- reviewing generated content
- checking dry-run publishing plans
- making small edits
- giving direction while the laptop is off

For heavier code edits, use laptop or desktop browser access to Codespaces.

## 8. Cost Control

Codespaces can create costs after the free monthly quota is used.

Recommended settings:

- Use the smallest machine type, usually 2-core.
- Stop the Codespace when work is finished.
- Delete old Codespaces that are no longer needed.
- Keep GitHub spending limit at `0 USD` or a low amount until the workflow is stable.
- Do not enable prebuilds yet.

Useful page:

https://github.com/codespaces

Use that page to see running Codespaces and stop/delete them.

## Recommended Daily Flow

At home:

```text
Work locally on the laptop.
Commit and push changes to GitHub before leaving.
```

Outside:

```text
Open the same repository in Codespaces from mobile.
Review drafts.
Run small pipeline commands.
Commit changes from Codespaces if needed.
```

Back home:

```text
Pull the latest GitHub changes into C:\ailo-marketer.
Continue locally.
```

Local sync command:

```powershell
cd C:\ailo-marketer
git pull
```
