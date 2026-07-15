import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, plantType } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!GEMINI_API_KEY && !OPENAI_API_KEY && !LOVABLE_API_KEY) {
      throw new Error("No API key configured. Please set GEMINI_API_KEY or OPENAI_API_KEY in your Supabase project settings.");
    }

    const systemPrompt = `You are an expert plant pathologist AI. Analyze the plant leaf image and identify any diseases or health issues.

Your response must be a valid JSON object with this exact structure:
{
  "disease_name": "string - the name of the disease or 'Healthy Plant' if no disease detected",
  "confidence": number - confidence percentage from 0 to 100,
  "severity": "string - one of: healthy, mild, moderate, severe",
  "description": "string - brief description of the condition",
  "symptoms": "string - visible symptoms in the image",
  "causes": "string - what causes this condition",
  "organic_treatments": "string - organic/natural treatment options",
  "chemical_treatments": "string - chemical treatment options",
  "prevention_tips": "string - how to prevent this condition",
  "plant_type": "string - identified plant type if recognizable"
}

Be accurate and helpful. If you cannot clearly identify the plant or disease, provide your best assessment with a lower confidence score. Focus on common agricultural and garden plant diseases.`;

    const userPrompt = plantType 
      ? `Analyze this ${plantType} leaf image for diseases or health issues.`
      : `Analyze this plant leaf image for diseases or health issues. Also try to identify the plant type.`;

    let content = "";

    if (GEMINI_API_KEY) {
      console.log("Using direct Gemini API...");
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemPrompt}\n\nUser request: ${userPrompt}` },
                  {
                    inlineData: {
                      mimeType: "image/jpeg",
                      data: image,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", response.status, errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const aiResponse = await response.json();
      content = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text;
    } else if (OPENAI_API_KEY) {
      console.log("Using direct OpenAI API...");
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: userPrompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${image}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API error:", response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const aiResponse = await response.json();
      content = aiResponse.choices?.[0]?.message?.content;
    } else {
      console.log("Using Lovable AI Gateway...");
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: userPrompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${image}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Gateway error:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Service credits exhausted. Please contact support or configure GEMINI_API_KEY/OPENAI_API_KEY." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const aiResponse = await response.json();
      content = aiResponse.choices?.[0]?.message?.content;
    }

    if (!content) {
      throw new Error("No response from AI service");
    }

    // Parse the JSON response from the AI
    let result;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Provide a fallback response
      result = {
        disease_name: "Analysis Unavailable",
        confidence: 0,
        severity: "healthy",
        description: "Unable to analyze the image. Please try with a clearer photo.",
        symptoms: "N/A",
        causes: "N/A",
        organic_treatments: "Please consult a local agricultural expert.",
        chemical_treatments: "Please consult a local agricultural expert.",
        prevention_tips: "Ensure good growing conditions and regular monitoring.",
        plant_type: plantType || "Unknown",
      };
    }

    // Ensure required fields exist
    result.plant_type = result.plant_type || plantType || null;
    result.confidence = Math.min(100, Math.max(0, result.confidence || 0));
    
    // Validate severity
    const validSeverities = ["healthy", "mild", "moderate", "severe"];
    if (!validSeverities.includes(result.severity)) {
      result.severity = "healthy";
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-plant function:", error);
    const errorMessage = error instanceof Error ? error.message : "Analysis failed";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
