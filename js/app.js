/* =============================================
   AlgoViz — Main Application Controller
   Liquid Glass UI with activetheory.net-inspired animations
   ============================================= */

const AlgoApp = (() => {
    // =================== State ===================
    const state = {
        selectedCategory: null,
        selectedAlgorithms: new Set(),
        selectedSizes: new Set([100, 500, 1000, 5000, 10000]),
        selectedPattern: 'random',
        iterations: 3,
        mode: 'benchmark', // 'benchmark' or 'visualizer'
        isRunning: false,
        benchmarkResults: null
    };

    // =================== Algorithm Registry ===================
    const algorithmRegistry = {
        sorting: SortingAlgorithms,
        searching: SearchingAlgorithms,
        graph: GraphAlgorithms,
        greedy: GreedyAlgorithms,
        backtracking: BacktrackingAlgorithms,
        divideconquer: DivideConquerAlgorithms,
        recursion: RecursionAlgorithms
    };

    function getAlgorithmLibrary() {
        const library = {};
        Object.values(algorithmRegistry).forEach(cat => {
            Object.entries(cat).forEach(([name, algo]) => {
                library[name] = algo;
            });
        });
        return library;
    }

    // =================== Background Canvas ===================
    function initBackground() {
        const canvas = document.getElementById('bgCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height, particles, animationId;
        const mouse = { x: -1000, y: -1000 };

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.4 + 0.1;
                this.hue = Math.random() * 60 + 220; // blue-purple range
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Mouse interaction
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    this.x -= dx * force * 0.008;
                    this.y -= dy * force * 0.008;
                }

                if (this.x < -50 || this.x > width + 50 || this.y < -50 || this.y > height + 50) {
                    this.reset();
                }
            }
            draw(ctx) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, 70%, 70%, ${this.opacity})`;
                ctx.fill();
            }
        }

        // Floating orbs (large glass blobs)
        class Orb {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.radius = Math.random() * 200 + 100;
                this.speedX = (Math.random() - 0.5) * 0.15;
                this.speedY = (Math.random() - 0.5) * 0.15;
                this.hue = Math.random() * 60 + 240;
                this.opacity = 0.02 + Math.random() * 0.03;
                this.phase = Math.random() * Math.PI * 2;
            }
            update(t) {
                this.x += this.speedX + Math.sin(t * 0.001 + this.phase) * 0.2;
                this.y += this.speedY + Math.cos(t * 0.0008 + this.phase) * 0.15;
                if (this.x < -this.radius) this.x = width + this.radius;
                if (this.x > width + this.radius) this.x = -this.radius;
                if (this.y < -this.radius) this.y = height + this.radius;
                if (this.y > height + this.radius) this.y = -this.radius;
            }
            draw(ctx) {
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
                gradient.addColorStop(0, `hsla(${this.hue}, 80%, 60%, ${this.opacity * 1.5})`);
                gradient.addColorStop(0.5, `hsla(${this.hue + 20}, 70%, 50%, ${this.opacity})`);
                gradient.addColorStop(1, `hsla(${this.hue}, 60%, 40%, 0)`);
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }

        function init() {
            resize();
            const particleCount = Math.min(Math.floor(width * height / 8000), 150);
            particles = Array.from({ length: particleCount }, () => new Particle());
            window.orbs = Array.from({ length: 5 }, () => new Orb());
        }

        function drawConnections(ctx) {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(139, 92, 246, ${0.08 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animate(t) {
            ctx.clearRect(0, 0, width, height);

            // Draw orbs
            window.orbs.forEach(o => { o.update(t); o.draw(ctx); });

            // Draw connections
            drawConnections(ctx);

            // Draw particles
            particles.forEach(p => { p.update(); p.draw(ctx); });

            animationId = requestAnimationFrame(animate);
        }

        window.addEventListener('resize', () => { resize(); });
        window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });

        init();
        animate(0);
    }

    // =================== Custom Cursor ===================
    function initCursor() {
        if (window.matchMedia('(pointer: coarse)').matches) return;

        const dot = document.getElementById('cursorDot');
        const ring = document.getElementById('cursorRing');
        if (!dot || !ring) return;

        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = mouseX + 'px';
            dot.style.top = mouseY + 'px';
        });

        function animateRing() {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';
            requestAnimationFrame(animateRing);
        }
        animateRing();

        // Hover effect on interactive elements
        document.querySelectorAll('button, a, .category-card, .algo-chip, .preset-btn, .pattern-btn').forEach(el => {
            el.addEventListener('mouseenter', () => ring.classList.add('hover'));
            el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
        });
    }

    // =================== Scroll Reveal ===================
    function initRevealAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, parseInt(delay));
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    }

    // =================== Counter Animation ===================
    function initCounters() {
        document.querySelectorAll('[data-count]').forEach(el => {
            const target = parseInt(el.dataset.count);
            let current = 0;
            const step = Math.ceil(target / 40);
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                el.textContent = current;
            }, 40);
        });
    }

    // =================== Navigation Scroll ===================
    function initNavScroll() {
        const nav = document.getElementById('navBar');
        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 30);
        });
    }

    // =================== Theme Toggle ===================
    function initThemeToggle() {
        const toggle = document.getElementById('themeToggle');
        const html = document.documentElement;

        // Load saved theme
        const saved = localStorage.getItem('algoviz-theme');
        if (saved) html.setAttribute('data-theme', saved);

        toggle.addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('algoviz-theme', next);
            Visualizer.updateTheme();
        });
    }

    // =================== Mode Toggle ===================
    function initModeToggle() {
        const btnBenchmark = document.getElementById('modeBenchmarkMode');
        const btnVisualizer = document.getElementById('modeVisualizerMode');
        const inputPanel = document.getElementById('inputPanel');
        const runContainer = document.getElementById('runContainer');
        const visualizerPanel = document.getElementById('visualizerPanel');
        const results = document.getElementById('results');

        function setMode(mode) {
            state.mode = mode;
            if (mode === 'benchmark') {
                btnBenchmark.classList.add('active');
                btnVisualizer.classList.remove('active');

                if (state.selectedCategory) {
                    inputPanel.style.display = '';
                    runContainer.style.display = '';
                }
                visualizerPanel.style.display = 'none';

                // If there are benchmark results, show them
                if (state.benchmarkResults) results.style.display = '';
            } else {
                btnBenchmark.classList.remove('active');
                btnVisualizer.classList.add('active');

                inputPanel.style.display = 'none';
                runContainer.style.display = 'none';
                results.style.display = 'none';

                if (state.selectedCategory) {
                    visualizerPanel.style.display = '';
                    if (window.visAnimator) window.visAnimator.resize();

                    // If no array generated yet, trigger one
                    if (!window.visAnimator || window.visAnimator.steps.length === 0) {
                        document.getElementById('visGenerateBtn').click();
                    }
                }

                // In visualizer mode, enforce single selection
                if (state.selectedAlgorithms.size > 1) {
                    const first = Array.from(state.selectedAlgorithms)[0];
                    state.selectedAlgorithms.clear();
                    state.selectedAlgorithms.add(first);
                    populateAlgorithmChips();
                }
            }
        }

        if (btnBenchmark && btnVisualizer) {
            btnBenchmark.addEventListener('click', () => setMode('benchmark'));
            btnVisualizer.addEventListener('click', () => setMode('visualizer'));
        }
    }

    // =================== Visualizer Runner ===================
    function initVisualizerRunner() {
        if (!document.getElementById('visCanvas')) return;

        window.visAnimator = new VisualizerAnimator('visCanvas');
        let currentArray = [];

        const btnGen = document.getElementById('visGenerateBtn');
        const selectSize = document.getElementById('visSizeSelect');
        const btnPrev = document.getElementById('visBtnPrev');
        const btnPlay = document.getElementById('visBtnPlay');
        const btnNext = document.getElementById('visBtnNext');
        const speedSlider = document.getElementById('visSpeedSlider');
        const statusText = document.getElementById('visStatus');
        const playIcon = document.getElementById('playIconPoly');

        function updatePlayIcon(isPlaying) {
            if (isPlaying) {
                playIcon.setAttribute('points', '6 4 10 4 10 20 6 20 14 4 18 4 18 20 14 20'); // fake pause icon roughly
            } else {
                playIcon.setAttribute('points', '5 3 19 12 5 21 5 3'); // play icon
            }
        }

        window.addEventListener('visualizer-step', (e) => {
            const d = e.detail;
            updatePlayIcon(d.isPlaying);
        });

        function generateAndTrace() {
            if (state.selectedAlgorithms.size !== 1) {
                statusText.textContent = 'Please select exactly one algorithm to visualize.';
                statusText.style.color = '#ef4444';
                return;
            }

            const algoName = Array.from(state.selectedAlgorithms)[0];
            const size = parseInt(selectSize.value);

            const library = getAlgorithmLibrary();
            const algoObj = library[algoName];

            let target = null;
            if (state.selectedCategory === 'searching') {
                currentArray = DataGenerator.generateSortedArray(size);
                target = currentArray[Math.floor(Math.random() * size)]; // guarantee a hit to keep visual interesting
            } else {
                currentArray = DataGenerator.generateArray(size, 'random');
            }


            if (!algoObj || !algoObj.fn) {
                statusText.textContent = 'Algorithm implementation not found.';
                return;
            }

            statusText.textContent = `Tracing ${algoName}...`;
            statusText.style.color = '#8b5cf6';

            // Generate Trace
            const tracer = new AlgorithmTracer(currentArray);
            try {
                if (state.selectedCategory === 'searching') {
                    algoObj.fn(currentArray, target, tracer);
                } else if (state.selectedCategory === 'graph') {
                    // Generate a simple graph representation for graph algorithms
                    const graphSize = Math.min(size, 8); // Keep small for visualizer
                    const tempGraph = Array.from({ length: graphSize }, () => []);
                    for (let i = 0; i < graphSize; i++) {
                        for (let j = i + 1; j < graphSize; j++) {
                            if (Math.random() > 0.5) {
                                const weight = Math.floor(Math.random() * 10) + 1;
                                tempGraph[i].push({ node: j, weight });
                                tempGraph[j].push({ node: i, weight });
                            }
                        }
                    }
                    algoObj.fn({ adjacencyList: tempGraph, numNodes: graphSize }, tracer);
                } else {
                    algoObj.fn(currentArray, tracer); // Run with tracer injected
                }
                window.visAnimator.loadTrace(tracer);
                statusText.textContent = `${algoName}: Ready (Size: ${size}, Steps: ${tracer.steps.length})`;
                window.visAnimator.setSpeed(parseInt(speedSlider.max) - parseInt(speedSlider.value) + parseInt(speedSlider.min));
                window.visAnimator.play();
                updatePlayIcon(true);
            } catch (err) {
                console.error("Tracing error", err);
                statusText.textContent = `Error tracing ${algoName}. Check console.`;
                statusText.style.color = '#ef4444';
            }
        }

        btnGen.addEventListener('click', generateAndTrace);
        selectSize.addEventListener('change', generateAndTrace);

        btnPlay.addEventListener('click', () => {
            if (window.visAnimator.isPlaying) {
                window.visAnimator.pause();
                updatePlayIcon(false);
            } else {
                window.visAnimator.play();
                updatePlayIcon(true);
            }
        });

        btnPrev.addEventListener('click', () => window.visAnimator.stepBackward());
        btnNext.addEventListener('click', () => window.visAnimator.stepForward());

        speedSlider.addEventListener('input', (e) => {
            // Reverse range so right = faster = smaller delay
            const val = parseInt(e.target.value);
            const max = parseInt(e.target.max);
            const min = parseInt(e.target.min);
            window.visAnimator.setSpeed(max - val + min);
        });
    }

    // =================== Category Selection ===================
    function initCategorySelector() {
        const grid = document.getElementById('categoryGrid');
        const algoPanel = document.getElementById('algorithmPanel');
        const inputPanel = document.getElementById('inputPanel');
        const runContainer = document.getElementById('runContainer');

        grid.addEventListener('click', (e) => {
            const card = e.target.closest('.category-card');
            if (!card) return;

            // Deselect others
            grid.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            state.selectedCategory = card.dataset.category;
            state.selectedAlgorithms.clear();

            // Show algorithm panel with animation
            populateAlgorithmChips();
            algoPanel.style.display = '';

            if (state.mode === 'benchmark') {
                inputPanel.style.display = '';
                runContainer.style.display = '';
            } else {
                const visPanel = document.getElementById('visualizerPanel');
                if (visPanel) {
                    visPanel.style.display = '';
                    if (window.visAnimator) window.visAnimator.resize();
                    // trigger trace if none
                    if (!window.visAnimator || window.visAnimator.steps.length === 0) {
                        document.getElementById('visGenerateBtn').click();
                    }
                }
            }

            // Trigger reveal animations for new panels
            requestAnimationFrame(() => {
                [algoPanel, inputPanel, runContainer].forEach(p => {
                    p.classList.remove('revealed');
                    void p.offsetWidth;
                    p.classList.add('revealed');
                });
            });

            // Re-init cursor hover for new elements
            setTimeout(initCursor, 100);

            // Scroll to algorithm panel
            algoPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    // =================== Algorithm Chips ===================
    function populateAlgorithmChips() {
        const container = document.getElementById('algorithmChips');
        const algorithms = algorithmRegistry[state.selectedCategory];
        if (!algorithms) return;

        container.innerHTML = '';

        Object.keys(algorithms).forEach(name => {
            const chip = document.createElement('button');
            chip.className = 'algo-chip' + (state.selectedAlgorithms.has(name) ? ' selected' : '');
            chip.innerHTML = `
                <span class="algo-chip-check">
                    <svg viewBox="0 0 24 24" width="10" height="10"><polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
                <span class="algo-chip-name">${name}</span>
            `;

            chip.addEventListener('click', () => {
                if (state.mode === 'visualizer') {
                    state.selectedAlgorithms.clear();
                    state.selectedAlgorithms.add(name);
                    populateAlgorithmChips();
                    const btn = document.getElementById('visGenerateBtn');
                    if (btn) btn.click();
                } else {
                    chip.classList.toggle('selected');
                    if (chip.classList.contains('selected')) {
                        state.selectedAlgorithms.add(name);
                    } else {
                        state.selectedAlgorithms.delete(name);
                    }
                }
            });

            container.appendChild(chip);
        });

        // Select All / Clear All buttons
        document.getElementById('selectAllBtn').onclick = () => {
            if (state.mode === 'visualizer') return;
            container.querySelectorAll('.algo-chip').forEach(chip => {
                chip.classList.add('selected');
                const name = chip.querySelector('.algo-chip-name').textContent;
                state.selectedAlgorithms.add(name);
            });
        };

        document.getElementById('clearAllBtn').onclick = () => {
            container.querySelectorAll('.algo-chip').forEach(chip => {
                chip.classList.remove('selected');
            });
            state.selectedAlgorithms.clear();
        };
    }

    // =================== Input Size Presets ===================
    function initSizePresets() {
        const container = document.getElementById('sizePresets');
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.preset-btn');
            if (!btn) return;
            const size = parseInt(btn.dataset.size);
            btn.classList.toggle('active');
            if (btn.classList.contains('active')) {
                state.selectedSizes.add(size);
            } else {
                state.selectedSizes.delete(size);
            }
        });
    }

    // =================== Pattern Selection ===================
    function initPatternSelect() {
        const container = document.getElementById('patternSelect');
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.pattern-btn');
            if (!btn) return;
            container.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.selectedPattern = btn.dataset.pattern;
        });
    }

    // =================== Iterations Slider ===================
    function initIterSlider() {
        const slider = document.getElementById('iterSlider');
        const value = document.getElementById('iterValue');
        slider.addEventListener('input', () => {
            state.iterations = parseInt(slider.value);
            value.textContent = slider.value;
        });
    }

    // =================== Run Benchmark ===================
    function initRunButton() {
        document.getElementById('runBtn').addEventListener('click', runBenchmark);
    }

    async function runBenchmark() {
        if (state.isRunning) return;
        if (!state.selectedCategory) return alert('Please select a category first.');
        if (state.selectedAlgorithms.size === 0) return alert('Please select at least one algorithm.');
        if (state.selectedSizes.size === 0) return alert('Please select at least one input size.');

        state.isRunning = true;
        const runBtn = document.getElementById('runBtn');
        const progressContainer = document.getElementById('progressContainer');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        runBtn.classList.add('running');
        runBtn.querySelector('.run-text').textContent = 'Running...';
        progressContainer.style.display = '';

        const algorithms = algorithmRegistry[state.selectedCategory];
        const selectedNames = [...state.selectedAlgorithms];
        const sizes = [...state.selectedSizes].sort((a, b) => a - b);
        const totalSteps = selectedNames.length * sizes.length;
        let currentStep = 0;

        const benchmarkData = [];

        for (const algoName of selectedNames) {
            const algo = algorithms[algoName];
            if (!algo) continue;

            const algoResults = {
                name: algoName,
                results: []
            };

            for (const size of sizes) {
                currentStep++;
                const pct = Math.round((currentStep / totalSteps) * 100);
                progressFill.style.width = pct + '%';
                progressText.textContent = `${algoName} — n=${size.toLocaleString()} (${pct}%)`;

                // Yield to UI
                await new Promise(r => setTimeout(r, 10));

                // Generate input
                const input = DataGenerator.generateInput(state.selectedCategory, size, state.selectedPattern);

                // Benchmark
                const result = PerformanceEngine.benchmark(algo.fn, input, state.selectedCategory, state.iterations);
                result.inputSize = size;

                algoResults.results.push(result);
            }

            benchmarkData.push(algoResults);
        }

        state.benchmarkResults = benchmarkData;

        // Show results
        showResults(benchmarkData);

        // Reset run button
        state.isRunning = false;
        runBtn.classList.remove('running');
        runBtn.querySelector('.run-text').textContent = 'Run Analysis';
        progressContainer.style.display = 'none';
        progressFill.style.width = '0%';
    }

    // =================== Show Results ===================
    function showResults(benchmarkData) {
        const resultsSection = document.getElementById('results');
        resultsSection.style.display = '';

        // Init reveal
        resultsSection.querySelectorAll('[data-reveal]').forEach(el => {
            el.classList.remove('revealed');
            void el.offsetWidth;
            el.classList.add('revealed');
        });

        // Create charts
        Visualizer.createTimeChart('timeChart', benchmarkData);
        Visualizer.createMemoryChart('memoryChart', benchmarkData);

        // Populate data table
        populateDataTable(benchmarkData);

        // Populate insights
        populateInsights(benchmarkData);

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function populateDataTable(benchmarkData) {
        const tbody = document.getElementById('dataTableBody');
        tbody.innerHTML = '';

        benchmarkData.forEach(algo => {
            algo.results.forEach(r => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${algo.name}</td>
                    <td>${r.inputSize.toLocaleString()}</td>
                    <td>${r.avgTime.toFixed(3)} ± ${r.stdDev.toFixed(3)}</td>
                    <td>${r.minTime.toFixed(3)}</td>
                    <td>${r.maxTime.toFixed(3)}</td>
                    <td>${r.memoryKB.toFixed(2)}</td>
                `;
                tbody.appendChild(tr);
            });
        });
    }

    function populateInsights(benchmarkData) {
        const grid = document.getElementById('insightsGrid');
        grid.innerHTML = '';

        benchmarkData.forEach(algo => {
            const detected = PerformanceEngine.detectComplexity(algo.results);
            const algoInfo = algorithmRegistry[state.selectedCategory]?.[algo.name];

            const card = document.createElement('div');
            card.className = 'insight-card';

            let html = `
                <div class="insight-algo-name">
                    ${algo.name}
                    <span class="insight-badge">${detected}</span>
                </div>
                <div class="insight-details">
            `;

            if (algoInfo && algoInfo.complexity) {
                html += `
                    <div class="insight-row">
                        <span class="insight-label">Best Case</span>
                        <span class="insight-value">${algoInfo.complexity.best}</span>
                    </div>
                    <div class="insight-row">
                        <span class="insight-label">Average Case</span>
                        <span class="insight-value">${algoInfo.complexity.average}</span>
                    </div>
                    <div class="insight-row">
                        <span class="insight-label">Worst Case</span>
                        <span class="insight-value">${algoInfo.complexity.worst}</span>
                    </div>
                    <div class="insight-row">
                        <span class="insight-label">Space</span>
                        <span class="insight-value">${algoInfo.complexity.space}</span>
                    </div>
                `;
            }

            const fastest = algo.results.reduce((a, b) => a.avgTime < b.avgTime ? a : b);
            const slowest = algo.results.reduce((a, b) => a.avgTime > b.avgTime ? a : b);

            html += `
                    <div class="insight-row">
                        <span class="insight-label">Fastest</span>
                        <span class="insight-value">${fastest.avgTime.toFixed(3)}ms (n=${fastest.inputSize.toLocaleString()})</span>
                    </div>
                    <div class="insight-row">
                        <span class="insight-label">Slowest</span>
                        <span class="insight-value">${slowest.avgTime.toFixed(3)}ms (n=${slowest.inputSize.toLocaleString()})</span>
                    </div>
                </div>
            `;

            if (algoInfo && algoInfo.description) {
                html += `<div class="insight-description">${algoInfo.description}</div>`;
            }

            card.innerHTML = html;
            grid.appendChild(card);
        });
    }

    // =================== Export ===================
    function initExport() {
        document.getElementById('exportCsv').addEventListener('click', () => {
            if (!state.benchmarkResults) return alert('Run an analysis first.');
            const categoryName = state.selectedCategory || 'analysis';
            Exporter.exportCSV(state.benchmarkResults, categoryName);
        });

        document.getElementById('exportPdf').addEventListener('click', async () => {
            if (!state.benchmarkResults) return alert('Run an analysis first.');
            const categoryName = state.selectedCategory || 'analysis';
            const btn = document.getElementById('exportPdf');
            btn.textContent = 'Generating PDF...';
            btn.disabled = true;
            try {
                await Exporter.exportPDF(state.benchmarkResults, categoryName);
            } catch (e) {
                console.error('PDF export failed:', e);
                alert('PDF generation failed. Check console for details.');
            }
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2" fill="none"/><polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2" fill="none"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/></svg>
                Download PDF Report
            `;
            btn.disabled = false;
        });
    }

    // =================== Smooth Scroll Links ===================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    // =================== Init ===================
    function init() {
        initBackground();
        initCursor();
        initRevealAnimations();
        initCounters();
        initNavScroll();
        initThemeToggle();
        initCategorySelector();
        initSizePresets();
        initPatternSelect();
        initIterSlider();
        initRunButton();
        initExport();
        initSmoothScroll();
        initModeToggle();
        initVisualizerRunner();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return { getAlgorithmLibrary };
})();
