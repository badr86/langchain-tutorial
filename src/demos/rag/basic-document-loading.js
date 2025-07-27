import { TextLoader } from 'langchain/document_loaders/fs/text';
import { CSVLoader } from 'langchain/document_loaders/fs/csv';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { Document } from '@langchain/core/documents';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Basic Document Loading Demo
 * 
 * This demo shows how to load and process various document formats.
 * Document loading is the first step in building RAG systems.
 */
async function basicDocumentLoadingDemo() {
    console.log('🚀 Executing Basic Document Loading Demo...');
    console.log('=' .repeat(60));

    console.log('📄 Document Loading Overview:');
    console.log('   • Load various document formats (TXT, CSV, JSON)');
    console.log('   • Extract text content and metadata');
    console.log('   • Prepare documents for RAG processing');
    console.log('   • Handle different document structures');

    // Create sample documents for demonstration
    console.log('\n📝 Creating Sample Documents...');
    
    const sampleDir = join(__dirname, 'sample_documents');
    if (!existsSync(sampleDir)) {
        mkdirSync(sampleDir, { recursive: true });
    }

    // Create sample text document
    const textContent = `# Introduction to Artificial Intelligence

Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines that can perform tasks that typically require human intelligence. These tasks include learning, reasoning, problem-solving, perception, and language understanding.

## History of AI

The field of AI was founded in 1956 at a conference at Dartmouth College. Early pioneers like Alan Turing, John McCarthy, and Marvin Minsky laid the groundwork for what would become one of the most transformative technologies of our time.

## Types of AI

1. **Narrow AI**: AI systems designed for specific tasks (like image recognition or chess playing)
2. **General AI**: Hypothetical AI that could perform any intellectual task that a human can do
3. **Superintelligence**: AI that surpasses human intelligence in all domains

## Applications

AI is used in various fields including:
- Healthcare: Diagnosis and treatment recommendations
- Finance: Fraud detection and algorithmic trading
- Transportation: Autonomous vehicles
- Entertainment: Recommendation systems
- Education: Personalized learning platforms

## Future of AI

The future of AI holds great promise but also presents challenges. As AI systems become more sophisticated, we must address ethical considerations, job displacement, and the need for responsible AI development.

AI will continue to transform industries and society, making it crucial for individuals and organizations to understand and adapt to these changes.`;

    const textPath = join(sampleDir, 'ai_introduction.txt');
    writeFileSync(textPath, textContent);

    // Create sample CSV document
    const csvContent = `name,age,department,salary,years_experience
John Doe,30,Engineering,75000,5
Jane Smith,28,Marketing,65000,3
Mike Johnson,35,Engineering,85000,8
Sarah Wilson,32,Sales,70000,6
Tom Brown,29,Engineering,72000,4
Lisa Davis,31,Marketing,68000,5
David Lee,33,Sales,73000,7
Emma White,27,Engineering,70000,3
Alex Chen,34,Marketing,71000,6
Maria Garcia,30,Sales,69000,4`;

    const csvPath = join(sampleDir, 'employee_data.csv');
    writeFileSync(csvPath, csvContent);

    // Create sample JSON document
    const jsonData = {
        "company": "TechCorp AI Solutions",
        "founded": 2020,
        "headquarters": "San Francisco, CA",
        "employees": 150,
        "products": [
            {
                "name": "AI Assistant Pro",
                "category": "Natural Language Processing",
                "description": "Advanced conversational AI for customer support",
                "price": 299,
                "features": ["Multi-language support", "Custom training", "API integration"]
            },
            {
                "name": "Vision Analytics",
                "category": "Computer Vision",
                "description": "Real-time image and video analysis platform",
                "price": 599,
                "features": ["Object detection", "Facial recognition", "Anomaly detection"]
            },
            {
                "name": "Predictive Insights",
                "category": "Machine Learning",
                "description": "Predictive analytics for business intelligence",
                "price": 899,
                "features": ["Time series forecasting", "Risk assessment", "Custom models"]
            }
        ],
        "technologies": ["Python", "TensorFlow", "PyTorch", "OpenAI", "LangChain"],
        "markets": ["Healthcare", "Finance", "Retail", "Manufacturing"],
        "revenue": {
            "2020": 500000,
            "2021": 1200000,
            "2022": 2800000,
            "2023": 5200000
        }
    };

    const jsonPath = join(sampleDir, 'company_data.json');
    writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

    console.log('✅ Sample documents created:');
    console.log(`   📄 Text: ${textPath}`);
    console.log(`   📊 CSV: ${csvPath}`);
    console.log(`   📋 JSON: ${jsonPath}`);

    // Load documents using different loaders
    console.log(`\n${'='.repeat(60)}`);
    console.log('📂 Loading Documents with Various Loaders');
    console.log(`${'='.repeat(60)}`);

    // Load text document
    console.log('\n📄 Loading Text Document...');
    try {
        const textLoader = new TextLoader(textPath);
        const textDocs = await textLoader.load();
        
        console.log('✅ Text document loaded successfully');
        console.log(`   Documents: ${textDocs.length}`);
        console.log(`   Content length: ${textDocs[0].pageContent.length} characters`);
        console.log(`   Metadata:`, textDocs[0].metadata);
        console.log(`   Content preview: "${textDocs[0].pageContent.substring(0, 100)}..."`);
        
    } catch (error) {
        console.log('❌ Error loading text document:', error.message);
    }

    // Load CSV document
    console.log('\n📊 Loading CSV Document...');
    try {
        const csvLoader = new CSVLoader(csvPath);
        const csvDocs = await csvLoader.load();
        
        console.log('✅ CSV document loaded successfully');
        console.log(`   Documents: ${csvDocs.length} (one per row)`);
        console.log(`   First row content:`, csvDocs[0].pageContent);
        console.log(`   Metadata:`, csvDocs[0].metadata);
        
        // Show statistics
        const departments = csvDocs.map(doc => {
            const match = doc.pageContent.match(/department: ([^,\n]+)/);
            return match ? match[1] : 'Unknown';
        });
        const uniqueDepartments = [...new Set(departments)];
        console.log(`   Departments found: ${uniqueDepartments.join(', ')}`);
        
    } catch (error) {
        console.log('❌ Error loading CSV document:', error.message);
    }

    // Load JSON document
    console.log('\n📋 Loading JSON Document...');
    try {
        const jsonLoader = new JSONLoader(jsonPath);
        const jsonDocs = await jsonLoader.load();
        
        console.log('✅ JSON document loaded successfully');
        console.log(`   Documents: ${jsonDocs.length}`);
        console.log(`   Content length: ${jsonDocs[0].pageContent.length} characters`);
        console.log(`   Metadata:`, jsonDocs[0].metadata);
        console.log(`   Content preview: "${jsonDocs[0].pageContent.substring(0, 200)}..."`);
        
    } catch (error) {
        console.log('❌ Error loading JSON document:', error.message);
    }

    // Advanced JSON loading with custom parsing
    console.log('\n🔧 Advanced JSON Loading with Custom Parsing...');
    try {
        const jsonLoader = new JSONLoader(jsonPath, [
            "/products",      // Extract products array
            "/technologies",  // Extract technologies array
            "/revenue"        // Extract revenue object
        ]);
        const customJsonDocs = await jsonLoader.load();
        
        console.log('✅ Custom JSON parsing completed');
        console.log(`   Documents extracted: ${customJsonDocs.length}`);
        
        customJsonDocs.forEach((doc, index) => {
            console.log(`   Document ${index + 1}:`);
            console.log(`     Content: ${doc.pageContent.substring(0, 100)}...`);
            console.log(`     Metadata:`, doc.metadata);
        });
        
    } catch (error) {
        console.log('❌ Error with custom JSON loading:', error.message);
    }

    // Document processing and analysis
    console.log(`\n${'='.repeat(60)}`);
    console.log('🔍 Document Analysis and Processing');
    console.log(`${'='.repeat(60)}`);

    // Combine all loaded documents
    const allDocs = [];
    
    try {
        const textLoader = new TextLoader(textPath);
        const csvLoader = new CSVLoader(csvPath);
        const jsonLoader = new JSONLoader(jsonPath);
        
        const textDocs = await textLoader.load();
        const csvDocs = await csvLoader.load();
        const jsonDocs = await jsonLoader.load();
        
        allDocs.push(...textDocs, ...csvDocs, ...jsonDocs);
        
        console.log('\n📊 Combined Document Statistics:');
        console.log(`   Total documents: ${allDocs.length}`);
        
        // Analyze by source type
        const sourceTypes = {};
        allDocs.forEach(doc => {
            const source = doc.metadata.source || 'unknown';
            const ext = source.split('.').pop() || 'unknown';
            sourceTypes[ext] = (sourceTypes[ext] || 0) + 1;
        });
        
        console.log('   Documents by type:');
        Object.entries(sourceTypes).forEach(([type, count]) => {
            console.log(`     ${type.toUpperCase()}: ${count} documents`);
        });
        
        // Content length analysis
        const contentLengths = allDocs.map(doc => doc.pageContent.length);
        const totalLength = contentLengths.reduce((sum, len) => sum + len, 0);
        const avgLength = Math.round(totalLength / contentLengths.length);
        const maxLength = Math.max(...contentLengths);
        const minLength = Math.min(...contentLengths);
        
        console.log('\n📏 Content Analysis:');
        console.log(`   Total characters: ${totalLength.toLocaleString()}`);
        console.log(`   Average length: ${avgLength} characters`);
        console.log(`   Longest document: ${maxLength} characters`);
        console.log(`   Shortest document: ${minLength} characters`);
        
    } catch (error) {
        console.log('❌ Error in document analysis:', error.message);
    }

    // Custom document creation
    console.log(`\n${'='.repeat(60)}`);
    console.log('🏗️ Custom Document Creation');
    console.log(`${'='.repeat(60)}`);

    // Create custom documents programmatically
    const customDocs = [
        new Document({
            pageContent: "LangChain is a framework for developing applications powered by language models. It provides tools for document loading, text splitting, embeddings, and vector stores.",
            metadata: {
                source: "custom",
                topic: "LangChain",
                type: "definition",
                created: new Date().toISOString()
            }
        }),
        new Document({
            pageContent: "RAG (Retrieval-Augmented Generation) combines the power of large language models with external knowledge bases to provide more accurate and contextual responses.",
            metadata: {
                source: "custom",
                topic: "RAG",
                type: "definition",
                created: new Date().toISOString()
            }
        }),
        new Document({
            pageContent: "Vector databases store high-dimensional vectors and enable efficient similarity search, making them ideal for semantic search and recommendation systems.",
            metadata: {
                source: "custom",
                topic: "Vector Databases",
                type: "definition",
                created: new Date().toISOString()
            }
        })
    ];

    console.log('✅ Custom documents created:');
    customDocs.forEach((doc, index) => {
        console.log(`   ${index + 1}. Topic: ${doc.metadata.topic}`);
        console.log(`      Content: "${doc.pageContent.substring(0, 80)}..."`);
        console.log(`      Metadata: ${JSON.stringify(doc.metadata)}`);
    });

    // Document loading best practices
    console.log(`\n${'='.repeat(60)}`);
    console.log('💡 Document Loading Best Practices');
    console.log(`${'='.repeat(60)}`);

    console.log('\n📋 File Format Considerations:');
    console.log('   • TXT: Simple text, good for articles and documentation');
    console.log('   • CSV: Structured data, one document per row');
    console.log('   • JSON: Complex structured data, flexible parsing');
    console.log('   • PDF: Rich formatting, requires special handling');
    console.log('   • DOCX: Word documents, preserves formatting');

    console.log('\n🔧 Loading Strategies:');
    console.log('   • Batch loading for large document sets');
    console.log('   • Streaming for memory-efficient processing');
    console.log('   • Custom loaders for specialized formats');
    console.log('   • Error handling for corrupted files');

    console.log('\n📊 Metadata Management:');
    console.log('   • Include source file information');
    console.log('   • Add creation and modification timestamps');
    console.log('   • Tag documents with categories or topics');
    console.log('   • Store processing parameters');

    console.log('\n⚡ Performance Tips:');
    console.log('   • Use appropriate loader for each format');
    console.log('   • Process documents in parallel when possible');
    console.log('   • Cache loaded documents to avoid reprocessing');
    console.log('   • Monitor memory usage with large document sets');

    console.log('\n✅ Basic Document Loading Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • Different loaders handle different document formats');
    console.log('   • Metadata provides important context for documents');
    console.log('   • Custom document creation enables programmatic content');
    console.log('   • Document analysis helps understand your data');
    console.log('   • Proper loading is foundation for effective RAG systems');
}

// Execute the demo
basicDocumentLoadingDemo().catch(console.error);
