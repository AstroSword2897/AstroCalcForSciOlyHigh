# Universal Concept Matching System

## 🎯 Overview

The FRQ support system now works with **ANY astrophysics question that uses ANY concept remotely**. The system extracts concepts from questions, expands them through concept hierarchies, and matches formulas even when concepts are only remotely related.

## ✨ Key Features

### 1. **Question Concept Extraction**

Extracts concepts from ANY astrophysics question by:
- Analyzing question text for astrophysics terms
- Matching against concept hierarchy
- Extracting from formula concepts
- Finding synonyms and related terms

**Example:**
```
Question: "How does the rotation period relate to stellar age?"
Extracted Concepts: ['rotation', 'period', 'stellar', 'age', 'rotational period', 'stellar lifetime']
```

### 2. **Remote Concept Expansion**

Expands concepts through the concept hierarchy to find remotely related concepts:
- **Children**: More specific concepts
- **Siblings**: Related concepts at same level
- **Related**: Conceptually related terms
- **Parents**: More general concepts

**Example:**
```
Input: ['velocity']
Expanded: ['velocity', 'orbital velocity', 'rotational velocity', 'escape velocity', 
          'motion', 'acceleration', 'momentum', 'angular momentum', ...]
```

### 3. **Flexible Formula Matching**

Finds formulas that match concepts through:
- **Direct matches**: Exact concept matches (highest score)
- **Partial matches**: Substring/concept word matches (medium score)
- **Remote matches**: Hierarchically related concepts (lower but still valid)
- **Semantic matches**: Using semantic search system

**Example:**
```
Question: "What determines how fast a planet orbits?"
Concepts: ['orbital', 'velocity', 'period']
Matches:
- kepler_third_law (direct: orbital, period)
- orbital_velocity (direct: orbital velocity)
- escape_velocity (remote: velocity sibling)
- vis_viva (remote: orbital energy related)
```

### 4. **Multi-Layer Matching**

The system uses multiple matching strategies:

1. **Concept Matching**: Direct and remote concept matching
2. **Semantic Matching**: Uses existing semantic search system
3. **Keyword Matching**: Matches keywords and descriptions
4. **Structure Matching**: Analyzes formula structure

## 🔧 Technical Implementation

### Concept Matching System

```javascript
conceptMatchingSystem = {
    // Extract concepts from question
    extractConceptsFromQuestion(questionText) {
        // Analyzes question for:
        // - Concept hierarchy terms
        // - Common astrophysics terms
        // - Formula concepts
        // Returns: Array of extracted concepts
    },
    
    // Expand concepts remotely
    expandConceptsRemotely(concepts) {
        // Uses concept hierarchy to find:
        // - Children (more specific)
        // - Siblings (related at same level)
        // - Related (conceptually related)
        // - Parents (more general)
        // Returns: Expanded concept array
    },
    
    // Find formulas matching concepts
    findFormulasByConcepts(concepts, includeRemote = true) {
        // Matches formulas by:
        // - Direct concept matches (score: 10)
        // - Partial matches (score: 5)
        // - Keyword matches (score: 3)
        // - Name/description matches (score: 2)
        // Returns: Sorted array of matched formulas with scores
    },
    
    // Semantic matching
    findFormulasSemantically(questionText) {
        // Uses semanticSearchSystem for:
        // - Semantic similarity
        // - Synonym expansion
        // - Contextual matching
        // Returns: Sorted array of semantically matched formulas
    }
}
```

### Main Function

```javascript
findFormulasForQuestion(questionText) {
    // 1. Extract concepts from question
    // 2. Expand concepts remotely
    // 3. Find formulas by concepts (direct + remote)
    // 4. Find formulas by semantic matching
    // 5. Combine and deduplicate results
    // 6. Sort by score
    // Returns: Array of matched formulas with scores and match types
}
```

## 📊 Usage Examples

### Example 1: Direct Concept Match

**Question:** "What is the orbital period of a binary system?"

