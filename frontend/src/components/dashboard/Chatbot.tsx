import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Mic, MicOff, Volume2, Bot } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

// Type for prediction data (matching backend response)
type Crop = { name: string; water_required_liters: number };
type YieldRow = {
  crop_name: string;
  yield_amount: number;
  market_rate_per_unit: number;
  cost_of_selling: number;
  cost_of_growing: number;
  roi: number;
};

export interface PredictionData {
  crops: Crop[];
  yield_data: YieldRow[];
  crop_timeline: { crop: string; season: string; suitable_months: string[] }[];
  best_sowing_time: string;
  climate_data: {
    avg_temp: number;
    avg_soil_moisture: number;
    avg_surface_temp: number;
    total_rainfall: number;
  };
  soil_info: {
    type: string;
    water_retention: string;
    nutrient_content: string;
    pH_level: number;
  };
}

interface ChatbotProps {
  predictionData?: PredictionData | null;
}

type Language = "en" | "hi" | "kn";

const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  hi: "हिंदी",
  kn: "ಕನ್ನಡ",
};

const WELCOME_MESSAGES: Record<Language, string> = {
  en: "Hello! I'm your GreenBytes voice assistant. I can answer questions about your crop recommendations, yields, ROI, and farming data. Click the microphone to speak!",
  hi: "नमस्ते! मैं आपका GreenBytes वॉयस सहायक हूं। मैं आपकी फसल की सिफारिशों, पैदावार, ROI और खेती के डेटा के बारे में सवालों के जवाब दे सकता हूं। बोलने के लिए माइक्रोफोन पर क्लिक करें!",
  kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ GreenBytes ವಾಯ್ಸ್ ಸಹಾಯಕ. ನಾನು ನಿಮ್ಮ ಫಸಲು ಶಿಫಾರಸುಗಳು, ಇಳುವರಿ, ROI ಮತ್ತು ಕೃಷಿ ಡೇಟಾ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರ ನೀಡಬಹುದು. ಮಾತನಾಡಲು ಮೈಕ್ರೊಫೋನ್‌ನಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ!",
};

