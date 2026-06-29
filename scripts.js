// ===== FOCUS TRAP UTILITIES (Accessibility - WCAG 2.2 AA) =====
var _trapFocusHandler = null;
var _lastFocusedElement = null;

function getFocusableElements(containerEl) {
    var selector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.prototype.slice.call(containerEl.querySelectorAll(selector));
}

function trapFocus(containerEl) {
    releaseFocusTrap(); // clear any existing trap first
    var focusable = getFocusableElements(containerEl);
    if (focusable.length === 0) return;

    // Focus the first focusable element
    focusable[0].focus();

    _trapFocusHandler = function (e) {
        if (e.key !== 'Tab') return;

        var currentFocusable = getFocusableElements(containerEl);
        if (currentFocusable.length === 0) return;

        var firstEl = currentFocusable[0];
        var lastEl = currentFocusable[currentFocusable.length - 1];

        if (e.shiftKey) {
            // Shift+Tab: if on first element, wrap to last
            if (document.activeElement === firstEl) {
                e.preventDefault();
                lastEl.focus();
            }
        } else {
            // Tab: if on last element, wrap to first
            if (document.activeElement === lastEl) {
                e.preventDefault();
                firstEl.focus();
            }
        }
    };

    containerEl.addEventListener('keydown', _trapFocusHandler);
}

function releaseFocusTrap() {
    if (_trapFocusHandler) {
        // Remove the handler from whichever element had it
        // We store it globally so we just clear the reference
        document.removeEventListener('keydown', _trapFocusHandler);
        _trapFocusHandler = null;
    }
}

// ===== EXIT-INTENT MODAL FOCUS MANAGEMENT =====
function showExitModal() {
    var modal = document.getElementById('exit-intent-modal');
    if (!modal) return;

    _lastFocusedElement = document.activeElement;
    modal.hidden = false;
    trapFocus(modal);
}

function hideExitModal() {
    var modal = document.getElementById('exit-intent-modal');
    if (!modal) return;

    releaseFocusTrap();
    modal.hidden = true;

    // Restore focus
    if (_lastFocusedElement && _lastFocusedElement.focus) {
        _lastFocusedElement.focus();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // 1. Smooth Scrolling for Navigation Links
    var links = document.querySelectorAll('.nav-link, .logo-link');

    links.forEach(function (link) {
        link.addEventListener('click', function (e) {
            var href = link.getAttribute('href');

            // Only handle internal anchor links
            if (href && href.startsWith('#')) {
                e.preventDefault();
                var targetId = href.substring(1);
                var targetElement = document.getElementById(targetId);

                if (targetElement) {
                    // Close mobile menu if open
                    var navList = document.querySelector('.nav-list');
                    var navToggle = document.querySelector('.mobile-nav-toggle');
                    if (navList && navList.getAttribute('data-visible') === 'true') {
                        releaseFocusTrap();
                        navList.setAttribute('data-visible', 'false');
                    }
                    if (navToggle) {
                        navToggle.setAttribute('aria-expanded', 'false');
                    }

                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // 2. Mobile Menu Toggle (with focus trap)
    var navToggle = document.querySelector('.mobile-nav-toggle');
    var navList = document.querySelector('.nav-list');

    if (navToggle && navList) {
        navToggle.addEventListener('click', function () {
            var isVisible = navList.getAttribute('data-visible') === 'true';
            var opening = !isVisible;

            navList.setAttribute('data-visible', String(opening));
            navToggle.setAttribute('aria-expanded', String(opening));

            if (opening) {
                _lastFocusedElement = document.activeElement;
                trapFocus(navList);
            } else {
                releaseFocusTrap();
                navToggle.focus();
            }
        });

        // Close mobile menu on click outside (the 30% overlay gap)
        document.addEventListener('click', function (e) {
            if (navList.getAttribute('data-visible') === 'true') {
                var isNavClick = navList.contains(e.target);
                var isToggleClick = navToggle.contains(e.target);
                if (!isNavClick && !isToggleClick) {
                    releaseFocusTrap();
                    navList.setAttribute('data-visible', 'false');
                    navToggle.setAttribute('aria-expanded', 'false');
                    navToggle.focus();
                }
            }
        });

        // Close mobile menu on ESC key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navList.getAttribute('data-visible') === 'true') {
                releaseFocusTrap();
                navList.setAttribute('data-visible', 'false');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.focus();
            }
        });
    }

    // 3. Update Footer Year
    var yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // 4. Exit-Intent Modal
    var exitModal = document.getElementById('exit-intent-modal');
    if (exitModal) {
        // Wire up close button
        var closeBtn = exitModal.querySelector('.exit-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', hideExitModal);
        }

        // Wire up "No thanks" button
        var noThanksBtn = exitModal.querySelector('.btn-primary');
        if (noThanksBtn) {
            noThanksBtn.addEventListener('click', hideExitModal);
        }

        // Close modal on ESC key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !exitModal.hidden) {
                hideExitModal();
            }
        });
    }

    // 5. Contact Form Handling
    var contactForm = document.getElementById('contact-form');
    var formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var nameInput = contactForm.querySelector('#name');
            var name = nameInput ? nameInput.value.trim() : '';

            // Basic client-side validation
            var emailInput = contactForm.querySelector('#email');
            var messageInput = contactForm.querySelector('#message');
            var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            var isValid = true;

            if (!name) {
                isValid = false;
                nameInput.focus();
            } else if (emailInput && !emailInput.value.trim()) {
                isValid = false;
                emailInput.focus();
            } else if (emailInput && !emailPattern.test(emailInput.value.trim())) {
                isValid = false;
                emailInput.focus();
                formStatus.textContent = 'Please enter a valid email address.';
                formStatus.className = 'form-status text-error';
                return;
            } else if (messageInput && !messageInput.value.trim()) {
                isValid = false;
                messageInput.focus();
            }

            if (!isValid) {
                formStatus.textContent = 'Please fill in all required fields.';
                formStatus.className = 'form-status text-error';
                return;
            }

            // Show sending state
            formStatus.textContent = 'Sending your message...';
            formStatus.className = 'form-status text-accent';

            /*
             * TODO: Connect to a form service.
             * Replace this simulated submission with a real fetch() call:
             *
             *   fetch('https://formspree.io/f/yourFormID', {
             *       method: 'POST',
             *       body: new FormData(contactForm),
             *       headers: { 'Accept': 'application/json' }
             *   })
             *   .then(...)
             */

            setTimeout(function () {
                formStatus.textContent = 'Thank you, ' + name + '! Your message has been sent. I will respond as soon as possible.';
                formStatus.className = 'form-status text-success';
                contactForm.reset();

                // Clear success message after 8 seconds
                setTimeout(function () {
                    formStatus.textContent = '';
                }, 8000);
            }, 1500);
        });
    }
});
