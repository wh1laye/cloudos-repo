# Security Policy

**The Kryonux Project** takes the security of the `kryonk` kernel, the `kpkg` package manager, and core system components seriously. We appreciate responsible disclosure of any vulnerabilities.

## 1. Supported Versions

Because Kryonux is under active development, security patches are only applied to the latest rolling release and the `main` branch:

| Version / Branch | Supported |
| :--- | :--- |
| `main` (Latest) | :white_check_mark: Yes |
| Older snapshots / tags | :x: No |

## 2. Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub Issues, discussions, or pull requests.** Publicly disclosing an unpatched flaw in a kernel or package manager puts users at immediate risk.

Instead, please report vulnerabilities privately using one of the following methods:
1. **GitHub Private Vulnerability Reporting (Preferred):** Go to the **Security** tab of this repository and click **"Report a vulnerability"**.
2. **Email:** Send an encrypted or plain-text report to `wh1laye@gmail.com`.

### What to Include in Your Report
To help us triage and fix the issue quickly, please include:
* A clear description of the vulnerability and its potential impact (e.g., privilege escalation, arbitrary code execution, signature bypass in `kpkg`).
* Affected component (`kryonk`, `kpkg`, build scripts, or specific recipe) and commit hash.
* Step-by-step instructions or a Proof-of-Concept (PoC) to reproduce the issue.

## 3. Disclosure Process

* **Acknowledgment:** We will confirm receipt of your report within **48–72 hours**.
* **Investigation & Fix:** We will work to verify the vulnerability and prepare a patch for the `main` branch.
* **Public Disclosure:** Once a fix is released, we will publish a security advisory and credit you for the discovery (unless you prefer to remain anonymous).

---
*Copyright © 2026 The Kryonux Project. Licensed under GNU GPLv3.*
