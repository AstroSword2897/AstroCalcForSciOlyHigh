# Application Problem Support

## 🎯 Overview

The FRQ support system now handles **application-based and multi-step problems**, not just straightforward "what is X" questions. The system analyzes problem types, extracts relationships, and provides step-by-step guidance for complex scenarios.

## ✨ Key Features

### 1. **Question Type Analysis**

The system automatically detects:
- **Application Problems**: Questions requiring derivation, expression creation, or multi-step reasoning
- **Multi-Step Problems**: Problems with scenarios, conditions, or multiple parts
- **Relationship Problems**: Questions asking to express one variable "in terms of" another
- **Expression Problems**: Questions asking for "simplified expressions"

**Example Detection:**
```
Question: "Provide a simplified expression for the inclination in terms of orbital distance"
Detected:
- isApplication: true
- requiresExpression: true
- relationshipType: 'in_terms_of'
- targetVariable: 'inclination'
- sourceVariable: 'orbital distance'
```

### 2. **Scenario Understanding**

For scenario-based questions, the system:
- Extracts key information from the scenario
- Identifies implied conditions (e.g., "all three members line up" = edge-on transit)
- Maps scenario descriptions to physical conditions

**Example:**
```
Scenario: "all three members of the system were to line up with the planet in front"
Interpreted: Edge-on transit, inclination i = 90°, maximum transit depth
```

### 3. **Relationship Extraction**

The system extracts relationships from questions:
- **"in terms of"**: Expresses one variable as a function of another
- **"as a function of"**: Creates functional relationships
- **"relate X to Y"**: Establishes connections between variables

**Example:**
```
Question: "express inclination in terms of orbital distance"
Extracted:
- targetVariable: 'inclination'
- sourceVariable: 'orbital distance'
- Guidance: Start with base formula, rearrange algebraically
```

### 4. **Multi-Step Problem Guidance**

For multi-step problems, the system provides:
- Step-by-step breakdown
- Intermediate result identification
- Sequential calculation guidance
- Final expression simplification

## 📊 Example: Transit Depth Application Problem

### Question
"The transit depth if all three members of the system were to line up with the planet in front is 0.6. Provide a simplified expression for the inclination of the planet in terms of its orbital distance."

### System Analysis

**Question Type Detection:**
```javascript
{
    isApplication: true,
    isMultiStep: true,
    requiresExpression: true,
    hasScenario: true,
    relationshipType: 'in_terms_of',
    targetVariable: 'inclination',
    sourceVariable: 'orbital distance'
}
```

**Problem Type:** Expression Derivation Problem

**Key Concepts Extracted:**
- transit depth
- inclination
- orbital distance
- transit geometry
- edge-on transit (from scenario)

### Generated Instructions

**Step 1: Identify Known and Unknown Variables**
- Known: Transit depth δ = 0.6 (edge-on, maximum)
- Unknown: Inclination i
- Target: Express i in terms of orbital distance a

**Step 2: Understand the Scenario**
- "All three members line up" = Edge-on transit (i = 90°)
- Maximum transit depth: δ_max = 0.6 = (Rp/Rs)²
- For inclined orbits: δ_obs = δ_max × cos²(i)

**Step 3: Create the Relationship**
- Start with transit depth formula: δ = (Rp/Rs)²
- For inclined orbits: δ_obs = δ_max × cos²(i)
- Relate to orbital geometry using impact parameter
- Express inclination using: cos(i) = b/a, where b is impact parameter
- Combine with transit depth relationship

**Step 4: Simplify the Expression**
- Work through algebra to isolate inclination
- Express in terms of orbital distance
- Simplify to most compact form

### Generated Hints

**Problem Type:** Expression Derivation Problem

**Approach:**
1. Extract key information from the scenario description
2. Identify what conditions are implied (edge-on transit, i=90°)
3. Start with the base formula and rearrange to express inclination in terms of orbital distance
4. Substitute known relationships and simplify algebraically
5. Work through the algebra step-by-step to derive the expression
6. Simplify to the most compact form possible

**Key Concepts:**
- Transit depth
- Orbital inclination
- Transit geometry
- Impact parameter
- Orbital distance

**Checkpoints:**
- Verify that the expression has the correct variables
- Check that units are consistent
- Ensure the expression makes physical sense (inclination between 0° and 90°)

## 🔧 Technical Implementation

### Question Analysis Function

```javascript
analyzeQuestionType(questionText) {
    // Detects:
    // - Application problems (provide, derive, show that, etc.)
    // - Multi-step problems (if, given that, suppose, etc.)
    // - Expression requirements (simplified expression, expression for)
    // - Relationships (in terms of, as a function of, relate)
    // - Scenario descriptions (all three, line up, in front)
    // - Target and source variables
}
```

### Enhanced Instruction Generation

```javascript
generateUsageInstructions(formula, questionContext) {
    // Analyzes question type
    // Adds scenario understanding step
    // Adds relationship creation step
    // Adds expression simplification step
    // Provides multi-step guidance
}
```

### Enhanced Hint Generation

```javascript
generateContextualHints(formula, questionText) {
    // Detects application problem types
    // Adds application-specific approach steps
    // Provides relationship guidance
    // Includes scenario interpretation
}
```

## 📝 Supported Question Types

### 1. Direct Questions
- "What is the orbital period?"
- "Calculate the escape velocity"
- **Handled by:** Standard instruction generation

### 2. Application Questions
- "Provide a simplified expression for..."
- "Derive the relationship between..."
- "Show that..."
- **Handled by:** Application analysis + relationship extraction

### 3. Multi-Step Problems
- "If all three members line up..."
- "Given that the transit depth is..."
- "Suppose the system has..."
- **Handled by:** Scenario understanding + step-by-step guidance

### 4. Relationship Problems
- "Express X in terms of Y"
- "Relate A to B"
- "As a function of..."
- **Handled by:** Relationship extraction + algebraic guidance

## ✅ Benefits

1. **Comprehensive Coverage**: Handles both direct and application questions
2. **Scenario Understanding**: Interprets complex problem descriptions
3. **Relationship Extraction**: Identifies and guides variable relationships
4. **Multi-Step Support**: Breaks down complex problems into steps
5. **Expression Guidance**: Helps derive and simplify expressions

## 🚀 Usage

The system automatically:
- Detects application problems from question text
- Analyzes scenarios and extracts conditions
- Provides appropriate step-by-step guidance
- Generates hints for relationship problems
- Guides expression derivation and simplification

**No configuration needed** - works automatically for all formulas and question types!

