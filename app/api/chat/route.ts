import { NextResponse } from 'next/server';
import { getNetworkStats, getPodCredits } from '@/lib/bot-data';

// System prompt
const SYSTEM_PROMPT = `You are the XAND Bot, an AI assistant for the Xandeum Network.
You have access to real-time network data via the 'get_network_stats' tool.
ALWAYS use this tool to answer questions about:
- Node counts (total, online, offline)
- Network Health (percentage of online nodes)
- Geographic distribution (Top countries, cities)
- Versions and Storage usage
- Public vs Private nodes
- Pod Credits (check credits for specific pods or list top pods)

Definitions:
- "Online": Node seen within the last 5 minutes.
- "Health Score": The percentage of nodes that are currently online.
- "Storage": Aggregated storage used by all nodes.

Answer concisely and professionally. Present the data clearly (e.g., using bullet points for countries).
Current Date: ${new Date().toISOString()}

Knowledge Base:
- **Xandeum**: A scalable storage layer built natively on Solana, enabling "storage-enabled dApps" (sedApps).
- **pNodes (Provider Nodes)**: Community-operated nodes that store data (exabytes capacity) and earn rewards.
- **vNodes (Validator Nodes)**: Supervise pNodes and ensure data integrity.
- **Technology**: Uses "Erasure Coding" (splitting files into shards) and cryptographic proofs (Poke, Peek, Prove) for security.
- **XAND Token**: Native governance token.
- **XandSOL**: Liquid staking token.
- **Goal**: To solve the blockchain storage trilemma by offering decentralized, scalable storage with random access.

Refuse to answer questions unrelated to Xandeum or general blockchain topics unless they connect back to Xandeum's context.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OpenAI API Key' }, { status: 500 });
    }

    // Tools definition
    const tools = [
      {
        type: "function",
        function: {
          name: "get_network_stats",
          description: "Get comprehensive Xandeum network statistics including health score, top countries, cities, online/offline counts, etc.",
          parameters: {
            type: "object",
            properties: {},
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_pod_credits",
          description: "Get the current credit balance for all pods. Use this to answer questions about specific pod credits or to list pods with the most credits.",
          parameters: {
            type: "object",
            properties: {},
          },
        },
      }
    ];

    // First call to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        tools: tools,
        tool_choice: "auto"
      })
    });

    const data = await response.json();
    
    if (data.error) {
       console.error("OpenAI Error:", data.error);
       return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const message = data.choices[0].message;

    // Handle Tool Calls
    if (message.tool_calls) {
      const toolCAlls = message.tool_calls;
      const functionResponseMessages = [];

      for (const toolCall of toolCAlls) {
        if (toolCall.function.name === 'get_network_stats') {
          try {
            const stats = await getNetworkStats();
            
            functionResponseMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "get_network_stats",
              content: JSON.stringify(stats),
            });
          } catch (e: any) {
            functionResponseMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "get_network_stats",
              content: `Error fetching data: ${e.message}`,
            });
          }
        } else if (toolCall.function.name === 'get_pod_credits') {
          try {
            const credits = await getPodCredits();
            
            functionResponseMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "get_pod_credits",
              content: JSON.stringify(credits),
            });
          } catch (e: any) {
            functionResponseMessages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: "get_pod_credits",
              content: `Error fetching credits: ${e.message}`,
            });
          }
        }
      }

      // Second call to OpenAI with tool outputs
      const secondResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages,
            message,
            ...functionResponseMessages
          ]
        })
      });

      const secondData = await secondResponse.json();
      return NextResponse.json(secondData.choices[0].message);
    }

    return NextResponse.json(message);

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
