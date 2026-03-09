/* =============================================
   Algorithm Visualizer — Renders Traced Steps
   ============================================= */

class VisualizerAnimator {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.steps = [];
        this.currentStep = 0;
        this.isPlaying = false;
        this.speedMs = 100; // default medium speed
        this.timer = null;

        // Colors from palette
        this.colorDefault = 'rgba(139, 92, 246, 0.4)'; // Violet base
        this.colorCompare = 'rgba(251, 191, 36, 1)';   // Yellow-ish
        this.colorSwap = 'rgba(244, 114, 182, 1)';     // Pink
        this.colorSet = 'rgba(52, 211, 153, 1)';       // Green
        this.colorMark = 'rgba(0, 240, 255, 0.9)';     // Cyan
        this.colorFound = 'rgba(16, 185, 129, 1)';     // Emerald Green

        window.addEventListener('resize', () => this.resize());
        this.resize(); // initial setup
    }

    resize() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement;
        if (!parent) return;

        let w = parent.clientWidth || 800;
        let h = parent.clientHeight || 350;

        // High DPI canvas trick for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = w * dpr;
        this.canvas.height = h * dpr;
        this.ctx.scale(dpr, dpr);

        // Ensure CSS width matches strictly
        this.canvas.style.width = `${w}px`;
        this.canvas.style.height = `${h}px`;

        if (this.steps.length > 0) Object.assign(this, { _cachedW: w, _cachedH: h });
        if (this.steps.length > 0) this.drawFrame();
    }

    loadTrace(tracer) {
        this.steps = tracer.getSteps();
        this.currentStep = 0;
        this.pause();
        this.resize();
        this.drawFrame();
    }

    play() {
        if (this.isPlaying) return;
        if (this.currentStep >= this.steps.length - 1) {
            this.currentStep = 0; // Auto-rewind if finished
        }
        this.isPlaying = true;
        this.tick();
    }

    pause() {
        this.isPlaying = false;
        if (this.timer) clearTimeout(this.timer);
    }

    stepForward() {
        this.pause();
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.drawFrame();
        }
    }

    stepBackward() {
        this.pause();
        if (this.currentStep > 0) {
            this.currentStep--;
            this.drawFrame();
        }
    }

    setSpeed(ms) {
        this.speedMs = ms;
    }

    setProgress(percent) {
        if (this.steps.length === 0) return;
        this.currentStep = Math.floor(percent * (this.steps.length - 1));
        this.drawFrame();
    }

    tick() {
        if (!this.isPlaying) return;
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.drawFrame();
            // Optional: Skip over unimportant intermediate steps rapidly, sleep longer on swaps
            let delay = this.speedMs;
            const step = this.steps[this.currentStep];
            if (step.type === 'compare') delay *= 0.5; // faster compares
            if (step.type === 'swap' || step.type === 'set') delay *= 1.5; // linger on writes

            this.timer = setTimeout(() => this.tick(), delay);
        } else {
            this.isPlaying = false;
        }
    }

    drawFrame() {
        let w = parseFloat(this.canvas.style.width);
        let h = parseFloat(this.canvas.style.height);

        if (isNaN(w) || w <= 0) w = this._cachedW || 800;
        if (isNaN(h) || h <= 0) h = this._cachedH || 350;

        this._cachedW = w;
        this._cachedH = h;

        if (!this.steps || this.steps.length === 0) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }

        const step = this.steps[this.currentStep];

        // Back-trace to find latest array state
        let arrayState = step.array;
        if (!arrayState) {
            for (let i = this.currentStep; i >= 0; i--) {
                if (this.steps[i].array) {
                    arrayState = this.steps[i].array;
                    break;
                }
            }
        }
        if (!arrayState) return;

        const compares = step.type === 'compare' ? step.indices : [];
        const swaps = step.type === 'swap' ? step.indices : [];
        const sets = step.type === 'set' ? [step.idx] : [];

        // Collate active marks
        const marks = new Map();
        for (let i = 0; i <= this.currentStep; i++) {
            const s = this.steps[i];
            if (s.type === 'mark') {
                marks.set(s.idx, s.role);
            } else if (s.type === 'clear_marks') {
                marks.clear();
            }
        }

        this.ctx.clearRect(0, 0, w, h);

        const n = arrayState.length;
        const totalGap = (n > 50) ? 0 : (n * 1); // gap of 1px if < 50 items
        const barWidth = (w - totalGap) / n;
        const maxVal = Math.max(...arrayState, 1);

        for (let i = 0; i < n; i++) {
            const val = arrayState[i];
            const barHeight = Math.max(10, (val / maxVal) * (h - 20)); // min 10px height
            const gapSum = (n > 50) ? 0 : i * 1;
            const x = (i * barWidth) + gapSum;
            const y = h - barHeight;

            let color = this.colorDefault;
            if (swaps.includes(i)) color = this.colorSwap;
            else if (sets.includes(i)) color = this.colorSet;
            else if (compares.includes(i)) color = this.colorCompare;
            else if (marks.has(i)) {
                color = marks.get(i) === 'found' ? this.colorFound : this.colorMark;
            }

            this.ctx.fillStyle = color;
            this.ctx.beginPath();

            if (barWidth > 3 && typeof this.ctx.roundRect === 'function') {
                this.ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
            } else {
                this.ctx.rect(x, y, barWidth, barHeight);
            }
            this.ctx.fill();
        }

        // Dispatch UI event for play/pause sync
        window.dispatchEvent(new CustomEvent('visualizer-step', {
            detail: { step: this.currentStep, total: this.steps.length - 1, type: step.type, isPlaying: this.isPlaying }
        }));
    }
}
window.VisualizerAnimator = VisualizerAnimator;
