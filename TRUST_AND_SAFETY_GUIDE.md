# Trust & Safety Guide

**Last Updated:** October 16, 2025  
**Version:** 1.0.0  
**Status:** Implementation Guide

## Overview

This guide outlines Langflix's Trust & Safety framework, including content moderation policies, user reporting systems, support infrastructure, and community guidelines. Building trust is essential for user retention and regulatory compliance.

## Table of Contents

1. [Content Moderation Policy](#1-content-moderation-policy)
2. [User Reporting System](#2-user-reporting-system)
3. [Support Infrastructure](#3-support-infrastructure)
4. [Help Center & Documentation](#4-help-center--documentation)
5. [Community Guidelines](#5-community-guidelines)
6. [Safety Features](#6-safety-features)
7. [Trust Signals](#7-trust-signals)
8. [Crisis Response](#8-crisis-response)

---

## 1. Content Moderation Policy

### 1.1 Scope

**What Content is Moderated:**

Langflix has two types of content:

1. **Platform Content (Curated by Langflix):**
   - Videos (825+ curated Spanish videos)
   - Articles (scraped from reputable sources)
   - AI-generated content (stories, lessons)
   - Podcasts and music (upcoming)

2. **User-Generated Content (Created by Users):**
   - AI conversation history (text conversations with AI partner)
   - Custom flashcard sets (upcoming feature)
   - User notes on vocabulary
   - Profile information (username, bio)

**Moderation Focus:** User-generated content only. Platform content is pre-screened.

### 1.2 Prohibited Content

Users may **NOT** create or share content that contains:

#### Illegal Content
- Child sexual abuse material (CSAM) - **zero tolerance, reported to NCMEC**
- Content that violates copyright or trademark
- Content promoting illegal activities (drug trafficking, weapons sales, etc.)
- Content violating export control laws

#### Harmful Content
- Credible threats of violence or harm
- Content promoting self-harm or suicide
- Content encouraging eating disorders
- Instructions for dangerous activities

#### Hateful Content
- Hate speech targeting race, ethnicity, religion, gender, sexual orientation, disability
- Content promoting terrorism or violent extremism
- Nazi/white supremacist symbols or ideology

#### Harassment & Abuse
- Targeted harassment of individuals
- Doxxing (sharing private information)
- Sexual harassment or unwanted sexual content
- Impersonation with intent to deceive

#### Spam & Deceptive Practices
- Spam, phishing, or scams
- Misleading or deceptive content
- Artificially inflating engagement metrics
- Malware or malicious links

#### Sexual Content
- Pornography or sexually explicit content
- Sexual content involving minors (any sexualization of children)
- Non-consensual intimate imagery

**Note:** Given Langflix's focus (language learning), explicit content is rare. Most moderation issues will be spam or harassment in AI conversations.

### 1.3 Enforcement Actions

When prohibited content is found, we take the following actions:

| Severity | First Offense | Second Offense | Third Offense |
|----------|---------------|----------------|---------------|
| **Low** (spam, off-topic) | Warning email | 7-day suspension | 30-day suspension |
| **Medium** (harassment, hate speech) | 7-day suspension | 30-day suspension | Permanent ban |
| **High** (CSAM, threats, illegal) | **Immediate permanent ban** | N/A | N/A |

**Additional Actions:**
- Content removal (within 24 hours of report)
- Law enforcement referral (for illegal content)
- Refund denial (if banned for ToS violation)

### 1.4 Moderation Process

**Step 1: Detection**
- User reports (via report button)
- Automated keyword filters (profanity, slurs)
- Manual review by moderation team (sample audits)

**Step 2: Review**
- Trained moderator reviews content and context
- Decision: Approve, Remove, or Escalate
- Context considered (is it educational? Is it art?)

**Step 3: Action**
- Remove content (if prohibited)
- Notify user of violation (with explanation)
- Apply account penalty (if appropriate)
- Document decision (for appeals)

**Step 4: Appeal**
- User can appeal decision within 30 days
- Different moderator reviews appeal
- Decision reversed if error found

**SLA (Service Level Agreement):**
- Report reviewed within: **24 hours**
- Content removed within: **24 hours** (48 hours for complex cases)
- Appeal reviewed within: **7 days**

### 1.5 Moderation Team

**Current Setup (MVP):**
- 1-2 moderators (can be founders initially)
- Manual review of reported content
- Email-based reporting system

**Scaling Plan (10K+ users):**
- Hire dedicated moderation team (1 moderator per 10K users)
- Implement automated content filtering (OpenAI Moderation API)
- Use moderation platform (e.g., Zendesk, Intercom)

**Training:**
- Moderation policy guidelines
- Cultural sensitivity training
- Mental health resources (for moderators reviewing harmful content)
- Legal compliance (GDPR, CCPA, COPPA)

### 1.6 Automated Moderation

**OpenAI Moderation API:**

For AI-generated content and user conversations, use OpenAI's Moderation API to automatically flag harmful content.

```javascript
// File: lib/content-moderation.js
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function moderateContent(text) {
  try {
    const moderation = await openai.moderations.create({
      input: text
    });

    const result = moderation.results[0];
    
    // Check if content is flagged
    if (result.flagged) {
      return {
        allowed: false,
        categories: result.categories,
        categoryScores: result.category_scores,
        reason: getFlaggedCategories(result.categories)
      };
    }

    return { allowed: true };
    
  } catch (error) {
    console.error('Moderation API error:', error);
    // Fail open (allow content if API fails, then manual review)
    return { allowed: true, error: true };
  }
}

function getFlaggedCategories(categories) {
  return Object.keys(categories)
    .filter(key => categories[key])
    .join(', ');
}

module.exports = { moderateContent };
```

**Usage in AI Conversation:**

```javascript
// In api/ai-conversation.js
const { moderateContent } = require('../lib/content-moderation');

router.post('/message', async (req, res) => {
  const { userId, message } = req.body;

  // Moderate user input
  const userModeration = await moderateContent(message);
  if (!userModeration.allowed) {
    return res.status(400).json({
      error: 'Your message contains prohibited content',
      reason: userModeration.reason
    });
  }

  // Generate AI response
  const aiResponse = await generateAIResponse(userId, message);

  // Moderate AI output (sanity check)
  const aiModeration = await moderateContent(aiResponse);
  if (!aiModeration.allowed) {
    console.error('AI generated prohibited content:', aiModeration);
    return res.status(500).json({
      error: 'Unable to generate response. Please try again.'
    });
  }

  res.json({ response: aiResponse });
});
```

**Action Items:**
- ⏳ Implement OpenAI Moderation API
- ⏳ Create moderation queue for manual review
- ⏳ Set up email alerts for high-severity violations
- ⏳ Document moderation decisions for appeals

---

## 2. User Reporting System

### 2.1 Report Button

**Where to Add Report Buttons:**
- AI conversation interface (report inappropriate AI response)
- User profiles (if we add social features)
- Any user-generated content

**Implementation:**

```html
<!-- Report Button UI -->
<button class="report-btn" data-content-id="123" data-content-type="conversation">
  🚩 Report
</button>

<script>
document.querySelectorAll('.report-btn').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const contentId = e.target.dataset.contentId;
    const contentType = e.target.dataset.contentType;
    
    // Show report modal
    showReportModal(contentId, contentType);
  });
});

function showReportModal(contentId, contentType) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Report Content</h2>
      <p>Why are you reporting this?</p>
      <form id="report-form">
        <label>
          <input type="radio" name="reason" value="spam" required>
          Spam or misleading
        </label>
        <label>
          <input type="radio" name="reason" value="harassment">
          Harassment or bullying
        </label>
        <label>
          <input type="radio" name="reason" value="hate_speech">
          Hate speech or discrimination
        </label>
        <label>
          <input type="radio" name="reason" value="violence">
          Violence or threats
        </label>
        <label>
          <input type="radio" name="reason" value="sexual_content">
          Sexual or inappropriate content
        </label>
        <label>
          <input type="radio" name="reason" value="other">
          Other (please explain)
        </label>
        
        <textarea id="report-details" placeholder="Additional details (optional)" rows="3"></textarea>
        
        <div class="modal-actions">
          <button type="submit" class="btn btn-primary">Submit Report</button>
          <button type="button" class="close-modal btn btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Handle form submission
  document.getElementById('report-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const reason = document.querySelector('input[name="reason"]:checked').value;
    const details = document.getElementById('report-details').value;
    
    try {
      const response = await fetch('/api/reports/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          contentId,
          contentType,
          reason,
          details,
          reportedBy: localStorage.getItem('userId')
        })
      });
      
      if (response.ok) {
        alert('✅ Thank you for your report. We will review it within 24 hours.');
        modal.remove();
      } else {
        throw new Error('Report submission failed');
      }
    } catch (error) {
      alert('❌ Failed to submit report. Please try again or contact support@langflix.app.');
    }
  });
  
  // Close modal
  modal.querySelector('.close-modal').addEventListener('click', () => {
    modal.remove();
  });
}
</script>
```

### 2.2 Report Handling API

```javascript
// File: api/reports/submit.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/submit', async (req, res) => {
  try {
    const { contentId, contentType, reason, details, reportedBy } = req.body;
    
    // Validate input
    if (!contentId || !contentType || !reason || !reportedBy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create report in database
    const report = await prisma.contentReport.create({
      data: {
        contentId,
        contentType,
        reason,
        details,
        reportedBy,
        status: 'pending',
        createdAt: new Date()
      }
    });
    
    // Send email alert to moderation team (for high-priority reports)
    if (['violence', 'csam', 'hate_speech'].includes(reason)) {
      await sendModerationAlert(report);
    }
    
    res.json({ 
      success: true,
      reportId: report.id,
      message: 'Report submitted successfully'
    });
    
  } catch (error) {
    console.error('Report submission error:', error);
    res.status(500).json({ error: 'Report submission failed' });
  }
});

async function sendModerationAlert(report) {
  // Email moderation team about high-priority report
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  await sgMail.send({
    to: 'moderation@langflix.app',
    from: 'alerts@langflix.app',
    subject: `⚠️ High-Priority Content Report: ${report.reason}`,
    html: `
      <h2>High-Priority Content Report</h2>
      <p><strong>Report ID:</strong> ${report.id}</p>
      <p><strong>Reason:</strong> ${report.reason}</p>
      <p><strong>Content Type:</strong> ${report.contentType}</p>
      <p><strong>Content ID:</strong> ${report.contentId}</p>
      <p><strong>Details:</strong> ${report.details || 'None provided'}</p>
      <p><strong>Reported By:</strong> ${report.reportedBy}</p>
      <p><strong>Timestamp:</strong> ${report.createdAt}</p>
      <br>
      <a href="https://langflix.app/admin/reports/${report.id}">Review Report</a>
    `
  });
}

module.exports = router;
```

### 2.3 Moderation Dashboard

Create simple admin dashboard to review reports:

```html
<!-- File: public/admin/moderation-queue.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Moderation Queue - Langflix Admin</title>
  <link rel="stylesheet" href="/css/enhanced-styles.css">
</head>
<body>
  <div class="admin-container">
    <h1>Moderation Queue</h1>
    
    <div class="filters">
      <button class="filter-btn active" data-status="pending">Pending</button>
      <button class="filter-btn" data-status="reviewed">Reviewed</button>
      <button class="filter-btn" data-status="all">All</button>
    </div>
    
    <div id="reports-list"></div>
  </div>
  
  <script>
    async function loadReports(status = 'pending') {
      const response = await fetch(`/api/admin/reports?status=${status}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      
      const reports = await response.json();
      
      const container = document.getElementById('reports-list');
      container.innerHTML = reports.map(report => `
        <div class="report-card" data-report-id="${report.id}">
          <div class="report-header">
            <span class="report-id">#${report.id}</span>
            <span class="report-reason ${report.reason}">${report.reason}</span>
            <span class="report-time">${formatTime(report.createdAt)}</span>
          </div>
          <div class="report-content">
            <p><strong>Type:</strong> ${report.contentType}</p>
            <p><strong>Details:</strong> ${report.details || 'None'}</p>
            <div class="reported-content">
              ${report.content}
            </div>
          </div>
          <div class="report-actions">
            <button onclick="takeAction('${report.id}', 'approve')" class="btn btn-success">
              ✅ Approve
            </button>
            <button onclick="takeAction('${report.id}', 'remove')" class="btn btn-danger">
              ❌ Remove Content
            </button>
            <button onclick="takeAction('${report.id}', 'ban')" class="btn btn-danger">
              🚫 Ban User
            </button>
          </div>
        </div>
      `).join('');
    }
    
    async function takeAction(reportId, action) {
      const response = await fetch(`/api/admin/reports/${reportId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      
      if (response.ok) {
        alert('Action taken successfully');
        loadReports();
      } else {
        alert('Action failed');
      }
    }
    
    function formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    }
    
    // Load pending reports on page load
    loadReports('pending');
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        loadReports(e.target.dataset.status);
      });
    });
  </script>
</body>
</html>
```

**Action Items:**
- ⏳ Add report buttons to AI conversation interface
- ⏳ Create `api/reports/submit.js` endpoint
- ⏳ Create admin moderation dashboard
- ⏳ Set up email alerts for high-priority reports
- ⏳ Add ContentReport model to Prisma schema

---

## 3. Support Infrastructure

### 3.1 Support Email Addresses

**Required Email Addresses:**

```
support@langflix.app      - General customer support
privacy@langflix.app      - Privacy and GDPR requests
legal@langflix.app        - Legal inquiries and DMCA notices
moderation@langflix.app   - Content moderation alerts
billing@langflix.app      - Payment and subscription issues
press@langflix.app        - Media inquiries
```

**Setup Instructions:**

1. **Google Workspace (Recommended):**
   - Cost: $6/user/month
   - Professional email addresses
   - Shared inboxes for support@, privacy@, legal@
   - [Sign up: workspace.google.com](https://workspace.google.com)

2. **Email Forwarding (Budget Option):**
   - Forward all addresses to one personal email initially
   - Use email filters to organize by address
   - Upgrade to Google Workspace when revenue > $1K/month

3. **Auto-Responders:**

```plaintext
Subject: We received your message - Langflix Support

Hi there,

Thank you for contacting Langflix support! We've received your message and will respond within 24 hours (business days).

Common questions:
- How to cancel subscription: Settings > Subscription > Cancel
- How to delete account: Settings > Privacy > Delete Account
- Password reset: Login page > Forgot Password

If your issue is urgent, please reply "URGENT" and we'll prioritize your request.

Thanks,
The Langflix Team

---
support@langflix.app
https://langflix.app/help
```

### 3.2 Support Ticket System

**MVP (Free):**
- Use email (Gmail with labels)
- Manual tracking in Google Sheets
- Response time: 24-48 hours

**Growth Phase (Paid):**
- **Zendesk:** Full support platform ($49/agent/month)
- **Intercom:** Live chat + ticketing ($74/month)
- **Freshdesk:** Support ticketing (free up to 10 agents)

**Action Items:**
- ⏳ Set up all email addresses
- ⏳ Create auto-responders
- ⏳ Set up email forwarding
- ⏳ Decide on ticket system (initially email is fine)

### 3.3 Response Time SLAs

| Priority | Response Time | Resolution Time |
|----------|---------------|-----------------|
| **Critical** (payment failed, account locked) | 4 hours | 24 hours |
| **High** (can't log in, feature broken) | 12 hours | 48 hours |
| **Medium** (general questions, feature requests) | 24 hours | 7 days |
| **Low** (feedback, suggestions) | 48 hours | 30 days |

**Action Items:**
- ⏳ Document SLAs in support documentation
- ⏳ Track response times in spreadsheet
- ⏳ Aim for 100% SLA compliance

---

## 4. Help Center & Documentation

### 4.1 Help Center Structure

Create comprehensive help center at `/help` or `help.langflix.app`:

```
Help Center
├── Getting Started
│   ├── How to sign up
│   ├── How to set your level (A1-C2)
│   ├── How to save vocabulary
│   └── How to use AI conversation partner
├── Account & Billing
│   ├── How to upgrade to Premium
│   ├── How to cancel subscription
│   ├── Refund policy (7-day guarantee)
│   ├── How to update payment method
│   └── How to delete account
├── Features
│   ├── Videos: How to watch and learn
│   ├── Articles: Reading with translations
│   ├── AI Conversations: Practice speaking
│   ├── Vocabulary: Spaced repetition system
│   ├── Quizzes & Games: Interactive learning
│   └── Progress Tracking: Monitor your growth
├── Privacy & Security
│   ├── Privacy Policy (summary)
│   ├── How we use your data
│   ├── How to export your data (GDPR)
│   ├── How to manage cookie preferences
│   └── Account security best practices
├── Troubleshooting
│   ├── Videos not loading
│   ├── Audio not playing
│   ├── Can't log in
│   ├── Subtitles not syncing
│   └── AI conversation not responding
└── Contact Us
    ├── support@langflix.app
    ├── Response time: 24 hours
    └── Submit a ticket
```

### 4.2 FAQ (20+ Questions)

**Getting Started:**
1. **What is Langflix?**  
   Langflix is a TikTok-style Spanish learning app with videos, articles, AI conversations, and interactive games.

2. **Do I need to know Spanish to start?**  
   No! We have content for complete beginners (A1) to advanced learners (C2).

3. **How do I sign up?**  
   Click "Sign Up" → Enter email and password → Confirm email → Start learning!

4. **Is there a free trial?**  
   Yes! Free plan includes limited access. Premium has a 7-day money-back guarantee.

5. **What devices can I use?**  
   Langflix works on any device: desktop, tablet, or mobile (iOS/Android browsers).

**Learning:**
6. **How does the AI conversation partner work?**  
   Talk to an AI in Spanish (text or voice). It adapts to your level and uses words you know.

7. **What's spaced repetition?**  
   A scientifically-proven method to review vocabulary at optimal intervals for long-term retention.

8. **How do I track my progress?**  
   Go to Profile → Progress Dashboard to see your streak, XP, and CEFR level.

9. **Can I download content for offline use?**  
   Yes (Premium feature). Tap the download icon on any video or article.

10. **How long until I'm fluent?**  
    Depends on your effort! With daily practice (30 min/day), most users reach B1 in 6-12 months.

**Account & Billing:**
11. **How much does Premium cost?**  
    $9.99/month or $79.99/year (save 33%). Lifetime: $199.

12. **Can I cancel anytime?**  
    Yes! Cancel from Settings → Subscription. You keep access until the end of your billing period.

13. **Do you offer refunds?**  
    Yes! 7-day money-back guarantee for first-time Premium subscribers.

14. **How do I update my payment method?**  
    Settings → Billing → Update Payment Method.

15. **What payment methods do you accept?**  
    Credit card, debit card, PayPal (via Stripe).

**Privacy & Security:**
16. **Is my data safe?**  
    Yes! We use bank-level encryption (TLS 1.3, AES-256) and are GDPR/CCPA compliant.

17. **Do you sell my data?**  
    Never. We don't sell or share your personal data with third parties.

18. **How do I export my data?**  
    Settings → Privacy → Export My Data (GDPR right).

19. **How do I delete my account?**  
    Settings → Account → Delete Account. All data is deleted within 30 days.

20. **Can I disable analytics cookies?**  
    Yes! Settings → Privacy → Cookie Preferences → Disable analytics.

**Troubleshooting:**
21. **Videos not loading?**  
    - Check internet connection  
    - Clear browser cache  
    - Try a different browser  
    - Contact support if issue persists

22. **Audio not playing?**  
    - Check volume settings  
    - Unmute video  
    - Try headphones  
    - Check browser audio permissions

23. **Can't log in?**  
    - Reset password: Login → Forgot Password  
    - Check email for reset link  
    - Check spam folder  
    - Contact support@langflix.app

24. **AI conversation not responding?**  
    - Check internet connection  
    - Refresh page  
    - Try again in a few minutes  
    - Contact support if issue persists

25. **Subtitles not syncing?**  
    - Refresh video  
    - Report issue: Report → "Subtitle issue"  
    - We'll fix within 48 hours

### 4.3 Implementation

**Option 1: Simple HTML Pages (MVP)**
- Create `/public/help/` folder
- One HTML page per article
- No backend required
- Easy to maintain

**Option 2: Help Center Platform (Growth)**
- **Intercom Articles:** $74/month (includes live chat)
- **Zendesk Guide:** $49/agent/month
- **GitBook:** Free for open-source, $6.70/user/month for private

**Action Items:**
- ⏳ Create help center structure (HTML pages)
- ⏳ Write all FAQ articles (20+)
- ⏳ Add search functionality
- ⏳ Link from footer and Settings page

---

## 5. Community Guidelines

### 5.1 Core Values

Langflix is built on these values:

1. **Respect:** Treat everyone with kindness and respect
2. **Inclusivity:** Welcome learners of all backgrounds and levels
3. **Learning First:** Focus on helping each other learn Spanish
4. **Authenticity:** Be yourself, share genuine progress
5. **Safety:** Report harmful content, protect the community

### 5.2 Expected Behavior

**Do:**
- ✅ Be respectful and supportive
- ✅ Share learning tips and resources
- ✅ Encourage others
- ✅ Ask questions
- ✅ Celebrate progress (yours and others')

**Don't:**
- ❌ Harass, bully, or insult others
- ❌ Share offensive or harmful content
- ❌ Spam or advertise
- ❌ Impersonate others
- ❌ Share others' personal information

### 5.3 Consequences

Violating community guidelines may result in:
- Warning (first offense)
- Temporary suspension (repeated offenses)
- Permanent ban (severe violations)

### 5.4 Reporting

See something concerning? Report it:
- Click "Report" button on content
- Email: moderation@langflix.app
- We review all reports within 24 hours

**Action Items:**
- ⏳ Create Community Guidelines page
- ⏳ Link from footer and signup flow
- ⏳ Display guidelines in AI conversation interface

---

## 6. Safety Features

### 6.1 Age Verification

**COPPA Compliance (Children Under 13):**

```html
<!-- Signup form -->
<form id="signup-form">
  <input type="email" name="email" required>
  <input type="password" name="password" required>
  
  <label class="checkbox-label">
    <input type="checkbox" name="age_confirmation" required>
    I confirm that I am at least 13 years old
  </label>
  
  <button type="submit">Sign Up</button>
</form>

<script>
document.getElementById('signup-form').addEventListener('submit', (e) => {
  const ageConfirmation = document.querySelector('input[name="age_confirmation"]').checked;
  
  if (!ageConfirmation) {
    e.preventDefault();
    alert('You must be at least 13 years old to use Langflix.');
  }
});
</script>
```

**Action Items:**
- ⏳ Add age confirmation checkbox to signup
- ⏳ Document COPPA compliance in Privacy Policy
- ⏳ Add date of birth field (optional, for better age verification)

### 6.2 Content Warnings

For mature content (if any):

```html
<div class="content-warning">
  ⚠️ This content contains mature themes. Viewer discretion advised.
  <button onclick="this.parentElement.style.display='none'">I Understand</button>
</div>
```

**Action Items:**
- ⏳ Add content warning system (if needed)
- ⏳ Tag mature content in database
- ⏳ Allow users to hide mature content in Settings

### 6.3 Privacy Controls

**User Privacy Settings:**
- Profile visibility: Public / Private
- Conversation history: Enabled / Disabled
- Analytics: Enabled / Disabled
- Marketing emails: Opt-in / Opt-out

**Action Items:**
- ⏳ Add privacy controls to Settings page
- ⏳ Respect user preferences in code
- ⏳ Make profiles private by default

---

## 7. Trust Signals

### 7.1 Trust Badges

Display trust signals on landing page and footer:

```html
<div class="trust-badges">
  <img src="/images/badges/gdpr-compliant.svg" alt="GDPR Compliant">
  <img src="/images/badges/ssl-secure.svg" alt="SSL Secure">
  <img src="/images/badges/stripe-verified.svg" alt="Stripe Verified">
  <img src="/images/badges/money-back-guarantee.svg" alt="7-Day Money-Back Guarantee">
</div>
```

**Trust Signals:**
- 🔒 SSL Encrypted (TLS 1.3)
- ✅ GDPR Compliant
- ✅ Stripe Secure Payments
- 💰 7-Day Money-Back Guarantee
- 📧 Privacy Policy & Terms
- 🛡️ SOC 2 Certified (via Neon, Supabase)

**Action Items:**
- ⏳ Create trust badge graphics
- ⏳ Add to landing page footer
- ⏳ Link to security documentation

### 7.2 Transparency

**Be transparent about:**
- How data is used (Privacy Policy)
- Third-party services (OpenAI, Stripe, etc.)
- Pricing (no hidden fees)
- Refund policy (clear 7-day guarantee)
- Content sources (cite article sources)

**Action Items:**
- ⏳ Add "About Us" page
- ⏳ Add "How It Works" page
- ⏳ Display content sources/attributions

### 7.3 Social Proof

**Build trust with:**
- User testimonials (ask beta users)
- Number of learners (e.g., "Join 10,000+ Spanish learners")
- Success stories (user progress milestones)
- Press mentions (if any)

**Action Items:**
- ⏳ Collect user testimonials from beta users
- ⏳ Add testimonials section to landing page
- ⏳ Track and display user count

---

## 8. Crisis Response

### 8.1 Crisis Types

**Potential Crises:**
1. Data breach (see Incident Response Plan)
2. Service outage (downtime)
3. Payment system failure
4. Negative press / viral complaint
5. Legal notice (DMCA, cease and desist)
6. User safety incident (harassment, threats)

### 8.2 Crisis Response Team

**Team Members:**
- **Crisis Lead:** CEO/Founder
- **Technical Lead:** CTO/Lead Developer
- **Communications Lead:** Marketing/PR
- **Legal Advisor:** Lawyer (on retainer or external)

### 8.3 Response Playbook

**Step 1: Assess (15 minutes)**
- What happened?
- How severe?
- Who's affected?
- Is it ongoing?

**Step 2: Contain (1 hour)**
- Stop the issue from spreading
- Disable affected feature if necessary
- Secure systems

**Step 3: Communicate (2 hours)**
- Notify affected users via email
- Post status update on website
- Update social media (if applicable)
- Provide timeline for resolution

**Step 4: Resolve (varies)**
- Fix the issue
- Verify fix is working
- Monitor for recurrence

**Step 5: Follow-Up (24 hours)**
- Send resolution email to users
- Conduct post-mortem
- Document learnings
- Implement preventive measures

### 8.4 Communication Templates

**Service Outage:**
```
Subject: Langflix Service Update - We're working on it

Hi there,

We're aware that Langflix is currently experiencing technical difficulties. 
Our team is working to resolve the issue as quickly as possible.

What's affected: [Specific features]
Estimated resolution: [Timeframe]
Updates: We'll email you when service is restored

We apologize for the inconvenience. If you have urgent questions, please 
contact support@langflix.app.

Thanks for your patience,
The Langflix Team
```

**Data Breach (GDPR 72-hour notification):**
```
Subject: Important Security Notice - Langflix Data Incident

Dear Langflix User,

We are writing to inform you of a data security incident that may have 
affected your account.

What happened: [Brief description]
What data was involved: [Specific data types]
What we're doing: [Actions taken]
What you should do: [User actions, e.g., change password]

We take your privacy seriously and are committed to protecting your data. 
We have notified the relevant authorities and are conducting a full 
investigation.

For more information or questions, please contact privacy@langflix.app.

Sincerely,
The Langflix Team

[Full incident details: https://langflix.app/security-incident]
```

**Action Items:**
- ⏳ Create crisis response plan document
- ⏳ Designate crisis response team
- ⏳ Prepare communication templates
- ⏳ Test crisis response annually

---

## Summary

### Implementation Checklist

**Week 1 (Content Moderation):**
- [ ] Define prohibited content policy
- [ ] Implement OpenAI Moderation API
- [ ] Add report buttons to AI conversations
- [ ] Create moderation queue API
- [ ] Set up moderation email alerts

**Week 2 (Support Infrastructure):**
- [ ] Set up support email addresses
- [ ] Create auto-responders
- [ ] Build help center (20+ articles)
- [ ] Write FAQ section
- [ ] Document response time SLAs

**Week 3 (Safety & Trust):**
- [ ] Add age verification to signup
- [ ] Create Community Guidelines page
- [ ] Add privacy controls to Settings
- [ ] Display trust badges on site
- [ ] Prepare crisis response plan

**Ongoing:**
- [ ] Monitor reports daily
- [ ] Respond to support emails within 24 hours
- [ ] Update help articles based on common questions
- [ ] Collect user testimonials
- [ ] Review and improve policies quarterly

### Key Metrics to Track

| Metric | Target | How to Track |
|--------|--------|--------------|
| Report resolution time | <24 hours | Moderation dashboard |
| Support response time | <24 hours | Email tracking |
| User satisfaction (CSAT) | >80% | Post-support survey |
| Help article views | Increasing | Google Analytics |
| Community guideline violations | <1% of users | Moderation logs |

### Resources

**Moderation Tools:**
- OpenAI Moderation API: https://platform.openai.com/docs/guides/moderation
- Content Moderation Best Practices: https://www.eff.org/issues/content-moderation

**Support Platforms:**
- Zendesk: https://www.zendesk.com
- Intercom: https://www.intercom.com
- Freshdesk: https://freshdesk.com

**Community Guidelines Examples:**
- Reddit: https://www.redditinc.com/policies/content-policy
- Discord: https://discord.com/guidelines
- Duolingo: https://www.duolingo.com/guidelines

---

**VERSION:** 1.0.0  
**LAST UPDATED:** October 16, 2025  
**MAINTAINED BY:** Langflix Trust & Safety Team  

---

*Trust is earned through transparency, responsiveness, and consistent action. Build systems that protect users, and they will trust your platform.*

