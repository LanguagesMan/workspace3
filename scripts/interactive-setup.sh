#!/bin/bash

# 🚀 LANGFLIX INTERACTIVE SETUP WIZARD
# This script guides you through the external service setup

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear

echo -e "${CYAN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        🚀 LANGFLIX INFRASTRUCTURE SETUP WIZARD 🚀              ║
║                                                                ║
║     Complete external service setup in 4 easy steps           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${BLUE}This wizard will guide you through:${NC}"
echo -e "  1. Neon PostgreSQL setup (30 min)"
echo -e "  2. Supabase Authentication (20 min)"
echo -e "  3. OpenAI API setup (15 min)"
echo -e "  4. Stripe Payments (20 min)"
echo ""
echo -e "${YELLOW}⏰ Total time: 1-2 hours${NC}"
echo ""

read -p "$(echo -e ${GREEN}Ready to start? [y/n]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Setup cancelled. Run this script again when ready.${NC}"
    exit 1
fi

# Function to update .env file
update_env() {
    local key=$1
    local value=$2
    
    if grep -q "^${key}=" .env 2>/dev/null; then
        # Update existing key
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^${key}=.*|${key}=\"${value}\"|" .env
        else
            sed -i "s|^${key}=.*|${key}=\"${value}\"|" .env
        fi
    else
        # Add new key
        echo "${key}=\"${value}\"" >> .env
    fi
}

# ============================================
# STEP 1: NEON POSTGRESQL
# ============================================
clear
echo -e "${CYAN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════╗
║                    STEP 1: NEON POSTGRESQL                     ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}📝 Instructions:${NC}"
echo ""
echo -e "  1. Open: ${CYAN}https://console.neon.tech/${NC}"
echo -e "  2. Create a free account (GitHub login recommended)"
echo -e "  3. Click: ${GREEN}Create a project${NC}"
echo -e "  4. Name: ${GREEN}langflix-mvp${NC}"
echo -e "  5. Region: Choose closest to you"
echo -e "  6. Click: ${GREEN}Create project${NC}"
echo -e "  7. Copy the ${YELLOW}Connection String${NC}"
echo ""
echo -e "${YELLOW}⚠️  The connection string looks like:${NC}"
echo -e "   postgresql://user:pass@host.region.neon.tech/dbname?sslmode=require"
echo ""

read -p "$(echo -e ${GREEN}Press ENTER when you have the connection string ready...${NC})"

echo ""
read -p "$(echo -e ${CYAN}Paste your Neon connection string: ${NC})" DATABASE_URL

