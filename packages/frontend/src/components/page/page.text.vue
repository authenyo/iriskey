<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps" :class="$style.textRoot">
	<Mfm :text="block.text ?? ''" :isBlock="true" :isNote="false"/>
	<div v-if="isEnabledUrlPreview" class="_gaps_s">
		<MkUrlPreview v-for="url in urls" :key="url" :url="url" :showAsQuote="!page.user.rejectQuotes"/>
	</div>
</div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import * as mfm from '@transfem-org/sfm-js';
import * as Misskey from 'misskey-js';
import { extractUrlFromMfm } from '@/scripts/extract-url-from-mfm.js';
import { isEnabledUrlPreview } from '@/instance.js';

const MkUrlPreview = defineAsyncComponent(() => import('@/components/MkUrlPreview.vue'));

const props = defineProps<{
	block: Misskey.entities.PageBlock,
	page: Misskey.entities.Page,
}>();

const urls = props.block.text ? extractUrlFromMfm(mfm.parse(props.block.text)) : [];
</script>

<style lang="scss" module>
.textRoot {
	font-size: 1.1rem;
}
</style>
