# GitHub Configuration

## Repository Details
- **Repository URL**: https://github.com/LanguagesMan/workspace3
- **Branch**: master
- **Remote**: origin

## Configuration Status
✅ Git remote configured with authentication token
✅ Token stored in remote URL for persistent authentication
✅ Credential helper configured globally

## Quick Commands

### Push changes to GitHub
```bash
# Method 1: Using the helper script
./git-push.sh "Your commit message"

# Method 2: Manual
git add .
git commit -m "Your commit message"
git push origin master
```

### Check status
```bash
git status
```

### View remote configuration
```bash
git remote -v
```

### Pull latest changes
```bash
git pull origin master
```

## Global Git Configuration
- **Username**: LanguagesMan
- **Email**: 120611567+LanguagesMan@users.noreply.github.com
- **Token**: Configured in remote URL and credential store

## All Projects Configuration
The GitHub token has been configured globally in:
- `~/.git-credentials` (credential store)
- Git config: `credential.helper=store`

This means all projects in `_projects` directory can use the same authentication.
