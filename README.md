AlgoViz — Automated Algorithm Performance Analyzer

AlgoViz is a client-side algorithm benchmarking and visualization platform that allows users to analyze, compare, and visualize algorithm performance in real time directly in the browser.

It supports multiple algorithm categories, measures execution time and memory usage, and automatically estimates Big-O complexity trends using empirical benchmarking.

The platform also includes an interactive visualizer that displays step-by-step execution of algorithms.

Live Features

Benchmark multiple algorithms simultaneously

Real-time performance comparison

Automatic complexity estimation

Memory usage tracking

Interactive algorithm visualizer

Dynamic dataset generation

Export benchmark results to CSV and PDF

Fully client-side (no server required)

Algorithms Implemented
Sorting Algorithms

Bubble Sort

Selection Sort

Insertion Sort

Merge Sort

Quick Sort

Heap Sort

Counting Sort

Radix Sort

These algorithms support visual tracing of comparisons, swaps, and updates for step-by-step visualization. 

sorting

Searching Algorithms

Linear Search

Binary Search

Jump Search

Interpolation Search

Exponential Search

Binary and other logarithmic searches require sorted arrays. 

searching

Graph Algorithms

Breadth First Search (BFS)

Depth First Search (DFS)

Dijkstra's Algorithm

Prim's Algorithm

Kruskal's Algorithm

Topological Sort

Graph algorithms operate on generated adjacency-list graphs. 

graph

Greedy Algorithms

Activity Selection

Fractional Knapsack

Huffman Encoding

Job Sequencing

Minimum Spanning Tree variants

Greedy strategies choose locally optimal solutions for global efficiency. 

greedy

Divide and Conquer

Merge Sort

Strassen Matrix Multiplication

Maximum Subarray

Binary Search (recursive)

Closest Pair of Points

Divide-and-conquer algorithms recursively split problems into subproblems. 

divideconquer

Backtracking

N-Queens

Subset Sum

Sudoku Solver

Graph Coloring

Hamiltonian Path

Backtracking explores solution trees while pruning invalid states. 

backtracking

Recursion Algorithms

Fibonacci

Factorial

Tower of Hanoi

Permutations

Combinations

These algorithms demonstrate recursive problem solving patterns. 

recursion

Performance Metrics

AlgoViz benchmarks algorithms using:

Execution Time (ms)

Memory Usage (KB)

Variance and Standard Deviation

Average / Min / Max runtime

Automatic complexity trend detection

Memory tracking is implemented by monitoring array allocations during algorithm execution. 

engine

Algorithm Visualization

The visualization engine records algorithm operations such as:

Comparisons

Swaps

Value updates

Pivot markers

Each operation is stored as an execution step and rendered on a canvas animation timeline. 

tracer

Dataset Generator

The system automatically generates input datasets including:

Random arrays

Sorted arrays

Reverse sorted arrays

Nearly sorted arrays

Random graphs

This allows algorithms to be tested under multiple conditions. 

generator

Export Options

Benchmark results can be exported as:

CSV files

PDF analysis reports

Reports include charts, statistics, and complexity analysis. 

exporter

Tech Stack

Frontend

HTML5

CSS3

JavaScript (Vanilla)

Visualization

Canvas API

Chart.js

Performance Measurement

High-resolution browser timers

Custom memory allocation tracker

Project Structure
AlgoViz/
│
├── index.html
│
├── css/
│   └── styles.css
│
├── js/
│   ├── app.js
│   ├── engine.js
│   ├── animator.js
│   ├── tracer.js
│   ├── generator.js
│   ├── exporter.js
│   └── visualizer.js
│
├── algorithms/
│   ├── sorting.js
│   ├── searching.js
│   ├── graph.js
│   ├── greedy.js
│   ├── divideconquer.js
│   ├── backtracking.js
│   └── recursion.js
How to Run

Clone the repository

git clone https://github.com/Harshu0810/Algorithm-analyzer.git

Navigate to the project directory

cd Algorithm-analyzer

Open the application

open index.html

or simply double-click index.html.

No backend or installation is required.

Example Use Cases

Learning algorithm complexity

Visualizing sorting and searching operations

Comparing algorithm performance

Teaching data structures and algorithms

Academic demonstrations

Future Improvements

GPU-based benchmarking

Larger dataset support

WebAssembly implementations

Algorithm code editor

AI-based complexity prediction

More graph algorithms

License

This project is open-source and available under the MIT License.

Author

Harshit Goyal
