export type CertificationApplicationLevel = "CALC" | "PALC" | "SALC" | "MALC";

export type CertificationApplicationField = {
  id: string;
  label: string;
  type: "text" | "email" | "date" | "textarea";
  required?: boolean;
  placeholder?: string;
  helpText?: string;
};

export type CertificationApplicationSection = {
  title: string;
  description?: string;
  fields: CertificationApplicationField[];
};

export type CertificationApplicationDefinition = {
  level: CertificationApplicationLevel;
  title: string;
  intro: string;
  csvFileName: string;
  sections: CertificationApplicationSection[];
};

const calcSections: CertificationApplicationSection[] = [
  {
    title: "Candidate Details",
    description: "Core applicant information from the CALC template.",
    fields: [
      { id: "candidateName", label: "Candidate name", type: "text", required: true, placeholder: "Full legal name" },
      { id: "candidateEmail", label: "Candidate email", type: "email", required: true, placeholder: "name@example.com" },
      { id: "applicationDate", label: "Application date", type: "date", required: true },
      { id: "wialCountryAffiliate", label: "WIAL country affiliate", type: "text", required: true, placeholder: "WIAL chapter or affiliate name" },
      { id: "countryOfResidence", label: "Country of residence", type: "text", required: true, placeholder: "Country" }
    ]
  },
  {
    title: "Course and Practice Record",
    description: "Document the training and practice background referenced in the template.",
    fields: [
      {
        id: "coursesAndDates",
        label: "Courses and course dates",
        type: "textarea",
        required: true,
        placeholder: "Foundations, CALC1, CALC2, Intensive, and dates completed"
      },
      {
        id: "wialTalkComments",
        label: "WIAL Talk comments",
        type: "textarea",
        placeholder: "Summarize your WIAL Talk work, examples, or related notes"
      },
      {
        id: "candidateReflection",
        label: "Candidate reflection",
        type: "textarea",
        placeholder: "Briefly explain your Action Learning experience and readiness for certification"
      }
    ]
  },
  {
    title: "Supporting Statements",
    description: "These fields mirror the support and commentary areas shown in the template.",
    fields: [
      {
        id: "testimonial",
        label: "Testimonial about Action Learning",
        type: "textarea",
        required: true,
        placeholder: "Client or personal testimonial that WIAL can share on social media"
      },
      {
        id: "sponsorName",
        label: "Sponsor name (SALC/MALC)",
        type: "text",
        placeholder: "Sponsor or mentor name"
      },
      {
        id: "sponsorRecommendation",
        label: "Sponsor recommendation",
        type: "textarea",
        placeholder: "Recommendation or supporting statement from sponsor"
      },
      {
        id: "certificationAdvisorName",
        label: "Certification advisor name",
        type: "text",
        placeholder: "If applicable"
      },
      {
        id: "certificationAdvisorComments",
        label: "Certification advisor comments",
        type: "textarea",
        placeholder: "If applicable"
      },
      {
        id: "nonEnglishPaperNotes",
        label: "Non-English paper notes",
        type: "textarea",
        placeholder: "What went well, what could be better, or translation-related notes if applicable"
      }
    ]
  }
];

