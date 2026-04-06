#!/usr/bin/env python3
"""
Offline universal algebra solver (SymPy + Tkinter / ttk).

Requires: pip install sympy

Uses ttk widgets throughout; multiline output uses tk.Text (ttk has no Text).
Solutions are simplified symbolically (exact rationals, no 0.0/1.0 noise).
"""
from __future__ import annotations

import re
import tkinter as tk
from tkinter import messagebox, ttk
from tkinter import scrolledtext

from sympy import (
    Eq,
    N,
    cancel,
    nsimplify,
    pretty,
    simplify,
    solve,
    symbols,
    sympify,
)

# Greek letters for physics / astronomy
GREEK_LOWERCASE = "α β γ δ ε ζ η θ ι κ λ μ ν ξ π ρ σ τ υ φ χ ψ ω".split()
GREEK_UPPERCASE = "Γ Δ Θ Λ Ξ Π Σ Φ Ψ Ω".split()

# Extra insertions (label → characters) for the math row
MATH_INSERTS = [
    ("·", "·"),
    ("×", "*"),
    ("÷", "/"),
    ("^", "**"),
    ("√", "sqrt("),
    ("≤", "<="),
    ("≥", ">="),
    ("≠", "!="),
    ("π", "pi"),
    ("∞", "oo"),
]


def preprocess(equation: str) -> str:
    """Normalize user input toward valid SymPy (implicit multiplication, powers)."""
    s = equation.strip().replace("^", "**")
    # digit then letter (Latin or Greek)
    s = re.sub(r"(\d)([a-zA-Zα-ωΑ-Ω])", r"\1*\2", s)
    # letter/digit then opening paren
    s = re.sub(r"([a-zA-Zα-ωΑ-Ω0-9])\(", r"\1*(", s)
    # closing paren then letter or digit or (
    s = re.sub(r"(\))([a-zA-Zα-ωΑ-Ω0-9\(])", r"\1*\2", s)
    return s


def parse_equation(equation: str) -> Eq:
    if "=" not in equation:
        raise ValueError("Equation must contain '='")
    lhs_s, rhs_s = equation.split("=", 1)
    # rational=True keeps exact fractions; avoids 0.0/1.0 artifacts in algebra
    lhs_expr = sympify(lhs_s.strip(), rational=True)
    rhs_expr = sympify(rhs_s.strip(), rational=True)
    return Eq(lhs_expr, rhs_expr)


def extract_variables(eq: Eq) -> list[str]:
    return sorted({str(v) for v in eq.free_symbols}, key=lambda x: (len(x), x))


def _clean_solution(expr) -> object:
    """Exact, readable symbolic form (no float noise from intermediate steps)."""
    e = simplify(expr)
    e = cancel(e)
    try:
        e = nsimplify(e, rational=True, maxsteps=75)
    except Exception:
        pass
    return simplify(e)


def solve_for_variable(eq: Eq, var_name: str, numeric: bool):
    """
    Solve eq for var_name. Returns (solutions_list, info_lines).
    Uses SymPy solve + aggressive simplify so forms stay readable (e.g. w = 3*y/5).
    """
    var = symbols(var_name)
    info: list[str] = []

    # Standard solver; dict=False gives a list of expressions
    raw = solve(eq, var, dict=False)
    if raw is None:
        raw = []
    if not isinstance(raw, list):
        raw = [raw]

    cleaned: list = []
    for s in raw:
        cleaned.append(_clean_solution(s))

    if numeric:
        num_list: list = []
        for s in cleaned:
            try:
                num_list.append(N(s))
            except (TypeError, ValueError):
                num_list.append(s)
        info.append(f"Numeric (.evalf) where possible: {num_list}")
        return num_list, info

    pretty_sols = [pretty(s, use_unicode=True) for s in cleaned]
    info.append(f"Simplified solution(s) for {var_name}: {', '.join(pretty_sols)}")
    return cleaned, info


