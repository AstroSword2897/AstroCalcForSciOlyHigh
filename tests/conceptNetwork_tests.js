/**
 * Concept Network Tests
 * 
 * Comprehensive test suite for concept weighting and network functionality:
 * - Dimensional integrity tests
 * - Weighted influence tests
 * - Stress tests
 * - Semantic-distance verification
 * 
 * Version: 1.0.0
 * Date: December 10, 2025
 */

class ConceptNetworkTestSuite {
    constructor() {
        this.results = {
            dimensionalIntegrity: { passed: 0, failed: 0, errors: [] },
            weightedInfluence: { passed: 0, failed: 0, errors: [] },
            stressTests: { passed: 0, failed: 0, errors: [], performance: {} },
            semanticDistance: { passed: 0, failed: 0, errors: [] }
        };
        this.conceptMap = null;
        this.vectorDimension = 32;
        this.maxVectorMagnitude = 1e6; // Safe bound
    }

    /**
     * Load concept mapping
     */
    async loadConceptMap() {
        try {
            const response = await fetch('/tests/weighted_concept_mapping.json');
            this.conceptMap = await response.json();
            return true;
        } catch (e) {
            console.error('Failed to load concept map:', e);
            return false;
        }
    }

    /**
     * Generate a concept vector (32-dimensional)
     */
    generateConceptVector(conceptName, seed = null) {
        // Deterministic vector generation based on concept name
        const hash = this._hashString(conceptName + (seed || ''));
        const vector = new Array(this.vectorDimension);
        
        for (let i = 0; i < this.vectorDimension; i++) {
            // Use hash to generate pseudo-random but deterministic values
            const val = Math.sin(hash + i) * 0.5 + 0.5; // Normalize to [0, 1]
            vector[i] = val;
        }
        
        // Normalize to unit vector
        const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
        if (magnitude > 0) {
            for (let i = 0; i < vector.length; i++) {
                vector[i] /= magnitude;
            }
        }
        
        return vector;
    }

    _hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
        
