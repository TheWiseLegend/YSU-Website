export interface University {
    id: string;
    name: string;
    description: string;
    location: string;
    type: 'حكومية' | 'خاصة';
    tuitionFee: number;
    courses: string[]; 
    language: string[]; 
    hasUnionBranch: boolean;
    logo: string; 
  }