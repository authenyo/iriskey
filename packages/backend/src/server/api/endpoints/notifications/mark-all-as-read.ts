/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { NotificationService } from '@/core/NotificationService.js';

export const meta = {
	tags: ['notifications', 'account'],

	requireCredential: true,

	kind: 'write:notifications',

	// 2 calls per 10 seconds
	limit: {
		duration: 1000 * 10,
		max: 2,
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private notificationService: NotificationService,
	) {
		super(meta, paramDef, async (ps, me) => {
			this.notificationService.readAllNotification(me.id, true);
		});
	}
}
