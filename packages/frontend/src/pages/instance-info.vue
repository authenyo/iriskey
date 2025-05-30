<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer v-if="instance" :contentMax="600" :marginMin="16" :marginMax="32">
		<MkHorizontalSwipe v-model:tab="tab" :tabs="headerTabs">
			<div v-if="tab === 'overview'" key="overview" class="_gaps_m">
				<div class="fnfelxur">
					<img :src="faviconUrl" alt="" class="icon"/>
					<span class="name">{{ instance.name || `(${i18n.ts.unknown})` }}</span>
				</div>
				<div style="display: flex; flex-direction: column; gap: 1em;">
					<MkKeyValue :copy="host" oneline>
						<template #key>Host</template>
						<template #value><span class="_monospace"><MkLink :url="`https://${host}`">{{ host }}</MkLink></span></template>
					</MkKeyValue>
					<MkKeyValue oneline>
						<template #key>{{ i18n.ts.software }}</template>
						<template #value><span class="_monospace">{{ instance.softwareName || `(${i18n.ts.unknown})` }} / {{ instance.softwareVersion || `(${i18n.ts.unknown})` }}</span></template>
					</MkKeyValue>
					<MkKeyValue oneline>
						<template #key>{{ i18n.ts.administrator }}</template>
						<template #value>{{ instance.maintainerName || `(${i18n.ts.unknown})` }} ({{ instance.maintainerEmail || `(${i18n.ts.unknown})` }})</template>
					</MkKeyValue>
				</div>
				<MkKeyValue>
					<template #key>{{ i18n.ts.description }}</template>
					<template #value>{{ instance.description }}</template>
				</MkKeyValue>

				<FormSection v-if="iAmModerator">
					<template #label>Moderation</template>
					<div class="_gaps_s">
						<MkKeyValue>
							<template #key>
								{{ i18n.ts._delivery.status }}
							</template>
							<template #value>
								{{ i18n.ts._delivery._type[suspensionState] }}
							</template>
						</MkKeyValue>
						<div class="_buttons">
							<MkButton inline :disabled="!instance" danger @click="deleteAllFiles">{{ i18n.ts.deleteAllFiles }}</MkButton>
							<MkButton inline :disabled="!instance" danger @click="severAllFollowRelations">{{ i18n.ts.severAllFollowRelations }}</MkButton>
						</div>
						<MkSwitch v-model="isSuspended" :disabled="!instance" @update:modelValue="toggleSuspended">{{ i18n.ts._delivery.stop }}</MkSwitch>
						<MkInfo v-if="isBaseBlocked" warn>{{ i18n.ts.blockedByBase }}</MkInfo>
						<MkSwitch v-model="isBlocked" :disabled="!meta || !instance || isBaseBlocked" @update:modelValue="toggleBlock">{{ i18n.ts.blockThisInstance }}</MkSwitch>
						<MkInfo v-if="isBaseSilenced" warn>{{ i18n.ts.silencedByBase }}</MkInfo>
						<MkSwitch v-model="isSilenced" :disabled="!meta || !instance || isBaseSilenced" @update:modelValue="toggleSilenced">{{ i18n.ts.silenceThisInstance }}</MkSwitch>
						<MkSwitch v-model="isNSFW" :disabled="!instance" @update:modelValue="toggleNSFW">{{ i18n.ts.markInstanceAsNSFW }}</MkSwitch>
						<MkSwitch v-model="rejectQuotes" :disabled="!instance" @update:modelValue="toggleRejectQuotes">{{ i18n.ts.rejectQuotesInstance }}</MkSwitch>
						<MkSwitch v-model="rejectReports" :disabled="!instance" @update:modelValue="toggleRejectReports">{{ i18n.ts.rejectReports }}</MkSwitch>
						<MkInfo v-if="isBaseMediaSilenced" warn>{{ i18n.ts.mediaSilencedByBase }}</MkInfo>
						<MkSwitch v-model="isMediaSilenced" :disabled="!meta || !instance || isBaseMediaSilenced" @update:modelValue="toggleMediaSilenced">{{ i18n.ts.mediaSilenceThisInstance }}</MkSwitch>
						<MkButton @click="refreshMetadata"><i class="ti ti-refresh"></i> Refresh metadata</MkButton>
						<MkTextarea v-model="moderationNote" manualSave>
							<template #label>{{ i18n.ts.moderationNote }}</template>
							<template #caption>{{ i18n.ts.moderationNoteDescription }}</template>
						</MkTextarea>
					</div>
				</FormSection>

				<FormSection>
					<MkKeyValue oneline style="margin: 1em 0;">
						<template #key>{{ i18n.ts.registeredAt }}</template>
						<template #value><MkTime mode="detail" :time="instance.firstRetrievedAt"/></template>
					</MkKeyValue>
					<MkKeyValue oneline style="margin: 1em 0;">
						<template #key>{{ i18n.ts.updatedAt }}</template>
						<template #value><MkTime mode="detail" :time="instance.infoUpdatedAt"/></template>
					</MkKeyValue>
					<MkKeyValue oneline style="margin: 1em 0;">
						<template #key>{{ i18n.ts.latestRequestReceivedAt }}</template>
						<template #value><MkTime v-if="instance.latestRequestReceivedAt" :time="instance.latestRequestReceivedAt"/><span v-else>N/A</span></template>
					</MkKeyValue>
				</FormSection>

				<FormSection>
					<MkKeyValue oneline style="margin: 1em 0;">
						<template #key>Following (Pub)</template>
						<template #value>{{ number(instance.followingCount) }}</template>
					</MkKeyValue>
					<MkKeyValue oneline style="margin: 1em 0;">
						<template #key>Followers (Sub)</template>
						<template #value>{{ number(instance.followersCount) }}</template>
					</MkKeyValue>
				</FormSection>

				<FormSection>
					<template #label>Well-known resources</template>
					<FormLink :to="`https://${host}/.well-known/host-meta`" external style="margin-bottom: 8px;">host-meta</FormLink>
					<FormLink :to="`https://${host}/.well-known/host-meta.json`" external style="margin-bottom: 8px;">host-meta.json</FormLink>
					<FormLink :to="`https://${host}/.well-known/nodeinfo`" external style="margin-bottom: 8px;">nodeinfo</FormLink>
					<FormLink :to="`https://${host}/robots.txt`" external style="margin-bottom: 8px;">robots.txt</FormLink>
					<FormLink :to="`https://${host}/manifest.json`" external style="margin-bottom: 8px;">manifest.json</FormLink>
				</FormSection>
			</div>
			<div v-else-if="tab === 'chart'" key="chart" class="_gaps_m">
				<div class="cmhjzshl">
					<div class="selects">
						<MkSelect v-model="chartSrc" style="margin: 0 10px 0 0; flex: 1;">
							<option value="instance-requests">{{ i18n.ts._instanceCharts.requests }}</option>
							<option value="instance-users">{{ i18n.ts._instanceCharts.users }}</option>
							<option value="instance-users-total">{{ i18n.ts._instanceCharts.usersTotal }}</option>
							<option value="instance-notes">{{ i18n.ts._instanceCharts.notes }}</option>
							<option value="instance-notes-total">{{ i18n.ts._instanceCharts.notesTotal }}</option>
							<option value="instance-ff">{{ i18n.ts._instanceCharts.ff }}</option>
							<option value="instance-ff-total">{{ i18n.ts._instanceCharts.ffTotal }}</option>
							<option value="instance-drive-usage">{{ i18n.ts._instanceCharts.cacheSize }}</option>
							<option value="instance-drive-usage-total">{{ i18n.ts._instanceCharts.cacheSizeTotal }}</option>
							<option value="instance-drive-files">{{ i18n.ts._instanceCharts.files }}</option>
							<option value="instance-drive-files-total">{{ i18n.ts._instanceCharts.filesTotal }}</option>
						</MkSelect>
					</div>
					<div class="charts">
						<div class="label">{{ i18n.tsx.recentNHours({ n: 90 }) }}</div>
						<MkChart class="chart" :src="chartSrc" span="hour" :limit="90" :args="{ host: host }" :detailed="true"></MkChart>
						<div class="label">{{ i18n.tsx.recentNDays({ n: 90 }) }}</div>
						<MkChart class="chart" :src="chartSrc" span="day" :limit="90" :args="{ host: host }" :detailed="true"></MkChart>
					</div>
				</div>
			</div>
			<div v-else-if="tab === 'users'" key="users" class="_gaps_m">
				<MkPagination v-slot="{items}" :pagination="usersPagination" style="display: grid; grid-template-columns: repeat(auto-fill,minmax(270px,1fr)); grid-gap: 12px;">
					<MkA v-for="user in items" :key="user.id" v-tooltip.mfm="`Last posted: ${dateString(user.updatedAt)}`" class="user" :to="`/admin/user/${user.id}`">
						<MkUserCardMini :user="user"/>
					</MkA>
				</MkPagination>
			</div>
			<div v-else-if="tab === 'following'" key="following" class="_gaps_m">
				<MkPagination v-slot="{items}" :pagination="followingPagination">
					<div class="follow-relations-list">
						<div v-for="followRelationship in items" :key="followRelationship.id" class="follow-relation">
							<MkA v-tooltip.mfm="`Last posted: ${dateString(followRelationship.followee.updatedAt)}`" :to="`/admin/user/${followRelationship.followee.id}`" class="user">
								<MkUserCardMini :user="followRelationship.followee" :withChart="false"/>
							</MkA>
							<span class="arrow">→</span>
							<MkA v-tooltip.mfm="`Last posted: ${dateString(followRelationship.follower.updatedAt)}`" :to="`/admin/user/${followRelationship.follower.id}`" class="user">
								<MkUserCardMini :user="followRelationship.follower" :withChart="false"/>
							</MkA>
						</div>
					</div>
				</MkPagination>
			</div>
			<div v-else-if="tab === 'followers'" key="followers" class="_gaps_m">
				<MkPagination v-slot="{items}" :pagination="followersPagination">
					<div class="follow-relations-list">
						<div v-for="followRelationship in items" :key="followRelationship.id" class="follow-relation">
							<MkA v-tooltip.mfm="`Last posted: ${dateString(followRelationship.followee.updatedAt)}`" :to="`/admin/user/${followRelationship.followee.id}`" class="user">
								<MkUserCardMini :user="followRelationship.followee" :withChart="false"/>
							</MkA>
							<span class="arrow">←</span>
							<MkA v-tooltip.mfm="`Last posted: ${dateString(followRelationship.follower.updatedAt)}`" :to="`/admin/user/${followRelationship.follower.id}`" class="user">
								<MkUserCardMini :user="followRelationship.follower" :withChart="false"/>
							</MkA>
						</div>
					</div>
				</MkPagination>
			</div>
			<div v-else-if="tab === 'raw'" key="raw" class="_gaps_m">
				<MkObjectView tall :value="instance">
				</MkObjectView>
			</div>
		</MkHorizontalSwipe>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import * as Misskey from 'misskey-js';
