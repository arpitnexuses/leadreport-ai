# Lead Generation Form - Field Guide

## Form Structure & Field Order

```
┌─────────────────────────────────────────────────────────────┐
│  GENERATE LEAD REPORT                                       │
│  Create comprehensive lead reports with AI-powered insights │
└─────────────────────────────────────────────────────────────┘

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                     LEAD GENERATION FORM                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌─────────────────────────────────────────────────────────────┐
│ 📧  Enter business email address                 [REQUIRED] │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 💼  Enter project name                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 👤  Your full name (Report Owner)                [REQUIRED] │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🏭  Lead's Industry (e.g., SaaS, E-commerce, Healthcare)    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🖥️  Lead's Designation/Role (e.g., VP of Sales)            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🏢  Company Overview                                        │
│                                                             │
│     (Brief notes about the company)                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📄  Lead Background                                         │
│                                                             │
│     (Notes about lead's role, responsibilities, pain pts)   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📅  Meeting Date                                            │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────┬──────────────────────────────┐
│ 🕐  Meeting Time             │ 🌍  Select Timezone          │
└──────────────────────────────┴──────────────────────────────┘
                                   • EST (UTC-5)
                                   • CST (UTC-6)
                                   • MST (UTC-7)
                                   • PST (UTC-8)
                                   • GMT (UTC+0)
                                   • CET (UTC+1)
                                   • GST (UTC+4)
                                   • IST (UTC+5:30)
                                   • SGT (UTC+8)
                                   • JST (UTC+9)
                                   • AEDT (UTC+11)

┌─────────────────────────────────────────────────────────────┐
│ 💻  Meeting Platform (e.g., Zoom, Google Meet, Teams)      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🔗  Meeting Link (URL for Join button)                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📍  Physical Location (Address/Venue - if applicable)      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📋  Meeting Objective & Agenda                              │
│                                                             │
│     (What do you want to achieve?)                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 💬  Problem/Solution Pitch                                  │
│                                                             │
│     (Brief description of what you're offering)             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  ✨ Generate Lead Report                    │
└─────────────────────────────────────────────────────────────┘
```

## Field Mapping to Report Display

### WHERE YOUR INPUT SHOWS UP IN THE REPORT:

#### 1. Report Owner Name
```
┌────────────────────────┐
│ REPORT OWNER           │
│ ─────────────          │
│  [N]  Neeraj          │← Your name here
│       Feb 3            │
└────────────────────────┘
```

#### 2. Meeting Information
```
┌────────────────────────────────────────────┐
│  ┌──────┐                                  │
│  │  03  │  10:00 AM EST • Zoom            │← Time + Timezone + Platform
│  │ Feb  │  Discovery Call                  │← Meeting Objective
│  └──────┘  123 Main St, NYC • Zoom        │← Location + Platform
│                              [Join] ←────────← Meeting Link
└────────────────────────────────────────────┘
```

#### 3. About Lead Section
```
┌────────────────────────────────────────────┐
│ ABOUT LEAD                                 │
│                                            │
│ VP of Sales at Acme Corp...               │
│                                            │
│ [SaaS] [VP of Sales] ←──────────────────────← Industry & Designation badges
│                                            │
│ ┌────────────────────────────────────────┐│
│ │ BACKGROUND                              ││
│ │ 15+ years in B2B sales...              ││← Lead Background
│ └────────────────────────────────────────┘│
└────────────────────────────────────────────┘
```

#### 4. About Company Section
```
┌────────────────────────────────────────────┐
│ ABOUT ACME CORP                            │
│                                            │
│ Leading provider of enterprise software... │← Company Overview
│ solutions for Fortune 500 companies.       │
│                                            │
│ • Key point 1                              │
│ • Key point 2                              │
└────────────────────────────────────────────┘
```

## Required vs Optional Fields

### ✅ REQUIRED (Form won't submit without these):
- Email address
- Report Owner Name

### ✨ OPTIONAL (But highly recommended):
- Project name
- Lead's Industry
- Lead's Designation
- Lead Background
- Company Overview
- Meeting Date
- Meeting Time
- Meeting Timezone
- Meeting Platform
- Meeting Link
- Meeting Location
- Meeting Objective
- Problem/Solution Pitch

## Field Validation Rules

| Field | Min Length | Max Length | Format |
|-------|-----------|------------|--------|
| Email | - | - | Valid email format |
| Report Owner Name | 1 char | - | Any text |
| Meeting Link | - | - | Valid URL (if provided) |
| Lead Industry | - | - | Any text |
| Lead Designation | - | - | Any text |
| Meeting Timezone | - | - | Select from dropdown |

## Use Cases & Examples

### Example 1: SaaS Sales Call
```
Email: john@techcorp.com
Report Owner: Sarah Johnson
Project: Enterprise Migration 2024
Industry: SaaS
Designation: CTO
Company Overview: TechCorp is a mid-size B2B SaaS company specializing in 
                  project management tools for engineering teams.
Lead Background: John has been CTO for 3 years, focusing on technical 
                 infrastructure and team scaling.
Meeting Date: 2024-02-15
Meeting Time: 14:00
Timezone: EST (UTC-5)
Platform: Zoom
Meeting Link: https://zoom.us/j/123456789
Location: [empty - virtual meeting]
Objective: Discuss enterprise migration strategy and technical requirements
Pitch: We help engineering teams reduce deployment time by 50% with our 
       automated CI/CD pipeline solution.
```

### Example 2: In-Person Meeting
```
Email: maria@retailco.com
Report Owner: Mike Chen
Project: Retail Analytics Q1
Industry: Retail
Designation: VP of Operations
Company Overview: RetailCo operates 200+ stores across the Northeast, focusing 
                  on sustainable fashion and local sourcing.
Lead Background: Maria oversees operations for all East Coast locations, 
                 managing supply chain and inventory systems.
Meeting Date: 2024-02-20
Meeting Time: 11:00
Timezone: EST (UTC-5)
Platform: In-Person
Meeting Link: [empty]
Location: RetailCo HQ, 456 Broadway, New York, NY 10013
Objective: Present inventory optimization solution and discuss pilot program
Pitch: Our AI-powered inventory system reduces stockouts by 40% while cutting 
       carrying costs by 25%.
```

## Tips for Best Results

1. **Be Specific**: Detailed information helps AI generate better insights
2. **Complete All Fields**: More data = more comprehensive report
3. **Update Industry**: Helps with competitor analysis and market positioning
4. **Add Background**: Context about the lead improves AI recommendations
5. **Include Meeting Link**: Makes it easy to join meetings from the report
6. **Specify Timezone**: Critical for international meetings
7. **Clear Objectives**: Helps structure the meeting and follow-ups

## Common Questions

**Q: What happens if I skip optional fields?**
A: Report will still generate, but some sections may have less detailed information.

**Q: Can I edit these fields after creating the report?**
A: Yes! Click "Edit Profile" in the report view to update meeting details and other information.

**Q: Will the meeting link expire?**
A: The link is stored as-is. Make sure to use persistent meeting links or update the link in the report if needed.

**Q: How is this different from the old form?**
A: The old form only captured: email, project, meeting date/time/platform, and problem pitch. 
   The new form adds: owner name, industry, designation, background, company overview, 
   timezone, meeting link, physical location, and separate meeting objective.

**Q: Can I see engagement timeline?**
A: The data structure is ready. Timeline UI will be added in a future update to separate 
   different types of interactions (calls, emails, meetings) from regular notes.
