document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('.prose-shiro');
    if (!containers.length || typeof window.lightGallery !== 'function') return;
    const zoomPlugin = window.lgZoom || window.LgZoom || null;
    let activeLgInstance = null;

    const escapeHtml = (value) => value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const getCaption = (img) => img.getAttribute('title') || img.getAttribute('alt') || '';

    const setCaption = (link, caption) => {
        if (!caption) {
            link.removeAttribute('data-sub-html');
            return;
        }
        link.setAttribute('data-sub-html', `<p>${escapeHtml(caption)}</p>`);
    };

    const ensureLink = (container, img) => {
        const src = img.currentSrc || img.src;
        if (!src) return null;

        const existing = img.closest('a');
        const link = existing && container.contains(existing) ? existing : document.createElement('a');

        if (!link.contains(img)) {
            img.parentNode.insertBefore(link, img);
            link.appendChild(img);
        }

        link.setAttribute('href', src);
        link.setAttribute('data-lg-item', 'true');
        setCaption(link, getCaption(img));
        return link;
    };

    containers.forEach((container) => {
        const images = container.querySelectorAll('img');
        if (!images.length) return;

        images.forEach((img) => {
            ensureLink(container, img);
        });

        const instance = window.lightGallery(container, {
            selector: 'a[data-lg-item]',
            download: false,
            plugins: zoomPlugin ? [zoomPlugin] : [],
            zoom: Boolean(zoomPlugin),
            actualSize: false,
            showZoomInOutIcons: Boolean(zoomPlugin)
        });

        container.addEventListener('lgAfterOpen', (event) => {
            activeLgInstance = event.detail?.instance || instance;
        });

        container.addEventListener('lgAfterClose', () => {
            if (activeLgInstance === instance) activeLgInstance = null;
        });
    });

    document.addEventListener('wheel', (event) => {
        if (!activeLgInstance) return;
        const target = event.target;
        if (!(target instanceof Element)) return;

        const inGallery = target.closest('.lg-outer');
        if (!inGallery) return;

        event.preventDefault();
        const zoom = activeLgInstance.plugins && activeLgInstance.plugins.zoom;

        if (zoom && typeof zoom.zoomIn === 'function' && typeof zoom.zoomOut === 'function') {
            if (event.deltaY < 0) zoom.zoomIn();
            else if (event.deltaY > 0) zoom.zoomOut();
            return;
        }

        const selector = event.deltaY < 0 ? '.lg-zoom-in' : '.lg-zoom-out';
        const button = document.querySelector(selector);
        if (button) button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }, { passive: false });
});

