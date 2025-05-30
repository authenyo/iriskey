/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { summaly } from '@transfem-org/summaly';
import { SummalyResult } from '@transfem-org/summaly/built/summary.js';
import * as Redis from 'ioredis';
import { DI } from '@/di-symbols.js';
import type { Config } from '@/config.js';
import { HttpRequestService } from '@/core/HttpRequestService.js';
import type Logger from '@/logger.js';
import { query } from '@/misc/prelude/url.js';
import { LoggerService } from '@/core/LoggerService.js';
import { bindThis } from '@/decorators.js';
import { ApiError } from '@/server/api/error.js';
import { MiMeta } from '@/models/Meta.js';
import { RedisKVCache } from '@/misc/cache.js';
import { UtilityService } from '@/core/UtilityService.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class UrlPreviewService {
	private logger: Logger;
	private previewCache: RedisKVCache<SummalyResult>;

	constructor(
		@Inject(DI.config)
		private config: Config,

		@Inject(DI.redis)
		private redisClient: Redis.Redis,

		@Inject(DI.meta)
		private meta: MiMeta,

		private httpRequestService: HttpRequestService,
		private loggerService: LoggerService,
		private utilityService: UtilityService,
	) {
		this.logger = this.loggerService.getLogger('url-preview');
		this.previewCache = new RedisKVCache<SummalyResult>(this.redisClient, 'summaly', {
			lifetime: 1000 * 60 * 60 * 24, // 1d
			memoryCacheLifetime: 1000 * 60 * 10, // 10m
			fetcher: () => { throw new Error('the UrlPreview cache should never fetch'); },
			toRedisConverter: (value) => JSON.stringify(value),
			fromRedisConverter: (value) => JSON.parse(value),
		});
	}

	@bindThis
	private wrap(url?: string | null): string | null {
		return url != null
			? `${this.config.mediaProxy}/preview.webp?${query({
				url,
				preview: '1',
			})}`
			: null;
	}

	@bindThis
	public async handle(
		request: FastifyRequest<{ Querystring: { url: string; lang?: string; } }>,
		reply: FastifyReply,
	): Promise<object | undefined> {
		const url = request.query.url;
		if (typeof url !== 'string' || !URL.canParse(url)) {
			reply.code(400);
			return;
		}

		const lang = request.query.lang;
		if (Array.isArray(lang)) {
			reply.code(400);
			return;
		}

		if (!this.meta.urlPreviewEnabled) {
			reply.code(403);
			return {
				error: new ApiError({
					message: 'URL preview is disabled',
					code: 'URL_PREVIEW_DISABLED',
					id: '58b36e13-d2f5-0323-b0c6-76aa9dabefb8',
				}),
			};
		}

		const host = new URL(url).host;
		if (this.utilityService.isBlockedHost(this.meta.blockedHosts, host)) {
			reply.code(403);
			return {
				error: new ApiError({
					message: 'URL is blocked',
					code: 'URL_PREVIEW_BLOCKED',
					id: '50294652-857b-4b13-9700-8e5c7a8deae8',
				}),
			};
		}

		const key = `${url}@${lang}`;
		const cached = await this.previewCache.get(key);
		if (cached !== undefined) {
			this.logger.info(`Returning cache preview of ${key}`);
			// Cache 7days
			reply.header('Cache-Control', 'max-age=604800, immutable');

			return cached;
		}

		this.logger.info(this.meta.urlPreviewSummaryProxyUrl
			? `(Proxy) Getting preview of ${key} ...`
			: `Getting preview of ${key} ...`);

		try {
			const summary = this.meta.urlPreviewSummaryProxyUrl
				? await this.fetchSummaryFromProxy(url, this.meta, lang)
				: await this.fetchSummary(url, this.meta, lang);

			this.logger.succ(`Got preview of ${url}: ${summary.title}`);

			if (!(summary.url.startsWith('http://') || summary.url.startsWith('https://'))) {
				throw new Error('unsupported schema included');
			}

			if (summary.player.url && !(summary.player.url.startsWith('http://') || summary.player.url.startsWith('https://'))) {
				throw new Error('unsupported schema included');
			}

			summary.icon = this.wrap(summary.icon);
			summary.thumbnail = this.wrap(summary.thumbnail);

			this.previewCache.set(key, summary);

			// Cache 7days
			reply.header('Cache-Control', 'max-age=604800, immutable');

			return summary;
		} catch (err) {
			this.logger.warn(`Failed to get preview of ${url}: ${err}`);

			reply.code(422);
			reply.header('Cache-Control', 'max-age=86400, immutable');
			return {
				error: new ApiError({
					message: 'Failed to get preview',
					code: 'URL_PREVIEW_FAILED',
					id: '09d01cb5-53b9-4856-82e5-38a50c290a3b',
				}),
			};
		}
	}

	private fetchSummary(url: string, meta: MiMeta, lang?: string): Promise<SummalyResult> {
		const agent = this.config.proxy
			? {
				http: this.httpRequestService.httpAgent,
				https: this.httpRequestService.httpsAgent,
			}
			: undefined;

		return summaly(url, {
			followRedirects: false,
			lang: lang ?? 'ja-JP',
			agent: agent,
			userAgent: meta.urlPreviewUserAgent ?? undefined,
			operationTimeout: meta.urlPreviewTimeout,
			contentLengthLimit: meta.urlPreviewMaximumContentLength,
			contentLengthRequired: meta.urlPreviewRequireContentLength,
		});
	}

	private fetchSummaryFromProxy(url: string, meta: MiMeta, lang?: string): Promise<SummalyResult> {
		const proxy = meta.urlPreviewSummaryProxyUrl!;
		const queryStr = query({
			url: url,
			lang: lang ?? 'ja-JP',
			userAgent: meta.urlPreviewUserAgent ?? undefined,
			operationTimeout: meta.urlPreviewTimeout,
			contentLengthLimit: meta.urlPreviewMaximumContentLength,
			contentLengthRequired: meta.urlPreviewRequireContentLength,
		});

		return this.httpRequestService.getJson<SummalyResult>(`${proxy}?${queryStr}`, 'application/json, */*', undefined, true);
	}
}
