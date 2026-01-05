# 🔍 AstroCalc Search Engine System - Complete Architecture Documentation

## Overview

The AstroCalc search system is a **multi-layered, confidence-scored, concept-expanded** search engine designed for **offline-first operation** with **38,910+ concept nodes** and **3-level formula relationship hierarchies**. It combines literal matching, semantic expansion, confidence scoring, and topic-based relevance to find the most relevant formulas from 204 astrophysics formulas.

---

## 🏗️ System Architecture

### **Core Components**

```
┌─────────────────────────────────────────────────────────────┐
│                    UIModuleOrchestrator                     │
│  (Entry point: handles user input, coordinates modules)    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      SearchEngine                           │
│  • Fast filtering (name/concept pre-filter)                │
│  • Caching (LRU cache + performance optimizer)             │
│  • Result normalization & limiting (50 results max)        │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ FormulaScorer│ │ConceptHierarchy│ │SemanticSearch│
│  (Scoring)   │ │  (38,910 nodes)│ │  (Optional)  │
└──────────────┘ └──────────────┘ └──────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              FormulaKnowledgeGraph                          │
│  • 10 topics per formula (detailed, specific)               │
│  • 3-level relationship hierarchy (confidence-based)       │
│  • Pure confidence scores (0-100)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Search Flow (Step-by-Step)

### **Phase 1: Input Processing**

1. **User types query** → `UIModuleOrchestrator.handleSearch(query)`
2. **Debouncing** → 75ms debounce (via `debounceSearch` utility)
3. **Input validation** → Empty queries return first 50 formulas (no search)

### **Phase 2: Cache Check**

```javascript
// SearchEngine.getCachedResults(searchTerm)
- Check LRU cache (if available)
- Check performanceOptimizer cache (if available)
- Return cached results if found (instant response)
```

**Cache Key**: Lowercase, trimmed query string

### **Phase 3: Fast Filtering (Pre-Scoring)**

```javascript
// SearchEngine.fastFilter(query)
- Converts query to lowercase
- Splits into words
- Filters formulas by:
  • Name contains query OR any word
  • Any concept contains query OR any word
- Returns candidate set (reduces 204 → ~20-50 formulas)
```

**Purpose**: Eliminate obviously irrelevant formulas before expensive scoring

### **Phase 4: Scoring (FormulaScorer)**

For each candidate formula, computes **5 component scores**:

#### **1. Name Match Score** (Highest Weight)
```javascript
Exact match:        +10,000 points
Contains query:     +5,000 points
Word = name:        +300 points
Word starts name:   +200 points
Word in name:       +150 points
```

**Example**: Query "kepler" → "Kepler's Third Law" gets **10,000** (exact match)

#### **2. Concept Match Score**
```javascript
Concept = query:           +400 points
Concept contains query:    +200 points
Word in concept (≥3 chars): +150 points
```

**Uses**: `formula.concepts` array (e.g., `["kepler", "orbital period", "semi-major axis"]`)

#### **3. Variable Match Score**
```javascript
Variable symbol = query:        +400 points
Variable symbol contains:      +180 points
Variable name = query:          +250 points
Variable name contains:         +120 points
Word in symbol (≥2 chars):      +120 points
Word in name:                    +50 points
```

**Uses**: `formula.variables` array (symbols like `T`, `a`, `M` and names like "Orbital Period")

#### **4. Description Match Score**
```javascript
Description contains query:     +150 points
Word in description (≥3 chars, not stop words): +20 points
```

**Stop words filtered**: `['the', 'is', 'to', 'a', 'an', 'and', 'or', 'of', 'for', 'with', 'from']`

#### **5. Category Match Score**
```javascript
Category = query:        +150 points
Category contains:       +80 points
```

**Uses**: `window.formulaCategories` mapping (e.g., `"Orbital Mechanics": ["kepler_third_law", ...]`)

### **Phase 5: Semantic Enhancement (Optional)**

```javascript
// If semanticSearchSystem available:
semanticScore = semanticSearchSystem.semanticMatch(query, formula)
if (semanticScore > 0) {
    result.score += semanticScore
    result.metrics.semanticMatch = true
}
```

**Purpose**: Catch synonyms, related terms, natural language variations

### **Phase 6: Result Aggregation**

```javascript
Total Score = name + description + concepts + variables + category + semantic
```

**Metrics Object** (tracked for each formula):
```javascript
{
    nameMatch: boolean,
    descriptionMatch: boolean,
    conceptMatch: boolean,
    variableMatch: boolean,
    categoryMatch: boolean,
    semanticMatch: boolean,
    matchedConcepts: string[],
    matchedVariables: string[],
    matchReasons: string[]
}
```

### **Phase 7: Filtering & Sorting**

```javascript
// Filter: Keep if:
- nameMatch = true (always show), OR
- score > 0 AND (conceptMatch OR variableMatch), OR
- score > 0 AND (descriptionMatch OR categoryMatch)

