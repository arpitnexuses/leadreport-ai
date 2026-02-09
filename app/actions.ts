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
  engagementTimeline?: {
    id: string;
    type: 'call' | 'email' | 'meeting' | 'note';
    content: string;
    createdAt: Date;
  }[];
  tags: string[];
  status: 'hot' | 'warm' | 'meeting_scheduled' | 'meeting_rescheduled' | 'meeting_done';
  nextFollowUp: Date | null;
  customFields: {
    [key: string]: string;
  };
  project?: string;
  leadIndustry?: string;
  leadDesignation?: string;
  leadBackground?: string;
  companyOverview?: string;
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
const NEWS_API_KEY = process.env.NEWS_API_KEY

if (!APOLLO_API_KEY || !OPENAI_API_KEY || !MONGODB_URI) {
  throw new Error("Missing environment variables")
}

let client: MongoClient | null = null
let db: Db | null = null
let reports: Collection | null = null

// Simple in-memory cache for Apollo data with expiration
const apolloCache: Record<string, { data: any, timestamp: number }> = {};
const APOLLO_CACHE_TTL = 1000 * 60 * 60; // 1 hour in milliseconds

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
  // Check cache first
  const cachedData = apolloCache[email];
  const now = Date.now();

  if (cachedData && (now - cachedData.timestamp < APOLLO_CACHE_TTL)) {
    console.log(`Using cached Apollo data for ${email}`);
    return cachedData.data;
  }

  if (!APOLLO_API_KEY) {
    throw new Error("Apollo API key is not configured");
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
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Apollo fetch failed:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      email: email
    });

    if (response.status === 429) {
      throw new Error("Apollo API rate limit exceeded. Please try again later.");
    } else if (response.status === 401) {
      throw new Error("Invalid Apollo API key. Please check your configuration.");
    } else if (response.status === 400) {
      throw new Error("Invalid request to Apollo API. Please check the email format.");
    } else if (response.status === 404) {
      throw new Error("No data found for the provided email address.");
    }

    throw new Error(`Failed to fetch Apollo data: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.person) {
    throw new Error("No person data found in Apollo API response");
  }

  // Try to get profile picture from Apollo data
  let photoUrl = null;
  if (data.person.photo_url) {
    photoUrl = data.person.photo_url;
  } else if (data.person.facebook_url) {
    // Try to extract Facebook profile picture if available
    try {
      const fbUsername = data.person.facebook_url.split('facebook.com/')[1]?.split('?')[0];
      if (fbUsername) {
        photoUrl = `https://graph.facebook.com/${fbUsername}/picture?type=large`;
      }
    } catch (error) {
      console.error('Failed to parse Facebook URL:', error);
    }
  }

  // If no photo found, generate an avatar
  if (!photoUrl) {
    const name = data.person.name || email.split('@')[0];
    const colors = [
      { bg: '2563eb', fg: 'ffffff' }, // Blue
      { bg: '4f46e5', fg: 'ffffff' }, // Indigo
      { bg: '7c3aed', fg: 'ffffff' }, // Violet
      { bg: '0891b2', fg: 'ffffff' }, // Cyan
      { bg: '0284c7', fg: 'ffffff' }  // Light Blue
    ];
    const colorIndex = Math.floor(Math.random() * colors.length);
    const { bg, fg } = colors[colorIndex];

    photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=${fg}&bold=true&size=200&length=2&font-size=0.4`;
  }

  // Add the photo URL to the response
  data.person.photo_url = photoUrl;

  // Store in cache
  apolloCache[email] = {
    data,
    timestamp: now
  };

  return data;
}

// Function to fetch company news from NewsAPI.org
export async function fetchCompanyNews(companyName: string, industry?: string) {
  console.log('=== FETCHING COMPANY NEWS ===');
  console.log('Company Name:', companyName);
  console.log('Industry:', industry);
  console.log('NEWS_API_KEY exists:', !!NEWS_API_KEY);
  console.log('NEWS_API_KEY length:', NEWS_API_KEY?.length || 0);

  // If no NEWS_API_KEY is set, return empty results
  if (!NEWS_API_KEY) {
    console.log('⚠️ NEWS_API_KEY not set, skipping news fetch');
    return {
      articles: [],
      totalResults: 0
    };
  }

  try {
    // Clean company name for search query
    const searchQuery = companyName.replace(/\s+(Inc|LLC|Ltd|Corporation|Corp)\.?$/i, '').trim();
    console.log('Search query:', searchQuery);

    // Calculate date from 30 days ago for recent news
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromDate = thirtyDaysAgo.toISOString().split('T')[0];
    console.log('Date range from:', fromDate);

    // Build search query - ONLY search for the specific company name
    // Using quotes for exact phrase matching to get company-specific news
    const query = `"${searchQuery}"`;
    console.log('Full query:', query);

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${fromDate}&sortBy=publishedAt&language=en&pageSize=5&apiKey=${NEWS_API_KEY}`;
    console.log('Fetching from NewsAPI...');

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LeadReport-AI/1.0'
      }
    });

    console.log('NewsAPI Response Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ NewsAPI Error Response:', errorData);

      if (response.status === 429) {
        console.error('❌ NewsAPI rate limit exceeded');
        return { articles: [], totalResults: 0 };
      }
      if (response.status === 401) {
        console.error('❌ Invalid NewsAPI key');
        return { articles: [], totalResults: 0 };
      }
      throw new Error(`NewsAPI request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ NewsAPI Response:', {
      totalResults: data.totalResults,
      articlesCount: data.articles?.length || 0
    });

    // Format news articles
    const articles = (data.articles || []).slice(0, 5).map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      source: article.source?.name || 'Unknown',
      publishedAt: article.publishedAt,
      urlToImage: article.urlToImage
    }));

    console.log('✅ Formatted articles:', articles.length);
    console.log('=== NEWS FETCH COMPLETE ===');

    return {
      articles,
      totalResults: data.totalResults || 0
    };
  } catch (error) {
    console.error('❌ Error fetching company news:', error);
    // Return empty results on error rather than failing the entire report
    return {
      articles: [],
      totalResults: 0
    };
  }
}

async function generateAIReport(apolloData: ApolloResponse) {
  const personData = apolloData.person || {};
  const org = personData.organization || {};

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
    project: '',
    notes: [],
    engagementTimeline: [],
    status: 'warm',
    tags: [],
    nextFollowUp: null,
    customFields: {},
    // Custom form fields (will be populated from existing report if available)
    leadIndustry: '',
    leadDesignation: '',
    leadBackground: '',
    companyOverview: ''
  };

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
`;

  // Use a faster model for the initial report generation
  const model = "gpt-3.5-turbo";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
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
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('OpenAI API error:', errorData);

      // Check if it's a quota error
      if (errorData?.error?.code === 'insufficient_quota' || response.status === 429) {
        console.warn('⚠️ OpenAI quota exceeded. Creating report without AI enhancement.');
        // Return a basic report without AI enhancement
        return {
          report: reportPrompt,
          leadData: leadData,
          aiGenerationSkipped: true,
          skipReason: 'OpenAI quota exceeded'
        };
      }

      throw new Error("Failed to generate AI report. Please try again later.");
    }

    const data = await response.json();
    return {
      report: data.choices[0].message.content,
      leadData: leadData
    };
  } catch (error) {
    console.error('Error in generateAIReport:', error);
    // Return basic report structure instead of failing
    console.warn('⚠️ Falling back to basic report structure due to error');
    return {
      report: reportPrompt,
      leadData: leadData,
      aiGenerationSkipped: true,
      skipReason: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function initiateReport(formData: FormData) {
  const email = formData.get("email") as string
  const reportOwnerName = formData.get("reportOwnerName") as string
  const meetingDate = formData.get("meetingDate") as string
  const meetingTime = formData.get("meetingTime") as string
  const meetingTimezone = formData.get("meetingTimezone") as string
  const meetingPlatform = formData.get("meetingPlatform") as string
  const meetingLink = formData.get("meetingLink") as string
  const meetingLocation = formData.get("meetingLocation") as string
  const meetingName = formData.get("meetingName") as string
  const meetingObjective = formData.get("meetingObjective") as string
  const problemPitch = formData.get("problemPitch") as string
  const project = formData.get("project") as string
  const leadIndustry = formData.get("leadIndustry") as string
  const leadDesignation = formData.get("leadDesignation") as string
  const leadBackground = formData.get("leadBackground") as string
  const companyOverview = formData.get("companyOverview") as string
  const initialNote = formData.get("initialNote") as string
  const initialActivity = formData.get("initialActivity") as string

  if (!email || !email.includes('@')) {
    throw new Error("Please provide a valid email address")
  }

  if (!reportOwnerName || reportOwnerName.trim() === '') {
    throw new Error("Please provide your name as the report owner")
  }

  // Check user permissions for the project
  const { getCurrentUser, canAccessProject } = await import('@/lib/auth');
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be logged in to create reports")
  }

  // Handle empty project name
  const projectName = project && project.trim() !== '' ? project : 'Unassigned';

  // Validate project access for project_user role
  if (user.role === 'project_user' && projectName !== 'Unassigned') {
    if (!canAccessProject(user, projectName)) {
      throw new Error(`You don't have permission to create reports for the project: ${projectName}`)
    }
  }

  const { reports } = await getDb()

  // Create initial notes array (internal notes for team)
  const initialNotes = [];
  if (initialNote && initialNote.trim() !== '') {
    initialNotes.push({
      id: crypto.randomUUID(),
      content: initialNote.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Create initial engagement timeline entry (activity tracking)
  const initialTimeline = [];
  if (initialActivity && initialActivity.trim() !== '') {
    initialTimeline.push({
      id: crypto.randomUUID(),
      type: 'note',
      content: initialActivity.trim(),
      createdAt: new Date()
    });
  }

  // Create an initial report entry
  const initialReport = {
    email,
    reportOwnerName,
    apolloData: { person: {} },
    report: "",
    leadData: {
      name: "",
      position: "",
      companyName: "",
      photo: null,
      contactDetails: { email: "", phone: "", linkedin: "" },
      companyDetails: { industry: "", employees: "", headquarters: "", website: "" },
      leadScoring: { rating: "", score: 88, qualificationCriteria: {} },
      project: projectName,
      leadIndustry: leadIndustry || "",
      leadDesignation: leadDesignation || "",
      leadBackground: leadBackground || "",
      companyOverview: companyOverview || "",
      notes: initialNotes,
      engagementTimeline: initialTimeline
    },
    meetingDate,
    meetingTime,
    meetingTimezone,
    meetingPlatform,
    meetingLink,
    meetingLocation,
    meetingName,
    meetingObjective,
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
  const { reports } = await getDb();

  try {
    // Get the existing report to preserve meeting details and project
    const existingReport = await reports.findOne({ _id: new ObjectId(reportId) });

    if (!existingReport) {
      throw new Error(`Report with ID ${reportId} not found`);
    }

    // Step 1: Fetch Apollo Data and Company News in parallel
    console.log(`Fetching Apollo data and company news for ${email}`);
    let apolloData;
    let companyNews;
    try {
      apolloData = await fetchApolloData(email);

      // Fetch company news in parallel (don't let it block the report if it fails)
      const companyName = apolloData?.person?.organization?.name;
      const industry = apolloData?.person?.organization?.industry;

      if (companyName && companyName !== 'N/A') {
        console.log(`Fetching news for company: ${companyName}`);
        companyNews = await fetchCompanyNews(companyName, industry);
      } else {
        companyNews = { articles: [], totalResults: 0 };
      }

      await reports.updateOne(
        { _id: new ObjectId(reportId) },
        {
          $set: {
            apolloData,
            companyNews,
            status: "fetching_apollo",
            // Preserve all meeting details and form data
            reportOwnerName: existingReport?.reportOwnerName,
            meetingDate: existingReport?.meetingDate,
            meetingTime: existingReport?.meetingTime,
            meetingTimezone: existingReport?.meetingTimezone,
            meetingPlatform: existingReport?.meetingPlatform,
            meetingLink: existingReport?.meetingLink,
            meetingLocation: existingReport?.meetingLocation,
            meetingName: existingReport?.meetingName,
            meetingObjective: existingReport?.meetingObjective,
            problemPitch: existingReport?.problemPitch,
            'leadData.project': existingReport?.leadData?.project || 'N/A',
            'leadData.leadIndustry': existingReport?.leadData?.leadIndustry,
            'leadData.leadDesignation': existingReport?.leadData?.leadDesignation,
            'leadData.leadBackground': existingReport?.leadData?.leadBackground,
            'leadData.companyOverview': existingReport?.leadData?.companyOverview
          }
        }
      );
    } catch (apolloError) {
      console.error(`Apollo data fetch error for ${email}:`, apolloError);
      throw new Error(`Failed to fetch lead data: ${apolloError instanceof Error ? apolloError.message : 'Unknown Apollo error'}`);
    }

    // Step 2: Generate AI Report and AI Content for all sections in parallel
    console.log(`Starting parallel report generation for ${reportId}`);
    try {
      // Start both processes in parallel - don't await yet
      const reportPromise = generateAIReport(apolloData);
      const aiContentPromise = generateAIContentForAllSections(reportId, apolloData.person || {}, apolloData);

      // Wait for both to complete in parallel
      const [reportResult, aiContentResult] = await Promise.allSettled([
        reportPromise,
        aiContentPromise
      ]);

      // Handle report generation result
      let aiReport, leadData, reportGenerationSkipped = false, reportSkipReason = '';

      if (reportResult.status === 'rejected') {
        console.error(`⚠️ Report generation failed: ${reportResult.reason}`);
        // Don't throw - continue with basic report structure
        reportGenerationSkipped = true;
        reportSkipReason = reportResult.reason instanceof Error ? reportResult.reason.message : String(reportResult.reason);

        // Use Apollo data to create a basic report structure
        const personData = apolloData.person || {};
        const org = personData.organization || {};

        leadData = {
          companyName: org.name || 'N/A',
          position: personData.title || 'N/A',
          name: personData.name || 'N/A',
          contactDetails: {
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
            rating: '3',
            score: 88,
            qualificationCriteria: {
              decisionMaker: 'YES',
              viewedSolutionDeck: 'NO',
              haveBudget: 'NO',
              need: 'YES'
            }
          },
          project: '',
          notes: [],
          engagementTimeline: [],
          status: 'warm',
          tags: [],
          nextFollowUp: null,
          customFields: {},
          leadIndustry: '',
          leadDesignation: '',
          leadBackground: '',
          companyOverview: ''
        };

        aiReport = `# ${leadData.name}\n## ${leadData.position} at ${leadData.companyName}\n\n### Profile\nLead information from Apollo.io\n\n*Note: AI-enhanced report could not be generated due to API limitations. Please edit the report manually.*`;
      } else {
        const reportValue = reportResult.value;
        aiReport = reportValue.report;
        leadData = reportValue.leadData;

        if (reportValue.aiGenerationSkipped) {
          reportGenerationSkipped = true;
          reportSkipReason = reportValue.skipReason || 'AI generation skipped';
        }
      }

      // Preserve the project field from the existing report
      const originalProject = existingReport?.leadData?.project;
      leadData.project = originalProject && originalProject.trim() !== '' ? originalProject : 'Unassigned';

      // Preserve notes and engagement timeline from initial form submission
      leadData.notes = existingReport?.leadData?.notes || [];
      leadData.engagementTimeline = existingReport?.leadData?.engagementTimeline || [];

      // Preserve custom form fields (industry, designation, background, company overview)
      leadData.leadIndustry = existingReport?.leadData?.leadIndustry || "";
      leadData.leadDesignation = existingReport?.leadData?.leadDesignation || "";
      leadData.leadBackground = existingReport?.leadData?.leadBackground || "";
      leadData.companyOverview = existingReport?.leadData?.companyOverview || "";

      console.log('Preserving notes:', leadData.notes.length, 'timeline:', leadData.engagementTimeline.length);

      // Prepare update object
      const updateDoc: any = {
        report: aiReport,
        leadData,
        status: "completed",
        // Preserve company news if fetched
        companyNews: companyNews || { articles: [], totalResults: 0 },
        // Preserve all meeting details and form data
        reportOwnerName: existingReport?.reportOwnerName,
        meetingDate: existingReport?.meetingDate,
        meetingTime: existingReport?.meetingTime,
        meetingTimezone: existingReport?.meetingTimezone,
        meetingPlatform: existingReport?.meetingPlatform,
        meetingLink: existingReport?.meetingLink,
        meetingLocation: existingReport?.meetingLocation,
        meetingName: existingReport?.meetingName,
        meetingObjective: existingReport?.meetingObjective,
        problemPitch: existingReport?.problemPitch
      };

      // Add AI content if it was generated successfully
      if (aiContentResult.status === 'fulfilled' && aiContentResult.value) {
        updateDoc.aiContent = aiContentResult.value;
      } else if (aiContentResult.status === 'rejected') {
        const errorReason = aiContentResult.reason instanceof Error
          ? aiContentResult.reason.message
          : String(aiContentResult.reason);

        console.error(`AI content generation error for ${reportId}:`, errorReason);
        updateDoc.aiContentError = errorReason;

        // Check if it's a quota error and add a user-friendly message
        if (errorReason.includes('insufficient_quota') || errorReason.includes('quota')) {
          updateDoc.aiContentError = '⚠️ OpenAI API quota exceeded. AI insights are not available. You can manually edit the report or regenerate when quota is restored.';
        }
      }

      // Add warnings if AI generation was skipped
      if (reportGenerationSkipped) {
        updateDoc.reportGenerationWarning = `⚠️ AI report enhancement skipped: ${reportSkipReason}`;
      }

      // Single database update with all data
      await reports.updateOne(
        { _id: new ObjectId(reportId) },
        { $set: updateDoc }
      );
    } catch (reportGenError) {
      console.error(`Report generation error for ${reportId}:`, reportGenError);
      throw new Error(`Failed to generate report: ${reportGenError instanceof Error ? reportGenError.message : 'Unknown generation error'}`);
    }
  } catch (error) {
    console.error('Error processing report:', error);
    // Update the report with the error status
    await reports.updateOne(
      { _id: new ObjectId(reportId) },
      {
        $set: {
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error"
        }
      }
    );
  }
}

// Function to generate AI content for all sections of a report
async function generateAIContentForAllSections(reportId: string, leadData: any, apolloData: any) {
  console.log(`Automatically generating AI content for report: ${reportId}`);

  // Define the sections to generate content for
  const sections = ['overview', 'company', 'meeting', 'interactions', 'competitors', 'techStack', 'news', 'nextSteps'];

  try {
    // Import the shared AI generation function
    const { generateBatchAIContent } = await import('@/lib/ai-content-generator');

    // Call the shared function directly - no HTTP request needed!
    console.log(`Generating AI content for ${sections.length} sections`);
    const newContent = await generateBatchAIContent(sections, leadData, apolloData);
    console.log(`Successfully generated AI content for all sections`);

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
    // Try to update the report to indicate the error in AI content generation
    try {
      const { reports } = await getDb();
      await reports.updateOne(
        { _id: new ObjectId(reportId) },
        {
          $set: {
            aiContentError: error instanceof Error ? error.message : "Unknown error generating AI content"
          }
        }
      );
    } catch (dbError) {
      console.error('Failed to update report with AI content error:', dbError);
    }
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
  const { getCurrentUser } = await import('@/lib/auth');
  const userToken = await getCurrentUser();

  // Fetch fresh user data from database to ensure permissions are up to date
  let user = null;
  if (userToken?.userId) {
    try {
      const { db } = await getDb();
      if (db) {
        user = await db.collection('users').findOne({ _id: new ObjectId(userToken.userId) });
      }
    } catch (error) {
      console.error('Error fetching fresh user data:', error);
      // Fallback to token data if DB fetch fails
      user = userToken;
    }
  }

  const { reports } = await getDb()
  const allReports = await reports.find({}).sort({ createdAt: -1 }).toArray()

  // Transform the data to match the expected interface
  const transformedReports = allReports.map(report => {
    // Handle project field more robustly
    let project = report.leadData?.project;
    if (!project || project.trim() === '' || project === 'N/A' || project === 'NA') {
      project = 'Unassigned'; // Provide a default value instead of 'N/A'
    } else {
      project = project.trim();
    }

    return {
      _id: report._id.toString(),
      email: report.email || '',
      reportOwnerName: report.reportOwnerName || undefined,
      createdAt: report.createdAt ? new Date(report.createdAt).toISOString() : new Date().toISOString(),
      isCompleted: report.status === 'completed',
      meetingDate: report.meetingDate || undefined,
      meetingPlatform: report.meetingPlatform || undefined,
      companyName: report.leadData?.companyName || report.companyName || '',
      leadData: {
        name: report.leadData?.name || '',
        companyName: report.leadData?.companyName || report.companyName || '',
        project: project,
        status: report.leadData?.status || 'warm'
      }
    };
  });

  // Filter reports based on user role and assigned projects
  // Check against the fresh user object from DB (or fallback to token)
  const role = user?.role || userToken?.role;

  if (role === 'project_user') {
    const assignedProjects = user?.assignedProjects || userToken?.assignedProjects || [];
    console.log(`Filtering reports for project_user ${userToken?.email}. Assigned projects:`, assignedProjects);

    return transformedReports.filter(report => {
      const reportProject = report.leadData?.project;
      const hasAccess = reportProject && assignedProjects.includes(reportProject);
      return hasAccess;
    });
  }

  // Admins see all reports
  return transformedReports;
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

