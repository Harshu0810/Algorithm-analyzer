/* =============================================
   Sorting Algorithms (8) — With Visualization Tracing
   ============================================= */

const SortingAlgorithms = {
    'Bubble Sort': {
        fn: function (arr, tracer = null) {
            const a = arr.slice();
            const n = a.length;
            for (let i = 0; i < n - 1; i++) {
                for (let j = 0; j < n - i - 1; j++) {
                    if (tracer) tracer.compare(j, j + 1);
                    if (a[j] > a[j + 1]) {
                        if (tracer) tracer.swap(j, j + 1);
                        [a[j], a[j + 1]] = [a[j + 1], a[j]];
                    }
                }
            }
            return a;
        },
        complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
        description: 'Repeatedly steps through the list, compares adjacent elements, and swaps them if in wrong order. Simple but inefficient for large datasets.'
    },

    'Selection Sort': {
        fn: function (arr, tracer = null) {
            const a = arr.slice();
            const n = a.length;
            for (let i = 0; i < n - 1; i++) {
                let minIdx = i;
                if (tracer) tracer.mark(i, 'current');
                for (let j = i + 1; j < n; j++) {
                    if (tracer) tracer.compare(j, minIdx);
                    if (a[j] < a[minIdx]) {
                        minIdx = j;
                        if (tracer) tracer.mark(minIdx, 'min');
                    }
                }
                if (minIdx !== i) {
                    if (tracer) tracer.swap(i, minIdx);
                    [a[i], a[minIdx]] = [a[minIdx], a[i]];
                }
                if (tracer) tracer.clearMarks();
            }
            return a;
        },
        complexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
        description: 'Finds the minimum element from the unsorted part and puts it at the beginning. Always O(n²) regardless of input.'
    },

    'Insertion Sort': {
        fn: function (arr, tracer = null) {
            const a = arr.slice();
            for (let i = 1; i < a.length; i++) {
                const key = a[i];
                let j = i - 1;
                if (tracer) tracer.mark(i, 'key');
                while (j >= 0) {
                    if (tracer) tracer.compare(j, i); // Logic optimization purely for visualizer
                    if (a[j] > key) {
                        if (tracer) tracer.set(j + 1, a[j]);
                        a[j + 1] = a[j];
                        j--;
                    } else {
                        break;
                    }
                }
                if (tracer) tracer.set(j + 1, key);
                a[j + 1] = key;
                if (tracer) tracer.clearMarks();
            }
            return a;
        },
        complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
        description: 'Builds sorted array one item at a time by inserting each element into its correct position. Efficient for small or nearly sorted data.'
    },

    'Merge Sort': {
        fn: function (arr, tracer = null) {
            const a = arr.slice();
            const temp = new Array(a.length);

            function merge(left, right, mid) {
                let i = left, j = mid + 1, k = left;
                while (i <= mid && j <= right) {
                    if (tracer) tracer.compare(i, j);
                    if (a[i] <= a[j]) {
                        temp[k++] = a[i++];
                    } else {
                        temp[k++] = a[j++];
                    }
                }
                while (i <= mid) temp[k++] = a[i++];
                while (j <= right) temp[k++] = a[j++];

                for (let idx = left; idx <= right; idx++) {
                    a[idx] = temp[idx];
                    if (tracer) tracer.set(idx, a[idx]);
                }
            }

            function mergeSort(left, right) {
                if (left >= right) return;
                const mid = Math.floor((left + right) / 2);
                mergeSort(left, mid);
                mergeSort(mid + 1, right);
                merge(left, right, mid);
            }

            mergeSort(0, a.length - 1);
            return a;
        },
        complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
        description: 'Divides array in half, recursively sorts each half, then merges. Guaranteed O(n log n) but uses extra memory.'
    },

    'Quick Sort': {
        fn: function (arr, tracer = null) {
            const a = arr.slice();

            function quickSort(low, high) {
                if (low < high) {
                    const pivot = a[high];
                    if (tracer) tracer.mark(high, 'pivot');
                    let i = low - 1;

                    for (let j = low; j < high; j++) {
                        if (tracer) tracer.compare(j, high);
                        if (a[j] < pivot) {
                            i++;
                            if (tracer) tracer.swap(i, j);
                            [a[i], a[j]] = [a[j], a[i]];
                        }
                    }
                    if (tracer) tracer.swap(i + 1, high);
                    [a[i + 1], a[high]] = [a[high], a[i + 1]];

                    if (tracer) tracer.clearMarks();
                    const pi = i + 1;
                    quickSort(low, pi - 1);
                    quickSort(pi + 1, high);
                }
            }

            quickSort(0, a.length - 1);
            return a;
        },
        complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)' },
        description: 'Picks a pivot, partitions array around it, then recursively sorts partitions. Very fast in practice but O(n²) worst case.'
    },

    'Heap Sort': {
        fn: function (arr, tracer = null) {
            const a = arr.slice();
            const n = a.length;

            function heapify(n, i) {
                let largest = i;
                const left = 2 * i + 1;
                const right = 2 * i + 2;

                if (left < n) {
                    if (tracer) tracer.compare(left, largest);
                    if (a[left] > a[largest]) largest = left;
                }
                if (right < n) {
                    if (tracer) tracer.compare(right, largest);
                    if (a[right] > a[largest]) largest = right;
                }

                if (largest !== i) {
                    if (tracer) tracer.swap(i, largest);
                    [a[i], a[largest]] = [a[largest], a[i]];
                    heapify(n, largest);
                }
            }

            for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
                heapify(n, i);
            }

            for (let i = n - 1; i > 0; i--) {
                if (tracer) tracer.swap(0, i);
                [a[0], a[i]] = [a[i], a[0]];
                if (tracer) tracer.mark(i, 'sorted'); // Visually mark the element as put in its final place
                heapify(i, 0);
            }
            if (tracer) tracer.clearMarks();
            return a;
        },
        complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)' },
        description: 'Builds a max-heap then repeatedly extracts the maximum. Guaranteed O(n log n) with O(1) extra space.'
    },

    'Radix Sort': {
        fn: function (arr, tracer = null) {
            const a = arr.slice();
            if (a.length === 0) return a;
            const max = Math.max(...a);

            function countingSort(exp) {
                const output = new Array(a.length);
                const count = new Array(10).fill(0);

                for (let i = 0; i < a.length; i++) {
                    count[Math.floor(a[i] / exp) % 10]++;
                    if (tracer) tracer.mark(i, 'read'); // Just show we are scanning
                }
                for (let i = 1; i < 10; i++) count[i] += count[i - 1];

                for (let i = a.length - 1; i >= 0; i--) {
                    const idx = Math.floor(a[i] / exp) % 10;
                    output[count[idx] - 1] = a[i];
                    count[idx]--;
                }
                for (let i = 0; i < a.length; i++) {
                    a[i] = output[i];
                    if (tracer) tracer.set(i, a[i]);
                }
                if (tracer) tracer.clearMarks();
            }

            for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
                countingSort(exp);
            }
            return a;
        },
        complexity: { best: 'O(nk)', average: 'O(nk)', worst: 'O(nk)', space: 'O(n + k)' },
        description: 'Sorts integers by processing individual digits. Processes from least significant to most significant digit using counting sort.'
    },

    'Tim Sort': {
        fn: function (arr, tracer = null) {
            const a = arr.slice();
            const RUN = 32;

            function insertionSortRange(left, right) {
                for (let i = left + 1; i <= right; i++) {
                    const key = a[i];
                    let j = i - 1;
                    if (tracer) tracer.mark(i, 'key');
                    while (j >= left) {
                        if (tracer) tracer.compare(j, i);
                        if (a[j] > key) {
                            if (tracer) tracer.set(j + 1, a[j]);
                            a[j + 1] = a[j];
                            j--;
                        } else {
                            break;
                        }
                    }
                    if (tracer) tracer.set(j + 1, key);
                    a[j + 1] = key;
                    if (tracer) tracer.clearMarks();
                }
            }

            function mergeRange(l, m, r) {
                const temp = a.slice(); // Use full array copy to keep index mapping simple for tracer
                let i = l, j = m + 1, k = l;
                while (i <= m && j <= r) {
                    if (tracer) tracer.compare(i, j);
                    if (temp[i] <= temp[j]) {
                        a[k] = temp[i++];
                    } else {
                        a[k] = temp[j++];
                    }
                    if (tracer) tracer.set(k, a[k]);
                    k++;
                }
                while (i <= m) {
                    a[k] = temp[i++];
                    if (tracer) tracer.set(k, a[k]);
                    k++;
                }
                while (j <= r) {
                    a[k] = temp[j++];
                    if (tracer) tracer.set(k, a[k]);
                    k++;
                }
            }

            const n = a.length;
            for (let i = 0; i < n; i += RUN) {
                insertionSortRange(i, Math.min(i + RUN - 1, n - 1));
            }
            for (let size = RUN; size < n; size *= 2) {
                for (let left = 0; left < n; left += 2 * size) {
                    const mid = Math.min(left + size - 1, n - 1);
                    const right = Math.min(left + 2 * size - 1, n - 1);
                    if (mid < right) mergeRange(left, mid, right);
                }
            }
            return a;
        },
        complexity: { best: 'O(n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
        description: 'Hybrid algorithm combining Insertion Sort and Merge Sort. Used by Python and Java internally. Excellent on real-world data.'
    }
};
