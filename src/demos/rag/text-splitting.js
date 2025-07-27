import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from '@langchain/core/documents';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Text Splitting & Chunking Demo
 * 
 * This demo shows how to split large documents into manageable chunks for processing.
 * Text splitting is crucial for RAG systems to handle context length limits.
 */
async function textSplittingDemo() {
    console.log('🚀 Executing Text Splitting & Chunking Demo...');
    console.log('=' .repeat(60));

    console.log('✂️ Text Splitting Overview:');
    console.log('   • Break large documents into smaller chunks');
    console.log('   • Handle LLM context length limitations');
    console.log('   • Preserve semantic meaning across chunks');
    console.log('   • Enable efficient vector storage and retrieval');

    // Create sample long text for demonstration
    const longText = `# The Evolution of Artificial Intelligence

## Introduction

Artificial Intelligence (AI) has undergone remarkable evolution since its inception in the mid-20th century. From simple rule-based systems to sophisticated neural networks, AI has transformed from a theoretical concept into a practical technology that impacts virtually every aspect of modern life.

## Historical Development

### Early Foundations (1940s-1950s)

The foundations of AI were laid during the 1940s and 1950s by pioneering researchers who envisioned machines capable of intelligent behavior. Alan Turing's seminal 1950 paper "Computing Machinery and Intelligence" introduced the famous Turing Test, which proposed a method for determining whether a machine could exhibit intelligent behavior equivalent to, or indistinguishable from, that of a human.

The term "artificial intelligence" was coined by John McCarthy in 1956 during the Dartmouth Conference, which is widely considered the birth of AI as an academic discipline. This conference brought together leading researchers including Marvin Minsky, Claude Shannon, and Herbert Simon, who would become the founding fathers of AI research.

### The First AI Winter (1970s-1980s)

Despite initial optimism, the field of AI experienced its first major setback in the 1970s, known as the "AI Winter." Funding for AI research was dramatically reduced as early promises of human-level AI proved overly optimistic. The limitations of early AI systems became apparent, particularly their inability to handle real-world complexity and uncertainty.

During this period, expert systems emerged as a practical application of AI. These rule-based systems encoded human expertise in specific domains and achieved commercial success in areas such as medical diagnosis and financial planning. Companies like Symbolics and Lisp Machines Inc. developed specialized hardware to run AI applications.

### The Renaissance (1980s-1990s)

The 1980s marked a renaissance in AI research, driven by advances in machine learning and the development of more sophisticated algorithms. Backpropagation, introduced by Geoffrey Hinton and others, revolutionized neural network training and laid the groundwork for modern deep learning.

During this period, AI began to find practical applications in various industries. Computer vision systems were deployed in manufacturing for quality control, natural language processing systems began to handle simple text analysis tasks, and robotics advanced significantly with the development of more sophisticated control systems.

## Modern AI Revolution

### The Deep Learning Breakthrough (2000s-2010s)

The 2000s and 2010s witnessed a dramatic breakthrough in AI capabilities, primarily driven by deep learning. The availability of large datasets, increased computational power through GPUs, and algorithmic improvements converged to create unprecedented advances in AI performance.

Key milestones during this period included:
- ImageNet competition victories by deep convolutional neural networks
- IBM Watson's victory on Jeopardy! in 2011
- Google's AlphaGo defeating world champion Go player Lee Sedol in 2016
- The development of transformer architectures leading to breakthrough language models

### The Transformer Revolution (2017-Present)

The introduction of the transformer architecture in 2017 by Vaswani et al. marked another pivotal moment in AI history. This architecture enabled the development of large language models that could understand and generate human-like text with unprecedented quality.

The progression from GPT-1 to GPT-4 and beyond has demonstrated remarkable improvements in language understanding, reasoning capabilities, and general intelligence. These models have achieved human-level performance on many tasks and have sparked discussions about artificial general intelligence (AGI).

## Current Applications and Impact

### Healthcare

AI has revolutionized healthcare through applications in medical imaging, drug discovery, and personalized treatment. Machine learning algorithms can now detect diseases in medical images with accuracy matching or exceeding human specialists. AI-powered drug discovery platforms are accelerating the development of new medications, potentially reducing the time and cost of bringing new drugs to market.

### Transportation

Autonomous vehicles represent one of the most visible applications of modern AI. Companies like Tesla, Waymo, and others have developed self-driving systems that use computer vision, sensor fusion, and machine learning to navigate complex traffic scenarios. While fully autonomous vehicles are still being perfected, AI has already improved vehicle safety through features like automatic emergency braking and lane departure warnings.

### Finance

The financial industry has embraced AI for fraud detection, algorithmic trading, and risk assessment. Machine learning models can analyze vast amounts of transaction data to identify suspicious patterns and prevent fraudulent activities. High-frequency trading systems use AI to make split-second decisions in financial markets, while robo-advisors provide personalized investment advice to retail investors.

### Technology and Communication

AI has transformed how we interact with technology through virtual assistants, recommendation systems, and search engines. Natural language processing enables voice-controlled devices to understand and respond to human commands. Recommendation algorithms power content discovery on platforms like Netflix, YouTube, and Spotify, personalizing user experiences based on individual preferences and behavior patterns.

## Challenges and Considerations

### Ethical Implications

As AI systems become more powerful and pervasive, ethical considerations have become increasingly important. Issues such as algorithmic bias, privacy concerns, and the potential for AI to perpetuate or amplify existing societal inequalities require careful attention from researchers, policymakers, and industry leaders.

### Technical Limitations

Despite remarkable progress, current AI systems still face significant limitations. They often lack common sense reasoning, can be brittle when faced with situations outside their training data, and may exhibit unexpected behaviors in edge cases. The challenge of creating AI systems that are robust, reliable, and interpretable remains an active area of research.

### Societal Impact

The widespread adoption of AI technologies raises important questions about employment, economic inequality, and the future of work. While AI has the potential to create new opportunities and improve productivity, it may also displace workers in certain industries and exacerbate existing economic disparities.

## Future Directions

### Artificial General Intelligence (AGI)

The ultimate goal of AI research for many scientists is the development of artificial general intelligence – AI systems that can match or exceed human intelligence across all domains. While current AI systems excel in specific tasks, achieving general intelligence remains a significant challenge that may require fundamental breakthroughs in our understanding of intelligence itself.

### Quantum AI

The intersection of quantum computing and artificial intelligence represents a promising frontier for future AI development. Quantum computers may be able to solve certain AI problems exponentially faster than classical computers, potentially enabling new types of AI applications and capabilities.

### Neuromorphic Computing

Inspired by the structure and function of biological neural networks, neuromorphic computing aims to create more efficient and brain-like AI systems. This approach could lead to AI systems that consume less energy while providing better performance for certain types of tasks.

## Conclusion

The evolution of artificial intelligence from its early theoretical foundations to today's sophisticated systems represents one of the most remarkable technological achievements in human history. As we continue to push the boundaries of what AI can accomplish, it is crucial that we approach this technology with both excitement for its potential and careful consideration of its implications for society.

The future of AI holds immense promise for solving complex global challenges, from climate change to disease, while also requiring thoughtful governance and ethical frameworks to ensure that these powerful technologies benefit all of humanity. As we stand on the brink of potentially achieving artificial general intelligence, the decisions we make today about AI development and deployment will shape the future of our species and our planet.`;

    console.log('\n📝 Sample Text Statistics:');
    console.log(`   Length: ${longText.length.toLocaleString()} characters`);
    console.log(`   Words: ${longText.split(/\s+/).length.toLocaleString()}`);
    console.log(`   Lines: ${longText.split('\n').length}`);

    // Demonstrate different text splitters
    console.log(`\n${'='.repeat(60)}`);
    console.log('✂️ Recursive Character Text Splitter');
    console.log(`${'='.repeat(60)}`);

    console.log('\n🔧 Basic Recursive Character Splitting...');
    const basicSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
        separators: ['\n\n', '\n', ' ', ''],
    });

    try {
        const basicChunks = await basicSplitter.createDocuments([longText]);
        
        console.log('✅ Basic recursive splitting completed');
        console.log(`   Total chunks: ${basicChunks.length}`);
        console.log(`   Average chunk size: ${Math.round(basicChunks.reduce((sum, chunk) => sum + chunk.pageContent.length, 0) / basicChunks.length)} characters`);
        
        // Show first few chunks
        console.log('\n📄 First 3 chunks preview:');
        basicChunks.slice(0, 3).forEach((chunk, index) => {
            console.log(`   Chunk ${index + 1} (${chunk.pageContent.length} chars):`);
            console.log(`     "${chunk.pageContent.substring(0, 100).replace(/\n/g, ' ')}..."`);
        });
        
    } catch (error) {
        console.log('❌ Error in basic splitting:', error.message);
    }

    // Advanced recursive splitting with custom separators
    console.log('\n🔧 Advanced Recursive Splitting with Custom Separators...');
    const advancedSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 800,
        chunkOverlap: 100,
        separators: [
            '\n## ',      // Section headers
            '\n### ',     // Subsection headers
            '\n\n',       // Paragraph breaks
            '\n',         // Line breaks
            '. ',         // Sentence endings
            ' ',          // Word boundaries
            ''            // Character level
        ],
        keepSeparator: true,
    });

    try {
        const advancedChunks = await advancedSplitter.createDocuments([longText]);
        
        console.log('✅ Advanced recursive splitting completed');
        console.log(`   Total chunks: ${advancedChunks.length}`);
        
        // Analyze chunk boundaries
        const headerChunks = advancedChunks.filter(chunk => 
            chunk.pageContent.includes('##') || chunk.pageContent.includes('###')
        );
        console.log(`   Chunks with headers: ${headerChunks.length}`);
        
        // Show chunks with headers
        console.log('\n📋 Chunks containing section headers:');
        headerChunks.slice(0, 3).forEach((chunk, index) => {
            const headerMatch = chunk.pageContent.match(/(#{2,3}\s+[^\n]+)/);
            const header = headerMatch ? headerMatch[1] : 'No header found';
            console.log(`   Chunk ${index + 1}: ${header}`);
        });
        
    } catch (error) {
        console.log('❌ Error in advanced splitting:', error.message);
    }

    // Character-based text splitter
    console.log(`\n${'='.repeat(60)}`);
    console.log('✂️ Character Text Splitter');
    console.log(`${'='.repeat(60)}`);

    const characterSplitter = new CharacterTextSplitter({
        separator: '\n\n',
        chunkSize: 1200,
        chunkOverlap: 150,
    });

    try {
        const characterChunks = await characterSplitter.createDocuments([longText]);
        
        console.log('✅ Character splitting completed');
        console.log(`   Total chunks: ${characterChunks.length}`);
        console.log(`   Separator used: paragraph breaks (\\n\\n)`);
        
        // Analyze chunk sizes
        const chunkSizes = characterChunks.map(chunk => chunk.pageContent.length);
        const minSize = Math.min(...chunkSizes);
        const maxSize = Math.max(...chunkSizes);
        const avgSize = Math.round(chunkSizes.reduce((sum, size) => sum + size, 0) / chunkSizes.length);
        
        console.log('\n📊 Chunk Size Analysis:');
        console.log(`   Minimum size: ${minSize} characters`);
        console.log(`   Maximum size: ${maxSize} characters`);
        console.log(`   Average size: ${avgSize} characters`);
        
    } catch (error) {
        console.log('❌ Error in character splitting:', error.message);
    }

    // Token-based text splitter
    console.log(`\n${'='.repeat(60)}`);
    console.log('✂️ Token Text Splitter');
    console.log(`${'='.repeat(60)}`);

    console.log('\n🔧 Token-based splitting (useful for LLM context limits)...');
    const tokenSplitter = new TokenTextSplitter({
        chunkSize: 512,
        chunkOverlap: 50,
    });

    try {
        const tokenChunks = await tokenSplitter.createDocuments([longText]);
        
        console.log('✅ Token splitting completed');
        console.log(`   Total chunks: ${tokenChunks.length}`);
        console.log(`   Target tokens per chunk: 512`);
        console.log(`   Token overlap: 50`);
        
        // Estimate actual token counts (rough approximation)
        const estimatedTokens = tokenChunks.map(chunk => {
            // Rough estimation: 1 token ≈ 4 characters for English text
            return Math.round(chunk.pageContent.length / 4);
        });
        
        console.log('\n🔢 Estimated Token Counts:');
        console.log(`   Average tokens per chunk: ${Math.round(estimatedTokens.reduce((sum, tokens) => sum + tokens, 0) / estimatedTokens.length)}`);
        console.log(`   Min tokens: ${Math.min(...estimatedTokens)}`);
        console.log(`   Max tokens: ${Math.max(...estimatedTokens)}`);
        
    } catch (error) {
        console.log('❌ Error in token splitting:', error.message);
    }

    // Working with existing documents
    console.log(`\n${'='.repeat(60)}`);
    console.log('📄 Splitting Existing Documents');
    console.log(`${'='.repeat(60)}`);

    // Create sample documents with metadata
    const sampleDocs = [
        new Document({
            pageContent: longText,
            metadata: {
                source: 'ai_evolution.md',
                author: 'AI Researcher',
                topic: 'Artificial Intelligence',
                created: '2024-01-15'
            }
        }),
        new Document({
            pageContent: `# Machine Learning Fundamentals

Machine learning is a subset of artificial intelligence that focuses on the development of algorithms and statistical models that enable computer systems to improve their performance on a specific task through experience, without being explicitly programmed for every scenario.

## Types of Machine Learning

### Supervised Learning
Supervised learning involves training algorithms on labeled datasets, where the desired output is known. Common applications include classification and regression tasks.

### Unsupervised Learning  
Unsupervised learning works with unlabeled data to discover hidden patterns or structures. Clustering and dimensionality reduction are typical examples.

### Reinforcement Learning
Reinforcement learning involves agents learning to make decisions through interaction with an environment, receiving rewards or penalties for their actions.`,
            metadata: {
                source: 'ml_fundamentals.md',
                author: 'ML Expert',
                topic: 'Machine Learning',
                created: '2024-01-16'
            }
        })
    ];

    console.log('\n📚 Splitting Documents with Metadata Preservation...');
    const docSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 600,
        chunkOverlap: 100,
    });

    try {
        const splitDocs = await docSplitter.splitDocuments(sampleDocs);
        
        console.log('✅ Document splitting with metadata completed');
        console.log(`   Original documents: ${sampleDocs.length}`);
        console.log(`   Split chunks: ${splitDocs.length}`);
        
        // Show how metadata is preserved
        console.log('\n🏷️ Metadata Preservation:');
        splitDocs.slice(0, 4).forEach((chunk, index) => {
            console.log(`   Chunk ${index + 1}:`);
            console.log(`     Source: ${chunk.metadata.source}`);
            console.log(`     Topic: ${chunk.metadata.topic}`);
            console.log(`     Content: "${chunk.pageContent.substring(0, 80).replace(/\n/g, ' ')}..."`);
        });
        
    } catch (error) {
        console.log('❌ Error in document splitting:', error.message);
    }

    // Chunk overlap analysis
    console.log(`\n${'='.repeat(60)}`);
    console.log('🔄 Chunk Overlap Analysis');
    console.log(`${'='.repeat(60)}`);

    const overlapSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
    });

    try {
        const overlapChunks = await overlapSplitter.createDocuments([longText.substring(0, 2000)]);
        
        console.log('✅ Overlap analysis completed');
        console.log(`   Chunks created: ${overlapChunks.length}`);
        console.log(`   Configured overlap: 100 characters`);
        
        // Analyze actual overlap between consecutive chunks
        for (let i = 0; i < overlapChunks.length - 1; i++) {
            const currentChunk = overlapChunks[i].pageContent;
            const nextChunk = overlapChunks[i + 1].pageContent;
            
            // Find common substring at the end of current and beginning of next
            let overlapLength = 0;
            const minLength = Math.min(currentChunk.length, nextChunk.length);
            
            for (let j = 1; j <= minLength; j++) {
                if (currentChunk.slice(-j) === nextChunk.slice(0, j)) {
                    overlapLength = j;
                }
            }
            
            console.log(`   Chunks ${i + 1}-${i + 2}: ${overlapLength} characters overlap`);
        }
        
    } catch (error) {
        console.log('❌ Error in overlap analysis:', error.message);
    }

    // Text splitting best practices
    console.log(`\n${'='.repeat(60)}`);
    console.log('💡 Text Splitting Best Practices');
    console.log(`${'='.repeat(60)}`);

    console.log('\n📏 Chunk Size Guidelines:');
    console.log('   • Small chunks (200-500 chars): High precision, may lose context');
    console.log('   • Medium chunks (500-1500 chars): Good balance for most use cases');
    console.log('   • Large chunks (1500+ chars): More context, may exceed LLM limits');
    console.log('   • Consider your LLM\'s context window when choosing size');

    console.log('\n🔄 Overlap Strategies:');
    console.log('   • 10-20% overlap: Ensures important information isn\'t lost at boundaries');
    console.log('   • Sentence-level overlap: Maintains semantic coherence');
    console.log('   • Too much overlap: Increases storage and processing costs');
    console.log('   • Too little overlap: Risk of losing context at chunk boundaries');

    console.log('\n✂️ Separator Selection:');
    console.log('   • Hierarchical separators: Headers → paragraphs → sentences → words');
    console.log('   • Document-specific: Choose separators based on content structure');
    console.log('   • Preserve formatting: Keep important structural elements');
    console.log('   • Test different approaches: Optimize for your specific use case');

    console.log('\n🎯 Use Case Considerations:');
    console.log('   • Q&A systems: Smaller chunks for precise answers');
    console.log('   • Summarization: Larger chunks for comprehensive context');
    console.log('   • Semantic search: Medium chunks for balanced relevance');
    console.log('   • Code analysis: Respect function/class boundaries');

    console.log('\n✅ Text Splitting & Chunking Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • Text splitting is crucial for handling large documents in RAG');
    console.log('   • Different splitters serve different purposes and use cases');
    console.log('   • Chunk size and overlap need careful tuning for optimal results');
    console.log('   • Metadata preservation maintains document context across chunks');
    console.log('   • Proper splitting strategy significantly impacts RAG performance');
}

// Execute the demo
textSplittingDemo().catch(console.error);
