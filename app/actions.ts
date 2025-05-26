"use server"

import { MongoClient, ObjectId, Db, Collection } from "mongodb"
import clientPromise from '@/lib/mongodb'
import { revalidatePath } from "next/cache"

// interface ApolloOrganization {
//   name?: string;
//   website_url?: string;
//   industry?: string;
//   employee_count?: string;
//   location?: {
//     city?: string;
//     state?: string;
//     country?: string;
//   };
//   description?: string;
// }

interface ApolloPerson {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  linkedin_url: string;
  title: string;
  email_status: string | null;

  photo_url: string;
  twitter_url: string | null;
  github_url: string | null;

  facebook_url: string | null;
  extrapolated_email_confidence: number | null;
  headline: string | null;
  email: string;
  organization_id: string;
  employment_history: Array<EmploymentHistory>;

  state: string;
  city: string;
  country: string;

  organization: Organization;
  seniority: string;
}

interface ApolloResponse {
  person: ApolloPerson;
}

type EmploymentHistory = {
  _id: string;
  created_at: string | null;
  current: boolean;
  degree: string | null;
  description: string | null;
  emails: string[] | null;
  end_date: string | null;
  grade_level: string | null;

  kind: string | null;
  major: string | null;

  organization_id: string;
  organization_name: string;

  raw_address: string | null;
  start_date: string;

  title: string;
  updated_at: string | null;

  id: string;
  key: string;
};

type Organization = {
  id: string;
  name: string;
  website_url: string;
  linkedin_url: string;
  twitter_url: string;
  facebook_url: string;
  primary_phone: {
    number: string;
    source: string;
    sanitized_number: string;
  };
  languages: string[];
  phone: string;
  linkedin_uid: string;
  founded_year: number;
  logo_url: string;
  primary_domain: string;
  sanitized_phone: string;
  industry: string;
  estimated_num_employees: number;
  raw_address: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  short_description: string;
};

