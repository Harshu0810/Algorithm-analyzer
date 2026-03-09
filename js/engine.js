/* =============================================
   Performance Measurement Engine
   ============================================= */

/* ---------- Memory Allocation Tracker ----------
   Patches Array constructor & key prototype methods
   to count total elements allocated during a run.
   Works in every modern browser (no non-standard APIs). */
const MemoryTracker = {
    _totalElements: 0,
    _active: false,
    _originals: null,

    install() {
        if (this._active) return;
        this._active = true;
        this._totalElements = 0;

        const self = this;

        // Save originals
        this._originals = {
            ArraySlice: Array.prototype.slice,
            ArrayConcat: Array.prototype.concat,
            ArraySplice: Array.prototype.splice,
            ArrayFrom: Array.from,
            ArrayPush: Array.prototype.push,
        };

        // Patch Array.prototype.slice
        Array.prototype.slice = function (...args) {
            const result = self._originals.ArraySlice.apply(this, args);
            if (self._active) self._totalElements += result.length;
            return result;
        };

        // Patch Array.prototype.concat
        Array.prototype.concat = function (...args) {
            const result = self._originals.ArrayConcat.apply(this, args);
            if (self._active) self._totalElements += result.length;
            return result;
        };

        // Patch Array.prototype.splice
        Array.prototype.splice = function (...args) {
            const result = self._originals.ArraySplice.apply(this, args);
            if (self._active) self._totalElements += result.length;
            return result;
        };

        // Patch Array.from
        Array.from = function (...args) {
            const result = self._originals.ArrayFrom.apply(this, args);
            if (self._active) self._totalElements += result.length;
            return result;
        };

        // Patch Array.prototype.push — tracks element-by-element growth
        Array.prototype.push = function (...items) {
            if (self._active) self._totalElements += items.length;
            return self._originals.ArrayPush.apply(this, items);
        };
    },

    uninstall() {
        if (!this._active || !this._originals) return;
        Array.prototype.slice = this._originals.ArraySlice;
        Array.prototype.concat = this._originals.ArrayConcat;
        Array.prototype.splice = this._originals.ArraySplice;
        Array.from = this._originals.ArrayFrom;
        Array.prototype.push = this._originals.ArrayPush;
        this._active = false;
        this._originals = null;
    },

    /** Returns total allocated bytes (8 bytes per JS number + small overhead) */
    getAllocatedKB() {
        return (this._totalElements * 8) / 1024;
    },

    reset() {
        this._totalElements = 0;
    }
};

