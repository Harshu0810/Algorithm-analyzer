/* =============================================
   Greedy Algorithms (5)
   ============================================= */

const GreedyAlgorithms = {
    'Activity Selection': {
        fn: function (input, tracer = null) {
            const n = input.length;
            // Generate activities: [start, end] sorted by end time
            const activities = [];
            for (let i = 0; i < n; i++) {
                const start = Math.floor(Math.random() * n);
                activities.push([start, start + 1 + Math.floor(Math.random() * (n / 2))]);
            }
            activities.sort((a, b) => a[1] - b[1]);

            if (tracer) {
                tracer.array = new Array(n).fill(10);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            const selected = [activities[0]];
            let lastEnd = activities[0][1];
            if (tracer) tracer.set(0, 100);

            for (let i = 1; i < activities.length; i++) {
                if (tracer) tracer.mark(i, 'checking');
                if (activities[i][0] >= lastEnd) {
                    selected.push(activities[i]);
                    lastEnd = activities[i][1];
                    if (tracer) {
                        tracer.clearMarks();
                        tracer.set(i, 100);
                    }
                } else {
                    if (tracer) {
                        tracer.clearMarks();
                        tracer.set(i, 20);
                    }
                }
            }
            return selected;
        },
        complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
        description: 'Selects maximum number of non-overlapping activities. Greedy choice: always pick the activity that finishes earliest.'
    },

    'Fractional Knapsack': {
        fn: function (input, tracer = null) {
            const n = input.length;
            const capacity = n * 5;
            // Generate items: { weight, value }
            const items = [];
            for (let i = 0; i < n; i++) {
                items.push({
                    weight: 1 + Math.floor(Math.random() * 20),
                    value: 1 + Math.floor(Math.random() * 100)
                });
            }

            // Sort by value/weight ratio descending
            items.sort((a, b) => (b.value / b.weight) - (a.value / a.weight));

            if (tracer) {
                tracer.array = new Array(n).fill(10);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            let totalValue = 0;
            let remaining = capacity;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (tracer) tracer.mark(i, 'checking');
                if (remaining >= item.weight) {
                    totalValue += item.value;
                    remaining -= item.weight;
                    if (tracer) {
                        tracer.clearMarks();
                        tracer.set(i, 100);
                    }
                } else {
                    totalValue += (remaining / item.weight) * item.value;
                    if (tracer) {
                        tracer.clearMarks();
                        tracer.set(i, 50);
                    }
                    break;
                }
            }
            return totalValue;
        },
        complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
        description: 'Maximizes total value in knapsack by taking fractions of items. Greedy choice: highest value-to-weight ratio first.'
    },

    'Huffman Encoding': {
        fn: function (input, tracer = null) {
            const n = input.length;
            // Generate character frequencies
            const freq = {};
            for (let i = 0; i < n; i++) {
                const ch = String.fromCharCode(65 + (i % 26));
                freq[ch] = (freq[ch] || 0) + 1 + Math.floor(Math.random() * 10);
            }

            // Build Huffman tree using array-based priority queue
            let nodes = Object.entries(freq).map(([ch, f]) => ({ char: ch, freq: f, left: null, right: null }));

            if (tracer) {
                tracer.array = nodes.map(nd => nd.freq);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            while (nodes.length > 1) {
                nodes.sort((a, b) => a.freq - b.freq);
                const left = nodes.shift();
                const right = nodes.shift();

                if (tracer) {
                    tracer.array.shift();
                    tracer.array.shift();
                    tracer.pushStep({ type: 'init', array: tracer.array.slice() });
                }

                const newNode = {
                    char: null,
                    freq: left.freq + right.freq,
                    left,
                    right
                };
                nodes.push(newNode);

                if (tracer) {
                    tracer.array.push(newNode.freq);
                    tracer.set(tracer.array.length - 1, newNode.freq);
                }
            }

            // Generate codes
            const codes = {};
            function traverse(node, code) {
                if (!node) return;
                if (node.char) { codes[node.char] = code || '0'; return; }
                traverse(node.left, code + '0');
                traverse(node.right, code + '1');
            }
            if (nodes.length > 0) traverse(nodes[0], '');
            return codes;
        },
        complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
        description: 'Builds optimal prefix-free binary codes based on character frequencies. Foundation of data compression algorithms.'
    },

    'Coin Change (Greedy)': {
        fn: function (input, tracer = null) {
            const n = input.length;
            const amount = n * 7;
            const coins = [1, 2, 5, 10, 20, 50, 100, 500];

            if (tracer) {
                tracer.array = new Array(coins.length).fill(10);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            const result = [];
            let remaining = amount;

            for (let i = coins.length - 1; i >= 0 && remaining > 0; i--) {
                if (tracer) tracer.mark(i, 'checking');
                while (remaining >= coins[i]) {
                    result.push(coins[i]);
                    remaining -= coins[i];
                    if (tracer) tracer.set(i, tracer.array[i] + 10);
                }
                if (tracer) tracer.clearMarks();
            }
            return result;
        },
        complexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n × m)', space: 'O(n)' },
        description: 'Makes change using fewest coins by greedily picking largest denomination first. Works optimally with standard coin systems.'
    },

    'Job Sequencing': {
        fn: function (input, tracer = null) {
            const n = input.length;
            // Generate jobs: { id, deadline, profit }
            const jobs = [];
            for (let i = 0; i < n; i++) {
                jobs.push({
                    id: i,
                    deadline: 1 + Math.floor(Math.random() * n),
                    profit: 1 + Math.floor(Math.random() * 100)
                });
            }

            // Sort by profit descending
            jobs.sort((a, b) => b.profit - a.profit);

            const maxDeadline = Math.max(...jobs.map(j => j.deadline));
            const slots = new Array(maxDeadline + 1).fill(-1);
            const result = [];

            if (tracer) {
                tracer.array = new Array(maxDeadline).fill(10);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            for (let i = 0; i < jobs.length; i++) {
                const job = jobs[i];
                for (let j = job.deadline; j >= 1; j--) {
                    if (tracer) tracer.mark(j - 1, 'checking');
                    if (slots[j] === -1) {
                        slots[j] = job.id;
                        result.push(job);
                        if (tracer) {
                            tracer.clearMarks();
                            tracer.set(j - 1, 100);
                        }
                        break;
                    }
                }
                if (tracer) tracer.clearMarks();
            }
            return result;
        },
        complexity: { best: 'O(n log n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(n)' },
        description: 'Schedules jobs to maximize profit within deadlines. Greedy choice: process highest-profit jobs first, assigning latest available slot.'
    }
};