import MkChart, { type ChartSrc } from '@/components/MkChart.vue';
import MkObjectView from '@/components/MkObjectView.vue';
import FormLink from '@/components/form/link.vue';
import MkLink from '@/components/MkLink.vue';
import MkButton from '@/components/MkButton.vue';
import FormSection from '@/components/form/section.vue';
import MkKeyValue from '@/components/MkKeyValue.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import number from '@/filters/number.js';
import { iAmModerator, iAmAdmin } from '@/account.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { i18n } from '@/i18n.js';
import MkUserCardMini from '@/components/MkUserCardMini.vue';
import MkPagination, { type Paging } from '@/components/MkPagination.vue';
import MkHorizontalSwipe from '@/components/MkHorizontalSwipe.vue';
import { getProxiedImageUrlNullable } from '@/scripts/media-proxy.js';
import { dateString } from '@/filters/date.js';
import MkTextarea from '@/components/MkTextarea.vue';
import MkInfo from '@/components/MkInfo.vue';
import { $i } from '@/account.js';

const props = defineProps<{
	host: string;
}>();

const tab = ref('overview');

const chartSrc = ref<ChartSrc>('instance-requests');
const meta = ref<Misskey.entities.AdminMetaResponse | null>(null);
const instance = ref<Misskey.entities.FederationInstance | null>(null);
const suspensionState = ref<'none' | 'manuallySuspended' | 'goneSuspended' | 'autoSuspendedForNotResponding'>('none');
const isSuspended = ref(false);
const isBlocked = ref(false);
const isSilenced = ref(false);
const isNSFW = ref(false);
const rejectQuotes = ref(false);
const rejectReports = ref(false);
const isMediaSilenced = ref(false);
const faviconUrl = ref<string | null>(null);
const moderationNote = ref('');