const Chatbot = ({ predictionData }: ChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: WELCOME_MESSAGES.en,
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<boolean>(false);
  // Use ref to always have the latest predictionData value
  const predictionDataRef = useRef<PredictionData | null | undefined>(predictionData);

  // Update ref whenever predictionData changes
  useEffect(() => {
    predictionDataRef.current = predictionData;
    console.log("Chatbot: predictionData received:", predictionData);
    console.log("Chatbot: Full predictionData structure:", JSON.stringify(predictionData, null, 2));
    if (predictionData) {
      console.log("Chatbot: Data breakdown:", {
        crops: predictionData.crops,
        cropsLength: predictionData.crops?.length,
        yield_data: predictionData.yield_data,
        yieldDataLength: predictionData.yield_data?.length,
        climate_data: predictionData.climate_data,
        soil_info: predictionData.soil_info,
        hasCrops: !!(predictionData.crops && predictionData.crops.length > 0),
        hasYieldData: !!(predictionData.yield_data && predictionData.yield_data.length > 0),
        hasClimateData: !!predictionData.climate_data,
        hasSoilInfo: !!predictionData.soil_info,
      });
    }
  }, [predictionData]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        handleVoiceInput(finalTranscript.trim());
      }
    };

    // Load voices for text-to-speech
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        console.log("Voices loaded:", speechSynthesis.getVoices().length);
      };
    }

    // Preload voices
    const voices = speechSynthesis.getVoices();
    console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`));
  }, []);

  // Update welcome message when language changes
  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: WELCOME_MESSAGES[language],
        isBot: true,
        timestamp: new Date(),
      },
    ]);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  const getBotResponse = async (userMessage: string): Promise<string> => {
    // Always use the latest value from ref to avoid stale closure issues
    const currentPredictionData = predictionDataRef.current;
    
    console.log("getBotResponse called with message:", userMessage);
    console.log("Current predictionData (from ref):", currentPredictionData);
    console.log("Current predictionData (from props):", predictionData);
    console.log("predictionData details:", {
      exists: !!currentPredictionData,
      hasCrops: !!(currentPredictionData?.crops?.length),
      hasYieldData: !!(currentPredictionData?.yield_data?.length),
      hasClimateData: !!currentPredictionData?.climate_data,
      hasSoilInfo: !!currentPredictionData?.soil_info,
    });
    
    // More lenient check: data exists if we have any meaningful prediction data
    // (crops, yield_data, climate_data, or soil_info)
    // Also check if predictionData is a valid object (not null/undefined)
    const isValidObject = currentPredictionData && typeof currentPredictionData === 'object' && !Array.isArray(currentPredictionData);
    
    const hasCrops = !!(currentPredictionData?.crops && Array.isArray(currentPredictionData.crops) && currentPredictionData.crops.length > 0);
    const hasYieldData = !!(currentPredictionData?.yield_data && Array.isArray(currentPredictionData.yield_data) && currentPredictionData.yield_data.length > 0);
    const hasClimateData = !!(currentPredictionData?.climate_data && typeof currentPredictionData.climate_data === 'object' && currentPredictionData.climate_data !== null);
    const hasSoilInfo = !!(currentPredictionData?.soil_info && typeof currentPredictionData.soil_info === 'object' && currentPredictionData.soil_info !== null);
    const hasCropTimeline = !!(currentPredictionData?.crop_timeline && Array.isArray(currentPredictionData.crop_timeline) && currentPredictionData.crop_timeline.length > 0);
    const hasBestSowingTime = !!(currentPredictionData?.best_sowing_time && typeof currentPredictionData.best_sowing_time === 'string' && currentPredictionData.best_sowing_time.length > 0);
    
    // Accept data if we have any valid field
    const hasData = isValidObject && (hasCrops || hasYieldData || hasClimateData || hasSoilInfo || hasCropTimeline || hasBestSowingTime);
    
    console.log("Chatbot: Validation check:", {
      predictionDataExists: !!currentPredictionData,
      hasCrops,
      hasYieldData,
      hasClimateData,
      hasSoilInfo,
      hasCropTimeline,
      hasBestSowingTime,
      hasData,
      cropsType: typeof currentPredictionData?.crops,
      yieldDataType: typeof currentPredictionData?.yield_data,
      isCropsArray: Array.isArray(currentPredictionData?.crops),
      isYieldDataArray: Array.isArray(currentPredictionData?.yield_data),
    });
    
    if (!hasData) {
      console.error("Chatbot: No valid prediction data available!", {
        currentPredictionData,
        predictionDataType: typeof currentPredictionData,
        isNull: currentPredictionData === null,
        isUndefined: currentPredictionData === undefined,
        refValue: predictionDataRef.current,
        propValue: predictionData,
      });
      const noDataResponse: Record<Language, string> = {
        en: "I need crop prediction data to answer your questions. Please complete the land analysis first.",
        hi: "आपके सवालों के जवाब देने के लिए मुझे फसल की भविष्यवाणी डेटा चाहिए। पहले भूमि विश्लेषण पूरा करें।",
        kn: "ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರ ನೀಡಲು ನನಗೆ ಫಸಲು ಭವಿಷ್ಯವಾಣಿ ಡೇಟಾ ಬೇಕು. ಮೊದಲು ಭೂಮಿ ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣ ಮಾಡಿ.",
      };
      return noDataResponse[language];
    }
    
    console.log("Prediction data is available, proceeding with API call");

    try {
      const response = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userMessage,
          prediction_data: currentPredictionData,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from chatbot");
      }

      const data = await response.json();
      
      // Return the answer or a fallback message based on language
      if (data.answer) {
        return data.answer;
      }
      
      const fallbackMessages: Record<Language, string> = {
        en: "I apologize, but I couldn't generate a response. Please try rephrasing your question.",
        hi: "मुझे खेद है, लेकिन मैं प्रतिक्रिया उत्पन्न नहीं कर सका। कृपया अपने सवाल को फिर से तैयार करने का प्रयास करें।",
        kn: "ಕ್ಷಮಿಸಿ, ನಾನು ಪ್ರತಿಕ್ರಿಯೆ ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಮರುರೂಪಿಸಲು ಪ್ರಯತ್ನಿಸಿ.",
      };
      
      return fallbackMessages[language];
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      const errorResponse: Record<Language, string> = {
        en: "I'm having trouble connecting to the server. Please check your connection and try again.",
        hi: "मुझे सर्वर से जुड़ने में समस्या हो रही है। कृपया अपना कनेक्शन जांचें और फिर से कोशिश करें।",
        kn: "ನಾನು ಸರ್ವರ್‌ಗೆ ಸಂಪರ್ಕ ಸ್ಥಾಪಿಸಲು ಸಮಸ್ಯೆಯನ್ನು ಎದುರಿಸುತ್ತಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      };
      return errorResponse[language];
    }
  };

  const handleVoiceInput = async (transcript: string) => {
    if (!transcript.trim()) return;

    setIsProcessing(true);

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: transcript,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const botResponse = await getBotResponse(transcript);

      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      // Speak the response
      speakResponse(botResponse);
    } catch (error) {
      console.error("Error in handleVoiceInput:", error);
      const errorResponse: Record<Language, string> = {
        en: "I encountered an error processing your question. Please try again.",
        hi: "आपके सवाल को प्रोसेस करने में मुझे त्रुटि का सामना करना पड़ा। कृपया फिर से कोशिश करें।",
        kn: "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುವಲ್ಲಿ ನಾನು ದೋಷವನ್ನು ಎದುರಿಸಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      };
      const errorMessage: Message = {
        id: messages.length + 2,
        text: errorResponse[language],
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      speakResponse(errorResponse[language]);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text: string) => {
    if (synthesisRef.current) return; // Prevent multiple simultaneous speech

    const utterance = new SpeechSynthesisUtterance(text);

    // Map languages to speech synthesis language codes
    const languageMap: Record<Language, string> = {
      en: "en-US",
      hi: "hi-IN",
      kn: "kn-IN",
    };

    utterance.lang = languageMap[language];
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to select voice for the specified language
    const voices = speechSynthesis.getVoices();
    const selectedLanguage = languageMap[language];
    
    // Find a voice that matches the language
    const matchedVoice = voices.find((voice) => {
      return voice.lang === selectedLanguage || voice.lang.startsWith(selectedLanguage.split("-")[0]);
    });

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    } else {
      // Fallback: try to find any voice with the language code prefix
      const fallbackVoice = voices.find((voice) =>
        voice.lang.startsWith(language)
      );
      if (fallbackVoice) {
        utterance.voice = fallbackVoice;
      }
    }

    utterance.onstart = () => {
      synthesisRef.current = true;
    };

    utterance.onend = () => {
      synthesisRef.current = false;
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      synthesisRef.current = false;
    };

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.lang = language === "en" ? "en-US" : language === "hi" ? "hi-IN" : "kn-IN";
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[380px] h-[550px] shadow-2xl z-50 flex flex-col">
          <CardHeader className="border-b border-border py-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="w-5 h-5 text-primary" />
                GreenBytes Voice
              </CardTitle>
              <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी</SelectItem>
                  <SelectItem value="kn">ಕನ್ನಡ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${
                      message.isBot ? "justify-start" : "justify-end"
                    }`}
                  >
                    {message.isBot && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.isBot
                          ? "bg-muted text-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl px-4 py-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Voice Controls */}
            <div className="p-4 border-t border-border space-y-3">
              <div className="text-center text-xs text-muted-foreground">
                {isListening
                  ? "🎤 Listening..."
                  : isProcessing
                    ? "Processing..."
                    : "Click to speak"}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={startListening}
                  disabled={isListening || isProcessing}
                  className="flex-1"
                  variant={isListening ? "destructive" : "default"}
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Start
                </Button>
                <Button
                  onClick={stopListening}
                  disabled={!isListening}
                  variant="outline"
                  className="flex-1"
                >
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop
                </Button>
                <Button
                  onClick={() => {
                    if (messages.length > 1) {
                      const lastBotMessage = messages.findLast(
                        (m) => m.isBot && m.id !== 1
                      );
                      if (lastBotMessage) {
                        speakResponse(lastBotMessage.text);
                      }
                    }
                  }}
                  variant="outline"
                  size="icon"
                  title="Repeat last response"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Chatbot;
