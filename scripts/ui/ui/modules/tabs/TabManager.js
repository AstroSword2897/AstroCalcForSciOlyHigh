/**
 * TabManager - IMPROVED VERSION
 * Better state management, visibility handling, and error recovery
 */
export class TabManager {
    constructor(options = {}) {
        this.stellarClassifier = null;
        this.activeMainTab = null;
        this.activeSubTab = null;
        this.initializationAttempts = new Map();
        this.MAX_INIT_ATTEMPTS = 3;
        this.onTabSwitch = options.onTabSwitch;
        this.onMainTabSwitch = options.onMainTabSwitch;
        this.initFormulaExplorer = options.initFormulaExplorer;
        this.initStellarClassifier = options.initStellarClassifier;
        this.onGraphTabActivated = options.onGraphTabActivated;
    }
    /**
     * Switch between main page tabs with improved error handling
     */
    switchMainTab(tabName) {
        if (tabName === 'explorer') {
            tabName = 'formulas';
        }
        console.log('[TabManager] Switching to main tab:', tabName);
        try {
            // Update main tab buttons
            this.updateMainTabButtons(tabName);
            // Update main tab content
            this.updateMainTabContent(tabName);
            // Activate selected tab
            this.activateMainTab(tabName);
            this.activeMainTab = tabName;
            if (this.onMainTabSwitch) {
                this.onMainTabSwitch(tabName);
            }
        }
        catch (error) {
            console.error('[TabManager] Error switching main tab:', error);
            this.handleTabSwitchError(tabName, error);
        }
    }
    /**
     * Switch between calculator, graph, and classification tabs with improved handling
     */
    switchTab(tabName) {
        console.log('[TabManager] Switching to sub tab:', tabName);
        try {
            // Update tab buttons
            this.updateSubTabButtons(tabName);
            // Update tab content
            this.updateSubTabContent(tabName);
            // Activate selected tab
            this.activateSubTab(tabName);
            this.activeSubTab = tabName;
            if (this.onTabSwitch) {
                this.onTabSwitch(tabName);
            }
        }
        catch (error) {
            console.error('[TabManager] Error switching sub tab:', error);
            this.handleTabSwitchError(tabName, error);
        }
    }
    getActiveMainTab() {
        return this.activeMainTab;
    }
    getActiveSubTab() {
        return this.activeSubTab;
    }
    updateMainTabButtons(tabName) {
        const tabButtons = document.querySelectorAll('.main-tab-btn');
        tabButtons.forEach(btn => {
            const btnTabName = btn.getAttribute('data-main-tab');
            if (btnTabName === tabName) {
                btn.classList.add('active');
            }
            else {
                btn.classList.remove('active');
            }
        });
    }
    updateMainTabContent(tabName) {
        const tabContents = document.querySelectorAll('.main-tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.setProperty('display', 'none', 'important');
        });
    }
    updateSubTabButtons(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.getAttribute('data-tab') === tabName) {
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
            }
            else {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            }
        });
    }
    updateSubTabContent(tabName) {
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            content.style.setProperty('display', 'none', 'important');
        });
    }
    activateMainTab(tabName) {
        if (tabName === 'explorer') {
            tabName = 'formulas';
        }
        if (tabName === 'formulas') {
            this.activateFormulasTab();
        }
        else if (tabName === 'algebraic') {
            this.activateAlgebraicSolvingTab();
        }
        else if (tabName === 'unit-converter') {
            this.activateUnitConverterTab();
        }
        else if (tabName === 'scientific-calc') {
            this.activateScientificCalcTab();
        }
        else if (tabName === 'classification') {
            this.activateClassificationMainTab();
        }
        else {
            console.warn(`[TabManager] Unknown main tab name: ${tabName}`);
        }
    }
    activateSubTab(tabName) {
        if (tabName === 'calculator') {
            this.activateCalculatorTab();
        }
        else if (tabName === 'graph') {
            this.activateCalculatorTab();
        }
        else if (tabName === 'classification') {
            this.activateClassificationSubTab();
        }
        else {
            console.warn(`[TabManager] Unknown sub tab name: ${tabName}`);
        }
    }
    activateFormulasTab() {
        const formulasTab = document.getElementById('main-formulas-tab');
        if (formulasTab) {
            formulasTab.classList.add('active');
            formulasTab.style.setProperty('display', 'block', 'important');
            formulasTab.style.setProperty('visibility', 'visible', 'important');
            console.log('[TabManager] ✅ Formulas tab activated');
        }
        else {
            console.error('[TabManager] ❌ main-formulas-tab not found!');
        }
    }
    activateAlgebraicSolvingTab() {
        const algebraicTab = document.getElementById('main-algebraic-tab');
        if (algebraicTab) {
            algebraicTab.classList.add('active');
            algebraicTab.style.setProperty('display', 'block', 'important');
            algebraicTab.style.setProperty('visibility', 'visible', 'important');
            console.log('[TabManager] ✅ Algebraic Solving tab activated');
            this._initAlgebraicSolvingHandlers();
        }
        else {
            console.error('[TabManager] ❌ main-algebraic-tab not found!');
        }
    }
    _initAlgebraicSolvingHandlers() {
        if (this._algebraicHandlersInit) return;
        const btn = document.getElementById('algebraic-solve-btn');
        const input = document.getElementById('algebraic-equation-input');
        const singleResult = document.getElementById('algebraic-single-result');
        const multiTabs = document.getElementById('algebraic-multi-tabs');
        const varTabsContainer = document.getElementById('algebraic-var-tabs');
        const varPanelsContainer = document.getElementById('algebraic-var-panels');
        const symbolBoard = document.getElementById('algebraic-symbol-board');
        if (!btn || !input) return;

        if (symbolBoard) {
            symbolBoard.addEventListener('click', (e) => {
                const btnEl = e.target.closest('.symbol-btn');
                if (!btnEl) return;
                const ch = btnEl.getAttribute('data-char');
                if (!ch) return;
                const container = document.querySelector('.algebraic-solving-container');
                const active = document.activeElement;
                const target = (active && container && container.contains(active) && typeof active.value === 'string')
                    ? active : input;
                if (target && typeof target.value === 'string') {
                    const start = target.selectionStart != null ? target.selectionStart : target.value.length;
                    const end = target.selectionEnd != null ? target.selectionEnd : target.value.length;
                    const before = target.value.substring(0, start);
                    const after = target.value.substring(end);
                    target.value = before + ch + after;
                    target.selectionStart = target.selectionEnd = start + ch.length;
                    target.focus();
                }
            });
        }

        const guessExpectedBaseUnitForSymbol = (symbol) => {
            // Algebraic solving has no formula metadata, so we only do safe conversions
            // for the most common “physics variables” users will type with units.
            const s = String(symbol ?? '').trim();
            const lower = s.toLowerCase();

            // Temperature -> Kelvin
            if (s === 'T' || lower === 't' || lower === 'temperature' || /^t(_vir)?$/.test(lower) || lower === 'tvir' || lower === 't_vir') {
                return 'K';
            }

            // Angle theta -> radians
            // (UnitConverter’s canonical “rad” is used as base for angles.)
            if (s === 'θ' || lower === 'theta' || lower === 'th') {
                return 'rad';
            }

            return null;
        };

        const parseKnownValue = (raw, symbolForUnitHint) => {
            const text = String(raw || '').trim();
            if (!text) return undefined;

            // If the user typed a value with a unit (e.g. "450 K", "72 F", "30 deg"),
            // convert to a best-effort canonical unit for the variable symbol.
            if (typeof window !== 'undefined' && window.UnitParser?.parse && window.UnitConverter?.convertToBase) {
                try {
                    const parsedUnit = window.UnitParser.parse(text);
                    if (parsedUnit?.hasUnit && Number.isFinite(parsedUnit.value)) {
                        const baseUnit = guessExpectedBaseUnitForSymbol(symbolForUnitHint);
                        if (baseUnit) {
                            const converted = window.UnitConverter.convertToBase(parsedUnit.value, parsedUnit.unit, baseUnit);
                            if (Number.isFinite(converted)) return converted;
                        }
                        // If we don't know the target base unit, fall back to the raw numeric value.
                        return parsedUnit.value;
                    }
                } catch (_) {
                    // Fall through to ExpressionParser / parseFloat
                }
            }

            // Fall back to expression parsing (supports pi, sin(), scientific notation, etc.)
            if (typeof window !== 'undefined' && window.ExpressionParser?.parse) {
                try {
                    const parsed = window.ExpressionParser.parse(text);
                    if (parsed !== null && Number.isFinite(parsed)) {
                        return parsed;
                    }
                } catch (_) {
                    // Fall through to parseFloat
                }
            }

            const numeric = parseFloat(text);
            return Number.isFinite(numeric) ? numeric : NaN;
        };

        const escapeHtml = (value) => {
            const div = document.createElement('div');
            div.textContent = String(value);
            return div.innerHTML;
        };

        const escapeAttr = (value) => {
            // Safe for HTML attributes
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        };

        const toLatex = (raw) => {
            const text = String(raw ?? '');

            // Scientific notation: 1.23e-4 -> 1.23 \times 10^{-4}
            let out = text.replace(
                /(\d+(?:\.\d+)?)[eE]([+\-]?\d+)/g,
                (_m, a, b) => `${a}\\times 10^{${b}}`
            );

            // Common constants / symbols
            out = out.replace(/\bpi\b/g, '\\pi').replace(/π/g, '\\pi');

            // Operators
            out = out.replace(/×/g, '\\cdot ').replace(/·/g, '\\cdot ').replace(/\*/g, '\\cdot ');
            out = out.replace(/÷/g, '\\div ');

            // Powers: x^2 -> x^{2} (simple)
            out = out.replace(/\^([A-Za-z0-9+\-./]+)/g, '^{$1}');

            // sqrt(simple): sqrt(x) -> \sqrt{x}
            // Apply repeatedly to handle multiple occurrences (but only non-nested parens)
            for (let i = 0; i < 4; i++) {
                const next = out.replace(/sqrt\(([^()]+)\)/g, '\\\\sqrt{$1}');
                if (next === out) break;
                out = next;
            }

            // Keep plain parentheses; KaTeX understands them.
            return out;
        };

        const looksLikeMath = (text) => /[=^*/÷×·]|sqrt\(|\bpi\b|π|\\pi/.test(String(text ?? ''));

        const latexSpan = (latex, displayMode = false) => {
            const payload = encodeURIComponent(String(latex ?? ''));
            return `<span class="alg-katex" data-display="${displayMode ? '1' : '0'}" data-latex="${escapeAttr(payload)}"></span>`;
        };

        const latexToPrettyUnicode = (latexRaw) => {
            let s = String(latexRaw ?? '');

            // Drop simple \text{...} wrappers used for non-math steps
            s = s.replace(/\\text\{([^}]*)\}/g, '$1');

            // Operators / symbols
            s = s.replace(/\\cdot\s*/g, '×');
            s = s.replace(/\\div\s*/g, '÷');
            s = s.replace(/\\pi\b/g, 'π');

            // Scientific notation: a\times 10^{b} -> a×10^b (then superscripts)
            s = s.replace(/10\^\{([+\-]?\d+)\}/g, '10^$1');

            // sqrt{...} -> √(...)
            for (let i = 0; i < 4; i++) {
                const next = s.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)');
                if (next === s) break;
                s = next;
            }

            // Powers: x^{n} -> x^n (then superscripts)
            s = s.replace(/\^\{([^}]+)\}/g, '^$1');

            // Superscripts for common digits/signs
            const supMap = {
                '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
                '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
                '+': '⁺', '-': '⁻'
            };
            s = s.replace(/\^([+\-]?\d+)/g, (_m, exp) => {
                const chars = String(exp).split('');
                return chars.every(c => supMap[c]) ? chars.map(c => supMap[c]).join('') : `^${exp}`;
            });

            // Clean up leftover LaTeX escapes
            s = s.replace(/\\\\/g, '\\');
            return s;
        };

        const renderKatexIn = (rootEl) => {
            if (!rootEl) return;
            const katex = (typeof window !== 'undefined' && window.katex) ? window.katex : null;
            rootEl.querySelectorAll('.alg-katex[data-latex]').forEach(el => {
                const enc = el.getAttribute('data-latex') || '';
                const display = el.getAttribute('data-display') === '1';
                const latex = decodeURIComponent(enc);
                if (!katex) {
                    el.textContent = latexToPrettyUnicode(latex);
                    return;
                }
                try {
                    katex.render(latex, el, {
                        throwOnError: false,
                        displayMode: display
                    });
                } catch (_) {
                    el.textContent = latexToPrettyUnicode(latex);
                }
            });
        };

        const fmtAnswer = (n) => {
            if (typeof n !== 'number' || !Number.isFinite(n)) return null;
            // Use up to 8 significant figures; strip trailing zeros
            if (Math.abs(n) >= 1e10 || (Math.abs(n) < 1e-6 && n !== 0)) return n.toExponential(6).replace(/\.?0+e/, 'e');
            const s = n.toPrecision(8).replace(/\.?0+$/, '');
            return s;
        };

        const renderPrettyResultHTML = (res) => {
            const solvedForm = res?.solvedForm ? String(res.solvedForm) : null;
            const steps = Array.isArray(res?.steps) ? res.steps : [];
            const answerVar = res?.variable ? String(res.variable) : null;
            const answerVal = typeof res?.result === 'number' && Number.isFinite(res.result) ? fmtAnswer(res.result) : null;

            const answerLine = (answerVar && answerVal)
                ? `<div class="alg-answer"><span class="alg-answer__label">Answer</span><span class="alg-answer__expr">${latexSpan(toLatex(`${answerVar} = ${answerVal}`), false)}</span></div>`
                : '';

            const solvedFormBlock = solvedForm
                ? `<div class="alg-card"><div class="alg-card__title">Solved form</div><div class="alg-mono">${latexSpan(toLatex(solvedForm), true)}</div></div>`
                : '';

            const stepItems = steps.map((s) => {
                const type = s?.type ? String(s.type) : 'step';
                const text = s?.text ? String(s.text) : '';
                const latex = looksLikeMath(text) ? toLatex(text) : `\\text{${String(text).replace(/\\/g, '\\\\').replace(/[{}]/g, '')}}`;
                return `<li class="alg-step alg-step--${escapeHtml(type)}"><span class="alg-step__dot"></span><span class="alg-step__text">${latexSpan(latex, false)}</span></li>`;
            }).join('');

            const stepsBlock = stepItems
                ? `<details class="alg-steps" open><summary class="alg-steps__summary">Steps</summary><ul class="alg-steps__list">${stepItems}</ul></details>`
                : '';

            return `<div class="alg-result">${answerLine}${solvedFormBlock}${stepsBlock}</div>`;
        };

        const parseAndShow = () => {
            const eq = input.value.trim();
            if (!eq) {
                if (singleResult) singleResult.textContent = '';
                if (multiTabs) multiTabs.style.display = 'none';
                return;
            }
            try {
                const AlgebraicSolver = typeof window !== 'undefined' ? window.AlgebraicSolver : null;
                if (!AlgebraicSolver) {
                    if (singleResult) { singleResult.textContent = 'AlgebraicSolver not loaded'; singleResult.style.color = '#ff6b6b'; }
                    return;
                }
                const out = AlgebraicSolver.solve(eq);
                if (out.error) {
                    if (singleResult) {
                        singleResult.textContent = `Error: ${out.error}`;
                        singleResult.style.color = '#ff6b6b';
                    }
                    if (multiTabs) multiTabs.style.display = 'none';
                    return;
                }
                if (out.multiVar && out.variables && out.variables.length > 1) {
                    if (singleResult) {
                        const normalized = out.normalizedEquation && out.normalizedEquation !== eq
                            ? `\nNormalized: ${out.normalizedEquation}`
                            : '';
                        singleResult.textContent = `Equation: ${eq}${normalized}\nVariables: ${out.variables.join(', ')}. Use tabs below to solve for each.`;
                    }
                    if (singleResult) singleResult.style.color = '#a8c7ff';
                    if (multiTabs && varTabsContainer && varPanelsContainer) {
                        multiTabs.style.display = 'block';
                        varTabsContainer.innerHTML = '';
                        varPanelsContainer.innerHTML = '';
                        const vars = out.variables;
                        vars.forEach((v, idx) => {
                            const tabBtn = document.createElement('button');
                            tabBtn.type = 'button';
                            tabBtn.className = 'main-tab-btn algebraic-var-tab' + (idx === 0 ? ' active' : '');
                            tabBtn.setAttribute('data-algebraic-var', v);
                            tabBtn.textContent = `Solve for ${v}`;
                            tabBtn.style.marginBottom = '0';
                            varTabsContainer.appendChild(tabBtn);

                            const panel = document.createElement('div');
                            panel.className = 'algebraic-var-panel';
                            panel.setAttribute('data-algebraic-var', v);
                            panel.style.display = idx === 0 ? 'block' : 'none';
                            panel.style.padding = '12px 0';
                            const others = vars.filter(x => x !== v);
                    const symbolicForm = out.solvedForms?.[v] || null;
                    let html = `<div style="margin-bottom: 12px;"><strong>Solve for ${escapeHtml(v)}</strong></div>`;
                    html += symbolicForm
                        ? `<div class="alg-card"><div class="alg-card__title">Solved form</div><div class="alg-mono">${latexSpan(toLatex(symbolicForm), true)}</div></div>`
                        : `<div class="alg-hint">No direct solved form detected. You can still solve numerically by entering the other values.</div>`;
                            if (others.length > 0) {
                                html += '<div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 12px;">';
                                others.forEach(o => {
                                    html += `<label style="display: flex; align-items: center; gap: 6px;">${o} = <input type="text" data-var="${o}" class="formula-search-input" placeholder="e.g. 2*pi" style="width: 110px; padding: 6px 8px;"></label>`;
                                });
                                html += '</div>';
                            }
                            html += `<button type="button" class="algebraic-solve-for-btn" data-algebraic-var="${v}" style="background: #667eea; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-bottom: 12px;">Solve for ${v}</button>`;
                    html += '<div class="algebraic-panel-result alg-panel-result" style="min-height: 60px;"></div>';
                            panel.innerHTML = html;
                            varPanelsContainer.appendChild(panel);
                            renderKatexIn(panel);
                        });

                        varTabsContainer.querySelectorAll('.algebraic-var-tab').forEach(tabEl => {
                            tabEl.addEventListener('click', () => {
                                const v = tabEl.getAttribute('data-algebraic-var');
                                varTabsContainer.querySelectorAll('.algebraic-var-tab').forEach(t => t.classList.remove('active'));
                                tabEl.classList.add('active');
                                varPanelsContainer.querySelectorAll('.algebraic-var-panel').forEach(p => {
                                    p.style.display = p.getAttribute('data-algebraic-var') === v ? 'block' : 'none';
                                });
                            });
                        });

                        varPanelsContainer.querySelectorAll('.algebraic-solve-for-btn').forEach(solveBtn => {
                            solveBtn.addEventListener('click', () => {
                                const targetVar = solveBtn.getAttribute('data-algebraic-var');
                                const panel = solveBtn.closest('.algebraic-var-panel');
                                const resultDiv = panel ? panel.querySelector('.algebraic-panel-result') : null;
                                const equation = input.value.trim();
                                if (!equation || !resultDiv) return;
                                const knownValues = {};
                                let invalidInput = null;
                                panel.querySelectorAll('input[data-var]').forEach(inp => {
                                    const name = inp.getAttribute('data-var');
                                    const val = inp.value.trim();
                                    const num = parseKnownValue(val, name);
                                    if (val === '') return;
                                    if (!Number.isFinite(num)) {
                                        invalidInput = name;
                                        return;
                                    }
                                    knownValues[name] = num;
                                });
                                if (invalidInput) {
                                    resultDiv.innerHTML = `<div class="alg-error">Invalid value for <strong>${escapeHtml(invalidInput)}</strong>. You can use math like <code>2*pi</code> or <code>1e6</code>.</div>`;
                                    return;
                                }
                                resultDiv.innerHTML = `<div class="alg-loading">Solving…</div>`;
                                try {
                                    const res = AlgebraicSolver.solveForVariable(equation, targetVar, knownValues);
                                    if (res.error) {
                                        const head = res.solvedForm ? `<div class="alg-card"><div class="alg-card__title">Solved form</div><div class="alg-mono">${latexSpan(toLatex(res.solvedForm), true)}</div></div>` : '';
                                        resultDiv.innerHTML = `<div class="alg-result">${head}<div class="alg-error">${escapeHtml(res.error)}</div></div>`;
                                        renderKatexIn(resultDiv);
                                    } else {
                                        resultDiv.innerHTML = renderPrettyResultHTML(res);
                                        renderKatexIn(resultDiv);
                                    }
                                } catch (e) {
                                    resultDiv.innerHTML = `<div class="alg-error">${escapeHtml(e.message)}</div>`;
                                }
                            });
                        });
                    }
                    return;
                }
                if (singleResult) {
                    singleResult.innerHTML = renderPrettyResultHTML(out);
                    renderKatexIn(singleResult);
                }
                if (multiTabs) multiTabs.style.display = 'none';
            } catch (e) {
                if (singleResult) {
                    singleResult.innerHTML = `<div class="alg-error">${escapeHtml(e.message)}</div>`;
                }
                if (multiTabs) multiTabs.style.display = 'none';
            }
        };

        btn.dataset.algInlineInit = '1'; // Prevent inline fallback from double-attaching
        btn.addEventListener('click', parseAndShow);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') parseAndShow(); });
        this._algebraicHandlersInit = true;
    }
    activateClassificationMainTab() {
        const classificationTab = document.getElementById('main-classification-tab');
        if (classificationTab) {
            classificationTab.classList.add('active');
            classificationTab.style.setProperty('display', 'block', 'important');
            classificationTab.style.setProperty('visibility', 'visible', 'important');
            console.log('[TabManager] ✅ Classification tab activated');
            // Initialize classifier with retry logic
            if (!this.stellarClassifier && this.initStellarClassifier) {
                this.retryInitialization('classifier', () => {
                    this.stellarClassifier = this.initStellarClassifier();
                    if (this.stellarClassifier) {
                        console.log('[TabManager] ✅ StellarClassifier initialized');
                    }
                    else {
                        throw new Error('StellarClassifier initialization returned null');
                    }
                });
            }
        }
        else {
            console.error('[TabManager] ❌ main-classification-tab not found!');
        }
    }
    activateUnitConverterTab() {
        const ucTab = document.getElementById('main-unit-converter-tab');
        if (ucTab) {
            ucTab.classList.add('active');
            ucTab.style.setProperty('display', 'block', 'important');
            ucTab.style.setProperty('visibility', 'visible', 'important');
            console.log('[TabManager] ✅ Unit Converter tab activated');
            // Initialize the unit converter UI
            if (typeof window !== 'undefined' && typeof window.initUnitConverter === 'function') {
                window.initUnitConverter();
            }
        }
        else {
            console.error('[TabManager] ❌ main-unit-converter-tab not found!');
        }
    }
    activateScientificCalcTab() {
        const tab = document.getElementById('main-scientific-calc-tab');
        if (tab) {
            tab.classList.add('active');
            tab.style.setProperty('display', 'block', 'important');
            tab.style.setProperty('visibility', 'visible', 'important');
            console.log('[TabManager] ✅ Scientific calculator tab activated');
            if (typeof window !== 'undefined' && typeof window.initScientificCalculator === 'function') {
                window.initScientificCalculator();
            }
        }
        else {
            console.error('[TabManager] ❌ main-scientific-calc-tab not found!');
        }
    }
    activateCalculatorTab() {
        const calcTab = document.getElementById('calculator-tab');
        if (calcTab) {
            calcTab.classList.add('active');
            calcTab.setAttribute('aria-hidden', 'false');
            this.setElementVisible(calcTab);
            console.log('[TabManager] ✅ Calculator tab activated and visible');
        }
        else {
            console.error('[TabManager] ❌ calculator-tab element not found!');
        }
    }
    activateGraphTab() {
        const graphTab = document.getElementById('graph-tab');
        if (graphTab) {
            graphTab.classList.add('active');
            graphTab.setAttribute('aria-hidden', 'false');
            this.setElementVisible(graphTab);
            console.log('[TabManager] ✅ Graph tab activated and visible');
            // Notify that graph tab is activated
            if (this.onGraphTabActivated) {
                setTimeout(() => this.onGraphTabActivated(), 100);
            }
        }
        else {
            console.error('[TabManager] ❌ graph-tab element not found!');
        }
    }
    activateClassificationSubTab() {
        const classificationTab = document.getElementById('classification-tab');
        if (classificationTab) {
            classificationTab.classList.add('active');
            classificationTab.setAttribute('aria-hidden', 'false');
            this.setElementVisible(classificationTab);
            // Ensure classification inputs are visible
            const inputsContainer = classificationTab.querySelector('.classification-inputs');
            if (inputsContainer) {
                this.setElementVisible(inputsContainer);
            }
            const inputs = classificationTab.querySelectorAll('.classification-inputs input');
            inputs.forEach(input => {
                this.setElementVisible(input);
            });
            console.log('[TabManager] ✅ Classification sub tab activated and visible');
        }
        else {
            console.error('[TabManager] ❌ classification-tab element not found!');
        }
    }
    setElementVisible(element) {
        element.style.setProperty('display', element.tagName === 'DIV' ? 'block' : 'flex', 'important');
        element.style.setProperty('visibility', 'visible', 'important');
        element.style.setProperty('opacity', '1', 'important');
    }
    retryInitialization(key, initFn, attempt = 1) {
        if (attempt > this.MAX_INIT_ATTEMPTS) {
            console.warn(`[TabManager] Max initialization attempts reached for ${key}`);
            return;
        }
        try {
            initFn();
            this.initializationAttempts.delete(key);
        }
        catch (error) {
            const currentAttempts = this.initializationAttempts.get(key) || 0;
            this.initializationAttempts.set(key, currentAttempts + 1);
            setTimeout(() => {
                this.retryInitialization(key, initFn, attempt + 1);
            }, 200 * attempt); // Exponential backoff
        }
    }
    handleTabSwitchError(tabName, error) {
        console.error(`[TabManager] Tab switch error for ${tabName}:`, error);
        // Try to at least show the tab content
        const tabElement = document.getElementById(`${tabName}-tab`) ||
            document.getElementById(`main-${tabName}-tab`);
        if (tabElement) {
            tabElement.classList.add('active');
            tabElement.style.setProperty('display', 'block', 'important');
        }
    }
}
