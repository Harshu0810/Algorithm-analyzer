/* =============================================
   Graph Algorithms (6)
   ============================================= */

const GraphAlgorithms = {
    'BFS': {
        fn: function (graph, tracer = null) {
            const { adjacencyList, numNodes } = graph;
            const visited = new Array(numNodes).fill(false);
            const result = [];
            const queue = [0];
            visited[0] = true;

            if (tracer) {
                tracer.array = new Array(numNodes).fill(10); // initial height
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
                tracer.set(0, 50); // enqueue height
            }

            while (queue.length > 0) {
                const node = queue.shift();
                result.push(node);
                if (tracer) tracer.set(node, 100); // visited height

                const neighbors = adjacencyList[node] || [];
                for (const { node: neighbor } of neighbors) {
                    if (!visited[neighbor]) {
                        visited[neighbor] = true;
                        queue.push(neighbor);
                        if (tracer) tracer.set(neighbor, 50);
                    }
                }
            }
            return result;
        },
        complexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)' },
        description: 'Breadth-First Search explores all neighbors at current depth before moving to next level. Uses a queue. Good for shortest path in unweighted graphs.'
    },

    'DFS': {
        fn: function (graph, tracer = null) {
            const { adjacencyList, numNodes } = graph;
            const visited = new Array(numNodes).fill(false);
            const result = [];

            if (tracer) {
                tracer.array = new Array(numNodes).fill(10);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            function dfs(node) {
                visited[node] = true;
                result.push(node);
                if (tracer) tracer.set(node, 100);
                const neighbors = adjacencyList[node] || [];
                for (const { node: neighbor } of neighbors) {
                    if (!visited[neighbor]) {
                        if (tracer) tracer.mark(neighbor, 'checking');
                        dfs(neighbor);
                        if (tracer) tracer.clearMarks();
                    }
                }
            }

            // Use iterative DFS for large graphs to avoid stack overflow
            if (numNodes > 5000) {
                const stack = [0];
                while (stack.length > 0) {
                    const node = stack.pop();
                    if (visited[node]) continue;
                    visited[node] = true;
                    result.push(node);
                    if (tracer) tracer.set(node, 100);

                    const neighbors = adjacencyList[node] || [];
                    for (let i = neighbors.length - 1; i >= 0; i--) {
                        if (!visited[neighbors[i].node]) {
                            stack.push(neighbors[i].node);
                            if (tracer) tracer.set(neighbors[i].node, 50);
                        }
                    }
                }
            } else {
                if (tracer) tracer.set(0, 50);
                dfs(0);
            }
            return result;
        },
        complexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)' },
        description: 'Depth-First Search explores as far as possible along each branch before backtracking. Uses a stack (or recursion). Good for path finding and cycle detection.'
    },

    'Dijkstra': {
        fn: function (graph, tracer = null) {
            const { adjacencyList, numNodes } = graph;
            const dist = new Array(numNodes).fill(Infinity);
            const visited = new Array(numNodes).fill(false);
            dist[0] = 0;

            if (tracer) {
                tracer.array = new Array(numNodes).fill(100);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
                tracer.set(0, 10);
            }

            // Simple priority queue using array (sufficient for benchmarking)
            const pq = [[0, 0]]; // [distance, node]

            while (pq.length > 0) {
                // Find min distance
                let minIdx = 0;
                for (let i = 1; i < pq.length; i++) {
                    if (pq[i][0] < pq[minIdx][0]) minIdx = i;
                }
                const [d, u] = pq.splice(minIdx, 1)[0];

                if (visited[u]) continue;
                visited[u] = true;
                if (tracer) tracer.mark(u, 'found');

                const neighbors = adjacencyList[u] || [];
                for (const { node: v, weight: w } of neighbors) {
                    if (dist[u] + w < dist[v]) {
                        dist[v] = dist[u] + w;
                        pq.push([dist[v], v]);
                        if (tracer) {
                            const h = Math.max(10, 100 - (dist[v] * 2));
                            tracer.set(v, h);
                            tracer.compare(u, v);
                        }
                    }
                }
                if (tracer) tracer.clearMarks();
            }
            return dist;
        },
        complexity: { best: 'O((V + E) log V)', average: 'O((V + E) log V)', worst: 'O(V²)', space: 'O(V)' },
        description: 'Finds shortest path from source to all vertices in weighted graph with non-negative edges. Uses a priority queue for efficiency.'
    },

    'Bellman-Ford': {
        fn: function (graph, tracer = null) {
            const { adjacencyList, numNodes } = graph;
            const dist = new Array(numNodes).fill(Infinity);
            dist[0] = 0;

            if (tracer) {
                tracer.array = new Array(numNodes).fill(100);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
                tracer.set(0, 10);
            }

            // Build edge list
            const edges = [];
            for (let u = 0; u < numNodes; u++) {
                const neighbors = adjacencyList[u] || [];
                for (const { node: v, weight: w } of neighbors) {
                    edges.push([u, v, w]);
                }
            }

            for (let i = 0; i < numNodes - 1; i++) {
                let updated = false;
                for (const [u, v, w] of edges) {
                    if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
                        dist[v] = dist[u] + w;
                        updated = true;
                        if (tracer) {
                            const h = Math.max(10, 100 - (dist[v] * 2));
                            tracer.set(v, h);
                            tracer.compare(u, v);
                        }
                    }
                }
                if (!updated) break; // Early termination
            }
            if (tracer) tracer.clearMarks();
            return dist;
        },
        complexity: { best: 'O(V·E)', average: 'O(V·E)', worst: 'O(V·E)', space: 'O(V)' },
        description: 'Finds shortest paths from source with support for negative weights. Slower than Dijkstra but handles negative edges.'
    },

    "Prim's MST": {
        fn: function (graph, tracer = null) {
            const { adjacencyList, numNodes } = graph;
            const inMST = new Array(numNodes).fill(false);
            const key = new Array(numNodes).fill(Infinity);
            const result = [];
            key[0] = 0;

            if (tracer) {
                tracer.array = new Array(numNodes).fill(10);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            for (let count = 0; count < numNodes; count++) {
                // Pick minimum key vertex not in MST
                let u = -1, minKey = Infinity;
                for (let v = 0; v < numNodes; v++) {
                    if (!inMST[v] && key[v] < minKey) {
                        minKey = key[v];
                        u = v;
                    }
                }
                if (u === -1) break;
                inMST[u] = true;
                result.push(u);
                if (tracer) tracer.set(u, 100);

                const neighbors = adjacencyList[u] || [];
                for (const { node: v, weight: w } of neighbors) {
                    if (!inMST[v] && w < key[v]) {
                        key[v] = w;
                        if (tracer) {
                            tracer.set(v, 50);
                            tracer.compare(u, v);
                        }
                    }
                }
            }
            if (tracer) tracer.clearMarks();
            return result;
        },
        complexity: { best: 'O(V²)', average: 'O(V²)', worst: 'O(V²)', space: 'O(V)' },
        description: "Prim's algorithm finds Minimum Spanning Tree by greedily adding the cheapest edge connecting a visited to an unvisited vertex."
    },

    "Kruskal's MST": {
        fn: function (graph, tracer = null) {
            const { adjacencyList, numNodes } = graph;

            // Union-Find
            const parent = Array.from({ length: numNodes }, (_, i) => i);
            const rank = new Array(numNodes).fill(0);

            if (tracer) {
                tracer.array = new Array(numNodes).fill(10);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            function find(x) {
                while (parent[x] !== x) {
                    parent[x] = parent[parent[x]];
                    x = parent[x];
                }
                return x;
            }

            function union(x, y) {
                const px = find(x), py = find(y);
                if (px === py) return false;
                if (rank[px] < rank[py]) parent[px] = py;
                else if (rank[px] > rank[py]) parent[py] = px;
                else { parent[py] = px; rank[px]++; }
                return true;
            }

            // Build and sort edges
            const edges = [];
            for (let u = 0; u < numNodes; u++) {
                const neighbors = adjacencyList[u] || [];
                for (const { node: v, weight: w } of neighbors) {
                    if (u < v) edges.push([w, u, v]);
                }
            }
            edges.sort((a, b) => a[0] - b[0]);

            const mst = [];
            for (const [w, u, v] of edges) {
                if (tracer) tracer.compare(u, v);
                if (union(u, v)) {
                    mst.push([u, v, w]);
                    if (tracer) {
                        tracer.set(u, 100);
                        tracer.set(v, 100);
                    }
                    if (mst.length === numNodes - 1) break;
                }
            }
            if (tracer) tracer.clearMarks();
            return mst;
        },
        complexity: { best: 'O(E log E)', average: 'O(E log E)', worst: 'O(E log E)', space: 'O(V + E)' },
        description: "Kruskal's algorithm finds MST by sorting all edges and greedily adding them if they don't form a cycle. Uses Union-Find for cycle detection."
    }
};
