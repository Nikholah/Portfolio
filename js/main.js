/*
 * Portfolio — interactions et animations.
 * Dépendances optionnelles (CDN) : GSAP + ScrollTrigger, Lenis.
 * Sans elles, ou avec « prefers-reduced-motion », le site reste entièrement lisible.
 */
(function () {
    'use strict';

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const motion = Boolean(gsap && ScrollTrigger) && !reduced;
    const root = document.documentElement;
    const EMAIL = 'nicolaslyf@gmail.com';
    const NAV_OFFSET = 80;

    let lenis = null;

    const $ = (selector, context = document) => context.querySelector(selector);
    const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    root.classList.add(motion ? 'has-motion' : 'no-motion');
    if (motion) gsap.registerPlugin(ScrollTrigger);

    /* ------------------------------------------------------------------ */
    /* Scroll fluide + ancres                                              */
    /* ------------------------------------------------------------------ */
    function scrollToTarget(target) {
        if (lenis) {
            lenis.scrollTo(target, { offset: typeof target === 'number' ? 0 : -NAV_OFFSET });
        } else if (typeof target === 'number') {
            window.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' });
        } else {
            target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        }
    }

    function initSmoothScroll() {
        if (motion && typeof window.Lenis === 'function') {
            lenis = new window.Lenis({ lerp: 0.1 });
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        }

        $$('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (event) => {
                const hash = anchor.getAttribute('href');
                if (hash.length < 2) {
                    event.preventDefault();
                    scrollToTarget(0);
                    return;
                }
                const target = document.getElementById(hash.slice(1));
                if (!target) return;
                event.preventDefault();
                scrollToTarget(target);
                history.replaceState(null, '', hash);
            });
        });
    }

    /* ------------------------------------------------------------------ */
    /* Navigation, barre de progression, lien actif                        */
    /* ------------------------------------------------------------------ */
    function initNav() {
        const navbar = $('.navbar');
        if (!navbar) return;

        const toggle = $('.mobile-menu-toggle', navbar);
        const menu = $('.navbar-menu', navbar);
        const burger = $('.hamburger', navbar);

        const setOpen = (open) => {
            menu.classList.toggle('active', open);
            burger.classList.toggle('active', open);
            toggle.setAttribute('aria-expanded', String(open));
            if (open) navbar.classList.remove('navbar--hidden');
            if (lenis) {
                if (open) lenis.stop(); else lenis.start();
            } else {
                document.body.style.overflow = open ? 'hidden' : '';
            }
        };

        if (toggle && menu && burger) {
            toggle.setAttribute('aria-label', 'Ouvrir ou fermer le menu');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.addEventListener('click', () => setOpen(!menu.classList.contains('active')));
            $$('a', menu).forEach((link) => link.addEventListener('click', () => setOpen(false)));
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && menu.classList.contains('active')) setOpen(false);
            });
        }

        // Barre de progression de lecture
        const progress = document.createElement('div');
        progress.className = 'scroll-progress';
        progress.setAttribute('aria-hidden', 'true');
        progress.innerHTML = '<span></span>';
        document.body.appendChild(progress);
        const progressBar = progress.firstElementChild;

        let lastY = window.scrollY;
        let ticking = false;

        const update = () => {
            ticking = false;
            const y = window.scrollY;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            progressBar.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
            navbar.classList.toggle('navbar--scrolled', y > 20);
            if (!menu || !menu.classList.contains('active')) {
                if (y > lastY + 4 && y > 140) navbar.classList.add('navbar--hidden');
                else if (y < lastY - 4 || y <= 140) navbar.classList.remove('navbar--hidden');
            }
            lastY = y;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        }, { passive: true });
        update();

        // Lien actif selon la section visible
        const links = $$('.navbar-link[href^="#"]', navbar);
        const sections = links
            .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
            .filter(Boolean);

        if (sections.length && 'IntersectionObserver' in window) {
            const spy = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    links.forEach((link) => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
                    });
                });
            }, { rootMargin: '-45% 0px -50% 0px' });
            sections.forEach((section) => spy.observe(section));
        }
    }

    /* ------------------------------------------------------------------ */
    /* Intro : loader (1re visite de l'accueil) ou voile de transition     */
    /* ------------------------------------------------------------------ */
    let veil = null;

    function initPageTransitions() {
        if (!motion) return;

        veil = document.createElement('div');
        veil.className = 'page-veil';
        veil.setAttribute('aria-hidden', 'true');
        document.body.appendChild(veil);

        document.addEventListener('click', (event) => {
            if (event.defaultPrevented || event.button !== 0) return;
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const link = event.target.closest('a[href]');
            if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

            let url;
            try { url = new URL(link.href); } catch (error) { return; }
            if (url.protocol !== window.location.protocol || url.host !== window.location.host) return;
            if (url.pathname === window.location.pathname) return;
            if (!/(\.html?|\/)$/.test(url.pathname)) return;

            event.preventDefault();
            gsap.set(veil, { transformOrigin: 'bottom' });
            gsap.to(veil, {
                scaleY: 1,
                duration: 0.5,
                ease: 'power4.inOut',
                onComplete: () => { window.location.href = link.href; }
            });
        });

        // Retour via le cache du navigateur : le voile ne doit pas rester affiché
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) gsap.set(veil, { scaleY: 0 });
        });
    }

    function playIntro(done) {
        if (!motion) {
            done();
            return;
        }

        const isHome = Boolean($('.hero'));
        let seen = false;
        try { seen = sessionStorage.getItem('intro-seen') === '1'; } catch (error) { /* stockage indisponible */ }

        if (isHome && !seen) {
            try { sessionStorage.setItem('intro-seen', '1'); } catch (error) { /* stockage indisponible */ }

            const loader = document.createElement('div');
            loader.className = 'loader';
            loader.setAttribute('aria-hidden', 'true');
            loader.innerHTML =
                '<div class="loader-inner">' +
                '<span class="loader-name">Nicolas Lyfoung — Portfolio</span>' +
                '<span class="loader-count">0</span>' +
                '<span class="loader-bar"><span></span></span>' +
                '</div>';
            document.body.appendChild(loader);

            const count = $('.loader-count', loader);
            const bar = $('.loader-bar span', loader);
            const state = { value: 0 };

            gsap.timeline({ onComplete: () => loader.remove() })
                .to(state, {
                    value: 100,
                    duration: 1.3,
                    ease: 'power2.inOut',
                    onUpdate: () => {
                        count.textContent = Math.round(state.value);
                        bar.style.transform = `scaleX(${state.value / 100})`;
                    }
                })
                .to($('.loader-inner', loader), { opacity: 0, y: -20, duration: 0.35, ease: 'power2.in' })
                .to(loader, { yPercent: -100, duration: 0.8, ease: 'power4.inOut' })
                .add(done, '-=0.5');
        } else {
            gsap.set(veil, { scaleY: 1, transformOrigin: 'top' });
            gsap.timeline()
                .to(veil, { scaleY: 0, duration: 0.6, ease: 'power4.inOut' })
                .add(done, '-=0.5');
        }
    }

    /* ------------------------------------------------------------------ */
    /* Hero : nom lettre par lettre, rôles rotatifs                        */
    /* ------------------------------------------------------------------ */
    function initHero() {
        const hero = $('.hero');
        if (!hero || !motion) return () => {};

        const lines = $$('.hero-line', hero);
        lines.forEach((line) => {
            const text = line.textContent.trim();
            line.textContent = '';
            line.setAttribute('aria-hidden', 'true');
            line.style.setProperty('--n', text.length);
            Array.from(text).forEach((letter, index) => {
                const char = document.createElement('span');
                char.className = 'char';
                char.textContent = letter;
                char.style.setProperty('--i', index);
                line.appendChild(char);
            });
            line.classList.add('is-split');
        });

        const chars = $$('.char', hero);
        const fades = $$('.hero-eyebrow, .hero-roles, .hero-description, .hero-buttons, .hero .social-links, .scroll-indicator', hero);
        gsap.set(chars, { yPercent: 115 });
        gsap.set(fades, { opacity: 0, y: 24 });

        return () => {
            gsap.timeline({ defaults: { ease: 'power4.out' } })
                .to(chars, { yPercent: 0, duration: 1.1, stagger: 0.045 })
                .to(fades, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', clearProps: 'transform' }, '-=0.75');
        };
    }

    function initRoles() {
        const element = $('.role-text');
        if (!element || reduced) return;
        const roles = (element.dataset.roles || '').split('|').map((role) => role.trim()).filter(Boolean);
        if (roles.length < 2) return;

        let roleIndex = 0;
        let length = roles[0].length;
        let deleting = true;

        const tick = () => {
            const word = roles[roleIndex];
            length += deleting ? -1 : 1;
            element.textContent = word.slice(0, length);
            let delay = deleting ? 35 : 70;

            if (!deleting && length === word.length) {
                deleting = true;
                delay = 1900;
            } else if (deleting && length === 0) {
                deleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                delay = 320;
            }
            setTimeout(tick, delay);
        };

        setTimeout(tick, 3200);
    }

    /* ------------------------------------------------------------------ */
    /* Fond du hero : constellation de particules réactive à la souris     */
    /* ------------------------------------------------------------------ */
    function initBackground() {
        const canvas = $('.hero-canvas');
        if (!canvas || reduced || !canvas.getContext) return;

        const hero = canvas.parentElement;
        const context = canvas.getContext('2d');
        const colors = ['79, 124, 255', '168, 85, 247', '34, 211, 238'];
        const LINK = 130;
        const REPEL = 150;
        const mouse = { x: -9999, y: -9999 };

        let width = 0;
        let height = 0;
        let particles = [];
        let running = false;
        let visible = true;
        let frameId = 0;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = hero.clientWidth;
            height = hero.clientHeight;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            context.setTransform(dpr, 0, 0, dpr, 0, 0);

            const count = clamp(Math.round((width * height) / 15000), 28, 110);
            particles = Array.from({ length: count }, () => {
                const baseX = (Math.random() - 0.5) * 0.4;
                const baseY = (Math.random() - 0.5) * 0.4;
                return {
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: baseX,
                    vy: baseY,
                    baseX,
                    baseY,
                    radius: Math.random() * 1.6 + 0.6,
                    color: colors[Math.floor(Math.random() * colors.length)]
                };
            });
        };

        const draw = () => {
            context.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < REPEL * REPEL && distSq > 0.01) {
                    const dist = Math.sqrt(distSq);
                    const force = (1 - dist / REPEL) * 0.6;
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                }

                // Retour progressif à la dérive de base
                p.vx += (p.baseX - p.vx) * 0.04;
                p.vy += (p.baseY - p.vy) * 0.04;
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < -10) p.x = width + 10; else if (p.x > width + 10) p.x = -10;
                if (p.y < -10) p.y = height + 10; else if (p.y > height + 10) p.y = -10;

                context.beginPath();
                context.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                context.fillStyle = `rgba(${p.color}, 0.85)`;
                context.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j];
                    const lx = p.x - q.x;
                    const ly = p.y - q.y;
                    const linkSq = lx * lx + ly * ly;
                    if (linkSq < LINK * LINK) {
                        const alpha = (1 - Math.sqrt(linkSq) / LINK) * 0.22;
                        context.beginPath();
                        context.moveTo(p.x, p.y);
                        context.lineTo(q.x, q.y);
                        context.strokeStyle = `rgba(130, 150, 255, ${alpha})`;
                        context.lineWidth = 1;
                        context.stroke();
                    }
                }

                // Liaison lumineuse avec la souris
                if (distSq < 190 * 190) {
                    const alpha = (1 - Math.sqrt(distSq) / 190) * 0.4;
                    context.beginPath();
                    context.moveTo(p.x, p.y);
                    context.lineTo(mouse.x, mouse.y);
                    context.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
                    context.stroke();
                }
            }

            if (running) frameId = requestAnimationFrame(draw);
        };

        const setRunning = (shouldRun) => {
            if (shouldRun === running) return;
            running = shouldRun;
            if (running) frameId = requestAnimationFrame(draw);
            else cancelAnimationFrame(frameId);
        };

        const sync = () => setRunning(visible && !document.hidden);

        hero.addEventListener('pointermove', (event) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
        });
        hero.addEventListener('pointerleave', () => {
            mouse.x = -9999;
            mouse.y = -9999;
        });

        let resizeTimer = 0;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 150);
        });
        document.addEventListener('visibilitychange', sync);

        if ('IntersectionObserver' in window) {
            new IntersectionObserver((entries) => {
                visible = entries[0].isIntersecting;
                sync();
            }).observe(hero);
        }

        resize();
        sync();
    }

    /* ------------------------------------------------------------------ */
    /* Révélations au scroll                                               */
    /* ------------------------------------------------------------------ */
    const REVEAL_SELECTOR = [
        '[data-reveal]',
        '.project-hero-content > *',
        '.project-section',
        '.competency-card',
        '.sidebar-section',
        '.nav-project',
        '.contact-info > h2',
        '.contact-info > p',
        '.contact-method',
        '.contact-form-wrapper',
        '.portfolio-header',
        '.nav-pills',
        '.competency-header',
        '.ac-header',
        '.evidence-card',
        '.mastery-level'
    ].join(',');

    const TILT_SELECTOR = '.project-card, .stat-card, .skill-card';

    function splitWords(element) {
        if (element.children.length) return [];
        const words = element.textContent.trim().split(/\s+/);
        element.textContent = '';
        words.forEach((word, index) => {
            const outer = document.createElement('span');
            outer.className = 'split-word';
            const inner = document.createElement('span');
            inner.textContent = word;
            outer.appendChild(inner);
            element.appendChild(outer);
            if (index < words.length - 1) element.appendChild(document.createTextNode(' '));
        });
        return $$('.split-word > span', element);
    }

    function initScrollAnimations() {
        if (!motion) return () => {};

        // 1. États initiaux (posés tout de suite, avant la fin de l'intro)
        const reveals = $$(REVEAL_SELECTOR).filter((element) => !element.closest('.hero'));
        reveals.forEach((element) => {
            const variant = element.dataset.reveal;
            const from = { opacity: 0 };
            if (variant === 'left') from.x = -48;
            else if (variant === 'right') from.x = 48;
            else if (variant === 'scale') from.scale = 0.9;
            else from.y = 44;
            gsap.set(element, from);
        });

        const titles = $$('.section-title, .footer-cta-title').map((title) => {
            const words = splitWords(title);
            gsap.set(words, { yPercent: 115 });
            return { title, words };
        });

        const counters = $$('[data-count]').map((element) => {
            const target = Number(element.dataset.count);
            element.textContent = '0';
            return { element, target };
        });

        const galleries = $$('.project-gallery');
        galleries.forEach((gallery) => {
            gsap.set(gallery, { clipPath: 'inset(0% 0% 100% 0%)' });
            gsap.set($('img', gallery), { scale: 1.25 });
        });

        // 2. Déclencheurs (créés une fois l'intro terminée)
        return () => {
            ScrollTrigger.batch(reveals, {
                start: 'top 90%',
                once: true,
                onEnter: (batch) => {
                    gsap.to(batch, {
                        opacity: 1,
                        x: 0,
                        y: 0,
                        scale: 1,
                        duration: 0.95,
                        ease: 'power3.out',
                        stagger: 0.09,
                        overwrite: 'auto',
                        onComplete: () => {
                            // On rend la main au CSS, sauf pour les cartes inclinables pilotées par GSAP
                            batch.forEach((element) => {
                                if (!element.matches(TILT_SELECTOR)) gsap.set(element, { clearProps: 'transform' });
                            });
                        }
                    });
                }
            });

            titles.forEach(({ title, words }) => {
                ScrollTrigger.create({
                    trigger: title,
                    start: 'top 90%',
                    once: true,
                    onEnter: () => gsap.to(words, { yPercent: 0, duration: 0.95, ease: 'power4.out', stagger: 0.06 })
                });
            });

            counters.forEach(({ element, target }) => {
                const state = { value: 0 };
                ScrollTrigger.create({
                    trigger: element,
                    start: 'top 92%',
                    once: true,
                    onEnter: () => gsap.to(state, {
                        value: target,
                        duration: 1.6,
                        ease: 'power2.out',
                        onUpdate: () => { element.textContent = Math.round(state.value); }
                    })
                });
            });

            galleries.forEach((gallery) => {
                ScrollTrigger.create({
                    trigger: gallery,
                    start: 'top 88%',
                    once: true,
                    onEnter: () => {
                        gsap.to(gallery, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power4.inOut' });
                        gsap.to($('img', gallery), { scale: 1, duration: 1.6, ease: 'power3.out', clearProps: 'transform' });
                    }
                });
            });

            // Timeline : la ligne se dessine, les points s'allument
            $$('.timeline').forEach((timeline) => {
                const line = document.createElement('span');
                line.className = 'timeline-progress';
                timeline.prepend(line);
                gsap.fromTo(line, { scaleY: 0 }, {
                    scaleY: 1,
                    ease: 'none',
                    scrollTrigger: { trigger: timeline, start: 'top 75%', end: 'bottom 55%', scrub: 0.6 }
                });
                $$('.timeline-item', timeline).forEach((item) => {
                    ScrollTrigger.create({
                        trigger: item,
                        start: 'top 72%',
                        onEnter: () => item.classList.add('is-active'),
                        onLeaveBack: () => item.classList.remove('is-active')
                    });
                });
            });

            // Parallaxe interne des images de projets
            $$('.project-media .project-image').forEach((image) => {
                gsap.fromTo(image, { yPercent: -13 }, {
                    yPercent: 0,
                    ease: 'none',
                    scrollTrigger: { trigger: image.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
                });
            });

            ScrollTrigger.refresh();
        };
    }

    /* ------------------------------------------------------------------ */
    /* Bandeau défilant                                                    */
    /* ------------------------------------------------------------------ */
    function initMarquee() {
        const track = $('.marquee-track');
        if (!track || !motion) return;

        const group = $('.marquee-group', track);
        const clone = group.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);

        const tween = gsap.to(track, { xPercent: -50, duration: 34, ease: 'none', repeat: -1 });

        // Le bandeau accélère avec la vitesse de scroll, puis retrouve son rythme
        ScrollTrigger.create({
            onUpdate: (self) => {
                const boost = clamp(Math.abs(self.getVelocity()) / 350, 0, 6);
                gsap.to(tween, {
                    timeScale: 1 + boost,
                    duration: 0.2,
                    overwrite: true,
                    onComplete: () => gsap.to(tween, { timeScale: 1, duration: 0.9 })
                });
            }
        });
    }

    /* ------------------------------------------------------------------ */
    /* Curseur, boutons magnétiques, cartes inclinables                    */
    /* ------------------------------------------------------------------ */
    function initCursor() {
        if (!motion || !finePointer) return;

        const dot = document.createElement('div');
        dot.className = 'cursor-dot';
        const ring = document.createElement('div');
        ring.className = 'cursor-ring';
        ring.innerHTML = '<span class="cursor-label"></span>';
        [dot, ring].forEach((element) => {
            element.setAttribute('aria-hidden', 'true');
            document.body.appendChild(element);
        });
        const label = ring.firstElementChild;

        root.classList.add('has-cursor');
        gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

        const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3.out' });
        const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3.out' });
        const ringX = gsap.quickTo(ring, 'x', { duration: 0.4, ease: 'power3.out' });
        const ringY = gsap.quickTo(ring, 'y', { duration: 0.4, ease: 'power3.out' });

        window.addEventListener('pointermove', (event) => {
            if (event.pointerType === 'touch') return;
            dotX(event.clientX);
            dotY(event.clientY);
            ringX(event.clientX);
            ringY(event.clientY);
            dot.classList.add('is-visible');
            ring.classList.add('is-visible');
        }, { passive: true });

        document.addEventListener('mouseover', (event) => {
            const labelled = event.target.closest('[data-cursor]');
            const interactive = event.target.closest('a, button, input, textarea, label, .passion-card');
            label.textContent = labelled ? labelled.dataset.cursor : '';
            ring.classList.toggle('is-label', Boolean(labelled));
            ring.classList.toggle('is-hover', Boolean(interactive) && !labelled);
            dot.style.visibility = labelled ? 'hidden' : '';
        });

        document.addEventListener('mousedown', () => ring.classList.add('is-down'));
        document.addEventListener('mouseup', () => ring.classList.remove('is-down'));
        document.documentElement.addEventListener('mouseleave', () => {
            dot.classList.remove('is-visible');
            ring.classList.remove('is-visible');
        });
    }

    function initMagnetic() {
        if (!motion || !finePointer) return;

        $$('.btn, .social-link').forEach((element) => {
            element.addEventListener('pointermove', (event) => {
                const rect = element.getBoundingClientRect();
                const strength = rect.width > 320 ? 0.08 : 0.3;
                gsap.to(element, {
                    x: (event.clientX - rect.left - rect.width / 2) * strength,
                    y: (event.clientY - rect.top - rect.height / 2) * 0.4,
                    duration: 0.4,
                    ease: 'power3.out',
                    overwrite: 'auto'
                });
            });
            element.addEventListener('pointerleave', () => {
                gsap.to(element, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
            });
        });
    }

    function initTilt() {
        // Une carte projet est cliquable en entier
        $$('.project-card').forEach((card) => {
            const link = $('a[href]', card);
            if (!link) return;
            card.addEventListener('click', (event) => {
                if (!event.target.closest('a')) link.click();
            });
        });

        if (!motion || !finePointer) return;

        $$(TILT_SELECTOR).forEach((card) => {
            card.addEventListener('pointermove', (event) => {
                const rect = card.getBoundingClientRect();
                const px = (event.clientX - rect.left) / rect.width;
                const py = (event.clientY - rect.top) / rect.height;
                card.style.setProperty('--mx', `${px * 100}%`);
                card.style.setProperty('--my', `${py * 100}%`);
                gsap.to(card, {
                    rotationY: (px - 0.5) * 10,
                    rotationX: (0.5 - py) * 10,
                    transformPerspective: 900,
                    duration: 0.5,
                    ease: 'power3.out',
                    overwrite: 'auto'
                });
            });
            card.addEventListener('pointerleave', () => {
                gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.8, ease: 'power3.out', overwrite: 'auto' });
            });
        });
    }

    /* ------------------------------------------------------------------ */
    /* Passions : volley, basket, guitare                                  */
    /* ------------------------------------------------------------------ */
    function initPassions() {
        if (!motion) return;

        // Volley : le ballon passe au-dessus du filet, d'un camp à l'autre
        const volley = $('[data-passion="volley"]');
        if (volley) {
            const ball = $('.ball-volley', volley);
            const inner = $('.ball-inner', ball);
            let side = 0;
            let busy = false;

            const serve = () => {
                if (busy) return;
                busy = true;
                const from = side === 0 ? 46 : 194;
                const to = side === 0 ? 194 : 46;
                side = 1 - side;
                gsap.timeline({ onComplete: () => { busy = false; } })
                    .fromTo(ball, { x: from }, { x: to, duration: 1, ease: 'none' }, 0)
                    .to(ball, { y: 26, duration: 0.5, ease: 'power2.out' }, 0)
                    .to(ball, { y: 114, duration: 0.5, ease: 'power2.in' }, 0.5)
                    .to(ball, { y: 98, duration: 0.16, ease: 'power2.out' }, 1)
                    .to(ball, { y: 114, duration: 0.16, ease: 'power2.in' }, 1.16)
                    .to(inner, { rotation: side === 1 ? '+=360' : '-=360', transformOrigin: '50% 50%', duration: 1.3, ease: 'power1.out' }, 0);
            };

            volley.addEventListener('pointerenter', serve);
            volley.addEventListener('click', serve);
        }

        // Basket : deux dribbles, un tir, panier
        const basket = $('[data-passion="basket"]');
        if (basket) {
            const ball = $('.ball-basket', basket);
            const inner = $('.ball-inner', ball);
            const net = $('.hoop-net', basket);
            const score = $('.score', basket);
            let busy = false;

            const shoot = () => {
                if (busy) return;
                busy = true;
                gsap.timeline({ onComplete: () => { busy = false; } })
                    .to(ball, { x: 78, duration: 0.5, ease: 'none' }, 0)
                    .to(ball, { y: 74, duration: 0.25, ease: 'power2.out' }, 0)
                    .to(ball, { y: 114, duration: 0.25, ease: 'power2.in' }, 0.25)
                    .to(ball, { x: 114, duration: 0.44, ease: 'none' }, 0.5)
                    .to(ball, { y: 86, duration: 0.22, ease: 'power2.out' }, 0.5)
                    .to(ball, { y: 114, duration: 0.22, ease: 'power2.in' }, 0.72)
                    .to(ball, { x: 190, duration: 0.8, ease: 'none' }, 0.94)
                    .to(ball, { y: 14, duration: 0.45, ease: 'power2.out' }, 0.94)
                    .to(ball, { y: 60, duration: 0.35, ease: 'power2.in' }, 1.39)
                    .to(ball, { y: 114, duration: 0.42, ease: 'power1.in' }, 1.74)
                    .to(net, { scaleY: 1.3, transformOrigin: '50% 0%', duration: 0.12, yoyo: true, repeat: 1 }, 1.78)
                    .fromTo(score, { opacity: 0, y: 0 }, { opacity: 1, y: -10, duration: 0.3 }, 1.8)
                    .to(score, { opacity: 0, y: -20, duration: 0.4 }, 2.3)
                    .to(inner, { rotation: '+=540', transformOrigin: '50% 50%', duration: 2.1, ease: 'none' }, 0)
                    .to(ball, { opacity: 0, duration: 0.25 }, 2.3)
                    .set(ball, { x: 40, y: 114 })
                    .to(ball, { opacity: 1, duration: 0.3 });
            };

            basket.addEventListener('pointerenter', shoot);
            basket.addEventListener('click', shoot);
        }

        // Guitare : les cordes vibrent quand la souris les traverse
        const guitar = $('[data-passion="guitar"]');
        if (guitar) {
            const svg = $('svg', guitar);
            const strings = $$('.string', guitar).map((path, index) => ({
                path,
                y: Number(path.dataset.y),
                amplitude: 0,
                pluckX: 120,
                startedAt: 0,
                frequency: 7 + index * 1.6
            }));

            const render = (string) => {
                const elapsed = (performance.now() - string.startedAt) / 1000;
                const offset = string.amplitude * Math.sin(elapsed * Math.PI * 2 * string.frequency);
                string.path.setAttribute('d', `M0 ${string.y} Q ${string.pluckX} ${string.y + offset * 2} 240 ${string.y}`);
            };

            const pluck = (string, x, strength) => {
                gsap.killTweensOf(string);
                string.amplitude = strength;
                string.pluckX = clamp(x, 30, 210);
                string.startedAt = performance.now();
                string.path.classList.add('is-plucked');
                gsap.to(string, {
                    amplitude: 0,
                    duration: 1.4,
                    ease: 'power2.out',
                    onUpdate: () => render(string),
                    onComplete: () => {
                        string.path.classList.remove('is-plucked');
                        string.path.setAttribute('d', `M0 ${string.y} L240 ${string.y}`);
                    }
                });
            };

            let previousY = null;

            svg.addEventListener('pointermove', (event) => {
                const rect = svg.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width) * 240;
                const y = ((event.clientY - rect.top) / rect.height) * 150;
                if (previousY !== null) {
                    strings.forEach((string) => {
                        if ((previousY - string.y) * (y - string.y) < 0) {
                            pluck(string, x, clamp(Math.abs(y - previousY) * 1.4, 3, 9));
                        }
                    });
                }
                previousY = y;
            });
            svg.addEventListener('pointerleave', () => { previousY = null; });

            // Clic ou tap : on gratte toutes les cordes
            guitar.addEventListener('click', () => {
                strings.forEach((string, index) => {
                    gsap.delayedCall(index * 0.05, () => pluck(string, 120, 7));
                });
            });
        }
    }

    /* ------------------------------------------------------------------ */
    /* Formulaire de contact (mailto)                                      */
    /* ------------------------------------------------------------------ */
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'status');
        notification.textContent = message;
        document.body.appendChild(notification);

        requestAnimationFrame(() => requestAnimationFrame(() => notification.classList.add('show')));
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 400);
        }, 4500);
    }

    function initContactForm() {
        const form = $('#contact-form');
        if (!form) return;
        form.setAttribute('novalidate', '');

        const rules = {
            name: (value) => value.trim().length >= 2 || 'Le nom doit contenir au moins 2 caractères',
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || 'Veuillez entrer une adresse email valide',
            subject: (value) => value.trim().length >= 3 || 'Le sujet doit contenir au moins 3 caractères',
            message: (value) => value.trim().length >= 10 || 'Le message doit contenir au moins 10 caractères'
        };
        const fields = Object.keys(rules).filter((name) => form.elements[name]);

        const check = (name) => {
            const input = form.elements[name];
            const result = rules[name](input.value);
            const valid = result === true;
            const error = document.getElementById(`${name}-error`);
            if (error) {
                error.textContent = valid ? '' : result;
                error.style.display = valid ? 'none' : 'block';
            }
            input.classList.toggle('is-invalid', !valid);
            input.setAttribute('aria-invalid', String(!valid));
            return valid;
        };

        fields.forEach((name) => {
            form.elements[name].addEventListener('input', () => {
                if (form.elements[name].classList.contains('is-invalid')) check(name);
            });
        });

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const invalid = fields.filter((name) => !check(name));
            if (invalid.length) {
                form.elements[invalid[0]].focus();
                showNotification('Merci de corriger les champs indiqués.', 'error');
                return;
            }

            const value = (name) => form.elements[name].value.trim();
            const body = `${value('message')}\n\n— ${value('name')} (${value('email')})`;
            window.location.href =
                `mailto:${EMAIL}?subject=${encodeURIComponent(value('subject'))}&body=${encodeURIComponent(body)}`;
            showNotification('Votre messagerie s\'ouvre avec le message pré-rempli : il ne reste plus qu\'à l\'envoyer.', 'success');
        });
    }

    /* ------------------------------------------------------------------ */
    /* Portfolio d'apprentissage : pastilles et bouton retour              */
    /* ------------------------------------------------------------------ */
    function initLearningPortfolio() {
        const pills = $$('.nav-pill');
        if (pills.length && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    pills.forEach((pill) => {
                        pill.classList.toggle('active', pill.getAttribute('href') === `#${entry.target.id}`);
                    });
                });
            }, { rootMargin: '-40% 0px -55% 0px' });
            $$('.competency-section[id]').forEach((section) => observer.observe(section));
        }

        const backButton = $('.back-button');
        if (backButton) {
            let lastY = window.scrollY;
            window.addEventListener('scroll', () => {
                const y = window.scrollY;
                backButton.classList.toggle('is-hidden', y > lastY && y > 80);
                lastY = y;
            }, { passive: true });
        }
    }

    /* ------------------------------------------------------------------ */
    /* Divers                                                              */
    /* ------------------------------------------------------------------ */
    // Compteur « jours depuis une date » : data-count-since="AAAA-MM-JJ"
    function initDaysSince() {
        $$('[data-count-since]').forEach((element) => {
            const [year, month, day] = element.dataset.countSince.split('-').map(Number);
            const start = new Date(year, month - 1, day);
            if (Number.isNaN(start.getTime())) return;
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const days = Math.max(0, Math.round((today - start) / 86400000));
            element.dataset.count = String(days);
            element.textContent = String(days);
        });
    }

    function initFooterYear() {
        const year = String(new Date().getFullYear());
        $$('.footer-content p').forEach((paragraph) => {
            paragraph.innerHTML = paragraph.innerHTML.replace(/\b20\d{2}\b/, year);
        });
    }

    /* ------------------------------------------------------------------ */
    /* Démarrage                                                           */
    /* ------------------------------------------------------------------ */
    function init() {
        initSmoothScroll();
        initNav();
        initPageTransitions();
        initFooterYear();
        initDaysSince();
        initContactForm();
        initLearningPortfolio();
        initBackground();
        initRoles();
        initMarquee();
        initCursor();
        initMagnetic();
        initTilt();
        initPassions();

        const playHero = initHero();
        const startScrollAnimations = initScrollAnimations();

        playIntro(() => {
            playHero();
            startScrollAnimations();
        });

        if (motion) window.addEventListener('load', () => ScrollTrigger.refresh());
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
