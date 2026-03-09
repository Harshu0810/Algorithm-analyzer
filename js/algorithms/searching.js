/* =============================================
   Searching Algorithms (5)
   ============================================= */

const SearchingAlgorithms = {
    'Linear Search': {
        fn: function (arr, target, tracer = null) {
            for (let i = 0; i < arr.length; i++) {
                if (tracer) tracer.mark(i, 'checking');
                if (arr[i] === target) {
                    if (tracer) { tracer.clearMarks(); tracer.mark(i, 'found'); }
                    return i;
                }
                if (tracer) tracer.clearMarks();
            }
            return -1;
        },
        complexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)', space: 'O(1)' },
        description: 'Sequentially checks each element until a match is found. Works on unsorted arrays but slow for large datasets.',
        needsSorted: false
    },

    'Binary Search': {
        fn: function (arr, target, tracer = null) {
            let low = 0, high = arr.length - 1;
            while (low <= high) {
                const mid = Math.floor((low + high) / 2);
                if (tracer) {
                    tracer.mark(low, 'low');
                    tracer.mark(high, 'high');
                    tracer.mark(mid, 'checking');
                }
                if (arr[mid] === target) {
                    if (tracer) { tracer.clearMarks(); tracer.mark(mid, 'found'); }
                    return mid;
                }
                else if (arr[mid] < target) {
                    low = mid + 1;
                }
                else {
                    high = mid - 1;
                }
                if (tracer) tracer.clearMarks();
            }
            return -1;
        },
        complexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)' },
        description: 'Divides sorted array in half each step. Extremely efficient but requires sorted input.',
        needsSorted: true
    },

    'Jump Search': {
        fn: function (arr, target, tracer = null) {
            const n = arr.length;
            const step = Math.floor(Math.sqrt(n));
            let prev = 0;
            let curr = step;
            while (curr < n && arr[curr] < target) {
                if (tracer) tracer.mark(curr, 'checking');
                prev = curr;
                curr += step;
                if (tracer) tracer.clearMarks();
            }
            for (let i = prev; i <= Math.min(curr, n - 1); i++) {
                if (tracer) tracer.mark(i, 'checking');
                if (arr[i] === target) {
                    if (tracer) { tracer.clearMarks(); tracer.mark(i, 'found'); }
                    return i;
                }
                if (tracer) tracer.clearMarks();
            }
            return -1;
        },
        complexity: { best: 'O(1)', average: 'O(√n)', worst: 'O(√n)', space: 'O(1)' },
        description: 'Jumps ahead by √n steps then does linear search in the block. Between linear and binary in efficiency.',
        needsSorted: true
    },

    'Interpolation Search': {
        fn: function (arr, target, tracer = null) {
            let low = 0, high = arr.length - 1;
            while (low <= high && target >= arr[low] && target <= arr[high]) {
                if (tracer) {
                    tracer.mark(low, 'low');
                    tracer.mark(high, 'high');
                }
                if (low === high) {
                    if (tracer) tracer.mark(low, 'checking');
                    if (arr[low] === target) {
                        if (tracer) { tracer.clearMarks(); tracer.mark(low, 'found'); }
                        return low;
                    }
                    if (tracer) tracer.clearMarks();
                    return -1;
                }
                const pos = low + Math.floor(((target - arr[low]) * (high - low)) / (arr[high] - arr[low]));
                if (tracer) tracer.mark(pos, 'checking');

                if (arr[pos] === target) {
                    if (tracer) { tracer.clearMarks(); tracer.mark(pos, 'found'); }
                    return pos;
                }
                if (arr[pos] < target) {
                    low = pos + 1;
                } else {
                    high = pos - 1;
                }
                if (tracer) tracer.clearMarks();
            }
            return -1;
        },
        complexity: { best: 'O(1)', average: 'O(log log n)', worst: 'O(n)', space: 'O(1)' },
        description: 'Improved binary search that estimates position based on value distribution. Best for uniformly distributed sorted data.',
        needsSorted: true
    },

    'Exponential Search': {
        fn: function (arr, target, tracer = null) {
            const n = arr.length;
            if (tracer) tracer.mark(0, 'checking');
            if (arr[0] === target) {
                if (tracer) { tracer.clearMarks(); tracer.mark(0, 'found'); }
                return 0;
            }
            if (tracer) tracer.clearMarks();

            let i = 1;
            while (i < n && arr[i] <= target) {
                if (tracer) tracer.mark(i, 'checking');
                i *= 2;
                if (tracer) tracer.clearMarks();
            }

            let low = Math.floor(i / 2);
            let high = Math.min(i, n - 1);
            while (low <= high) {
                const mid = Math.floor((low + high) / 2);
                if (tracer) {
                    tracer.mark(low, 'low');
                    tracer.mark(high, 'high');
                    tracer.mark(mid, 'checking');
                }
                if (arr[mid] === target) {
                    if (tracer) { tracer.clearMarks(); tracer.mark(mid, 'found'); }
                    return mid;
                }
                else if (arr[mid] < target) low = mid + 1;
                else high = mid - 1;

                if (tracer) tracer.clearMarks();
            }
            return -1;
        },
        complexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)', space: 'O(1)' },
        description: 'Finds range where element exists by exponentially growing bounds, then binary searches within that range.',
        needsSorted: true
    }
};
