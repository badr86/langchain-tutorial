import fs from 'fs';
import path from 'path';

/**
 * Extract capabilities metadata from demo files
 * This utility parses demo files to extract structured capabilities information
 */

export const extractCapabilities = (demoFilePath) => {
    try {
        const fullPath = path.resolve(demoFilePath);
        
        if (!fs.existsSync(fullPath)) {
            return null;
        }

        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Extract capabilities section from console.log statements
        const capabilities = {
            whatItCanDo: [],
            bestUseCases: [],
            limitations: [],
            keyTakeaways: []
        };

        // Parse "What [X] Can Do" section
        const whatCanDoMatch = content.match(/console\.log\('\\n✅ What .+ Can Do:'\);([\s\S]*?)(?=console\.log\('\\n🎯|console\.log\('\\n⚠️|$)/);
        if (whatCanDoMatch) {
            const lines = whatCanDoMatch[1].match(/console\.log\('\s+• (.+)'\);/g);
            if (lines) {
                capabilities.whatItCanDo = lines.map(line => 
                    line.match(/console\.log\('\s+• (.+)'\);/)[1]
                );
            }
        }

        // Parse "Best Use Cases" section
        const bestUseCasesMatch = content.match(/console\.log\('\\n🎯 Best Use Cases:'\);([\s\S]*?)(?=console\.log\('\\n⚠️|console\.log\('\\n✅|$)/);
        if (bestUseCasesMatch) {
            const lines = bestUseCasesMatch[1].match(/console\.log\('\s+• (.+)'\);/g);
            if (lines) {
                capabilities.bestUseCases = lines.map(line => 
                    line.match(/console\.log\('\s+• (.+)'\);/)[1]
                );
            }
        }

        // Parse "Limitations" section
        const limitationsMatch = content.match(/console\.log\('\\n⚠️ Limitations:'\);([\s\S]*?)(?=console\.log\('\\n✅|$)/);
        if (limitationsMatch) {
            const lines = limitationsMatch[1].match(/console\.log\('\s+• (.+)'\);/g);
            if (lines) {
                capabilities.limitations = lines.map(line => 
                    line.match(/console\.log\('\s+• (.+)'\);/)[1]
                );
            }
        }

        // Parse "Key takeaways" section
        const keyTakeawaysMatch = content.match(/console\.log\('💡 Key takeaways:'\);([\s\S]*?)(?=}|$)/);
        if (keyTakeawaysMatch) {
            const lines = keyTakeawaysMatch[1].match(/console\.log\('\s+• (.+)'\);/g);
            if (lines) {
                capabilities.keyTakeaways = lines.map(line => 
                    line.match(/console\.log\('\s+• (.+)'\);/)[1]
                );
            }
        }

        // Return null if no capabilities found
        if (capabilities.whatItCanDo.length === 0 && 
            capabilities.bestUseCases.length === 0 && 
            capabilities.limitations.length === 0 && 
            capabilities.keyTakeaways.length === 0) {
            return null;
        }

        return capabilities;
    } catch (error) {
        console.error('Error extracting capabilities:', error);
        return null;
    }
};

/**
 * Get demo title from file content
 */
export const extractDemoTitle = (demoFilePath) => {
    try {
        const fullPath = path.resolve(demoFilePath);
        
        if (!fs.existsSync(fullPath)) {
            return null;
        }

        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Look for title in console.log statements like "🚀 [Title] Capabilities"
        const titleMatch = content.match(/console\.log\('🚀 (.+) Capabilities'\);/);
        if (titleMatch) {
            return titleMatch[1];
        }

        // Fallback: look for demo function name
        const functionMatch = content.match(/async function (\w+)/);
        if (functionMatch) {
            return functionMatch[1].replace(/Demo$/, '').replace(/([A-Z])/g, ' $1').trim();
        }

        return null;
    } catch (error) {
        console.error('Error extracting demo title:', error);
        return null;
    }
};
