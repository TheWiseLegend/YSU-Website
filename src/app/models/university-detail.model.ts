// src/app/models/university-detail.model.ts

export interface UniversityDetail {
    id: string;
    name: string;
    englishName: string;
    logo: string;
    location: {
      city: string;
      state?: string;
    };
    type: string; 
    website: string;
  
    // Overview Section
    description: string;
    history: string;
  
    // Why This University
    specialPoints: string[];
    awards?: string[];
    successStories?: string[];
  
    // Academic Info
    faculties: string[];
    courses: { name: string; fee: number }[];
    languages: string[];
  
    // Statistics
    totalStudents?: number;
    internationalStudents?: number;
    facultyCount?: number;
    studentToTeacherRatio?: string;
    graduateEmploymentRate?: string;
  
    // Ranking & Recognition
    ranking: { 
      malaysia?: number; 
      world?: number 
    };
    accreditations?: string[];
    affiliations?: string[];
  }
  
  export interface UniversityDetailMap {
    [key: string]: UniversityDetail;
  }