interface LeadData {
  name: string;
  position: string;
  companyName: string;
  photo: string | null;
  contactDetails: {
    email: string;
    phone: string;
    linkedin: string;
  };
  companyDetails: {
    industry: string;
    employees: string;
    headquarters: string;
    website: string;
  };
  leadScoring: {
    rating: string;
    qualificationCriteria: {
      [key: string]: string;
    };
  };
  notes: {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  tags: string[];
  status: 'hot' | 'warm' | 'meeting_scheduled' | 'meeting_rescheduled' | 'meeting_done';
  nextFollowUp: Date | null;
  customFields: {
    [key: string]: string;
  };
  project?: string;
}

// interface LeadReport {
//   _id?: ObjectId;
//   email: string;
//   apolloData: ApolloResponse;
//   report: string;
//   leadData: LeadData;
//   createdAt: Date;
//   status: string;
//   error?: string;
// }

const APOLLO_API_KEY = process.env.APOLLO_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const MONGODB_URI = process.env.MONGODB_URI

if (!APOLLO_API_KEY || !OPENAI_API_KEY || !MONGODB_URI) {
  throw new Error("Missing environment variables")
}

let client: MongoClient | null = null
let db: Db | null = null
let reports: Collection | null = null

async function getDb() {
  if (!client) {
    client = await clientPromise
    db = client.db("lead-reports")
    reports = db.collection("reports")
  }
  if (!reports) {
    throw new Error("Failed to initialize database connection")
  }
  return { db, reports }
}

export async function fetchApolloData(email: string) {
  if (!APOLLO_API_KEY) {
    throw new Error("Apollo API key is not configured")
  }

  const response = await fetch("https://api.apollo.io/api/v1/people/match", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "X-API-KEY": APOLLO_API_KEY as string
    },
    body: JSON.stringify({
      email: email,
      reveal_personal_emails: false,
      reveal_phone_number: false,
      enrich_profiles: true
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Apollo fetch failed:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      email: email
    })
    
    if (response.status === 429) {
      throw new Error("Apollo API rate limit exceeded. Please try again later.")
    } else if (response.status === 401) {
      throw new Error("Invalid Apollo API key. Please check your configuration.")
    } else if (response.status === 400) {
      throw new Error("Invalid request to Apollo API. Please check the email format.")
    } else if (response.status === 404) {
      throw new Error("No data found for the provided email address.")
    }
    
    throw new Error(`Failed to fetch Apollo data: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  
  if (!data.person) {
    throw new Error("No person data found in Apollo API response")
  }

  // Try to get profile picture from Apollo data
  let photoUrl = null
  if (data.person.photo_url) {
    photoUrl = data.person.photo_url
  } else if (data.person.facebook_url) {
    // Try to extract Facebook profile picture if available
    try {
      const fbUsername = data.person.facebook_url.split('facebook.com/')[1]?.split('?')[0]
      if (fbUsername) {
        photoUrl = `https://graph.facebook.com/${fbUsername}/picture?type=large`
      }
    } catch (error) {
      console.error('Failed to parse Facebook URL:', error)
    }
  }

  // If no photo found, generate an avatar
  if (!photoUrl) {
    const name = data.person.name || email.split('@')[0]
    const colors = [
      { bg: '2563eb', fg: 'ffffff' }, // Blue
      { bg: '4f46e5', fg: 'ffffff' }, // Indigo
      { bg: '7c3aed', fg: 'ffffff' }, // Violet
      { bg: '0891b2', fg: 'ffffff' }, // Cyan
      { bg: '0284c7', fg: 'ffffff' }  // Light Blue
    ]
    const colorIndex = Math.floor(Math.random() * colors.length)
    const { bg, fg } = colors[colorIndex]
    
    photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=${fg}&bold=true&size=200&length=2&font-size=0.4`
  }
  
  // Add the photo URL to the response
  data.person.photo_url = photoUrl

  return data
}

async function generateAIReport(apolloData: ApolloResponse) {
  const personData = apolloData.person || {}
  const org = personData.organization || {}
  
  const leadData = {
    companyName: org.name || 'N/A',
    position: personData.title || 'N/A',
    name: personData.name || 'N/A',
    contactDetails: {
      // phone: personData.phone_number || 'N/A',
      linkedin: personData.linkedin_url || 'N/A',
      email: personData.email || 'N/A'
    },
    photo: personData.photo_url || null,
    aboutLead: `${personData.name || 'The lead'} is ${personData.title || 'a professional'} at ${org.name || 'their organization'}`,
    aboutCompany: org.short_description || 'N/A',
    companyDetails: {
      headquarters: org.country ? `${org.city || ''}, ${org.state || ''}, ${org.country || ''}`.replace(/, ,/g, ',').replace(/^,/, '').replace(/,$/, '') : 'N/A',
      website: org.website_url || 'N/A',
      industry: org.industry || 'N/A',
      employees: org.estimated_num_employees || 'N/A'
    },
    leadScoring: {
      rating: '⭐⭐⭐⭐⭐',
      qualificationCriteria: {
        decisionMaker: 'YES',
        viewedSolutionDeck: 'YES',
        haveBudget: 'YES',
        need: 'YES'
      }
    },
    project: 'N/A',
    notes: [],
    status: 'warm',
    tags: [],
    nextFollowUp: null,
    customFields: {}
  }

  const reportPrompt = `
Create a professional lead report with the following structure:

# ${leadData.name}
## ${leadData.position} at ${leadData.companyName}

### Contact Details
- **LinkedIn:** ${leadData.contactDetails.linkedin}
- **Email:** ${leadData.contactDetails.email}

### About Lead
${leadData.aboutLead}

### About Company
${leadData.aboutCompany}

### Company Details
- **Company HQ:** ${leadData.companyDetails.headquarters}
- **Company Website:** ${leadData.companyDetails.website}
- **Industry:** ${leadData.companyDetails.industry}
- **Employee Count:** ${leadData.companyDetails.employees}

### Lead Scoring
**Lead Rating:** ${leadData.leadScoring.rating}

#### Qualification Criteria
- **Decision Maker:** ${leadData.leadScoring.qualificationCriteria.decisionMaker}
- **Viewed Solution Deck:** ${leadData.leadScoring.qualificationCriteria.viewedSolutionDeck}
- **Have Budget:** ${leadData.leadScoring.qualificationCriteria.haveBudget}
- **Need:** ${leadData.leadScoring.qualificationCriteria.need}

### Engagement Strategy
Please provide specific recommendations for engaging with this lead based on their profile and company details.

### Notes
- Initial contact made through Apollo.io lead generation
`

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional lead researcher. Create a detailed, well-structured report based on the provided data. Focus on business value, decision-making capacity, and potential engagement strategies. Use markdown formatting for better readability.",
        },
        {
          role: "user",
          content: reportPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    console.error('OpenAI API error:', errorData)
    throw new Error("Failed to generate AI report. Please try again later.")
  }

  const data = await response.json()
  return {
    report: data.choices[0].message.content,
    leadData: leadData
  }
}

export async function initiateReport(formData: FormData) {
  const email = formData.get("email") as string
  const meetingDate = formData.get("meetingDate") as string
  const meetingTime = formData.get("meetingTime") as string
  const meetingPlatform = formData.get("meetingPlatform") as string
  const problemPitch = formData.get("problemPitch") as string
  const project = formData.get("project") as string

  if (!email || !email.includes('@')) {
    throw new Error("Please provide a valid email address")
  }

  const { reports } = await getDb()

  // Create an initial report entry
  const initialReport = {
    email,
    apolloData: { person: {} },
    report: "",
    leadData: {
      name: "",
      position: "",
      companyName: "",
      photo: null,
      contactDetails: { email: "", phone: "", linkedin: "" },
      companyDetails: { industry: "", employees: "", headquarters: "", website: "" },
      leadScoring: { rating: "", qualificationCriteria: {} },
      project: project || "N/A"
    },
    meetingDate,
    meetingTime,
    meetingPlatform,
    problemPitch,
    createdAt: new Date(),
    status: "processing"
  }

  const result = await reports.insertOne(initialReport)
  const reportId = result.insertedId.toString()

  // Return immediately after creating the report
  processReport(email, reportId).catch(console.error)
  
  return { success: true, reportId, status: "processing" }
}

// Separate function to handle the processing
async function processReport(email: string, reportId: string) {
  const { reports } = await getDb()
  
  try {
    // Get the existing report to preserve meeting details and project
    const existingReport = await reports.findOne({ _id: new ObjectId(reportId) })
    
    // Step 1: Fetch Apollo Data
    const apolloData = await fetchApolloData(email)
    await reports.updateOne(
      { _id: new ObjectId(reportId) },
      { 
        $set: { 
          apolloData, 
          status: "fetching_apollo",
          // Preserve meeting details and project
          meetingDate: existingReport?.meetingDate,
          meetingTime: existingReport?.meetingTime,
          meetingPlatform: existingReport?.meetingPlatform,
          problemPitch: existingReport?.problemPitch,
          'leadData.project': existingReport?.leadData?.project || 'N/A'
        } 
      }
    )

    // Step 2: Generate AI Report
    const { report: aiReport, leadData } = await generateAIReport(apolloData)
    
    // Preserve the project field from the existing report
    leadData.project = existingReport?.leadData?.project || leadData.project || 'N/A'
    
    await reports.updateOne(
      { _id: new ObjectId(reportId) },
      {
        $set: {
          report: aiReport,
          leadData,
          status: "completed",
          // Preserve meeting details
          meetingDate: existingReport?.meetingDate,
          meetingTime: existingReport?.meetingTime,
          meetingPlatform: existingReport?.meetingPlatform,
          problemPitch: existingReport?.problemPitch
        }
      }
    )
    
    // After the report is completed, generate AI content for all sections
    await generateAIContentForAllSections(reportId, leadData, apolloData);
  } catch (error) {
    console.error('Error processing report:', error)
    await reports.updateOne(
      { _id: new ObjectId(reportId) },
      {
        $set: {
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error"
        }
      }
    )
  }
}

// Function to generate AI content for all sections of a report
async function generateAIContentForAllSections(reportId: string, leadData: any, apolloData: any) {
  console.log(`Automatically generating AI content for report: ${reportId}`);
  
  // Define the sections to generate content for
  const sections = ['overview', 'company', 'meeting', 'interactions', 'competitors', 'techStack', 'news', 'nextSteps'];
  const newContent: Record<string, any> = {};
  
  try {
    // We need an API route to handle the AI generation
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Generate content for each section
    for (const section of sections) {
      const response = await fetch(`${baseUrl}/api/ai-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section,
          leadData,
          apolloData
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        newContent[section] = result;
        console.log(`Successfully generated AI content for ${section} section`);
      } else {
        console.error(`Failed to generate content for ${section} section`);
      }
    }
    
    // Update the report with the generated AI content
    const { reports } = await getDb();
    await reports.updateOne(
      { _id: new ObjectId(reportId) },
      {
        $set: {
          aiContent: newContent
        }
      }
    );
    
    console.log(`Successfully saved AI content for report: ${reportId}`);
    return newContent;
  } catch (error) {
    console.error('Error generating AI content:', error);
    return null;
  }
}