// Sort: Descending by score
// Limit: Top 50 results
```

### **Phase 8: Score Normalization**

```javascript
maxScore = results[0].score  // Highest score
normalizedScore = (score / maxScore) * 1000  // Scale to 0-1000
```

**Purpose**: Makes confidence calculation consistent regardless of absolute score magnitude

### **Phase 9: Caching**

```javascript
// Store results in:
- LRU cache (if available)
- performanceOptimizer cache (if available)
```

**Cache Key**: Lowercase, trimmed query

---

## 🧠 Concept Hierarchy System (38,910+ Nodes)

### **Structure**

The `getConceptHierarchy()` function returns a graph where each concept has:

```javascript
{
    parent: string,           // Taxonomy parent (e.g., "orbital mechanics")
    children: string[],       // Direct children (up to 6)
    siblings: string[],       // Same-parent concepts (up to 12)
    related: string[]         // Variant/related concepts (up to 14)
}
```

### **Taxonomy Roots** (13 categories)

1. `astronomy` (12,465 concepts)
2. `orbital mechanics` (4,163 concepts)
3. `gravity` (3,286 concepts)
4. `stellar physics` (5,914 concepts)
5. `radiation` (1,200 concepts)
6. `spectroscopy` (2,841 concepts)
7. `photometry` (602 concepts)
8. `cosmology` (2,498 concepts)
9. `exoplanets` (1,987 concepts)
10. `astrometry` (2,101 concepts)
11. `galactic astronomy` (368 concepts)
12. `instrumentation` (244 concepts)
13. `math & units` (1,228 concepts)

### **Concept Expansion Process**

When a formula has concepts like `["kepler", "orbital period"]`, the system:

1. **Base extraction**: Pulls concepts from:
   - `formula.concepts`
   - `formula.keywords`
   - `formula.name` (tokenized)
   - `formula.description` (first 40 tokens)
   - `formula.variables` (names + descriptions)

2. **Hierarchy expansion**:
   - Adds parent concepts
   - Adds up to 6 children per concept
   - Adds up to 12 siblings per concept
   - Adds up to 14 related variants per concept

3. **Category injection**: Adds formula categories as concepts

4. **Capping**: Limits to **380 concepts per formula** (deterministic, lexicographically sorted)

**Result**: Each formula has a **signature** of 380 expanded concepts for similarity comparison

---

## 🔗 Formula Relationship System (3-Level Hierarchy)

### **Confidence Score Calculation**

For any two formulas (source, target), computes:

```javascript
confidence = 100 * (
    0.62 * conceptSimilarity +    // Jaccard similarity of expanded concept sets
    0.16 * variableSimilarity +   // Jaccard similarity of variable signatures
    0.10 * categoryMatch +          // 1 if same category, 0 otherwise
    0.12 * directRelationship      // 1 if explicit relationship, 0 otherwise
)
```

**Jaccard Similarity**:
```
J(A, B) = |A ∩ B| / |A ∪ B|
```

**Example**: 
- Formula A concepts: `{kepler, orbital period, semi-major axis, ...}` (380 total)
- Formula B concepts: `{kepler, orbital velocity, semi-major axis, ...}` (380 total)
- Intersection: `{kepler, semi-major axis, ...}` (120 shared)
- Union: `{kepler, orbital period, orbital velocity, semi-major axis, ...}` (640 total)
- Jaccard: `120 / 640 = 0.1875`

### **3-Level Hierarchy**

#### **Level 1: Closest (Top 5)**
- **Selection**: Top 5 formulas by confidence score
- **Confidence range**: Typically 60-100%
- **Connection**: Direct concept/variable overlap
- **Use case**: "Most related formulas"

#### **Level 2: Moderate (via Level 1)**
- **Selection**: 
  - Formulas explicitly related to Level 1 formulas (from `formula.relationships.relatedTo`)
  - Top 25 formulas by confidence (if not already in Level 1)
  - **Threshold**: Confidence ≥ 35%
- **Limit**: Up to 24 formulas
- **Connection**: Indirect via Level 1 formulas
- **Use case**: "Related to related formulas"

#### **Level 3: All Remaining**
- **Selection**: All other formulas (sorted by confidence)
- **Confidence range**: 0-35% (typically)
- **Connection**: Weak but still scored
- **Use case**: "Everything else, with in-depth connection details"

**Example Hierarchy for "Kepler's Third Law"**:
```
Level 1 (Top 5):
  - Orbital Velocity (confidence: 87%)
  - Escape Velocity (confidence: 82%)
  - Vis-Viva Equation (confidence: 79%)
  - Orbital Energy (confidence: 75%)
  - Surface Gravity (confidence: 71%)

