/* Feral Frank · Konrad Sroka · 2026 · GPL-3.0-only.
 * Bounded, device-local scratch notes. Nothing here is sent to a model.
 */
(function () {
	'use strict';
	const $ = function (id) {
		return document.getElementById(id);
	};
	const key = 'feral-frank-scratch-v1';
	let notes = [];
	let persistent = true;
	let previousFocus = null;
	try {
		const stored = JSON.parse(window.FrankStorage.read(key) || '[]');
		if (Array.isArray(stored)) {
			notes = stored
				.filter(function (n) {
					return typeof n === 'string';
				})
				.slice(0, 6)
				.map(function (n) {
					return n.slice(0, 600);
				});
		}
	} catch (error) {
		persistent = false;
	}
	function save() {
		try {
			window.FrankStorage.write(key, JSON.stringify(notes));
			persistent = true;
		} catch (error) {
			persistent = false;
		}
		$('scratch-status').textContent = persistent
			? notes.length + ' of 6 notes · saved on this device'
			: 'Storage unavailable. Notes last for this tab only.';
	}
	document.addEventListener('frank:storage-policy', save);
	function render() {
		$('scratch-list').textContent = '';
		notes.forEach(function (text, index) {
			const item = document.createElement('li');
			const content = document.createElement('p');
			content.textContent = text;
			content.dir = 'auto';
			item.appendChild(content);
			const use = document.createElement('button');
			use.type = 'button';
			use.textContent = 'Bring to chat';
			use.addEventListener('click', function () {
				if (setDraft(text)) {
					closeStuff();
					$('q').focus();
				}
			});
			item.appendChild(use);
			const remove = document.createElement('button');
			remove.type = 'button';
			remove.textContent = 'Delete';
			remove.setAttribute('aria-label', 'Delete note ' + (index + 1));
			remove.addEventListener('click', function () {
				notes.splice(index, 1);
				save();
				render();
				const next = $('scratch-list').querySelector('button');
				(next || $('scratch-input')).focus();
			});
			item.appendChild(remove);
			$('scratch-list').appendChild(item);
		});
	}
	function setDraft(text) {
		if ($('q').disabled) {
			$('scratch-status').textContent =
				'Connect AI in Settings before bringing a note to chat.';
			return false;
		}
		if ($('q').value.trim()) {
			$('scratch-status').textContent =
				'Your draft is still in chat. Send or clear it before adding another thought.';
			return false;
		}
		$('q').value = text.slice(0, 2000);
		$('q').focus();
		return true;
	}
	$('scratch-form').addEventListener('submit', function (event) {
		event.preventDefault();
		const value = $('scratch-input').value.trim();
		if (!value) {
			return;
		}
		if (notes.length >= 6) {
			$('scratch-status').textContent =
				'Six notes is the limit. Remove one before adding another.';
			return;
		}
		notes.unshift(value.slice(0, 600));
		$('scratch-input').value = '';
		save();
		render();
	});
	function closeStuff() {
		$('my-stuff').classList.remove('is-open');
		$('stuff-open').setAttribute('aria-expanded', 'false');

		document.querySelector('.companion').removeAttribute('inert');
		document.querySelector('.chat-workspace').removeAttribute('inert');
		$('my-stuff').removeAttribute('role');
		$('my-stuff').removeAttribute('aria-modal');
		if (previousFocus && previousFocus.getClientRects().length) {
			previousFocus.focus();
		}
		previousFocus = null;
	}
	$('stuff-open').addEventListener('click', function () {
		if (!$('memory-panel').hidden) {
			$('memory-close').click();
		}
		previousFocus = document.activeElement;
		$('my-stuff').classList.add('is-open');
		this.setAttribute('aria-expanded', 'true');
		$('my-stuff').setAttribute('role', 'dialog');
		$('my-stuff').setAttribute('aria-modal', 'true');
		document.querySelector('.companion').setAttribute('inert', '');
		document.querySelector('.chat-workspace').setAttribute('inert', '');
		$('stuff-title').focus();
	});
	$('stuff-close').addEventListener('click', closeStuff);
	$('my-stuff').addEventListener('keydown', function (event) {
		if (!$('my-stuff').classList.contains('is-open')) {
			return;
		}
		if (event.key === 'Escape') {
			event.preventDefault();
			closeStuff();
		}
		if (event.key === 'Tab') {
			const nodes = Array.from(
				this.querySelectorAll('button,textarea,a,summary')
			).filter(function (n) {
				return !n.disabled && n.getClientRects().length;
			});
			const first = nodes[0],
				last = nodes[nodes.length - 1];
			if (
				event.shiftKey &&
				(document.activeElement === first ||
					document.activeElement === $('stuff-title'))
			) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		}
	});
	document.querySelectorAll('[data-open-notes]').forEach(function (button) {
		button.addEventListener('click', function () {
			$('stuff-open').click();
		});
	});
	save();
	render();
})();
