/*
 * Feral Frank · Konrad Sroka · 2026 · https://github.com/konradbuilds
 * GPL-3.0-only. Progressive mobile features; the core app works without them.
 */
(function () {
	'use strict';

	const $ = function (id) {
		return document.getElementById(id);
	};
	// Launch once per tab session; reduced-motion users go straight to Frank.
	const splash = $('splash');
	if (splash) {
		let seen = false;
		try {
			seen = sessionStorage.getItem('frank-splash-v4') === 'seen';
			sessionStorage.setItem('frank-splash-v4', 'seen');
		} catch (error) {
			/* Storage is optional. */
		}
		const dismiss = function () {
			splash.remove();
		};
		if (
			seen ||
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		) {
			dismiss();
		} else {
			splash.addEventListener('animationend', function (event) {
				if (event.animationName === 'splash-exit') {
					dismiss();
				}
			});
			setTimeout(dismiss, 2550);
		}
	}

	const preferenceKey = 'feral-frank-mobile-v1';
	const haptics = $('haptics-enabled');
	const install = $('install-app');
	const update = $('app-update');
	let hapticsEnabled = false;
	let installPrompt = null;
	let registration = null;
	let offlineReady = false;
	let reloading = false;
	let pendingReload = false;
	let updateRequested = false;
	let startTouch = null;
	let ignorePetClickUntil = 0;

	try {
		hapticsEnabled = window.FrankStorage.read(preferenceKey) === 'true';
	} catch (error) {
		// A blocked preference store must not block the app.
	}
	haptics.checked = hapticsEnabled;
	haptics.disabled = typeof navigator.vibrate !== 'function';
	if (haptics.disabled) {
		$('haptics-note').textContent =
			'Vibration isn’t supported in this browser.';
	}

	function feedback() {
		if (hapticsEnabled && typeof navigator.vibrate === 'function') {
			try {
				navigator.vibrate(12);
			} catch (error) {
				// Silent or unsupported devices keep the same interaction.
			}
		}
	}

	haptics.addEventListener('change', function () {
		hapticsEnabled = haptics.checked;
		try {
			window.FrankStorage.write(preferenceKey, String(hapticsEnabled));
		} catch (error) {
			// Keep the preference for this session.
		}
		feedback();
	});

	$('settings-close').addEventListener('click', function () {
		$('memory-close').click();
	});

	// Swipe only over Frank, never over the chat or near a browser back edge.
	$('reactor').addEventListener(
		'touchstart',
		function (event) {
			startTouch = null;
			if (event.touches.length !== 1 || !$('memory-panel').hidden) {
				return;
			}
			const touch = event.touches[0];
			if (touch.clientX < 20 || touch.clientX > window.innerWidth - 20) {
				return;
			}
			startTouch = {
				x: touch.clientX,
				y: touch.clientY,
				time: Date.now(),
			};
		},
		{ passive: true }
	);

	$('reactor').addEventListener(
		'touchend',
		function (event) {
			if (!startTouch || event.changedTouches.length !== 1) {
				startTouch = null;
				return;
			}
			const touch = event.changedTouches[0];
			const vertical = touch.clientY - startTouch.y;
			const horizontal = Math.abs(touch.clientX - startTouch.x);
			const elapsed = Date.now() - startTouch.time;
			startTouch = null;
			if (vertical < -55 && horizontal < 40 && elapsed < 800) {
				if (event.cancelable) {
					event.preventDefault();
				}
				ignorePetClickUntil = Date.now() + 700;
				$('memory-open').click();
			}
		},
		{ passive: false }
	);

	$('reactor').addEventListener(
		'touchcancel',
		function () {
			startTouch = null;
		},
		{ passive: true }
	);

	$('reactor').addEventListener(
		'click',
		function (event) {
			if (Date.now() < ignorePetClickUntil) {
				event.preventDefault();
				event.stopImmediatePropagation();
			}
		},
		true
	);

	function copyFallback(text) {
		const field = document.createElement('textarea');
		const previous = document.activeElement;
		field.value = text;
		field.readOnly = true;
		field.style.position = 'fixed';
		field.style.opacity = '0';
		document.body.appendChild(field);
		field.select();
		let copied = false;
		try {
			copied = document.execCommand('copy');
		} finally {
			field.remove();
			if (previous && typeof previous.focus === 'function') {
				previous.focus();
			}
		}
		return copied;
	}

	const shareFeedback = new WeakMap();
	function resetShareLater(button) {
		const state = shareFeedback.get(button);
		clearTimeout(state.timer);
		state.timer = setTimeout(function () {
			if (button.isConnected) {
				button.replaceChildren(
					...state.nodes.map((node) => node.cloneNode(true))
				);
				button.classList.remove('is-copied');
				button.title = state.title;
				button.setAttribute('aria-label', state.label);
			}
			shareFeedback.delete(button);
		}, 3500);
	}
	async function shareQuote(button) {
		if (button.disabled) {
			return;
		}
		if (!shareFeedback.has(button)) {
			shareFeedback.set(button, {
				nodes: Array.from(button.childNodes).map((node) =>
					node.cloneNode(true)
				),
				title: button.title,
				label: button.getAttribute('aria-label') || button.title,
				timer: 0,
			});
		}
		const text = button.getAttribute('data-quote') || '';
		const source = button.getAttribute('data-source') || '';
		const payload = { title: 'Feral Frank', text: text };
		if (/^https:\/\//.test(source)) {
			payload.url = source;
		}
		button.disabled = true;
		try {
			if (typeof navigator.share === 'function') {
				try {
					// Call directly from the tap; native sharing requires activation.
					await navigator.share(payload);
					return;
				} catch (error) {
					if (error.name === 'AbortError') {
						return;
					}
				}
			}
			const copy = text + (payload.url ? '\n\n' + payload.url : '');
			let copied = false;
			if (navigator.clipboard && window.isSecureContext) {
				try {
					await navigator.clipboard.writeText(copy);
					copied = true;
				} catch (error) {
					// Fall back to selection-based copying in older browsers.
				}
			}
			if (!copied) {
				copied = copyFallback(copy);
			}
			if (copied) {
				button.textContent = 'Copied';
				button.classList.add('is-copied');
				button.title = 'Quote copied; tap to share again';
				button.setAttribute('aria-label', button.title);
				$('say').textContent = 'Quote copied.';
			} else {
				button.textContent = 'Select text';
				button.classList.add('is-copied');
				button.title =
					'Copy unavailable; select the message text to copy it';
				button.setAttribute('aria-label', button.title);
				$('say').textContent = button.title;
			}
		} finally {
			if (button.classList.contains('is-copied')) resetShareLater(button);
			else shareFeedback.delete(button);
			button.disabled = false;
		}
	}

	document.addEventListener('click', function (event) {
		const target = event.target.closest('button');
		if (!target) {
			return;
		}
		if (
			['pet', 'drink', 'joint', 'send', 'memory-open'].indexOf(
				target.id
			) !== -1
		) {
			feedback();
		}
		if (target.classList.contains('share-quote')) {
			shareQuote(target).catch(function () {
				$('say').textContent =
					'Sharing unavailable. You can select the message to copy it.';
			});
		}
	});

	function isInstalled() {
		return (
			window.matchMedia('(display-mode: standalone)').matches ||
			navigator.standalone === true
		);
	}

	function connectionNote() {
		if (offlineReady) {
			$('offline-status').textContent =
				navigator.onLine === false
					? 'Offline · notes and animation work. Cloud chat needs internet.'
					: 'Ready offline · Cloud AI needs internet.';
		}
	}

	window.addEventListener('beforeinstallprompt', function (event) {
		event.preventDefault();
		installPrompt = event;
		install.hidden = isInstalled();
	});
	window.addEventListener('appinstalled', function () {
		installPrompt = null;
		install.hidden = true;
		$('mobile-status').textContent = 'Frank’s on your home screen.';
	});
	install.hidden = isInstalled();
	install.addEventListener('click', async function () {
		if (installPrompt) {
			const prompt = installPrompt;
			installPrompt = null;
			try {
				await prompt.prompt();
				const choice = await prompt.userChoice;
				$('mobile-status').textContent =
					choice.outcome === 'accepted'
						? 'Installing Frank…'
						: 'No rush. Install stays in your browser menu.';
			} catch (error) {
				$('mobile-status').textContent =
					'Use your browser menu to install Frank.';
			}
		} else if (location.protocol === 'file:') {
			$('mobile-status').textContent =
				'Open Frank over HTTPS or localhost to enable installation.';
		} else if (
			/iPad|iPhone|iPod/.test(navigator.userAgent) ||
			(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
		) {
			$('mobile-status').textContent = 'Share menu → Add to Home Screen.';
		} else if (
			/Safari/.test(navigator.userAgent) &&
			!/Chrome|Chromium|Android/.test(navigator.userAgent)
		) {
			$('mobile-status').textContent =
				'Safari: File → Add to Dock, or Share → Add to Home Screen.';
		} else {
			$('mobile-status').textContent =
				'Browser menu → Install app or Add to Home screen.';
		}
	});

	function offerUpdate() {
		update.hidden =
			!pendingReload && (!registration || !registration.waiting);
		update.textContent = pendingReload
			? 'Reload updated app'
			: 'Update app';
	}
	update.addEventListener('click', function () {
		if (!pendingReload && (!registration || !registration.waiting)) {
			return;
		}
		if (
			document.querySelector('#send:disabled') &&
			!document.querySelector('#q:disabled')
		) {
			$('mobile-status').textContent =
				'Let Frank finish replying, then update.';
			return;
		}
		if ($('q').value.trim()) {
			$('mobile-status').textContent =
				'Send or clear your draft before updating.';
			return;
		}
		// Preserve unsaved memory fields before the user-requested reload.
		$('memory-form').dispatchEvent(
			new Event('submit', { bubbles: true, cancelable: true })
		);
		update.disabled = true;
		updateRequested = true;
		if (pendingReload) {
			location.reload();
		} else {
			registration.waiting.postMessage({ type: 'ACTIVATE_UPDATE' });
		}
	});

	if (
		'serviceWorker' in navigator &&
		window.isSecureContext &&
		location.protocol !== 'file:'
	) {
		let hadController = !!navigator.serviceWorker.controller;
		navigator.serviceWorker.addEventListener(
			'controllerchange',
			function () {
				if (hadController && !reloading) {
					if (updateRequested) {
						reloading = true;
						location.reload();
					} else {
						pendingReload = true;
						offerUpdate();
					}
				}
				hadController = true;
			}
		);
		navigator.serviceWorker
			.register('sw.js', { scope: './', updateViaCache: 'none' })
			.then(function (value) {
				registration = value;
				offerUpdate();
				registration.addEventListener('updatefound', function () {
					const worker = registration.installing;
					if (worker) {
						worker.addEventListener('statechange', offerUpdate);
					}
				});
				return new Promise(function (resolve, reject) {
					const timeout = setTimeout(function () {
						reject(new Error('Offline setup timed out'));
					}, 15000);
					navigator.serviceWorker.ready.then(
						function (ready) {
							clearTimeout(timeout);
							resolve(ready);
						},
						function (error) {
							clearTimeout(timeout);
							reject(error);
						}
					);
				});
			})
			.then(function () {
				offlineReady = true;
				connectionNote();
			})
			.catch(function () {
				$('offline-status').textContent =
					'Offline setup unavailable. Frank still works while this page is open.';
			});
	} else {
		$('offline-status').textContent =
			location.protocol === 'file:'
				? 'Install/offline support needs HTTPS hosting or localhost.'
				: 'Offline install isn’t supported in this browser.';
	}
	window.addEventListener('online', connectionNote);
	window.addEventListener('offline', connectionNote);
})();
