(function() {
            // --- DOM elements ---
            const noBtn = document.getElementById('noBtn');
            const yesBtn = document.getElementById('yesBtn');
            const loveMsg = document.getElementById('loveMessage');
            const container = document.getElementById('emoji-trail-container');
            const card = document.getElementById('valentineCard');
            const body = document.body;

            // --- state ---
            let yesClicked = false;            // has yes been clicked?
            let messageShown = false;           // to avoid repeated adding of class
            const loveEmojis = ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💖', '💗', '💓', '💞', '💕', '💌', '🌸', '🌺', '🏵️', '🌹', '🥀', '🌷', '💐', '😘', '😍', '🥰', '💋', '💝'];
            // for quick color variation (we'll change by random picking)

            // --- function to generate random emoji with random color (hue) and position near pointer ---
            function spawnEmoji(x, y) {
                if (!yesClicked) return;           // only after yes clicked

                const emoji = document.createElement('div');
                emoji.className = 'trail-emoji';

                // pick random love emoji
                const randomIndex = Math.floor(Math.random() * loveEmojis.length);
                emoji.textContent = loveEmojis[randomIndex];

                // randomize starting position slightly offset from cursor for natural look
                const offsetX = (Math.random() * 40) - 20;  // -20..20px
                const offsetY = (Math.random() * 40) - 20;
                emoji.style.left = (x + offsetX) + 'px';
                emoji.style.top = (y + offsetY) + 'px';

                // apply a random color filter (change emoji color) via text color + some hue-rotate / filter
                // but emojis are text, we can use color, but many emojis don't take color. Use filter hue-rotate and brightness for variation.
                // create random hue rotation 0-360deg, plus some saturate.
                const hueRotate = Math.floor(Math.random() * 360);
                const saturate = Math.floor(Math.random() * 100 + 50); // 50-150%
                emoji.style.filter = `hue-rotate(${hueRotate}deg) saturate(${saturate}%) drop-shadow(0 0 6px hotpink)`;
                // also random text "color" doesn't affect emoji much, but we add a little background glow
                emoji.style.textShadow = `0 0 10px rgb(255, ${100 + Math.random()*100}, 200)`;

                // add to container
                container.appendChild(emoji);

                // remove after 3 seconds (animation end)
                setTimeout(() => {
                    if (emoji.parentNode) emoji.remove();
                }, 3000);
            }

            // --- mousemove event to generate trail ---
            body.addEventListener('mousemove', (e) => {
                if (yesClicked) {
                    spawnEmoji(e.clientX, e.clientY);
                }
            });

            // also touchmove for mobile support (optional)
            body.addEventListener('touchmove', (e) => {
                if (yesClicked && e.touches.length > 0) {
                    const touch = e.touches[0];
                    spawnEmoji(touch.clientX, touch.clientY);
                }
            });

            // --- Yes button click handler ---
            yesBtn.addEventListener('click', (e) => {
                if (yesClicked) return; // already done
                yesClicked = true;
                // show message with bold italic caps
                loveMsg.classList.add('show');
                // optionally hide question or keep it – keep as is for fun
                // no need to hide no button, but we can disable it so it can't be clicked
                noBtn.disabled = true;
                noBtn.style.opacity = '0.6';
                noBtn.style.cursor = 'default';
                yesBtn.disabled = true;  // can't click again
                yesBtn.style.opacity = '0.8';
                // also move no button to somewhere less annoying (optional)
                noBtn.style.transform = 'scale(0.9)';
                // message already visible, but add some extra spark: trigger a few extra emojis around card
                for (let i = 0; i < 12; i++) {
                    setTimeout(() => {
                        if (yesClicked) {
                            // random coordinates near center
                            spawnEmoji(window.innerWidth/2 + (Math.random()-0.5)*300, window.innerHeight/2 + (Math.random()-0.5)*200);
                        }
                    }, i * 80);
                }
            });

            // --- NO button fleeing logic ---
            // we want: when cursor approaches (within 120px) of no button, it jumps to a random nearby location
            // but limited inside button panel / card? Better to keep within viewport near card but not too far.
            // We'll keep it relative to viewport, but near button area.
            function moveNoButtonAway() {
                if (yesClicked) return; // no need to flee if yes already clicked

                const btnRect = noBtn.getBoundingClientRect();
                // compute center of button
                const btnCenterX = btnRect.left + btnRect.width / 2;
                const btnCenterY = btnRect.top + btnRect.height / 2;

                // get current mouse position (from event)
                // but we need to know cursor pos. we will use mousemove below.
                // So we need to attach a mousemove guard.
            }

            // approach detection: on mousemove, check distance to no button
            function handleMouseMove(e) {
                if (yesClicked) return; // stop fleeing after yes

                const mouseX = e.clientX;
                const mouseY = e.clientY;

                const btnRect = noBtn.getBoundingClientRect();
                // compute distance from mouse to closest point on button rectangle
                let dx = 0, dy = 0;
                if (mouseX < btnRect.left) dx = btnRect.left - mouseX;
                else if (mouseX > btnRect.right) dx = mouseX - btnRect.right;
                // else dx = 0 (mouse inside x range)

                if (mouseY < btnRect.top) dy = btnRect.top - mouseY;
                else if (mouseY > btnRect.bottom) dy = mouseY - btnRect.bottom;

                const dist = Math.sqrt(dx*dx + dy*dy);
                const THRESHOLD = 130; // pixels

                if (dist < THRESHOLD) {
                    // move no button to a new position within safe zone (parent container or viewport but keep it visible)
                    fleeNoButton();
                }
            }

            function fleeNoButton() {
                if (yesClicked) return;
                // get button panel rectangle to roughly stay nearby, but we allow anywhere inside viewport with padding
                const panelRect = document.getElementById('buttonPanel').getBoundingClientRect();
                const noBtnRect = noBtn.getBoundingClientRect();

                // viewport dimensions minus button size
                const maxX = window.innerWidth - noBtnRect.width - 20;
                const maxY = window.innerHeight - noBtnRect.height - 20;
                const minX = 10;
                const minY = 10;

                // generate random position, but try to keep it not too far from original to avoid going off-screen
                // we also want it to feel like it's dodging, not teleport to antarctica.
                // pick random position somewhere around panel but avoid cursor proximity? We'll just random.

                // Let's generate a random position relative to viewport, but clamp.
                let newX = Math.random() * (maxX - minX) + minX;
                let newY = Math.random() * (maxY - minY) + minY;

                // but maybe keep it near the panel area? not needed, but it's fun.
                // also ensure not overlapping yes button too much? but it's okay.

                // apply new position (using left/top relative to viewport)
                // noBtn is inside .button-panel which is relatively positioned? Actually .button-panel is flex, we need to take it out of flow to move freely.
                // easier: set position absolute on noBtn relative to viewport? but parent is not positioned.
                // We'll set .btn-no to fixed positioning when fleeing? but it will jump out of card.
                // Better: wrap or change strategy: we can keep it relative to button panel but we need coordinates relative to parent.
                // Use fixed positioning to make it truly flee anywhere on screen.
                // but then it may escape the card, which is fine, because it's fleeing.

                // let's switch noBtn to position:fixed to escape container and move anywhere
                noBtn.style.position = 'fixed';
                noBtn.style.left = newX + 'px';
                noBtn.style.top = newY + 'px';
                // set a higher z-index to keep it clickable
                noBtn.style.zIndex = '999';
                // keep width from original, but we set left/top, ensure no margins
                noBtn.style.margin = '0';
                // also ensure it's not stretched
                noBtn.style.transform = 'rotate(0deg) scale(1)'; // reset any previous transform

                // add a small animation effect (squeak)
                noBtn.style.transition = 'left 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)';
            }

            // reset style when yes clicked? not necessary, but we disable.

            // listen to mousemove to trigger flee
            document.addEventListener('mousemove', handleMouseMove);

            // also on touch move to flee from finger (approximation)
            document.addEventListener('touchmove', (e) => {
                if (yesClicked) return;
                if (e.touches.length > 0) {
                    const touch = e.touches[0];
                    // simulate mousemove with touch coords
                    handleMouseMove(touch);
                }
            });

            // optional: if noBtn is clicked, prevent default and simulate flee (though it's hard to click when fleeing)
            noBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (yesClicked) return;
                // if somehow clicked before yes, we force it to move away even more
                fleeNoButton();
                // also show a playful alert? better silent flee
            });

            // Ensure that if window resizes, no button is not lost outside viewport, but that's rare

            // Initial styling for noBtn to be inline block (but we might change to fixed later)
            // No pre set fixed, it starts as static/flex item

            // Also when yes clicked, we can optionally move noBtn back? no need.
            // One more: after yes, we stop moving the button, but we set disabled.

            // For a better experience, when yes clicked, set noBtn to position fixed? but keep it somewhere safe.
            // but it's disabled.

            // ensure that when yes clicked, mousemove flee is no longer active.
            // we already have yesClicked guard in handleMouseMove

            // But we also need to handle the initial card: no button should not flee before any hover.
            // That's fine.

            // additional improvement: If noBtn goes too far, user can't reach yes? no, yes is stationary.

            // Also make flee not too frequent: we add a small debounce? but it's fine.

            // We can also add a slight random chance to change color of no button on flee (extra fun)
            // Not needed but cute.

            // final detail: ensure emojis stop after 3 sec as per spec (they are removed after animation)

            // Also to make message bold italic capital, we used css: .love-message font-weight 900, italic, uppercase
            // Yes, that's done.

            // I want to add a small tweak: if user tries to click no, flee more violently.
            noBtn.addEventListener('mouseenter', (e) => {
                if (yesClicked) return;
                // flee also on mouse enter (in case cursor appears on it rapidly)
                fleeNoButton();
            });

            // To prevent accidental click on no, we also call flee on mouse over
            // already handled by mousemove threshold.

            console.log('Valentine ready!');
        })();