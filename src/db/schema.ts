import { relations } from 'drizzle-orm';
import { integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Define the 'users' table.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(), // Hashed password
  role: text('role').notNull().default('user'), // 'user' | 'admin'
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'revendeurs' table.
export const revendeurs = pgTable('revendeurs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'entreprises' table.
export const entreprises = pgTable('entreprises', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  revendeurId: integer('revendeur_id')
    .references(() => revendeurs.id),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  matriculeFiscale: text('matricule_fiscale'),
  rne: text('rne'),
  rnePdfPath: text('rne_pdf_path'), // Path to RNE PDF file
  patentePdfPath: text('patente_pdf_path'), // Path to Patente PDF file
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'puce_plans' table: the editable list of SIM-card plans (global config).
export const pucePlans = pgTable('puce_plans', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'subscriptions' table.
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  entrepriseId: integer('entreprise_id')
    .references(() => entreprises.id)
    .notNull(),
  entrepriseName: text('entreprise_name').notNull(),
  quantity: integer('quantity').notNull(),
  type: text('type').notNull(), // 'licence' | 'licence_puce'
  endDate: text('end_date').notNull(), // YYYY-MM-DD
  plan: text('plan'), // puce_plans.name — only for 'licence_puce', null otherwise
  phoneNumbers: jsonb('phone_numbers').$type<string[]>(), // only for 'licence_puce'
  isActive: integer('is_active').default(1).notNull(), // 1 = active, 0 = expired/inactive
  isPaid: integer('is_paid').default(0).notNull(), // 1 = paid, 0 = unpaid
  createdAt: timestamp('created_at').defaultNow(),
});

// Define relationships for the 'users' table.
export const usersRelations = relations(users, ({ many }) => ({
  entreprises: many(entreprises),
  subscriptions: many(subscriptions),
  revendeurs: many(revendeurs),
}));

// Define relationships for the 'revendeurs' table.
export const revendeursRelations = relations(revendeurs, ({ one, many }) => ({
  owner: one(users, {
    fields: [revendeurs.userId],
    references: [users.id],
  }),
  entreprises: many(entreprises),
}));

// Define relationships for the 'entreprises' table.
export const entreprisesRelations = relations(entreprises, ({ one, many }) => ({
  owner: one(users, {
    fields: [entreprises.userId],
    references: [users.id],
  }),
  revendeur: one(revendeurs, {
    fields: [entreprises.revendeurId],
    references: [revendeurs.id],
  }),
  subscriptions: many(subscriptions),
}));

// Define relationships for the 'subscriptions' table.
export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  owner: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  entreprise: one(entreprises, {
    fields: [subscriptions.entrepriseId],
    references: [entreprises.id],
  }),
}));