export const CERTIFICATION_APPLICATIONS: CertificationApplicationDefinition[] = [
  {
    level: "CALC",
    title: "Certified Action Learning Coach Application",
    intro: "Complete the CALC application using the candidate and support fields reflected in the WIAL template.",
    csvFileName: "calc_certification_applications.csv",
    sections: calcSections
  },
  {
    level: "SALC",
    title: "Senior Action Learning Coach Application",
    intro: "This application uses the same source template structure you provided for SALC.",
    csvFileName: "salc_certification_applications.csv",
    sections: calcSections
  },
  {
    level: "PALC",
    title: "Professional Action Learning Coach Application",
    intro: "Complete the PALC application using the documented requirements, reflection, and mentoring fields from the supplied template.",
    csvFileName: "palc_certification_applications.csv",
    sections: [
      {
        title: "Candidate and Mentor Details",
        fields: [
          { id: "calcName", label: "CALC name", type: "text", required: true, placeholder: "Full name" },
          { id: "dateBecameCalc", label: "Date became CALC", type: "date", required: true },
          { id: "mentorName", label: "Mentor / SALC or MALC", type: "text", required: true, placeholder: "Mentor name" },
          { id: "applicationDate", label: "Application date", type: "date", required: true }
        ]
      },
      {
        title: "Requirements Completion",
        fields: [
          { id: "completion100HoursDate", label: "100 hours completion date", type: "date", required: true },
          { id: "longTermProjectStart", label: "Long-term project start", type: "date", required: true },
          { id: "longTermProjectEnd", label: "Long-term project end", type: "date", required: true },
          { id: "leadIntroOrLwqDate", label: "Lead Intro or LWQ completion date", type: "date" }
        ]
      },
      {
        title: "Reflection and Evidence",
        fields: [
          {
            id: "keyReflectionsAndLearnings",
            label: "Key reflections and learnings",
            type: "textarea",
            required: true,
            placeholder: "Summarize your key reflections and learnings"
          },
          {
            id: "overallLearning",
            label: "Overall learning",
            type: "textarea",
            required: true,
            placeholder: "Describe the main learning from your Action Learning experience"
          },
          {
            id: "coachingSessionDocumentation",
            label: "Action Learning coaching session documentation",
            type: "textarea",
            required: true,
            placeholder: "Provide dates, clients, problems presented, hours, and session notes"
          },
          {
            id: "reflectionPaperSummary",
            label: "Reflection paper summary",
            type: "textarea",
            placeholder: "Background of project, design, results, client learning, and personal reflections"
          }
        ]
      },
      {
        title: "Supporting Material",
        fields: [
          {
            id: "testimonial",
            label: "Social media testimonial",
            type: "textarea",
            placeholder: "Client or personal testimonial for LinkedIn or Facebook"
          },
          {
            id: "mentorComments",
            label: "SALC / MALC comments",
            type: "textarea",
            placeholder: "Comments from mentor or senior reviewer"
          },
          {
            id: "successStory",
            label: "Action Learning success story",
            type: "textarea",
            placeholder: "Optional 500-word success story in place of paper"
          },
          {
            id: "organizationTestimonials",
            label: "Organization testimonials",
            type: "textarea",
            placeholder: "Organization, name, title, and permission-to-use notes"
          }
        ]
      }
    ]
  },
  {
    level: "MALC",
    title: "Master Action Learning Coach Application",
    intro: "Complete the MALC application using the candidate, evidence, and recommendation fields reflected in the supplied template.",
    csvFileName: "malc_certification_applications.csv",
    sections: [
      {
        title: "Candidate Details",
        fields: [
          { id: "salcName", label: "SALC name", type: "text", required: true, placeholder: "Full name" },
          { id: "dateCertifiedAsSalc", label: "Date certified as SALC", type: "date", required: true },
          { id: "applicationDate", label: "Application date", type: "date", required: true }
        ]
      },
      {
        title: "Requirements Completion",
        fields: [
          { id: "hours500Completion", label: "500 hours completion summary", type: "textarea", required: true, placeholder: "Document hours, diverse clients, and project mix" },
          { id: "publications", label: "Publications", type: "textarea", required: true, placeholder: "List articles, chapters, books, theses, or related publications" },
          { id: "presentations", label: "Presentations", type: "textarea", required: true, placeholder: "List conference presentations and thought-leadership activities" }
        ]
      },
      {
        title: "Motivation and Support",
        fields: [
          {
            id: "testimonial",
            label: "Social media testimonial",
            type: "textarea",
            placeholder: "Client or personal testimonial that WIAL can share"
          },
          {
            id: "motivation",
            label: "Why do I want to be a MALC?",
            type: "textarea",
            required: true,
            placeholder: "Explain your motivations for the application"
          },
          {
            id: "malcSupport",
            label: "MALC recommendation / support",
            type: "textarea",
            required: true,
            placeholder: "Support statement, including observations from programs where the applicant co-led"
          },
          {
            id: "lettersOfRecommendation",
            label: "Letters of recommendation summary",
            type: "textarea",
            placeholder: "Summarize the two attached letters of recommendation"
          }
        ]
      }
    ]
  }
];

export function getCertificationApplication(level: string) {
  const normalized = String(level || "").toUpperCase() as CertificationApplicationLevel;
  return CERTIFICATION_APPLICATIONS.find((entry) => entry.level === normalized) || null;
}
