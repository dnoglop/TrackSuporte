import { google } from 'googleapis';

const SPREADSHEET_ID = '1qVujmgQ6yjpLKkfmfqZaCGa-mMlExgPSJLN9WY-bxx8';
const RANGE = 'A:O'; // Use simple range without sheet name

export interface GoogleSheetsRow {
  timestamp: string;
  email: string;
  fullName: string;
  phone: string;
  userType: string;
  program: string;
  meetingsCount: string;
  lastMeeting: string;
  meetingDuration: string;
  meetingRating: string;
  experience: string;
  engagementRating: string;
  comments: string;
  additionalComments: string;
  aiFeedback: string;
}

export class GoogleSheetsService {
  private sheets: any;

  constructor() {
    // Initialize with service account credentials
    const serviceAccountKey = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      throw new Error('GOOGLE_SHEETS_SERVICE_ACCOUNT_KEY environment variable is required');
    }

    const credentials = JSON.parse(serviceAccountKey);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async fetchData(): Promise<GoogleSheetsRow[]> {
    try {
      // First, try to get the spreadsheet metadata to find the correct sheet name
      const metadata = await this.sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });

      const sheetName = metadata.data.sheets?.[0]?.properties?.title || 'Sheet1';
      console.log('Found sheet name:', sheetName);

      // Try the range with the detected sheet name
      const range = `${sheetName}!A:O`;
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log('No data found in spreadsheet');
        return [];
      }

      console.log('Found', rows.length, 'rows in spreadsheet');
      console.log('Header row:', rows[0]);

      // Skip header row and map data
      const dataRows = rows.slice(1);
      return dataRows.map((row: string[]) => ({
        timestamp: row[0] || '',
        email: row[1] || '',
        fullName: row[2] || '',
        phone: row[3] || '',
        userType: row[4] || '',
        program: row[5] || '',
        meetingsCount: row[6] || '0',
        lastMeeting: row[7] || '',
        meetingDuration: row[8] || '0',
        meetingRating: row[9] || '0',
        experience: row[10] || '',
        engagementRating: row[11] || '0',
        comments: row[12] || '',
        additionalComments: row[13] || '',
        aiFeedback: row[14] || '',
      }));
    } catch (error) {
      console.error('Error fetching Google Sheets data:', error);
      throw new Error('Failed to fetch data from Google Sheets');
    }
  }

  async updateAIFeedback(rowIndex: number, feedback: string): Promise<void> {
    try {
      // Get the correct sheet name first
      const metadata = await this.sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });

      const sheetName = metadata.data.sheets?.[0]?.properties?.title || 'Sheet1';
      const range = `${sheetName}!O${rowIndex + 2}`; // +2 because we skip header and arrays are 0-indexed
      
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[feedback]],
        },
      });
      
      console.log(`Updated AI feedback for row ${rowIndex + 2}`);
    } catch (error) {
      console.error('Error updating AI feedback:', error);
      // Don't throw error to prevent blocking the dashboard
      console.log('Continuing without updating AI feedback in sheet...');
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
