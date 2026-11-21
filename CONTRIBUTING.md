# Contributing to Kryonux

Thank you for your interest in contributing to **The Kryonux Project**! We welcome bug reports, architectural discussions, package recipes, and code improvements for the `kryonk` kernel and `kpkg` package manager.

## 1. Licensing & Contributor Agreement

By submitting a Pull Request, patch, or recipe to any official Kryonux repository, you agree that:
* Your contribution is your original work or you have the legal right to submit it.
* Your contribution will be licensed under the **GNU General Public License v3.0 (GPL-3.0)**, matching the main project license.
* Copyright notices and trademark rules of **The Kryonux Project** (as stated in `NOTICE`) must be preserved.

## 2. How You Can Contribute

* **Reporting Bugs:** Open an Issue with a clear description, steps to reproduce, system logs, and your hardware specifications.
* **Kernel (`kryonk`) & Core System:** Focus on stability, minimalism, clean C/assembly/systems code, and hardware compatibility.
* **Package Manager (`kpkg`) & Recipes:** Ensure recipes build cleanly from source without hardcoded paths or proprietary blobs where open alternatives exist.
* **Documentation:** Improvements to guides, installation steps, and man-pages are always appreciated.

## 3. Pull Request Guidelines

1. **Fork & Branch:** Fork the repository and create a descriptive branch from `main` (e.g., `fix/kpkg-dependency-parser` or `feat/kryonk-scheduler`).
2. **Code Style:** Follow the existing formatting, naming conventions, and indentation of the surrounding codebase. Keep commits atomic and focused on a single change.
3. **Commit Messages:** Write clear, concise commit messages in English:
   * `feat: add checksum verification in kpkg`
   * `fix: resolve memory leak in kryonk init`
   * `docs: update build instructions`
4. **Testing:** Verify that your changes compile cleanly and do not break existing system builds before opening a Pull Request.

## 4. Code of Conduct

Be respectful, constructive, and focused on technical merit. Harassment, spam, or bad-faith behavior will not be tolerated.

---
*Copyright © 2026 The Kryonux Project. Licensed under GNU GPLv3.*
