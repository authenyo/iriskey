/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import type { RetentionAggregationsRepository } from '@/models/_.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { DI } from '@/di-symbols.js';

export const meta = {
	tags: ['users'],

	requireCredential: false,

	res: {
		type: 'array',
		items: {
			type: 'object',
			properties: {
				createdAt: {
					type: 'string',
					format: 'date-time',
				},
				users: {
					type: 'number',
				},
				data: {
					type: 'object',
					additionalProperties: {
						anyOf: [{
							type: 'number',
						}],
					},
				},
			},
			required: [
				'createdAt',
				'users',
				'data',
			],
		},
	},

	allowGet: true,
	cacheSec: 60 * 60,

	// 2 calls per second
	limit: {
		duration: 1000,
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
		@Inject(DI.retentionAggregationsRepository)
		private retentionAggregationsRepository: RetentionAggregationsRepository,
	) {
		super(meta, paramDef, async (ps, me) => {
			const records = await this.retentionAggregationsRepository.find({
				order: {
					id: 'DESC',
				},
				take: 30,
			});

			return records.map(record => ({
				createdAt: record.createdAt.toISOString(),
				users: record.usersCount,
				data: record.data,
			}));
		});
	}
}
