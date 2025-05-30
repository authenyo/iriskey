<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<component
	:is="popup.component"
	v-for="popup in popups"
	:key="popup.id"
	v-bind="popup.props"
	v-on="popup.events"
/>

<XUpload v-if="uploads.length > 0"/>

<TransitionGroup
	tag="div"
	:class="[$style.notifications, {
		[$style.notificationsPosition_leftTop]: defaultStore.state.notificationPosition === 'leftTop',
		[$style.notificationsPosition_leftBottom]: defaultStore.state.notificationPosition === 'leftBottom',
		[$style.notificationsPosition_rightTop]: defaultStore.state.notificationPosition === 'rightTop',
		[$style.notificationsPosition_rightBottom]: defaultStore.state.notificationPosition === 'rightBottom',
		[$style.notificationsStackAxis_vertical]: defaultStore.state.notificationStackAxis === 'vertical',
		[$style.notificationsStackAxis_horizontal]: defaultStore.state.notificationStackAxis === 'horizontal',
	}]"
	:moveClass="defaultStore.state.animation ? $style.transition_notification_move : ''"
	:enterActiveClass="defaultStore.state.animation ? $style.transition_notification_enterActive : ''"
	:leaveActiveClass="defaultStore.state.animation ? $style.transition_notification_leaveActive : ''"
	:enterFromClass="defaultStore.state.animation ? $style.transition_notification_enterFrom : ''"
	:leaveToClass="defaultStore.state.animation ? $style.transition_notification_leaveTo : ''"
>
	<div
		v-for="notification in notifications" :key="notification.id" :class="$style.notification" :style="{
			pointerEvents: getPointerEvents()
		}"
	>
		<XNotification :notification="notification"/>
	</div>
</TransitionGroup>

<XStreamIndicator/>

<div v-if="pendingApiRequestsCount > 0" id="wait"></div>

<div v-if="dev" id="devTicker"><span style="animation: dev-ticker-blink 2s infinite;">DEV BUILD</span></div>

<div v-if="$i && $i.isBot" id="botWarn"><span>{{ i18n.ts.loggedInAsBot }}</span></div>

<SkOneko v-if="defaultStore.state.oneko"/>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, ref } from 'vue';
import * as Misskey from 'misskey-js';
import { swInject } from './sw-inject.js';
import XNotification from './notification.vue';
import { popups } from '@/os.js';
import { pendingApiRequestsCount } from '@/scripts/misskey-api.js';
import { uploads } from '@/scripts/upload.js';
import * as sound from '@/scripts/sound.js';
import { $i } from '@/account.js';
import { useStream } from '@/stream.js';
import { i18n } from '@/i18n.js';
import { defaultStore } from '@/store.js';
import { globalEvents } from '@/events.js';

const SkOneko = defineAsyncComponent(() => import('@/components/SkOneko.vue'));

const XStreamIndicator = defineAsyncComponent(() => import('./stream-indicator.vue'));
const XUpload = defineAsyncComponent(() => import('./upload.vue'));

const dev = _DEV_;

const notifications = ref<Misskey.entities.Notification[]>([]);

function onNotification(notification: Misskey.entities.Notification, isClient = false) {
	if (document.visibilityState === 'visible') {
		if (!isClient && notification.type !== 'test') {
			// サーバーサイドのテスト通知の際は自動で既読をつけない（テストできないので）
			useStream().send('readNotification');
		}

		notifications.value.unshift(notification);
		window.setTimeout(() => {
			if (notifications.value.length > 3) notifications.value.pop();
		}, 500);

		window.setTimeout(() => {
			notifications.value = notifications.value.filter(x => x.id !== notification.id);
		}, 6000);
	}

	sound.playMisskeySfx('notification');
}

if ($i) {
	const connection = useStream().useChannel('main', null, 'UI');
	connection.on('notification', onNotification);

	globalEvents.on('clientNotification', notification => onNotification(notification, true));

	//#region Listen message from SW
	if ('serviceWorker' in navigator) {
		swInject();
	}
}

function getPointerEvents() {
	return defaultStore.state.notificationClickable ? undefined : 'none';
}
</script>

<style lang="scss" module>
.transition_notification_move,
.transition_notification_enterActive,
.transition_notification_leaveActive {
	transition: opacity 0.3s, transform 0.3s !important;
}
.transition_notification_enterFrom {
	opacity: 0;
	transform: translateX(250px);
}
.transition_notification_leaveTo {
	opacity: 0;
	transform: translateX(-250px);
}

.notifications {
	position: fixed;
	z-index: 3900000;
	padding: 0 var(--MI-margin);
	display: flex;

	&.notificationsPosition_leftTop {
		top: var(--MI-margin);
		left: 0;
	}

	&.notificationsPosition_rightTop {
		top: var(--MI-margin);
		right: 0;
	}

	&.notificationsPosition_leftBottom {
		bottom: calc(var(--MI-minBottomSpacing) + var(--MI-margin));
		left: 0;
	}

	&.notificationsPosition_rightBottom {
		bottom: calc(var(--MI-minBottomSpacing) + var(--MI-margin));
		right: 0;
	}

	&.notificationsStackAxis_vertical {
		width: 250px;

		&.notificationsPosition_leftTop,
		&.notificationsPosition_rightTop {
			flex-direction: column;

			.notification {
				& + .notification {
					margin-top: 8px;
				}
			}
		}

		&.notificationsPosition_leftBottom,
		&.notificationsPosition_rightBottom {
			flex-direction: column-reverse;

			.notification {
				& + .notification {
					margin-bottom: 8px;
				}
			}
		}
	}

	&.notificationsStackAxis_horizontal {
		width: 100%;

		&.notificationsPosition_leftTop,
		&.notificationsPosition_leftBottom {
			flex-direction: row;

			.notification {
				& + .notification {
					margin-left: 8px;
				}
			}
		}

		&.notificationsPosition_rightTop,
		&.notificationsPosition_rightBottom {
			flex-direction: row-reverse;

			.notification {
				& + .notification {
					margin-right: 8px;
				}
			}
		}

		.notification {
			width: 250px;
			flex-shrink: 0;
		}
	}
}

.notification {
	container-type: inline-size;
}
</style>

<style lang="scss">
@keyframes dev-ticker-blink {
	0% { opacity: 1; }
	50% { opacity: 0; }
	100% { opacity: 1; }
}

@keyframes progress-spinner {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

#wait {
	display: block;
	position: fixed;
	z-index: 4000000;
	top: 15px;
	right: 15px;
	pointer-events: none;

	&::before {
		content: "";
		display: block;
		width: 18px;
		height: 18px;
		box-sizing: border-box;
		border: solid 2px transparent;
		border-top-color: var(--MI_THEME-accent);
		border-left-color: var(--MI_THEME-accent);
		border-radius: 50%;
		animation: progress-spinner 400ms linear infinite;
	}
}

#botWarn {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	margin: auto;
	width: 100%;
	height: max-content;
	text-align: center;
	z-index: 2147483647;
	color: #ff0;
	background: rgba(0, 0, 0, 0.5);
	padding: 4px 7px;
	font-size: 14px;
	pointer-events: none;
	user-select: none;
}

#devTicker {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 2147483647;
	color: #ff0;
	background: rgba(0, 0, 0, 0.5);
	padding: 4px 5px;
	font-size: 14px;
	pointer-events: none;
	user-select: none;
}
</style>