const baseDomains = computed(() => {
	const domains: string[] = [];

	const parts = props.host.toLowerCase().split('.');
	for (let s = 1; s < parts.length; s++) {
		const domain = parts.slice(s).join('.');
		domains.push(domain);
	}

	return domains;
});
const isBaseBlocked = computed(() => meta.value && baseDomains.value.some(d => meta.value?.blockedHosts.includes(d)));
const isBaseSilenced = computed(() => meta.value && baseDomains.value.some(d => meta.value?.silencedHosts.includes(d)));
const isBaseMediaSilenced = computed(() => meta.value && baseDomains.value.some(d => meta.value?.mediaSilencedHosts.includes(d)));

const usersPagination = {
	endpoint: iAmModerator ? 'admin/show-users' : 'users',
	limit: 10,
	params: {
		sort: '+updatedAt',
		state: 'all',
		hostname: props.host,
	},
	offsetMode: true,
} satisfies Paging;

const followingPagination = {
	endpoint: 'federation/following' as const,
	limit: 10,
	params: {
		host: props.host,
		includeFollower: true,
	},
	offsetMode: false,
};

const followersPagination = {
	endpoint: 'federation/followers' as const,
	limit: 10,
	params: {
		host: props.host,
		includeFollower: true,
	},
	offsetMode: false,
};