Level 2 (Moderate, via Level 1):
  - Binary Orbital Period (via Orbital Velocity, confidence: 58%)
  - Centripetal Force (via Orbital Velocity, confidence: 52%)
  - Gravitational Potential (via Escape Velocity, confidence: 48%)
  ... (up to 24 total)

Level 3 (All Remaining):
  - Distance Modulus (confidence: 12%)
  - Wien's Law (confidence: 8%)
  - Hubble Law (confidence: 5%)
  ... (all 199 remaining formulas)
```

---

## 📚 Topic System (10 Topics Per Formula)

### **Topic Generation Process**

For each formula, generates **exactly 10 topics** with specific details:

1. **Candidate Collection**:
   - Categories: +8 points each
   - Concepts (first 18): +10 points each
   - Keywords (first 18): +6 points each
   - Concept parents (from hierarchy): +7 points each
   - Description bigrams/trigrams: +2/+1 points

2. **Ranking**: Sort by score, then lexicographically

3. **Deduplication**: Avoid topics that are substrings of each other

4. **Detail Generation**: Each topic gets a detail string:
   ```
   "Used in {category}; connects to {top 2 concepts}; typical variables: {symbols}."
   ```

5. **Padding**: If < 10 topics, pad with category/variable-derived topics

**Example Topics for "Kepler's Third Law"**:
```javascript
[
  { topic: "kepler", detail: "Used in Orbital Mechanics; connects to kepler, orbital period; typical variables: T, a, M." },
  { topic: "orbital period", detail: "Used in Orbital Mechanics; connects to kepler, orbital period; typical variables: T, a, M." },
  { topic: "semi-major axis", detail: "Used in Orbital Mechanics; connects to kepler, orbital period; typical variables: T, a, M." },
  { topic: "orbital mechanics", detail: "Used in Orbital Mechanics; connects to kepler, orbital period; typical variables: T, a, M." },
  { topic: "planetary motion", detail: "Used in Orbital Mechanics; connects to kepler, orbital period; typical variables: T, a, M." },
  { topic: "binary systems", detail: "Used in Orbital Mechanics; connects to kepler, orbital period; typical variables: T, a, M." },
  { topic: "exoplanets", detail: "Used in Orbital Mechanics; connects to kepler, orbital period; typical variables: T, a, M." },
  { topic: "celestial mechanics", detail: "Used in Orbital Mechanics; connects to kepler, orbital period; typical variables: T, a, M." },
  { topic: "revolution", detail: "Used in Orbital Mechanics; connects to kepler, orbital period; typical variables: T, a, M." },
  { topic: "orbit", detail: "Used in Orbital Mechanics; connects to kepler, orbital period; typical variables: T, a, M." }
]
```

---

## 🎯 Confidence Scoring System

### **Confidence Calculation** (from `frqSupport.js`)

```javascript
calculateConfidenceScore(literalScore, maxCombinedScore, metrics, historyFactor, topicScore, contextScore)
```

**Components**:

1. **Base Relevance** (0-50 points):
   ```
   combinedScore = literalScore + topicScore + contextScore
   scoreRatio = combinedScore / maxCombinedScore
   baseConfidence = min(50, scoreRatio * 50)
   ```

2. **Boosts** (capped at 35 total):
   - Name match: +20 points
   - Question pattern match: +15 points
   - Concept matches: +4 per concept (max 15)
   - Semantic similarity: +10 max

3. **Topic & Context** (weighted):
   - Topic relevance: 20% weight
   - Context match: 15% weight

4. **Weak Match Penalty**: -15 if no strong indicators

5. **History Factor**: Multiplier (0.8-1.5) based on past usage

6. **Final**: Clamped to 0-100

**Confidence Levels**:
- **85-100%**: Very High (🟢)
- **70-84%**: High (🔵)
- **50-69%**: Moderate (🟡)
- **30-49%**: Low (🟠)
- **0-29%**: Very Low (⚪)

---

## 🔄 Search Relations & Connectivity

### **Concept-Based Relations**

1. **Direct Concept Overlap**: Formulas sharing concepts get higher confidence
2. **Hierarchy Expansion**: Concepts expand through parent/child/sibling/related links
3. **Category Co-occurrence**: Formulas in same category get +10% confidence boost

### **Variable-Based Relations**

1. **Shared Variables**: Formulas using same variable symbols (e.g., `T`, `M`, `r`) get higher confidence
2. **Variable Name Similarity**: Variable names like "Orbital Period" vs "Period" create connections

### **Explicit Relationships**

Formulas can have explicit `relationships.relatedTo` arrays:
```javascript
{
    id: "kepler_third_law",
    relationships: {
        relatedTo: ["orbital_velocity", "escape_velocity", "vis_viva", ...]
    }
}
```

These create **+12% confidence boost** in relationship calculations.

### **Formula Knowledge Graph Integration**

The `FormulaKnowledgeGraph` system:
- Pre-computes confidence scores for all formula pairs
- Builds 3-level hierarchies on-demand (cached)
- Provides `window.formulaKnowledgeGraph.get(formulaId)` API
- Renders topics + relationship layers via `window.displayRelatedFormulas(formula)`

---

## 🚀 Performance Optimizations

1. **Fast Filtering**: Reduces 204 → ~20-50 candidates before scoring
2. **Caching**: LRU cache + performance optimizer cache (instant repeat queries)
3. **Debouncing**: 75ms debounce prevents excessive searches while typing
4. **Result Limiting**: Max 50 results (UI performance)
5. **Memoization**: Concept expansion cached per formula ID
6. **Lazy Evaluation**: Formula knowledge graph built on-demand, not at startup

---

## 📈 Search Quality Metrics

### **Scoring Weights** (Current)
- Name match: **10,000** (highest priority)
- Concept match: **400** (exact), **200** (contains)
- Variable match: **400** (symbol exact), **250** (name exact)
- Description match: **150** (contains query)
- Category match: **150** (exact), **80** (contains)

### **Confidence Weights** (Relationship Calculation)
- Concept similarity: **62%**
- Variable similarity: **16%**
- Category match: **10%**
- Direct relationship: **12%**

### **Confidence Calculation Weights**
- Base relevance: **50 points max**
- Boosts: **35 points max**
- Topic relevance: **20% weight**
- Context match: **15% weight**

---

## 🎨 UI Integration

### **Search Inputs**

1. **Main Search** (`#formula-search`): Filters main formula list
2. **Command Palette** (`#command-palette-input`): Quick search overlay (to be removed)

