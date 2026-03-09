/* =============================================
   Backtracking Algorithms (5)
   ============================================= */

const BacktrackingAlgorithms = {
    'N-Queens': {
        fn: function (input, tracer = null) {
            // Use input length to determine board size (capped for performance)
            const n = Math.min(Math.floor(Math.sqrt(input.length)), 13);
            const board = new Array(n).fill(-1);
            const solutions = [];

            if (tracer) {
                tracer.array = new Array(n).fill(10);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            function isSafe(row, col) {
                for (let i = 0; i < row; i++) {
                    if (board[i] === col ||
                        Math.abs(board[i] - col) === Math.abs(i - row)) {
                        return false;
                    }
                }
                return true;
            }

            function solve(row) {
                if (row === n) {
                    solutions.push(board.slice());
                    if (solutions.length >= 100) return; // Cap solutions
                    return;
                }
                for (let col = 0; col < n && solutions.length < 100; col++) {
                    if (tracer) tracer.mark(row, 'checking');
                    if (isSafe(row, col)) {
                        board[row] = col;
                        if (tracer) tracer.set(row, 20 + (col * (80 / n)));
                        solve(row + 1);
                        board[row] = -1;
                        if (tracer) tracer.set(row, 10);
                    }
                    if (tracer) tracer.clearMarks();
                }
            }

            solve(0);
            return solutions;
        },
        complexity: { best: 'O(n!)', average: 'O(n!)', worst: 'O(n!)', space: 'O(n)' },
        description: 'Places N queens on an N×N chessboard so no two queens threaten each other. Classic backtracking problem demonstrating constraint satisfaction.',
        customInputSize: true
    },

    'Subset Sum': {
        fn: function (input, tracer = null) {
            const arr = input.slice(0, Math.min(input.length, 25));
            const target = arr.reduce((s, v) => s + v, 0) / 3;
            const results = [];

            if (tracer) {
                tracer.array = new Array(arr.length).fill(10);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            function solve(idx, current, currentSum) {
                if (Math.abs(currentSum - target) < 0.001) {
                    results.push(current.slice());
                    if (results.length >= 100) return;
                    return;
                }
                if (idx >= arr.length || currentSum > target || results.length >= 100) return;

                if (tracer) tracer.set(idx, 100);
                current.push(arr[idx]);
                solve(idx + 1, current, currentSum + arr[idx]);
                current.pop();
                if (tracer) tracer.set(idx, 10);
                solve(idx + 1, current, currentSum);
            }

            solve(0, [], 0);
            return results;
        },
        complexity: { best: 'O(2^n)', average: 'O(2^n)', worst: 'O(2^n)', space: 'O(n)' },
        description: 'Finds all subsets that sum to a target value. Explores every possible combination, pruning when current sum exceeds target.',
        customInputSize: true
    },

    'Sudoku Solver': {
        fn: function (input, tracer = null) {
            const n = Math.min(input.length, 81);
            // Generate a partially filled 9x9 board
            const board = Array.from({ length: 9 }, () => new Array(9).fill(0));

            // Fill some cells based on input
            const fillCount = Math.min(Math.floor(n / 5), 17);
            let filled = 0;
            for (let i = 0; i < 9 && filled < fillCount; i++) {
                for (let j = 0; j < 9 && filled < fillCount; j++) {
                    if (Math.random() > 0.7) {
                        const val = 1 + (filled % 9);
                        board[i][j] = val;
                        filled++;
                    }
                }
            }

            if (tracer) {
                tracer.array = board.flat().map(v => v === 0 ? 10 : v * 10);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            function isValid(board, row, col, num) {
                for (let i = 0; i < 9; i++) {
                    if (board[row][i] === num) return false;
                    if (board[i][col] === num) return false;
                }
                const boxRow = Math.floor(row / 3) * 3;
                const boxCol = Math.floor(col / 3) * 3;
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (board[boxRow + i][boxCol + j] === num) return false;
                    }
                }
                return true;
            }

            let steps = 0;
            const maxSteps = n * 100;

            function solve(board) {
                if (++steps > maxSteps) return true; // Bail out for benchmarking
                for (let i = 0; i < 9; i++) {
                    for (let j = 0; j < 9; j++) {
                        if (board[i][j] === 0) {
                            for (let num = 1; num <= 9; num++) {
                                if (tracer) tracer.mark(i * 9 + j, 'checking');
                                if (isValid(board, i, j, num)) {
                                    board[i][j] = num;
                                    if (tracer) tracer.set(i * 9 + j, num * 10);
                                    if (solve(board)) return true;
                                    board[i][j] = 0;
                                    if (tracer) tracer.set(i * 9 + j, 10);
                                }
                            }
                            if (tracer) tracer.clearMarks();
                            return false;
                        }
                    }
                }
                return true;
            }

            solve(board);
            if (tracer) tracer.clearMarks();
            return { board, steps };
        },
        complexity: { best: 'O(1)', average: 'O(9^(n))', worst: 'O(9^81)', space: 'O(n²)' },
        description: 'Fills a 9×9 grid so each row, column, and 3×3 box contains digits 1–9. Tries each number and backtracks on conflict.',
        customInputSize: true
    },

    'Rat in Maze': {
        fn: function (input, tracer = null) {
            const size = Math.min(Math.max(Math.floor(Math.sqrt(input.length)), 4), 20);
            // Generate maze with ~30% blocked cells
            const maze = Array.from({ length: size }, () =>
                Array.from({ length: size }, () => Math.random() > 0.3 ? 1 : 0)
            );
            maze[0][0] = 1;
            maze[size - 1][size - 1] = 1;

            const solution = Array.from({ length: size }, () => new Array(size).fill(0));
            const dx = [1, 0, -1, 0];
            const dy = [0, 1, 0, -1];
            let steps = 0;
            const maxSteps = input.length * 50;

            if (tracer) {
                tracer.array = maze.flat().map(v => v === 1 ? 10 : 0);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
            }

            function solve(x, y) {
                if (++steps > maxSteps) return false;
                if (x === size - 1 && y === size - 1) {
                    solution[x][y] = 1;
                    if (tracer) tracer.set(x * size + y, 100);
                    return true;
                }
                if (x >= 0 && x < size && y >= 0 && y < size && maze[x][y] === 1 && solution[x][y] === 0) {
                    solution[x][y] = 1;
                    if (tracer) tracer.set(x * size + y, 100);
                    for (let d = 0; d < 4; d++) {
                        if (solve(x + dx[d], y + dy[d])) return true;
                    }
                    solution[x][y] = 0;
                    if (tracer) tracer.set(x * size + y, 10);
                }
                return false;
            }

            solve(0, 0);
            return { solution, steps };
        },
        complexity: { best: 'O(n²)', average: 'O(4^(n²))', worst: 'O(4^(n²))', space: 'O(n²)' },
        description: 'Finds path from top-left to bottom-right in a maze. Tries all directions and backtracks when stuck. Classic pathfinding problem.',
        customInputSize: true
    },

    "Knight's Tour": {
        fn: function (input, tracer = null) {
            const size = Math.min(Math.max(Math.floor(Math.sqrt(input.length / 4)), 5), 8);
            const board = Array.from({ length: size }, () => new Array(size).fill(-1));
            const moveX = [2, 1, -1, -2, -2, -1, 1, 2];
            const moveY = [1, 2, 2, 1, -1, -2, -2, -1];
            board[0][0] = 0;
            let steps = 0;
            const maxSteps = input.length * 20;

            if (tracer) {
                tracer.array = new Array(size * size).fill(10);
                tracer.pushStep({ type: 'init', array: tracer.array.slice() });
                tracer.set(0, 100);
            }

            function isSafe(x, y) {
                return x >= 0 && x < size && y >= 0 && y < size && board[x][y] === -1;
            }

            // Warnsdorff's heuristic for ordering moves
            function getDegree(x, y) {
                let count = 0;
                for (let i = 0; i < 8; i++) {
                    if (isSafe(x + moveX[i], y + moveY[i])) count++;
                }
                return count;
            }

            function solve(x, y, moveCount) {
                if (++steps > maxSteps) return false;
                if (moveCount === size * size) return true;

                // Get neighbors sorted by Warnsdorff's rule
                const neighbors = [];
                for (let i = 0; i < 8; i++) {
                    const nx = x + moveX[i], ny = y + moveY[i];
                    if (isSafe(nx, ny)) {
                        neighbors.push({ x: nx, y: ny, degree: getDegree(nx, ny) });
                    }
                }
                neighbors.sort((a, b) => a.degree - b.degree);

                for (const { x: nx, y: ny } of neighbors) {
                    board[nx][ny] = moveCount;
                    if (tracer) {
                        tracer.set(nx * size + ny, 10 + Math.floor((moveCount / (size * size)) * 90));
                        tracer.mark(nx * size + ny, 'checking');
                    }
                    if (solve(nx, ny, moveCount + 1)) return true;
                    board[nx][ny] = -1;
                    if (tracer) {
                        tracer.set(nx * size + ny, 10);
                        tracer.clearMarks();
                    }
                }
                return false;
            }

            solve(0, 0, 1);
            if (tracer) tracer.clearMarks();
            return { board, steps };
        },
        complexity: { best: 'O(8^(n²))', average: 'O(8^(n²))', worst: 'O(8^(n²))', space: 'O(n²)' },
        description: "Finds path for a knight to visit every square on an N×N chessboard exactly once. Uses Warnsdorff's heuristic to optimize move selection.",
        customInputSize: true
    }
};
