import type { CertificationFitResponse } from "@/lib/types";

export type CertificationGuidance = {
  level: CertificationFitResponse["recommendedTrack"];
  title: string;
  suitableFor: string[];
  strongSignals: string[];
  cautionSignals: string[];
  baselineRequirements: string[];
  annualMaintenance: string[];
  authoritySummary: string;
  sourceUrls: string[];
};

export const CERTIFICATION_GUIDANCE: CertificationGuidance[] = [
  {
    level: "CALC",
    title: "Certified Action Learning Coach",
    suitableFor: [
      "Professionals entering formal WIAL certification",
      "Internal or external coaches who want to help teams solve problems and develop using Action Learning",
      "Applicants who have completed or are ready to complete foundational WIAL coursework and supervised practice"
    ],
    strongSignals: [
      "Early-stage Action Learning practice",
      "Team facilitation, workshops, reflection sessions, or leadership development background",
      "Interest in becoming a certified Action Learning coach without evidence of advanced WIAL teaching or certification leadership"
    ],
    cautionSignals: [
      "Do not treat CALC as a thought-leadership or train-the-trainer level",
      "Applicants still need the required WIAL coursework and coaching-session evidence"
    ],
    baselineRequirements: [
      "Participate in Foundations and/or finish the e-learning course",
      "Participate in CALC workshop",
      "Complete at least 5 WIAL Talk scenarios",
      "Complete at least two 90-minute sessions, with at least one getting to solution"
    ],
    annualMaintenance: [
      "Submit proof of Action Learning hours",
      "Participate in one WIAL activity",
      "Renew every 2 years"
    ],
    authoritySummary:
      "WIAL positions CALC as the foundational certification for coaching Action Learning sessions.",
    sourceUrls: [
      "https://wial.org/certification/",
      "https://wial.org/certification/certified-action-learning-coach/"
    ]
  },
  {
    level: "PALC",
    title: "Professional Action Learning Coach",
    suitableFor: [
      "Existing CALCs with meaningful documented WIAL coaching practice",
      "Coaches who want to deepen professional coaching capability more than teach the full certification pathway",
      "Applicants with a long-term Action Learning project and observed delivery of Intro to Action Learning or Leading with Questions"
    ],
    strongSignals: [
      "Documented Action Learning coaching hours, especially 100+ hours",
      "Multi-session or long-term Action Learning projects",
      "Observed facilitation of Intro to Action Learning or Leading with Questions",
      "Seasoned coaching practice without strong evidence of leading all certification programs"
    ],
    cautionSignals: [
      "PALC assumes the applicant is already a CALC or operating at an equivalent certified level",
      "PALC is not the best fit when the profile is mostly entry-level or mostly thought leadership without coaching depth"
    ],
    baselineRequirements: [
      "Eligibility starts from CALC",
      "100 documented hours of Action Learning work, including at least 50 WIAL coaching hours",
      "At least one longer-term project spanning weeks or months",
      "Lead Leading with Questions or Introduction to Action Learning observed by a SALC or MALC",
      "Submit documented hours, project learnings, application, and mentor recommendation"
    ],
    annualMaintenance: [
      "Submit proof of at least 10 Action Learning hours during the prior two years",
      "Complete at least two WIAL volunteer or continuing-education activities",
      "Renew every 2 years"
    ],
    authoritySummary:
      "WIAL positions PALC as the seasoned professional coach level for CALCs who have proven coaching ability in practice.",
    sourceUrls: [
      "https://wial.org/certification/",
      "https://wial.org/certification/professional-action-learning-coach/",
      "https://wial.org/wp-content/uploads/PALC_Certification_Requirements_V2022.pdf"
    ]
  },
  {
    level: "SALC",
    title: "Senior Action Learning Coach",
    suitableFor: [
      "Experienced CALCs or PALCs who are ready to teach all WIAL certification programs",
      "Applicants who coach teams and also want to teach and develop other Action Learning coaches",
      "Chapter or affiliate builders who can mentor candidates and deliver certification workshops"
    ],
    strongSignals: [
      "100+ documented Action Learning hours with a long-term project",
      "Observed delivery of Foundations and Intensive CALC or equivalent certification courses",
      "Mentoring or certifying other coaches",
      "Clear train-the-trainer orientation, chapter leadership, or affiliate-development capability"
    ],
    cautionSignals: [
      "SALC is not just 'more experience than PALC'; it adds responsibility for teaching certification programs",
      "Applicants without strong evidence of training, mentoring, or observed course leadership are usually not SALC-ready"
    ],
    baselineRequirements: [
      "Eligibility starts from CALC or PALC with 100 documented Action Learning hours",
      "Include at least one longer-term project with a minimum of four 90-minute sessions",
      "Lead the three two-day workshops or intensive with a Master Coach observing",
      "Use and explain the certification instrument, give participant feedback, and mentor at least one participant to CALC",
      "Submit application, project learnings, observed-course evidence, and committee review materials"
    ],
    annualMaintenance: [
      "Submit proof of at least 10 WIAL Action Learning hours during the prior two years",
      "Complete at least three WIAL volunteer and/or continuing-education activities",
      "Lead at least one Foundations, CALC, or Intensive program",
      "Mentor two qualified CALCs or certify one CALC candidate successfully",
      "Review certification papers and renew every 2 years"
    ],
    authoritySummary:
      "WIAL positions SALC as the level cleared to lead all WIAL certification programs and mentor developing coaches.",
    sourceUrls: [
      "https://wial.org/certification/",
      "https://wial.org/certification/senior-action-learning-coach/",
      "https://wial.org/wp-content/uploads/SALC_Certification_Requirements_V2022.pdf"
    ]
  },
  {
    level: "MALC",
    title: "Master Action Learning Coach",
    suitableFor: [
      "Established SALCs with extensive Action Learning coaching, training, or consulting depth",
      "Applicants who are recognized thought leaders in the WIAL method",
      "Senior practitioners with significant publishing, presenting, mentoring, and field contribution"
    ],
    strongSignals: [
      "500+ documented hours across Action Learning coaching, training, or consulting",
      "Existing SALC-level practice",
      "Regional or broader conference presenting",
      "Published articles, thesis work, book chapters, or books related to Action Learning",
      "Ongoing contribution to WIAL social media, newsletter, mentoring, and certification review"
    ],
    cautionSignals: [
      "MALC is not a next-step recommendation for most applicants unless the profile clearly shows advanced WIAL thought leadership",
      "Strong leadership experience alone is not enough without deep Action Learning evidence and field contribution"
    ],
    baselineRequirements: [
      "Eligibility starts from SALC",
      "500 documented hours in Action Learning coaching and/or training and/or consulting, with at least 250 WIAL coaching hours",
      "Hours must reflect diverse clients and projects",
      "Noted conference presenting and publication outside WIAL materials",
      "Regular contribution to WIAL social media and/or newsletter",
      "Sponsorship by a MALC and certification committee review"
    ],
    annualMaintenance: [
      "Submit proof of at least 10 WIAL Action Learning hours during the prior two years",
      "Complete at least four WIAL volunteer and/or continuing-education activities",
      "Lead at least one WIAL program",
      "Mentor two qualified CALCs or certify one CALC candidate successfully",
      "Submit at least one publication and one presentation",
      "Review certification papers and renew every 2 years"
    ],
    authoritySummary:
      "WIAL positions MALC as the thought-leader tier for SALCs with extensive practice, publication, presentation, and mentoring impact.",
    sourceUrls: [
      "https://wial.org/certification/",
      "https://wial.org/certification/master-action-learning-coach/",
      "https://wial.org/wp-content/uploads/MALC_Certification_Requirements_V2022.pdf"
    ]
  }
];

export function getCertificationGuidance(level: CertificationFitResponse["recommendedTrack"]) {
  return CERTIFICATION_GUIDANCE.find((entry) => entry.level === level) || CERTIFICATION_GUIDANCE[0];
}