### **Result Display**

1. **Formula Cards**: Show confidence scores, topic scope, match reasons
2. **Command Palette**: Shows top 10 results (legacy, to be removed)
3. **Main List**: Shows top 50 results with full details

### **Confidence Display**

Each formula card shows:
- **Confidence percentage** (0-100%)
- **Confidence level** (Very High/High/Moderate/Low/Very Low)
- **Match reasons** (Name match, Concept match, etc.)
- **Topic scope** (Category, matched concepts, topic/context scores)

---

## 🔧 Configuration & Extensibility

### **Optional Systems**

1. **Semantic Search System**: Optional, adds semantic similarity scores
2. **Performance Optimizer**: Optional, provides additional caching layer
3. **Concept Hierarchy**: Required (38,910+ nodes via `getConceptHierarchy()`)

### **Extensibility Points**

1. **Custom Scorers**: Replace `FormulaScorer` with custom scoring logic
2. **Custom Filters**: Override `fastFilter()` for domain-specific pre-filtering
3. **Custom Normalization**: Override `normalizeScores()` for different scaling
4. **Custom Confidence**: Override `calculateConfidenceScore()` in `frqSupport.js`

---

## 📝 Example Search Flow

**Query**: `"how to calculate escape velocity"`

1. **Input**: `"how to calculate escape velocity"`
2. **Cache Check**: Miss (first time)
3. **Fast Filter**: Finds formulas with "escape" or "velocity" in name/concepts
   - Candidates: `["escape_velocity", "orbital_velocity", "vis_viva", ...]` (~8 formulas)
