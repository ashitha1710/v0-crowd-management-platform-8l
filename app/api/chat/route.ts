import { NextRequest, NextResponse } from 'next/server';
import { VectorStore } from '@/lib/vector-db';

let vectorStore: VectorStore | null = null;

// Initialize vector store
async function getVectorStore(): Promise<VectorStore> {
  if (!vectorStore) {
    console.log('Initializing vector store...');
    vectorStore = new VectorStore();
    await vectorStore.initializeKnowledgeBase();
  }
  return vectorStore;
}

// Check for medical symptoms and return appropriate protocol
function checkForSymptoms(query: string): string | null {
  if (query.includes('dizzy') || query.includes('dizziness')) {
    return `Based on medical protocols:

Heat Exhaustion Management
Heat Exhaustion Management. Symptoms: Excessive sweating, dizziness, weakness, nausea. Treatment: Move person to cool, shaded area. Remove excess clothing. Provide cool water to drink slowly. Apply cool, wet cloths to skin. Seek medical attention if symptoms worsen.

For any medical emergency, assess the situation first and activate emergency services immediately by calling 911.`;
  }

  if (query.includes('bleeding') || query.includes('bleed')) {
    return `Based on medical protocols:

Traumatic Injuries
Traumatic Injuries. Severe bleeding: Apply direct pressure with clean cloth. Immobilize injured area if fracture suspected. Burns: Cool with water, cover with clean cloth, prevent contamination.

For any medical emergency, assess the situation first and activate emergency services immediately by calling 911.`;
  }

  if (query.includes('fell') || query.includes('fallen') || query.includes('fell down')) {
    return `Based on medical protocols:

Traumatic Injuries
Traumatic Injuries. Spinal injuries: Keep person still, do not move unless necessary. Severe bleeding: Apply direct pressure with clean cloth. Fractures: Immobilize injured area, apply ice if possible. Burns: Cool with water, cover with clean cloth, prevent contamination.

For any medical emergency, assess the situation first and activate emergency services immediately by calling 911.`;
  }

  return null; // No symptoms detected
}

// Generate response using retrieved context
function generateResponse(query: string, relevantBlocks: string[], context?: string): string {
  // Specific symptom-based matching even if semantic search fails
  const symptomMatch = checkForSymptoms(query.toLowerCase());
  if (symptomMatch && relevantBlocks.length === 0) {
    return symptomMatch;
  }

  if (relevantBlocks.length === 0) {
    // Fallback to mock response if no relevant information found
    return generateMockResponse(query, context);
  }

  // Combine relevant blocks into context
  const contextText = relevantBlocks.join('\n\n---\n\n');

  // Based on the query and retrieved context, generate appropriate response
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('medical') || lowerQuery.includes('injury') || lowerQuery.includes('emergency')) {
    return `Based on medical protocols:\n\n${contextText}\n\nFor any medical emergency, assess the situation first and activate emergency services immediately by calling 911.`;
  }

  if (lowerQuery.includes('fire') || lowerQuery.includes('evacuat')) {
    return `Fire safety protocols indicate:\n\n${contextText}\n\nIf you discover fire or smoke, activate the nearest alarm and evacuate immediately to the nearest emergency exit.`;
  }

  if (lowerQuery.includes('gate') || lowerQuery.includes('open')) {
    return `Gate management guidelines:\n\n${contextText}\n\nEmergency gates should always remain unlocked during operating hours for immediate exit access.`;
  }

  // General response with context
  return `Based on the knowledge base:\n\n${contextText}\n\nThis information is for trained emergency personnel. In a real emergency, always prioritize human life and contact professional emergency services.`;
}

// Fallback mock response generation (from original chatbot)
function generateMockResponse(input: string, context?: string): string {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes("crowd") || lowerInput.includes("density")) {
    return "Current crowd density monitoring shows variable levels across zones. Use the real-time dashboard for specific zone information. I can help coordinate crowd management if you provide more details.";
  }

  if (lowerInput.includes("lost") || lowerInput.includes("find")) {
    return "For lost person situations, activate the CCTV monitoring system and search each zone systematically. I'll help coordinate the search if you provide specific details about the missing person.";
  }

  if (lowerInput.includes("incident") || lowerInput.includes("emergency")) {
    return "For incident management, follow the protocols in the medical response guidelines. I'll assist in coordinating the appropriate response team based on the type of incident.";
  }

  // Default response
  return "I understand you're asking about event management. I have access to comprehensive medical, fire safety, and gate management protocols. Could you be more specific about what you need assistance with?";
}

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get vector store instance
    const store = await getVectorStore();

    // Search for relevant documents using semantic similarity
    const searchResults = await store.search(message, 3);

    // Extract content from search results
    const relevantBlocks = searchResults.map(result => result.content);

    // Generate response using retrieved context
    const responseText = generateResponse(message, relevantBlocks, context);

    return NextResponse.json({
      message: responseText,
      retrieved_blocks: relevantBlocks,
      search_scores: searchResults.map(r => ({ score: r.score, source: r.source })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'RAG Chat API is running',
    knowledge_base: 'Medical, Fire Safety, and Gate Management protocols loaded'
  });
}
