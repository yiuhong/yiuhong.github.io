/*
	Hyperspace by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$sidebar = $('#sidebar');

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ null,      '480px'  ]
		});

	// Hack: Enable IE flexbox workarounds.
		if (browser.name == 'ie')
			$body.addClass('is-ie');

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Forms.

		// Hack: Activate non-input submits.
			$('form').on('click', '.submit', function(event) {

				// Stop propagation, default.
					event.stopPropagation();
					event.preventDefault();

				// Submit form.
					$(this).parents('form').submit();

			});

	// Sidebar.
		if ($sidebar.length > 0) {

			var $sidebar_a = $sidebar.find('a'),
				$toggle = $sidebar.find('.mobile-nav-toggle'),
				$nav = $sidebar.find('nav'),
				$page = $('#wrapper, #footer'),
				mobileNavQuery = window.matchMedia('(max-width: 736px)');

			// Mobile menu. The template hides #sidebar below 736px; this toggle replaces it.
				var setMobileNavOpen = function(open) {

					open = !!open && mobileNavQuery.matches;

					$sidebar.toggleClass('is-nav-open', open);
					$body.toggleClass('is-nav-open', open);

					if ($toggle.length > 0) {

						$toggle.attr('aria-expanded', open ? 'true' : 'false');
						$toggle.find('.mobile-nav-toggle-label').text(open ? 'Close' : 'Menu');

					}

					if (open || !mobileNavQuery.matches)
						$nav.removeAttr('aria-hidden');
					else
						$nav.attr('aria-hidden', 'true');

					$page.each(function() {

						this.inert = open;

						if (open)
							this.setAttribute('aria-hidden', 'true');
						else
							this.removeAttribute('aria-hidden');

					});

				};

				var focusSectionTarget = function(href) {

					var target, heading, focusTarget;

					if (!href || href.charAt(0) != '#')
						return;

					target = document.querySelector(href);

					if (!target)
						return;

					heading = target.querySelector('h1, h2, h3, h4');
					focusTarget = heading || target;

					if (!focusTarget.hasAttribute('tabindex'))
						focusTarget.setAttribute('tabindex', '-1');

					focusTarget.focus({ preventScroll: true });

				};

				if ($toggle.length > 0) {

					$toggle.on('click', function(event) {

						event.preventDefault();
						event.stopPropagation();
						setMobileNavOpen(!$sidebar.hasClass('is-nav-open'));

					});

					$body.on('click', function(event) {

						if (!$sidebar.hasClass('is-nav-open'))
							return;

						if ($(event.target).closest('#sidebar').length)
							return;

						setMobileNavOpen(false);

					});

					$window.on('keydown', function(event) {

						var focusables, first, last;

						if (!$sidebar.hasClass('is-nav-open'))
							return;

						if (event.key == 'Escape') {

							event.preventDefault();
							setMobileNavOpen(false);
							$toggle.trigger('focus');
							return;

						}

						if (event.key != 'Tab')
							return;

						focusables = $sidebar.find('button, a').filter(':visible');

						if (focusables.length == 0)
							return;

						first = focusables[0];
						last = focusables[focusables.length - 1];

						if (event.shiftKey && document.activeElement === first) {

							event.preventDefault();
							last.focus();

						}
						else if (!event.shiftKey && document.activeElement === last) {

							event.preventDefault();
							first.focus();

						}

					});

					var onMobileNavViewport = function() {

						if (!mobileNavQuery.matches)
							setMobileNavOpen(false);
						else if (!$sidebar.hasClass('is-nav-open'))
							$nav.attr('aria-hidden', 'true');

					};

					if (mobileNavQuery.addEventListener)
						mobileNavQuery.addEventListener('change', onMobileNavViewport);
					else if (mobileNavQuery.addListener)
						mobileNavQuery.addListener(onMobileNavViewport);

					onMobileNavViewport();

				}

			$sidebar_a
				.addClass('scrolly')
				.on('click', function() {

					var $this = $(this);

					// Close the mobile menu once a destination is chosen.
					// Focus moves on the next turn so it is not dropped while the
					// page behind the menu is still inert.
						if (mobileNavQuery.matches) {

							var mobileHref = $this.attr('href');

							setMobileNavOpen(false);
							window.setTimeout(function() {

								focusSectionTarget(mobileHref);

							}, 0);

						}

					// External link? Bail.
						if ($this.attr('href').charAt(0) != '#')
							return;

					// Deactivate all links.
						$sidebar_a.removeClass('active');

					// Activate link *and* lock it (so Scrollex doesn't try to activate other links as we're scrolling to this one's section).
						$this
							.addClass('active')
							.addClass('active-locked');

				})
				.each(function() {

					var	$this = $(this),
						id = $this.attr('href'),
						$section = $(id);

					// No section for this link? Bail.
						if ($section.length < 1)
							return;

					// Scrollex.
						$section.scrollex({
							mode: 'middle',
							top: '-20vh',
							bottom: '-20vh',
							initialize: function() {

								// Deactivate section.
									$section.addClass('inactive');

							},
							enter: function() {

								// Activate section.
									$section.removeClass('inactive');

								// No locked links? Deactivate all links and activate this section's one.
									if ($sidebar_a.filter('.active-locked').length == 0) {

										$sidebar_a.removeClass('active');
										$this.addClass('active');

									}

								// Otherwise, if this section's link is the one that's locked, unlock it.
									else if ($this.hasClass('active-locked'))
										$this.removeClass('active-locked');

							}
						});

				});

		}

	// Scrolly.
		$('.scrolly').scrolly({
			speed: 1000,
			offset: function() {

				if ($sidebar.length == 0)
					return 0;

				// Fixed mobile menu bar.
					if (window.matchMedia('(max-width: 736px)').matches)
						return $sidebar.outerHeight();

				// If <=large, >small, and sidebar is present, use its height as the offset.
					if (breakpoints.active('<=large')
					&&	!breakpoints.active('<=small'))
						return $sidebar.height();

				return 0;

			}
		});

	// Spotlights.
		$('.spotlights > section')
			.scrollex({
				mode: 'middle',
				top: '-10vh',
				bottom: '-10vh',
				initialize: function() {

					// Deactivate section.
						$(this).addClass('inactive');

				},
				enter: function() {

					// Activate section.
						$(this).removeClass('inactive');

				}
			})
			.each(function() {

				var	$this = $(this),
					$image = $this.find('.image'),
					$img = $image.find('img'),
					x;

				// Assign image.
					$image.css('background-image', 'url(' + $img.attr('src') + ')');

				// Set background position.
					if (x = $img.data('position'))
						$image.css('background-position', x);

				// Hide <img>.
					$img.hide();

			});

	// Features.
		$('.features')
			.scrollex({
				mode: 'middle',
				top: '-20vh',
				bottom: '-20vh',
				initialize: function() {

					// Deactivate section.
						$(this).addClass('inactive');

				},
				enter: function() {

					// Activate section.
						$(this).removeClass('inactive');

				}
			});

})(jQuery);