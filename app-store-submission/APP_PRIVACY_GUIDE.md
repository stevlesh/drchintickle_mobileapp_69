# Dr. ChinTickle - App Store Privacy Questionnaire Guide

**Date:** October 29, 2025
**App Version:** 1.1.0 (Build 10)
**Status:** Ready for App Store Connect Submission

---

## How to Fill Out App Privacy in App Store Connect

Navigate to: **App Store Connect** → **Your App** → **Trust & Safety** → **App Privacy**

---

## Question 1: Does your app collect data?

**Answer:** ✅ **YES**

---

## Data Types Collected

### 1. Contact Info

#### ✅ Email Address
- **Linked to User:** ✅ Yes
- **Used for Tracking:** ❌ No
- **Purposes:**
  - [x] App Functionality
  - [x] Analytics (for account management)
  - [ ] Product Personalization
  - [ ] Developer Communications (could enable if you plan to email users)
  - [ ] Other

#### ✅ Name
- **Linked to User:** ✅ Yes
- **Used for Tracking:** ❌ No
- **Purposes:**
  - [x] App Functionality
  - [ ] Analytics
  - [ ] Product Personalization
  - [ ] Developer Communications
  - [ ] Other

---

### 2. Health & Fitness

#### ✅ Fitness
- **Data Collected:** Pull-up counts, workout history, progress metrics, cycles, streaks
- **Linked to User:** ✅ Yes
- **Used for Tracking:** ❌ No
- **Purposes:**
  - [x] App Functionality
  - [x] Analytics (to calculate workout plans)
  - [x] Product Personalization (personalized workout plans)
  - [ ] Developer Communications
  - [ ] Other

---

### 3. Identifiers

#### ✅ User ID
- **Data Collected:** Supabase user ID, session tokens
- **Linked to User:** ✅ Yes
- **Used for Tracking:** ❌ No
- **Purposes:**
  - [x] App Functionality (authentication)
  - [x] Analytics
  - [ ] Product Personalization
  - [ ] Developer Communications
  - [ ] Other

---

### 4. Usage Data

#### ✅ Product Interaction
- **Data Collected:** App version, device type, workout dates/times
- **Linked to User:** ✅ Yes
- **Used for Tracking:** ❌ No
- **Purposes:**
  - [x] App Functionality
  - [x] Analytics
  - [ ] Product Personalization
  - [ ] Developer Communications
  - [ ] Other

---

## Data Types NOT Collected

Mark **NO** for the following categories:

- ❌ Purchases
- ❌ Location
- ❌ Sensitive Info
- ❌ Contacts
- ❌ User Content
- ❌ Browsing History
- ❌ Search History
- ❌ Financial Info
- ❌ Photos or Videos
- ❌ Audio Data
- ❌ Gameplay Content
- ❌ Customer Support
- ❌ Other Data Types
- ❌ Diagnostics (unless you add crash reporting later)

---

## Privacy Policy URL

```
https://stevlesh.github.io/drchintickle_mobileapp_69/privacy-policy.html
```

---

## Summary of Privacy Practices

### What We Collect
1. **Email & Name** - for account creation
2. **Workout Data** - pull-up counts, history, progress
3. **User ID** - for authentication
4. **Device Info** - app version, device type

### How It's Used
- Calculate personalized workout plans
- Track progress over time
- Authenticate users
- Improve app performance

### Key Commitments
- ✅ Data is **linked to user identity**
- ❌ Data is **NOT used for tracking**
- ❌ We **DO NOT sell your data**
- ✅ Users can request data deletion
- ✅ Data deleted within 30 days of account deletion

---

## Step-by-Step Instructions

### In App Store Connect:

1. **Go to Trust & Safety → App Privacy**

2. **Click "Get Started"**

3. **"Does your app collect data?"**
   - Select: **Yes**

4. **For each data type above:**
   - Click the data type
   - Toggle "Yes" for data collected
   - Select whether it's "Linked to Them" (Yes) or "Not Linked to Them" (No)
   - Select whether it's "Used to Track Them" (No for all)
   - Check the appropriate purposes

5. **Enter Privacy Policy URL:**
   ```
   https://stevlesh.github.io/drchintickle_mobileapp_69/privacy-policy.html
   ```

6. **Review and Save**

7. **Publish** (this locks in your privacy practices)

---

## Important Notes

### On "Tracking"
- **We select "NO" for tracking** because we don't share data with third parties for advertising or data brokers
- Supabase Analytics is for app functionality, not cross-app/website tracking

### On "Linked to User"
- All our data is **linked to user identity** because users create accounts
- This is fine and expected for a fitness tracking app

### On Third-Party SDKs
- **Supabase:** Backend/auth - covered under our privacy practices
- **Expo:** Development framework - no additional tracking
- **Google Sign-In:** Optional auth method - covered under Contact Info

### If Rejected
- Apple may ask for clarification on data practices
- Most common issue: forgetting to mark data as "Linked to User"
- We can update privacy practices without app review if needed

---

## Checklist

Before submitting:
- [ ] Privacy questionnaire completed in App Store Connect
- [ ] Privacy policy URL entered and verified
- [ ] All data types marked correctly
- [ ] "Linked to User" selected for all data types
- [ ] "Used for Tracking" set to NO for all data types
- [ ] Purposes selected accurately for each data type
- [ ] Privacy practices published

---

## Contact

**Developer:** Steven Leshinger
**Support:** drchintickle.app@gmail.com

---

**Last Updated:** October 29, 2025
**Next Step:** Complete privacy questionnaire in App Store Connect