const PerformanceEngine = {
    /**
     * Benchmark a single algorithm with given input and iterations
     */
    benchmark(algorithmFn, input, category, iterations = 3) {
        const times = [];
        let peakMemoryKB = 0;

        for (let iter = 0; iter < iterations; iter++) {
            // Prepare fresh input copy (before tracker is active)
            let inputCopy;
            if (category === 'searching') {
                inputCopy = { data: input.data.slice(), target: input.target };
            } else if (category === 'graph') {
                inputCopy = input; // Graph is read-only
            } else if (Array.isArray(input)) {
                inputCopy = input.slice();
            } else {
                inputCopy = input;
            }

            // Install tracker *after* input copy so we only measure the algorithm
            MemoryTracker.install();
            MemoryTracker.reset();

            const start = performance.now();

            // Execute algorithm (pass null for tracer to avoid visualizer overhead during benchmark)
            if (category === 'searching') {
                algorithmFn(inputCopy.data, inputCopy.target, null);
            } else if (category === 'graph') {
                algorithmFn(inputCopy, null);
            } else {
                algorithmFn(inputCopy, null);
            }

            const end = performance.now();

            const iterMemKB = MemoryTracker.getAllocatedKB();
            MemoryTracker.uninstall();

            if (iterMemKB > peakMemoryKB) peakMemoryKB = iterMemKB;
            times.push(end - start);
        }

        // Calculate statistics
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        let variance = 0;
        if (times.length > 1) {
            variance = times.reduce((a, b) => a + Math.pow(b - avgTime, 2), 0) / (times.length - 1); // Sample variance
        }
        const stdDev = Math.sqrt(variance);

        return {
            avgTime: Math.round(avgTime * 1000) / 1000,
            minTime: Math.round(minTime * 1000) / 1000,
            maxTime: Math.round(maxTime * 1000) / 1000,
            variance: Math.round(variance * 10000) / 10000,
            stdDev: Math.round(stdDev * 1000) / 1000,
            memoryKB: Math.round(peakMemoryKB * 100) / 100,
            iterations
        };
    },

    /**
     * Compute R-squared (Coefficient of Determination) for a linear relationship between X and Y
     */
    computeFit(sizes, times, transformX) {
        const n = sizes.length;
        const x = sizes.map(transformX);
        const y = times;

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((acc, curr, i) => acc + curr * y[i], 0);
        const sumX2 = x.reduce((a, b) => a + Math.pow(b, 2), 0);
        const sumY2 = y.reduce((a, b) => a + Math.pow(b, 2), 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - Math.pow(sumX, 2)) * (n * sumY2 - Math.pow(sumY, 2)));

        if (denominator === 0) return 0; // Prevent divide by zero

        const r = numerator / denominator;
        return Math.pow(r, 2); // R-squared
    },

    /**
     * Detect Big-O complexity from benchmark results using Least-Squares Regression
     */
    detectComplexity(results) {
        if (results.length < 3) return 'Insufficient data';

        const validPairs = results.filter(r => r.avgTime > 0.001); // Filter extremes/zeros
        if (validPairs.length < 3) return 'O(1) or too fast to measure';

        const sizes = validPairs.map(r => r.inputSize);
        const times = validPairs.map(r => r.avgTime);

        // Define our growth models representing Big-O classes.
        // We evaluate how well f(size) linearly correlates with execution time.
        const models = [
            { label: 'O(1)', fn: x => 1, isValid: true },
            { label: 'O(log n)', fn: x => Math.log2(x), isValid: true },
            { label: 'O(n)', fn: x => x, isValid: true },
            { label: 'O(n log n)', fn: x => x * Math.log2(x), isValid: true },
            { label: 'O(n²)', fn: x => Math.pow(x, 2), isValid: true },
            { label: 'O(n³)', fn: x => Math.pow(x, 3), isValid: true },
            {
                label: 'O(2^n)', fn: x => {
                    // Cap to prevent Infinity breaking math
                    if (x > 1024) return Infinity;
                    return Math.pow(2, x);
                }, isValid: Math.max(...sizes) <= 30
            } // 2^n explodes quickly
        ];

        let bestLabel = 'Unknown';
        let bestR2 = -1;

        // O(1) detection is a special case (near zero variance over x)
        const yMean = times.reduce((a, b) => a + b, 0) / times.length;
        const yVariance = times.reduce((a, b) => a + Math.pow(b - yMean, 2), 0) / times.length;
        if (yVariance < 0.05 && yMean < 2) {
            return 'O(1)'; // Very flat and fast
        }

        for (const model of models) {
            if (!model.isValid) continue;

            // Compute R² for this model mapping
            let r2 = this.computeFit(sizes, times, model.fn);

            // Penalize overly steep models if they fit well purely because of a dominant last point (overfitting)
            // A simple heuristic constraint since R2 can be high for n^3 on n^2 data
            if (model.label === 'O(n³)' || model.label === 'O(2^n)') {
                r2 *= 0.98; // slight penalty to favor simpler models if R2 is close
            }

            if (r2 > bestR2) {
                bestR2 = r2;
                bestLabel = model.label;
            }
        }

        // If R2 is terrible across all, it's very messy execution
        if (bestR2 < 0.6) return 'Inconclusive / Noisy';

        return bestLabel;
    }
};