**Process:**
1. Extract concepts: `['orbital', 'period', 'binary', 'system']`
2. Expand: `['orbital period', 'kepler', 'semi-major axis', 'mass', ...]`
3. Match formulas:
   - `binary_white_dwarf` (direct: binary, orbital, period) - Score: 30
   - `kepler_third_law_binary` (direct: orbital, period, binary) - Score: 30
   - `kepler_third_law` (remote: orbital, period) - Score: 20

**Result:** Top matches are binary orbital formulas with high confidence.

### Example 2: Remote Concept Match

**Question:** "How does stellar rotation affect spectral lines?"

**Process:**
1. Extract concepts: `['stellar', 'rotation', 'spectral', 'lines']`
2. Expand: `['rotational velocity', 'rotational period', 'doppler', 'spectroscopy', ...]`
3. Match formulas:
   - `radial_velocity_wavelength` (remote: doppler, spectroscopy) - Score: 15
   - `rotational_velocity` (direct: rotation, velocity) - Score: 20
   - `doppler_shift` (remote: doppler, spectral) - Score: 12

**Result:** Finds formulas related to rotation and spectroscopy even though question doesn't mention "velocity" directly.

### Example 3: Semantic Match

**Question:** "Explain the relationship between mass and luminosity in stars"

**Process:**
1. Extract concepts: `['mass', 'luminosity', 'stellar', 'stars']`
2. Semantic matching finds:
   - `mass_luminosity_relation` (semantic: mass-luminosity) - Score: 25
   - `luminosity` (semantic: luminosity) - Score: 15
   - `stellar_lifetime` (semantic: mass, luminosity, stellar) - Score: 12

**Result:** Semantic matching finds the exact formula even with different wording.

## 🎓 Integration with FRQ Support

The concept matching system integrates with FRQ support:

1. **Question Analysis**: Extracts concepts when generating hints
2. **Related Concepts**: Shows remotely related concepts in hints
3. **Formula Discovery**: Helps find relevant formulas for any question
4. **Confidence Scoring**: Uses concept matches to boost confidence

### Enhanced Hints

When generating contextual hints, the system now includes:

```javascript
{
    problemType: 'Time/Period Problem',
    keyConcepts: ['orbital period', 'kepler', 'semi-major axis'],
    relatedConcepts: [
        'orbital velocity',      // sibling
        'rotational period',     // sibling
        'period',                // parent
        'kepler third law',      // related
        'semi-major axis',       // related
        'mass',                  // related
        'orbital energy'         // related
    ],
    approach: [...],
    checkpoints: [...]
}
```

## 🔍 Concept Hierarchy Integration

The system uses the existing concept hierarchy from `ui.js`:

- **Level 0**: Fundamental Physics
- **Level 1**: Major categories (motion, energy, force, distance, period)
- **Level 2**: Specific concepts (orbital velocity, escape velocity)
- **Level 3**: Detailed concepts (orbital period, rotational period)
- **Level 4**: Very specific concepts (Roche limit)

**Expansion Strategy:**
- Expands up to 2 levels up (parents)
- Expands 1 level down (children)
- Includes all siblings
- Includes all related concepts

## ✅ Benefits

1. **Universal Coverage**: Works with ANY astrophysics question
2. **Remote Matching**: Finds formulas even with remotely related concepts
3. **Flexible**: Handles different phrasings and terminology
4. **Comprehensive**: Uses multiple matching strategies
5. **Intelligent**: Expands concepts through hierarchies

## 🚀 Usage

### In Code

```javascript
// Find formulas for any question
const results = findFormulasForQuestion("How does mass affect orbital period?");

results.forEach(result => {
    console.log(`${result.formula.name}: ${result.score} (${result.matchType})`);
});

// Extract concepts from question
const concepts = conceptMatchingSystem.extractConceptsFromQuestion(
    "Explain stellar evolution"
);

// Expand concepts remotely
const expanded = conceptMatchingSystem.expandConceptsRemotely(concepts);
```

### In UI

The system automatically:
- Extracts concepts when user searches
- Expands concepts remotely
- Matches formulas with remote concepts
- Shows related concepts in hints
- Boosts confidence for concept matches

## 📝 Result

**The system now works with ANY astrophysics question that uses ANY concept remotely**, providing intelligent formula matching and comprehensive FRQ support for all questions, regardless of how concepts are phrased or how remotely they're related.