def apply_dark_theme(root: tk.Tk, style: ttk.Style) -> None:
    bg = "#0f172a"
    fg = "#e2e8f0"
    accent = "#6366f1"
    root.configure(bg=bg)
    try:
        style.theme_use("clam")
    except tk.TclError:
        pass
    style.configure(".", background=bg, foreground=fg, fieldbackground="#1e293b")
    style.configure("TFrame", background=bg)
    style.configure("TLabel", background=bg, foreground=fg)
    style.configure("TButton", background=accent, foreground="#ffffff", padding=6)
    style.map("TButton", background=[("active", "#4f46e5")])
    style.configure("TEntry", fieldbackground="#1e293b", foreground=fg, insertcolor=fg)
    style.configure("TCheckbutton", background=bg, foreground=fg)
    style.configure("TLabelframe", background=bg, foreground=fg)
    style.configure("TLabelframe.Label", background=bg, foreground="#a5b4fc")
    style.configure("TNotebook", background=bg)
    style.configure("TNotebook.Tab", background="#1e293b", foreground=fg, padding=[10, 4])
    style.map("TNotebook.Tab", background=[("selected", accent)])


class AlgebraSolverApp:
    def __init__(self) -> None:
        self.root = tk.Tk()
        self.root.title("Offline Universal Algebra Solver")
        self.root.minsize(720, 560)

        self.style = ttk.Style(self.root)
        apply_dark_theme(self.root, self.style)

        self._eq: Eq | None = None
        self._variables: list[str] = []
        self.numeric_var = tk.BooleanVar(value=False)

        self._build_ui()

    def _build_ui(self) -> None:
        main = ttk.Frame(self.root, padding=10)
        main.grid(row=0, column=0, sticky="nsew")
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main.columnconfigure(1, weight=1)

        ttk.Label(main, text="Equation (single '='):").grid(row=0, column=0, sticky="nw")
        self.equation_entry = ttk.Entry(main, width=64)
        self.equation_entry.grid(row=0, column=1, columnspan=2, sticky="ew", pady=(0, 4))

        ttk.Button(main, text="Parse equation", command=self.on_parse).grid(row=1, column=0, sticky="w", pady=4)
        ttk.Checkbutton(
            main,
            text="Numeric evaluation (.evalf) where possible",
            variable=self.numeric_var,
        ).grid(row=1, column=1, sticky="w")

        # Palettes
        greek_frame = ttk.LabelFrame(main, text="Insert (Greek)")
        greek_frame.grid(row=2, column=0, columnspan=3, sticky="ew", pady=6)
        self._build_char_palette(greek_frame, GREEK_LOWERCASE, GREEK_UPPERCASE)

        math_frame = ttk.LabelFrame(main, text="Insert (Math)")
        math_frame.grid(row=3, column=0, columnspan=3, sticky="ew", pady=4)
        self._build_math_palette(math_frame)

        info_frame = ttk.LabelFrame(main, text="Parsed equation")
        info_frame.grid(row=4, column=0, columnspan=3, sticky="ew", pady=6)
        self.info_text = tk.Text(
            info_frame,
            height=5,
            wrap="word",
            font=("Consolas", 10),
            bg="#1e293b",
            fg="#e2e8f0",
            insertbackground="#e2e8f0",
            relief="flat",
        )
        self.info_text.pack(fill="both", expand=True, padx=6, pady=6)

        ttk.Label(main, text="Solve (one tab per variable)").grid(row=5, column=0, columnspan=3, sticky="w", pady=(8, 0))
        self.notebook = ttk.Notebook(main)
        self.notebook.grid(row=6, column=0, columnspan=3, sticky="nsew", pady=6)
        main.rowconfigure(6, weight=1)

        self._tab_frames: dict[str, tuple[ttk.Frame, scrolledtext.ScrolledText]] = {}

    def _build_char_palette(self, parent: ttk.Frame, lower: list[str], upper: list[str]) -> None:
        inner = ttk.Frame(parent, padding=6)
        inner.pack(fill="x")
        max_cols = 12
        ttk.Label(inner, text="α–ω:").grid(row=0, column=0, sticky="nw", padx=(0, 6))
        for i, ch in enumerate(lower):
            r, c = divmod(i, max_cols)
            ttk.Button(inner, text=ch, width=3, command=lambda c=ch: self.insert_at_cursor(c)).grid(
                row=r, column=c + 1, padx=1, pady=2
            )
        row_off = (len(lower) + max_cols - 1) // max_cols
        ttk.Label(inner, text="Γ–Ω:").grid(row=row_off, column=0, sticky="nw", padx=(0, 6), pady=(6, 0))
        for i, ch in enumerate(upper):
            r, c = divmod(i, max_cols)
            ttk.Button(inner, text=ch, width=3, command=lambda c=ch: self.insert_at_cursor(c)).grid(
                row=row_off + r, column=c + 1, padx=1, pady=2
            )

    def _build_math_palette(self, parent: ttk.Frame) -> None:
        inner = ttk.Frame(parent, padding=6)
        inner.pack(fill="x")
        for i, (label, ins) in enumerate(MATH_INSERTS):
            ttk.Button(inner, text=label, width=4, command=lambda t=ins: self.insert_at_cursor(t)).grid(
                row=0, column=i, padx=2, pady=2
            )

    def insert_at_cursor(self, text: str) -> None:
        e = self.equation_entry
        e.focus_set()
        pos = e.index(tk.INSERT)
        e.insert(pos, text)

    def on_parse(self) -> None:
        raw = self.equation_entry.get()
        try:
            proc = preprocess(raw)
            eq = parse_equation(proc)
            variables = extract_variables(eq)
            self._eq = eq
            self._variables = variables

            norm_lhs = pretty(eq.lhs, use_unicode=True)
            norm_rhs = pretty(eq.rhs, use_unicode=True)
            self.info_text.delete("1.0", tk.END)
            self.info_text.insert(tk.END, f"Equation: {raw.strip()}\n\n")
            self.info_text.insert(tk.END, f"Normalized: {proc}\n\n")
            self.info_text.insert(tk.END, f"SymPy: {norm_lhs} = {norm_rhs}\n\n")
            self.info_text.insert(tk.END, f"Variables: {', '.join(variables) if variables else '(none)'}\n")
            self.info_text.insert(tk.END, "Use tabs below to solve for each.\n")

            self._rebuild_tabs()
            # Solve all tabs once parsed
            self._refresh_all_solutions()
        except Exception as ex:
            messagebox.showerror("Parse error", str(ex))

    def _rebuild_tabs(self) -> None:
        for tab in self.notebook.tabs():
            self.notebook.forget(tab)
        self._tab_frames.clear()

        if not self._variables or self._eq is None:
            return

        for v in self._variables:
            tab = ttk.Frame(self.notebook, padding=8)
            self.notebook.add(tab, text=f"Solve for {v}")
            tab.columnconfigure(0, weight=1)
            tab.rowconfigure(0, weight=1)

            lf = ttk.LabelFrame(tab, text="SOLVED FORM")
            lf.grid(row=0, column=0, sticky="nsew")
            lf.columnconfigure(0, weight=1)
            lf.rowconfigure(0, weight=1)

            st = scrolledtext.ScrolledText(
                lf,
                width=80,
                height=14,
                wrap="word",
                font=("Consolas", 11),
                bg="#1e293b",
                fg="#e2e8f0",
                insertbackground="#e2e8f0",
                relief="flat",
            )
            st.grid(row=0, column=0, sticky="nsew", padx=4, pady=4)

            btn = ttk.Button(tab, text=f"Solve for {v}", command=lambda name=v: self._solve_one(name))
            btn.grid(row=1, column=0, sticky="w", pady=6)

            self._tab_frames[v] = (tab, st)

    def _refresh_all_solutions(self) -> None:
        if self._eq is None:
            return
        for v in self._variables:
            self._solve_one(v)

    def _solve_one(self, var_name: str) -> None:
        if self._eq is None:
            return
        pair = self._tab_frames.get(var_name)
        if not pair:
            return
        _, st = pair
        try:
            sols, extra = solve_for_variable(self._eq, var_name, self.numeric_var.get())
            st.delete("1.0", tk.END)
            if not sols:
                st.insert(tk.END, "No solution found.\n")
                return
            for line in extra:
                st.insert(tk.END, line + "\n\n")
            st.insert(tk.END, "\n---\n\n")
            for i, sol in enumerate(sols, 1):
                st.insert(tk.END, f"{var_name} = {pretty(sol, use_unicode=True)}\n\n")
        except Exception as ex:
            st.delete("1.0", tk.END)
            st.insert(tk.END, f"Error: {ex}\n")

    def run(self) -> None:
        self.root.mainloop()


def main() -> None:
    AlgebraSolverApp().run()


if __name__ == "__main__":
    main()
