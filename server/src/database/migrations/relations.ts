import { relations } from "drizzle-orm/relations";
import { users, userSettings, localAuth, favorites, playlists, playlistItems, screenshots, auditLogs, playbackHistory, authIdentities, driveConnections } from "./schema";

export const userSettingsRelations = relations(userSettings, ({one}) => ({
	user: one(users, {
		fields: [userSettings.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	userSettings: many(userSettings),
	localAuths: many(localAuth),
	favorites: many(favorites),
	playlists: many(playlists),
	screenshots: many(screenshots),
	auditLogs: many(auditLogs),
	playbackHistories: many(playbackHistory),
	authIdentities: many(authIdentities, {
		relationName: "authIdentities_userId_users_id"
	}),
	driveConnections: many(driveConnections, {
		relationName: "driveConnections_userId_users_id"
	}),
}));

export const localAuthRelations = relations(localAuth, ({one}) => ({
	user: one(users, {
		fields: [localAuth.userId],
		references: [users.id]
	}),
}));

export const favoritesRelations = relations(favorites, ({one}) => ({
	user: one(users, {
		fields: [favorites.userId],
		references: [users.id]
	}),
}));

export const playlistsRelations = relations(playlists, ({one, many}) => ({
	user: one(users, {
		fields: [playlists.userId],
		references: [users.id]
	}),
	playlistItems: many(playlistItems),
}));

export const playlistItemsRelations = relations(playlistItems, ({one}) => ({
	playlist: one(playlists, {
		fields: [playlistItems.playlistId],
		references: [playlists.id]
	}),
}));

export const screenshotsRelations = relations(screenshots, ({one}) => ({
	user: one(users, {
		fields: [screenshots.userId],
		references: [users.id]
	}),
}));

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	user: one(users, {
		fields: [auditLogs.userId],
		references: [users.id]
	}),
}));

export const playbackHistoryRelations = relations(playbackHistory, ({one}) => ({
	user: one(users, {
		fields: [playbackHistory.userId],
		references: [users.id]
	}),
}));

export const authIdentitiesRelations = relations(authIdentities, ({one}) => ({
	user: one(users, {
		fields: [authIdentities.userId],
		references: [users.id],
		relationName: "authIdentities_userId_users_id"
	}),
}));

export const driveConnectionsRelations = relations(driveConnections, ({one}) => ({
	user: one(users, {
		fields: [driveConnections.userId],
		references: [users.id],
		relationName: "driveConnections_userId_users_id"
	}),
}));