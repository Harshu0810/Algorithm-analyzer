/* =============================================
   Algorithm Tracer — Records Step-by-Step Executions
   ============================================= */

class AlgorithmTracer {
    constructor(initialArray) {
        this.steps = [];
        this.array = initialArray.slice();
        // Record initial state
        this.pushStep({ type: 'init', array: this.array.slice() });
    }

    /**
     * Record a comparison between two indices
     * @param {number} i - First index
     * @param {number} j - Second index
     */
    compare(i, j) {
        this.pushStep({ type: 'compare', indices: [i, j] });
    }

    /**
     * Record a swap of values at two indices and update internal array
     * @param {number} i - First index
     * @param {number} j - Second index
     */
    swap(i, j) {
        let temp = this.array[i];
        this.array[i] = this.array[j];
        this.array[j] = temp;
        this.pushStep({ type: 'swap', indices: [i, j], array: this.array.slice() });
    }

    /**
     * Record setting a value at a specific index
     * @param {number} i - Index to set
     * @param {number|string} val - Value to set
     */
    set(i, val) {
        this.array[i] = val;
        this.pushStep({ type: 'set', idx: i, val: val, array: this.array.slice() });
    }

    /**
     * Mark a pivot or boundary
     */
    mark(idx, role = 'pivot') {
        this.pushStep({ type: 'mark', idx, role });
    }

    /**
     * Clear all marks
     */
    clearMarks() {
        this.pushStep({ type: 'clear_marks' });
    }

    pushStep(step) {
        this.steps.push(step);
    }

    getSteps() {
        return this.steps;
    }
}
