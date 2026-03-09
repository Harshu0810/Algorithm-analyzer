/* =============================================
   Chart.js Visualization Wrapper
   ============================================= */

const Visualizer = {
    // Chart color palette — vibrant and distinct
    colors: [
        { bg: 'rgba(0, 240, 255, 0.15)', border: '#00f0ff', point: '#00f0ff' },
        { bg: 'rgba(139, 92, 246, 0.15)', border: '#8b5cf6', point: '#8b5cf6' },
        { bg: 'rgba(244, 114, 182, 0.15)', border: '#f472b6', point: '#f472b6' },
        { bg: 'rgba(52, 211, 153, 0.15)', border: '#34d399', point: '#34d399' },
        { bg: 'rgba(251, 191, 36, 0.15)', border: '#fbbf24', point: '#fbbf24' },
        { bg: 'rgba(248, 113, 113, 0.15)', border: '#f87171', point: '#f87171' },
        { bg: 'rgba(96, 165, 250, 0.15)', border: '#60a5fa', point: '#60a5fa' },
        { bg: 'rgba(167, 139, 250, 0.15)', border: '#a78bfa', point: '#a78bfa' },
        { bg: 'rgba(74, 222, 128, 0.15)', border: '#4ade80', point: '#4ade80' },
        { bg: 'rgba(251, 146, 60, 0.15)', border: '#fb923c', point: '#fb923c' },
    ],

    timeChart: null,
    memoryChart: null,

    getChartDefaults() {
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        return {
            textColor: isDark ? 'rgba(238, 240, 246, 0.6)' : 'rgba(26, 30, 46, 0.6)',
            gridColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)',
            fontFamily: "'Inter', sans-serif"
        };
    },

    /**
     * Create execution time line chart
     */
    createTimeChart(canvasId, benchmarkData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.timeChart) this.timeChart.destroy();

        const defaults = this.getChartDefaults();
        const datasets = [];
        const labels = [...new Set(benchmarkData.flatMap(d => d.results.map(r => r.inputSize)))].sort((a, b) => a - b);

        benchmarkData.forEach((algo, idx) => {
            const color = this.colors[idx % this.colors.length];
            const data = labels.map(size => {
                const result = algo.results.find(r => r.inputSize === size);
                return result ? result.avgTime : null;
            });

            datasets.push({
                label: algo.name,
                data,
                borderColor: color.border,
                backgroundColor: color.bg,
                pointBackgroundColor: color.point,
                pointBorderColor: color.point,
                pointRadius: 5,
                pointHoverRadius: 8,
                borderWidth: 2.5,
                tension: 0.3,
                fill: true
            });
        });

        this.timeChart = new Chart(ctx, {
            type: 'line',
            data: { labels: labels.map(l => l.toLocaleString()), datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: defaults.textColor,
                            font: { family: defaults.fontFamily, size: 12, weight: '500' },
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 22, 45, 0.95)',
                        titleColor: '#eef0f6',
                        bodyColor: 'rgba(238, 240, 246, 0.8)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        cornerRadius: 10,
                        padding: 14,
                        bodyFont: { family: "'JetBrains Mono', monospace", size: 12 },
                        titleFont: { family: defaults.fontFamily, size: 13, weight: '600' },
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y?.toFixed(3)} ms`
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Input Size',
                            color: defaults.textColor,
                            font: { family: defaults.fontFamily, size: 12, weight: '600' }
                        },
                        ticks: { color: defaults.textColor, font: { family: defaults.fontFamily, size: 11 } },
                        grid: { color: defaults.gridColor }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Execution Time (ms)',
                            color: defaults.textColor,
                            font: { family: defaults.fontFamily, size: 12, weight: '600' }
                        },
                        ticks: {
                            color: defaults.textColor,
                            font: { family: "'JetBrains Mono', monospace", size: 11 },
                            callback: (v) => v.toFixed(2)
                        },
                        grid: { color: defaults.gridColor },
                        beginAtZero: true
                    }
                }
            }
        });
    },

    /**
     * Create memory usage bar chart
     */
    createMemoryChart(canvasId, benchmarkData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.memoryChart) this.memoryChart.destroy();

        const defaults = this.getChartDefaults();
        // Use the largest input size for memory comparison
        const maxSize = Math.max(...benchmarkData[0].results.map(r => r.inputSize));

        const labels = benchmarkData.map(d => d.name);
        const data = benchmarkData.map(d => {
            const result = d.results.find(r => r.inputSize === maxSize);
            return result ? result.memoryKB : 0;
        });

        const colors = benchmarkData.map((_, idx) => this.colors[idx % this.colors.length]);

        this.memoryChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: `Memory Usage at n=${maxSize.toLocaleString()}`,
                    data,
                    backgroundColor: colors.map(c => c.bg.replace('0.15', '0.6')),
                    borderColor: colors.map(c => c.border),
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: defaults.textColor,
                            font: { family: defaults.fontFamily, size: 12, weight: '500' }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 22, 45, 0.95)',
                        titleColor: '#eef0f6',
                        bodyColor: 'rgba(238, 240, 246, 0.8)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        cornerRadius: 10,
                        padding: 14,
                        bodyFont: { family: "'JetBrains Mono', monospace", size: 12 },
                        callbacks: {
                            label: (ctx) => `Memory: ${ctx.parsed.y?.toFixed(2)} KB`
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: defaults.textColor, font: { family: defaults.fontFamily, size: 11 } },
                        grid: { color: defaults.gridColor }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Memory (KB)',
                            color: defaults.textColor,
                            font: { family: defaults.fontFamily, size: 12, weight: '600' }
                        },
                        ticks: {
                            color: defaults.textColor,
                            font: { family: "'JetBrains Mono', monospace", size: 11 }
                        },
                        grid: { color: defaults.gridColor },
                        beginAtZero: true
                    }
                }
            }
        });
    },

    /**
     * Update chart colors when theme changes
     */
    updateTheme() {
        if (this.timeChart) {
            const defaults = this.getChartDefaults();
            this.timeChart.options.scales.x.ticks.color = defaults.textColor;
            this.timeChart.options.scales.y.ticks.color = defaults.textColor;
            this.timeChart.options.scales.x.grid.color = defaults.gridColor;
            this.timeChart.options.scales.y.grid.color = defaults.gridColor;
            this.timeChart.options.scales.x.title.color = defaults.textColor;
            this.timeChart.options.scales.y.title.color = defaults.textColor;
            this.timeChart.options.plugins.legend.labels.color = defaults.textColor;
            this.timeChart.update();
        }
        if (this.memoryChart) {
            const defaults = this.getChartDefaults();
            this.memoryChart.options.scales.x.ticks.color = defaults.textColor;
            this.memoryChart.options.scales.y.ticks.color = defaults.textColor;
            this.memoryChart.options.scales.x.grid.color = defaults.gridColor;
            this.memoryChart.options.scales.y.grid.color = defaults.gridColor;
            this.memoryChart.options.scales.y.title.color = defaults.textColor;
            this.memoryChart.options.plugins.legend.labels.color = defaults.textColor;
            this.memoryChart.update();
        }
    }
};
