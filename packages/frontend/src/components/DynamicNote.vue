<!--
SPDX-FileCopyrightText: hazelnoot and other Sharkey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<XNote
	ref="rootEl"
	:note="note"
	:pinned="pinned"
	:mock="mock"
	:withHardMute="withHardMute"
	@reaction="emoji => emit('reaction', emoji)"
	@removeReaction="emoji => emit('removeReaction', emoji)"
/>
</template>

<script setup lang="ts">
import * as Misskey from 'misskey-js';
import { computed, defineAsyncComponent, shallowRef } from 'vue';
import type { ComponentExposed } from 'vue-component-type-helpers';
import type MkNote from '@/components/MkNote.vue';
import type SkNote from '@/components/SkNote.vue';
import { defaultStore } from '@/store';

const XNote = computed(() =>
	defineAsyncComponent(() =>
		defaultStore.reactiveState.noteDesign.value === 'misskey'
			? import('@/components/MkNote.vue')
			: import('@/components/SkNote.vue'),
	),
);

const rootEl = shallowRef<ComponentExposed<typeof MkNote | typeof SkNote>>();

defineExpose({ rootEl });

defineProps<{
	note: Misskey.entities.Note;
	pinned?: boolean;
	mock?: boolean;
	withHardMute?: boolean;
}>();

const emit = defineEmits<{
	(ev: 'reaction', emoji: string): void;
	(ev: 'removeReaction', emoji: string): void;
}>();
</script>
