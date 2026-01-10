# Product Guidelines: React Sketch Canvas

## Tone and Voice

### Technical and Precise
- Use clear, concise technical writing focused on accuracy and completeness
- Assume developer familiarity with the React ecosystem
- Avoid unnecessary jargon while using appropriate technical terminology
- Be direct and informative; respect the reader's time
- Write in active voice with imperative mood for instructions

### Writing Style
- Lead with the most important information
- Use code examples to illustrate concepts
- Keep sentences short and scannable
- Avoid marketing language in technical documentation
- Be consistent with terminology throughout all documentation

## Design Principles

### Performance-First
- **Smooth drawing experience** is the top priority; never compromise on input responsiveness
- Minimize unnecessary re-renders through careful state management
- Use throttling and debouncing appropriately for pointer events
- Optimize memory usage, especially for long drawing sessions
- Profile and benchmark performance impacts of new features
- Prefer efficient algorithms for path smoothing and rendering

### Implementation Guidelines
- Measure before optimizing; use profiling data to guide decisions
- Document performance characteristics of props and methods
- Provide guidance on performance best practices in documentation
- Test on lower-powered devices to ensure broad compatibility

## API Stability and Versioning

### Semantic Versioning
- Follow strict semantic versioning (semver) for all releases
- MAJOR version for incompatible API changes
- MINOR version for backward-compatible functionality additions
- PATCH version for backward-compatible bug fixes

### Deprecation Policy
- Deprecate APIs before removing them (minimum one minor version)
- Provide console warnings for deprecated features in development mode
- Document deprecated features clearly with migration paths
- Include migration guides in release notes for breaking changes

### Changelog Standards
- Maintain a detailed CHANGELOG.md following Keep a Changelog format
- Document all breaking changes prominently
- Include code examples for migrations when applicable

## Documentation Standards

### Practical Examples First
- Lead documentation with copy-paste ready code snippets
- Focus on common use cases that developers encounter most frequently
- Ensure all examples are tested and working
- Provide complete, runnable examples rather than fragments

### Documentation Structure
- Start with a quick-start example that works immediately
- Follow with common use case examples
- Provide comprehensive API reference as supporting material
- Include troubleshooting sections for common issues

### Code Example Guidelines
- Use TypeScript for all examples to demonstrate proper typing
- Include necessary imports in every example
- Comment sparingly; let code be self-explanatory
- Show both basic and advanced usage patterns