if (iAmModerator) {
	watch(moderationNote, async () => {
		if (instance.value == null) return;
		await misskeyApi('admin/federation/update-instance', { host: instance.value.host, moderationNote: moderationNote.value });
	});
}

async function fetch(): Promise<void> {
	if (iAmAdmin) {
		meta.value = await misskeyApi('admin/meta');
	}
	instance.value = await misskeyApi('federation/show-instance', {
		host: props.host,
	});
	suspensionState.value = instance.value?.suspensionState ?? 'none';
	isSuspended.value = suspensionState.value !== 'none';
	isBlocked.value = instance.value?.isBlocked ?? false;
	isSilenced.value = instance.value?.isSilenced ?? false;
	isNSFW.value = instance.value?.isNSFW ?? false;
	rejectReports.value = instance.value?.rejectReports ?? false;
	rejectQuotes.value = instance.value?.rejectQuotes ?? false;
	isMediaSilenced.value = instance.value?.isMediaSilenced ?? false;
	faviconUrl.value = getProxiedImageUrlNullable(instance.value?.faviconUrl, 'preview') ?? getProxiedImageUrlNullable(instance.value?.iconUrl, 'preview');
	moderationNote.value = instance.value?.moderationNote ?? '';
}

async function toggleBlock(): Promise<void> {
	if (!iAmAdmin) return;
	if (!meta.value) throw new Error('No meta?');
	if (!instance.value) throw new Error('No instance?');
	const { host } = instance.value;
	await misskeyApi('admin/update-meta', {
		blockedHosts: isBlocked.value ? meta.value.blockedHosts.concat([host]) : meta.value.blockedHosts.filter(x => x !== host),
	});
}

async function toggleSilenced(): Promise<void> {
	if (!iAmAdmin) return;
	if (!meta.value) throw new Error('No meta?');
	if (!instance.value) throw new Error('No instance?');
	const { host } = instance.value;
	const silencedHosts = meta.value.silencedHosts ?? [];
	await misskeyApi('admin/update-meta', {
		silencedHosts: isSilenced.value ? silencedHosts.concat([host]) : silencedHosts.filter(x => x !== host),
	});
}

async function toggleMediaSilenced(): Promise<void> {
	if (!iAmAdmin) return;
	if (!meta.value) throw new Error('No meta?');
	if (!instance.value) throw new Error('No instance?');
	const { host } = instance.value;
	const mediaSilencedHosts = meta.value.mediaSilencedHosts ?? [];
	await misskeyApi('admin/update-meta', {
		mediaSilencedHosts: isMediaSilenced.value ? mediaSilencedHosts.concat([host]) : mediaSilencedHosts.filter(x => x !== host),
	});
}

async function toggleSuspended(): Promise<void> {
	if (!iAmModerator) return;
	if (!instance.value) throw new Error('No instance?');
	suspensionState.value = isSuspended.value ? 'manuallySuspended' : 'none';
	await misskeyApi('admin/federation/update-instance', {
		host: instance.value.host,
		isSuspended: isSuspended.value,
	});
}

