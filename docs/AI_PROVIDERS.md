# AI providers (BYOK & deployment)

**Kurz (DE):** KI läuft über `services/ai/` mit Standardadapter Gemini. Schlüssel nur via `.env`; öffentliches Hosting braucht Proxy/BFF — siehe Abschnitt *Security model*.

Wiki Compiler uses a small **provider abstraction** under `services/ai/`. The app never instantiates raw vendor SDKs outside the active adapter.

## Modes (build-time)

| `AI_PROVIDER` | Behaviour |
|----------------|-----------|
| *(empty)* or `gemini` | Use Google Gemini; key from `GEMINI_API_KEY` (injected as `process.env.API_KEY` via Vite). |
| `none` | No client-side AI. Insights and edit actions stay disabled until you change env and rebuild. |

Configure in `.env` (see `.env.example`). Restart dev server after changes.

## Security model

1. **Local / personal:** `.env` + Gemini is acceptable if you trust the machine and do not ship the same bundle to the public internet with the key baked in.
2. **Public hosting:** do **not** embed production API keys in static SPA bundles. Use a **backend-for-frontend (BFF)** or serverless proxy that holds the secret and forwards sanitized requests.
3. **Bring-your-own-key (BYOK):** users supplying keys in the browser remains weaker than a proxy (keys can still be extracted from devtools). Prefer proxy + auth for multi-user products.

## Code map

| Path | Role |
|------|------|
| `services/ai/types.ts` | `AiProvider` interface |
| `services/ai/factory.ts` | `createAiProvider()` — selects adapter from `AI_PROVIDER` |
| `services/ai/geminiProvider.ts` | Google Gemini (`@google/genai`) |
| `services/ai/disabledProvider.ts` | No-op when `AI_PROVIDER=none` |
| `services/ai/mapAiError.ts` | User-safe error messages |
| `services/geminiService.ts` | Facade re-exporting `getArticleInsights`, `editTextWithAi`, `isAiConfigured` |

## Adding another provider

1. Implement `AiProvider` in `services/ai/types.ts`.
2. Add a class under `services/ai/` (e.g. `OpenAiCompatibleProvider`).
3. Extend `createAiProvider()` in `services/ai/factory.ts` and document new `AI_PROVIDER` values here.
