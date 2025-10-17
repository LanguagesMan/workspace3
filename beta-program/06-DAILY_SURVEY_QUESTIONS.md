# Daily Survey Questions

## Google Form Setup

Create a Google Form with these questions. Set responses to go to a Google Sheet for easy analysis.

**Form Title:** Langflix Beta - Day [X] Check-in

**Form Description:** Thanks for checking in! This takes 2 minutes and helps us improve Langflix.

---

## Survey Questions

### Question 1: Did you use Langflix today?
**Type:** Multiple choice (required)

Options:
- Yes
- No, but I plan to later
- No, didn't have time
- No, experiencing technical issues
- No, other reason

**Logic:** If "Yes" → continue to Q2. If "No" → skip to Q7.

---

### Question 2: How many videos did you watch?
**Type:** Multiple choice (required)

Options:
- 0 (opened the app but didn't watch)
- 1-3 videos
- 4-6 videos
- 7-10 videos
- 11+ videos

---

### Question 3: Did you save any words to your vocabulary?
**Type:** Multiple choice (required)

Options:
- Yes, 1-3 words
- Yes, 4-7 words
- Yes, 8+ words
- No, didn't save any
- Didn't realize I could save words

---

### Question 4: Did you use the AI chat feature?
**Type:** Multiple choice (required)

Options:
- Yes, and it was helpful
- Yes, but it wasn't great
- Tried to, but it didn't work
- No, forgot about it
- No, not interested in that feature

---

### Question 5: What was confusing or frustrating today?
**Type:** Paragraph (optional)

Placeholder: "Be specific! E.g., 'I couldn't figure out how to...' or 'The X button didn't work when I...'"

Helper text: "Nothing is too small to mention. If you got stuck or confused, we want to know!"

---

### Question 6: What did you love or find helpful today?
**Type:** Paragraph (optional)

Placeholder: "What made you smile? What worked well?"

Helper text: "Even small wins count! We want to know what's working."

---

### Question 7: Any bugs or technical issues?
**Type:** Paragraph (optional)

Placeholder: "Describe what happened: what you were doing, what you expected, what actually happened"

Helper text: "Screenshots are helpful! You can email them to beta@langflix.app"

---

### Question 8: On a scale of 1-10, how likely are you to recommend Langflix to a friend?
**Type:** Linear scale (required)

Scale: 1 to 10
- 1 label: "Not at all likely"
- 10 label: "Extremely likely"

---

### Question 9 (Day 7+ only): Are you building a daily habit with Langflix?
**Type:** Multiple choice (required)

Options:
- Yes, I use it every day
- Yes, I use it most days
- Somewhat - I use it a few times a week
- No, I'm struggling to make it a habit
- No, I don't think it's for me

---

### Question 10: Anything else we should know?
**Type:** Paragraph (optional)

Placeholder: "Ideas? Requests? Thoughts?"

---

## Form Settings

- **Collect email addresses:** Yes (to link responses to users)
- **Limit to 1 response per day:** Yes
- **Allow response editing:** Yes (within same day)
- **Confirmation message:** "Thanks! Your feedback helps us improve Langflix. See you tomorrow! 🚀"
- **Send respondent a copy:** Optional (let them choose)

---

## Response Tracking Sheet

Set up a Google Sheet with these columns:

| Timestamp | Email | Day # | Used Today? | Videos Watched | Words Saved | Used AI Chat? | Confusion | Love | Bugs | NPS Score | Building Habit? | Other Notes |
|-----------|-------|-------|-------------|----------------|-------------|---------------|-----------|------|------|-----------|-----------------|-------------|
| | | | | | | | | | | | | |

---

## Analysis Formulas

Add these to a separate "Analysis" tab:

### Daily Metrics
```
Active Users Today: =COUNTIF(D:D,"Yes")
Avg Videos per User: =AVERAGEIF(D:D,"Yes",E:E)
Avg Words Saved: =AVERAGEIF(D:D,"Yes",F:F)
AI Chat Usage: =COUNTIF(G:G,"Yes, and it was helpful")/COUNTIF(D:D,"Yes")
Avg NPS: =AVERAGE(K:K)
```

### NPS Calculation
```
Promoters (9-10): =COUNTIFS(K:K,">=9")
Passives (7-8): =COUNTIFS(K:K,">=7",K:K,"<=8")
Detractors (1-6): =COUNTIFS(K:K,"<=6")

NPS Score: =(Promoters - Detractors) / Total Responses * 100
```

### Trend Analysis
```
Day 1 Avg NPS: =AVERAGE(IF(C:C=1,K:K))
Day 7 Avg NPS: =AVERAGE(IF(C:C=7,K:K))
Day 14 Avg NPS: =AVERAGE(IF(C:C=14,K:K))
```

---

## Daily Checklist for Program Manager

Each day at 9am:

1. **Review yesterday's responses**
   - How many people responded? (Target: 50%+)
   - What's the average NPS?
   - Any concerning bugs mentioned?

2. **Identify critical issues**
   - Read all "Bugs" responses
   - Flag P0 (critical) bugs for immediate fixing
   - Post in Discord #bugs channel

3. **Respond to user feedback**
   - Reply to users who reported bugs
   - Thank users who left detailed feedback
   - Ask follow-up questions if needed

4. **Update dashboard**
   - Track daily metrics (see Report Templates)
   - Note any trends or patterns
   - Share insights with team

5. **Send tonight's survey**
   - Queue up 8pm email with survey link
   - Update day number
   - Personalize if needed (e.g., "Day 7 - one week in!")

---

## Survey Variations

### Day 1 (First Impressions)
Add these bonus questions:

**How easy was it to sign up and get started?**
- Very easy
- Somewhat easy
- Confusing
- Very difficult

**Did you understand how to use the app?**
- Yes, it was intuitive
- Mostly, figured it out
- Somewhat confusing
- Very confusing

---

### Day 7 (One Week Check-in)
Add these bonus questions:

**How does Langflix compare to other language apps you've tried?**
- Much better
- Somewhat better
- About the same
- Not as good
- Much worse

**What's the #1 thing we should improve?**
- (Open text)

---

### Day 14 (Final Day)
Replace with the Final Beta Survey (see separate document)

---

## Tips for High Response Rates

1. **Consistent timing:** Send at exact same time every day (8pm)
2. **Keep it short:** 2 minutes max
3. **Show progress:** "Day 5 of 14" helps people see the end
4. **Acknowledge responses:** Send weekly summary showing you're listening
5. **Incentivize (if needed):** "Fill out 10+ surveys, get extra month free"
6. **Make it mobile-friendly:** Most people will respond on their phone
7. **Personalize:** Use their name in the email
8. **Close the loop:** Share what you fixed based on their feedback

---

## Red Flags to Watch For

If you see these patterns, take immediate action:

🚨 **NPS dropping over time:** Users are losing interest
→ Interview drop-off users immediately

🚨 **Multiple reports of same bug:** Critical issue
→ Escalate to engineering team

🚨 **Low feature usage:** People don't understand it
→ Improve onboarding or remove feature

🚨 **"Confusing" mentions increasing:** UX problems
→ Schedule user testing sessions

🚨 **Response rate dropping:** Survey fatigue or app abandonment
→ Shorten survey or offer incentive
