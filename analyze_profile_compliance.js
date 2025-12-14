import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simplified specification requirements
const SIMPLIFIED_SPEC = {
  required: {
    agentType: "langgraph_simplified",
    profileVersion: "3.0.0",
    compatibilityMode: "simplified_only"
  },
  requiredFields: {
    personality: { type: "string", minLength: 20, maxLength: 200 },
    goals: { type: "string", minLength: 20, maxLength: 200 }
  },
  forbiddenFields: [
    "purposeCore",
    "behavior"
  ],
  forbiddenNestedStructures: [
    "personality.traits",
    "personality.confidence",
    "personality.adaptability",
    "personality.consistency",
    "motivations",
    "values",
    "ethics",
    "reactiveModes",
    "decisionStyle",
    "learningEnabled",
    "adaptationRate"
  ]
};

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}

function hasNestedProperty(obj, path) {
  return path.split('.').every(key => obj && obj.hasOwnProperty(key) && (obj = obj[key]));
}

function analyzeProfile(profilePath, profileData) {
  const issues = [];
  const compliance = {
    profileName: path.basename(profilePath, '.json'),
    filePath: profilePath,
    isCompliant: true,
    issues: [],
    missingRequired: [],
    hasForbiddenFields: [],
    hasForbiddenStructures: [],
    fieldValidationErrors: []
  };

  // Check required fields
  for (const [field, expectedValue] of Object.entries(SIMPLIFIED_SPEC.required)) {
    if (!profileData.hasOwnProperty(field)) {
      compliance.missingRequired.push(`Missing required field: ${field}`);
      compliance.isCompliant = false;
    } else if (profileData[field] !== expectedValue) {
      compliance.missingRequired.push(`Field ${field} has value "${profileData[field]}" but should be "${expectedValue}"`);
      compliance.isCompliant = false;
    }
  }

  // Check for forbidden top-level fields
  for (const forbiddenField of SIMPLIFIED_SPEC.forbiddenFields) {
    if (profileData.hasOwnProperty(forbiddenField)) {
      compliance.hasForbiddenFields.push(`Contains forbidden field: ${forbiddenField}`);
      compliance.isCompliant = false;
    }
  }

  // Check for forbidden nested structures
  for (const forbiddenPath of SIMPLIFIED_SPEC.forbiddenNestedStructures) {
    if (hasNestedProperty(profileData, forbiddenPath)) {
      compliance.hasForbiddenStructures.push(`Contains forbidden structure: ${forbiddenPath}`);
      compliance.isCompliant = false;
    }
  }

  // Validate required field formats
  for (const [fieldName, requirements] of Object.entries(SIMPLIFIED_SPEC.requiredFields)) {
    // Check for fields inside agentState according to simplified specification
    const agentState = profileData.agentState;
    if (agentState && agentState.hasOwnProperty(fieldName)) {
      const value = agentState[fieldName];
      
      // Check type
      if (typeof value !== requirements.type) {
        compliance.fieldValidationErrors.push(`Field ${fieldName} should be ${requirements.type} but is ${typeof value}`);
        compliance.isCompliant = false;
        continue;
      }

      // Check length constraints
      if (requirements.minLength && value.length < requirements.minLength) {
        compliance.fieldValidationErrors.push(`Field ${fieldName} is too short (${value.length} chars, minimum ${requirements.minLength})`);
        compliance.isCompliant = false;
      }
      
      if (requirements.maxLength && value.length > requirements.maxLength) {
        compliance.fieldValidationErrors.push(`Field ${fieldName} is too long (${value.length} chars, maximum ${requirements.maxLength})`);
        compliance.isCompliant = false;
      }
    } else {
      compliance.missingRequired.push(`Missing required field: ${fieldName}`);
      compliance.isCompliant = false;
    }
  }

  // Also validate that agentState exists and has the required structure
  if (!profileData.hasOwnProperty('agentState')) {
    compliance.missingRequired.push('Missing required agentState structure');
    compliance.isCompliant = false;
  } else {
    const requiredAgentStateFields = ['worldContext', 'personality', 'goals', 'mandate', 'conversation', 'lastAction', 'response'];
    for (const field of requiredAgentStateFields) {
      if (!profileData.agentState.hasOwnProperty(field)) {
        compliance.missingRequired.push(`Missing required agentState field: ${field}`);
        compliance.isCompliant = false;
      }
    }
  }

  // Collect all issues
  compliance.issues = [
    ...compliance.missingRequired,
    ...compliance.hasForbiddenFields,
    ...compliance.hasForbiddenStructures,
    ...compliance.fieldValidationErrors
  ];

  return compliance;
}

function analyzeAllProfiles() {
  const profilesDir = './profiles';
  const results = {
    summary: {
      totalProfiles: 0,
      compliantProfiles: 0,
      nonCompliantProfiles: 0,
      analysisDate: new Date().toISOString()
    },
    profiles: []
  };

  try {
    // Read all files in profiles directory
    const files = fs.readdirSync(profilesDir);
    const profileFiles = files.filter(file => file.endsWith('.json') && !file.startsWith('.'));

    for (const file of profileFiles) {
      const filePath = path.join(profilesDir, file);
      
      try {
        const profileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const compliance = analyzeProfile(filePath, profileData);
        
        results.profiles.push(compliance);
        results.summary.totalProfiles++;
        
        if (compliance.isCompliant) {
          results.summary.compliantProfiles++;
        } else {
          results.summary.nonCompliantProfiles++;
        }
      } catch (error) {
        console.error(`Error reading profile ${file}:`, error.message);
        results.profiles.push({
          profileName: path.basename(file, '.json'),
          filePath: filePath,
          isCompliant: false,
          issues: [`Failed to read or parse profile: ${error.message}`],
          readError: true
        });
        results.summary.totalProfiles++;
        results.summary.nonCompliantProfiles++;
      }
    }

    // Sort profiles by compliance status
    results.profiles.sort((a, b) => {
      if (a.isCompliant === b.isCompliant) return 0;
      return a.isCompliant ? 1 : -1;
    });

  } catch (error) {
    console.error('Error analyzing profiles:', error);
    results.error = error.message;
  }

  return results;
}

function generateReport(results) {
  console.log('\n=== PROFILE COMPLIANCE ANALYSIS REPORT ===\n');
  
  console.log('SUMMARY:');
  console.log(`Total Profiles: ${results.summary.totalProfiles}`);
  console.log(`Compliant: ${results.summary.compliantProfiles}`);
  console.log(`Non-Compliant: ${results.summary.nonCompliantProfiles}`);
  console.log(`Analysis Date: ${results.summary.analysisDate}\n`);

  if (results.summary.nonCompliantProfiles > 0) {
    console.log('NON-COMPLIANT PROFILES:');
    results.profiles
      .filter(p => !p.isCompliant)
      .forEach(profile => {
        console.log(`\n❌ ${profile.profileName}`);
        profile.issues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
      });
  }

  if (results.summary.compliantProfiles > 0) {
    console.log('\nCOMPLIANT PROFILES:');
    results.profiles
      .filter(p => p.isCompliant)
      .forEach(profile => {
        console.log(`✅ ${profile.profileName}`);
      });
  }

  console.log('\n=== END REPORT ===\n');
}

// Main execution
console.log('Analyzing profile compliance with simplified specification...\n');

const results = analyzeAllProfiles();
generateReport(results);

// Save detailed report to JSON file
const reportPath = './profile_compliance_report.json';
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`Detailed report saved to: ${reportPath}`);

export { analyzeProfile, analyzeAllProfiles, SIMPLIFIED_SPEC };