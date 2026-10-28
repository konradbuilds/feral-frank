/* Feral Frank · Konrad Sroka · GPL-3.0-only.
 * A visible storage budget and a guide; no RAM claims or model training.
 */
(function () {
	'use strict';
	const $ = (id) => document.getElementById(id);
	const storage = window.FrankStorage;
	let chosen = storage.presets.findIndex(
		(p) => p.id === storage.profile().id
	);
	$('storage-level').value = chosen;
	$('guide-connect').addEventListener('click', () => {
		$('ai-settings').open = true;
		$('ai-settings').querySelector('summary').focus();
	});
	function format(bytes) {
		return bytes >= 1024 * 1024
			? (bytes / (1024 * 1024)).toFixed(1) + ' MiB'
			: Math.ceil(bytes / 1024) + ' KiB';
	}
	const originalTitle = document.title;
	let usageTimer = 0;
	try {
		$('usage-tab').checked =
			storage.read('feral-frank-diagnostics-v1') === 'title';
	} catch (error) {
		/* Optional preference. */
	}
	function updateUsage() {
		const status = storage.status(),
			count = window.FrankChatStorage.count();
		const heap = Number(performance.memory?.usedJSHeapSize);
		const memory =
			Number.isFinite(heap) && heap > 0
				? format(heap) + ' JS heap (estimate)'
				: 'JS heap unavailable in this browser';
		$('runtime-usage').textContent = count + ' chat messages · ' + memory;
		if ($('usage-tab').checked && !document.hidden)
			document.title =
				'Frank · ' +
				count +
				' messages · ' +
				format(status.bytes) +
				' saved' +
				(heap > 0 ? ' · ~' + format(heap) + ' JS' : '');
		else document.title = originalTitle;
	}
	function usageLifecycle() {
		clearInterval(usageTimer);
		usageTimer = 0;
		updateUsage();
		if (
			!document.hidden &&
			($('usage-tab').checked ||
				($('storage-settings').open && !$('memory-panel').hidden))
		)
			usageTimer = setInterval(updateUsage, 2000);
	}
	$('usage-tab').addEventListener('change', () => {
		try {
			storage.write(
				'feral-frank-diagnostics-v1',
				$('usage-tab').checked ? 'title' : 'off'
			);
		} catch (error) {
			/* Works for this tab. */
		}
		usageLifecycle();
	});
	document.addEventListener('visibilitychange', usageLifecycle);
	new MutationObserver(usageLifecycle).observe($('memory-panel'), {
		attributes: true,
		attributeFilter: ['hidden'],
	});
	function render() {
		const status = storage.status(),
			preset = storage.presets[chosen];
		$('storage-profile').textContent =
			preset.label +
			' · ' +
			format(preset.bytes) +
			' · up to ' +
			preset.messages +
			' messages';
		$('storage-level').setAttribute(
			'aria-valuetext',
			$('storage-profile').textContent
		);
		$('storage-used').textContent = status.available
			? format(status.bytes) +
				' currently saved · active profile: ' +
				storage.profile().label
			: 'Browser storage is blocked. Frank works for this tab; these settings cannot be saved.';
		$('storage-warning').hidden = !status.failed;
		$('f')
			.closest('footer')
			.classList.toggle('has-storage-warning', status.failed);
		$('storage-level').disabled = !status.available;
		$('storage-apply').disabled = !status.available;
		if (!status.available) {
			$('storage-preview').textContent = 'No saved data will be removed.';
			return;
		}
		try {
			const plan = window.FrankChatStorage.preview(preset.id);
			$('storage-preview').textContent = !plan.fits
				? 'Saved facts and notes cannot fit this limit. Choose a higher profile or export/remove some first.'
				: plan.removed
					? 'Applying this removes the oldest ' +
						plan.removed +
						' chat messages and keeps the newest ' +
						plan.state.log.length +
						'. Personal facts and notes stay.'
					: 'This change removes no current messages. Personal facts and notes stay.';
			$('storage-apply').disabled = !plan.fits;
			$('storage-apply').textContent = plan.removed
				? 'Apply & remove ' + plan.removed + ' older messages'
				: 'Apply profile';
		} catch (error) {
			$('storage-apply').disabled = true;
			$('storage-preview').textContent =
				'Could not read saved data. No changes made.';
		}
	}
	$('storage-level').addEventListener('input', () => {
		chosen = Number($('storage-level').value);
		$('storage-feedback').textContent = '';
		render();
	});
	$('storage-apply').addEventListener('click', () => {
		try {
			const plan = window.FrankChatStorage.apply(
				storage.presets[chosen].id
			);
			$('storage-feedback').textContent =
				plan.profile.label +
				' saved. ' +
				(plan.removed
					? plan.removed + ' older chat messages removed. '
					: '') +
				'Personal facts and notes kept.';
		} catch (error) {
			$('storage-feedback').textContent =
				error.message ||
				'The browser could not save this profile. Previous saved data was kept.';
		}
		render();
	});
	$('storage-export').addEventListener('click', () =>
		$('memory-export').click()
	);
	document.addEventListener('frank:storage', () => {
		updateUsage();
		const status = storage.status();
		$('storage-warning').hidden = !status.failed;
		$('f')
			.closest('footer')
			.classList.toggle('has-storage-warning', status.failed);
		if ($('storage-settings').open && !$('memory-panel').hidden) render();
	});
	$('storage-settings').addEventListener('toggle', () => {
		if ($('storage-settings').open) render();
		usageLifecycle();
	});
	render();
	usageLifecycle();
})();
