/* Feral Frank · Konrad Sroka · 2026 · GPL-3.0-only.
 * Migrate the previous key spelling before any app state loads.
 * Copy first, verify, then remove; failed writes leave the original intact.
 */
(function () {
	'use strict';
	function previousKeys() {
		const keys = [];
		for (let index = 0; index < localStorage.length; index += 1) {
			const key = localStorage.key(index);
			if (/^fer{2}al-frank-/.test(key || '')) {
				keys.push(key);
			}
		}
		return keys;
	}
	function canonicalKey(key) {
		return key.replace(/^fer{2}al-/, 'feral-');
	}
	const POLICY = 'feral-frank-storage-v1';
	const CHAT = 'feral-frank-v1';
	const presets = Object.freeze([
		{ id: 'low', label: 'Low', bytes: 256 * 1024, messages: 40 },
		{
			id: 'medium',
			label: 'Medium',
			bytes: 2 * 1024 * 1024,
			messages: 200,
		},
		{ id: 'high', label: 'High', bytes: 3 * 1024 * 1024, messages: 500 },
		{
			id: 'extra',
			label: 'Extra high',
			bytes: 4 * 1024 * 1024,
			messages: 1000,
		},
	]);
	const failed = new Set();
	function policy(id) {
		if (!id) {
			try {
				id = JSON.parse(localStorage.getItem(POLICY) || '{}').id;
			} catch (error) {
				/* Medium works without storage. */
			}
		}
		return presets.find((p) => p.id === id) || presets[1];
	}
	function size(key, value) {
		return value === null ? 0 : 2 * (key.length + value.length);
	}
	function usage() {
		let bytes = 0;
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (/^fer(?:r)?al-frank-/.test(key || ''))
				bytes += size(key, localStorage.getItem(key));
		}
		return bytes;
	}
	function status() {
		try {
			return {
				bytes: usage(),
				limit: policy().bytes,
				profile: policy().id,
				available: true,
				failed: failed.size > 0,
			};
		} catch (error) {
			return {
				bytes: 0,
				limit: policy().bytes,
				profile: policy().id,
				available: false,
				failed: true,
			};
		}
	}
	function notify() {
		document.dispatchEvent(
			new CustomEvent('frank:storage', { detail: status() })
		);
	}
	function write(key, value) {
		try {
			if (!/^feral-frank-/.test(key))
				throw new Error('Unknown Frank store.');
			value = String(value);
			const next =
				usage() -
				size(key, localStorage.getItem(key)) +
				size(key, value);
			if (next > policy().bytes)
				throw new DOMException(
					'Frank’s saved-data limit is reached.',
					'QuotaExceededError'
				);
			localStorage.setItem(key, value);
			failed.delete(key);
			notify();
		} catch (error) {
			failed.add(key);
			notify();
			throw error;
		}
	}
	function planChat(state, id) {
		const chosen = policy(id),
			policyText = JSON.stringify({ id: chosen.id });
		const other =
			usage() -
			size(CHAT, localStorage.getItem(CHAT)) -
			size(POLICY, localStorage.getItem(POLICY)) +
			size(POLICY, policyText);
		const max = Math.min(chosen.messages, state.log.length);
		function candidate(count) {
			const next = {
				...state,
				log: count ? state.log.slice(-count) : [],
			};
			const text = JSON.stringify(next);
			return { state: next, text, bytes: other + size(CHAT, text) };
		}
		let next = candidate(max);
		if (next.bytes > chosen.bytes) {
			let low = 0,
				high = max,
				best = candidate(0);
			if (best.bytes > chosen.bytes)
				return { ...best, fits: false, removed: 0, profile: chosen };
			while (low <= high) {
				const mid = Math.floor((low + high) / 2),
					test = candidate(mid);
				if (test.bytes <= chosen.bytes) {
					best = test;
					low = mid + 1;
				} else high = mid - 1;
			}
			next = best;
		}
		return {
			...next,
			fits: true,
			removed: state.log.length - next.state.log.length,
			profile: chosen,
		};
	}
	function commitProfile(plan) {
		if (!plan.fits)
			throw new Error(
				'Saved facts and notes exceed this limit. Export or remove some first, or choose a higher limit.'
			);
		const previous = localStorage.getItem(POLICY);
		// Both setItem calls are atomic individually. If chat fails, retain its old value and restore the policy.
		localStorage.setItem(POLICY, JSON.stringify({ id: plan.profile.id }));
		try {
			localStorage.setItem(CHAT, plan.text);
		} catch (error) {
			if (previous === null) localStorage.removeItem(POLICY);
			else localStorage.setItem(POLICY, previous);
			throw error;
		}
		failed.delete(CHAT);
		notify();
	}

	window.FrankStorage = {
		presets,
		profile: policy,
		status,
		write,
		planChat,
		commitProfile,
		read: function (key) {
			const current = localStorage.getItem(key);
			if (current !== null) {
				return current;
			}
			const previous = previousKeys().find(function (candidate) {
				return canonicalKey(candidate) === key;
			});
			return previous ? localStorage.getItem(previous) : null;
		},
	};
	try {
		previousKeys().forEach(function (previous) {
			const key = canonicalKey(previous);
			if (localStorage.getItem(key) !== null) {
				return; // Current data always takes precedence.
			}
			const value = localStorage.getItem(previous);
			localStorage.setItem(key, value);
			if (localStorage.getItem(key) === value) {
				localStorage.removeItem(previous);
			}
		});
	} catch (error) {
		// The read fallback preserves access when copying is blocked or over quota.
	}
})();
