/**
 * Offline scientific calculator UI — evaluates with SafeMathEvaluator only (no network).
 */
(function (global) {
    'use strict';

    let initialized = false;

    function formatResult(n) {
        if (typeof n !== 'number' || !Number.isFinite(n)) return String(n);
        if (Math.abs(n) >= 1e12 || (Math.abs(n) < 1e-8 && n !== 0)) return n.toExponential(8);
        const r = Number(n.toPrecision(14));
        return String(r);
    }

    function insertAtCursor(input, text) {
        const start = input.selectionStart != null ? input.selectionStart : input.value.length;
        const end = input.selectionEnd != null ? input.selectionEnd : input.value.length;
        const before = input.value.slice(0, start);
        const after = input.value.slice(end);
        input.value = before + text + after;
        const pos = start + text.length;
        input.selectionStart = input.selectionEnd = pos;
        input.focus();
    }

    function doEval(input, resultEl) {
        const raw = (input.value || '').trim();
        if (!raw) {
            resultEl.textContent = '';
            resultEl.classList.remove('sci-calc-error');
            return;
        }
        const SME = global.SafeMathEvaluator;
        if (!SME || typeof SME.evaluate !== 'function') {
            resultEl.textContent = 'Calculator engine not loaded.';
            resultEl.classList.add('sci-calc-error');
            return;
        }
        try {
            const v = SME.evaluate(raw, {});
            resultEl.textContent = '= ' + formatResult(v);
            resultEl.classList.remove('sci-calc-error');
        } catch (err) {
            resultEl.textContent = err.message || String(err);
            resultEl.classList.add('sci-calc-error');
        }
    }

    global.initScientificCalculator = function initScientificCalculator() {
        if (initialized) return;
        const root = document.getElementById('main-scientific-calc-tab');
        const input = document.getElementById('sci-calc-expression');
        const resultEl = document.getElementById('sci-calc-result');
        const keypad = document.getElementById('sci-calc-keypad');
        if (!root || !input || !resultEl || !keypad) return;

        initialized = true;

        keypad.addEventListener('click', (e) => {
            const btn = e.target.closest('.sci-calc-btn');
            if (!btn) return;
            const action = btn.getAttribute('data-action');
            if (action === 'clear') {
                input.value = '';
                resultEl.textContent = '';
                resultEl.classList.remove('sci-calc-error');
                input.focus();
                return;
            }
            if (action === 'back') {
                const start = input.selectionStart != null ? input.selectionStart : input.value.length;
                const end = input.selectionEnd != null ? input.selectionEnd : input.value.length;
                if (start !== end) {
                    input.value = input.value.slice(0, start) + input.value.slice(end);
                    input.selectionStart = input.selectionEnd = start;
                } else if (start > 0) {
                    input.value = input.value.slice(0, start - 1) + input.value.slice(start);
                    input.selectionStart = input.selectionEnd = start - 1;
                }
                input.focus();
                return;
            }
            if (action === 'eval') {
                doEval(input, resultEl);
                return;
            }
            const ins = btn.getAttribute('data-insert');
            if (ins != null) {
                insertAtCursor(input, ins);
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                doEval(input, resultEl);
            }
        });
    };
})(typeof window !== 'undefined' ? window : globalThis);
