/**
 * The Setup module contains the interfaces and methods needed to install Ruffle onto a page,
 * and create a {@link PlayerElement} with the latest version of Ruffle available.
 *
 * This is primarily relevant to users of `ruffle-core` as a npm module, as the "selfhosted" version of Ruffle preinstalls itself,
 * and without type checking the interfaces here are of limited use.
 *
 * For users of `ruffle-core` as a npm module, you are encouraged to call {@link installRuffle} once during page load to
 * make the `ruffle-core` library register itself as a version of Ruffle on the page.
 *
 * Multiple sources of Ruffle may exist - for example, the Ruffle browser extension also installs itself on page load.
 * For this reason, you are required to call `window.RufflePlayer.latest()` (for example) to grab the latest {@link SourceAPI},
 * from which you can create a {@link PlayerElement} via {@link SourceAPI.createPlayer}.
 *
 * @module
 */
export type * from './public-api.d.ts';
export type * from './source-api.d.ts';
export type * from './install.d.ts';
