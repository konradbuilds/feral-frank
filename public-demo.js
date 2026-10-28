/* Public preview: no key entry, provider requests or saved setting changes. */
(function () {
	'use strict';
	if (document.querySelector('meta[name="frank-bridge"]')) return;
	const notice = document.createElement('dialog');
	notice.className = 'demo-install-notice';
	notice.innerHTML =
		'<h2>Make Frank yours</h2><p>This is a demo. Download Frank and run your own copy to connect AI. Never paste an API key here.</p><p>Already installed this copy? <a href="frank.php">Open installed Frank →</a> and sign in with your existing password.</p><p><a href="SETUP.md" target="_blank" rel="noopener">Installation steps ↗</a></p><form method="dialog"><button>Back to the demo</button></form>';
	document.body.append(notice);
	const banner = document.createElement('p');
	banner.className = 'public-demo-notice';
	banner.textContent = 'Demo · no live AI';
	document.querySelector('.chat-heading').prepend(banner);
	const show = () => {
		if (!notice.open) notice.showModal();
	};
	window.FrankDemoNotice = show;
	document
		.querySelectorAll('#memory-panel input, #memory-panel textarea')
		.forEach((field) => {
			if (field.closest('#character-settings')) return;
field.readOnly = true;
			field.autocomplete = 'off';
			if (field.type === 'password')
				field.placeholder = 'Demo — install to add your key';
		});
	document.addEventListener(
		'click',
		(event) => {
			const control = event.target.closest(
				'#memory-panel button, #memory-panel input, #memory-panel select, #memory-panel textarea',
			);
			if (!control || control.closest('a') || control.closest('#character-settings')) return;
			if (
				['settings-close', 'memory-close', 'guide-connect', 'connect-provider'].includes(
					control.id,
				)
			)
				return;
			event.preventDefault();
			event.stopImmediatePropagation();
			show();
		},
		true,
	);
	document.addEventListener(
		'keydown',
		(event) => {
			if (
				event.target.matches(
					'#memory-panel input, #memory-panel select, #memory-panel textarea',
				) &&
				!event.target.closest('#character-settings') && event.target.id !== 'connect-provider' && !['Tab', 'Escape'].includes(event.key)
			) {
				event.preventDefault();
				event.stopImmediatePropagation();
				show();
			}
		},
		true,
	);
})();
