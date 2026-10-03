# 🛡️ AllerGuard

> A private, offline recipe allergy analyzer and safe ingredient substitution engine powered by Google's open-weight **Gemma 2** and Docker.

Built for the **Hacktoberfest Weekend Challenge: Build for a Friend** on [DEV.to](https://dev.to).

---

## 🌟 Overview

When cooking for a roommate or loved one with severe dietary restrictions or allergies, checking restaurant menus and complex recipe ingredients can be stressful. Hidden allergens (like soy sauce containing wheat/gluten, or pestos containing tree nuts) are easy to overlook.

**AllerGuard** solves this:
- Scans any recipe or ingredient list against a customized personal allergy profile.
- Flags hidden allergens with risk levels.
- Recommends 1-to-1 delicious, safe ingredient swaps.
- Provides cross-contamination and kitchen prep advice.
- **100% Private & Local**: Powered by Google **Gemma 2 (2B)** via Ollama in Docker. Zero medical or dietary data leaves the machine.

---

## 🏗️ Architecture

- **Frontend**: React 18, Vite, Lucide Icons
- **Backend**: FastAPI, Pydantic, HTTPX
- **AI Inference Engine**: Google Gemma 2 (2B) running via Ollama
- **Orchestration**: Docker & Docker Compose

---

## 🚀 Quickstart (100% Docker)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/allerguard.git
cd allerguard