async function toggleNSFW(): Promise<void> {
	if (!iAmModerator) return;
	if (!instance.value) throw new Error('No instance?');
	await misskeyApi('admin/federation/update-instance', {
		host: instance.value.host,
		isNSFW: isNSFW.value,
	});
}

async function toggleRejectReports(): Promise<void> {
	if (!iAmModerator) return;
	if (!instance.value) throw new Error('No instance?');
	await misskeyApi('admin/federation/update-instance', {
		host: instance.value.host,
		rejectReports: rejectReports.value,
	});
}

async function toggleRejectQuotes(): Promise<void> {
	if (!iAmModerator) return;
	if (!instance.value) throw new Error('No instance?');
	await misskeyApi('admin/federation/update-instance', {
		host: instance.value.host,
		rejectQuotes: rejectQuotes.value,
	});
}

function refreshMetadata(): void {
	if (!iAmModerator) return;
	if (!instance.value) throw new Error('No instance?');
	misskeyApi('admin/federation/refresh-remote-instance-metadata', {
		host: instance.value.host,
	});
	os.alert({
		text: 'Refresh requested',
	});
}

async function deleteAllFiles(): Promise<void> {
	if (!iAmModerator) return;
	if (!instance.value) throw new Error('No instance?');

	const confirm = await os.confirm({
		type: 'warning',
		text: i18n.ts.deleteAllFilesConfirm,
	});
	if (confirm.canceled) return;

	await Promise.all([
		misskeyApi('admin/federation/delete-all-files', {
			host: instance.value.host,
		}),
		os.alert({
			text: i18n.ts.deleteAllFilesQueued,
		}),
	]);
}

async function severAllFollowRelations(): Promise<void> {
	if (!iAmModerator) return;
	if (!instance.value) throw new Error('No instance?');

	const confirm = await os.confirm({
		type: 'warning',
		text: i18n.tsx.severAllFollowRelationsConfirm({
			instanceName: instance.value.name ?? instance.value.host,
			followingCount: instance.value.followingCount,
			followersCount: instance.value.followersCount,
		}),
	});
	if (confirm.canceled) return;

	await Promise.all([
		misskeyApi('admin/federation/remove-all-following', {
			host: instance.value.host,
		}),
		os.alert({
			text: i18n.tsx.severAllFollowRelationsQueued({ host: instance.value.host }),
		}),
	]);
}

fetch();

const headerActions = computed(() => [{
	text: `https://${props.host}`,
	icon: 'ti ti-external-link',
	handler: () => {
		window.open(`https://${props.host}`, '_blank', 'noopener');
	},
}]);

const headerTabs = computed(() => [{
	key: 'overview',
	title: i18n.ts.overview,
	icon: 'ti ti-info-circle',
}, {
	key: 'chart',
	title: i18n.ts.charts,
	icon: 'ti ti-chart-line',
}, {
	key: 'users',
	title: i18n.ts.users,
	icon: 'ti ti-users',
}, ...getFollowingTabs(), {
	key: 'raw',
	title: 'Raw',
	icon: 'ti ti-code',
}]);

function getFollowingTabs() {
	if (!$i) return [];
	return [
		{
			key: 'following',
			title: i18n.ts.following,
			icon: 'ti ti-arrow-right',
		},
		{
			key: 'followers',
			title: i18n.ts.followers,
			icon: 'ti ti-arrow-left',
		},
	];
}

definePageMetadata(() => ({
	title: props.host,
	icon: 'ti ti-server',
}));
</script>

<style lang="scss" scoped>
.fnfelxur {
	display: flex;
	align-items: center;

	> .icon {
		display: block;
		margin: 0 16px 0 0;
		height: 64px;
		border-radius: var(--MI-radius-sm);
	}

	> .name {
		word-break: break-all;
	}
}

.cmhjzshl {
	> .selects {
		display: flex;
		margin: 0 0 16px 0;
	}

	> .charts {
		> .label {
			margin-bottom: 12px;
			font-weight: bold;
		}
	}
}

.follow-relations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .follow-relation {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: nowrap;
    justify-content: space-between;

    .user {
      flex: 1;
      max-width: 45%;
      flex-shrink: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .arrow {
      font-size: 1.5em;
      flex-shrink: 0;
    }
  }
}
</style>
