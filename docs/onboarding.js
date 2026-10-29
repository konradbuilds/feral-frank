/* Feral Frank: an honest written preview and optional live AI setup.
 * Demo exchanges never enter chat history, memory, or an AI request.
 */
(() => {
	'use strict';
	const $ = (id) => document.getElementById(id);
	const log = $('log');
	const panel = document.createElement('section');
	panel.id = 'guided-demo';
	panel.hidden = true;
	panel.setAttribute('aria-label', 'Written demo conversation');
	log.before(panel);
	let returnFocus;
	function button(label, action, primary = false) {
		const el = document.createElement('button');
		el.type = 'button';
		el.textContent = label;
		el.className = primary ? 'start-primary' : 'start-choice';
		el.onclick = action;
		return el;
	}
	function text(tag, words, className) {
		const el = document.createElement(tag);
		el.textContent = words;
		if (className) el.className = className;
		return el;
	}
	function close(restore = true) {
		panel.hidden = true;
		log.hidden = false;
		if (restore)
			(returnFocus?.isConnected && returnFocus.getClientRects().length
				? returnFocus
				: $('memory-open')
			).focus();
	}
	const scenes = {
		day: {
			title: 'Rough day',
			reply: 'Park it by the bins. What’s still doing your head in?',
			choices: [
				[
					'I spent all day fixing tiny things.',
					'Ah. Eight hours of “nearly done”. Pick one thing that’s finished. The rest can remain tomorrow’s problem.',
				],
				[
					'No advice. Just company.',
					'Got it. No five-step plan. Pull up a crate. We can let the day be a bit shit without turning it into homework.',
				],
			],
		},
		idea: {
			title: 'Help me untangle an idea',
			reply: 'Alright. Before we build a spaceship: what should this make easier?',
			choices: [
				[
					'Explaining the same project over and over.',
					'Let’s keep one small brief: your goal, decisions and what’s already done. You can correct it. Next time, we start there.',
				],
				[
					'Actually finishing something.',
					'One person. One problem. One useful result. Everything else goes in the “lovely idea, mate, later” pile.',
				],
			],
		},
	};
	function bubble(words, mine = false) {
		const node = text('p', words, 'demo-bubble' + (mine ? ' mine' : ''));
		node.tabIndex = -1;
		panel.append(node);
		return node;
	}
	function demo(key) {
		if (window.FrankConnection.ready()) {
			$('q').focus();
			return;
		}
		if (panel.hidden) returnFocus = document.activeElement;
		if (!$('memory-panel').hidden) $('memory-close').click();
		panel.replaceChildren();
		log.hidden = true;
		panel.hidden = false;
		const header = document.createElement('div');
		header.className = 'demo-heading';
		const heading = text('h2', 'Demo · written preview');
		heading.tabIndex = -1;
		header.append(
			heading,
			button('Close demo', () => close())
		);
		panel.append(header);
		panel.append(
			text(
				'p',
				'Choose a reply. No AI, key or signup needed.',
				'start-hint'
			)
		);
		if (!key) {
			bubble('Hi, I’m Frank. What brings you to the bins?');
			Object.entries(scenes).forEach(([id, scene]) =>
				panel.append(button(scene.title, () => demo(id)))
			);
		} else {
			const scene = scenes[key];
			bubble(scene.title, true);
			bubble(scene.reply);
			const choices = document.createElement('div');
			choices.className = 'demo-choices';
			panel.append(choices);
			scene.choices.forEach(([prompt, reply]) =>
				choices.append(
					button(prompt, () => {
						choices.remove();
						bubble(prompt, true);
						const response = bubble(reply);
						panel.append(
							text(
								'p',
								'That was a written example. Connect AI for your own conversation.',
								'start-hint'
							)
						);
						const next = button(
							'Connect AI to chat',
							connect,
							true
						);
						panel.append(
							next,
							button('Try the other scene', () =>
								demo(key === 'day' ? 'idea' : 'day')
							)
						);
						response.focus({ preventScroll: true });
						panel.scrollTop +=
							response.getBoundingClientRect().top -
							panel.getBoundingClientRect().top -
							header.offsetHeight -
							12;
					})
				)
			);
		}
		heading.focus();
		panel.scrollTop = 0;
	}
	/* One place to connect, and it lives at the top of Settings. This used to
	 * build a second key form here, which meant two different boxes asking for
	 * the same key. */
	function connect() {
		if (window.FrankConnection.ready()) {
			$('q').focus();
			return;
		}
		close(false);
		if ($('memory-panel').hidden) $('memory-open').click();
		$('connect-setup').hidden = false;
		$('ai-settings').open = false;
		const field = $('connect-key');
		if (field && !$('connect-key-step').hidden) field.focus();
		else $('connect-setup-title').focus();
	}

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && !panel.hidden) {
			close();
			event.preventDefault();
		}
	});
	document.addEventListener('frank:connection', () => {
		const ready = window.FrankConnection.ready();
		document.querySelectorAll('.demo-launch').forEach((el) => {
			el.hidden = ready;
		});
		if (ready && !panel.hidden) close(false);
		const intro = $('message-intro');
		if (intro) {
			intro.querySelector('span').textContent = ready
				? 'Hi, I’m Frank. What’s on your mind?'
				: 'Hi, I’m Frank. Pull up a crate. Want a quick look around?';
			const action = intro.querySelector(
				'.intro-connect:not(.demo-launch)'
			);
			if (action) {
				action.textContent = ready ? 'Start chatting' : 'Connect my AI';
				action.onclick = ready ? () => $('q').focus() : null;
			}
		}
	});
	// Feeding is local, but its action and reply belong to the real chat history.
	const lines = {
		drink: [
			'Alright, cheers!',
			'Yeah, let’s go!',
			'A toast to getting through today.',
			'Cheers, mate!',
		],
		joint: [
			'Oh, lovely. Cheers, mate.',
			'Now that’s a proper bin-side welcome.',
			'Alright. Pull up a crate.',
			'You absolute legend.',
		],
	};
	const cursors = { drink: 0, joint: 0 };
	for (const kind of ['drink', 'joint'])
		$(kind).addEventListener('click', () => {
			close(false);
			const reply = lines[kind][cursors[kind]++ % lines[kind].length];
			document.dispatchEvent(new CustomEvent('frank:feeding', {
				detail: { kind, reply },
			}));
		});
	const preview = button('Try a demo conversation', () => demo());
	preview.classList.add('demo-launch');
	$('guide-connect').before(preview);
	window.FrankStart = { demo, connect };
})();
