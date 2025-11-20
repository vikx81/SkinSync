# SkinSync App - Visual Walkthrough

## What You Built

SkinSync is a beautiful, modern skincare tracking app with a mobile-first design. Here's what each page looks like and does:

---

## 🏠 Home Screen (Routine Page)

**What you see when you open the app:**

### Top Section
- **Title**: "Daily Routine"
- **Date**: Shows today's date (e.g., "Wednesday, November 20, 2025")

### AM/PM Toggle
- Large buttons to switch between morning and evening routines
- **AM button** has a sun icon ☀️
- **PM button** has a moon icon 🌙
- Active button is highlighted in purple

### Product Selection
- **"Select Products"** card shows all your active products
- Each product is a clickable button showing:
  - Product name (e.g., "Vitamin C Serum")
  - Brand (e.g., "SkinCeuticals")
  - Category (e.g., "serum")
- Selected products have a purple background and checkmark
- Example products in demo:
  - Gentle Foaming Cleanser (CeraVe)
  - Vitamin C Serum (SkinCeuticals)
  - Retinol 0.5% (The Ordinary)
  - Daily Moisturizer SPF 30 (La Roche-Posay)
  - Hyaluronic Acid Serum (The Ordinary)
  - Night Cream (Olay)

### Notes Section
- Text area to add notes like "How does your skin feel today?"

### Photo Upload
- Tap to add a photo of your skin
- Shows preview after selecting
- Can remove photo with X button

### Save Button
- Big purple button at bottom: "Log Routine"
- Changes to "Update Routine" if you already logged today

### ⚠️ Special Feature: Retinol Warning
If you have a treatment scheduled nearby, you'll see a yellow warning box:
- "Retinol Products Hidden"
- Explains why retinol products aren't showing
- Example: "Retinol blocked due to IPL treatment on 2025-11-01. Safe to use in 5 days."

---

## 💉 Treatments Page

**Track professional skincare treatments**

### Top Bar
- **"Treatments"** title
- **"+ Add"** button in purple

### Treatment List
Each treatment shows:
- **Icon**: 💉 syringe icon
- **Type**: EXION, IPL, Microneedling, etc.
- **Date**: When it happened
- **Buffer days**: How long to avoid retinol
- **Notes**: Provider, location, observations
- **Photo**: If you added one
- **Edit/Delete buttons**: On the right

### Add Treatment Form (when you click Add)
- **Treatment Type dropdown**:
  - EXION
  - IPL
  - Microneedling
  - Chemical Peel
  - Laser
  - Botox
  - Filler
  - HydraFacial
  - LED Therapy
  - Other
- **Date picker**
- **Buffer Days slider**: How many days before/after to hide retinol (default 7)
- **Notes field**
- **Photo upload**
- **Cancel** and **Save** buttons

### Demo Data Shows:
- HydraFacial from 7 days ago
- IPL from 30 days ago

---

## 📅 History Page

**View all your past routines and treatments**

### Top Bar
- **"Log History"** title
- **Toggle**: List vs Calendar view

### Calendar View
- Shows full month
- Days with entries have small icons:
  - ☀️ for AM routine
  - 🌙 for PM routine
  - 💉 for treatments
- Click a day to filter
- Today's date is bold and purple

### List View
Shows chronological entries:

**Routine Entry:**
- ☀️ or 🌙 icon + "AM Routine" or "PM Routine"
- Date on the right
- Product badges showing what you used
- Notes if any
- Photo if uploaded

**Treatment Entry:**
- 💉 icon + treatment type
- Date on the right
- Notes
- Photo if uploaded

### Filter Bar
When you select a date:
- Shows "Showing: November 20, 2025"
- "Clear filter" link to see all

### Demo Data Shows:
- Today's AM routine
- Yesterday's AM and PM routines
- Past few days of routines

---

## 📦 Products Page

**Your skincare product library**

### Top Bar
- **"Product Library"** title
- **"+ Add"** button

### Active/Retired Toggle
- **Active** tab: Products you're currently using
- **Retired** tab: Products you stopped using
- Shows count for each

