import { pgTable, text, serial, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const mentorshipEntries = pgTable("mentorship_entries", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  userType: text("user_type").notNull(), // Mentor or Mentee
  program: text("program").notNull(),
  meetingsCount: integer("meetings_count").notNull(),
  lastMeeting: text("last_meeting").notNull(),
  meetingDuration: integer("meeting_duration").notNull(),
  meetingRating: integer("meeting_rating").notNull(),
  experience: text("experience").notNull(),
  engagementRating: integer("engagement_rating").notNull(),
  comments: text("comments"),
  additionalComments: text("additional_comments"),
  aiFeedback: text("ai_feedback"),
});

export const insertMentorshipEntrySchema = createInsertSchema(mentorshipEntries).omit({
  id: true,
});

export type InsertMentorshipEntry = z.infer<typeof insertMentorshipEntrySchema>;
export type MentorshipEntry = typeof mentorshipEntries.$inferSelect;

// Dashboard data types
export const dashboardFilters = z.object({
  programa: z.string().optional(),
  notaEncontro: z.string().optional(),
});

export type DashboardFilters = z.infer<typeof dashboardFilters>;

export const kpiData = z.object({
  totalRespostas: z.number(),
  duplasAtivas: z.number(),
  mediaEncontros: z.number(),
  duplasAtencao: z.number(),
});

export type KpiData = z.infer<typeof kpiData>;

export const activityData = z.object({
  id: z.string(),
  dupla: z.string(),
  data: z.string(),
  destaque: z.string(),
  pontoAtencao: z.string(),
  feedbackIA: z.string(),
  mentorAvatar: z.string(),
  menteeAvatar: z.string(),
});

export type ActivityData = z.infer<typeof activityData>;

export const chartData = z.object({
  evaluation: z.array(z.object({
    name: z.string(),
    value: z.number(),
  })),
  programFunnel: z.array(z.object({
    stage: z.string(),
    count: z.number(),
    percentage: z.number(),
  })),
  commentsAnalysis: z.array(z.object({
    category: z.string(),
    count: z.number(),
    sentiment: z.enum(['positive', 'neutral', 'negative']),
  })),
  mentorVsMentee: z.array(z.object({
    userType: z.string(),
    averageRating: z.number(),
    count: z.number(),
  })),
});

export type ChartData = z.infer<typeof chartData>;
