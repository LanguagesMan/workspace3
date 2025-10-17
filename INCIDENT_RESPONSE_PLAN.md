# Incident Response Plan

**Last Updated:** October 16, 2025  
**Version:** 1.0.0  
**Classification:** Internal - Security Sensitive

## Executive Summary

This Incident Response Plan (IRP) outlines the procedures for detecting, responding to, and recovering from security incidents and data breaches at Langflix. Under GDPR, organizations must notify supervisory authorities within **72 hours** of becoming aware of a data breach that poses a risk to individuals' rights and freedoms.

**Purpose:** Minimize impact, protect users, comply with legal requirements  
**Scope:** All security incidents affecting Langflix systems, data, or users  
**Review Frequency:** Annually or after each incident  

---

## Table of Contents

1. [Incident Types](#1-incident-types)
2. [Incident Response Team](#2-incident-response-team)
3. [Incident Severity Levels](#3-incident-severity-levels)
4. [Response Phases](#4-response-phases)
5. [GDPR Data Breach Notification](#5-gdpr-data-breach-notification)
6. [Communication Templates](#6-communication-templates)
7. [Post-Incident Review](#7-post-incident-review)
8. [Appendices](#8-appendices)

---

## 1. Incident Types

### 1.1 Security Incidents

**Data Breach:**
- Unauthorized access to personal data
- Data exfiltration or theft
- Accidental exposure of sensitive data
- Database leak or misconfiguration

**System Compromise:**
- Server hack or unauthorized access
- Malware or ransomware attack
- DDoS (Distributed Denial of Service) attack
- Account takeover (admin or user accounts)

**Insider Threat:**
- Employee misuse of access
- Contractor data theft
- Accidental data deletion by staff

**Third-Party Breach:**
- Vendor security incident (e.g., Supabase, Neon)
- Supply chain attack
- Compromised API keys

### 1.2 Operational Incidents

**Service Outage:**
- Complete service unavailability
- Critical feature failure (e.g., login, AI conversations)
- Database outage
- Payment system failure

**Data Loss:**
- Accidental deletion of user data
- Backup failure
- Database corruption

**Compliance Violation:**
- GDPR violation discovered
- CCPA violation discovered
- Terms of Service breach by Langflix

---

## 2. Incident Response Team

### 2.1 Core Team Members

| Role | Responsibilities | Contact |
|------|------------------|---------|
| **Incident Commander** (CEO/Founder) | Overall incident leadership, final decisions, legal notifications | [Phone], [Email] |
| **Technical Lead** (CTO/Dev Lead) | Technical investigation, containment, remediation | [Phone], [Email] |
| **Security Lead** (if separate) | Forensics, security analysis, vulnerability assessment | [Phone], [Email] |
| **Communications Lead** (Marketing/PR) | User notifications, press releases, status page | [Phone], [Email] |
| **Legal Advisor** (Lawyer) | Legal compliance, regulatory notifications (GDPR), legal risk | [Phone], [Email] |
| **Customer Support Lead** | Handle user inquiries, support tickets, feedback | [Phone], [Email] |

### 2.2 Escalation Path

```
Level 1: Developer on-call (detect and contain)
         ↓ (escalate if severe)
Level 2: Technical Lead (investigate and remediate)
         ↓ (escalate if data breach)
Level 3: Incident Commander + Full IRT (coordinate response)
```

### 2.3 External Contacts

| Contact | Purpose | Contact Info |
|---------|---------|--------------|
| **Hosting Provider** (Vercel, Railway) | Infrastructure support | Support portal |
| **Database Provider** (Neon) | Database recovery | support@neon.tech |
| **Auth Provider** (Supabase) | Authentication issues | support@supabase.com |
| **Legal Counsel** | Legal advice, GDPR compliance | [Law firm contact] |
| **Cybersecurity Consultant** | Forensics, incident analysis | [Consultant contact] |
| **PR Agency** (if large incident) | Crisis communications | [PR firm contact] |
| **Insurance Provider** (Cyber Insurance) | Claims, financial support | [Insurance contact] |

**Action Items:**
- ⏳ Fill in all contact information
- ⏳ Create emergency contact card (laminated, accessible 24/7)
- ⏳ Test contact methods quarterly

---

## 3. Incident Severity Levels

### 3.1 Severity Classification

| Level | Description | Examples | Response Time |
|-------|-------------|----------|---------------|
| **P0 - Critical** | Massive impact, immediate action required | Data breach affecting >1,000 users, complete service outage, payment system compromised | Immediate (minutes) |
| **P1 - High** | Significant impact, urgent action needed | Limited data breach, critical feature down, security vulnerability discovered | <1 hour |
| **P2 - Medium** | Moderate impact, timely response needed | Minor data exposure, non-critical feature down, isolated account compromise | <4 hours |
| **P3 - Low** | Limited impact, standard response | Suspected vulnerability, minor service degradation, false alarm | <24 hours |

### 3.2 GDPR Notification Thresholds

**Must notify authorities (within 72 hours) if:**
- Personal data breach poses risk to users' rights and freedoms
- Breach involves sensitive data (health, race, religion, etc.)
- Breach affects >250 users
- Breach likely to cause significant harm (identity theft, discrimination, financial loss)

**Must notify affected users (without undue delay) if:**
- High risk to users' rights and freedoms
- Measures not taken to mitigate risk (e.g., data was not encrypted)
- Examples: Passwords leaked, payment info exposed, SSNs compromised

**No notification required if:**
- Data was encrypted and keys not compromised
- Measures taken to ensure no risk to users
- Notifying users would be disproportionate effort (then public notice instead)

---

## 4. Response Phases

### Phase 1: Detection & Analysis (0-15 minutes)

**Objective:** Identify and confirm the incident

**Actions:**
1. **Detect Incident**
   - Automated alerts (Sentry, server monitoring)
   - User reports (via support or social media)
   - Security scan findings
   - Unusual activity (logs, analytics)

2. **Initial Assessment**
   - Confirm incident is real (not false positive)
   - Determine type of incident (data breach, outage, etc.)
   - Assess immediate risk
   - Classify severity (P0, P1, P2, P3)

3. **Activate IRT**
   - If P0 or P1: Immediately alert Incident Commander and Technical Lead
   - If P2 or P3: Escalate to Technical Lead, notify Incident Commander
   - Assemble full IRT for P0/P1 incidents

4. **Document Everything**
   - Start incident log (timestamp all actions)
   - Screenshot evidence
   - Preserve logs (don't delete anything)

**Tools:**
- Sentry (error tracking): https://sentry.io
- Server logs: Check `/var/log/` or cloud provider dashboard
- Database logs: Neon dashboard
- Analytics: Mixpanel for unusual patterns

**Checklist:**
- [ ] Incident confirmed and classified
- [ ] Severity level assigned (P0-P3)
- [ ] IRT activated
- [ ] Incident log started
- [ ] Evidence preserved

---

### Phase 2: Containment (15 min - 1 hour)

**Objective:** Stop the breach from spreading

**Actions:**

**For Data Breach:**
1. **Isolate Affected Systems**
   - Disable compromised API keys
   - Revoke compromised access tokens
   - Disable affected user accounts
   - Take affected services offline (if necessary)

2. **Prevent Further Access**
   - Change all admin passwords
   - Enable MFA on all admin accounts (if not already)
   - Review and remove unauthorized access
   - Block malicious IP addresses

3. **Preserve Evidence**
   - Take database snapshot before any changes
   - Save server logs
   - Document attacker activity
   - Don't touch affected systems (forensics)

**For Service Outage:**
1. **Activate Failover**
   - Switch to backup servers
   - Activate CDN caching
   - Enable read-only mode (if possible)

2. **Communicate Status**
   - Update status page: https://status.langflix.app (if exists)
   - Post on social media (Twitter, etc.)
   - Send email to active users (if outage >1 hour)

**For DDoS Attack:**
1. **Enable DDoS Protection**
   - Activate Cloudflare DDoS protection
   - Rate limit API endpoints
   - Block offending IP ranges

**Checklist:**
- [ ] Breach contained (no further unauthorized access)
- [ ] Affected systems isolated or secured
- [ ] Evidence preserved
- [ ] Status communicated to users (if outage)

---

### Phase 3: Eradication (1-4 hours)

**Objective:** Remove the threat and fix vulnerabilities

**Actions:**

1. **Identify Root Cause**
   - How did the attacker get in?
   - What vulnerability was exploited?
   - Was it external or internal?
   - Timeline of attacker activity

2. **Remove Threat**
   - Delete malware or backdoors
   - Remove unauthorized accounts
   - Patch exploited vulnerabilities
   - Update dependencies (if outdated packages)

3. **Fix Vulnerabilities**
   - Apply security patches
   - Update configurations
   - Strengthen access controls
   - Implement additional monitoring

4. **Verify Eradication**
   - Scan for remaining threats
   - Check for other compromised systems
   - Confirm attacker no longer has access

**Tools:**
- **Vulnerability Scanner:** Snyk (https://snyk.io)
- **Malware Scanner:** ClamAV
- **Dependency Checker:** `npm audit`, `yarn audit`

**Checklist:**
- [ ] Root cause identified
- [ ] Threat removed
- [ ] Vulnerabilities patched
- [ ] No remaining attacker access

---

### Phase 4: Recovery (4-24 hours)

**Objective:** Restore normal operations

**Actions:**

1. **Restore Services**
   - Bring systems back online (gradually)
   - Monitor for abnormal activity
   - Test all critical features
   - Verify data integrity

2. **Reset Credentials**
   - Force password reset for all users (if credentials compromised)
   - Rotate all API keys
   - Invalidate all sessions
   - Re-issue new tokens

3. **Restore Data (if needed)**
   - Restore from backups (if data loss)
   - Verify backup integrity
   - Test restored data
   - Communicate data restoration status

4. **Monitor Closely**
   - 24/7 monitoring for 72 hours post-incident
   - Watch for re-infection or new attacks
   - Check logs frequently
   - Be ready to re-contain

**Checklist:**
- [ ] Services restored and stable
- [ ] Credentials reset (if needed)
- [ ] Data restored (if applicable)
- [ ] Enhanced monitoring in place

---

### Phase 5: Notification (Within 72 hours for GDPR)

**Objective:** Comply with legal notification requirements

**Actions:**

1. **Determine Notification Requirements**
   - Does this meet GDPR notification threshold?
   - Does this meet CCPA notification threshold?
   - Is notification legally required in other jurisdictions?

2. **Notify Supervisory Authority (GDPR - 72 hours)**
   - **EU:** Notify relevant Data Protection Authority (DPA)
   - **UK:** Notify ICO (Information Commissioner's Office)
   - Use official notification form
   - Include: Nature of breach, categories of data, number of affected users, consequences, measures taken

   **Find your DPA:** https://edpb.europa.eu/about-edpb/board/members_en

3. **Notify Affected Users (without undue delay)**
   - Send personalized email (if <10,000 users)
   - Post public notice (if >10,000 users or email addresses compromised)
   - Include: What happened, what data was affected, what we're doing, what users should do

4. **Notify Partners/Vendors**
   - Inform third-party processors (if their data also affected)
   - Coordinate messaging
   - Fulfill contractual notification obligations

5. **Public Disclosure (if required)**
   - Post incident report on website: https://langflix.app/security-incident
   - Issue press release (if major incident)
   - Update status page

**Checklist:**
- [ ] Supervisory authority notified (within 72 hours)
- [ ] Affected users notified (without undue delay)
- [ ] Partners/vendors notified
- [ ] Public disclosure made (if required)
- [ ] All notifications documented

---

## 5. GDPR Data Breach Notification

### 5.1 Notification to Supervisory Authority (72 hours)

**Information to Include (GDPR Article 33):**

1. **Nature of the breach**
   - Type of incident (unauthorized access, accidental disclosure, etc.)
   - Date and time of breach
   - Date and time Langflix became aware

2. **Categories and number of data subjects**
   - Number of affected users (approximate if exact unknown)
   - Number of affected data records

3. **Categories of personal data**
   - What data was involved (email, password, IP address, vocabulary, etc.)
   - Was it sensitive data? (health, race, religion - N/A for Langflix)

4. **Likely consequences**
   - Potential impact on users (identity theft, account takeover, etc.)
   - Risk level assessment (low, medium, high)

5. **Measures taken or proposed**
   - Immediate actions (containment, password resets)
   - Long-term measures (security improvements)
   - Actions users should take

6. **Contact point**
   - Name and contact details: privacy@langflix.app

### 5.2 How to Notify

**EU Data Protection Authorities:**

1. **Find your DPA:** https://edpb.europa.eu/about-edpb/board/members_en
2. **Use their online form** (most DPAs have one)
3. **Email if no form:** Most accept email to specific breach notification address
4. **Include all required information** (see above)
5. **Keep confirmation** of submission (screenshot, email receipt)

**Example (Germany):**
- **Authority:** Bundesbeauftragter für den Datenschutz und die Informationsfreiheit (BfDI)
- **Notification portal:** https://www.bfdi.bund.de/meldung

**Example (Ireland - common for US tech companies):**
- **Authority:** Data Protection Commission (DPC)
- **Notification portal:** https://forms.dataprotection.ie/breach

### 5.3 Notification to Affected Users

**When Required:**
- High risk to users' rights and freedoms
- Data not encrypted or other measures not effective

**What to Include (GDPR Article 34):**

1. Nature of the breach (plain language)
2. Contact point (privacy@langflix.app)
3. Likely consequences
4. Measures taken to address the breach
5. Recommended actions for users (change password, monitor accounts)

**Delivery Method:**
- **Email** (if <10,000 users and emails not compromised)
- **Public notice** (if >10,000 users or emails compromised): website, press release, social media

**Timing:**
- **Without undue delay** (as soon as possible after containment)
- Typically within 72 hours of discovery

---

## 6. Communication Templates

### 6.1 Internal Alert (IRT Activation)

**Subject:** 🚨 INCIDENT ALERT - P[X] - [Brief Description]

```
INCIDENT ALERT - P0 - Potential Data Breach

Time Detected: October 16, 2025, 14:35 UTC
Detected By: Sentry alert, confirmed by [Name]
Incident Type: Unauthorized database access
Severity: P0 (Critical)

INITIAL ASSESSMENT:
- Potential unauthorized access to user database
- Approx. 1,500 users may be affected
- Data involved: Email addresses, usernames, hashed passwords
- Access method: Unknown (investigating)

IMMEDIATE ACTIONS TAKEN:
- Database access revoked for compromised API key
- All admin accounts MFA verified
- Evidence preserved (logs, snapshots)

INCIDENT RESPONSE TEAM ACTIVATED:
- Incident Commander: [Name] - [Phone]
- Technical Lead: [Name] - [Phone]
- Security Lead: [Name] - [Phone]
- Legal Advisor: [Name] - [Phone] (on standby)

NEXT STEPS:
1. Full technical investigation (Technical Lead)
2. Assess GDPR notification requirement (Legal Advisor)
3. Prepare user notification (Communications Lead)

WAR ROOM: [Zoom link or Slack channel]
INCIDENT LOG: [Google Doc link]

DO NOT discuss outside IRT until public disclosure approved.
```

### 6.2 User Notification (Data Breach)

**Subject:** Important Security Notice - Action Required

```
Dear [Name],

We are writing to inform you of a data security incident that may have affected your Langflix account.

WHAT HAPPENED:
On October 16, 2025, we discovered unauthorized access to our user database. We immediately took action to secure our systems and are conducting a full investigation.

WHAT INFORMATION WAS INVOLVED:
The unauthorized access may have affected the following information:
- Email address
- Username
- Hashed and salted password (not readable as plain text)

The following information was NOT affected:
- Payment information (stored securely by Stripe, not on our servers)
- Learning data (vocabulary, progress)
- AI conversation history

WHAT WE'RE DOING:
- We have secured the vulnerability and blocked unauthorized access
- We have reset all user sessions (you'll need to log in again)
- We are conducting a full security audit
- We have notified relevant authorities as required by law

WHAT YOU SHOULD DO:
1. **Change your password:** Log in to Langflix and change your password immediately
2. **Use a unique password:** Don't reuse passwords from other sites
3. **Enable two-factor authentication:** We recommend enabling 2FA for added security
4. **Watch for suspicious activity:** Monitor your email and other accounts for unusual activity

We take your privacy and security very seriously, and we sincerely apologize for this incident. We are committed to protecting your information and have implemented additional security measures to prevent future incidents.

For questions or concerns, please contact us:
- Email: privacy@langflix.app
- Phone: [Support number]
- Response time: Within 24 hours

For detailed information about this incident, please visit:
https://langflix.app/security-incident/2025-10-16

Thank you for your understanding and patience.

Sincerely,
[Name]
CEO, Langflix

---
Langflix, Inc.
privacy@langflix.app
https://langflix.app
```

### 6.3 Public Incident Report (Website)

```markdown
# Security Incident Report - October 16, 2025

**Incident ID:** INC-2025-10-16-001  
**Date Detected:** October 16, 2025, 14:35 UTC  
**Status:** Resolved  
**Last Updated:** October 18, 2025, 10:00 UTC  

---

## Summary

On October 16, 2025, Langflix experienced a security incident involving unauthorized access to our user database. We detected the incident within 30 minutes, immediately secured our systems, and notified affected users and relevant authorities.

## What Happened

- **Timeline:**
  - 14:35 UTC: Unauthorized access detected by automated monitoring
  - 14:40 UTC: Access blocked, incident response team activated
  - 15:00 UTC: Root cause identified (compromised API key)
  - 16:00 UTC: Vulnerability patched, systems secured
  - 18:00 UTC: Users notified via email
  - 72 hours: Supervisory authority notified (GDPR requirement)

- **Affected Systems:** User database (PostgreSQL)
- **Attack Vector:** Compromised API key (how it was obtained is under investigation)
- **Data Accessed:** Email addresses, usernames, hashed passwords (approx. 1,500 users)

## What Was NOT Affected

- Payment information (stored by Stripe, not on our servers)
- Learning data (vocabulary, progress, quiz scores)
- AI conversation history
- Plain-text passwords (we store only hashed/salted passwords)

## What We Did

1. **Immediate Response:**
   - Blocked unauthorized access within 5 minutes
   - Revoked compromised API key
   - Reset all user sessions
   - Preserved forensic evidence

2. **Investigation:**
   - Conducted full technical investigation
   - Reviewed all access logs
   - Identified attack vector
   - Confirmed no other systems compromised

3. **Remediation:**
   - Patched vulnerability
   - Implemented additional access controls
   - Enhanced monitoring and alerting
   - Conducted full security audit

4. **Notification:**
   - Notified affected users via email
   - Notified data protection authorities (GDPR)
   - Published this public report

## What Users Should Do

1. **Change your password** (if you haven't already)
2. **Use a unique, strong password** (not reused from other sites)
3. **Enable two-factor authentication** (Settings > Security > 2FA)
4. **Monitor your accounts** for any suspicious activity

## What We're Doing to Prevent Future Incidents

- **Enhanced access controls:** Multi-factor authentication required for all admin access
- **Improved monitoring:** 24/7 automated security monitoring with faster alerts
- **Regular security audits:** Quarterly third-party security assessments
- **API key rotation:** Regular rotation of all API keys
- **Security training:** Enhanced security training for all team members
- **Bug bounty program:** Launching bug bounty program to incentivize responsible disclosure

## Lessons Learned

- **What went well:** Fast detection (30 minutes), quick containment (5 minutes), clear communication
- **What could be improved:** API key management, access logging, incident response automation

## Contact

For questions or concerns about this incident:
- Email: privacy@langflix.app
- Phone: [Support number]

We take your privacy and security seriously, and we are committed to continuous improvement.

---

**Report Version:** 1.0 (Final)  
**Published:** October 18, 2025  
**Next Review:** October 16, 2026  
```

### 6.4 Supervisory Authority Notification (GDPR)

**Subject:** Data Breach Notification - Langflix, Inc.

```
To: [Data Protection Authority]
From: privacy@langflix.app
Date: October 18, 2025
Re: Data Breach Notification (GDPR Article 33)

Dear Sir/Madam,

Pursuant to Article 33 of the General Data Protection Regulation (GDPR), we are writing to notify you of a personal data breach affecting users of the Langflix language learning platform.

1. CONTROLLER INFORMATION
   - Organization: Langflix, Inc.
   - Address: [Company address]
   - Contact: privacy@langflix.app
   - DPO: N/A (not required)

2. NATURE OF THE BREACH
   - Type: Unauthorized access to user database
   - Date of breach: October 16, 2025
   - Date discovered: October 16, 2025, 14:35 UTC
   - Date notification sent: October 18, 2025 (within 72 hours)

3. CATEGORIES AND NUMBER OF DATA SUBJECTS
   - Affected users: Approximately 1,500 EU residents
   - Affected records: Approximately 1,500 user records

4. CATEGORIES OF PERSONAL DATA
   - Email addresses
   - Usernames
   - Hashed and salted passwords (bcrypt, not readable)
   - Account creation dates
   - CEFR learning level (A1-C2)

5. LIKELY CONSEQUENCES
   - Risk level: Medium
   - Potential consequences:
     * Account takeover (if passwords cracked)
     * Phishing emails (using email addresses)
     * Privacy violation (exposure of learning activity)
   - Mitigating factors:
     * Passwords hashed with bcrypt (difficult to crack)
     * No sensitive data (health, race, religion) involved
     * No payment information accessed (stored by Stripe)

6. MEASURES TAKEN
   - Immediate containment: Access blocked within 5 minutes
   - Security remediation: Vulnerability patched, access controls strengthened
   - User notification: All affected users notified via email on October 16, 2025
   - Ongoing monitoring: 24/7 security monitoring enhanced
   - Long-term measures: Quarterly security audits, MFA enforcement

7. CONTACT POINT
   - Name: [Name]
   - Email: privacy@langflix.app
   - Phone: [Phone number]

Attached:
- Technical incident report
- User notification (sample)
- Timeline of events

Please let us know if you require any additional information.

Sincerely,
[Name]
Privacy Contact, Langflix, Inc.
```

---

## 7. Post-Incident Review

### 7.1 Post-Mortem Meeting (Within 7 days)

**Attendees:** Full IRT + any additional stakeholders

**Agenda:**
1. **Timeline Review**
   - Walk through incident timeline
   - Identify key decision points
   - Note response times

2. **What Went Well**
   - Fast detection?
   - Effective containment?
   - Clear communication?
   - Good teamwork?

3. **What Went Wrong**
   - Delayed response?
   - Confusion about roles?
   - Inadequate tools?
   - Communication gaps?

4. **Root Cause Analysis**
   - What was the underlying cause?
   - Why did it happen?
   - Could it have been prevented?
   - Use "5 Whys" method

5. **Action Items**
   - Technical improvements (patch, monitoring, etc.)
   - Process improvements (better runbooks, clearer roles)
   - Training needs (security awareness, incident response)
   - Tool acquisitions (SIEM, EDR, etc.)

6. **Documentation Updates**
   - Update this IRP based on learnings
   - Document new procedures
   - Update contact information

### 7.2 Post-Incident Report Template

```markdown
# Post-Incident Report: [Incident ID]

**Date:** October 18, 2025  
**Incident:** Unauthorized database access  
**Severity:** P0 (Critical)  
**Duration:** 2 hours (detection to full resolution)  

---

## Executive Summary

[2-3 sentence summary of what happened and outcome]

## Timeline

| Time (UTC) | Event |
|------------|-------|
| 14:35 | Unauthorized access detected by Sentry alert |
| 14:40 | IRT activated, access blocked |
| 15:00 | Root cause identified (compromised API key) |
| 16:00 | Vulnerability patched, systems secured |
| 18:00 | User notifications sent |
| 72 hrs | Supervisory authority notified |

## Impact

- **Users Affected:** 1,500 (10% of user base)
- **Data Involved:** Email, username, hashed passwords
- **Service Downtime:** None (containment did not require downtime)
- **Financial Impact:** $5,000 (incident response costs)

## Root Cause

[Detailed explanation of how the incident occurred]

**5 Whys:**
1. Why did the breach occur? → Compromised API key
2. Why was the API key compromised? → Accidentally committed to public GitHub repo
3. Why was it in the repo? → Developer error during debugging
4. Why wasn't it caught? → No pre-commit hook to scan for secrets
5. Why no pre-commit hook? → Not implemented yet

**Root Cause:** Lack of automated secret scanning in development workflow.

## What Went Well

- ✅ Fast detection (30 minutes via Sentry alert)
- ✅ Quick containment (5 minutes)
- ✅ Clear IRT communication (Slack war room)
- ✅ Timely user notification (within 4 hours)
- ✅ GDPR compliance (notified within 72 hours)

## What Went Wrong

- ❌ API key security (no secret scanning)
- ❌ Delayed legal consultation (2 hours to reach lawyer)
- ❌ Insufficient access logging (couldn't immediately identify full scope)
- ❌ No runbook for this scenario (had to improvise)

## Action Items

| Action | Owner | Deadline | Priority |
|--------|-------|----------|----------|
| Implement secret scanning (GitHub + pre-commit) | Tech Lead | Oct 20 | P0 |
| Rotate all API keys | Tech Lead | Oct 19 | P0 |
| Enhance access logging | Dev Team | Oct 25 | P1 |
| Create API key breach runbook | Security Lead | Oct 30 | P1 |
| Establish on-call lawyer | CEO | Oct 31 | P1 |
| Conduct security training for all devs | HR | Nov 15 | P2 |

## Lessons Learned

1. **Prevention is better than response:** Automated secret scanning could have prevented this entirely.
2. **Speed matters:** Fast detection and containment minimized impact.
3. **Communication is critical:** Clear communication with users builds trust.
4. **Documentation helps:** Having this IRP made response smoother.

## Recommendations

- Implement automated secret scanning (GitHub Advanced Security, GitGuardian)
- Enforce MFA for all admin and developer accounts
- Conduct quarterly security training
- Regular security audits (at least annually)
- Consider cyber insurance (covers incident response costs)

---

**Report Status:** Final  
**Approved By:** [Incident Commander]  
**Date:** October 18, 2025  
```

### 7.3 Metrics to Track

| Metric | Target | This Incident | Status |
|--------|--------|---------------|--------|
| Time to detect | <30 minutes | 30 minutes | ✅ Met |
| Time to contain | <1 hour | 5 minutes | ✅ Exceeded |
| Time to notify users | <24 hours | 4 hours | ✅ Met |
| Time to notify authority (GDPR) | <72 hours | 50 hours | ✅ Met |
| Post-mortem completed | <7 days | 2 days | ✅ Met |

---

## 8. Appendices

### Appendix A: Incident Log Template

```markdown
# Incident Log: [Incident ID]

**Date:** October 16, 2025  
**Incident Commander:** [Name]  
**Status:** [Active / Contained / Resolved]  

---

## Timeline of Events

| Timestamp (UTC) | Event | Action Taken | By Whom |
|----------------|-------|--------------|---------|
| 14:35 | Alert: Unusual database activity | Investigated alert | On-call dev |
| 14:37 | Confirmed: Unauthorized access | Activated IRT | On-call dev |
| 14:40 | Revoked compromised API key | Blocked access | Tech Lead |
| 14:45 | Verified: No further unauthorized access | Monitoring | Security Lead |
| ... | ... | ... | ... |

---

## Evidence Collected

- [x] Server logs (saved to /evidence/logs/)
- [x] Database snapshot (taken at 14:50 UTC)
- [x] Network traffic logs
- [ ] Attacker IP addresses (ongoing investigation)

---

## Decisions Made

| Time | Decision | Rationale | Made By |
|------|----------|-----------|---------|
| 14:50 | Do NOT take database offline | Minimal user impact, access already blocked | Incident Commander |
| 15:30 | Force all users to reset passwords | Precautionary, hashes likely secure but better safe | Incident Commander + Legal |

---

## Communications Sent

| Time | Audience | Channel | Message |
|------|----------|---------|---------|
| 18:00 | Affected users (1,500) | Email | Data breach notification |
| 18:30 | All users | In-app banner | "We recently experienced a security incident..." |
| 72 hrs | Data Protection Authority | Email | GDPR Article 33 notification |

---

## Notes

- Passwords are hashed with bcrypt (cost factor 12), unlikely to be cracked
- No payment info on our servers (all via Stripe)
- Attacker IP: [IP address] (investigating origin)
- Likely attack vector: Compromised API key found in public GitHub repo
```

### Appendix B: Contact Card (Emergency)

```
┌─────────────────────────────────────────┐
│   LANGFLIX INCIDENT RESPONSE TEAM       │
├─────────────────────────────────────────┤
│ Incident Commander (CEO)                │
│ Name: [Name]                            │
│ Phone: [Phone]                          │
│ Email: [Email]                          │
├─────────────────────────────────────────┤
│ Technical Lead                          │
│ Name: [Name]                            │
│ Phone: [Phone]                          │
│ Email: [Email]                          │
├─────────────────────────────────────────┤
│ Legal Advisor                           │
│ Firm: [Law firm]                        │
│ Phone: [Phone]                          │
│ Email: [Email]                          │
├─────────────────────────────────────────┤
│ Key Services                            │
│ Neon Support: support@neon.tech         │
│ Supabase Support: support@supabase.com  │
│ Stripe Support: [Stripe dashboard]      │
└─────────────────────────────────────────┘

ESCALATION: If P0/P1, call Incident Commander immediately.
EVIDENCE: Preserve logs, take snapshots, document everything.
COMMUNICATION: Use [Slack channel] for IRT coordination.
```

### Appendix C: Tools & Resources

**Incident Response Tools:**
- **Slack/Discord:** War room for IRT coordination
- **Google Docs:** Live incident log
- **Sentry:** Error tracking and alerting (https://sentry.io)
- **Neon Dashboard:** Database logs and access history
- **GitHub Security:** Secret scanning, Dependabot alerts
- **Have I Been Pwned:** Check if credentials leaked (https://haveibeenpwned.com)

**Forensics Tools:**
- **Wireshark:** Network traffic analysis
- **ClamAV:** Malware scanning
- **Snyk:** Vulnerability scanning (https://snyk.io)

**Legal Resources:**
- **GDPR Full Text:** https://gdpr-info.eu
- **Data Protection Authorities:** https://edpb.europa.eu/about-edpb/board/members_en
- **GDPR Breach Checklist:** https://ico.org.uk/for-organisations/report-a-breach/

**Notification Tools:**
- **SendGrid/Mailgun:** Bulk email notifications
- **Twilio:** SMS notifications (if needed)
- **Status Page:** https://statuspage.io (for service status)

### Appendix D: Annual Incident Response Drill

**Purpose:** Test incident response plan annually

**Scenario:** Simulated data breach

**Participants:** Full IRT

**Duration:** 2 hours

**Steps:**
1. **Setup (15 min):** Prepare simulated breach scenario
2. **Detection (15 min):** IRT detects and confirms "breach"
3. **Response (60 min):** IRT executes full response (containment, investigation, notification)
4. **Debrief (30 min):** Discuss what went well, what to improve

**Outcome:** Updated IRP, improved team readiness

**Schedule:** Conduct annually (recommended: Q1 each year)

---

## Summary

### Key Takeaways

1. **Speed is critical:** Detect, contain, and notify quickly to minimize impact
2. **Documentation matters:** This plan exists for a reason—follow it
3. **Communication builds trust:** Be transparent with users and authorities
4. **GDPR has strict timelines:** 72 hours to notify authority, immediate user notification if high risk
5. **Prevention > Response:** Invest in security to avoid incidents

### Quick Reference

**Incident Severity:**
- P0 (Critical): Immediate response, full IRT
- P1 (High): <1 hour response
- P2 (Medium): <4 hours response
- P3 (Low): <24 hours response

**GDPR Notification:**
- Supervisory authority: 72 hours
- Affected users: Without undue delay (if high risk)

**Communication:**
- Internal: IRT Slack channel
- Users: Email + in-app banner + website
- Authorities: Official notification form

**Post-Incident:**
- Post-mortem meeting within 7 days
- Document lessons learned
- Implement action items
- Update IRP

---

**VERSION:** 1.0.0  
**LAST UPDATED:** October 16, 2025  
**NEXT REVIEW:** October 16, 2026 or after any incident  
**OWNER:** Langflix Security Team  

---

*This plan should be reviewed and updated at least annually, or after any significant incident. All team members with access to user data should be familiar with this plan and their role in incident response.*

