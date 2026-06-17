import { HunterPick } from '../types';
import { salesforceMCP } from './salesforceMCP';

/**
 * Logs an activity to Salesforce (Real if configured, otherwise Mock)
 */
export const logSalesforceActivity = async (contactName: string, company: string, type: 'Email' | 'LinkedIn', subject: string) => {
  console.log(`[Salesforce] Logging ${type} activity for ${contactName} at ${company}: ${subject}`);
  
  const apiKey = import.meta.env.VITE_SALESFORCE_API_KEY;
  
  if (apiKey) {
    try {
      // In a real MCP setup, we might have a specific tool for this
      // For now, we try to call a generic activity logging tool or just log to console if it fails
      await salesforceMCP.callTool('create_activity', {
        contact: contactName,
        account: company,
        type,
        subject,
        timestamp: new Date().toISOString()
      });
      return;
    } catch (error) {
      console.warn('Real Salesforce sync failed, falling back to mock behavior', error);
    }
  }

  // Fallback to mock
  return new Promise((resolve) => setTimeout(resolve, 500));
};

/**
 * Opens Gmail compose window in the browser
 */
export const openGmail = (to: string, subject: string, body: string) => {
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(gmailUrl, '_blank');
};

/**
 * Handles the full email outreach flow
 */
export const handleEmailOutreach = async (contactName: string, company: string, email: string, subject: string, body: string) => {
  // 1. Log to Salesforce
  await logSalesforceActivity(contactName, company, 'Email', subject);
  
  // 2. Open Gmail
  openGmail(email, subject, body);
};

/**
 * Handles LinkedIn outreach flow
 */
export const handleLinkedInOutreach = async (contactName: string, company: string, message: string) => {
  // 1. Log to Salesforce
  await logSalesforceActivity(contactName, company, 'LinkedIn', 'LinkedIn Outreach');
  
  // 2. Copy to clipboard (LinkedIn doesn't have a direct "compose" URL that populates the message easily for personal profiles)
  await navigator.clipboard.writeText(message);
  
  // 3. Open LinkedIn (Search for the person or just open LinkedIn)
  const searchUrl = `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(`${contactName} ${company}`)}`;
  window.open(searchUrl, '_blank');
};
