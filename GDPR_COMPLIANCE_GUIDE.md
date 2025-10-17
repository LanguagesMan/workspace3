# GDPR Compliance Implementation Guide

**Last Updated:** October 16, 2025  
**Status:** Implementation Required  
**Priority:** Critical (Required before EU launch)

## Overview

This guide provides step-by-step instructions for implementing GDPR (General Data Protection Regulation) compliance for Langflix. GDPR applies to any business that processes personal data of EU residents, regardless of where the business is located.

**GDPR at a glance:**
- **What:** EU regulation protecting personal data and privacy
- **Who:** Applies to all businesses serving EU residents
- **When:** Enforceable since May 25, 2018
- **Penalties:** Up to €20M or 4% of annual global turnover (whichever is higher)

## Table of Contents

1. [Legal Requirements](#1-legal-requirements)
2. [Data Mapping](#2-data-mapping)
3. [Cookie Consent Banner](#3-cookie-consent-banner)
4. [User Rights Implementation](#4-user-rights-implementation)
5. [Data Processing Agreements](#5-data-processing-agreements)
6. [Privacy by Design](#6-privacy-by-design)
7. [Record of Processing Activities](#7-record-of-processing-activities)
8. [Data Breach Procedures](#8-data-breach-procedures)
9. [Testing & Validation](#9-testing--validation)
10. [Ongoing Compliance](#10-ongoing-compliance)

---

## 1. Legal Requirements

### 1.1 Core GDPR Principles

Langflix must ensure all data processing adheres to these principles:

- **Lawfulness, fairness, transparency:** Clear communication about data use
- **Purpose limitation:** Collect data only for specified purposes
- **Data minimization:** Collect only necessary data
- **Accuracy:** Keep data accurate and up to date
- **Storage limitation:** Retain data only as long as necessary
- **Integrity and confidentiality:** Protect data with appropriate security
- **Accountability:** Demonstrate compliance

### 1.2 Legal Basis for Processing

Document the legal basis for each type of data processing:

| Data Processing | Legal Basis | GDPR Article |
|----------------|-------------|--------------|
| Account creation (email, password) | Contract performance | Art. 6(1)(b) |
| Learning progress tracking | Contract performance | Art. 6(1)(b) |
| Email marketing | Consent | Art. 6(1)(a) |
| Analytics (Mixpanel) | Legitimate interest | Art. 6(1)(f) |
| AI conversation transcripts | Contract performance | Art. 6(1)(b) |
| Payment processing | Contract performance | Art. 6(1)(b) |
| Security monitoring (Sentry) | Legitimate interest | Art. 6(1)(f) |

**Action Items:**
- ✅ Document legal basis in Privacy Policy
- ⏳ Create internal legal basis register
- ⏳ Review and update annually

### 1.3 Data Protection Officer (DPO)

**Required if:**
- Processing large-scale sensitive data
- Systematic monitoring of individuals

**Current Assessment:** Not required (small-scale operation), but recommended for best practices.

**Action Items:**
- ⏳ Designate internal privacy contact: privacy@langflix.app
- ⏳ Consider hiring DPO when processing 100K+ EU users
- ⏳ List privacy contact in Privacy Policy

---

## 2. Data Mapping

### 2.1 Personal Data Inventory

Complete inventory of all personal data collected:

| Data Type | Examples | Purpose | Storage Location | Retention Period |
|-----------|----------|---------|------------------|------------------|
| **Account Data** | Email, username, password | Authentication | Neon PostgreSQL, Supabase | Until account deletion |
| **Profile Data** | CEFR level, native language | Personalization | Neon PostgreSQL | Until account deletion |
| **Learning Data** | Vocabulary, quiz scores, progress | Service delivery | Neon PostgreSQL | Until account deletion |
| **Usage Data** | Pages visited, videos watched | Analytics | Mixpanel | 90 days |
| **AI Conversation Data** | Text conversations, voice transcripts | AI conversation feature | Neon PostgreSQL, OpenAI (temp) | Until account deletion |
| **Payment Data** | Name, email (no card details) | Billing | Stripe (encrypted) | 7 years (tax law) |
| **Technical Data** | IP address, browser, device | Security, analytics | Server logs, Mixpanel | 30 days (logs), 90 days (Mixpanel) |
| **Cookie Data** | Session, preferences | Functionality | User's browser | Varies (see Cookie Policy) |

### 2.2 Data Flow Mapping

Document how data flows through the system:

```
User → Frontend (langflix.app) → Backend (Node.js/Express) → Database (Neon PostgreSQL)
                                                              ↓
                                 Third-party APIs ← ──────────┘
                                 - Supabase (auth)
                                 - OpenAI (AI, TTS, Whisper)
                                 - Stripe (payments)
                                 - Mixpanel (analytics)
                                 - Sentry (errors)
```

**Action Items:**
- ✅ Document in Privacy Policy
- ⏳ Create internal data flow diagram
- ⏳ Update when adding new integrations

### 2.3 Third-Party Data Processors

List all third-party processors and ensure Data Processing Agreements (DPAs):

| Processor | Service | Data Shared | DPA Status | Location |
|-----------|---------|-------------|------------|----------|
| Supabase | Auth, database | Email, user ID, auth tokens | ✅ Standard DPA | US (SOC 2) |
| Neon | PostgreSQL | All user data | ✅ Standard DPA | US (SOC 2) |
| OpenAI | AI, transcription, TTS | Conversations, voice audio | ✅ Standard DPA | US |
| Stripe | Payments | Name, email, payment method | ✅ Standard DPA | US (PCI DSS) |
| Mixpanel | Analytics | Usage data, anonymized ID | ✅ Standard DPA | US |
| Sentry | Error tracking | Error logs, user ID | ✅ Standard DPA | US |
| DeepL | Translation | Text for translation | ✅ Standard DPA | Germany (EU) |
| Google Cloud | Translation, TTS | Text for translation/TTS | ✅ Standard DPA | US/EU |

**Action Items:**
- ⏳ Download and store DPAs from each processor
- ⏳ Verify all use Standard Contractual Clauses (SCCs) for US transfers
- ⏳ Review DPAs annually

---

## 3. Cookie Consent Banner

### 3.1 Requirements

GDPR requires:
- ✅ Banner shown before non-essential cookies are set
- ✅ Clear explanation of cookie purposes
- ✅ Separate consent for each cookie category
- ✅ Easy to withdraw consent
- ✅ "Reject" option as prominent as "Accept"
- ✅ No pre-ticked boxes

### 3.2 Implementation Code

Create file: `public/components/cookie-consent-banner.js`

```javascript
// Cookie Consent Banner - GDPR Compliant
class CookieConsentBanner {
  constructor() {
    this.consentKey = 'cookie_consent';
    this.bannerShown = false;
  }

  // Check if consent already given
  hasConsent() {
    const consent = localStorage.getItem(this.consentKey);
    return consent !== null;
  }

  // Get consent preferences
  getConsent() {
    const consent = localStorage.getItem(this.consentKey);
    if (!consent) return null;
    return JSON.parse(consent);
  }

  // Show banner on page load
  show() {
    if (this.hasConsent() || this.bannerShown) return;

    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-banner';
    banner.innerHTML = `
      <div class="cookie-banner-content">
        <div class="cookie-banner-text">
          <h3>🍪 We use cookies</h3>
          <p>
            We use cookies to improve your experience, analyze site usage, 
            and personalize content. You can choose which cookies to accept.
          </p>
          <a href="/cookie-policy.html" target="_blank">Learn more</a>
        </div>
        <div class="cookie-banner-actions">
          <button id="cookie-accept-all" class="btn btn-primary">
            Accept All
          </button>
          <button id="cookie-reject-non-essential" class="btn btn-secondary">
            Reject Non-Essential
          </button>
          <button id="cookie-customize" class="btn btn-link">
            Customize
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);
    this.bannerShown = true;

    // Attach event listeners
    document.getElementById('cookie-accept-all').addEventListener('click', () => {
      this.saveConsent({
        essential: true,
        functional: true,
        analytics: true,
        performance: true
      });
      this.removeBanner();
      this.loadNonEssentialScripts();
    });

    document.getElementById('cookie-reject-non-essential').addEventListener('click', () => {
      this.saveConsent({
        essential: true,
        functional: false,
        analytics: false,
        performance: false
      });
      this.removeBanner();
    });

    document.getElementById('cookie-customize').addEventListener('click', () => {
      this.showCustomizeModal();
    });
  }

  // Show customization modal
  showCustomizeModal() {
    const consent = this.getConsent() || {
      essential: true,
      functional: false,
      analytics: false,
      performance: false
    };

    const modal = document.createElement('div');
    modal.id = 'cookie-customize-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Cookie Preferences</h2>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="cookie-category">
            <label>
              <input type="checkbox" checked disabled> Essential Cookies
            </label>
            <p class="cookie-description">
              Required for the site to function. Cannot be disabled.
            </p>
          </div>
          <div class="cookie-category">
            <label>
              <input type="checkbox" id="consent-functional" ${consent.functional ? 'checked' : ''}> 
              Functional Cookies
            </label>
            <p class="cookie-description">
              Remember your preferences (language, volume, etc.).
            </p>
          </div>
          <div class="cookie-category">
            <label>
              <input type="checkbox" id="consent-analytics" ${consent.analytics ? 'checked' : ''}> 
              Analytics Cookies
            </label>
            <p class="cookie-description">
              Help us understand how you use the site (Mixpanel, Google Analytics).
            </p>
          </div>
          <div class="cookie-category">
            <label>
              <input type="checkbox" id="consent-performance" ${consent.performance ? 'checked' : ''}> 
              Performance Cookies
            </label>
            <p class="cookie-description">
              Help us detect and fix errors (Sentry).
            </p>
          </div>
        </div>
        <div class="modal-footer">
          <button id="save-cookie-preferences" class="btn btn-primary">
            Save Preferences
          </button>
          <button class="close-modal btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal handlers
    modal.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.remove();
      });
    });

    // Save preferences
    document.getElementById('save-cookie-preferences').addEventListener('click', () => {
      this.saveConsent({
        essential: true,
        functional: document.getElementById('consent-functional').checked,
        analytics: document.getElementById('consent-analytics').checked,
        performance: document.getElementById('consent-performance').checked
      });
      modal.remove();
      this.removeBanner();
      this.loadNonEssentialScripts();
    });
  }

  // Save consent to localStorage
  saveConsent(preferences) {
    const consent = {
      ...preferences,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem(this.consentKey, JSON.stringify(consent));
    
    // Set cookie to remember consent (1 year)
    document.cookie = `cookie_consent=true; max-age=31536000; path=/; SameSite=Strict`;
  }

  // Remove banner
  removeBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) banner.remove();
  }

  // Load non-essential scripts based on consent
  loadNonEssentialScripts() {
    const consent = this.getConsent();
    if (!consent) return;

    // Load analytics if consented
    if (consent.analytics) {
      this.loadMixpanel();
      this.loadGoogleAnalytics();
    }

    // Load performance monitoring if consented
    if (consent.performance) {
      this.loadSentry();
    }
  }

  loadMixpanel() {
    if (window.mixpanel) return; // Already loaded
    // Load Mixpanel script
    const script = document.createElement('script');
    script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
    script.async = true;
    script.onload = () => {
      mixpanel.init('YOUR_MIXPANEL_TOKEN');
    };
    document.head.appendChild(script);
  }

  loadGoogleAnalytics() {
    if (window.gtag) return; // Already loaded
    // Load Google Analytics
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
    script.async = true;
    document.head.appendChild(script);
    
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
  }

  loadSentry() {
    if (window.Sentry) return; // Already loaded
    // Load Sentry
    const script = document.createElement('script');
    script.src = 'https://browser.sentry-cdn.com/7.x.x/bundle.min.js';
    script.async = true;
    script.onload = () => {
      Sentry.init({ dsn: 'YOUR_SENTRY_DSN' });
    };
    document.head.appendChild(script);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const cookieBanner = new CookieConsentBanner();
  cookieBanner.show();
  cookieBanner.loadNonEssentialScripts(); // Load if already consented
});
```

### 3.3 CSS Styling

Add to `public/css/enhanced-styles.css`:

```css
/* Cookie Consent Banner */
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 2px solid #e0e0e0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  padding: 20px;
  z-index: 10000;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.cookie-banner-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.cookie-banner-text h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.cookie-banner-text p {
  margin: 0 0 5px 0;
  color: #666;
  font-size: 14px;
}

.cookie-banner-text a {
  color: #FF6B6B;
  text-decoration: none;
  font-size: 14px;
}

.cookie-banner-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.cookie-banner-actions .btn {
  white-space: nowrap;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  border: none;
}

.cookie-banner-actions .btn-primary {
  background: #FF6B6B;
  color: white;
}

.cookie-banner-actions .btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.cookie-banner-actions .btn-link {
  background: none;
  color: #666;
  text-decoration: underline;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .cookie-banner-content {
    flex-direction: column;
    text-align: center;
  }
  
  .cookie-banner-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .cookie-banner-actions .btn {
    width: 100%;
  }
}

/* Cookie Customize Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.close-modal {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 20px;
}

.cookie-category {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.cookie-category label {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
}

.cookie-category input[type="checkbox"] {
  margin-right: 10px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.cookie-description {
  margin: 10px 0 0 28px;
  color: #666;
  font-size: 14px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
```

### 3.4 Integration

Add to all HTML pages before closing `</body>` tag:

```html
<!-- Cookie Consent Banner (GDPR) -->
<script src="/components/cookie-consent-banner.js"></script>
```

**Action Items:**
- ⏳ Create `public/components/cookie-consent-banner.js`
- ⏳ Add CSS to `public/css/enhanced-styles.css`
- ⏳ Add script tag to all HTML pages
- ⏳ Test on multiple devices and browsers
- ⏳ Verify analytics load only after consent

---

## 4. User Rights Implementation

### 4.1 Right to Access (Data Export)

**Requirement:** Users can request a copy of their personal data in machine-readable format (JSON).

**Implementation:**

1. Create API endpoint: `GET /api/gdpr/export/:userId`

```javascript
// File: api/gdpr/export.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/export/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is requesting their own data
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Gather all user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        words: true,
        articles: true,
        achievements: true,
        progress: true,
        interactions: true,
        assessments: true
      }
    });

    // Get conversation history
    const conversations = await prisma.userInteraction.findMany({
      where: {
        userId: userId,
        type: { in: ['ai_conversation', 'voice_conversation'] }
      }
    });

    // Prepare export data
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        email: user.email,
        username: user.username,
        currentLevel: user.currentLevel,
        streak: user.streak,
        totalXP: user.totalXP,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      vocabulary: user.words.map(w => ({
        word: w.word,
        translation: w.translation,
        level: w.level,
        masteryLevel: w.masteryLevel,
        timesReviewed: w.timesReviewed,
        lastReviewed: w.lastReviewed,
        createdAt: w.createdAt
      })),
      savedArticles: user.articles.map(a => ({
        title: a.title,
        url: a.url,
        savedAt: a.createdAt
      })),
      achievements: user.achievements,
      progress: user.progress,
      conversations: conversations.map(c => ({
        date: c.createdAt,
        content: c.metadata // Contains conversation text
      })),
      assessments: user.assessments
    };

    // Send as downloadable JSON file
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="langflix-data-${userId}-${Date.now()}.json"`);
    res.json(exportData);

    // Log export request (for compliance)
    await prisma.gdprLog.create({
      data: {
        userId: userId,
        action: 'DATA_EXPORT',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

  } catch (error) {
    console.error('Data export error:', error);
    res.status(500).json({ error: 'Data export failed' });
  }
});

module.exports = router;
```

2. Add UI in Settings page:

```html
<!-- In public/settings.html -->
<div class="settings-section">
  <h3>Data Export (GDPR)</h3>
  <p>Download all your personal data in JSON format.</p>
  <button id="export-data-btn" class="btn btn-primary">
    📥 Export My Data
  </button>
</div>

<script>
document.getElementById('export-data-btn').addEventListener('click', async () => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('authToken');
  
  const btn = document.getElementById('export-data-btn');
  btn.disabled = true;
  btn.textContent = 'Preparing export...';
  
  try {
    const response = await fetch(`/api/gdpr/export/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `langflix-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert('✅ Data exported successfully!');
  } catch (error) {
    alert('❌ Export failed. Please try again or contact support.');
  } finally {
    btn.disabled = false;
    btn.textContent = '📥 Export My Data';
  }
});
</script>
```

**Action Items:**
- ⏳ Create `/api/gdpr/export.js`
- ⏳ Add export button to Settings page
- ⏳ Test data export functionality
- ⏳ Verify JSON contains all user data

### 4.2 Right to Erasure (Account Deletion)

**Requirement:** Users can request deletion of their account and all associated data.

**Implementation:**

1. Create API endpoint: `DELETE /api/gdpr/delete-account/:userId`

```javascript
// File: api/gdpr/delete-account.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.delete('/delete-account/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { confirmation } = req.body; // User must type "DELETE" to confirm

    // Verify user is deleting their own account
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Verify confirmation
    if (confirmation !== 'DELETE') {
      return res.status(400).json({ error: 'Invalid confirmation' });
    }

    // Log deletion request (keep for 90 days for audit)
    await prisma.gdprLog.create({
      data: {
        userId: userId,
        action: 'ACCOUNT_DELETION',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        metadata: { email: req.user.email } // Save email for potential recovery
      }
    });

    // Delete all related data (cascade delete)
    await prisma.$transaction([
      prisma.word.deleteMany({ where: { userId } }),
      prisma.savedArticle.deleteMany({ where: { userId } }),
      prisma.achievement.deleteMany({ where: { userId } }),
      prisma.progress.deleteMany({ where: { userId } }),
      prisma.userInteraction.deleteMany({ where: { userId } }),
      prisma.skillAssessment.deleteMany({ where: { userId } }),
      prisma.subscription.deleteMany({ where: { userId } }),
      // Finally, delete user account
      prisma.user.delete({ where: { id: userId } })
    ]);

    // Cancel Stripe subscription (if exists)
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'active' }
    });
    if (subscription) {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    res.json({ 
      message: 'Account deleted successfully',
      deletedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'Account deletion failed' });
  }
});

module.exports = router;
```

2. Add UI in Settings page:

```html
<!-- In public/settings.html -->
<div class="settings-section danger-zone">
  <h3>🚨 Danger Zone</h3>
  <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
  <button id="delete-account-btn" class="btn btn-danger">
    Delete My Account
  </button>
</div>

<script>
document.getElementById('delete-account-btn').addEventListener('click', async () => {
  // Show confirmation modal
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>⚠️ Delete Account</h2>
      <p>This will permanently delete:</p>
      <ul>
        <li>Your account and profile</li>
        <li>All saved vocabulary (${vocabularyCount} words)</li>
        <li>Learning progress and achievements</li>
        <li>AI conversation history</li>
        <li>All personal data</li>
      </ul>
      <p><strong>This action cannot be undone.</strong></p>
      <p>Type <strong>DELETE</strong> to confirm:</p>
      <input type="text" id="delete-confirmation" placeholder="Type DELETE" />
      <div class="modal-actions">
        <button id="confirm-delete" class="btn btn-danger">Delete Account</button>
        <button id="cancel-delete" class="btn btn-secondary">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('cancel-delete').addEventListener('click', () => {
    modal.remove();
  });

  document.getElementById('confirm-delete').addEventListener('click', async () => {
    const confirmation = document.getElementById('delete-confirmation').value;
    
    if (confirmation !== 'DELETE') {
      alert('Please type DELETE to confirm.');
      return;
    }

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(`/api/gdpr/delete-account/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ confirmation })
      });

      if (!response.ok) throw new Error('Deletion failed');

      // Clear local storage
      localStorage.clear();
      
      // Redirect to goodbye page
      window.location.href = '/account-deleted.html';

    } catch (error) {
      alert('❌ Account deletion failed. Please contact support@langflix.app');
    }
  });
});
</script>
```

**Action Items:**
- ⏳ Create `/api/gdpr/delete-account.js`
- ⏳ Add deletion UI to Settings page
- ⏳ Create `public/account-deleted.html` confirmation page
- ⏳ Test account deletion flow
- ⏳ Verify all related data is deleted

### 4.3 Right to Rectification (Edit Data)

**Implementation:** Allow users to edit their personal information.

**Already Implemented:** Settings page allows editing:
- Email address
- Username
- CEFR level
- Interface language

**Action Items:**
- ✅ Already implemented in Settings page
- ⏳ Add ability to edit saved vocabulary translations
- ⏳ Add ability to delete individual conversation history items

### 4.4 Right to Object (Opt-Out)

**Implementation:** Allow users to opt out of:
- Marketing emails
- Analytics tracking
- AI conversation feature

**Action Items:**
- ⏳ Add email preferences to Settings (opt-out checkbox)
- ⏳ Respect cookie consent settings (see Section 3)
- ⏳ Add "Disable AI Conversations" toggle in Settings

---

## 5. Data Processing Agreements (DPAs)

### 5.1 What is a DPA?

A Data Processing Agreement (DPA) is a legal contract between:
- **Data Controller:** Langflix (determines purposes/means of processing)
- **Data Processor:** Third-party service (processes data on Langflix's behalf)

### 5.2 Required Elements

All DPAs must include (GDPR Article 28):
- ✅ Subject matter and duration of processing
- ✅ Nature and purpose of processing
- ✅ Type of personal data and categories of data subjects
- ✅ Obligations and rights of the controller
- ✅ Processor's obligations (security, confidentiality, sub-processors)
- ✅ Deletion/return of data after service termination
- ✅ Assistance with data subject rights
- ✅ Assistance with security breaches
- ✅ Auditing rights

### 5.3 Third-Party DPA Status

| Service | DPA Available | SCCs Included | Action Required |
|---------|---------------|---------------|-----------------|
| Supabase | ✅ Yes | ✅ Yes | Download and store |
| Neon | ✅ Yes | ✅ Yes | Download and store |
| OpenAI | ✅ Yes | ✅ Yes | Download and store |
| Stripe | ✅ Yes | ✅ Yes | Auto-signed (review in dashboard) |
| Mixpanel | ✅ Yes | ✅ Yes | Download and store |
| Sentry | ✅ Yes | ✅ Yes | Download and store |
| DeepL | ✅ Yes | N/A (EU-based) | Download and store |
| Google Cloud | ✅ Yes | ✅ Yes | Download and store |

### 5.4 How to Obtain DPAs

1. **Supabase:** https://supabase.com/dpa
2. **Neon:** https://neon.tech/dpa
3. **OpenAI:** https://openai.com/dpa
4. **Stripe:** Stripe Dashboard > Legal > Data Processing Agreement
5. **Mixpanel:** https://mixpanel.com/legal/dpa
6. **Sentry:** https://sentry.io/legal/dpa
7. **DeepL:** https://www.deepl.com/pro-dpa
8. **Google Cloud:** https://cloud.google.com/terms/data-processing-terms

**Action Items:**
- ⏳ Download all DPAs and store in `/legal/dpa/` folder
- ⏳ Review each DPA for GDPR compliance
- ⏳ Create spreadsheet tracking all DPAs (service, signed date, renewal date)
- ⏳ Review annually and re-sign if terms change

---

## 6. Privacy by Design

### 6.1 Principles

**Privacy by Design** means building privacy into the product from the start:

1. **Proactive not reactive:** Prevent privacy issues before they occur
2. **Privacy as default:** Strongest privacy settings by default
3. **Privacy embedded into design:** Not an add-on
4. **Full functionality:** Positive-sum, not zero-sum (privacy AND functionality)
5. **End-to-end security:** Protect data throughout lifecycle
6. **Visibility and transparency:** Keep it open and clear
7. **Respect for user privacy:** User-centric

### 6.2 Implementation Checklist

| Principle | Implementation | Status |
|-----------|----------------|--------|
| **Data minimization** | Only collect necessary data (no tracking pixels, no unnecessary cookies) | ⏳ Review |
| **Encryption** | All data encrypted in transit (TLS 1.3) and at rest (AES-256) | ✅ Done |
| **Anonymization** | Mixpanel uses anonymized user IDs, not emails | ✅ Done |
| **Access controls** | Role-based access control (RBAC) for admin | ⏳ Implement |
| **Default privacy** | Analytics opt-in by default (not opt-out) | ⏳ Fix |
| **Secure delete** | Permanent deletion (not soft delete) | ⏳ Verify |
| **Audit logging** | Log all GDPR-related actions (export, delete) | ⏳ Implement |
| **Data retention** | Auto-delete inactive accounts after 2 years | ⏳ Implement |

**Action Items:**
- ⏳ Conduct privacy impact assessment (PIA)
- ⏳ Implement audit logging for all GDPR actions
- ⏳ Set up auto-deletion script for inactive accounts
- ⏳ Review third-party integrations for privacy risks

---

## 7. Record of Processing Activities (ROPA)

### 7.1 What is ROPA?

Under GDPR Article 30, companies must maintain a Record of Processing Activities (ROPA) documenting:
- What personal data is processed
- Why it's processed
- Who has access to it
- How long it's retained
- What security measures protect it

### 7.2 Langflix ROPA Template

Create file: `/legal/ROPA.md`

```markdown
# Record of Processing Activities (ROPA)
Last Updated: October 16, 2025

## Processing Activity 1: User Account Management

**Purpose:** Create and manage user accounts for language learning service  
**Legal Basis:** Contract performance (GDPR Art. 6(1)(b))  
**Data Categories:**
- Identity data (email, username)
- Authentication data (hashed password)
- Profile data (CEFR level, native language)

**Data Subjects:** Langflix users (13+ years old)  
**Recipients:** Supabase (auth), Neon (database)  
**International Transfers:** US (Standard Contractual Clauses)  
**Retention Period:** Until account deletion or 2 years of inactivity  
**Security Measures:** Encryption (TLS 1.3, AES-256), access controls, MFA for admins  

---

## Processing Activity 2: Learning Progress Tracking

**Purpose:** Track user's learning progress and vocabulary  
**Legal Basis:** Contract performance (GDPR Art. 6(1)(b))  
**Data Categories:**
- Vocabulary (saved words, mastery levels)
- Quiz scores and game performance
- Video watch history
- Article reading history

**Data Subjects:** Langflix users  
**Recipients:** Neon (database)  
**International Transfers:** US (Standard Contractual Clauses)  
**Retention Period:** Until account deletion  
**Security Measures:** Encryption, access controls, regular backups  

---

## Processing Activity 3: AI Conversation Partner

**Purpose:** Provide AI-powered conversation practice  
**Legal Basis:** Contract performance (GDPR Art. 6(1)(b))  
**Data Categories:**
- Conversation text (user messages, AI responses)
- Voice recordings (temporarily, then transcribed and deleted)
- Vocabulary usage analytics

**Data Subjects:** Langflix users  
**Recipients:** OpenAI (processing), Neon (storage)  
**International Transfers:** US (Standard Contractual Clauses)  
**Retention Period:** Until user deletes or account deletion  
**Security Measures:** Encryption, OpenAI DPA, data deletion after transcription  

---

## Processing Activity 4: Payment Processing

**Purpose:** Process subscription payments  
**Legal Basis:** Contract performance (GDPR Art. 6(1)(b))  
**Data Categories:**
- Payment information (name, email, payment method)
- Billing address
- Transaction history

**Data Subjects:** Premium subscribers  
**Recipients:** Stripe (payment processor)  
**International Transfers:** US (Standard Contractual Clauses, PCI DSS certified)  
**Retention Period:** 7 years (tax law requirement)  
**Security Measures:** PCI DSS compliance, tokenization, encryption  

---

## Processing Activity 5: Analytics

**Purpose:** Understand user behavior to improve product  
**Legal Basis:** Legitimate interest (GDPR Art. 6(1)(f))  
**Data Categories:**
- Usage data (pages visited, features used)
- Device data (browser, OS, device type)
- Engagement metrics (time spent, completion rates)

**Data Subjects:** Langflix users (consented to analytics cookies)  
**Recipients:** Mixpanel (analytics platform)  
**International Transfers:** US (Standard Contractual Clauses)  
**Retention Period:** 90 days  
**Security Measures:** Anonymized user IDs, encryption, opt-out available  

---

## Processing Activity 6: Error Monitoring

**Purpose:** Detect and fix technical errors  
**Legal Basis:** Legitimate interest (GDPR Art. 6(1)(f))  
**Data Categories:**
- Error logs (stack traces, error messages)
- User ID (when error occurs)
- Device data (browser, OS)

**Data Subjects:** Langflix users (consented to performance cookies)  
**Recipients:** Sentry (error tracking)  
**International Transfers:** US (Standard Contractual Clauses)  
**Retention Period:** 30 days  
**Security Measures:** Encryption, PII redaction, opt-out available  

---

## Processing Activity 7: Marketing Communications

**Purpose:** Send product updates and promotional emails  
**Legal Basis:** Consent (GDPR Art. 6(1)(a))  
**Data Categories:**
- Email address
- Name (if provided)
- Email engagement (opens, clicks)

**Data Subjects:** Users who opted in to marketing emails  
**Recipients:** Email service provider (TBD)  
**International Transfers:** TBD  
**Retention Period:** Until user opts out  
**Security Measures:** Unsubscribe link in every email, consent tracking  
```

**Action Items:**
- ⏳ Create `/legal/ROPA.md` with all processing activities
- ⏳ Review and update ROPA quarterly
- ⏳ Train team on ROPA requirements
- ⏳ Make ROPA available to supervisory authorities upon request

---

## 8. Data Breach Procedures

### 8.1 GDPR Breach Notification Requirements

**Timeline:**
- **72 hours:** Notify supervisory authority (if high risk to users)
- **Without undue delay:** Notify affected users (if high risk)

**Required Information:**
- Nature of the breach
- Categories and approximate number of affected users
- Likely consequences
- Measures taken to address the breach
- Contact point for more information

### 8.2 Incident Response Plan

See separate document: [INCIDENT_RESPONSE_PLAN.md](./INCIDENT_RESPONSE_PLAN.md)

**Action Items:**
- ⏳ Create incident response plan (see Section below)
- ⏳ Designate incident response team
- ⏳ Set up breach notification templates
- ⏳ Test incident response annually

---

## 9. Testing & Validation

### 9.1 GDPR Compliance Checklist

Test the following before EU launch:

**Legal Documents:**
- [ ] Privacy Policy published and linked in footer
- [ ] Terms of Service published and linked in footer
- [ ] Cookie Policy published and linked in footer
- [ ] All documents mention GDPR compliance

**Cookie Consent:**
- [ ] Banner shown before non-essential cookies load
- [ ] "Reject" button as prominent as "Accept"
- [ ] Customize option allows granular control
- [ ] Preferences saved and respected
- [ ] Analytics load only after consent

**User Rights:**
- [ ] Data export works and includes all user data
- [ ] Account deletion works and deletes all data
- [ ] Users can edit their personal information
- [ ] Users can opt out of marketing emails
- [ ] Response to requests within 30 days

**Data Protection:**
- [ ] All data encrypted in transit (TLS 1.3)
- [ ] All data encrypted at rest (AES-256)
- [ ] DPAs signed with all processors
- [ ] Regular security audits conducted
- [ ] Incident response plan in place

**Transparency:**
- [ ] Clear communication about data use
- [ ] Third-party processors disclosed
- [ ] Retention periods specified
- [ ] Contact information provided

### 9.2 User Testing

**Test Scenarios:**

1. **New User Flow:**
   - Sign up → Accept cookies → Use service → Export data → Delete account
   - Verify: All steps work smoothly

2. **Cookie Banner:**
   - Visit site → See banner → Reject non-essential → Verify analytics don't load
   - Visit site → See banner → Customize → Select only functional → Verify preferences saved

3. **Data Export:**
   - Log in → Settings → Export data → Verify JSON contains all data

4. **Account Deletion:**
   - Log in → Settings → Delete account → Type "DELETE" → Verify account deleted
   - Try to log in again → Verify account doesn't exist

**Action Items:**
- ⏳ Conduct user testing with 10+ testers
- ⏳ Fix any issues discovered
- ⏳ Document test results

---

## 10. Ongoing Compliance

### 10.1 Regular Audits

**Quarterly (Every 3 Months):**
- Review ROPA for accuracy
- Check all DPAs are up to date
- Audit cookie consent rates
- Review data retention policies

**Annually (Every 12 Months):**
- Full GDPR compliance audit
- Security penetration testing
- Privacy impact assessment (PIA)
- Update all legal documents
- Re-train team on GDPR requirements

### 10.2 Monitoring Metrics

Track these metrics:

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Cookie consent rate | >90% accept | TBD | ⏳ Track |
| Data export requests | <1% of users | TBD | ⏳ Track |
| Account deletions | <5% of users | TBD | ⏳ Track |
| Response time to requests | <30 days | TBD | ⏳ Track |
| Data breach incidents | 0 | 0 | ✅ Good |

### 10.3 Team Training

**Who Needs Training:**
- All employees with access to user data
- Customer support team
- Development team
- Management

**Training Topics:**
- GDPR basics and requirements
- User rights and how to respond
- Data breach procedures
- Privacy by design principles
- Incident response plan

**Action Items:**
- ⏳ Create GDPR training materials
- ⏳ Conduct training sessions (annually)
- ⏳ Document training completion

---

## Summary

### Critical Action Items (Before EU Launch)

**High Priority (Week 1):**
1. ✅ Publish Privacy Policy, Terms, Cookie Policy
2. ⏳ Implement cookie consent banner
3. ⏳ Implement data export API
4. ⏳ Implement account deletion API
5. ⏳ Download all DPAs

**Medium Priority (Week 2):**
6. ⏳ Create ROPA document
7. ⏳ Set up GDPR audit logging
8. ⏳ Test all user rights features
9. ⏳ Create incident response plan
10. ⏳ Conduct user testing

**Low Priority (Ongoing):**
11. ⏳ Set up regular audits
12. ⏳ Train team on GDPR
13. ⏳ Monitor compliance metrics
14. ⏳ Review and update annually

### Resources

**Official GDPR Resources:**
- **Full GDPR Text:** https://gdpr-info.eu/
- **ICO Guide (UK):** https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/
- **EDPB Guidelines:** https://edpb.europa.eu/our-work-tools/general-guidance/gdpr-guidelines-recommendations-best-practices_en

**GDPR Compliance Tools:**
- **Cookiebot:** Cookie consent management
- **OneTrust:** Privacy management platform
- **TrustArc:** Privacy compliance software

**Legal Assistance:**
- Consider hiring GDPR lawyer for review (cost: $2,000-$5,000)
- Use legal templates: https://gdpr.eu/privacy-notice/

---

**VERSION:** 1.0.0  
**STATUS:** Draft - Implementation Required  
**NEXT REVIEW:** October 16, 2026  

---

*This guide is for informational purposes only and does not constitute legal advice. Consult with a qualified attorney for specific GDPR compliance questions.*

