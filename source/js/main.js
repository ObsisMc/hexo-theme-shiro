document.addEventListener('DOMContentLoaded', () => {
    // Menu Logic
    const btn = document.getElementById('menuBtn');
    const panel = document.getElementById('mobileMenu');
    const chevron = document.getElementById('menuChevron');

    if (btn && panel && chevron) {
        const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function setOpen(open) {
            panel.dataset.open = open ? "true" : "false";
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            chevron.style.transform = (open && !prefersReduced) ? 'rotate(180deg)' : (prefersReduced ? 'none' : 'rotate(0deg)');
        }

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            setOpen(panel.dataset.open !== "true");
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') setOpen(false);
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!btn.contains(e.target) && !panel.contains(e.target)) {
                setOpen(false);
            }
        });
    }

    // Code block copy buttons (posts only)
    const codeBlocks = document.querySelectorAll('.prose-shiro .highlight');
    if (codeBlocks.length > 0) {
        codeBlocks.forEach((block) => {
            if (block.querySelector('.code-copy-btn')) return;

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'code-copy-btn';
            button.setAttribute('aria-label', 'Copy code');
            const copyIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M16 1H6a2 2 0 0 0-2 2v10h2V3h10V1zm3 4H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H10V7h9v14z"/></svg>';
            const checkIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>';
            button.innerHTML = copyIcon;

            const getCodeText = () => {
                const tableCode = block.querySelector('td.code pre');
                if (tableCode) return tableCode.textContent;
                const preCode = block.querySelector('pre code');
                if (preCode) return preCode.textContent;
                const pre = block.querySelector('pre');
                return pre ? pre.textContent : '';
            };


            button.addEventListener('click', async () => {
                const text = getCodeText();
                if (!text) return;

                try {
                    await navigator.clipboard.writeText(text);
                } catch (err) {
                    const helper = document.createElement('textarea');
                    helper.value = text;
                    helper.setAttribute('readonly', '');
                    helper.style.position = 'absolute';
                    helper.style.left = '-9999px';
                    document.body.appendChild(helper);
                    helper.select();
                    document.execCommand('copy');
                    document.body.removeChild(helper);
                }

                button.dataset.copied = 'true';
                button.innerHTML = checkIcon;
                window.setTimeout(() => {
                    button.dataset.copied = 'false';
                    button.innerHTML = copyIcon;
                }, 1400);
            });

            block.appendChild(button);
        });
    }

    // To top button: show only when the main divider is out of view
    const toTopBtn = document.getElementById('toTopBtn');
    const divider = document.getElementById('dividerSentinel') || document.querySelector('main.section-divider');
    if (toTopBtn && divider) {
        const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const showBtn = (show) => {
            toTopBtn.classList.toggle('is-visible', show);
        };

        const updateByScroll = () => {
            const dividerTop = divider.getBoundingClientRect().top + window.scrollY;
            showBtn(window.scrollY > dividerTop);
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                (entries) => {
                    const entry = entries[0];
                    const passed = entry.boundingClientRect.top < 0;
                    showBtn(!entry.isIntersecting && passed);
                },
                { root: null, threshold: 0 }
            );

            observer.observe(divider);
        } else {
            updateByScroll();
            window.addEventListener('scroll', updateByScroll, { passive: true });
            window.addEventListener('resize', updateByScroll);
        }

        toTopBtn.addEventListener('click', () => {
            if (prefersReduced) {
                window.scrollTo(0, 0);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
});
