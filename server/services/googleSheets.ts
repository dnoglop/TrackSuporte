// server/services/googleSheets.ts

import { google } from "googleapis";

const SPREADSHEET_ID = "1qVujmgQ6yjpLKkfmfqZaCGa-mMlExgPSJLN9WY-bxx8";

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
    const serviceAccountKey = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      throw new Error(
        "GOOGLE_SHEETS_SERVICE_ACCOUNT_KEY environment variable is required",
      );
    }
    const credentials = JSON.parse(serviceAccountKey);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    this.sheets = google.sheets({ version: "v4", auth });
  }

  async fetchData(): Promise<GoogleSheetsRow[]> {
    try {
      const metadata = await this.sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });

      const sheetName =
        metadata.data.sheets?.[0]?.properties?.title || "Sheet1";
      const range = `${sheetName}!A:O`;

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return [];
      }

      const dataRows = rows.slice(1);

      return dataRows.map((row: string[]) => ({
        timestamp: row[0] || "",
        email: row[1] || "",
        fullName: row[2] || "",
        phone: row[3] || "",
        userType: row[4] || "",
        program: row[5] || "",
        meetingsCount: row[6] || "0",
        lastMeeting: row[7] || "",
        meetingDuration: row[8] || "0",
        meetingRating: row[9] || "0",
        experience: row[10] || "",
        engagementRating: row[11] || "0",
        comments: row[12] || "",
        additionalComments: row[13] || "",
        aiFeedback: row[14] || "",
      }));
    } catch (error) {
      console.error("Error fetching Google Sheets data:", error);
      throw new Error("Failed to fetch data from Google Sheets");
    }
  }

  async updateAIFeedback(rowIndex: number, feedback: string): Promise<void> {
    try {
      const metadata = await this.sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });
      const sheetName =
        metadata.data.sheets?.[0]?.properties?.title || "Sheet1";
      // A linha do sheet é o índice do array de dados (que começa em 0) + 2.
      // (+1 para pular o cabeçalho, +1 para converter de 0-index para 1-index)
      const range = `${sheetName}!O${rowIndex + 2}`;

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
        valueInputOption: "RAW",
        requestBody: {
          values: [[feedback]],
        },
      });
      console.log(`Feedback atualizado na linha ${rowIndex + 2}`);
    } catch (error) {
      console.error(`Erro ao atualizar linha ${rowIndex + 2}:`, error);
      // Não joga o erro para não parar o loop inteiro em caso de falha em uma linha.
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
