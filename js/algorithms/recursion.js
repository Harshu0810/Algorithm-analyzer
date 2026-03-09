/* =============================================
   Recursion Algorithms (5)
   ============================================= */

const RecursionAlgorithms = {
    'Fibonacci': {
        fn: function (input, tracer = null) {
            const n = Math.min(input.length, 35);

            if (tracer) {
                tracer.array = new Array(input.length).fill(10);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            // Recursive with memoization for benchmarking
            function fibMemo(n, memo = {}, traceIdx = -1) {
                if (tracer && traceIdx >= 0) tracer.mark(traceIdx, 'checking');
                if (n in memo) return memo[n];
                if (n <= 1) {
                    if (tracer && traceIdx >= 0) tracer.set(traceIdx, 10 + n * 10);
                    return n;
                }
                const res = fibMemo(n - 1, memo, traceIdx) + fibMemo(n - 2, memo, traceIdx);
                memo[n] = res;
                if (tracer && traceIdx >= 0) tracer.set(traceIdx, 10 + (res % 90)); // cap height
                return res;
            }

            // Compute multiple Fibonacci numbers to scale with input size
            const results = [];
            for (let i = 0; i < input.length; i++) {
                results.push(fibMemo(Math.min(i % (n + 1), 35), {}, i));
                if (tracer) tracer.clearMarks();
            }
            return results;
        },
        complexity: { best: 'O(n)', average: 'O(n)', worst: 'O(2^n)', space: 'O(n)' },
        description: 'Computes Fibonacci sequence recursively. Without memoization it is O(2^n); with memoization, O(n). Classic example of recursion and dynamic programming.'
    },

    'Factorial': {
        fn: function (input, tracer = null) {
            if (tracer) {
                tracer.array = new Array(input.length).fill(10);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            function factorial(n, traceIdx = -1) {
                if (tracer && traceIdx >= 0) tracer.mark(traceIdx, 'checking');
                if (n <= 1) return 1n;
                const res = BigInt(n) * factorial(n - 1, traceIdx);
                if (tracer && traceIdx >= 0) tracer.set(traceIdx, 10 + Number(res % 90n));
                return res;
            }

            // Compute factorials for multiple values to scale
            const results = [];
            for (let i = 0; i < input.length; i++) {
                const val = Math.min((i % 100) + 1, 150);
                results.push(factorial(val, i));
                if (tracer) tracer.clearMarks();
            }
            return results;
        },
        complexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)', space: 'O(n)' },
        description: 'Computes n! = n × (n-1) × ... × 1 recursively. Each call reduces n by 1. Demonstrates simple linear recursion.'
    },

    'Tower of Hanoi': {
        fn: function (input, tracer = null) {
            // Number of disks proportional to log(input size) for manageable run time
            const disks = Math.min(Math.floor(Math.log2(input.length)) + 5, 25);
            let moves = 0;

            if (tracer) {
                tracer.array = new Array(Math.min(disks, 100)).fill(10);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            function hanoi(n, from, to, aux) {
                if (n === 0) return;
                hanoi(n - 1, from, aux, to);
                moves++;
                if (tracer && n < tracer.array.length) tracer.set(n, 10 + (moves % 90));
                hanoi(n - 1, aux, to, from);
            }

            hanoi(disks, 'A', 'C', 'B');
            return { disks, moves };
        },
        complexity: { best: 'O(2^n)', average: 'O(2^n)', worst: 'O(2^n)', space: 'O(n)' },
        description: 'Moves n disks from source to destination using an auxiliary peg. Requires 2^n - 1 moves. Classic example of exponential recursion.'
    },

    'Permutations Generator': {
        fn: function (input, tracer = null) {
            const arr = input.slice(0, Math.min(input.length, 9));
            const results = [];
            let count = 0;
            const maxCount = Math.max(input.length * 10, 1000);

            if (tracer) {
                tracer.array = arr.slice();
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            function permute(arr, l, r) {
                if (count >= maxCount) return;
                if (l === r) {
                    results.push(arr.slice());
                    count++;
                    if (tracer) tracer.pushStep({ type: 'init', array: tracer.array.slice() }); // visually show the permutation occasionally
                    return;
                }
                for (let i = l; i <= r && count < maxCount; i++) {
                    if (tracer) tracer.swap(l, i);
                    [arr[l], arr[i]] = [arr[i], arr[l]];
                    if (tracer) {
                        tracer.set(l, arr[l]);
                        tracer.set(i, arr[i]);
                    }
                    permute(arr, l + 1, r);
                    if (tracer) tracer.swap(l, i);
                    [arr[l], arr[i]] = [arr[i], arr[l]];
                    if (tracer) {
                        tracer.set(l, arr[l]);
                        tracer.set(i, arr[i]);
                    }
                }
            }

            permute(arr, 0, arr.length - 1);
            return { permutations: results.length, total: count };
        },
        complexity: { best: 'O(n!)', average: 'O(n!)', worst: 'O(n!)', space: 'O(n)' },
        description: 'Generates all permutations of an array by recursively swapping elements. Produces n! results, demonstrating factorial time complexity.',
        customInputSize: true
    },

    'Ackermann Function': {
        fn: function (input, tracer = null) {
            // Ackermann grows astronomically; we keep m small and vary iterations with input size
            const iterations = input.length;

            if (tracer) {
                tracer.array = new Array(iterations).fill(10);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            function ackermann(m, n, depth, traceIdx = -1) {
                if (depth > 5000) return n; // Safety cap
                if (tracer && traceIdx >= 0) {
                    tracer.set(traceIdx, 10 + (depth % 90)); // visualize depth
                }
                if (m === 0) return n + 1;
                if (n === 0) return ackermann(m - 1, 1, depth + 1, traceIdx);
                return ackermann(m - 1, ackermann(m, n - 1, depth + 1, traceIdx), depth + 1, traceIdx);
            }

            const results = [];
            for (let i = 0; i < iterations; i++) {
                if (tracer) tracer.mark(i, 'checking');
                // Keep m=0..3, n varies
                const m = i % 4;
                const n = Math.min((i % 5) + 1, 6 - m);
                results.push(ackermann(m, n, 0, i));
                if (tracer) {
                    tracer.clearMarks();
                    tracer.set(i, 100);
                }
            }
            return results;
        },
        complexity: { best: 'O(A(m,n))', average: 'O(A(m,n))', worst: 'O(A(m,n))', space: 'O(A(m,n))' },
        description: 'Computes the Ackermann function — grows faster than any primitive recursive function. Demonstrates deeply nested recursion with extreme growth rates.'
    }
};
