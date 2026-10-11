/**
 * JS TRACKER - Personal & Student Budget Planner Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  activeView: 'dashboard',
  currentEditingTxId: null,
  currentEditingGoalId: null,
  deleteTarget: null, // { type: 'transaction'|'goal', id: string, name: string }

  init() {
    this.bindEvents();
    this.populateMonthSelectors();
    this.populateCategoryDropdowns();
    this.updateUserProfileUI();
    this.renderActiveView();

    const currentUser = window.store.getCurrentUser();
    if (currentUser && currentUser.id !== 'user_alex') {
      this.showToast(`Welcome back, ${currentUser.fullName}! Active session loaded.`, 'success');
    } else {
      this.showToast('Welcome to JS TRACKER! Sample student data loaded.', 'success');
    }
  },

  // =========================================================================
  // EVENT BINDINGS
  // =========================================================================
  bindEvents() {
    // Navigation items
    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        if (view) {
          this.switchView(view);
          // If on mobile, close sidebar drawer
          document.querySelector('.sidebar')?.classList.remove('mobile-open');
        }
      });
    });

    // Mobile Hamburger
    const menuBtn = document.getElementById('mobileMenuBtn');
    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        document.querySelector('.sidebar')?.classList.toggle('mobile-open');
      });
    }

    // Month Selector in Header
    const monthSelect = document.getElementById('headerMonthSelect');
    if (monthSelect) {
      monthSelect.addEventListener('change', (e) => {
        window.store.setSelectedMonth(e.target.value);
        this.renderActiveView();
        this.showToast(`Switched view to ${this.formatMonthName(e.target.value)}`, 'info');
      });
    }

    // Quick Add Transaction CTA buttons
    document.querySelectorAll('.btn-open-tx-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openTransactionModal();
      });
    });

    // Quick Add Goal CTA
    const addGoalBtn = document.getElementById('btnOpenAddGoalModal');
    if (addGoalBtn) {
      addGoalBtn.addEventListener('click', () => {
        this.openGoalModal();
      });
    }

    // Reset Data Button
    const resetBtn = document.getElementById('btnResetSampleData');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset all transactions, budgets, and goals to initial student sample data? Any new entries will be overwritten.')) {
          window.store.resetToDefaults();
          this.populateMonthSelectors();
          this.renderActiveView();
          this.showToast('Reset to student sample data successfully!', 'success');
        }
      });
    }

    // Export / Backup Button
    const exportBtn = document.getElementById('btnExportData');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportDataFile();
      });
    }

    // Import Button
    const importInput = document.getElementById('importFileInput');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        this.importDataFile(e);
      });
    }

    // Print Report Button
    const printBtn = document.getElementById('btnPrintReport');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Transaction Search & Filter events
    const txSearch = document.getElementById('txSearchInput');
    const txTypeFilter = document.getElementById('txTypeFilter');
    const txCatFilter = document.getElementById('txCategoryFilter');
    const txSortFilter = document.getElementById('txSortFilter');

    [txSearch, txTypeFilter, txCatFilter, txSortFilter].forEach(el => {
      if (el) {
        el.addEventListener('input', () => this.renderTransactionsTable());
        el.addEventListener('change', () => this.renderTransactionsTable());
      }
    });

    // Transaction Form Submit
    const txForm = document.getElementById('transactionForm');
    if (txForm) {
      txForm.addEventListener('submit', (e) => this.handleTransactionSubmit(e));
    }

    // Transaction Type Radio/Toggle buttons inside modal
    document.querySelectorAll('.type-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.currentTarget.dataset.type;
        document.querySelectorAll('.type-toggle-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        document.getElementById('txTypeInput').value = type;
        this.updateCategoryOptionsForType(type);
      });
    });

    // Budget Form Submit
    const budgetForm = document.getElementById('budgetForm');
    if (budgetForm) {
      budgetForm.addEventListener('submit', (e) => this.handleBudgetSubmit(e));
    }

    // Savings Goal Form Submit
    const goalForm = document.getElementById('goalForm');
    if (goalForm) {
      goalForm.addEventListener('submit', (e) => this.handleGoalSubmit(e));
    }

    // Goal Deposit Form Submit
    const depositForm = document.getElementById('depositForm');
    if (depositForm) {
      depositForm.addEventListener('submit', (e) => this.handleDepositSubmit(e));
    }

    // Delete Confirmation Button
    const confirmDeleteBtn = document.getElementById('btnConfirmDelete');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', () => this.executeDelete());
    }

    // Modal Close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.currentTarget.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });

    // ESC key closes modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
      }
    });

    // SMS Input Live Preview
    const smsInput = document.getElementById('smsRawInput');
    if (smsInput) {
      smsInput.addEventListener('input', () => this.updateLiveSMSPreview());
    }

    const smsSender = document.getElementById('smsSenderInput');
    if (smsSender) {
      smsSender.addEventListener('input', () => {
        const senderLabel = document.getElementById('bubbleSenderLabel');
        if (senderLabel) senderLabel.textContent = `From: ${smsSender.value.trim() || 'BANK'}`;
      });
    }

    // SMS Template Chips
    document.querySelectorAll('.sms-template-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const templateKey = e.currentTarget.dataset.template;
        this.applySMSTemplate(templateKey);
      });
    });

    // Process SMS Button
    const btnProcess = document.getElementById('btnProcessSMS');
    if (btnProcess) {
      btnProcess.addEventListener('click', () => this.handleProcessSMS());
    }

    // Auto-Import Toggle
    const autoToggle = document.getElementById('smsAutoImportToggle');
    if (autoToggle) {
      autoToggle.addEventListener('change', (e) => {
        window.store.updateProfile({ smsTrackingEnabled: e.target.checked });
        this.showToast(`Auto-import from SMS is now ${e.target.checked ? 'enabled' : 'disabled'}.`, 'info');
      });
    }

    // Edit Phone Number Button & Form
    const editPhoneBtn = document.getElementById('btnEditPhoneNumber');
    if (editPhoneBtn) {
      editPhoneBtn.addEventListener('click', () => this.openPhoneModal());
    }

    const phoneForm = document.getElementById('phoneConfigForm');
    if (phoneForm) {
      phoneForm.addEventListener('submit', (e) => this.handlePhoneConfigSubmit(e));
    }

    // =======================================================================
    // AUTHENTICATION & REGISTRATION EVENTS
    // =======================================================================
    const btnHeaderAuth = document.getElementById('btnHeaderAuth');
    if (btnHeaderAuth) {
      btnHeaderAuth.addEventListener('click', () => this.showAuthScreen('login'));
    }

    const btnLogout = document.getElementById('btnSidebarLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleLogout();
      });
    }

    const userProfileBadge = document.querySelector('.user-profile-badge');
    if (userProfileBadge) {
      userProfileBadge.style.cursor = 'pointer';
      userProfileBadge.title = 'Click to switch user or view account';
      userProfileBadge.addEventListener('click', (e) => {
        if (!e.target.closest('#btnSidebarLogout')) {
          this.showAuthScreen('login');
        }
      });
    }

    // Auth Switcher Tabs
    const tabLogin = document.getElementById('authTabLogin');
    const tabRegister = document.getElementById('authTabRegister');
    if (tabLogin && tabRegister) {
      tabLogin.addEventListener('click', () => this.switchAuthTab('login'));
      tabRegister.addEventListener('click', () => this.switchAuthTab('register'));
    }

    // Toggle Password Visibility
    const togglePwdBtn = document.getElementById('btnToggleLoginPwd');
    if (togglePwdBtn) {
      togglePwdBtn.addEventListener('click', () => {
        const pwdInput = document.getElementById('loginPasswordInput');
        if (pwdInput) {
          pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
        }
      });
    }

    const toggleRegPwdBtn = document.getElementById('btnToggleRegPwd');
    if (toggleRegPwdBtn) {
      toggleRegPwdBtn.addEventListener('click', () => {
        const pwdInput = document.getElementById('regPasswordInput');
        if (pwdInput) {
          pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
        }
      });
    }

    const toggleRegConfirmPwdBtn = document.getElementById('btnToggleRegConfirmPwd');
    if (toggleRegConfirmPwdBtn) {
      toggleRegConfirmPwdBtn.addEventListener('click', () => {
        const pwdInput = document.getElementById('regConfirmPasswordInput');
        if (pwdInput) {
          pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
        }
      });
    }

    // Real-time password length & match check
    const regPwd = document.getElementById('regPasswordInput');
    const regConfirm = document.getElementById('regConfirmPasswordInput');
    const matchHint = document.getElementById('regPwdMatchHint');

    const checkPasswordMatch = () => {
      if (!regPwd || !matchHint) return;
      const val = regPwd.value;
      const confirmVal = regConfirm?.value || '';

      if (!val) {
        matchHint.textContent = 'Password must be at least 6 characters long.';
        matchHint.style.color = 'var(--text-muted)';
        return;
      }
      if (val.length < 6) {
        matchHint.textContent = `Password is ${val.length}/6 characters (too short).`;
        matchHint.style.color = 'var(--rose-500)';
        return;
      }
      if (confirmVal.length > 0) {
        if (val === confirmVal) {
          matchHint.textContent = '✓ Passwords match! Ready to create account.';
          matchHint.style.color = 'var(--teal-600)';
        } else {
          matchHint.textContent = '✕ Passwords do not match yet.';
          matchHint.style.color = 'var(--rose-500)';
        }
      } else {
        matchHint.textContent = '✓ Password meets minimum length (6+ chars).';
        matchHint.style.color = 'var(--teal-600)';
      }
    };

    if (regPwd) regPwd.addEventListener('input', checkPasswordMatch);
    if (regConfirm) regConfirm.addEventListener('input', checkPasswordMatch);

    // Auto-format phone number on blur
    const regPhone = document.getElementById('regPhoneInput');
    if (regPhone) {
      regPhone.addEventListener('blur', (e) => {
        const digits = e.target.value.replace(/\D/g, '');
        if (digits.length === 10) {
          e.target.value = `+1 (${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
        }
      });
    }

    // Cancel / Close Auth Modal
    const btnCancelAuth = document.getElementById('btnCancelAuth');
    if (btnCancelAuth) {
      btnCancelAuth.addEventListener('click', () => this.hideAuthScreen());
    }

    // Fast Student Demo Login
    const btnDemoLogin = document.getElementById('btnFastDemoLogin');
    if (btnDemoLogin) {
      btnDemoLogin.addEventListener('click', () => {
        document.getElementById('loginEmailInput').value = 'alex.rivera@campus.edu';
        document.getElementById('loginPasswordInput').value = 'password123';
        this.executeLogin('alex.rivera@campus.edu', 'password123');
      });
    }

    // Login Form Submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmailInput')?.value || '';
        const password = document.getElementById('loginPasswordInput')?.value || '';
        this.executeLogin(email, password);
      });
    }

    // Register Form Submit
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegisterSubmit(e));
    }
  },

  // =========================================================================
  // VIEW SWITCHER
  // =========================================================================
  switchView(viewId) {
    this.activeView = viewId;

    // Update active nav links
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewId);
    });
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewId);
    });

    // Show target section
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.toggle('active', sec.id === `view-${viewId}`);
    });

    // Update page title
    const titles = {
      dashboard: { title: 'Student Budget Overview', sub: 'Track spending, stay within limits, and protect your savings buffer.' },
      transactions: { title: 'Income & Expense History', sub: 'Log campus jobs, rent, groceries, textbooks, and daily expenses.' },
      budgets: { title: 'Monthly Category Budgets', sub: 'Set realistic spending caps and receive visual warnings before exceeding them.' },
      goals: { title: 'Target Savings Goals', sub: 'Build emergency buffers, plan trips, and save steadily each month.' },
      reports: { title: 'Monthly Spending Reports', sub: 'Analyze category distribution, month-to-month trends, and supportive saving ideas.' },
      sms: { title: 'Mobile SMS Expense Tracker', sub: 'Automatically extract and track expenses from incoming bank and UPI SMS notifications.' }
    };

    if (titles[viewId]) {
      document.getElementById('pageTitle').textContent = titles[viewId].title;
      document.getElementById('pageSubtitle').textContent = titles[viewId].sub;
    }

    this.renderActiveView();
  },

  renderActiveView() {
    switch (this.activeView) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'transactions':
        this.renderTransactionsTable();
        break;
      case 'budgets':
        this.renderBudgetsView();
        break;
      case 'goals':
        this.renderGoalsView();
        break;
      case 'reports':
        this.renderReportsView();
        break;
      case 'sms':
        this.renderSMSView();
        break;
    }
  },

  // =========================================================================
  // DASHBOARD RENDERING
  // =========================================================================
  renderDashboard() {
    const month = window.store.selectedMonth;
    const summary = window.store.getMonthSummary(month);

    // Update Banner & Metrics
    document.getElementById('dashIncomeVal').textContent = `$${summary.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('dashExpenseVal').textContent = `$${summary.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    const balanceEl = document.getElementById('dashBalanceVal');
    balanceEl.textContent = `$${summary.remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (summary.remainingBalance < 0) {
      balanceEl.style.color = 'var(--rose-500)';
    } else {
      balanceEl.style.color = 'var(--navy-900)';
    }

    // Savings Progress Card
    const savingsPct = summary.totalGoalTarget > 0 ? Math.min(100, Math.round((summary.totalGoalSaved / summary.totalGoalTarget) * 100)) : 0;
    document.getElementById('dashSavingsVal').textContent = `$${summary.totalGoalSaved.toLocaleString('en-US', { minimumFractionDigits: 0 })} / $${summary.totalGoalTarget.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
    document.getElementById('dashSavingsBadge').textContent = `${savingsPct}% Funded`;

    // Render Budget Warnings / Helpful Messages
    this.renderDashboardBudgetAlerts(summary);

    // Render Budget vs Spending Chart
    if (window.ChartManager) {
      window.ChartManager.renderBudgetVsSpending('dashBudgetChart', summary);
    }

    // Render Recent Transactions
    this.renderDashboardRecentTransactions(month);

    // Render Upcoming Recurring Bills
    this.renderDashboardRecurringBills();
  },

  renderDashboardBudgetAlerts(summary) {
    const alertsContainer = document.getElementById('dashBudgetAlerts');
    if (!alertsContainer) return;

    alertsContainer.innerHTML = '';
    const categories = window.store.categories.filter(c => c.type === 'expense');
    const alerts = [];

    categories.forEach(cat => {
      const budget = summary.budgets[cat.id] || 0;
      const spent = summary.categorySpending[cat.id] || 0;

      if (budget > 0) {
        const pct = (spent / budget) * 100;
        const diff = budget - spent;

        if (spent > budget) {
          alerts.push({
            type: 'danger',
            icon: '⚠️',
            title: `${cat.name} is Over Budget!`,
            message: `You've spent $${spent.toFixed(2)} ($${Math.abs(diff).toFixed(2)} over your $${budget.toFixed(2)} monthly limit).`,
            categoryId: cat.id
          });
        } else if (pct >= 85) {
          alerts.push({
            type: 'warning',
            icon: '⚡',
            title: `${cat.name} is at ${Math.round(pct)}% of Limit`,
            message: `Only $${diff.toFixed(2)} remaining out of $${budget.toFixed(2)} for this month. Keep an eye on dining out!`,
            categoryId: cat.id
          });
        }
      }
    });

    if (alerts.length === 0) {
      alertsContainer.innerHTML = `
        <div class="budget-alert-card tip">
          <div class="alert-main">
            <div class="alert-icon">✨</div>
            <div>
              <span class="alert-text-bold">All category budgets are healthy!</span>
              <span class="alert-subtext">You are currently pacing well within your monthly student allowance. Great discipline!</span>
            </div>
          </div>
          <button class="alert-action-btn" onclick="App.switchView('budgets')">View Budgets</button>
        </div>
      `;
    } else {
      alerts.forEach(item => {
        const div = document.createElement('div');
        div.className = `budget-alert-card ${item.type}`;
        div.innerHTML = `
          <div class="alert-main">
            <div class="alert-icon">${item.icon}</div>
            <div>
              <span class="alert-text-bold">${item.title}</span>
              <span class="alert-subtext">${item.message}</span>
            </div>
          </div>
          <button class="alert-action-btn" onclick="App.openBudgetEditModal('${item.categoryId}')">Adjust Budget</button>
        `;
        alertsContainer.appendChild(div);
      });
    }
  },

  renderDashboardRecentTransactions(month) {
    const listEl = document.getElementById('dashRecentTransactionsList');
    if (!listEl) return;

    const txs = window.store.getTransactions(month).slice(0, 5);

    if (txs.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.88rem;">
          No transactions recorded for this month yet.
        </div>
      `;
      return;
    }

    listEl.innerHTML = txs.map(t => {
      const cat = window.store.getCategory(t.category);
      const isIncome = t.type === 'income';
      const sign = isIncome ? '+' : '-';
      const formattedAmt = `${sign}$${t.amount.toFixed(2)}`;
      
      return `
        <div class="tx-row-item">
          <div class="tx-left">
            <div class="tx-cat-icon" style="background-color: ${cat.color};">
              ${this.getCategoryIconSvg(cat.icon)}
            </div>
            <div class="tx-details">
              <span class="tx-desc" title="${this.escapeHtml(t.description)}">${this.escapeHtml(t.description)}</span>
              <span class="tx-meta">
                <span>${this.formatShortDate(t.date)}</span> • <span>${cat.name}</span> • <span>${t.paymentMethod}</span>
              </span>
            </div>
          </div>
          <div class="tx-amount ${t.type}">${formattedAmt}</div>
        </div>
      `;
    }).join('');
  },

  renderDashboardRecurringBills() {
    const listEl = document.getElementById('dashRecurringList');
    if (!listEl) return;

    const bills = window.store.getRecurringBills();
    listEl.innerHTML = bills.map(b => {
      const cat = window.store.getCategory(b.category);
      const paidClass = b.isPaidThisMonth ? 'paid' : '';
      const statusText = b.isPaidThisMonth ? 'Paid for this month' : `Due on Day ${b.dayOfMonth}`;
      const btnText = b.isPaidThisMonth ? '✓ Paid' : 'Mark Paid';

      return `
        <div class="recurring-item ${paidClass}">
          <div class="rec-left">
            <div class="rec-day-badge">
              <span>Day</span>
              ${b.dayOfMonth}
            </div>
            <div>
              <div class="rec-name">${this.escapeHtml(b.title)}</div>
              <div class="rec-status">${statusText}</div>
            </div>
          </div>
          <div class="rec-right">
            <div class="rec-cost">$${b.amount.toFixed(2)}</div>
            <button class="btn-toggle-paid" onclick="App.toggleRecurringBill('${b.id}')">${btnText}</button>
          </div>
        </div>
      `;
    }).join('');
  },

  toggleRecurringBill(id) {
    const updated = window.store.toggleRecurringPaid(id);
    if (updated) {
      this.renderDashboardRecurringBills();
      this.showToast(`Updated "${updated.title}" status.`, 'info');
    }
  },

  // =========================================================================
  // TRANSACTIONS TABLE VIEW & FILTERING
  // =========================================================================
  renderTransactionsTable() {
    const tableBody = document.getElementById('transactionsTableBody');
    const emptyState = document.getElementById('txEmptyState');
    if (!tableBody) return;

    const query = (document.getElementById('txSearchInput')?.value || '').toLowerCase().trim();
    const typeFilter = document.getElementById('txTypeFilter')?.value || 'all';
    const catFilter = document.getElementById('txCategoryFilter')?.value || 'all';
    const sortFilter = document.getElementById('txSortFilter')?.value || 'date-desc';
    const currentMonth = window.store.selectedMonth;

    let txs = window.store.transactions.filter(t => {
      // Filter by current active month if chosen or all
      const matchMonth = t.date.startsWith(currentMonth);
      const matchType = typeFilter === 'all' || t.type === typeFilter;
      const matchCat = catFilter === 'all' || t.category === catFilter;
      const matchQuery = !query ||
        t.description.toLowerCase().includes(query) ||
        (t.notes && t.notes.toLowerCase().includes(query)) ||
        window.store.getCategory(t.category).name.toLowerCase().includes(query) ||
        (t.paymentMethod && t.paymentMethod.toLowerCase().includes(query));

      return matchMonth && matchType && matchCat && matchQuery;
    });

    // Sorting
    txs.sort((a, b) => {
      if (sortFilter === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortFilter === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortFilter === 'amount-desc') return b.amount - a.amount;
      if (sortFilter === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

    // Summary count badge
    const countBadge = document.getElementById('txFilteredCount');
    if (countBadge) {
      countBadge.textContent = `${txs.length} entries`;
    }

    if (txs.length === 0) {
      tableBody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tableBody.innerHTML = txs.map(t => {
      const cat = window.store.getCategory(t.category);
      const isIncome = t.type === 'income';
      const sign = isIncome ? '+' : '-';
      const amountColor = isIncome ? 'var(--emerald-500)' : 'var(--navy-900)';

      return `
        <tr>
          <td style="font-weight: 600; color: var(--navy-900); white-space: nowrap;">
            ${this.formatDisplayDate(t.date)}
          </td>
          <td>
            <div style="font-weight: 700; color: var(--navy-900);">${this.escapeHtml(t.description)}</div>
            ${t.notes ? `<div style="font-size: 0.76rem; color: var(--text-muted);">${this.escapeHtml(t.notes)}</div>` : ''}
          </td>
          <td>
            <span class="cat-pill" style="background-color: ${cat.color};">
              ${cat.name}
            </span>
          </td>
          <td style="color: var(--text-secondary); font-size: 0.82rem;">
            ${t.paymentMethod || 'Debit Card'}
          </td>
          <td>
            <span class="badge-tag" style="background: ${isIncome ? 'var(--emerald-100)' : 'var(--warm-muted)'}; color: ${isIncome ? '#065f46' : 'var(--text-secondary)'}; font-size: 0.74rem; font-weight: 700; padding: 3px 8px; border-radius: 9999px;">
              ${isIncome ? 'Income' : 'Expense'}
            </span>
          </td>
          <td style="font-weight: 800; color: ${amountColor}; text-align: right; white-space: nowrap;">
            ${sign}$${t.amount.toFixed(2)}
          </td>
          <td style="text-align: right;">
            <div class="table-actions" style="justify-content: flex-end;">
              <button class="btn-icon-action" title="Edit Entry" onclick="App.openTransactionModal('${t.id}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </button>
              <button class="btn-icon-action delete" title="Delete Entry" onclick="App.confirmDeleteTransaction('${t.id}', '${this.escapeHtml(t.description)}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // =========================================================================
  // BUDGETS VIEW RENDERING
  // =========================================================================
  renderBudgetsView() {
    const month = window.store.selectedMonth;
    const summary = window.store.getMonthSummary(month);
    const grid = document.getElementById('budgetsCardsGrid');
    if (!grid) return;

    // Header master metrics
    document.getElementById('budgetTotalSpent').textContent = `$${summary.totalExpenses.toFixed(2)}`;
    document.getElementById('budgetTotalCap').textContent = `$${summary.totalBudget.toFixed(2)}`;

    const totalPct = summary.totalBudget > 0 ? (summary.totalExpenses / summary.totalBudget) * 100 : 0;
    const masterFill = document.getElementById('budgetMasterProgress');
    if (masterFill) {
      masterFill.style.width = `${Math.min(100, totalPct)}%`;
      if (totalPct > 100) masterFill.className = 'progress-bar-fill danger';
      else if (totalPct >= 85) masterFill.className = 'progress-bar-fill warning';
      else masterFill.className = 'progress-bar-fill normal';
    }

    const categories = window.store.categories.filter(c => c.type === 'expense');

    grid.innerHTML = categories.map(cat => {
      const budget = summary.budgets[cat.id] || 0;
      const spent = summary.categorySpending[cat.id] || 0;
      const remaining = budget - spent;
      const pct = budget > 0 ? Math.min(150, (spent / budget) * 100) : 0;

      let statusBadge = '';
      let progressClass = 'normal';
      let isOverClass = '';

      if (budget === 0) {
        statusBadge = '<span class="cat-status-badge">No limit set</span>';
      } else if (spent > budget) {
        statusBadge = `<span class="cat-status-badge over">Over Budget (+ $${Math.abs(remaining).toFixed(2)})</span>`;
        progressClass = 'danger';
        isOverClass = 'is-over';
      } else if (pct >= 85) {
        statusBadge = `<span class="cat-status-badge warning">Near Limit (${Math.round(pct)}%)</span>`;
        progressClass = 'warning';
      } else {
        statusBadge = `<span class="cat-status-badge on-track">On Track (${Math.round(pct)}%)</span>`;
        progressClass = 'normal';
      }

      return `
        <div class="category-budget-card ${isOverClass}">
          <div class="cat-card-header">
            <div class="cat-card-title-group">
              <div class="cat-icon-circle" style="background-color: ${cat.color};">
                ${this.getCategoryIconSvg(cat.icon)}
              </div>
              <div class="cat-name">${cat.name}</div>
            </div>
            ${statusBadge}
          </div>

          <div class="cat-card-stats">
            <div class="cat-stat-item">
              <span class="label">Spent</span>
              <span class="val" style="${spent > budget ? 'color: var(--rose-500);' : ''}">$${spent.toFixed(2)}</span>
            </div>
            <div class="cat-stat-item">
              <span class="label">Allocated Budget</span>
              <span class="val">$${budget.toFixed(2)}</span>
            </div>
          </div>

          <div class="cat-progress-meta">
            <span>${budget > 0 ? (budget >= spent ? `$${remaining.toFixed(2)} remaining` : `$${Math.abs(remaining).toFixed(2)} over limit`) : 'No limit'}</span>
            <span>${budget > 0 ? Math.round((spent / budget) * 100) : 0}% used</span>
          </div>

          <div class="progress-bar-bg">
            <div class="progress-bar-fill ${progressClass}" style="width: ${Math.min(100, pct)}%;"></div>
          </div>

          <div class="cat-card-footer">
            <span style="font-size: 0.76rem; color: var(--text-muted);">Alert at 85%</span>
            <button class="btn-card-edit" onclick="App.openBudgetEditModal('${cat.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Set Limit
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  // =========================================================================
  // SAVINGS GOALS VIEW RENDERING
  // =========================================================================
  renderGoalsView() {
    const grid = document.getElementById('goalsCardsGrid');
    if (!grid) return;

    const goals = window.store.getSavingsGoals();

    if (goals.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon-wrap">🎯</div>
          <div class="empty-title">No Savings Goals Yet</div>
          <div class="empty-sub">Create your first savings goal for an emergency buffer, laptop upgrade, or vacation fund!</div>
          <button class="btn-primary" onclick="App.openGoalModal()">+ Create Savings Goal</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = goals.map(g => {
      const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
      const remaining = Math.max(0, g.targetAmount - g.currentAmount);

      // Calculate monthly savings needed based on current date
      const currentDate = new Date('2026-09-26');
      const targetDate = new Date(g.targetDate);
      let monthsRemaining = (targetDate.getFullYear() - currentDate.getFullYear()) * 12 + (targetDate.getMonth() - currentDate.getMonth());
      if (monthsRemaining < 1) monthsRemaining = 1;

      const monthlyNeeded = (remaining / monthsRemaining).toFixed(2);
      const weeklyNeeded = (remaining / (monthsRemaining * 4.33)).toFixed(2);

      return `
        <div class="goal-card">
          <div class="goal-card-top">
            <div class="goal-icon-badge" style="background-color: ${g.color};">
              ${this.getGoalIconSvg(g.icon)}
            </div>
            <span class="goal-tag">${this.escapeHtml(g.categoryTag || 'General')}</span>
          </div>

          <div class="goal-title">${this.escapeHtml(g.title)}</div>
          <div class="goal-target-date">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Target: ${this.formatDisplayDate(g.targetDate)} (${monthsRemaining} mos remaining)
          </div>

          <div class="goal-amounts-row">
            <div class="goal-saved">$${g.currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div class="goal-target">of $${g.targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>

          <div class="progress-bar-bg" style="margin-bottom: 6px;">
            <div class="progress-bar-fill normal" style="width: ${pct}%; background: ${g.color};"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.74rem; font-weight: 700; color: var(--text-muted); margin-bottom: 12px;">
            <span>${pct}% saved</span>
            <span>$${remaining.toFixed(2)} to go</span>
          </div>

          <div class="goal-monthly-needed-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <div>Save <strong>$${monthlyNeeded}/mo</strong> (~$${weeklyNeeded}/wk) to hit your goal on time!</div>
          </div>

          <div class="goal-card-actions">
            <button class="btn-deposit" onclick="App.openDepositModal('${g.id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Deposit
            </button>
            <button class="btn-goal-options" title="Edit Goal" onclick="App.openGoalModal('${g.id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
            <button class="btn-goal-options" title="Delete Goal" onclick="App.confirmDeleteGoal('${g.id}', '${this.escapeHtml(g.title)}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  // =========================================================================
  // MONTHLY REPORTS VIEW RENDERING
  // =========================================================================
  renderReportsView() {
    const currentMonth = window.store.selectedMonth;
    // Calculate previous month string (e.g. 2026-09 -> 2026-08)
    const prevMonth = this.getPreviousMonthString(currentMonth);

    const currSummary = window.store.getMonthSummary(currentMonth);
    const prevSummary = window.store.getMonthSummary(prevMonth);

    // Month Comparison Stats
    document.getElementById('reportCurrentMonthLabel').textContent = this.formatMonthName(currentMonth);
    document.getElementById('reportPrevMonthLabel').textContent = this.formatMonthName(prevMonth);

    // 1. Income comparison
    document.getElementById('repIncomeVal').textContent = `$${currSummary.totalIncome.toFixed(2)}`;
    const incomeDiff = currSummary.totalIncome - prevSummary.totalIncome;
    const incomeDeltaEl = document.getElementById('repIncomeDelta');
    incomeDeltaEl.textContent = `${incomeDiff >= 0 ? '+' : ''}$${incomeDiff.toFixed(2)} vs last month`;
    incomeDeltaEl.className = `delta-pill ${incomeDiff >= 0 ? 'good' : 'warn'}`;

    // 2. Expenses comparison
    document.getElementById('repExpenseVal').textContent = `$${currSummary.totalExpenses.toFixed(2)}`;
    const expDiff = currSummary.totalExpenses - prevSummary.totalExpenses;
    const expDeltaEl = document.getElementById('repExpenseDelta');
    expDeltaEl.textContent = `${expDiff <= 0 ? '-' : '+'}$${Math.abs(expDiff).toFixed(2)} vs last month`;
    expDeltaEl.className = `delta-pill ${expDiff <= 0 ? 'good' : 'warn'}`;

    // 3. Net Savings rate
    document.getElementById('repSavingsRateVal').textContent = `${currSummary.savingsRatePct}%`;
    const rateDiff = (currSummary.savingsRatePct - prevSummary.savingsRatePct).toFixed(1);
    const rateDeltaEl = document.getElementById('repSavingsDelta');
    rateDeltaEl.textContent = `${rateDiff >= 0 ? '+' : ''}${rateDiff}% vs last month`;
    rateDeltaEl.className = `delta-pill ${rateDiff >= 0 ? 'good' : 'warn'}`;

    // 4. Highest Category
    let topCatName = 'None';
    let topCatAmt = 0;
    Object.entries(currSummary.categorySpending).forEach(([catId, amt]) => {
      if (amt > topCatAmt) {
        topCatAmt = amt;
        topCatName = window.store.getCategory(catId).name;
      }
    });
    document.getElementById('repTopCatVal').textContent = topCatName;
    document.getElementById('repTopCatAmt').textContent = `$${topCatAmt.toFixed(2)} spent`;

    // Render Charts
    if (window.ChartManager) {
      window.ChartManager.renderCategoryDonut('reportDonutChart', currSummary.categorySpending);
      window.ChartManager.renderMonthlyTrends('reportTrendChart');
    }

    // Render Supportive Student Savings Suggestions
    this.renderSupportiveSuggestions(currSummary, prevSummary);
  },

  renderSupportiveSuggestions(curr, prev) {
    const container = document.getElementById('reportSmartTips');
    if (!container) return;

    const tips = [];

    // Food & Dining Analysis
    const foodSpent = curr.categorySpending['cat_food'] || 0;
    const grocerySpent = curr.categorySpending['cat_groceries'] || 0;
    if (foodSpent > grocerySpent && foodSpent > 120) {
      tips.push({
        icon: '🍳',
        title: 'Dining Out vs. Campus Groceries',
        text: `You spent $${foodSpent.toFixed(2)} on takeout/dining and $${grocerySpent.toFixed(2)} on groceries. Preparing just 2 more simple batch meals per week at home could save an estimated ~$50–$75 each month.`
      });
    } else {
      tips.push({
        icon: '🥗',
        title: 'Balanced Food Pacing',
        text: 'Your grocery-to-takeout ratio is in good shape this month. Buying staple pantry ingredients in bulk is helping keep dining expenses under control.'
      });
    }

    // Subscriptions check
    const subsSpent = curr.categorySpending['cat_subs'] || 0;
    if (subsSpent > 35) {
      tips.push({
        icon: '🎧',
        title: 'Check for Student Discounts on Subscriptions',
        text: `Your digital subscriptions total $${subsSpent.toFixed(2)}. Make sure you are using active .edu student accounts for Spotify/Hulu bundle ($5.99/mo) and GitHub Student Developer Pack (which includes free dev tools and domains).`
      });
    }

    // Savings Buffer Check
    if (curr.remainingBalance > 300) {
      tips.push({
        icon: '🌱',
        title: 'Surplus Cash Opportunity',
        text: `You currently have a healthy balance surplus of $${curr.remainingBalance.toFixed(2)} this month! Consider depositing $100 directly into your Emergency Fund or Spring Break goal to build your buffer ahead of schedule.`
      });
    } else if (curr.remainingBalance < 50 && curr.remainingBalance >= 0) {
      tips.push({
        icon: '⚓',
        title: 'Tight Cash Flow Margin',
        text: `Remaining balance is $${curr.remainingBalance.toFixed(2)}. Consider deferring any non-essential discretionary purchases until your next pay cycle to avoid dipping into emergency funds.`
      });
    }

    // Entertainment / Books
    const entertainmentSpent = curr.categorySpending['cat_entertainment'] || 0;
    if (entertainmentSpent > 120) {
      tips.push({
        icon: '🎟️',
        title: 'Campus Activities & Fun',
        text: 'Look out for free student union events, campus movie screenings, and campus gym passes to keep recreation fun without exceeding social spending limits.'
      });
    }

    container.innerHTML = tips.map(t => `
      <div class="smart-tip-card">
        <div class="smart-tip-icon">${t.icon}</div>
        <div class="smart-tip-content">
          <h4>${t.title}</h4>
          <p>${t.text}</p>
        </div>
      </div>
    `).join('');
  },

  // =========================================================================
  // TRANSACTION MODAL (ADD / EDIT)
  // =========================================================================
  openTransactionModal(editId = null) {
    this.currentEditingTxId = editId;
    const modal = document.getElementById('transactionModal');
    const titleEl = document.getElementById('txModalTitle');
    const form = document.getElementById('transactionForm');
    form.reset();

    if (editId) {
      const tx = window.store.transactions.find(t => t.id === editId);
      if (tx) {
        titleEl.textContent = 'Edit Transaction';
        document.getElementById('txAmountInput').value = tx.amount;
        document.getElementById('txDateInput').value = tx.date;
        document.getElementById('txDescInput').value = tx.description;
        document.getElementById('txPaymentInput').value = tx.paymentMethod || 'Debit Card';
        document.getElementById('txNotesInput').value = tx.notes || '';
        document.getElementById('txTypeInput').value = tx.type;

        // Set type toggle
        document.querySelectorAll('.type-toggle-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.type === tx.type);
        });

        this.updateCategoryOptionsForType(tx.type);
        document.getElementById('txCategoryInput').value = tx.category;
      }
    } else {
      titleEl.textContent = 'Add Transaction';
      document.getElementById('txTypeInput').value = 'expense';
      document.querySelectorAll('.type-toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === 'expense');
      });
      // Default to today's date in September 2026
      document.getElementById('txDateInput').value = '2026-09-26';
      this.updateCategoryOptionsForType('expense');
    }

    modal.classList.add('active');
    document.getElementById('txAmountInput').focus();
  },

  updateCategoryOptionsForType(type) {
    const select = document.getElementById('txCategoryInput');
    if (!select) return;

    const filtered = window.store.categories.filter(c => c.type === type);
    select.innerHTML = filtered.map(c => `
      <option value="${c.id}">${c.name}</option>
    `).join('');
  },

  handleTransactionSubmit(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('txAmountInput').value);
    const date = document.getElementById('txDateInput').value;
    const category = document.getElementById('txCategoryInput').value;
    const description = document.getElementById('txDescInput').value.trim();
    const type = document.getElementById('txTypeInput').value;
    const paymentMethod = document.getElementById('txPaymentInput').value;
    const notes = document.getElementById('txNotesInput').value.trim();

    if (!amount || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    if (!date) {
      alert('Please select a valid date.');
      return;
    }
    if (!description) {
      alert('Please provide a short description.');
      return;
    }

    if (this.currentEditingTxId) {
      window.store.updateTransaction(this.currentEditingTxId, {
        amount,
        date,
        category,
        description,
        type,
        paymentMethod,
        notes
      });
      this.showToast('Transaction updated successfully!', 'success');
    } else {
      window.store.addTransaction({
        amount,
        date,
        category,
        description,
        type,
        paymentMethod,
        notes
      });
      this.showToast('New transaction added!', 'success');
    }

    document.getElementById('transactionModal').classList.remove('active');
    this.renderActiveView();
  },

  confirmDeleteTransaction(id, desc) {
    this.deleteTarget = { type: 'transaction', id, name: desc };
    document.getElementById('deleteItemName').textContent = `"${desc}"`;
    document.getElementById('confirmDeleteModal').classList.add('active');
  },

  executeDelete() {
    if (!this.deleteTarget) return;

    if (this.deleteTarget.type === 'transaction') {
      window.store.deleteTransaction(this.deleteTarget.id);
      this.showToast('Transaction deleted.', 'info');
    } else if (this.deleteTarget.type === 'goal') {
      window.store.deleteSavingsGoal(this.deleteTarget.id);
      this.showToast('Savings goal deleted.', 'info');
    }

    document.getElementById('confirmDeleteModal').classList.remove('active');
    this.deleteTarget = null;
    this.renderActiveView();
  },

  // =========================================================================
  // BUDGET EDIT MODAL
  // =========================================================================
  openBudgetEditModal(categoryId) {
    const cat = window.store.getCategory(categoryId);
    const month = window.store.selectedMonth;
    const currentLimit = (window.store.getMonthBudgets(month)[categoryId]) || cat.defaultBudget || 100;

    document.getElementById('budgetCategoryTitle').textContent = `Set Limit for ${cat.name}`;
    document.getElementById('budgetCategoryIcon').style.backgroundColor = cat.color;
    document.getElementById('budgetCategoryIcon').innerHTML = this.getCategoryIconSvg(cat.icon);
    document.getElementById('budgetCategoryIdHidden').value = categoryId;
    document.getElementById('budgetAmountInput').value = currentLimit;

    document.getElementById('budgetModal').classList.add('active');
    document.getElementById('budgetAmountInput').focus();
  },

  handleBudgetSubmit(e) {
    e.preventDefault();
    const categoryId = document.getElementById('budgetCategoryIdHidden').value;
    const amount = parseFloat(document.getElementById('budgetAmountInput').value);
    const month = window.store.selectedMonth;

    if (isNaN(amount) || amount < 0) {
      alert('Please enter a valid budget amount.');
      return;
    }

    window.store.setCategoryBudget(month, categoryId, amount);
    document.getElementById('budgetModal').classList.remove('active');
    this.showToast('Monthly budget updated!', 'success');
    this.renderActiveView();
  },

  // =========================================================================
  // SAVINGS GOAL MODAL & DEPOSIT
  // =========================================================================
  openGoalModal(goalId = null) {
    this.currentEditingGoalId = goalId;
    const modal = document.getElementById('goalModal');
    const form = document.getElementById('goalForm');
    form.reset();

    if (goalId) {
      const g = window.store.savingsGoals.find(x => x.id === goalId);
      if (g) {
        document.getElementById('goalModalTitle').textContent = 'Edit Savings Goal';
        document.getElementById('goalTitleInput').value = g.title;
        document.getElementById('goalTargetInput').value = g.targetAmount;
        document.getElementById('goalCurrentInput').value = g.currentAmount;
        document.getElementById('goalDateInput').value = g.targetDate;
        document.getElementById('goalTagInput').value = g.categoryTag || 'General';
        document.getElementById('goalColorInput').value = g.color || '#0D9488';
      }
    } else {
      document.getElementById('goalModalTitle').textContent = 'Create New Savings Goal';
      document.getElementById('goalDateInput').value = '2027-03-31';
      document.getElementById('goalCurrentInput').value = 0;
    }

    modal.classList.add('active');
  },

  handleGoalSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('goalTitleInput').value.trim();
    const targetAmount = parseFloat(document.getElementById('goalTargetInput').value);
    const currentAmount = parseFloat(document.getElementById('goalCurrentInput').value) || 0;
    const targetDate = document.getElementById('goalDateInput').value;
    const categoryTag = document.getElementById('goalTagInput').value.trim();
    const color = document.getElementById('goalColorInput').value;

    if (!title) {
      alert('Please enter a goal title.');
      return;
    }
    if (!targetAmount || targetAmount <= 0) {
      alert('Please enter a target amount greater than 0.');
      return;
    }
    if (!targetDate) {
      alert('Please choose a target completion date.');
      return;
    }

    if (this.currentEditingGoalId) {
      window.store.updateSavingsGoal(this.currentEditingGoalId, {
        title,
        targetAmount,
        currentAmount,
        targetDate,
        categoryTag,
        color
      });
      this.showToast('Savings goal updated!', 'success');
    } else {
      window.store.addSavingsGoal({
        title,
        targetAmount,
        currentAmount,
        targetDate,
        categoryTag,
        color
      });
      this.showToast('New savings goal created!', 'success');
    }

    document.getElementById('goalModal').classList.remove('active');
    this.renderActiveView();
  },

  openDepositModal(goalId) {
    const goal = window.store.savingsGoals.find(g => g.id === goalId);
    if (!goal) return;

    document.getElementById('depositGoalIdHidden').value = goalId;
    document.getElementById('depositGoalTitle').textContent = `Add Savings to "${goal.title}"`;
    document.getElementById('depositAmountInput').value = '';
    document.getElementById('depositModal').classList.add('active');
    document.getElementById('depositAmountInput').focus();
  },

  handleDepositSubmit(e) {
    e.preventDefault();
    const goalId = document.getElementById('depositGoalIdHidden').value;
    const amount = parseFloat(document.getElementById('depositAmountInput').value);

    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid deposit amount.');
      return;
    }

    const updated = window.store.depositToGoal(goalId, amount);
    document.getElementById('depositModal').classList.remove('active');
    if (updated) {
      this.showToast(`🎉 Added $${amount.toFixed(2)} to ${updated.title}!`, 'success');
    }
    this.renderActiveView();
  },

  confirmDeleteGoal(id, title) {
    this.deleteTarget = { type: 'goal', id, name: title };
    document.getElementById('deleteItemName').textContent = `Savings Goal: "${title}"`;
    document.getElementById('confirmDeleteModal').classList.add('active');
  },

  // =========================================================================
  // EXPORT / IMPORT BACKUP
  // =========================================================================
  exportDataFile() {
    const jsonStr = window.store.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jstracker_budget_backup_${window.store.selectedMonth}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast('Budget data exported successfully!', 'success');
  },

  importDataFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = window.store.importJSON(event.target.result);
      if (res.success) {
        this.populateMonthSelectors();
        this.renderActiveView();
        this.showToast(`Imported ${res.count} transactions successfully!`, 'success');
      } else {
        alert(`Failed to import data: ${res.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  },

  // =========================================================================
  // HELPER UTILITIES
  // =========================================================================
  populateMonthSelectors() {
    const select = document.getElementById('headerMonthSelect');
    if (!select) return;

    // Available months in our dataset
    const months = [
      { id: '2026-09', label: 'September 2026 (Current)' },
      { id: '2026-08', label: 'August 2026 (Previous)' },
      { id: '2026-10', label: 'October 2026 (Upcoming)' }
    ];

    select.innerHTML = months.map(m => `
      <option value="${m.id}" ${m.id === window.store.selectedMonth ? 'selected' : ''}>
        ${m.label}
      </option>
    `).join('');
  },

  populateCategoryDropdowns() {
    // Populate filter dropdown in transactions
    const txCatFilter = document.getElementById('txCategoryFilter');
    if (txCatFilter) {
      txCatFilter.innerHTML = '<option value="all">All Categories</option>' +
        window.store.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '✕';
    if (type === 'warning') icon = '⚠';

    toast.innerHTML = `<span>${icon}</span><span>${this.escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  formatMonthName(monthStr) {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  },

  getPreviousMonthString(monthStr) {
    const [year, month] = monthStr.split('-').map(Number);
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
  },

  formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  },

  formatShortDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return dateStr;
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  // =========================================================================
  // SMS EXPENSE TRACKER VIEW & LIVE PARSER
  // =========================================================================
  renderSMSView() {
    const profile = window.store.profile || {};
    const displayNum = document.getElementById('smsDisplayNumber');
    if (displayNum) displayNum.textContent = profile.phoneNumber || '+1 (555) 382-9104';

    const carrierEl = document.getElementById('smsCarrierText');
    if (carrierEl) carrierEl.textContent = profile.carrierName || 'Campus Mobile 5G';

    const toggle = document.getElementById('smsAutoImportToggle');
    if (toggle) toggle.checked = profile.smsTrackingEnabled !== false;

    this.renderSMSLogsTable();
    this.updateLiveSMSPreview();
  },

  renderSMSLogsTable() {
    const tbody = document.getElementById('smsLogsTableBody');
    if (!tbody) return;

    const logs = window.store.getSMSLogs();
    if (logs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 24px; color: var(--text-muted);">
            No SMS messages logged yet. Use the simulator above or send an incoming bank SMS!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = logs.map(l => {
      const parsed = l.parsed || {};
      const cat = window.store.getCategory(parsed.category);
      const isAuto = l.status === 'auto_imported';
      const statusBadge = isAuto
        ? '<span class="sms-badge-status auto_imported">✓ Auto-Imported</span>'
        : '<span class="sms-badge-status pending">Pending Review</span>';

      const actionBtn = isAuto
        ? `<span style="font-size: 0.74rem; color: var(--teal-600); font-weight: 700;">Recorded</span>`
        : `<button class="btn-primary" style="padding: 4px 10px; font-size: 0.74rem;" onclick="App.importPendingSMSLog('${l.id}')">Import</button>`;

      return `
        <tr>
          <td style="font-size: 0.78rem; color: var(--text-muted); white-space: nowrap;">
            ${new Date(l.receivedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </td>
          <td style="font-weight: 700; color: var(--navy-900);">${this.escapeHtml(l.sender)}</td>
          <td style="max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.8rem; color: var(--text-secondary);" title="${this.escapeHtml(l.rawText)}">
            ${this.escapeHtml(l.rawText)}
          </td>
          <td style="font-weight: 700; color: var(--navy-900);">${this.escapeHtml(parsed.merchant || 'Unknown')}</td>
          <td>
            <span class="cat-pill" style="background-color: ${cat.color};">${cat.name}</span>
          </td>
          <td style="font-weight: 800; text-align: right; color: ${parsed.type === 'income' ? 'var(--emerald-500)' : 'var(--navy-900)'};">
            ${parsed.type === 'income' ? '+' : '-'}$${(parsed.amount || 0).toFixed(2)}
          </td>
          <td>${statusBadge}</td>
          <td style="text-align: right;">
            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px;">
              ${actionBtn}
              <button class="btn-icon-action delete" title="Delete SMS log" onclick="App.deleteSMSLogItem('${l.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  updateLiveSMSPreview() {
    const rawInput = document.getElementById('smsRawInput');
    const bubbleText = document.getElementById('smsBubbleText');
    if (!rawInput || !bubbleText) return;

    const text = rawInput.value.trim() || 'Chase Alert: Your debit card was charged $18.25 at CAMPUS HUB BURRITO on 09/26/2026. Bal: $1,420.50.';
    bubbleText.textContent = text;

    const parsed = window.SMSParser.parse(text);
    if (!parsed) return;

    const cat = window.store.getCategory(parsed.category);

    document.getElementById('parsedAmountVal').textContent = `$${parsed.amount.toFixed(2)}`;
    const typeEl = document.getElementById('parsedTypeVal');
    typeEl.textContent = parsed.type === 'income' ? 'Income' : 'Expense';
    typeEl.style.color = parsed.type === 'income' ? 'var(--emerald-500)' : 'var(--rose-500)';

    document.getElementById('parsedMerchantVal').textContent = parsed.merchant;
    const catEl = document.getElementById('parsedCategoryVal');
    catEl.textContent = cat.name;
    catEl.style.color = cat.color;

    document.getElementById('parsedMethodVal').textContent = parsed.paymentMethod;
    document.getElementById('parsedDateVal').textContent = parsed.date;

    const confEl = document.getElementById('liveConfidenceBadge');
    if (confEl) {
      if (parsed.confidence === 'high') {
        confEl.textContent = 'High Confidence';
        confEl.style.background = 'var(--emerald-100)';
        confEl.style.color = '#065f46';
      } else if (parsed.confidence === 'medium') {
        confEl.textContent = 'Good Match';
        confEl.style.background = 'var(--teal-100)';
        confEl.style.color = '#0f766e';
      } else {
        confEl.textContent = 'Low Confidence';
        confEl.style.background = 'var(--amber-100)';
        confEl.style.color = '#92400e';
      }
    }
  },

  applySMSTemplate(key) {
    const templates = {
      starbucks: {
        sender: 'CHASE-ALERT',
        text: 'Chase Alert: Your debit card ending in 4102 was charged $4.85 at STARBUCKS COFFEE on 09/26/2026. Bal: $1,415.65.'
      },
      traderjoe: {
        sender: 'HDFCBK',
        text: 'Alert: Acct XX8920 debited by $64.20 on 26-Sep-2026 at TRADER JOE\'S GROCERY. Avail Bal: $1,351.45.'
      },
      spotify: {
        sender: 'DEBIT-NOTIF',
        text: 'Your student debit card was charged $5.99 for SPOTIFY STUDENT BUNDLE subscription auto-renew.'
      },
      venmo: {
        sender: 'VENMO',
        text: 'Venmo: You paid $26.50 to Tyler Brooks for Thai Bistro Study Dinner. Transfer completed.'
      },
      uber: {
        sender: 'UBER-TRIP',
        text: 'Uber Receipt: You spent $14.25 with Uber on 09/26/2026 for ride to Metro Campus Library.'
      },
      payroll: {
        sender: 'UNIV-PAYROLL',
        text: 'Direct Deposit of $1,450.00 from UNIV CS LAB STIPEND has been credited to your account.'
      }
    };

    const tmpl = templates[key];
    if (tmpl) {
      const rawInput = document.getElementById('smsRawInput');
      const senderInput = document.getElementById('smsSenderInput');
      if (rawInput) rawInput.value = tmpl.text;
      if (senderInput) senderInput.value = tmpl.sender;
      const senderLabel = document.getElementById('bubbleSenderLabel');
      if (senderLabel) senderLabel.textContent = `From: ${tmpl.sender}`;
      this.updateLiveSMSPreview();
      this.showToast(`Applied ${key} template!`, 'info');
    }
  },

  handleProcessSMS() {
    const rawInput = document.getElementById('smsRawInput');
    const senderInput = document.getElementById('smsSenderInput');
    const text = rawInput ? rawInput.value.trim() : '';
    const sender = senderInput ? senderInput.value.trim() : 'BANK-ALERT';

    if (!text) {
      alert('Please enter or paste an SMS message to process.');
      return;
    }

    const autoImport = document.getElementById('smsAutoImportToggle')?.checked !== false;
    const log = window.store.processIncomingSMS(text, sender, autoImport);

    if (log && log.parsed && log.parsed.amount > 0) {
      this.showToast(`✓ Logged $${log.parsed.amount.toFixed(2)} at ${log.parsed.merchant}!`, 'success');
    } else {
      this.showToast('Parsed message, but could not detect an amount.', 'warning');
    }

    rawInput.value = '';
    this.renderSMSView();
    // Also re-render dashboard & budgets in case active
    if (this.activeView === 'dashboard') this.renderDashboard();
    if (this.activeView === 'transactions') this.renderTransactionsTable();
  },

  openPhoneModal() {
    const modal = document.getElementById('phoneModal');
    const phoneInput = document.getElementById('phoneModalInput');
    const carrierInput = document.getElementById('carrierModalInput');

    if (phoneInput) phoneInput.value = window.store.profile.phoneNumber || '+1 (555) 382-9104';
    if (carrierInput) carrierInput.value = window.store.profile.carrierName || 'Campus Mobile 5G';

    if (modal) modal.classList.add('active');
    if (phoneInput) phoneInput.focus();
  },

  handlePhoneConfigSubmit(e) {
    e.preventDefault();
    const phone = document.getElementById('phoneModalInput').value.trim();
    const carrier = document.getElementById('carrierModalInput').value.trim() || 'Mobile Carrier';

    if (!phone) {
      alert('Please enter a valid mobile number.');
      return;
    }

    window.store.updateProfile({ phoneNumber: phone, carrierName: carrier });
    document.getElementById('phoneModal')?.classList.remove('active');
    this.showToast('Updated linked mobile phone number!', 'success');
    this.renderSMSView();
  },

  importPendingSMSLog(smsId) {
    const res = window.store.importPendingSMS(smsId);
    if (res) {
      this.showToast(`Imported transaction: $${res.tx.amount.toFixed(2)} (${res.tx.description})`, 'success');
      this.renderSMSView();
    }
  },

  deleteSMSLogItem(smsId) {
    if (confirm('Delete this SMS log entry?')) {
      window.store.deleteSMSLog(smsId);
      this.showToast('SMS log deleted.', 'info');
      this.renderSMSView();
    }
  },

  // =========================================================================
  // AUTHENTICATION & REGISTRATION CONTROLLER
  // =========================================================================
  showAuthScreen(defaultTab = 'login') {
    const authOverlay = document.getElementById('authScreen');
    if (authOverlay) {
      authOverlay.classList.remove('hidden');
      this.switchAuthTab(defaultTab);
    }
  },

  hideAuthScreen() {
    const authOverlay = document.getElementById('authScreen');
    if (authOverlay) {
      authOverlay.classList.add('hidden');
    }
  },

  switchAuthTab(tab) {
    const tabLogin = document.getElementById('authTabLogin');
    const tabReg = document.getElementById('authTabRegister');
    const formLogin = document.getElementById('loginForm');
    const formReg = document.getElementById('registerForm');
    const errLogin = document.getElementById('loginErrorAlert');
    const errReg = document.getElementById('regErrorAlert');

    if (errLogin) errLogin.classList.remove('visible');
    if (errReg) errReg.classList.remove('visible');

    if (tab === 'login') {
      tabLogin?.classList.add('active');
      tabReg?.classList.remove('active');
      if (formLogin) formLogin.style.display = 'block';
      if (formReg) formReg.style.display = 'none';
      document.getElementById('loginEmailInput')?.focus();
    } else {
      tabReg?.classList.add('active');
      tabLogin?.classList.remove('active');
      if (formLogin) formLogin.style.display = 'none';
      if (formReg) formReg.style.display = 'block';
      document.getElementById('regNameInput')?.focus();
    }
  },

  executeLogin(email, password) {
    const errBox = document.getElementById('loginErrorAlert');
    const errMsg = document.getElementById('loginErrorMessage');

    const result = window.store.login(email, password);
    if (!result.success) {
      if (errMsg) errMsg.textContent = result.error;
      if (errBox) errBox.classList.add('visible');
      return;
    }

    if (errBox) errBox.classList.remove('visible');
    this.hideAuthScreen();
    this.updateUserProfileUI();
    this.renderActiveView();
    this.showToast(`Welcome back, ${result.user.fullName}!`, 'success');
  },

  handleRegisterSubmit(e) {
    e.preventDefault();
    const errBox = document.getElementById('regErrorAlert');
    const errMsg = document.getElementById('regErrorMessage');

    const fullName = document.getElementById('regNameInput')?.value || '';
    const email = document.getElementById('regEmailInput')?.value || '';
    const phoneNumber = document.getElementById('regPhoneInput')?.value || '';
    const status = document.getElementById('regStatusInput')?.value || 'Student / Young Adult';
    const currency = document.getElementById('regCurrencyInput')?.value || '$';
    const password = document.getElementById('regPasswordInput')?.value || '';
    const confirmPassword = document.getElementById('regConfirmPasswordInput')?.value || '';
    const carrierName = 'Mobile Network';

    if (password !== confirmPassword) {
      if (errMsg) errMsg.textContent = 'Passwords do not match. Please re-enter your password.';
      if (errBox) errBox.classList.add('visible');
      return;
    }

    const smsTrackingEnabled = document.getElementById('regSmsEnableInput')?.checked !== false;

    const result = window.store.register({
      fullName,
      email,
      password,
      phoneNumber,
      status,
      currency,
      carrierName,
      smsTrackingEnabled
    });

    if (!result.success) {
      if (errMsg) errMsg.textContent = result.error;
      if (errBox) errBox.classList.add('visible');
      return;
    }

    if (errBox) errBox.classList.remove('visible');
    document.getElementById('registerForm')?.reset();
    this.hideAuthScreen();
    this.updateUserProfileUI();
    this.renderActiveView();
    this.showToast(`🎉 Account created for ${result.user.fullName}! Welcome to JS TRACKER.`, 'success');
  },

  handleLogout() {
    if (confirm('Are you sure you want to log out or switch account?')) {
      window.store.logout();
      this.showToast('You have logged out.', 'info');
      this.showAuthScreen('login');
    }
  },

  updateUserProfileUI() {
    const user = window.store.getCurrentUser() || window.store.profile || {};
    const name = user.fullName || user.name || 'Alex Rivera';
    const status = user.status || 'Senior Undergrad & Tech Intern';
    
    // Compute initials
    const parts = name.trim().split(' ');
    const initials = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();

    const avatarEl = document.getElementById('sidebarUserAvatar');
    if (avatarEl) avatarEl.textContent = initials;

    const nameEl = document.getElementById('sidebarUserName');
    if (nameEl) nameEl.textContent = name;

    const statusEl = document.getElementById('sidebarUserStatus');
    if (statusEl) statusEl.textContent = status;

    // Update banner greeting if on dashboard
    const bannerHeading = document.querySelector('.banner-text h2');
    if (bannerHeading) {
      bannerHeading.textContent = `Welcome back, ${parts[0]}! 🎓`;
    }

    // Update SMS phone display
    const smsPhoneEl = document.getElementById('smsDisplayNumber');
    if (smsPhoneEl) {
      smsPhoneEl.textContent = user.phoneNumber || window.store.profile?.phoneNumber || '+1 (555) 382-9104';
    }
  },

  showForgotPwdHint() {
    alert('For security in demo mode, your pre-configured password is: password123\n\nYou can also register a new account anytime with your personal email and mobile number!');
  },

  getCategoryIconSvg(iconName) {
    // Return lightweight inline SVGs
    switch (iconName) {
      case 'utensils':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"></path><path d="M15 2v10a4 4 0 0 1-4 4 4 4 0 0 1-4-4V2"></path><line x1="8" y1="2" x2="8" y2="8"></line><line x1="15" y1="16" x2="15" y2="22"></line><line x1="9" y1="16" x2="9" y2="22"></line></svg>`;
      case 'shopping-cart':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`;
      case 'home':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
      case 'bus':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="16" rx="2"></rect><path d="M3 11h18"></path><circle cx="7" cy="15" r="1"></circle><circle cx="17" cy="15" r="1"></circle></svg>`;
      case 'book-open':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`;
      case 'film':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line></svg>`;
      case 'tv':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>`;
      case 'heart':
      case 'heart-pulse':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>`;
      case 'briefcase':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`;
      case 'laptop':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>`;
      case 'award':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`;
      case 'gift':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>`;
      default:
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`;
    }
  },

  getGoalIconSvg(iconName) {
    switch (iconName) {
      case 'shield-check':
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>`;
      case 'compass':
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`;
      case 'laptop':
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>`;
      case 'award':
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`;
      default:
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h1l1-3c0-.6-.4-1-1-1h-1c-.2-.7-.5-1.4-1-2 0-.6 1.5-2 0-3z"></path></svg>`;
    }
  }
};

window.App = App;
