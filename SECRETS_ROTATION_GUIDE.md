# 🔐 Secrets Rotation Guide

## ⚠️ URGENT: Rotate All Leaked Secrets

The following secrets were committed to git and **MUST be rotated immediately**:

### 1. Supabase Keys (HIGH PRIORITY)

**Leaked in**: `/.env`, `/.env.local`

**Current values** (COMPROMISED):
- URL: `https://uejiwteujraxczrxbqff.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Secret Key: `sb_secret_j_jWMTXk73UJWulQDwWWfw_v0B8lndo`

**Action Required**:
1. Go to [Supabase Dashboard](https://app.supabase.com/project/uejiwteujraxczrxbqff/settings/api)
2. Click "Reset" on both Anon Key and Service Role Key
3. Update Vercel environment variables with new keys
4. Update local `.env` file (NOT committed to git)
5. Restart all running services

### 2. Spotify API (MEDIUM PRIORITY)

**Leaked in**: `/.env`

**Current value** (COMPROMISED):
- Client ID: `bb13449ad50d4c84a7bd3fab33d94da4`

**Action Required**:
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Delete the compromised app or rotate credentials
3. Create new credentials
4. Update Vercel environment variables
5. Update local `.env` file

### 3. News API Keys (LOW PRIORITY - if present)

**Action Required**:
1. Check if `NEWS_API_KEY`, `WORLD_NEWS_API_KEY`, `GUARDIAN_API_KEY` are in committed files
2. If yes, rotate them via respective dashboards
3. Update environment variables

---

## 🛡️ Prevention Checklist

### Immediate Actions (Do Now)

- [ ] Remove `.env` and `.env.local` from git history:
  ```bash
  git filter-branch --force --index-filter \
    "git rm --cached --ignore-unmatch .env .env.local" \
    --prune-empty --tag-name-filter cat -- --all
  
  git push origin --force --all
  ```

- [ ] Add to `.gitignore` (if not already):
  ```
  .env
  .env.*
  !.env.example
  ```

- [ ] Rotate all Supabase keys (see above)

- [ ] Rotate Spotify credentials (see above)

- [ ] Update Vercel environment variables:
  ```bash
  vercel env add SUPABASE_URL
  vercel env add SUPABASE_ANON_KEY
  vercel env add SUPABASE_SECRET_KEY
  vercel env add SPOTIFY_CLIENT_ID
  vercel env add SPOTIFY_CLIENT_SECRET
  ```

### Long-term Security Measures

- [ ] Enable GitHub secret scanning:
  - Go to repo Settings → Security → Code security and analysis
  - Enable "Secret scanning"

- [ ] Add pre-commit hook to prevent secret commits:
  ```bash
  npm install --save-dev husky
  npx husky install
  npx husky add .husky/pre-commit "npx secretlint **/*"
  ```

- [ ] Use Vercel environment variables for all secrets (never hardcode)

- [ ] Implement secret rotation schedule (quarterly)

- [ ] Add Sentry for monitoring unauthorized access attempts

---

## 📋 Rotation Schedule

| Secret | Rotation Frequency | Last Rotated | Next Due |
|--------|-------------------|--------------|----------|
| Supabase Keys | Quarterly | ASAP | 3 months |
| Spotify API | Annually | ASAP | 12 months |
| News API Keys | Annually | ASAP | 12 months |
| Admin Token | Quarterly | ASAP | 3 months |

---

## 🔑 Generating Secure Secrets

### Admin Token
```bash
openssl rand -hex 32
```

### JWT Secret (if needed)
```bash
openssl rand -base64 64
```

### API Key (if self-hosting)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🚨 Incident Response

If secrets are leaked again:

1. **Immediately** rotate the compromised secret
2. Check logs for unauthorized access (Supabase Dashboard → Logs)
3. Notify team via Slack/email
4. Document the incident in `SECURITY_INCIDENTS.md`
5. Review and improve prevention measures

---

## ✅ Verification Checklist

After rotation, verify:

- [ ] App still works locally with new secrets
- [ ] Vercel deployment works with new environment variables
- [ ] No secrets in git history: `git log -S "SUPABASE_SECRET_KEY"`
- [ ] `.env` files are in `.gitignore`
- [ ] GitHub secret scanning is enabled
- [ ] Team is notified of new secrets (via secure channel)

---

## 📚 Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/going-into-prod#security)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)

---

## 🆘 Emergency Contacts

- **Supabase Support**: support@supabase.com
- **Vercel Support**: support@vercel.com
- **Security Team**: [Your team contact]

---

**Last Updated**: 2025-10-11  
**Next Review**: 2026-01-11
