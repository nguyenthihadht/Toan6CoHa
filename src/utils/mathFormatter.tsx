import React from "react";

/**
 * Utility to parse mathematical text, especially LaTeX notations and symbols,
 * and format them beautifully into React components using standard unicode symbols and <sup> elements.
 */
export function renderMath(text: string | null | undefined): React.ReactNode {
  if (!text) return "";

  // 1. Initial cleanup of LaTeX structures
  let s = text;

  // Remove LaTeX block/inline markers
  s = s.replace(/\$\$/g, "");
  s = s.replace(/\$/g, "");
  s = s.replace(/\\\(|\\\)/g, "");
  s = s.replace(/\\\[|\\\]/g, "");

  // 2. Translate common LaTeX operators and symbols
  s = s.replace(/\\in\b/g, " ∈ ");
  s = s.replace(/\\notin\b/g, " ∉ ");
  s = s.replace(/\\mathbb\{N\}\^\*/g, " ℕ* ");
  s = s.replace(/\\mathbb\{N\}/g, " ℕ ");
  s = s.replace(/\\mathbb N\b/g, " ℕ ");
  s = s.replace(/\\mathbb\{Z\}/g, " ℤ ");
  s = s.replace(/\\mathbb Z\b/g, " ℤ ");
  s = s.replace(/\\mathbb\{Q\}/g, " ℚ ");
  s = s.replace(/\\mathbb Q\b/g, " ℚ ");
  s = s.replace(/\\mathbb\{R\}/g, " ℝ ");
  s = s.replace(/\\mathbb R\b/g, " ℝ ");
  s = s.replace(/\\emptyset\b/g, " ∅ ");
  s = s.replace(/\\subset\b/g, " ⊂ ");
  s = s.replace(/\\cap\b/g, " ∩ ");
  s = s.replace(/\\cup\b/g, " ∪ ");
  s = s.replace(/\\leq\b|\\le\b/g, " ≤ ");
  s = s.replace(/\\geq\b|\\ge\b/g, " ≥ ");
  s = s.replace(/\\neq\b|\\ne\b/g, " ≠ ");
  s = s.replace(/\\times\b/g, " × ");
  s = s.replace(/\\cdot\b/g, " · ");
  s = s.replace(/\\dots\b/g, " … ");
  s = s.replace(/\\degree\b/g, "°");
  s = s.replace(/\\pi\b/g, "π");

  // Translate fractions \frac{a}{b} -> (a/b)
  while (s.includes("\\frac{")) {
    s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1)/($2)");
  }

  // Translate \sqrt{a} -> √(a)
  while (s.includes("\\sqrt{")) {
    s = s.replace(/\\sqrt\{([^{}]+)\}/g, "√($1)");
  }

  // 3. Split the text to render superscripts with <sup> tags
  // Matches base^power where base can be word, number or sets like ℕ, ℤ, and power can be in {curly}, (parens), or a single digit/letter
  const regex = /([a-zA-Z0-9ℕℤℝ∅⊂()]+)\^(\{([^}]+)\}|\(([^)]+)\)|([a-zA-Z0-9\-+*\/]+))/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(s)) !== null) {
    const matchIndex = match.index;
    const base = match[1];
    const power = match[3] || match[4] || match[5];

    // Add normal text preceding this match
    if (matchIndex > lastIndex) {
      elements.push(s.substring(lastIndex, matchIndex));
    }

    // Add base and <sup>power</sup>
    elements.push(
      <React.Fragment key={matchIndex}>
        {base}
        <sup className="text-[10px] font-bold select-all leading-none">{power}</sup>
      </React.Fragment>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < s.length) {
    elements.push(s.substring(lastIndex));
  }

  return elements.length > 0 ? <>{elements}</> : s;
}
