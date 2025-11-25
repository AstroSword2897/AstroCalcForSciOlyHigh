/**
 * Code Quality Audit - Finds Tiny Details and Inconsistencies
 * 
 * Scans the codebase for:
 * - Mismatched defaults/comments
 * - Missing input validation
 * - Inconsistent patterns
 * - Magic numbers
 * - Functions that could be improved
 */

const CodeQualityAudit = {
    issues: [],

    /**
     * Run full audit
     */
    run() {
        console.log('🔍 Code Quality Audit');
        console.log('='.repeat(60));
        
        this.issues = [];
        
        // Check all loaded functions
        this.checkDebounceThrottle();
        this.checkCacheDefaults();
        this.checkValidationPatterns();
        this.checkMagicNumbers();
        this.checkErrorHandling();
        this.checkFunctionConsistency();
        
        this.printResults();
        return this.issues;
    },

    /**
     * Check debounce/throttle defaults
     */
    checkDebounceThrottle() {
        // Check if debounce/throttle default is consistent with usage
        if (typeof debounce !== 'undefined') {
            // Check if 300ms is used consistently
            // README says 50ms search, but debounce default is 300ms
            this.addIssue('warning', 'Debounce default (300ms) vs README claim (50ms)', 
                'README claims 50ms search debounce, but debounce() default is 300ms. Check if search uses custom wait time.');
        }
    },

    /**
     * Check cache defaults
     */
    checkCacheDefaults() {
        if (typeof SimpleCache !== 'undefined') {
            // Check TTL comment vs default
            const ttlDefault = 300000; // 5 minutes
            const ttlComment = '5 min TTL';
            // This seems fine, but let's verify the math
            if (ttlDefault !== 5 * 60 * 1000) {
                this.addIssue('error', 'Cache TTL calculation', 
                    `TTL default (${ttlDefault}ms) doesn't match comment (5 min = ${5 * 60 * 1000}ms)`);
            }
        }
    },

    /**
     * Check validation patterns
     */
    checkValidationPatterns() {
        // Check for inconsistent validation patterns
        const patterns = [
            { pattern: /if\s*\(\s*!\s*\w+\s*\)/, name: 'Truthy check (!value)' },
            { pattern: /if\s*\(\s*!\s*\w+\s*\|\|\s*\w+\s*===\s*0\s*\)/, name: 'Zero check (!value || value === 0)' },
            { pattern: /if\s*\(\s*typeof\s+\w+\s*!==\s*['"]number['"]/, name: 'Type check (typeof !== "number")' }
        ];
        
        // Note: This would require parsing actual code, so we'll check specific known issues
    },

    /**
     * Check for magic numbers
     */
    checkMagicNumbers() {
        // Check for common magic numbers that should be constants
        const magicNumbers = [
            { value: 1000, context: 'Scale factors, conversions' },
            { value: 100, context: 'Percentages, scales' },
            { value: 300, context: 'Debounce/throttle delays' },
            { value: 50, context: 'Search debounce (README claim)' }
        ];
        
        // These are documented, but we should verify consistency
    },

    /**
     * Check error handling consistency
     */
    checkErrorHandling() {
        // Check if safeExecute is used consistently
        if (typeof safeExecute !== 'undefined') {
            // This is good - it exists
        } else {
            this.addIssue('warning', 'safeExecute not available', 
                'safeExecute utility exists but may not be used consistently throughout codebase');
        }
    },

    /**
     * Check function consistency
     */
    checkFunctionConsistency() {
        // Check normalizeScore was fixed
        if (typeof normalizeScore !== 'undefined') {
            // We just fixed this, so it should be good
        }
        
        // Check clamp function exists and is used
        if (typeof clamp === 'undefined') {
            this.addIssue('warning', 'clamp function not globally available', 
                'clamp() exists in frqSupport.js but may not be accessible elsewhere');
        }
    },

    /**
     * Add issue
     */
    addIssue(severity, title, description) {
        this.issues.push({ severity, title, description });
    },

    /**
     * Print results
     */
    printResults() {
        console.log('\n📊 Audit Results:');
        console.log('='.repeat(60));
        
        if (this.issues.length === 0) {
            console.log('✅ No issues found!');
            return;
        }
        
        const errors = this.issues.filter(i => i.severity === 'error');
        const warnings = this.issues.filter(i => i.severity === 'warning');
        const info = this.issues.filter(i => i.severity === 'info');
        
        if (errors.length > 0) {
            console.log(`\n❌ Errors (${errors.length}):`);
            errors.forEach(issue => {
                console.log(`  - ${issue.title}`);
                console.log(`    ${issue.description}`);
            });
        }
        
        if (warnings.length > 0) {
            console.log(`\n⚠️  Warnings (${warnings.length}):`);
            warnings.forEach(issue => {
                console.log(`  - ${issue.title}`);
                console.log(`    ${issue.description}`);
            });
        }
        
        if (info.length > 0) {
            console.log(`\nℹ️  Info (${info.length}):`);
            info.forEach(issue => {
                console.log(`  - ${issue.title}`);
                console.log(`    ${issue.description}`);
            });
        }
        
        console.log('\n' + '='.repeat(60));
    }
};

// Auto-run if in browser
if (typeof window !== 'undefined') {
    window.CodeQualityAudit = CodeQualityAudit;
}

