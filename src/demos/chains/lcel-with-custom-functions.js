import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence, RunnableLambda } from '@langchain/core/runnables';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * LCEL with Custom Functions Demo
 * 
 * This demo shows how to integrate custom logic with RunnableLambda in LCEL chains.
 * It demonstrates custom data processing, analysis, and transformation functions.
 */
async function lcelWithCustomFunctionsDemo() {
    console.log('🚀 Executing LCEL with Custom Functions Demo...');
    console.log('=' .repeat(60));

    console.log('🔧 Custom Functions in LCEL:');
    console.log('   • RunnableLambda for custom logic integration');
    console.log('   • Data preprocessing and postprocessing');
    console.log('   • Custom analysis and transformation');
    console.log('   • Seamless integration with LLM chains');

    // Initialize the model
    const model = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7,
        modelName: 'gpt-3.5-turbo'
    });

    console.log('\n🤖 Model Configuration:');
    console.log('   • Model: gpt-3.5-turbo');
    console.log('   • Temperature: 0.7');
    console.log('   • API Key:', process.env.OPENAI_API_KEY ? '✅ Found' : '❌ Missing');

    // Create custom analysis function
    const textAnalyzer = new RunnableLambda({
        func: (input) => {
            console.log('🔍 Running custom text analysis...');
            
            const text = typeof input === 'string' ? input : input.text || '';
            const words = text.split(/\s+/).filter(word => word.length > 0);
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
            
            // Sentiment analysis (simple keyword-based)
            const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best'];
            const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing'];
            
            const positiveCount = positiveWords.filter(word => 
                text.toLowerCase().includes(word)
            ).length;
            const negativeCount = negativeWords.filter(word => 
                text.toLowerCase().includes(word)
            ).length;
            
            let sentiment = 'neutral';
            if (positiveCount > negativeCount) sentiment = 'positive';
            else if (negativeCount > positiveCount) sentiment = 'negative';
            
            // Readability score (simplified)
            const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
            const avgCharsPerWord = words.length > 0 ? 
                words.reduce((sum, word) => sum + word.length, 0) / words.length : 0;
            
            const analysis = {
                original: text,
                wordCount: words.length,
                sentenceCount: sentences.length,
                avgWordsPerSentence: Math.round(avgWordsPerSentence * 100) / 100,
                avgCharsPerWord: Math.round(avgCharsPerWord * 100) / 100,
                sentiment: sentiment,
                positiveWords: positiveCount,
                negativeWords: negativeCount,
                timestamp: new Date().toISOString(),
                readabilityScore: avgWordsPerSentence < 15 && avgCharsPerWord < 6 ? 'Easy' : 
                                avgWordsPerSentence < 25 && avgCharsPerWord < 8 ? 'Medium' : 'Hard'
            };
            
            console.log('📊 Analysis completed:', {
                words: analysis.wordCount,
                sentences: analysis.sentenceCount,
                sentiment: analysis.sentiment,
                readability: analysis.readabilityScore
            });
            
            return analysis;
        },
    });

    // Create data formatter function
    const dataFormatter = new RunnableLambda({
        func: (analysisData) => {
            console.log('📝 Formatting analysis data...');
            
            return `Text Analysis Report:
- Content: "${analysisData.original.substring(0, 100)}${analysisData.original.length > 100 ? '...' : ''}"
- Word Count: ${analysisData.wordCount}
- Sentence Count: ${analysisData.sentenceCount}
- Average Words per Sentence: ${analysisData.avgWordsPerSentence}
- Average Characters per Word: ${analysisData.avgCharsPerWord}
- Sentiment: ${analysisData.sentiment} (${analysisData.positiveWords} positive, ${analysisData.negativeWords} negative keywords)
- Readability: ${analysisData.readabilityScore}
- Analysis Time: ${analysisData.timestamp}`;
        },
    });

    // Create comprehensive analysis chain
    console.log('\n🏗️ Building Chain with Custom Functions:');
    console.log('   1. Custom text analysis (RunnableLambda)');
    console.log('   2. Data formatting (RunnableLambda)');
    console.log('   3. LLM-based insights generation');

    const comprehensiveAnalysisChain = RunnableSequence.from([
        textAnalyzer,
        dataFormatter,
        ChatPromptTemplate.fromTemplate(
            `Based on this text analysis report, provide insights and recommendations:

{formatted_report}

Please provide:
1. Key observations about the text
2. Suggestions for improvement
3. Target audience assessment
4. Content optimization recommendations`
        ),
        model,
        new StringOutputParser(),
    ]);

    // Test texts for analysis
    const testTexts = [
        "I absolutely love programming with LangChain! It's an amazing framework that makes building AI applications incredibly easy and fun. The documentation is excellent and the community is very supportive.",
        
        "The weather today is quite unpredictable. It started sunny but then became cloudy. I'm not sure if I should bring an umbrella or not. These climate changes are really confusing.",
        
        "This product is terrible. The quality is awful and the customer service is the worst I've ever experienced. I hate everything about this purchase and would never recommend it to anyone."
    ];

    for (let i = 0; i < testTexts.length; i++) {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`📄 Analyzing Text Sample ${i + 1}`);
        console.log(`${'='.repeat(50)}`);
        
        console.log('📝 Input Text:');
        console.log(`   "${testTexts[i]}"`);

        if (process.env.OPENAI_API_KEY) {
            try {
                console.log('\n🔄 Running comprehensive analysis chain...');
                
                const result = await comprehensiveAnalysisChain.invoke({
                    text: testTexts[i]
                });
                
                console.log('✅ Analysis completed!');
                console.log('\n🧠 AI Insights:');
                console.log(result);
                
            } catch (error) {
                console.log('❌ Error in analysis chain:', error.message);
            }
        } else {
            console.log('\n⚠️  OpenAI API Key not found. Running custom analysis only...');
            try {
                const analysis = await textAnalyzer.invoke({ text: testTexts[i] });
                const formatted = await dataFormatter.invoke(analysis);
                console.log('📊 Custom Analysis Result:');
                console.log(formatted);
            } catch (error) {
                console.log('❌ Error in custom analysis:', error.message);
            }
        }
    }

    // Advanced custom function: Content categorizer
    console.log(`\n${'='.repeat(60)}`);
    console.log('🏷️ Advanced Custom Function: Content Categorizer');
    console.log(`${'='.repeat(60)}`);

    const contentCategorizer = new RunnableLambda({
        func: (input) => {
            console.log('🏷️ Running content categorization...');
            
            const text = typeof input === 'string' ? input : input.text || '';
            const lowerText = text.toLowerCase();
            
            const categories = {
                technology: ['ai', 'machine learning', 'programming', 'software', 'computer', 'algorithm', 'data'],
                business: ['market', 'sales', 'revenue', 'profit', 'customer', 'strategy', 'growth'],
                science: ['research', 'study', 'experiment', 'hypothesis', 'theory', 'analysis', 'discovery'],
                health: ['medical', 'health', 'doctor', 'patient', 'treatment', 'medicine', 'wellness'],
                education: ['learning', 'student', 'teacher', 'school', 'university', 'knowledge', 'study']
            };
            
            const scores = {};
            for (const [category, keywords] of Object.entries(categories)) {
                scores[category] = keywords.filter(keyword => lowerText.includes(keyword)).length;
            }
            
            const topCategory = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
            const confidence = Math.max(...Object.values(scores)) / text.split(' ').length;
            
            return {
                text: text,
                category: topCategory,
                confidence: Math.round(confidence * 1000) / 10, // percentage with 1 decimal
                scores: scores,
                timestamp: new Date().toISOString()
            };
        },
    });

    // Chain with categorization
    const categorizationChain = RunnableSequence.from([
        contentCategorizer,
        ChatPromptTemplate.fromTemplate(
            `Content Category Analysis:
Text: "{text}"
Predicted Category: {category}
Confidence: {confidence}%
Category Scores: {scores}

Based on this categorization, suggest:
1. Relevant topics to explore
2. Target audience for this content
3. Related content recommendations`
        ),
        model,
        new StringOutputParser(),
    ]);

    const categorizationTests = [
        "Machine learning algorithms are revolutionizing how we process data and make predictions in software applications.",
        "The quarterly sales report shows significant growth in our customer acquisition metrics and revenue streams.",
        "Recent medical research indicates promising results in the treatment of cardiovascular diseases using innovative therapies."
    ];

    for (let i = 0; i < categorizationTests.length; i++) {
        console.log(`\n📋 Categorization Test ${i + 1}:`);
        console.log(`   "${categorizationTests[i].substring(0, 80)}..."`);
        
        if (process.env.OPENAI_API_KEY) {
            try {
                const result = await categorizationChain.invoke({ text: categorizationTests[i] });
                console.log('🏷️ Categorization result:', result.substring(0, 200) + '...');
            } catch (error) {
                console.log('❌ Error:', error.message);
            }
        } else {
            try {
                const categoryResult = await contentCategorizer.invoke({ text: categorizationTests[i] });
                console.log('🏷️ Category:', categoryResult.category);
                console.log('📊 Confidence:', categoryResult.confidence + '%');
            } catch (error) {
                console.log('❌ Error:', error.message);
            }
        }
    }

    console.log('\n✅ LCEL with Custom Functions Demo completed!');
    console.log('💡 Key takeaways:');
    console.log('   • RunnableLambda integrates custom logic seamlessly');
    console.log('   • Custom functions can preprocess and analyze data');
    console.log('   • Combine custom analysis with LLM capabilities');
    console.log('   • Build sophisticated data processing pipelines');
    console.log('   • Custom functions enhance chain capabilities');
}

// Execute the demo
lcelWithCustomFunctionsDemo().catch(console.error);