if [[ $DATABASE_URL == postgresql://* ]]; then
    update_env "DATABASE_URL" "$DATABASE_URL"
    update_env "DIRECT_DATABASE_URL" "$DATABASE_URL"
    echo -e "${GREEN}✅ Neon PostgreSQL configured!${NC}"
else
    echo -e "${RED}❌ Invalid connection string. Should start with postgresql://${NC}"
    echo -e "${YELLOW}You can update it manually in .env file later.${NC}"
fi

read -p "$(echo -e ${GREEN}Press ENTER to continue...${NC})"

# ============================================
# STEP 2: SUPABASE AUTHENTICATION
# ============================================
clear
echo -e "${CYAN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════╗
║               STEP 2: SUPABASE AUTHENTICATION                  ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}📝 Instructions:${NC}"
echo ""
echo -e "  1. Open: ${CYAN}https://supabase.com/dashboard${NC}"
echo -e "  2. Create account (GitHub login recommended)"
echo -e "  3. Click: ${GREEN}New project${NC}"
echo -e "  4. Name: ${GREEN}langflix-auth${NC}"
echo -e "  5. Set database password (save it!)"
echo -e "  6. Click: ${GREEN}Create new project${NC}"
echo -e "  7. Go to: ${YELLOW}Settings > API${NC}"
echo -e "  8. Copy the following:"
echo -e "     - ${CYAN}Project URL${NC}"
echo -e "     - ${CYAN}anon public key${NC}"
echo -e "     - ${CYAN}service_role secret key${NC}"
echo ""

read -p "$(echo -e ${GREEN}Press ENTER when you're in the Settings > API page...${NC})"

echo ""
read -p "$(echo -e ${CYAN}Paste Project URL: ${NC})" SUPABASE_URL
read -p "$(echo -e ${CYAN}Paste anon public key: ${NC})" SUPABASE_ANON_KEY
read -p "$(echo -e ${CYAN}Paste service_role key: ${NC})" SUPABASE_SERVICE_ROLE_KEY

if [[ $SUPABASE_URL == https://*.supabase.co ]]; then
    update_env "SUPABASE_URL" "$SUPABASE_URL"
    update_env "SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"
    update_env "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY"
    echo -e "${GREEN}✅ Supabase configured!${NC}"
else
    echo -e "${RED}❌ Invalid Supabase URL. Should be https://xxx.supabase.co${NC}"
    echo -e "${YELLOW}You can update it manually in .env file later.${NC}"
fi

read -p "$(echo -e ${GREEN}Press ENTER to continue...${NC})"

# ============================================
# STEP 3: OPENAI API
# ============================================
clear
echo -e "${CYAN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════╗
║                     STEP 3: OPENAI API                         ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}📝 Instructions:${NC}"
echo ""
echo -e "  1. Open: ${CYAN}https://platform.openai.com/api-keys${NC}"
echo -e "  2. Sign in or create account"
echo -e "  3. Click: ${GREEN}+ Create new secret key${NC}"
echo -e "  4. Name: ${GREEN}langflix-mvp${NC}"
echo -e "  5. Click: ${GREEN}Create secret key${NC}"
echo -e "  6. ${YELLOW}IMPORTANT:${NC} Copy the key (you won't see it again!)"
echo ""
echo -e "${RED}💰 CRITICAL: Add at least \$50 credit${NC}"
echo -e "  7. Go to: ${CYAN}https://platform.openai.com/account/billing${NC}"
echo -e "  8. Click: ${GREEN}Add payment method${NC}"
echo -e "  9. Add at least ${YELLOW}\$50${NC} for testing"
echo ""

read -p "$(echo -e ${GREEN}Press ENTER when you have your API key...${NC})"

echo ""
read -p "$(echo -e ${CYAN}Paste your OpenAI API key: ${NC})" OPENAI_API_KEY

if [[ $OPENAI_API_KEY == sk-proj-* ]] || [[ $OPENAI_API_KEY == sk-* ]]; then
    update_env "OPENAI_API_KEY" "$OPENAI_API_KEY"
    echo -e "${GREEN}✅ OpenAI API configured!${NC}"
else
    echo -e "${RED}❌ Invalid API key. Should start with sk-proj- or sk-${NC}"
    echo -e "${YELLOW}You can update it manually in .env file later.${NC}"
fi

read -p "$(echo -e ${GREEN}Press ENTER to continue...${NC})"

# ============================================
# STEP 4: STRIPE PAYMENTS
# ============================================
clear
echo -e "${CYAN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════╗
║                   STEP 4: STRIPE PAYMENTS                      ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}📝 Instructions:${NC}"
echo ""
echo -e "  1. Open: ${CYAN}https://dashboard.stripe.com/${NC}"
echo -e "  2. Create account or sign in"
echo -e "  3. ${YELLOW}Skip activation${NC} (use test mode for now)"
echo -e "  4. Go to: ${CYAN}Developers > API keys${NC}"
echo -e "  5. Copy:"
echo -e "     - ${CYAN}Publishable key${NC} (starts with pk_test_)"
echo -e "     - ${CYAN}Secret key${NC} (starts with sk_test_)"
echo ""
echo -e "${YELLOW}Note: We'll use test keys for development${NC}"
echo ""

read -p "$(echo -e ${GREEN}Press ENTER when you're in Developers > API keys...${NC})"

echo ""
read -p "$(echo -e ${CYAN}Paste Publishable key (pk_test_...): ${NC})" STRIPE_PUBLISHABLE_KEY
read -p "$(echo -e ${CYAN}Paste Secret key (sk_test_...): ${NC})" STRIPE_SECRET_KEY

if [[ $STRIPE_PUBLISHABLE_KEY == pk_test_* ]] && [[ $STRIPE_SECRET_KEY == sk_test_* ]]; then
    update_env "STRIPE_PUBLISHABLE_KEY" "$STRIPE_PUBLISHABLE_KEY"
    update_env "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"
    echo -e "${GREEN}✅ Stripe configured!${NC}"
else
    echo -e "${RED}❌ Invalid Stripe keys. Should start with pk_test_ and sk_test_${NC}"
    echo -e "${YELLOW}You can update them manually in .env file later.${NC}"
fi

read -p "$(echo -e ${GREEN}Press ENTER to continue...${NC})"

# ============================================
# VERIFICATION
# ============================================
clear
echo -e "${CYAN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════╗
║                    VERIFYING SETUP...                          ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${BLUE}Running environment validation...${NC}"
echo ""

npm run setup:check

echo ""
echo -e "${CYAN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════╗
║                   SETUP COMPLETE! 🎉                           ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${GREEN}✅ Infrastructure setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo -e "  1. ${CYAN}Run database migrations:${NC}"
echo -e "     npx prisma db push"
echo ""
echo -e "  2. ${CYAN}Start the server:${NC}"
echo -e "     npm run start:server"
echo ""
echo -e "  3. ${CYAN}Test in browser:${NC}"
echo -e "     open http://localhost:3001"
echo ""
echo -e "  4. ${CYAN}Deploy to production:${NC}"
echo -e "     ./scripts/deploy.sh --production"
echo ""
echo -e "${MAGENTA}📚 For help, see: TROUBLESHOOTING.md${NC}"
echo ""



