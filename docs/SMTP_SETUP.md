# 📧 SMTP Setup Guide for TeamOps - Mailgun Configuration

This guide will help you configure **Mailgun SMTP** for your TeamOps application to enable team invitations, notifications, and other email functionality.

## 🎯 Overview

TeamOps uses **Nodemailer** with **Mailgun SMTP** configuration for reliable email delivery. The system supports:

- ✅ Team invitation emails with enhanced templates
- ✅ Task notifications
- ✅ System notifications
- ✅ Email tracking and analytics via Mailgun
- ✅ Professional email templates

## ✨ What's Configured

Your TeamOps project now has **Mailgun SMTP** pre-configured with:

- **Enhanced email templates** with professional styling
- **Email tracking** (opens, clicks, deliveries)
- **Mailgun-specific headers** for better analytics
- **Error handling** and logging
- **Development/production** environment support

## 🛠️ Mailgun Setup Steps

### Step 1: Create Mailgun Account

1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Verify your email address
3. Choose a plan (free tier includes 5,000 emails/month for 3 months)

### Step 2: Set Up Your Domain

1. **Add your domain** in Mailgun dashboard
2. **Configure DNS records** (Mailgun will provide these):
   ```
   TXT record: v=spf1 include:mailgun.org ~all
   TXT record: k=rsa; p=your-dkim-key...
   CNAME record: email.your-domain.com -> mailgun.org
   ```
3. **Verify domain** - wait for DNS propagation (can take up to 48 hours)

### Step 3: Get SMTP Credentials

1. Go to **Sending** → **Domain settings** → **SMTP credentials**
2. **Create SMTP credentials** or use default `postmaster` account
3. **Copy your credentials**:
   - Username: `postmaster@your-domain.mailgun.org`
   - Password: Your generated SMTP password

### Step 4: Configure Environment Variables

Add these to your **Render** environment variables:

```bash
# Mailgun SMTP Configuration (already set in render.yaml)
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-smtp-password
SMTP_FROM_EMAIL=no-reply@your-domain.com
SMTP_FROM_NAME=TeamOps

# Frontend URL
FRONTEND_URL=https://teamops-web.onrender.com
```

## ⚙️ Render Dashboard Configuration

### Set Environment Variables in Render:

1. Go to your **Render service** → **Environment**
2. **Add these variables**:

| Variable          | Value                                | Example                     |
| ----------------- | ------------------------------------ | --------------------------- |
| `SMTP_USER`       | `postmaster@your-domain.mailgun.org` | `postmaster@mg.teamops.app` |
| `SMTP_PASS`       | Your Mailgun SMTP password           | `your-smtp-password-123`    |
| `SMTP_FROM_EMAIL` | Your verified sender email           | `no-reply@teamops.app`      |

3. **Deploy** your service

> **Note**: `SMTP_HOST`, `SMTP_PORT`, and `SMTP_FROM_NAME` are already configured in `render.yaml`

## 🧪 Testing Your Configuration

### Method 1: Run SMTP Validator

```bash
# Check your configuration
node scripts/validate-smtp.js
```

### Method 2: Test via TeamOps App

1. **Create a team** in your deployed app
2. **Invite a user** by email
3. **Check email delivery** in:
   - Recipient's inbox (including spam folder)
   - Mailgun dashboard → **Logs**

### Method 3: Manual Test with Nodemailer

Create `test-mailgun.js`:

