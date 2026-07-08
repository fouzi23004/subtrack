import cron from 'node-cron';
import { format } from 'date-fns';
import { db } from '../db/index';
import { users, subscriptions } from '../db/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from '../utils/email-sender';
import { generateExpirationEmail, type ExpirationEmailData } from '../templates/email-templates';

// Track if scheduler is running
let isSchedulerRunning = false;

/**
 * Get all subscriptions expiring today
 */
async function getExpiringSubscriptions(): Promise<any[]> {
  try {
    // Get today's date in YYYY-MM-DD format (matching the database format)
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // Query subscriptions with endDate matching today
    const expiringSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.endDate, todayStr));

    return expiringSubscriptions;
  } catch (error) {
    console.error('Error fetching expiring subscriptions:', error);
    return [];
  }
}

/**
 * Get all user emails from the database
 */
async function getAllUserEmails(): Promise<string[]> {
  try {
    const allUsers = await db
      .select({ email: users.email })
      .from(users);

    return allUsers.map(user => user.email);
  } catch (error) {
    console.error('Error fetching user emails:', error);
    return [];
  }
}

/**
 * Process expiring subscriptions and aggregate data
 */
function aggregateExpirationData(subscriptions: any[]): ExpirationEmailData | null {
  if (subscriptions.length === 0) {
    return null;
  }

  // Group subscriptions by company name and aggregate licences/puces
  const companyMap = new Map<string, { licences: number; puces: number }>();

  subscriptions.forEach(sub => {
    const companyName = sub.entrepriseName || 'Entreprise inconnue';
    const existing = companyMap.get(companyName) || { licences: 0, puces: 0 };

    if (sub.type === 'licence') {
      existing.licences += sub.quantity || 0;
    } else if (sub.type === 'licence_puce') {
      existing.puces += sub.quantity || 0;
    }

    companyMap.set(companyName, existing);
  });

  // Convert map to array and calculate totals
  const companies = Array.from(companyMap.entries()).map(([name, data]) => ({
    name,
    licences: data.licences,
    puces: data.puces,
  }));

  // Sort companies alphabetically
  companies.sort((a, b) => a.name.localeCompare(b.name));

  // Calculate totals
  const totalLicences = companies.reduce((sum, company) => sum + company.licences, 0);
  const totalPuces = companies.reduce((sum, company) => sum + company.puces, 0);

  return {
    date: new Date(),
    companies,
    totalLicences,
    totalPuces,
  };
}

/**
 * Main function to check expiring subscriptions and send notifications
 */
export async function sendExpirationNotificationEmail(): Promise<void> {
  console.log('\n📧 Checking for expiring subscriptions...');

  try {
    // Get subscriptions expiring today
    const expiringSubscriptions = await getExpiringSubscriptions();

    if (expiringSubscriptions.length === 0) {
      console.log('✓ No subscriptions expiring today. No email sent.');
      return;
    }

    console.log(`📊 Found ${expiringSubscriptions.length} subscription(s) expiring today`);

    // Aggregate data
    const emailData = aggregateExpirationData(expiringSubscriptions);

    if (!emailData) {
      console.log('✗ Failed to aggregate subscription data');
      return;
    }

    // Get all user emails
    const recipientEmails = await getAllUserEmails();

    if (recipientEmails.length === 0) {
      console.log('✗ No user emails found in database');
      return;
    }

    console.log(`📬 Sending notification to ${recipientEmails.length} user(s)...`);

    // Generate email content
    const htmlContent = generateExpirationEmail(emailData);
    const subject = `Abonnements expirant aujourd'hui - ${format(new Date(), 'dd/MM/yyyy')}`;

    // Send email to all users
    await sendEmail({
      to: recipientEmails,
      subject,
      html: htmlContent,
    });

    console.log('✓ Expiration notification emails sent successfully!');
    console.log(`  Companies: ${emailData.companies.length}`);
    console.log(`  Total Licences: ${emailData.totalLicences}`);
    console.log(`  Total Puces: ${emailData.totalPuces}`);

  } catch (error) {
    console.error('✗ Failed to send expiration notification:', error);
    throw error;
  }
}

/**
 * Parse time string (HH:mm) and return cron expression
 * @param timeStr Time in format "HH:mm" (e.g., "09:00")
 * @returns Cron expression (e.g., "0 9 * * *")
 */
function parseCronExpression(timeStr: string): string {
  const [hour, minute] = timeStr.split(':').map(Number);

  if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    console.warn(`Invalid time format: ${timeStr}. Using default 09:00`);
    return '0 9 * * *'; // Default to 9:00 AM
  }

  return `${minute} ${hour} * * *`;
}

/**
 * Start the email notification scheduler
 */
export function startEmailNotificationScheduler(): void {
  if (isSchedulerRunning) {
    console.log('⚠️  Email notification scheduler is already running');
    return;
  }

  const notificationTime = process.env.EMAIL_NOTIFICATION_TIME || '09:00';
  const cronExpression = parseCronExpression(notificationTime);

  console.log('\n📅 Starting email notification scheduler...');
  console.log(`   Schedule: ${notificationTime} (${cronExpression})`);
  console.log(`   Timezone: ${process.env.EMAIL_NOTIFICATION_TIMEZONE || 'system default'}`);

  // Schedule the job
  const schedulerOptions: any = {
    scheduled: true,
  };

  // Add timezone if specified
  if (process.env.EMAIL_NOTIFICATION_TIMEZONE) {
    schedulerOptions.timezone = process.env.EMAIL_NOTIFICATION_TIMEZONE;
  }

  cron.schedule(cronExpression, async () => {
    console.log(`\n⏰ Scheduled notification triggered at ${format(new Date(), 'HH:mm:ss')}`);
    try {
      await sendExpirationNotificationEmail();
    } catch (error) {
      console.error('Failed to execute scheduled notification:', error);
    }
  }, schedulerOptions);

  isSchedulerRunning = true;
  console.log('✓ Email notification scheduler started successfully\n');
}

/**
 * Stop the email notification scheduler
 */
export function stopEmailNotificationScheduler(): void {
  if (!isSchedulerRunning) {
    console.log('⚠️  Email notification scheduler is not running');
    return;
  }

  // Note: node-cron doesn't provide a direct way to stop all jobs
  // This function is here for future extensibility
  isSchedulerRunning = false;
  console.log('✓ Email notification scheduler stopped');
}
