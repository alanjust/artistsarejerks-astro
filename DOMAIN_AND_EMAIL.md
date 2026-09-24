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

## DMCA designated agent

Filed September 23, 2026 at dmca.copyright.gov. The $6 Pay.gov payment was submitted; the confirmation email was still pending when this was written.

- **Account:** DMCA registration account signed in through Login.gov as `admin@artistsarejerks.com`. Alan's personal Login.gov account (`alan@alanjust.com`, used for Social Security) is separate. Keep them apart: use a private browser window so the personal login doesn't get picked up automatically.
- **Service provider:** Alan Just d/b/a Alan Just Design, with the alternate names Artists Are Jerks and artistsarejerks.com.
- **Agent email:** `info@artistsarejerks.com`.
- **Renewal:** every three years. The next one is due by September 2029, and a lapse cancels the designation.

The filing protects the site only if the site also posts the same agent info, removes reported work promptly and has a repeat-infringer policy that it enforces. See "Still to do."

## Still to do

1. **DKIM.** In admin.google.com, go to Apps → Google Workspace → Gmail → Authenticate email → Generate new record. Add the `google._domainkey` TXT record in Cloudflare, then Start authentication.
2. **Separate Cloudflare account** for the project, owned by admin@. The Workers, D1 and R2 have to be recreated there rather than moved.
3. **Transfer the registration** from GoDaddy to Cloudflare Registrar—into the project account, not the personal one.
4. **GitHub organization** for the repo.
5. **Transactional mail** currently sends from `applications@aaj-mail.alanjust.com`, a subdomain of Alan's personal domain (see `TEST_SITE_SETUP.md`). Before launch, move it to a subdomain of artistsarejerks.com, such as `mail.artistsarejerks.com`.
6. **At handoff:** change the Workspace recovery email (currently alanjust@gmail.com) and billing card, and remove the account from Alan's devices.
7. **Copyright/DMCA page** on the site: agent contact matching the filing, how takedown notices and counter-notices work, and the repeat-infringer policy. Link it from the footer. Record the registration number here once it arrives.
