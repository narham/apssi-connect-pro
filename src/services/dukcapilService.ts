/**
 * DUKCAPIL API Integration Service
 * Civil Registry Validation Layer for APSSI CONNECT
 * Purpose: Validate player identity against Indonesian National Population Database
 */

export type DukcapilMatchStatus = "VALID MATCH" | "PARTIAL MATCH" | "NO MATCH";

export interface DukcapilValidationRequest {
  nik: string;
  fullName: string;
  dob: string;
  parentName: string;
  familyCardNumber: string;
  placeOfBirth: string;
}

export interface DukcapilValidationResult {
  status: DukcapilMatchStatus;
  score: number; // 0-100
  details: {
    nikMatch: boolean;
    nameMatch: boolean;
    dobMatch: boolean;
    parentMatch: boolean;
    kkMatch: boolean;
    placeMatch: boolean;
  };
  lastChecked: string;
}

/**
 * Simple string similarity calculator (Levenshtein Distance based)
 * Returns a score between 0 and 1
 */
const calculateStringSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const track = Array(s2.length + 1).fill(null).map(() =>
    Array(s1.length + 1).fill(null));
  for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;
  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator,
      );
    }
  }
  const distance = track[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);
  return (maxLength - distance) / maxLength;
};

/**
 * Simulates DUKCAPIL API validation with weighted scoring
 * Primary Validation Target: Name, DOB, Birthplace, Parent Name
 */
export const validateWithDukcapil = async (data: DukcapilValidationRequest): Promise<DukcapilValidationResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // In a real scenario, these would come from the DUKCAPIL response
  // Here we simulate the "Registry Record" to compare against
  const registryRecord = {
    fullName: data.fullName, // 100% match simulation by default for mock
    dob: data.dob,
    placeOfBirth: data.placeOfBirth,
    parentName: data.parentName,
    nik: data.nik,
    familyCardNumber: data.familyCardNumber
  };

  // 1. Calculate Field Match Scores (0-1)
  const nameScore = calculateStringSimilarity(data.fullName, registryRecord.fullName);
  const dobScore = data.dob === registryRecord.dob ? 1 : 0;
  const placeScore = calculateStringSimilarity(data.placeOfBirth, registryRecord.placeOfBirth);
  const parentScore = calculateStringSimilarity(data.parentName, registryRecord.parentName);

  // 2. Weighted Total Score (0-100)
  // Rule: Name(30%), DOB(30%), Birthplace(20%), Parent Name(20%)
  const finalScore = Math.round(
    (nameScore * 30) + 
    (dobScore * 30) + 
    (placeScore * 20) + 
    (parentScore * 20)
  );

  // 3. Determine Status based on Score Rules
  // 100 = Exact Match
  // 70–99 = Partial Match
  // Below 70 = Mismatch
  let status: DukcapilMatchStatus = "NO MATCH";
  if (finalScore === 100) status = "VALID MATCH";
  else if (finalScore >= 70) status = "PARTIAL MATCH";

  return {
    status,
    score: finalScore,
    details: {
      nikMatch: data.nik.length === 16,
      nameMatch: nameScore > 0.9,
      dobMatch: dobScore === 1,
      parentMatch: parentScore > 0.9,
      kkMatch: data.familyCardNumber.length === 16,
      placeMatch: placeScore > 0.9,
    },
    lastChecked: new Date().toISOString(),
  };
};