// Helper function to serialize MongoDB documents
function serializeDocument(doc: any): any {
  if (doc === null || typeof doc !== 'object') {
    return doc;
  }

  if (Array.isArray(doc)) {
    return doc.map(serializeDocument);
  }

  const serialized: any = {};
  for (const [key, value] of Object.entries(doc)) {
    if (value instanceof ObjectId) {
      serialized[key] = value.toString();
    } else if (value instanceof Date) {
      serialized[key] = value.toISOString();
    } else if (typeof value === 'object' && value !== null) {
      serialized[key] = serializeDocument(value);
    } else {
      serialized[key] = value;
    }
  }
  return serialized;
}

export async function getReportStatus(reportId: string) {
  const { reports } = await getDb()
  const report = await reports.findOne({ _id: new ObjectId(reportId) })
  
  if (!report) throw new Error("Report not found")
  
  return {
    status: report.status,
    data: report.status === "completed" ? serializeDocument(report) : null,
    error: report.error
  }
}

export async function deleteReport(formData: FormData) {
  const reportId = formData.get('reportId')?.toString()
  if (!reportId) {
    throw new Error('Report ID is required')
  }

  try {
    const { reports } = await getDb()
    await reports.deleteOne({ _id: new ObjectId(reportId) })
    revalidatePath('/history')
  } catch (error) {
    console.error('Error deleting report:', error)
    throw new Error('Failed to delete report')
  }
}

export async function getReports() {
  const { reports } = await getDb()
  const allReports = await reports.find({}).sort({ createdAt: -1 }).toArray()
  return serializeDocument(allReports)
}

export async function updateLeadStatus(reportId: string, status: string) {
  try {
    const { reports } = await getDb()
    
    const result = await reports.updateOne(
      { _id: new ObjectId(reportId) },
      { 
        $set: { 
          'leadData.status': status,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      throw new Error('Report not found')
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to update lead status:', error)
    throw new Error('Failed to update lead status')
  }
}

