
(function () {
    var $ = function (s) {
        return document.querySelector(s);
    };

    var root = document.documentElement;

    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function css(n) {
        return getComputedStyle(root).getPropertyValue(n).trim();
    }

    var tg = $('#tg');

    function dark() {
        var t = root.getAttribute('data-theme');

        return t
            ? t === 'dark'
            : matchMedia('(prefers-color-scheme: dark)').matches;
    }

    function lab() {
        tg.textContent = dark() ? 'Light' : 'Dark';
    }

    try {
        var sv = localStorage.getItem('ts-theme');

        if (sv) {
            root.setAttribute('data-theme', sv);
        }
    } catch (e) {}

    tg.onclick = function () {
        var n = dark() ? 'light' : 'dark';

        root.setAttribute('data-theme', n);

        try {
            localStorage.setItem('ts-theme', n);
        } catch (e) {}

        lab();
        drawSub();
    };

    lab();

    var ua = navigator.userAgent;

    var os = /Mac/.test(ua)
        ? 'macOS'
        : /Linux|X11/.test(ua) && !/Android/.test(ua)
            ? 'Linux'
            : 'Windows';

    document.querySelectorAll('[data-os]').forEach(function (e) {
        e.textContent = os;
    });

    document.querySelectorAll('.os').forEach(function (c) {
        if (c.getAttribute('data-n') === os) {
            c.classList.add('rec');

            c.insertAdjacentHTML(
                'afterbegin',
                '<span class="badge">Recommended for you</span>'
            );
        }
    });

    var toast = $('#toast');
    var tt;

    document.addEventListener('click', function (e) {
        var d = e.target.closest && e.target.closest('[data-dl]');

        if (!d) return;

        e.preventDefault();

        toast.textContent = 'This is a demo page, so there’s no installer to download.';
        toast.classList.add('on');

        clearTimeout(tt);

        tt = setTimeout(function () {
            toast.classList.remove('on');
        }, 4200);
    });

    var box = $('#stage');

    (function arm() {
        if (!window.THREE) {
            box.classList.add('nogl');
            return;
        }

        var T = THREE;

        var R = new T.WebGLRenderer({
            canvas: $('#gl'),
            antialias: true,
            alpha: true
        });

        R.setPixelRatio(Math.min(devicePixelRatio || 1, 2));

        var S = new T.Scene();

        var C = new T.PerspectiveCamera(38, 1, 0.1, 100);

        C.position.set(6.4, 4.8, 7.6);
        C.lookAt(0, 1.6, 0);

        S.add(new T.AmbientLight(0xffffff, 0.6));

        var dl = new T.DirectionalLight(0xffffff, 0.9);

        dl.position.set(4, 8, 5);
        S.add(dl);

        var pl = new T.PointLight(0xff3d81, 1.3, 16);

        pl.position.set(-3, 3, 2);
        S.add(pl);

        var grid = new T.GridHelper(16, 32, 0xffffff, 0xffffff);

        grid.material.transparent = true;
        grid.material.opacity = 0.55;

        S.add(grid);

        var mat = new T.MeshStandardMaterial({
            metalness: 0.5,
            roughness: 0.35
        });

        var lm = new T.LineBasicMaterial();

        var jm = new T.MeshStandardMaterial({
            roughness: 0.3
        });

        function part(g, p, x, y, z) {
            var m = new T.Mesh(g, mat);

            m.position.set(x, y, z);
            p.add(m);

            m.add(new T.LineSegments(
                new T.EdgesGeometry(g),
                lm
            ));

            return m;
        }

        function ball(p, r) {
            var m = new T.Mesh(
                new T.SphereGeometry(r, 20, 14),
                jm
            );

            p.add(m);

            return m;
        }

        function grp(p, x, y, z) {
            var g = new T.Group();

            g.position.set(x, y, z);
            p.add(g);

            return g;
        }

        var L1 = 2.3;
        var L2 = 2;

        part(
            new T.CylinderGeometry(1, 1.15, 0.3, 32),
            S,
            0,
            0.15,
            0
        );

        var turret = grp(S, 0, 0.3, 0);

        part(
            new T.CylinderGeometry(0.6, 0.7, 0.5, 24),
            turret,
            0,
            0.25,
            0
        );

        var sh = grp(turret, 0, 0.6, 0);

        ball(sh, 0.3);

        part(
            new T.BoxGeometry(L1, 0.32, 0.32),
            sh,
            L1 / 2,
            0,
            0
        );

        var el = grp(sh, L1, 0, 0);

        ball(el, 0.25);

        part(
            new T.BoxGeometry(L2, 0.26, 0.26),
            el,
            L2 / 2,
            0,
            0
        );

        var wr = grp(el, L2, 0, 0);

        ball(wr, 0.2);

        part(
            new T.BoxGeometry(0.3, 0.4, 0.4),
            wr,
            0.2,
            0,
            0
        );

        var f1 = part(
            new T.BoxGeometry(0.5, 0.08, 0.08),
            wr,
            0.55,
            0,
            0.12
        );

        var f2 = part(
            new T.BoxGeometry(0.5, 0.08, 0.08),
            wr,
            0.55,
            0,
            -0.12
        );

        var mk = new T.Mesh(
            new T.TorusGeometry(0.2, 0.025, 8, 28),
            jm
        );

        mk.rotation.x = Math.PI / 2;

        S.add(mk);

        function colors() {
            var d = dark();

            mat.color.set(d ? '#2B3142' : '#DDE2EE');

            lm.color.set(css('--accent2'));

            jm.color.set(css('--accent'));
            jm.emissive.set(css('--accent'));
            jm.emissiveIntensity = 0.5;

            grid.material.color.set(css('--line'));

            pl.color.set(css('--accent'));
        }

        function size() {
            var r = box.getBoundingClientRect();

            R.setSize(r.width, r.height, false);

            C.aspect = r.width / r.height;
            C.updateProjectionMatrix();
        }

        new ResizeObserver(size).observe(box);

        size();
        colors();

        var plane = new T.Plane(
            new T.Vector3(0, 1, 0),
            -1.6
        );

        var ray = new T.Raycaster();
        var ndc = new T.Vector2();
        var hit = new T.Vector3();

        var last = -1e6;
        var px = null;

        box.addEventListener('pointermove', function (e) {
            var r = box.getBoundingClientRect();

            ndc.set(
                (e.clientX - r.left) / r.width * 2 - 1,
                -((e.clientY - r.top) / r.height) * 2 + 1
            );

            ray.setFromCamera(ndc, C);

            if (ray.ray.intersectPlane(plane, hit)) {
                px = hit.clone();
                last = performance.now();
            }
        });

        var cur = {
            y: 0,
            s: 0.6,
            e: -1.2
        };

        var vis = true;
        var n = 0;

        var deg = function (a) {
            return Math.round(a * 57.3) + '°';
        };

        new IntersectionObserver(function (en) {
            vis = en[0].isIntersecting;
        }).observe(box);

        function frame(ms) {
            if (!reduce) {
                requestAnimationFrame(frame);
            }

            if (!vis && !reduce) return;

            var t = ms / 1000;

            var tx;
            var ty = 1.6;
            var tz;

            if (px && ms - last < 3500) {
                tx = px.x;
                tz = px.z;
            } else {
                tx = 2.4 * Math.sin(t * 0.5) + 0.6;
                tz = 2.3 * Math.cos(t * 0.37);
                ty = 1.2 + 0.7 * Math.sin(t * 0.8);
            }

            var d = Math.min(
                Math.max(Math.hypot(tx, tz), 1.3),
                L1 + L2 - 0.2
            );

            var h = ty - 0.9;

            var c = Math.max(
                -1,
                Math.min(
                    1,
                    (
                        d * d + h * h - L1 * L1 - L2 * L2
                    ) / (2 * L1 * L2)
                )
            );

            var th2 = -Math.acos(c);

            var th1 = Math.atan2(h, d) - Math.atan2(
                L2 * Math.sin(th2),
                L1 + L2 * Math.cos(th2)
            );

            var yaw = Math.atan2(-tz, tx);

            var dy = Math.atan2(
                Math.sin(yaw - cur.y),
                Math.cos(yaw - cur.y)
            );

            cur.y += dy * 0.08;
            cur.s += (th1 - cur.s) * 0.08;
            cur.e += (th2 - cur.e) * 0.08;

            turret.rotation.y = cur.y;
            sh.rotation.z = cur.s;
            el.rotation.z = cur.e;

            wr.rotation.z = -(cur.s + cur.e) - 1.2;

            var o = 0.12 + 0.06 * Math.sin(t * 3);

            f1.position.z = o;
            f2.position.z = -o;

            mk.position.set(tx, ty, tz);
            mk.rotation.z = t;

            if (n++ % 30 === 0) {
                colors();
            }

            if (n % 6 === 0) {
                $('#hs').textContent = deg(cur.s);
                $('#he').textContent = deg(-cur.e);
                $('#hy').textContent = deg(cur.y);
            }

            R.render(S, C);
        }

        requestAnimationFrame(frame);

    })();

    var lv = $('#lv');

    function drawSub() {
        var L = +lv.value;
        var N = 4 * Math.pow(2, L);

        var pts = [];
        var sp = '';
        var dots = '';

        for (var i = 0; i < N; i++) {
            var a = i / N * 6.2832 - 1.5708 + (L === 0 ? 0.785 : 0);

            var x = 150 + 110 * Math.cos(a);
            var y = 150 + 110 * Math.sin(a);

            pts.push(
                x.toFixed(1) + ',' + y.toFixed(1)
            );

            sp += '<line x1="150" y1="150" x2="' +
                x.toFixed(1) + '" y2="' +
                y.toFixed(1) + '"/>';

            if (N <= 32) {
                dots += '<circle cx="' +
                    x.toFixed(1) + '" cy="' +
                    y.toFixed(1) + '" r="3.5"/>';
            }
        }

        $('#sub').innerHTML =
            '<g stroke="' + css('--line') + '" stroke-width=".8">' +
            sp +
            '</g>' +
            '<polygon points="' + pts.join(' ') +
            '" fill="' + css('--accent') +
            '" fill-opacity=".14" stroke="' +
            css('--accent') +
            '" stroke-width="2"/>' +
            '<g fill="' + css('--accent2') + '">' +
            dots +
            '</g>';

        $('#lvt').textContent =
            'Subdivision level ' + L + ': ' + N + ' vertices';
    }

    lv.oninput = drawSub;

    drawSub();

    var W = [
        [
            'Model',
            'Tab',
            'Shape anything, precisely.',
            'Push, pull and cut geometry in edit mode. Mirror, bevel and loop-cut keep your topology clean while you work.'
        ],
        [
            'Texture',
            'T',
            'Paint straight onto the surface.',
            'Paint colour, roughness and detail directly on your model, with layers and masks that behave the way you expect.'
        ],
        [
            'Animate',
            'I',
            'Bring it to life with a timeline.',
            'Rig with bones, set keyframes with a tap, and refine motion in a graph editor. Arms like the one above take minutes.'
        ],
        [
            'Render',
            'F12',
            'Real-time or final quality.',
            'Preview with live lighting while you work, then switch to the path tracer for the final image or sequence.'
        ]
    ];

    var tabs = $('#tabs');
    var pn = $('#pn');

    tabs.innerHTML = W.map(function (w) {
        return '<button type="button" role="tab">' +
            w[0] +
            '</button>';
    }).join('');

    function tab(i) {
        Array.prototype.forEach.call(tabs.children, function (b, j) {
            b.setAttribute('aria-selected', j === i);
        });

        pn.innerHTML =
            '<h3>' + W[i][2] + '</h3>' +
            '<p>' + W[i][3] + '</p>' +
            '<span class="key">Press ' + W[i][1] + '</span>';
    }

    tabs.onclick = function (e) {
        var i = Array.prototype.indexOf.call(
            tabs.children,
            e.target
        );

        if (i > -1) {
            tab(i);
        }
    };

    tab(0);

    var code =
        'import tessera as ts\n\n' +
        'robot = ts.import_model("arm.obj")\n' +
        'robot.add_modifier("subdivide", level=3)\n' +
        'robot.animate("wave", frames=120)\n\n' +
        'ts.render(robot, samples=256)\n' +
        '# Saved render.png in 4.2 s';

    var term = $('#term');
    var typed = false;

    if (reduce) {
        term.textContent = code;
        typed = true;
    }

    new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting || typed) {
            return;
        }

        typed = true;

        var i = 0;

        (function k() {
            term.textContent = code.slice(0, ++i);

            if (i < code.length) {
                setTimeout(k, 22);
            }
        })();

    }).observe(term);

    $('#yr').textContent = new Date().getFullYear();

})();