4. **Scoring**:
   - `escape_velocity`: 
     - Name: +5,000 (contains "escape velocity")
     - Description: +150 (contains query)
     - Concepts: +400 ("escape velocity" exact match)
     - **Total: ~5,550**
   - `orbital_velocity`:
     - Name: +5,000 (contains "velocity")
     - Description: +20 ("escape" in description)
     - Concepts: +200 ("velocity" in concepts)
     - **Total: ~5,220**
5. **Semantic Enhancement**: Adds +50 to `escape_velocity` (synonym matching)
6. **Filtering**: Both pass (score > 0, strong matches)
7. **Sorting**: `escape_velocity` first (5,600 > 5,220)
8. **Normalization**: 
   - `escape_velocity`: 1000 (max)
   - `orbital_velocity`: 932
9. **Confidence Calculation**:
   - `escape_velocity`: 95% (Very High)
   - `orbital_velocity`: 78% (High)
10. **Caching**: Results cached under key `"how to calculate escape velocity"`
11. **Display**: Cards rendered with confidence scores, topics, match reasons

---

## 🎯 Key Design Principles

1. **Offline-First**: No external API calls, all data local
2. **Deterministic**: Same query → same results (no randomness)
3. **Performance**: Fast filtering + caching for sub-100ms responses
4. **Transparency**: Confidence scores, match reasons, topic scope all visible
5. **Extensibility**: Modular design allows custom scorers/filters
6. **Scalability**: Handles 204 formulas efficiently, can scale to 1000+

---

## 🔮 Future Enhancements (Not Yet Implemented)

1. **Advanced Search UI**: Filters by category, confidence threshold, variable presence
2. **Query Syntax**: Support for `category:orbital AND confidence:>70`
3. **Search History**: Track popular queries, boost formulas based on usage
4. **Fuzzy Matching**: Handle typos, misspellings
5. **Multi-language**: Support for non-English queries (concept translation)

---

**Last Updated**: 2026-01-05
**Version**: Search Engine v2.0 (with 38,910+ concept hierarchy)

