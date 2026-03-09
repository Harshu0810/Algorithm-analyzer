/* =============================================
   Divide & Conquer Algorithms (5)
   ============================================= */

const DivideConquerAlgorithms = {
    'D&C Merge Sort': {
        fn: function (arr, tracer = null) {
            const a = arr.slice();

            if (tracer) {
                tracer.array = a.slice();
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            function merge(arr, l, m, r) {
                const left = arr.slice(l, m + 1);
                const right = arr.slice(m + 1, r + 1);
                let i = 0, j = 0, k = l;
                while (i < left.length && j < right.length) {
                    if (tracer) tracer.compare(l + i, m + 1 + j);
                    if (left[i] <= right[j]) arr[k] = left[i++];
                    else arr[k] = right[j++];
                    if (tracer) tracer.set(k, arr[k]);
                    k++;
                }
                while (i < left.length) {
                    arr[k] = left[i++];
                    if (tracer) tracer.set(k, arr[k]);
                    k++;
                }
                while (j < right.length) {
                    arr[k] = right[j++];
                    if (tracer) tracer.set(k, arr[k]);
                    k++;
                }
                if (tracer) tracer.clearMarks();
            }

            function mergeSort(arr, l, r) {
                if (l < r) {
                    const m = Math.floor((l + r) / 2);
                    if (tracer) {
                        tracer.mark(l, 'low');
                        tracer.mark(r, 'high');
                        tracer.mark(m, 'pivot');
                    }
                    mergeSort(arr, l, m);
                    mergeSort(arr, m + 1, r);
                    merge(arr, l, m, r);
                }
            }

            mergeSort(a, 0, a.length - 1);
            return a;
        },
        complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
        description: 'Classic divide & conquer: split array, sort halves, merge. Demonstrates the D&C paradigm most clearly. Guaranteed O(n log n).'
    },

    'Strassen Matrix Mult': {
        fn: function (arr, tracer = null) {
            // Use input to determine matrix size
            const n = Math.min(Math.max(2, Math.pow(2, Math.floor(Math.log2(Math.sqrt(arr.length))))), 128);

            if (tracer) {
                tracer.array = new Array(n).fill(50);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            function createMatrix(size) {
                return Array.from({ length: size }, () =>
                    Array.from({ length: size }, () => Math.floor(Math.random() * 10))
                );
            }

            function standardMultiply(A, B, size) {
                const C = Array.from({ length: size }, () => new Array(size).fill(0));
                for (let i = 0; i < size; i++) {
                    for (let j = 0; j < size; j++) {
                        for (let k = 0; k < size; k++) {
                            C[i][j] += A[i][k] * B[k][j];
                        }
                    }
                    if (tracer) tracer.set(i % tracer.array.length, 100);
                }
                return C;
            }

            const A = createMatrix(n);
            const B = createMatrix(n);

            // For small matrices, use standard multiplication
            // Strassen is beneficial for very large matrices; we demonstrate the concept
            if (n <= 64) {
                return standardMultiply(A, B, n);
            }

            // Simplified Strassen for benchmarking
            function strassenMultiply(A, B, size) {
                if (size <= 32) return standardMultiply(A, B, size);

                const half = size / 2;
                const split = (M, rowStart, colStart) => {
                    const sub = [];
                    for (let i = 0; i < half; i++) {
                        sub.push(M[rowStart + i].slice(colStart, colStart + half));
                    }
                    return sub;
                };

                const add = (A, B) => A.map((row, i) => row.map((v, j) => v + B[i][j]));
                const sub = (A, B) => A.map((row, i) => row.map((v, j) => v - B[i][j]));

                const A11 = split(A, 0, 0), A12 = split(A, 0, half);
                const A21 = split(A, half, 0), A22 = split(A, half, half);
                const B11 = split(B, 0, 0), B12 = split(B, 0, half);
                const B21 = split(B, half, 0), B22 = split(B, half, half);

                if (tracer) tracer.set(Math.floor(Math.random() * tracer.array.length), 80);

                const M1 = strassenMultiply(add(A11, A22), add(B11, B22), half);
                const M2 = strassenMultiply(add(A21, A22), B11, half);
                const M3 = strassenMultiply(A11, sub(B12, B22), half);
                const M4 = strassenMultiply(A22, sub(B21, B11), half);
                const M5 = strassenMultiply(add(A11, A12), B22, half);
                const M6 = strassenMultiply(sub(A21, A11), add(B11, B12), half);
                const M7 = strassenMultiply(sub(A12, A22), add(B21, B22), half);

                const C = Array.from({ length: size }, () => new Array(size).fill(0));
                const C11 = add(sub(add(M1, M4), M5), M7);
                const C12 = add(M3, M5);
                const C21 = add(M2, M4);
                const C22 = add(sub(add(M1, M3), M2), M6);

                for (let i = 0; i < half; i++) {
                    for (let j = 0; j < half; j++) {
                        C[i][j] = C11[i][j];
                        C[i][j + half] = C12[i][j];
                        C[i + half][j] = C21[i][j];
                        C[i + half][j + half] = C22[i][j];
                    }
                }
                return C;
            }

            return strassenMultiply(A, B, n);
        },
        complexity: { best: 'O(n^2.807)', average: 'O(n^2.807)', worst: 'O(n^2.807)', space: 'O(n²)' },
        description: "Strassen's algorithm multiplies matrices faster than standard O(n³) by using 7 multiplications instead of 8 for 2×2 blocks.",
        customInputSize: true
    },

    'Closest Pair of Points': {
        fn: function (arr, tracer = null) {
            const n = arr.length;
            const points = [];
            for (let i = 0; i < n; i++) {
                points.push({ x: Math.random() * 10000, y: Math.random() * 10000, orig: i });
            }
            points.sort((a, b) => a.x - b.x);

            if (tracer) {
                tracer.array = points.map(p => p.y / 100);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            function dist(p1, p2) {
                return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
            }

            function bruteForce(pts, start, end) {
                let minDist = Infinity;
                for (let i = start; i < end; i++) {
                    for (let j = i + 1; j <= end; j++) {
                        if (tracer) tracer.compare(i, j);
                        minDist = Math.min(minDist, dist(pts[i], pts[j]));
                    }
                }
                return minDist;
            }

            function closestPair(pts, start, end) {
                if (end - start < 3) return bruteForce(pts, start, end);

                const mid = Math.floor((start + end) / 2);
                const midX = pts[mid].x;
                if (tracer) tracer.mark(mid, 'pivot');

                const dl = closestPair(pts, start, mid);
                const dr = closestPair(pts, mid + 1, end);
                let d = Math.min(dl, dr);

                // Build strip
                const strip = [];
                for (let i = start; i <= end; i++) {
                    if (Math.abs(pts[i].x - midX) < d) strip.push({ ...pts[i], idx: i });
                }
                strip.sort((a, b) => a.y - b.y);

                for (let i = 0; i < strip.length; i++) {
                    for (let j = i + 1; j < strip.length && (strip[j].y - strip[i].y) < d; j++) {
                        if (tracer) tracer.compare(strip[i].idx, strip[j].idx);
                        d = Math.min(d, dist(strip[i], strip[j]));
                    }
                }
                if (tracer) tracer.clearMarks();
                return d;
            }

            return closestPair(points, 0, points.length - 1);
        },
        complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
        description: 'Finds the two closest points in a set by dividing the plane, solving each half, then checking the strip along the dividing line.'
    },

    'Max Subarray (D&C)': {
        fn: function (arr, tracer = null) {
            // Convert to have negative and positive values
            const a = arr.map(v => v - (arr.length / 2));

            if (tracer) {
                const maxNeg = Math.min(...a, 0);
                tracer.array = a.map(v => v - maxNeg + 10);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            function maxCrossing(arr, low, mid, high) {
                let leftSum = -Infinity, sum = 0;
                let maxLeftIdx = mid;
                for (let i = mid; i >= low; i--) {
                    if (tracer) tracer.compare(i, mid);
                    sum += arr[i];
                    if (sum > leftSum) {
                        leftSum = sum;
                        maxLeftIdx = i;
                    }
                }
                let rightSum = -Infinity;
                sum = 0;
                let maxRightIdx = mid + 1;
                for (let i = mid + 1; i <= high; i++) {
                    if (tracer) tracer.compare(mid + 1, i);
                    sum += arr[i];
                    if (sum > rightSum) {
                        rightSum = sum;
                        maxRightIdx = i;
                    }
                }
                if (tracer) {
                    tracer.mark(maxLeftIdx, 'found');
                    tracer.mark(maxRightIdx, 'found');
                }
                return leftSum + rightSum;
            }

            function maxSubarray(arr, low, high) {
                if (low === high) return arr[low];
                const mid = Math.floor((low + high) / 2);
                if (tracer) tracer.mark(mid, 'pivot');
                const leftMax = maxSubarray(arr, low, mid);
                const rightMax = maxSubarray(arr, mid + 1, high);
                const crossMax = maxCrossing(arr, low, mid, high);
                if (tracer) tracer.clearMarks();
                return Math.max(leftMax, rightMax, crossMax);
            }

            return maxSubarray(a, 0, a.length - 1);
        },
        complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(log n)' },
        description: 'Finds contiguous subarray with maximum sum using divide & conquer. Splits array, finds max in each half and across the split.'
    },

    'Binary Exponentiation': {
        fn: function (arr, tracer = null) {
            const n = arr.length;
            const MOD = 1000000007;

            if (tracer) {
                tracer.array = new Array(n).fill(10);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            function power(base, exp, mod, traceIdx) {
                let result = 1;
                base = base % mod;
                while (exp > 0) {
                    if (exp & 1) result = (result * base) % mod;
                    exp >>= 1;
                    base = (base * base) % mod;
                    if (tracer) tracer.set(traceIdx, 10 + (result % 90));
                }
                if (tracer) tracer.set(traceIdx, 100);
                return result;
            }

            // Compute many exponentiations to scale with input size
            const results = [];
            for (let i = 0; i < n; i++) {
                if (tracer) tracer.mark(i, 'checking');
                results.push(power(arr[i] % 1000 + 2, n * 10 + i, MOD, i));
                if (tracer) tracer.clearMarks();
            }
            return results;
        },
        complexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)' },
        description: 'Computes base^exp in O(log n) by squaring. Key technique in cryptography and competitive programming. Divides exponent in half each step.'
    }
};
