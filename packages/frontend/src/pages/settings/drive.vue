<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<FormSection v-if="!fetching" first>
		<template #label>{{ i18n.ts.usageAmount }}</template>

		<div class="_gaps_m">
			<div>
				<div :class="$style.meter"><div :class="$style.meterValue" :style="meterStyle"></div></div>
			</div>
			<FormSplit>
				<MkKeyValue>
					<template #key>{{ i18n.ts.capacity }}</template>
					<template #value>{{ bytes(capacity, 1) }}</template>
				</MkKeyValue>
				<MkKeyValue>
					<template #key>{{ i18n.ts.inUse }}</template>
					<template #value>{{ bytes(usage, 1) }}</template>
				</MkKeyValue>
			</FormSplit>
		</div>
	</FormSection>

	<FormSection>
		<template #label>{{ i18n.ts.statistics }}</template>
		<MkChart src="per-user-drive" :args="{ user: $i }" span="day" :limit="7 * 5" :bar="true" :stacked="true" :detailed="false" :aspectRatio="6"/>
	</FormSection>

	<FormSection>
		<div class="_gaps_m">
			<FormLink to="" @click="chooseUploadFolder()">
				{{ i18n.ts.uploadFolder }}
				<template #suffix>{{ uploadFolder ? uploadFolder.name : '-' }}</template>
				<template #suffixIcon><i class="ti ti-folder"></i></template>
			</FormLink>
			<FormLink to="/settings/drive/cleaner">
				{{ i18n.ts.drivecleaner }}
			</FormLink>
			<MkSwitch v-model="keepOriginalUploading">
				<template #label>{{ i18n.ts.keepOriginalUploading }}</template>
				<template #caption>{{ i18n.ts.keepOriginalUploadingDescription }}</template>
			</MkSwitch>
			<MkSwitch v-model="keepOriginalFilename">
				<template #label>{{ i18n.ts.keepOriginalFilename }}</template>
				<template #caption>{{ i18n.ts.keepOriginalFilenameDescription }}</template>
			</MkSwitch>
			<MkSwitch v-model="defaultSensitive" @update:modelValue="saveProfile()">
				<template #label>{{ i18n.ts.alwaysMarkSensitive }}</template>
			</MkSwitch>
		</div>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import * as Misskey from 'misskey-js';
import tinycolor from 'tinycolor2';
import FormLink from '@/components/form/link.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import FormSection from '@/components/form/section.vue';
import MkKeyValue from '@/components/MkKeyValue.vue';
import FormSplit from '@/components/form/split.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import bytes from '@/filters/bytes.js';
import { defaultStore } from '@/store.js';
import MkChart from '@/components/MkChart.vue';
import { i18n } from '@/i18n.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { signinRequired } from '@/account.js';

const $i = signinRequired();

const fetching = ref(true);
const usage = ref<number | null>(null);
const capacity = ref<number | null>(null);
const uploadFolder = ref<Misskey.entities.DriveFolder | null>(null);
const defaultSensitive = ref($i.defaultSensitive);

const meterStyle = computed(() => {
	if (!capacity.value || !usage.value) return {};
	return {
		width: `${usage.value / capacity.value * 100}%`,
		background: tinycolor({
			h: 180 - (usage.value / capacity.value * 180),
			s: 0.7,
			l: 0.5,
		}).toHslString(),
	};
});

const keepOriginalUploading = computed(defaultStore.makeGetterSetter('keepOriginalUploading'));
const keepOriginalFilename = computed(defaultStore.makeGetterSetter('keepOriginalFilename'));

misskeyApi('drive').then(info => {
	capacity.value = info.capacity;
	usage.value = info.usage;
	fetching.value = false;
});

if (defaultStore.state.uploadFolder) {
	misskeyApi('drive/folders/show', {
		folderId: defaultStore.state.uploadFolder,
	}).then(response => {
		uploadFolder.value = response;
	});
}

function chooseUploadFolder() {
	os.selectDriveFolder(false).then(async folder => {
		defaultStore.set('uploadFolder', folder[0] ? folder[0].id : null);
		os.success();
		if (defaultStore.state.uploadFolder) {
			uploadFolder.value = await misskeyApi('drive/folders/show', {
				folderId: defaultStore.state.uploadFolder,
			});
		} else {
			uploadFolder.value = null;
		}
	});
}

function saveProfile() {
	misskeyApi('i/update', {
		defaultSensitive: !!defaultSensitive.value,
	}).catch(err => {
		os.alert({
			type: 'error',
			title: i18n.ts.error,
			text: err.message,
		});
		defaultSensitive.value = true;
	});
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata(() => ({
	title: i18n.ts.drive,
	icon: 'ti ti-cloud',
}));
</script>

<style lang="scss" module>
.meter {
	height: 10px;
	background: rgba(0, 0, 0, 0.1);
	border-radius: var(--MI-radius-ellipse);
	overflow: clip;
}

.meterValue {
	height: 100%;
	border-radius: var(--MI-radius-ellipse);
}
</style>
