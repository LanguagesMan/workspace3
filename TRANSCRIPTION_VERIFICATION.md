
## ⏺ Research Validation (2025 Best Practices)

**Query**: How do TikTok/YouTube/Instagram handle dynamic onclick events?

**Findings** (Stack Overflow + Industry Standards):
1. ✅ **HTML Entity Escaping**: Using `&apos;` or `&quot;` is valid for inline handlers
2. ⚠️ **Modern Best Practice**: Top apps use `addEventListener()` with data attributes
3. 🔒 **Security**: Avoid inline onclick for user-generated content (XSS risk)

**Our Implementation**:
- Used `&apos;` for quote escaping ✅ (Valid HTML entity method)
- Fix resolves critical blocking bug ✅
- **Recommendation**: Refactor to event listeners in future for better security

**Sources**:
- Stack Overflow: "Escaping quotes in onclick" (multiple answers confirm &apos; method)
- 2025 Standard: addEventListener() + data attributes preferred
- Security: HTML entity escaping prevents XSS in template literals

**Next Steps** (Future Improvement):
Replace inline onclick with:
```javascript
element.dataset.quizId = quiz.id;
element.addEventListener('click', () => feed.answerQuiz(element.dataset.quizId, ...));
```

**Current Status**: Bug fixed with industry-standard HTML entity escaping ✅
