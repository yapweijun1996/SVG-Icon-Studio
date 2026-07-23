# Project Security Scan

- Project: `project_f2a74b23-33c1-4c5c-b43d-e2b5b3108428`
- Findings: 5
- Risk counts: high: 2, low: 1, medium: 2

| Severity | Category | Path | Finding | Recommendation |
| --- | --- | --- | --- | --- |
| high | mixed-content | script.js | HTTP URL can cause mixed-content blocking or insecure transport. | Use HTTPS or bundle the asset locally. |
| high | mixed-content | script.js | HTTP URL can cause mixed-content blocking or insecure transport. | Use HTTPS or bundle the asset locally. |
| low | browser-api | script.js | Clipboard access should be user-initiated and explained. | Review usage and add sanitization, consent, or safer browser APIs as appropriate. |
| medium | browser-api | script.js | Sensitive values should not be stored in localStorage. | Review usage and add sanitization, consent, or safer browser APIs as appropriate. |
| medium | browser-api | script.js | Sensitive values should not be stored in localStorage. | Review usage and add sanitization, consent, or safer browser APIs as appropriate. |
