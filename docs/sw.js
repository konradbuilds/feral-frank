/* Feral Frank · Konrad Sroka · 2026 · GPL-3.0-only.
 * Cache only the app shell. Chat, personal memory and API replies are never cached here.
 */
'use strict';
const SCOPE = new URL(self.registration.scope);
const PREFIX = 'frank-shell:' + SCOPE.pathname + ':';
const CACHE = PREFIX + 'chat-1.5.6';
const ASSETS = [
	'public-demo.js',
	'storage.js',
	'onboarding.js',
	'storage-controls.js',
	'connection.js',
'ai-setup.js',
'character.js',
	'app.html',
	'workspace.css',
	'workspace.js',
	'index.html',
	'home.css',
	'mobile.js',
	'frank.png',
	'manifest.webmanifest',
	'icon-180.png',
	'icon-192.png',
	'icon-512.png',
	'icon-maskable-512.png',
	'favicon.svg',
	'favicon.png',
	'LICENSE.txt',
];
const SHELL = new Set(
	ASSETS.map(function (name) {
		return new URL(name, SCOPE).pathname;
	})
);
const INDEX = new URL('index.html', SCOPE).href;
const APP = new URL('app.html', SCOPE).href;

self.addEventListener('install', function (event) {
	event.waitUntil(
		caches.open(CACHE).then(function (cache) {
			return cache.addAll(
				ASSETS.map(function (name) {
					return new Request(new URL(name, SCOPE).href, {
						cache: 'reload',
					});
				})
			);
		})
	);
	// Updates wait until all older clients close, or the user taps Update app.
});

self.addEventListener('activate', function (event) {
	event.waitUntil(
		caches
			.keys()
			.then(function (keys) {
				return Promise.all(
					keys
						.filter(function (key) {
							return key.indexOf(PREFIX) === 0 && key !== CACHE;
						})
						.map(function (key) {
							return caches.delete(key);
						})
				);
			})
			.then(function () {
				return self.clients.claim();
			})
	);
});

self.addEventListener('message', function (event) {
	if (event.data && event.data.type === 'ACTIVATE_UPDATE') {
		event.waitUntil(self.skipWaiting());
	}
});

self.addEventListener('fetch', function (event) {
	const request = event.request;
	const url = new URL(request.url);
	if (request.method !== 'GET' || url.origin !== SCOPE.origin) {
		return;
	}
	// Keep private HTML network-only; a failed offline launch may open the public
	// disconnected shell. No authenticated page, login or provider response is cached.
	if (
		url.pathname === new URL('frank.php', SCOPE).pathname &&
		!url.searchParams.has('api')
	) {
		event.respondWith(
			fetch(request).catch(async () => {
				const cache = await caches.open(CACHE);
				return (await cache.match(APP)) || Response.error();
			})
		);
		return;
	}
	// Refresh editable assets online, falling back to the shell only when offline.
	// Never write authenticated Node/PHP responses into the public cache.
	if (SHELL.has(url.pathname) && /\.(?:html|css|js)$/.test(url.pathname)) {
		event.respondWith(
			fetch(request, { cache: 'no-cache' }).catch(async () => {
				const cache = await caches.open(CACHE);
				return (await cache.match(request, { ignoreSearch: true })) || Response.error();
			})
		);
		return;
	}
	const key = url.pathname === SCOPE.pathname ? INDEX : url.href;
	if (url.pathname === SCOPE.pathname || SHELL.has(url.pathname)) {
		event.respondWith(
			caches
				.open(CACHE)
				.then(function (cache) {
					return cache.match(key, { ignoreSearch: true });
				})
				.then(function (cached) {
					return cached || fetch(request);
				})
		);
	}
	// Deliberately no runtime caching, API interception or cross-origin caching.
});