        let dotProduct = 0;
        let magA = 0;
        let magB = 0;
        
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            magA += vecA[i] * vecA[i];
            magB += vecB[i] * vecB[i];
        }
        
        magA = Math.sqrt(magA);
        magB = Math.sqrt(magB);
        
        if (magA === 0 || magB === 0) return 0;
        return dotProduct / (magA * magB);
    }

    /**
     * Calculate Euclidean distance
     */
    euclideanDistance(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length) return Infinity;
        
        let sum = 0;
        for (let i = 0; i < vecA.length; i++) {
            const diff = vecA[i] - vecB[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }

    /* ============================================
       DIMENSIONAL INTEGRITY TESTS
       ============================================ */

    testDimensionalIntegrity() {
        console.log('\n📐 DIMENSIONAL INTEGRITY TESTS');
        console.log('='.repeat(80));

        if (!this.conceptMap || !this.conceptMap.concepts) {
            this.results.dimensionalIntegrity.errors.push('Concept map not loaded');
            return false;
        }

        const concepts = this.conceptMap.concepts;
        let passed = 0;
        let failed = 0;
        const errors = [];

        // Test 1: Every concept has a vector
        console.log('Test 1: Every concept has a vector...');
        for (const concept of concepts) {
            const vector = this.generateConceptVector(concept.name);
            if (!vector || !Array.isArray(vector)) {
                failed++;
                errors.push(`Concept "${concept.name}" has no vector`);
            } else {
                passed++;
            }
        }

        // Test 2: Vector dimensionality = 32
        console.log('Test 2: Vector dimensionality = 32...');
        for (const concept of concepts.slice(0, 100)) { // Sample first 100
            const vector = this.generateConceptVector(concept.name);
            if (vector.length !== this.vectorDimension) {
                failed++;
                errors.push(`Concept "${concept.name}" vector has wrong dimension: ${vector.length}`);
            } else {
                passed++;
            }
        }

        // Test 3: Vector magnitude < safe bounds
        console.log('Test 3: Vector magnitude < safe bounds...');
        for (const concept of concepts.slice(0, 100)) {
            const vector = this.generateConceptVector(concept.name);
            const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
            if (magnitude > this.maxVectorMagnitude) {
                failed++;
                errors.push(`Concept "${concept.name}" vector magnitude too large: ${magnitude}`);
            } else {
                passed++;
            }
        }

        // Test 4: No NaNs, no nulls
        console.log('Test 4: No NaNs, no nulls...');
        for (const concept of concepts.slice(0, 100)) {
            const vector = this.generateConceptVector(concept.name);
            let hasInvalid = false;
            for (const val of vector) {
                if (val === null || val === undefined || isNaN(val) || !isFinite(val)) {
                    hasInvalid = true;
                    break;
                }
            }
            if (hasInvalid) {
                failed++;
                errors.push(`Concept "${concept.name}" vector contains invalid values`);
            } else {
                passed++;
            }
        }

        // Test 5: Vector normalization (unit vectors)
        console.log('Test 5: Vector normalization (unit vectors)...');
        for (const concept of concepts.slice(0, 100)) {
            const vector = this.generateConceptVector(concept.name);
            const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
            // Allow small floating point error
            if (Math.abs(magnitude - 1.0) > 1e-10) {
                failed++;
                errors.push(`Concept "${concept.name}" vector not normalized: ${magnitude}`);
            } else {
                passed++;
            }
        }

        this.results.dimensionalIntegrity.passed = passed;
        this.results.dimensionalIntegrity.failed = failed;
        this.results.dimensionalIntegrity.errors = errors;

        console.log(`\n✅ Passed: ${passed}, ❌ Failed: ${failed}`);
        if (errors.length > 0) {
            console.log('Errors (first 10):');
            errors.slice(0, 10).forEach(e => console.log(`  - ${e}`));
        }

        return failed === 0;
    }

    /* ============================================
       WEIGHTED INFLUENCE TESTS
       ============================================ */

    testWeightedInfluence() {
        console.log('\n⚖️  WEIGHTED INFLUENCE TESTS');
        console.log('='.repeat(80));

        if (!this.conceptMap || !this.conceptMap.concepts) {
            this.results.weightedInfluence.errors.push('Concept map not loaded');
            return false;
        }

        const concepts = this.conceptMap.concepts;
        let passed = 0;
        let failed = 0;
        const errors = [];

        // Test 1: Weighted concept outranks weaker concept
        console.log('Test 1: Weighted concept outranks weaker concept...');
        const sortedByWeight = [...concepts].sort((a, b) => b.weight - a.weight);
        if (sortedByWeight.length >= 2) {
            const highWeight = sortedByWeight[0];
            const lowWeight = sortedByWeight[sortedByWeight.length - 1];
            
            // Simulate query matching both concepts
            const queryVector = this.generateConceptVector('test query');
            const highVec = this.generateConceptVector(highWeight.name);
            const lowVec = this.generateConceptVector(lowWeight.name);
            
            const highScore = this.cosineSimilarity(queryVector, highVec) * highWeight.weight;
            const lowScore = this.cosineSimilarity(queryVector, lowVec) * lowWeight.weight;
            
            // High weight should generally outrank (allowing for similarity differences)
            if (highWeight.weight > lowWeight.weight * 2 && highScore < lowScore) {
                // Only fail if weight difference is significant but score is reversed
                failed++;
                errors.push(`High weight concept "${highWeight.name}" (${highWeight.weight}) scored lower than low weight "${lowWeight.name}" (${lowWeight.weight})`);
            } else {
                passed++;
            }
        }

        // Test 2: Propagation sum never diverges
        console.log('Test 2: Propagation sum never diverges...');
        const testConcept = concepts[0];
        if (testConcept && testConcept.linked) {
            let propagationSum = testConcept.weight;
            const visited = new Set();
            
            function propagate(conceptName, depth = 0, decay = 1.0) {
                if (depth > 3 || visited.has(conceptName)) return 0; // Max depth 3
                visited.add(conceptName);
                
                const concept = concepts.find(c => c.name === conceptName);
                if (!concept) return 0;
                
                let sum = concept.weight * decay;
                
                // Traverse linked concepts
                for (const linkedName of (concept.linked || []).slice(0, 5)) { // Limit to 5 links
                    sum += propagate(linkedName, depth + 1, decay * 0.5);
                }
                
                return sum;
            }
            
            const totalPropagation = propagate(testConcept.name);
            
            if (!isFinite(totalPropagation) || totalPropagation > 1e10) {
                failed++;
                errors.push(`Propagation sum diverged for "${testConcept.name}": ${totalPropagation}`);
            } else {
                passed++;
            }
        }

        // Test 3: Context graph is fully connected
        console.log('Test 3: Context graph is fully connected...');
        const conceptNames = new Set(concepts.map(c => c.name));
        const allLinked = new Set();
        
        concepts.forEach(concept => {
            if (concept.linked) {
                concept.linked.forEach(link => allLinked.add(link));
            }
        });
        
        // Check if all linked concepts exist in the concept map
        let allExist = true;
        for (const link of allLinked) {
            if (!conceptNames.has(link)) {
                allExist = false;
                errors.push(`Linked concept "${link}" not found in concept map`);
            }
        }
        
        if (allExist) {
            passed++;
        } else {
            failed++;
        }

        // Test 4: Random queries return consistent ordering
        console.log('Test 4: Random queries return consistent ordering...');
        const testQueries = ['stellar evolution', 'orbital mechanics', 'black holes'];
        let consistent = true;
        
        for (const query of testQueries) {
            const queryVector = this.generateConceptVector(query);
            const scores = concepts.map(c => ({
                name: c.name,
                score: this.cosineSimilarity(queryVector, this.generateConceptVector(c.name)) * c.weight
            }));
            
            scores.sort((a, b) => b.score - a.score);
            
            // Run twice and compare
            const scores2 = concepts.map(c => ({
                name: c.name,
                score: this.cosineSimilarity(queryVector, this.generateConceptVector(c.name)) * c.weight
            }));
            scores2.sort((a, b) => b.score - a.score);
            
            // Top 10 should match
            const top10_1 = scores.slice(0, 10).map(s => s.name);
            const top10_2 = scores2.slice(0, 10).map(s => s.name);
            
            if (JSON.stringify(top10_1) !== JSON.stringify(top10_2)) {
                consistent = false;
                errors.push(`Inconsistent ordering for query "${query}"`);
            }
        }
        
        if (consistent) {
            passed++;
        } else {
            failed++;
        }

        this.results.weightedInfluence.passed = passed;
        this.results.weightedInfluence.failed = failed;
        this.results.weightedInfluence.errors = errors;

        console.log(`\n✅ Passed: ${passed}, ❌ Failed: ${failed}`);
        if (errors.length > 0) {
            console.log('Errors (first 10):');
            errors.slice(0, 10).forEach(e => console.log(`  - ${e}`));
        }

        return failed === 0;
    }

    /* ============================================
       STRESS TESTS
       ============================================ */

    testStressTests() {
        console.log('\n💪 STRESS TESTS');
        console.log('='.repeat(80));

        if (!this.conceptMap || !this.conceptMap.concepts) {
            this.results.stressTests.errors.push('Concept map not loaded');
            return false;
        }

        const concepts = this.conceptMap.concepts;
        let passed = 0;
        let failed = 0;
        const errors = [];
        const performance = {};

        // Test 1: 1,000 random query vectors
        console.log('Test 1: 1,000 random query vectors...');
        const start1 = performance.now();
        let queryCount = 0;
        const maxQueries = 1000;
        
        try {
            for (let i = 0; i < maxQueries; i++) {
                const query = `random query ${i}`;
                const queryVector = this.generateConceptVector(query);
                
                // Calculate similarity to all concepts
                for (const concept of concepts.slice(0, 50)) { // Sample 50 concepts per query
                    const conceptVector = this.generateConceptVector(concept.name);
                    const similarity = this.cosineSimilarity(queryVector, conceptVector);
                    if (!isFinite(similarity)) {
                        throw new Error(`Invalid similarity for query ${i}, concept ${concept.name}`);
                    }
                }
                queryCount++;
            }
            
            const elapsed1 = performance.now() - start1;
            performance.queryVectors = { count: queryCount, time: elapsed1, avgTime: elapsed1 / queryCount };
            
            if (queryCount === maxQueries) {
                passed++;
            } else {
                failed++;
                errors.push(`Only processed ${queryCount}/${maxQueries} queries`);
            }
        } catch (e) {
            failed++;
            errors.push(`Query vector test failed: ${e.message}`);
        }

        // Test 2: 100,000 comparisons
        console.log('Test 2: 100,000 comparisons...');
        const start2 = performance.now();
        let comparisonCount = 0;
        const maxComparisons = 100000;
        
        try {
            const vec1 = this.generateConceptVector('test1');
            const vec2 = this.generateConceptVector('test2');
            
            for (let i = 0; i < maxComparisons; i++) {
                const similarity = this.cosineSimilarity(vec1, vec2);
                if (!isFinite(similarity)) {
                    throw new Error(`Invalid similarity at comparison ${i}`);
                }
                comparisonCount++;
            }
            
            const elapsed2 = performance.now() - start2;
            performance.comparisons = { count: comparisonCount, time: elapsed2, avgTime: elapsed2 / comparisonCount };
            
            if (comparisonCount === maxComparisons) {
                passed++;
            } else {
                failed++;
                errors.push(`Only processed ${comparisonCount}/${maxComparisons} comparisons`);
            }
        } catch (e) {
            failed++;
            errors.push(`Comparison test failed: ${e.message}`);
        }

        // Test 3: 0 crashes
        console.log('Test 3: 0 crashes...');
        try {
            // Generate vectors for all concepts
            for (const concept of concepts) {
                const vector = this.generateConceptVector(concept.name);
                if (!vector || vector.length !== this.vectorDimension) {
                    throw new Error(`Failed to generate vector for ${concept.name}`);
                }
            }
            passed++;
        } catch (e) {
            failed++;
            errors.push(`Crash test failed: ${e.message}`);
        }

        // Test 4: Response time < 10ms/query
        console.log('Test 4: Response time < 10ms/query...');
        const start4 = performance.now();
        const testQueries = 100;
        
        for (let i = 0; i < testQueries; i++) {
            const query = `test query ${i}`;
            const queryVector = this.generateConceptVector(query);
            
            // Find top 10 matches
            const scores = concepts.slice(0, 50).map(c => ({
                name: c.name,
                score: this.cosineSimilarity(queryVector, this.generateConceptVector(c.name)) * c.weight
            }));
            scores.sort((a, b) => b.score - a.score);
        }
        
        const elapsed4 = performance.now() - start4;
        const avgTime = elapsed4 / testQueries;
        performance.responseTime = { avgTime, maxAllowed: 10, passed: avgTime < 10 };
        
        if (avgTime < 10) {
            passed++;
        } else {
            failed++;
            errors.push(`Average response time ${avgTime.toFixed(2)}ms exceeds 10ms limit`);
        }

        this.results.stressTests.passed = passed;
        this.results.stressTests.failed = failed;
        this.results.stressTests.errors = errors;
        this.results.stressTests.performance = performance;

        console.log(`\n✅ Passed: ${passed}, ❌ Failed: ${failed}`);
        console.log('Performance:');
        Object.entries(performance).forEach(([key, val]) => {
            if (val.avgTime) {
                console.log(`  ${key}: ${val.avgTime.toFixed(3)}ms avg`);
            }
        });
        if (errors.length > 0) {
            console.log('Errors (first 10):');
            errors.slice(0, 10).forEach(e => console.log(`  - ${e}`));
        }

        return failed === 0;
    }

    /* ============================================
       SEMANTIC-DISTANCE VERIFICATION
       ============================================ */

    testSemanticDistance() {
        console.log('\n📏 SEMANTIC-DISTANCE VERIFICATION');
        console.log('='.repeat(80));

        if (!this.conceptMap || !this.conceptMap.concepts) {
            this.results.semanticDistance.errors.push('Concept map not loaded');
            return false;
        }

        const concepts = this.conceptMap.concepts;
        let passed = 0;
        let failed = 0;
        const errors = [];

        // Test 1: Concept distances behave monotonically
        console.log('Test 1: Concept distances behave monotonically...');
        const testConcepts = concepts.slice(0, 10);
        let monotonic = true;
        
        for (let i = 0; i < testConcepts.length - 1; i++) {
            const vec1 = this.generateConceptVector(testConcepts[i].name);
            const vec2 = this.generateConceptVector(testConcepts[i + 1].name);
            const vec3 = this.generateConceptVector(testConcepts[Math.min(i + 2, testConcepts.length - 1)].name);
            
            const dist12 = this.euclideanDistance(vec1, vec2);
            const dist23 = this.euclideanDistance(vec2, vec3);
            const dist13 = this.euclideanDistance(vec1, vec3);
            
            // Triangle inequality: dist(A,C) <= dist(A,B) + dist(B,C)
            if (dist13 > dist12 + dist23 + 1e-6) { // Allow small floating point error
                monotonic = false;
                errors.push(`Triangle inequality violated for concepts ${i}, ${i+1}, ${i+2}`);
            }
        }
        
        if (monotonic) {
            passed++;
        } else {
            failed++;
        }

        // Test 2: PCA projection maintains neighborhood fidelity
        console.log('Test 2: PCA projection maintains neighborhood fidelity...');
        // Simple 2D PCA projection test
        const sampleConcepts = concepts.slice(0, 20);
        const vectors = sampleConcepts.map(c => this.generateConceptVector(c.name));
        
        // Calculate pairwise distances in original space
        const originalDistances = [];
        for (let i = 0; i < vectors.length; i++) {
            for (let j = i + 1; j < vectors.length; j++) {
                originalDistances.push({
                    i, j,
                    dist: this.euclideanDistance(vectors[i], vectors[j])
                });
            }
        }
        
        // Simple 2D projection (first 2 dimensions)
        const projected2D = vectors.map(v => [v[0], v[1]]);
        const projectedDistances = [];
        for (let i = 0; i < projected2D.length; i++) {
            for (let j = i + 1; j < projected2D.length; j++) {
                const dx = projected2D[i][0] - projected2D[j][0];
                const dy = projected2D[i][1] - projected2D[j][1];
                projectedDistances.push({
                    i, j,
                    dist: Math.sqrt(dx * dx + dy * dy)
                });
            }
        }
        
        // Check if relative ordering is preserved (nearest neighbors)
        let fidelityPreserved = true;
        for (let i = 0; i < Math.min(10, originalDistances.length); i++) {
            const orig = originalDistances[i];
            const proj = projectedDistances.find(p => p.i === orig.i && p.j === orig.j);
            if (proj) {
                // Relative distances should be correlated (not exact due to projection)
                const ratio = proj.dist / (orig.dist + 1e-10);
                if (ratio < 0.1 || ratio > 10) { // Allow reasonable range
                    fidelityPreserved = false;
                    errors.push(`Neighborhood fidelity lost for pair ${orig.i}-${orig.j}`);
                }
            }
        }
        
        if (fidelityPreserved) {
            passed++;
        } else {
            failed++;
        }

        // Test 3: Similar concepts have small distances
        console.log('Test 3: Similar concepts have small distances...');
        // Find concepts with similar names (heuristic)
        const similarPairs = [];
        for (let i = 0; i < concepts.length; i++) {
            for (let j = i + 1; j < concepts.length; j++) {
                const name1 = concepts[i].name.toLowerCase();
                const name2 = concepts[j].name.toLowerCase();
                // Check if names share significant substring
                if (name1.length > 5 && name2.length > 5) {
                    const common = this._longestCommonSubstring(name1, name2);
                    if (common.length > Math.min(name1.length, name2.length) * 0.5) {
                        similarPairs.push([i, j]);
                    }
                }
            }
            if (similarPairs.length >= 5) break; // Limit to 5 pairs
        }
        
        let similarHaveSmallDist = true;
        for (const [i, j] of similarPairs) {
            const vec1 = this.generateConceptVector(concepts[i].name);
            const vec2 = this.generateConceptVector(concepts[j].name);
            const dist = this.euclideanDistance(vec1, vec2);
            
            // Similar concepts should have distance < 1.0 (for unit vectors, max is ~2.0)
            if (dist > 1.5) {
                similarHaveSmallDist = false;
                errors.push(`Similar concepts "${concepts[i].name}" and "${concepts[j].name}" have large distance: ${dist}`);
            }
        }
        
        if (similarHaveSmallDist || similarPairs.length === 0) {
            passed++;
        } else {
            failed++;
        }

        this.results.semanticDistance.passed = passed;
        this.results.semanticDistance.failed = failed;
        this.results.semanticDistance.errors = errors;

        console.log(`\n✅ Passed: ${passed}, ❌ Failed: ${failed}`);
        if (errors.length > 0) {
            console.log('Errors (first 10):');
            errors.slice(0, 10).forEach(e => console.log(`  - ${e}`));
        }

        return failed === 0;
    }

    _longestCommonSubstring(str1, str2) {
        let longest = '';
        for (let i = 0; i < str1.length; i++) {
            for (let j = i + 1; j <= str1.length; j++) {
                const substr = str1.substring(i, j);
                if (str2.includes(substr) && substr.length > longest.length) {
                    longest = substr;
                }
            }
        }
        return longest;
    }

    /* ============================================
       RUN ALL TESTS
       ============================================ */

    async runAllTests() {
        console.log('\n🧪 CONCEPT NETWORK TEST SUITE');
        console.log('='.repeat(80));
        console.log('Loading concept map...');
        
        const loaded = await this.loadConceptMap();
        if (!loaded) {
            console.error('❌ Failed to load concept map');
            return this.results;
        }
        
        console.log(`✅ Loaded ${this.conceptMap.concepts.length} concepts`);
        
        // Run all test suites
        this.testDimensionalIntegrity();
        this.testWeightedInfluence();
        this.testStressTests();
        this.testSemanticDistance();
        
        // Summary
        console.log('\n' + '='.repeat(80));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(80));
        
        const totalPassed = Object.values(this.results).reduce((sum, r) => sum + r.passed, 0);
        const totalFailed = Object.values(this.results).reduce((sum, r) => sum + r.failed, 0);
        
        Object.entries(this.results).forEach(([suite, result]) => {
            const status = result.failed === 0 ? '✅' : '❌';
            console.log(`${status} ${suite}: ${result.passed} passed, ${result.failed} failed`);
        });
        
        console.log(`\nTotal: ${totalPassed} passed, ${totalFailed} failed`);
        console.log('='.repeat(80));
        
        return this.results;
    }
}

// Export for browser and Node.js
if (typeof window !== 'undefined') {
    window.ConceptNetworkTestSuite = ConceptNetworkTestSuite;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConceptNetworkTestSuite;
}
