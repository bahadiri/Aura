import { AIRManifest, Tool } from './types';

/**
 * Validation result for an AIR manifest
 */
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

export interface ValidationError {
    field: string;
    message: string;
    severity: 'critical';
}

export interface ValidationWarning {
    field: string;
    message: string;
    severity: 'warning' | 'info';
}

/**
 * Validation options
 */
export interface ValidationOptions {
    strict?: boolean;  // If true, warnings become errors
    checkTools?: boolean;  // If true, validate MCP tool schemas
    checkState?: boolean;  // If true, validate state schemas
}

/**
 * AIR Manifest Validator
 *
 * Validates AIR manifests against the schema specification.
 * Designed for:
 * - Runtime validation during registration
 * - Developer tooling (CLI validator)
 * - CI/CD quality checks
 */
export class ManifestValidator {
    /**
     * Validate a manifest
     *
     * @param manifest The manifest to validate
     * @param options Validation options
     * @returns Validation result with errors and warnings
     */
    public validate(
        manifest: Partial<AIRManifest>,
        options: ValidationOptions = {}
    ): ValidationResult {
        const { strict = false, checkTools = true, checkState = true } = options;

        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // ========================================
        // CRITICAL VALIDATIONS (Always Errors)
        // ========================================

        // ID is required
        if (!manifest.id || typeof manifest.id !== 'string' || manifest.id.trim() === '') {
            errors.push({
                field: 'id',
                message: 'Manifest must have a non-empty string ID',
                severity: 'critical'
            });
        } else {
            // ID format check
            if (!manifest.id.match(/^[a-z0-9]+(-[a-z0-9]+)*-air$/)) {
                warnings.push({
                    field: 'id',
                    message: 'ID should follow kebab-case pattern and end with "-air"',
                    severity: 'warning'
                });
            }
        }

        // Component is required
        if (!manifest.component) {
            errors.push({
                field: 'component',
                message: 'Manifest must have a React component',
                severity: 'critical'
            });
        }

        // Meta is required
        if (!manifest.meta) {
            errors.push({
                field: 'meta',
                message: 'Manifest must have meta object',
                severity: 'critical'
            });
        } else {
            // Validate meta fields
            if (!manifest.meta.title || manifest.meta.title === '') {
                errors.push({
                    field: 'meta.title',
                    message: 'Meta title is required',
                    severity: 'critical'
                });
            }

            if (!manifest.meta.icon || manifest.meta.icon === '') {
                errors.push({
                    field: 'meta.icon',
                    message: 'Meta icon is required',
                    severity: 'critical'
                });
            }

            if (!manifest.meta.description || manifest.meta.description === '') {
                errors.push({
                    field: 'meta.description',
                    message: 'Meta description is required',
                    severity: 'critical'
                });
            }
        }

        // ========================================
        // DISCOVERY METADATA (Warnings or Errors if Strict)
        // ========================================

        if (manifest.discovery) {
            // Keywords validation
            if (!manifest.discovery.keywords || !Array.isArray(manifest.discovery.keywords)) {
                if (strict) {
                    errors.push({
                        field: 'discovery.keywords',
                        message: 'Discovery keywords should be a non-empty array',
                        severity: 'critical'
                    });
                } else {
                    warnings.push({
                        field: 'discovery.keywords',
                        message: 'Discovery keywords should be a non-empty array',
                        severity: 'warning'
                    });
                }
            } else if (manifest.discovery.keywords.length === 0) {
                warnings.push({
                    field: 'discovery.keywords',
                    message: 'Discovery keywords array is empty - search will not work well',
                    severity: 'warning'
                });
            } else if (manifest.discovery.keywords.length < 3) {
                warnings.push({
                    field: 'discovery.keywords',
                    message: 'Discovery should have at least 3 keywords for better search',
                    severity: 'info'
                });
            }

            // Check if keywords are lowercase
            if (manifest.discovery.keywords) {
                const nonLowercaseKeywords = manifest.discovery.keywords.filter(
                    k => k !== k.toLowerCase()
                );
                if (nonLowercaseKeywords.length > 0) {
                    warnings.push({
                        field: 'discovery.keywords',
                        message: `Keywords should be lowercase: ${nonLowercaseKeywords.join(', ')}`,
                        severity: 'warning'
                    });
                }
            }

            // Category validation
            if (!manifest.discovery.category || manifest.discovery.category === '') {
                if (strict) {
                    errors.push({
                        field: 'discovery.category',
                        message: 'Discovery category is required for categorization',
                        severity: 'critical'
                    });
                } else {
                    warnings.push({
                        field: 'discovery.category',
                        message: 'Discovery category is required for categorization',
                        severity: 'warning'
                    });
                }
            }

            // Priority validation
            if (manifest.discovery.priority !== undefined) {
                const priority = manifest.discovery.priority;
                if (typeof priority !== 'number' || priority < 0 || priority > 100) {
                    warnings.push({
                        field: 'discovery.priority',
                        message: 'Discovery priority should be a number between 0 and 100',
                        severity: 'warning'
                    });
                }
            }
        } else {
            // Discovery metadata missing entirely
            warnings.push({
                field: 'discovery',
                message: 'Missing discovery metadata - AIR will not be searchable',
                severity: 'warning'
            });
        }

        // ========================================
        // STATE SCHEMA (Info/Warnings)
        // ========================================

        if (checkState && manifest.stateSchema) {
            if (!manifest.stateSchema.collection || manifest.stateSchema.collection === '') {
                warnings.push({
                    field: 'stateSchema.collection',
                    message: 'State schema should have a collection name',
                    severity: 'warning'
                });
            }

            if (!manifest.stateSchema.documentId || manifest.stateSchema.documentId === '') {
                warnings.push({
                    field: 'stateSchema.documentId',
                    message: 'State schema should have a documentId',
                    severity: 'warning'
                });
            }

            if (!manifest.stateSchema.schema || typeof manifest.stateSchema.schema !== 'object') {
                warnings.push({
                    field: 'stateSchema.schema',
                    message: 'State schema should have a schema object',
                    severity: 'warning'
                });
            }
        }

        // ========================================
        // MCP TOOLS (Warnings/Info)
        // ========================================

        if (checkTools && manifest.tools) {
            if (!Array.isArray(manifest.tools)) {
                errors.push({
                    field: 'tools',
                    message: 'Tools must be an array',
                    severity: 'critical'
                });
            } else {
                manifest.tools.forEach((tool, index) => {
                    const toolErrors = this.validateTool(tool, index);
                    errors.push(...toolErrors.errors);
                    warnings.push(...toolErrors.warnings);
                });
            }

            // Check for handleRequest implementation
            if (manifest.tools.length > 0 && !manifest.logic?.handleRequest) {
                warnings.push({
                    field: 'logic.handleRequest',
                    message: 'AIR defines tools but no handleRequest implementation',
                    severity: 'warning'
                });
            }
        }

        // ========================================
        // LEGACY PATTERNS (Info)
        // ========================================

        if (manifest.instructions?.tasks) {
            warnings.push({
                field: 'instructions.tasks',
                message: 'Using legacy instructions.tasks pattern - consider migrating to MCP tools',
                severity: 'info'
            });
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate a single MCP tool definition
     * @private
     */
    private validateTool(
        tool: Partial<Tool>,
        index: number
    ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        const prefix = `tools[${index}]`;

        // Name is required
        if (!tool.name || typeof tool.name !== 'string' || tool.name.trim() === '') {
            errors.push({
                field: `${prefix}.name`,
                message: 'Tool name is required',
                severity: 'critical'
            });
        } else {
            // Name format check (should be snake_case)
            if (!tool.name.match(/^[a-z][a-z0-9_]*$/)) {
                warnings.push({
                    field: `${prefix}.name`,
                    message: `Tool name "${tool.name}" should be snake_case`,
                    severity: 'warning'
                });
            }
        }

        // Description is required
        if (!tool.description || typeof tool.description !== 'string' || tool.description.trim() === '') {
            errors.push({
                field: `${prefix}.description`,
                message: 'Tool description is required',
                severity: 'critical'
            });
        }

        // Input schema validation
        if (!tool.inputSchema) {
            errors.push({
                field: `${prefix}.inputSchema`,
                message: 'Tool must have an inputSchema',
                severity: 'critical'
            });
        } else {
            if (tool.inputSchema.type !== 'object') {
                errors.push({
                    field: `${prefix}.inputSchema.type`,
                    message: 'Input schema type must be "object" (MCP compliance)',
                    severity: 'critical'
                });
            }

            if (!tool.inputSchema.properties || typeof tool.inputSchema.properties !== 'object') {
                warnings.push({
                    field: `${prefix}.inputSchema.properties`,
                    message: 'Input schema should have properties object',
                    severity: 'warning'
                });
            }
        }

        return { errors, warnings };
    }

    /**
     * Quick validation - throws on critical errors
     *
     * @param manifest The manifest to validate
     * @param options Validation options
     * @throws Error if validation fails
     */
    public validateOrThrow(
        manifest: Partial<AIRManifest>,
        options: ValidationOptions = {}
    ): void {
        const result = this.validate(manifest, options);

        if (!result.valid) {
            const errorMessages = result.errors.map(e => `${e.field}: ${e.message}`).join('\n');
            throw new Error(`Manifest validation failed:\n${errorMessages}`);
        }
    }

    /**
     * Pretty-print validation results
     *
     * @param result Validation result
     * @returns Formatted string
     */
    public format(result: ValidationResult): string {
        const lines: string[] = [];

        if (result.valid) {
            lines.push('✅ Manifest is valid');
        } else {
            lines.push('❌ Manifest validation failed');
        }

        if (result.errors.length > 0) {
            lines.push('\nErrors:');
            for (const error of result.errors) {
                lines.push(`  ❌ ${error.field}: ${error.message}`);
            }
        }

        if (result.warnings.length > 0) {
            lines.push('\nWarnings:');
            for (const warning of result.warnings) {
                const icon = warning.severity === 'warning' ? '⚠️' : 'ℹ️';
                lines.push(`  ${icon} ${warning.field}: ${warning.message}`);
            }
        }

        return lines.join('\n');
    }
}

/**
 * Default validator instance
 */
export const validator = new ManifestValidator();

/**
 * Quick validation helper
 */
export function validateManifest(
    manifest: Partial<AIRManifest>,
    options?: ValidationOptions
): ValidationResult {
    return validator.validate(manifest, options);
}