```javascript
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransporter({
  host: "smtp.mailgun.org",
  port: 587,
  secure: false,
  auth: {
    user: "postmaster@your-domain.mailgun.org",
    pass: "your-smtp-password",
  },
});

transporter
  .sendMail({
    from: '"TeamOps" <no-reply@your-domain.com>',
    to: "test@example.com",
    subject: "Mailgun SMTP Test",
    html: "<h1>Mailgun is working!</h1><p>Email sent successfully via SMTP.</p>",
  })
  .then(() => {
    console.log("✅ Email sent via Mailgun!");
  })
  .catch(console.error);
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "Authentication failed"

- ✅ Verify SMTP username includes your domain: `postmaster@your-domain.mailgun.org`
- ✅ Check SMTP password is correct (not your Mailgun account password)
- ✅ Ensure domain is verified in Mailgun

#### 2. "Domain not verified"

- ✅ Complete DNS setup in Mailgun dashboard
- ✅ Wait up to 48 hours for DNS propagation
- ✅ Verify DNS records with `dig` or online DNS checkers

#### 3. "Connection timeout"

- ✅ Check firewall settings
- ✅ Verify port 587 is not blocked
- ✅ Try alternative ports: 25, 465, 2525

#### 4. Emails going to spam

- ✅ Complete domain verification
- ✅ Set up SPF/DKIM records (provided by Mailgun)
- ✅ Use verified sender domains
- ✅ Avoid spam trigger words

### Debug Logs

Monitor your Render logs:

```bash
# View real-time logs
render logs --service your-service-id --tail

# Check for SMTP errors
render logs --service your-service-id | grep -i "mail\|smtp"
```

### Mailgun Dashboard Monitoring

1. **Logs**: View all email activity and delivery status
2. **Analytics**: Track open rates, click rates, bounces
3. **Suppressions**: Manage bounced/unsubscribed emails
4. **Webhooks**: Set up real-time delivery notifications

## 🚀 Production Optimization

### Email Template Enhancements

Your emails now include:

- ✅ **Professional HTML templates** with CSS styling
- ✅ **Responsive design** for mobile devices
- ✅ **Mailgun tracking headers** for analytics
- ✅ **Brand consistency** with TeamOps styling

### Monitoring & Analytics

Enable tracking in Mailgun:

```bash
# Headers automatically added in your code:
X-Mailgun-Tag: team-invitation
X-Mailgun-Track: yes
X-Mailgun-Track-Clicks: yes
X-Mailgun-Track-Opens: yes
```

### Rate Limiting & Best Practices

1. **Respect Mailgun limits**: 300 emails/hour on free tier
2. **Implement queuing**: For high-volume sending
3. **Monitor bounce rates**: Keep below 5%
4. **Regular list cleaning**: Remove inactive recipients

## 📊 Mailgun Features Enabled

| Feature                    | Status     | Description                      |
| -------------------------- | ---------- | -------------------------------- |
| **SMTP Delivery**          | ✅ Enabled | Reliable email sending via SMTP  |
| **Email Tracking**         | ✅ Enabled | Open and click tracking          |
| **Analytics**              | ✅ Enabled | Delivery reports and metrics     |
| **Professional Templates** | ✅ Enabled | Branded HTML email templates     |
| **Error Handling**         | ✅ Enabled | Graceful failure management      |
| **Development Mode**       | ✅ Enabled | Debug logging in dev environment |

## 🎯 Next Steps

1. ✅ **Set environment variables** in Render dashboard
2. ✅ **Verify domain** in Mailgun (if using custom domain)
3. ✅ **Test email sending** with team invitation
4. ✅ **Monitor delivery** in Mailgun dashboard
5. ✅ **Set up webhooks** for delivery notifications (optional)

## 💡 Cost Optimization

### Mailgun Free Tier

- **5,000 emails/month** for first 3 months
- **300 emails/hour** rate limit
- **Email validation** included

### Paid Plans (if needed)

- **Foundation**: $15/month for 5,000 emails
- **Growth**: $35/month for 50,000 emails
- **Scale**: Custom pricing for enterprise

## 📚 Resources

- [Mailgun Documentation](https://documentation.mailgun.com/)
- [SMTP Configuration Guide](https://documentation.mailgun.com/en/latest/user_manual.html#sending-via-smtp)
- [DNS Setup Guide](https://help.mailgun.com/hc/en-us/articles/203637190-How-Do-I-Add-or-Delete-a-Domain-)
- [TeamOps SMTP Validator](../scripts/validate-smtp.js)

---

**🎉 Your Mailgun SMTP is now configured!** Test it by creating a team invitation in your deployed TeamOps application.
