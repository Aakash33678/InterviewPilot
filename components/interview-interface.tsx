"use client";

import { useState, useRef, useEffect } from "react";
import { getInterviewQuestions, submitAnswer } from "@/app/actions/interview";
import { Button } from "@/components/ui/button";

interface Question {
  id: string;
  questionNumber: number;
  questionText: string;
  category: string;
  difficulty: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  isFinal: boolean;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function InterviewInterface({ interviewId }: { interviewId: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editedTranscript, setEditedTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const startTimeRef = useRef(0);
  const recordingRef = useRef(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsRecording(true);
      startTimeRef.current = Date.now();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalText += text + " ";
        } else {
          interimText += text;
        }
      }

      setTranscript((prev) => prev + finalText);
      setEditedTranscript("");
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      if (recordingRef.current) {
        recognition.start();
      } else {
        setIsRecording(false);
      }
    };

    recognitionRef.current = recognition;

    // Fetch questions
    const fetchQuestions = async () => {
      try {
        const q = await getInterviewQuestions(interviewId);
        setQuestions(q);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [interviewId]);

  const getQuestionTime = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return 30;
      case "medium":
        return 60;
      case "hard":
        return 120;
      default:
        return 60;
    }
  };

  useEffect(() => {
    if (questions.length === 0) return;

    setTimeLeft(getQuestionTime(questions[currentQuestionIndex].difficulty));

    setTimerRunning(false);
  }, [questions, currentQuestionIndex]);

  useEffect(() => {
    if (!timerRunning) return;

    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  // Text-to-speech for questions
  const speakQuestion = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!("speechSynthesis" in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;

      utterance.onend = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  };

  const handleStartRecording = async () => {
    setTranscript(transcript);
    setEditedTranscript(editedTranscript);

    await speakQuestion(currentQuestion.questionText);
    recordingRef.current = true;
    setTimerRunning(true);
    recognitionRef.current?.start();
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recordingRef.current = false;
      setTimerRunning(false);
      recognitionRef.current.stop();
    }
  };

  const handleTimeUp = async () => {
    setTimerRunning(false);

    recognitionRef.current?.stop();

    await handleSubmitAnswer();
  };
  const handleSubmitAnswer = async () => {
    if (!transcript && !editedTranscript) {
      alert("Please provide an answer");
      return;
    }

    setIsProcessing(true);
    try {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const finalTranscript = editedTranscript || transcript;

      await submitAnswer(
        questions[currentQuestionIndex].id,
        finalTranscript,
        duration,
      );

      // Move to next question
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setTranscript("");
        setEditedTranscript("");
        setTimerRunning(false);
      } else {
        // Interview complete
        window.location.href = `/interview-complete/${interviewId}`;
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to submit answer");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">Loading interview questions...</div>
    );
  }

  if (questions.length === 0) {
    return <div className="text-center py-12">No questions found</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>

          <div
            className={`font-bold ${
              timeLeft <= 10 ? "text-red-600" : "text-primary"
            }`}
          >
            {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
            <span className="text-xs text-muted-foreground ml-2">
              {currentQuestion.difficulty}
            </span>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-card rounded-lg border p-6">
        <p className="text-sm text-muted-foreground mb-2">Current Question</p>
        <p className="text-lg font-medium">{currentQuestion.questionText}</p>
        <div className="flex gap-2 mt-4">
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded capitalize">
            {currentQuestion.category}
          </span>
        </div>
      </div>

      {/* Recording Section */}
      <div className="bg-muted rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Your Answer</h3>
          {isRecording && (
            <span className="inline-flex items-center gap-2 text-sm text-red-600">
              <span className="inline-block w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
              Recording...
            </span>
          )}
        </div>

        {/* Transcript Display */}
        <div className="bg-background rounded border p-4 min-h-24">
          <textarea
            value={editedTranscript || transcript}
            onChange={(e) => setEditedTranscript(e.target.value)}
            placeholder="Your transcribed answer will appear here..."
            className="w-full min-h-24 bg-background border rounded p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Transcript Editing */}
        <div>
          <label className="text-sm font-medium block mb-2">
            Edit Transcript
          </label>
          <textarea
            value={editedTranscript}
            onChange={(e) => setEditedTranscript(e.target.value)}
            placeholder="You can edit or rewrite your answer here"
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            disabled={isRecording}
          />
        </div>

        {/* Recording Controls */}
        <div className="flex gap-3">
          {!isRecording ? (
            <Button
              onClick={handleStartRecording}
              className="flex-1"
              disabled={isProcessing}
              variant="default"
            >
              🎤 Read Question
            </Button>
          ) : (
            <Button
              onClick={handleStopRecording}
              className="flex-1"
              disabled={isProcessing}
              variant="destructive"
            >
              ⏹ Stop Recording
            </Button>
          )}
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmitAnswer}
          className="w-full"
          disabled={isProcessing || isRecording}
          variant="default"
        >
          {isProcessing ? "Evaluating..." : "Submit Answer & Next Question"}
        </Button>
      </div>
    </div>
  );
}
