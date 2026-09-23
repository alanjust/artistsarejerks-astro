# Domain and Email

Set up September 23, 2026. This is the record of who owns what for artistsarejerks.com, and the rule every new service should follow.

## The rule

Artists Are Jerks may be handed to another person or organization someday. Project infrastructure should not belong to Alan's personal accounts (`alan@alanjust.com`, `alanjust@gmail.com`). Register every new service—analytics, Maps, sending providers, anything else—to `admin@artistsarejerks.com`.

## Domain

- **Registrar:** GoDaddy (Alan's personal GoDaddy account).
- **DNS:** Cloudflare, nameservers `jonah.ns.cloudflare.com` and `lara.ns.cloudflare.com`. The zone lives in Alan's personal Cloudflare account, alongside alanjust.com and the Grammar of Things, Hidden Grammar and VLM Lab projects.
- **Website:** not pointed at the domain yet. No A, AAAA or `www` records exist. The dev site still runs on its test hostname. Cloudflare's "Visitors cannot reach…" recommendations are expected until launch.

## Email

- **Provider:** Google Workspace, Business Starter, one paid user.
- **Mailbox:** `admin@artistsarejerks.com`. It owns accounts; it is not the public address.
- **Public address:** `info@artistsarejerks.com`, a free alias on the admin mailbox. Gmail and Apple Mail can send as info@, and replies go out from whichever address received the message.
- **Tested:** receiving, and sending from info@ to Gmail on desktop, iPad and iPhone.

### DNS records for email (in Cloudflare)

| Type | Name | Value |
|---|---|---|
| MX | `@` | `smtp.google.com`, priority 1 |
| TXT | `@` | `google-site-verification=…` (Workspace ownership; keep it) |
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:admin@artistsarejerks.com` |

If a future sending service (Resend, Postmark, Cloudflare Email Service) sends as artistsarejerks.com, its servers must be added to the same SPF record. Don't create a second SPF record—there can only be one.

## Still to do

1. **DKIM.** In admin.google.com, go to Apps → Google Workspace → Gmail → Authenticate email → Generate new record. Add the `google._domainkey` TXT record in Cloudflare, then Start authentication.
2. **Separate Cloudflare account** for the project, owned by admin@. The Workers, D1 and R2 have to be recreated there rather than moved.
3. **Transfer the registration** from GoDaddy to Cloudflare Registrar—into the project account, not the personal one.
4. **GitHub organization** for the repo.
5. **Transactional mail** currently sends from `applications@aaj-mail.alanjust.com`, a subdomain of Alan's personal domain (see `TEST_SITE_SETUP.md`). Before launch, move it to a subdomain of artistsarejerks.com, such as `mail.artistsarejerks.com`.
6. **At handoff:** change the Workspace recovery email (currently alanjust@gmail.com) and billing card, and remove the account from Alan's devices.
