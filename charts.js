/**
 * JS TRACKER - Charts & Visual Analytics Module
 * Powered by Chart.js with responsive styling and student-friendly themes
 */

const ChartManager = {
  budgetSpendingChart: null,
  categoryDonutChart: null,
  monthlyTrendChart: null,

  // Color mappings matching our curated palette
  palette: [
    '#0D9488', // Teal
    '#F97316', // Orange
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F59E0B', // Amber
    '#64748B'  // Slate
  ],

  // 1. Dashboard Budget vs Spending Bar Chart
  renderBudgetVsSpending(canvasId, monthData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.budgetSpendingChart) {
      this.budgetSpendingChart.destroy();
    }

    const categories = window.store.categories.filter(c => c.type === 'expense');
    const labels = [];
    const budgetAmounts = [];
    const spentAmounts = [];
    const barColors = [];

    categories.forEach(cat => {
      const budget = monthData.budgets[cat.id] || 0;
      const spent = monthData.categorySpending[cat.id] || 0;

      // Only show categories that have either a budget or spending
      if (budget > 0 || spent > 0) {
        labels.push(cat.name);
        budgetAmounts.push(budget);
        spentAmounts.push(spent);

        // Highlight warning if spent > budget
        if (spent > budget) {
          barColors.push('rgba(244, 63, 94, 0.85)'); // Red/Rose over budget
        } else if (budget > 0 && spent / budget >= 0.85) {
          barColors.push('rgba(245, 158, 11, 0.85)'); // Amber warning
        } else {
          barColors.push('rgba(13, 148, 136, 0.85)'); // Teal healthy
        }
      }
    });

    const ctx = canvas.getContext('2d');
    this.budgetSpendingChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Allocated Budget',
            data: budgetAmounts,
            backgroundColor: 'rgba(203, 213, 225, 0.65)',
            borderColor: '#94a3b8',
            borderWidth: 1,
            borderRadius: 6,
            barPercentage: 0.7,
            categoryPercentage: 0.8
          },
          {
            label: 'Actual Spent',
            data: spentAmounts,
            backgroundColor: barColors,
            borderColor: barColors.map(c => c.replace('0.85', '1')),
            borderWidth: 1.5,
            borderRadius: 6,
            barPercentage: 0.7,
            categoryPercentage: 0.8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                weight: '600',
                size: 12
              },
              color: '#334155'
            }
          },
          tooltip: {
            backgroundColor: '#0d1b2a',
            titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: '700', size: 13 },
            bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                return ` ${context.dataset.label}: $${context.raw.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '600' },
              color: '#64748b',
              maxRotation: 30,
              minRotation: 0
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(226, 232, 240, 0.7)' },
            ticks: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
              color: '#64748b',
              callback: function (val) {
                return '$' + val;
              }
            }
          }
        }
      }
    });
  },

  // 2. Reports: Category Spending Donut Chart
  renderCategoryDonut(canvasId, categorySpending) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.categoryDonutChart) {
      this.categoryDonutChart.destroy();
    }

    const labels = [];
    const dataValues = [];
    const colors = [];

    const categories = window.store.categories.filter(c => c.type === 'expense');
    let total = 0;

    categories.forEach((cat, index) => {
      const amt = categorySpending[cat.id] || 0;
      if (amt > 0) {
        labels.push(cat.name);
        dataValues.push(amt);
        colors.push(cat.color || this.palette[index % this.palette.length]);
        total += amt;
      }
    });

    if (dataValues.length === 0) {
      labels.push('No Expenses');
      dataValues.push(1);
      colors.push('#cbd5e1');
    }

    const ctx = canvas.getContext('2d');
    this.categoryDonutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                weight: '600',
                size: 11
              },
              color: '#334155',
              padding: 12
            }
          },
          tooltip: {
            backgroundColor: '#0d1b2a',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                const val = context.raw;
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                return ` ${context.label}: $${val.toFixed(2)} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  },

  // 3. Reports: Monthly Income vs Expenses Trend Chart
  renderMonthlyTrends(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.monthlyTrendChart) {
      this.monthlyTrendChart.destroy();
    }

    // Prepare months: e.g. June, July, August, September 2026
    const months = ['2026-06', '2026-07', '2026-08', '2026-09'];
    const monthNames = ['Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026'];

    const incomeData = [];
    const expenseData = [];
    const savingsData = [];

    months.forEach((m, idx) => {
      // If store has transactions for this month, calculate
      const summary = window.store.getMonthSummary(m);
      if (summary.totalIncome > 0 || summary.totalExpenses > 0) {
        incomeData.push(summary.totalIncome);
        expenseData.push(summary.totalExpenses);
        savingsData.push(Math.max(0, summary.remainingBalance));
      } else {
        // Sample realistic baseline for older historical months
        if (idx === 0) {
          incomeData.push(2200);
          expenseData.push(1850);
          savingsData.push(350);
        } else if (idx === 1) {
          incomeData.push(2350);
          expenseData.push(1920);
          savingsData.push(430);
        }
      }
    });

    const ctx = canvas.getContext('2d');
    this.monthlyTrendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: monthNames,
        datasets: [
          {
            label: 'Total Income',
            data: incomeData,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            borderWidth: 2.5,
            pointBackgroundColor: '#10B981',
            pointRadius: 4,
            tension: 0.35,
            fill: true
          },
          {
            label: 'Total Expenses',
            data: expenseData,
            borderColor: '#F43F5E',
            backgroundColor: 'rgba(244, 63, 94, 0.06)',
            borderWidth: 2.5,
            pointBackgroundColor: '#F43F5E',
            pointRadius: 4,
            tension: 0.35,
            fill: true
          },
          {
            label: 'Net Savings',
            data: savingsData,
            borderColor: '#0D9488',
            borderDash: [5, 5],
            borderWidth: 2,
            pointBackgroundColor: '#0D9488',
            pointRadius: 4,
            tension: 0.35
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                weight: '600',
                size: 12
              },
              color: '#334155'
            }
          },
          tooltip: {
            backgroundColor: '#0d1b2a',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                return ` ${context.dataset.label}: $${context.raw.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '600' },
              color: '#64748b'
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(226, 232, 240, 0.7)' },
            ticks: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
              color: '#64748b',
              callback: function (val) {
                return '$' + val;
              }
            }
          }
        }
      }
    });
  }
};

window.ChartManager = ChartManager;
