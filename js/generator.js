/* =============================================
   Input Data Generator
   ============================================= */

const DataGenerator = {
    /**
     * Generate array data for sorting/searching/general algorithms
     */
    generateArray(size, pattern = 'random') {
        const arr = new Array(size);

        switch (pattern) {
            case 'sorted':
                for (let i = 0; i < size; i++) arr[i] = i + 1;
                break;
            case 'reversed':
                for (let i = 0; i < size; i++) arr[i] = size - i;
                break;
            case 'nearly-sorted':
                for (let i = 0; i < size; i++) arr[i] = i + 1;
                // Swap ~5% of elements
                const swaps = Math.floor(size * 0.05);
                for (let s = 0; s < swaps; s++) {
                    const i = Math.floor(Math.random() * size);
                    const j = Math.floor(Math.random() * size);
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                break;
            default: // random
                for (let i = 0; i < size; i++) arr[i] = Math.floor(Math.random() * size * 10) + 1;
                break;
        }
        return arr;
    },

    /**
     * Generate sorted array for searching algorithms
     */
    generateSortedArray(size) {
        const arr = new Array(size);
        for (let i = 0; i < size; i++) {
            arr[i] = i * 3 + Math.floor(Math.random() * 3);
        }
        return arr;
    },

    /**
     * Generate graph data (adjacency list with weights)
     */
    generateGraph(nodeCount) {
        const adjacencyList = {};
        for (let i = 0; i < nodeCount; i++) {
            adjacencyList[i] = [];
        }

        // Create a connected graph: first a spanning tree
        for (let i = 1; i < nodeCount; i++) {
            const parent = Math.floor(Math.random() * i);
            const weight = 1 + Math.floor(Math.random() * 20);
            adjacencyList[parent].push({ node: i, weight });
            adjacencyList[i].push({ node: parent, weight });
        }

        // Add extra edges for density (~2x nodes)
        const extraEdges = Math.floor(nodeCount * 0.5);
        for (let e = 0; e < extraEdges; e++) {
            const u = Math.floor(Math.random() * nodeCount);
            const v = Math.floor(Math.random() * nodeCount);
            if (u !== v) {
                const weight = 1 + Math.floor(Math.random() * 20);
                adjacencyList[u].push({ node: v, weight });
                adjacencyList[v].push({ node: u, weight });
            }
        }

        return { adjacencyList, numNodes: nodeCount };
    },

    /**
     * Get adjusted input size for different algorithm categories
     */
    getEffectiveSize(category, size) {
        switch (category) {
            case 'graph':
                // Graph algorithms scale differently — reduce node count
                return Math.min(size, 5000);
            case 'backtracking':
                // Backtracking is exponential — heavily reduce
                return Math.min(size, 2000);
            case 'recursion':
                return Math.min(size, 10000);
            default:
                return size;
        }
    },

    /**
     * Generate input appropriate for the algorithm category
     */
    generateInput(category, size, pattern = 'random') {
        const effectiveSize = this.getEffectiveSize(category, size);

        switch (category) {
            case 'searching':
                return {
                    data: this.generateSortedArray(effectiveSize),
                    target: Math.floor(effectiveSize * Math.random() * 3)
                };
            case 'graph':
                return this.generateGraph(effectiveSize);
            case 'greedy':
            case 'backtracking':
            case 'divideconquer':
            case 'recursion':
                return this.generateArray(effectiveSize, pattern);
            default: // sorting
                return this.generateArray(effectiveSize, pattern);
        }
    }
};