### Product Cards
Each product shows:
- **Name** in bold (e.g., "Vitamin C Serum")
- **Yellow "Retinol" badge** if it contains retinol
- **Brand** • **Category** (e.g., "SkinCeuticals • serum")
- **Started date**: "Started: Jun 1, 2024"
- **Notes** if any
- **Edit** ✏️ and **Retire** 📦 buttons on right

For retired products:
- Shows stop date and reason
- **Reactivate** 🔄 and **Delete** 🗑️ buttons

### Add/Edit Product Form
- **Product Name** (required)
- **Brand** (optional)
- **Category dropdown**: cleanser, toner, serum, moisturizer, sunscreen, treatment, eye-cream, mask, exfoliant, retinol, other
- **Contains retinol** checkbox (auto-checked if category is retinol)
- **Date Started** picker
- **Notes** text area
- **Cancel** and **Add/Update** buttons

### Retire Modal
Popup asking:
- "Retire Product"
- Reason field (optional)
- Example reasons: "Finished", "Didn't work well", "Switching brands"
- **Cancel** and **Retire** buttons

### Demo Data Shows:
- 6 active products with various brands
- 1 retired product (Old Toner - switched to better product)

---

## 👤 Profile Page

**Settings and analytics**

### User Info Card
- "Signed in as"
- demo@skinsync.app

### Settings Cards

**Dark Mode**
- 🌙 Moon icon or ☀️ Sun icon
- Toggle switch (purple when on, gray when off)
- Instantly changes app theme

**Notifications**
- 🔔 Bell icon
- Toggle switch
- "Notifications" label

**Retinol Reminders**
- ⏰ Clock icon
- "Retinol Reminders"
- "Remind to use retinol products"
- Toggle switch

### Photo Comparison (Expandable)
- 📷 Camera icon + "Photo Comparison"
- Chevron to expand
- Two dropdowns: "Before" and "After"
- Select dates from your progress photos
- Side-by-side comparison view

### Export Options

**Export to CSV**
- 📥 Download icon
- "Export to CSV"
- "Download all data as spreadsheet"

**Export to PDF**
- 📥 Download icon
- "Export to PDF"
- "Download summary report"

### Your Stats
Three-column grid:
- **7** Products
- **5** Routines
- **2** Treatments

### Sign Out Button
- Red "Sign Out" button at bottom with logout icon

---

## 📱 Bottom Navigation (Always Visible)

Five tabs with icons and labels:
1. **Routine** - ☀️ Sun icon
2. **Treatments** - 💉 Syringe icon
3. **History** - 📅 History icon
4. **Products** - 📦 Package icon
5. **Profile** - 👤 User icon

Active tab is purple, others are gray.

---

## 🎨 Design Features

### Colors
- **Primary**: Purple/magenta (#c026d3)
- **Light mode**: White backgrounds, gray text
- **Dark mode**: Dark gray backgrounds, white text
- **Accent**: Purple for buttons and active states

### UI Elements
- **Rounded corners** on all cards and buttons
- **Shadows** for depth
- **Smooth transitions** when switching modes
- **Toast notifications** for actions (green for success, red for errors)

### Mobile-First
- Designed for phone screens
- Bottom navigation for easy thumb access
- Large tap targets
- Swipeable date pickers

---

## 🚀 Key Features Working in Demo Mode

✅ Add and edit products
✅ Log AM/PM routines with multiple products
✅ Add treatments with buffer logic
✅ View history in calendar and list views
✅ Retinol products automatically hide near treatments
✅ Dark mode toggle works instantly
✅ Export to CSV and PDF
✅ All data persists during your session

---

## 💡 Cool Smart Features

1. **Auto Retinol Blocking**: When you log a treatment, retinol products automatically hide from routine selection for the buffer period (e.g., 7 days before and after)

2. **Visual Calendar**: See at a glance which days you did AM routines, PM routines, or treatments

3. **Product History**: Retired products stay in your logs so you can always see what you used

4. **Photo Comparison**: Track your progress by comparing skin photos from different dates

5. **Data Export**: Download everything as CSV for spreadsheets or PDF for reports

---

This is your fully-functional skincare tracking app! All features work right now in demo mode. When you're ready to use it for real, just add Supabase credentials and your data will persist permanently.
