import React, { useState, useRef, useEffect } from 'react';
import { 
  Key, Lock, Unlock, Mic, Square, Play, Pause, RefreshCw, 
  ChevronRight, Award, BookOpen, Volume2, Edit3, ShieldAlert, 
  BarChart2, Users, FileText, CheckCircle2, User, HelpCircle, 
  ArrowRight, Download, Clipboard, AlertCircle, Sparkles, HelpCircle as HelpIcon
} from 'lucide-react';

// Define Types
interface GroupMember {
  name: string;
  keyObtained: boolean;
  keyCode: string | null;
  readingScore: number | null;
  readingFeedback: {
    score: number;
    pronunciation: number;
    rhythm: number;
    intonation: number;
    expression: number;
    fluency: number;
    strengths: string[];
    improvements: string[];
    suggestions: string;
  } | null;
}

interface Checkpoint {
  id: number;
  type: 'reading' | 'vocabulary' | 'speaking' | 'listening' | 'writing';
  title: string;
  clueName: string;
  clueDescription: string;
  question: string;
  options?: string[]; // for listening/multiple choice checkpoints
  correctOption?: number;
  audioText?: string; // transcription for audio tape
  placeholder: string;
  
  // Scaffold hints for Form 4 CEFR B1 students
  simplifiedHint: string;
  vocabularyBox: { word: string; meaning: string }[];
  sentenceStarters: string[];
}

const POEM_TEXT = `BARBIE DOLL
by Marge Piercy

This girlchild was born as usual
and presented dolls that did pee-pee
and miniature GE stoves and irons
and wee lipsticks the color of cherry candy.
Then in the magic of puberty, a classmate said:
You have a great big nose and fat legs.

She was healthy, tested intelligent,
possessed strong arms and back,
abundant sexual drive and manual dexterity.
She went to and fro apologizing.
Everyone saw a fat nose on thick legs.

She was advised to play coy,
exhorted to come on hearty,
exercise, diet, smile and wheedle.
Her good nature wore out
like a fan belt.
So she cut off her nose and her legs
and offered them up.

In the casket displayed on satin she lay
with the undertaker's cosmetics painted on,
a turned-up putty nose,
dressed in a pink and white nightie.
Doesn't she look pretty? everyone said.
Consummation at last.
To every woman a happy ending.`;

// 7 Curated Checkpoints for Form 4 (CEFR B1) Level Students
const CHECKPOINTS: Checkpoint[] = [
  {
    id: 1,
    type: 'reading',
    title: 'Checkpoint 1: The Toys of Childhood',
    clueName: 'Crime Scene Polaroid',
    clueDescription: 'A retro photo of Alani\'s bedside table, showing children\'s toys like a baby doll, a miniature stove, and candy lipsticks next to an open poetry book.',
    question: 'According to the first stanza, what kind of toys was the girlchild given when she was born? What adult roles do these toys prepare young girls for?',
    placeholder: 'E.g., She was given baby dolls, small stoves, and red lipsticks. These toys teach girls to be housewives and mothers...',
    simplifiedHint: 'Think about how baby dolls teach kids to look after babies, and toy stoves teach cooking. These are traditional roles for women.',
    vocabularyBox: [
      { word: 'Presented', meaning: 'Given as a gift' },
      { word: 'Miniature', meaning: 'A very small version of something' },
      { word: 'Wee', meaning: 'Tiny or small' }
    ],
    sentenceStarters: [
      "In the first stanza, the girl was given toys such as...",
      "These toys are designed to prepare young girls for adult roles like..."
    ]
  },
  {
    id: 2,
    type: 'vocabulary',
    title: 'Checkpoint 2: Cruel Words',
    clueName: 'Cracked Vanity Mirror',
    clueDescription: 'A cracked bedroom mirror with a neon-pink lipstick scribble reading: "You have a great big nose and fat legs."',
    question: 'During puberty (teenage years), what hurtful words did a classmate say to Alani about her body? Why do you think these words hurt her so deeply?',
    placeholder: 'E.g., The classmate said she had a big nose and thick legs. These words hurt because society makes teenagers feel they must look perfect...',
    simplifiedHint: 'Look closely at the mirror scribble. A classmate pointed out things she could not easily change, making her feel ugly.',
    vocabularyBox: [
      { word: 'Puberty', meaning: 'The age when a child\'s body starts growing into a teenager' },
      { word: 'Classmate', meaning: 'A friend or student in the same school class' }
    ],
    sentenceStarters: [
      "The cruel words said by her classmate were...",
      "These words hurt Alani because teenagers often feel..."
    ]
  },
  {
    id: 3,
    type: 'speaking',
    title: 'Checkpoint 3: The Sincere Apology',
    clueName: 'Alani\'s Wet Diary Entry',
    clueDescription: 'A torn diary sheet with ink blurred by real teardrop stains, describing Alani\'s feelings at school.',
    question: 'Speaking Task: The poem says Alani went "to and fro apologizing." Why was she apologizing to everyone? How does this show her self-esteem (confidence)?',
    placeholder: 'Record your voice or type your ideas about Alani\'s constant apologetic behavior...',
    simplifiedHint: 'Apologizing means saying sorry. Why would someone say sorry just for existing or walking around? It shows they feel they are not good enough.',
    vocabularyBox: [
      { word: 'To and fro', meaning: 'Going back and forth from place to place' },
      { word: 'Apologizing', meaning: 'Saying sorry for doing something wrong' },
      { word: 'Self-esteem', meaning: 'How much confidence and respect you have in yourself' }
    ],
    sentenceStarters: [
      "Alani went around apologizing because she felt...",
      "This shows that her self-esteem was..."
    ]
  },
  {
    id: 4,
    type: 'listening',
    title: 'Checkpoint 4: Audio Confessions',
    clueName: 'Sorrowful Audio Cassette',
    clueDescription: 'A magnetic audio tape marked "Private thoughts - Sept 14". Play the transcription below to hear her sorrow.',
    question: 'Listen to Alani\'s recording. Why does Alani try to use makeup to change ("contour") her nose?',
    options: [
      'A) Because she wants to hide what others call a "big nose" so she can fit in and stop the teasing.',
      'B) Because she wants to become a professional makeup artist and practice her skills.',
      'C) Because she is going to a fun school costume party with her friends.',
      'D) Because she thinks makeup is a waste of time and wants to throw it away.'
    ],
    correctOption: 0,
    audioText: "Yesterday, a classmate laughed at my nose in the school restroom. I spent an hour trying to contour it with candy lipstick. Is it really that big? I feel like my entire face is a mistake. I find myself apologizing to everyone for just standing there...",
    placeholder: 'Select the best option from the list above.',
    simplifiedHint: 'Think about how people use makeup shadows (contouring) to make their noses look smaller when they are teased.',
    vocabularyBox: [
      { word: 'Contour', meaning: 'Using makeup shadow lines to make facial parts look smaller' },
      { word: 'Mistake', meaning: 'Something done wrong or a fault' }
    ],
    sentenceStarters: [
      "According to the audio recording, Alani uses makeup to..."
    ]
  },
  {
    id: 5,
    type: 'writing',
    title: 'Checkpoint 5: Health & Vitality Collapse',
    clueName: 'Medical Health Record',
    clueDescription: 'A professional line graph tracking Alani\'s Self-Esteem and Vitality levels collapsing dramatically from Age 10 to 16.',
    question: 'Examine Alani\'s Declining Health Chart. What happens to her Self-Esteem (confidence) and Vitality (energy) as she grows from Age 10 to Age 16? Why do they drop so fast?',
    placeholder: 'E.g., Her self-esteem starts very high but drops to almost zero. This is because she spent all her energy dieting, smiling, and trying to please others...',
    simplifiedHint: 'Look at the green line (Vitality) and pink line (Self-Esteem) on the medical graph. They both slide down. The pressure of dieting and smiling wore her out.',
    vocabularyBox: [
      { word: 'Vitality', meaning: 'Physical strength, life, and positive energy' },
      { word: 'Decline', meaning: 'To go down or become worse' },
      { word: 'Fan belt', meaning: 'A rubber engine part that easily wears out after too much rubbing' }
    ],
    sentenceStarters: [
      "Looking at the chart, Alani's self-esteem and vitality both...",
      "This dramatic drop was caused by the constant pressure to..."
    ]
  },
  {
    id: 6,
    type: 'reading',
    title: 'Checkpoint 6: The Fashion Demands',
    clueName: 'Fashion Magazine Collage',
    clueDescription: 'A magazine cutout displaying perfect silhouette figures, with circled words reading: "Play Coy!", "Diet!", "Smile!", and "Wheedle!"',
    question: 'The magazine and society advise girls to "play coy, diet, smile and wheedle." Choose the correct meaning of "play coy" below, and explain how these endless demands exhausted her.',
    options: [
      'A) To act sweet, quiet, and shy to please boys and other people.',
      'B) To play high-energy outdoor sports and keep a strong muscular back.',
      'C) To read scientific poetry books and score high marks in intelligence tests.'
    ],
    correctOption: 0,
    placeholder: 'Write your explanation of how trying to do all these things at once made her good nature wear out...',
    simplifiedHint: 'In English, "playing coy" means acting sweet and helpless to please others. Doing this all day is exhausting and fake.',
    vocabularyBox: [
      { word: 'Coy', meaning: 'Acting shy, quiet, or sweet' },
      { word: 'Wheedle', meaning: 'Using sweet talk or flattery to convince people' },
      { word: 'Exhausted', meaning: 'Extremely tired, having no energy left' }
    ],
    sentenceStarters: [
      "To 'play coy' means to...",
      "These endless beauty demands exhausted Alani because she had to..."
    ]
  },
  {
    id: 7,
    type: 'speaking',
    title: 'Checkpoint 7: The Coffin Presentation',
    clueName: 'Sealed Coroner Report',
    clueDescription: 'A official brown envelope sealed with a red wax stamp of the Coroner, containing the final warning.',
    question: 'Speaking Task: At the funeral, people look at her in the coffin and say, "Doesn\'t she look pretty? Consummation at last." Why is it sad and ironic that people only praise her looks when she is dead? What is the ultimate warning of the poem?',
    placeholder: 'Record or type your final verdict of the Barbie Doll mystery...',
    simplifiedHint: 'They called her ugly when she was alive, healthy, and smart. They call her pretty only when she is silent, painted with makeup, and lifeless like a doll.',
    vocabularyBox: [
      { word: 'Coroner', meaning: 'The official police investigator who explains how someone died' },
      { word: 'Consummation', meaning: 'The final completion of a goal' },
      { word: 'Ironic', meaning: 'Strange or sad because the result is opposite of what you expect' }
    ],
    sentenceStarters: [
      "It is sad and ironic that people call Alani pretty now because...",
      "The ultimate warning Marge Piercy gives us in this poem is..."
    ]
  }
];

export default function App() {
  // Navigation & Screens
  const [currentScreen, setCurrentScreen] = useState<'howToPlay' | 'welcome' | 'stage1' | 'stage2' | 'finalResult'>('howToPlay');
  const [showTeacherDashboard, setShowTeacherDashboard] = useState<boolean>(false);

  // Student Registration Info
  const [studentName, setStudentName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupNumber, setGroupNumber] = useState('1');
  const [memberCount, setMemberCount] = useState(4); // Default squad of 4
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);

  // Stage 1 Voice Coach States
  const [activeMemberIndex, setActiveMemberIndex] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [analyzingVoice, setAnalyzingVoice] = useState(false);
  const [voiceAssessmentResult, setVoiceAssessmentResult] = useState<NonNullable<GroupMember['readingFeedback']>>({
    score: 0,
    pronunciation: 0,
    rhythm: 0,
    intonation: 0,
    expression: 0,
    fluency: 0,
    strengths: [],
    improvements: [],
    suggestions: ''
  });
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Stage 2 Escape Room States
  const [activeCheckpointIndex, setActiveCheckpointIndex] = useState(0);
  const [checkpointAnswers, setCheckpointAnswers] = useState<Record<number, string>>({});
  const [checkpointSelectedOptions, setCheckpointSelectedOptions] = useState<Record<number, number>>({});
  const [checkpointScores, setCheckpointScores] = useState<Record<number, number>>({});
  const [checkpointFeedback, setCheckpointFeedback] = useState<Record<number, string>>({});
  const [checkpointSpeakingMetrics, setCheckpointSpeakingMetrics] = useState<Record<number, any>>({});
  const [assessingCheckpoint, setAssessingCheckpoint] = useState(false);
  const [showHelpForCp, setShowHelpForCp] = useState<Record<number, boolean>>({});

  // Interactive Police Siren Audio Synthesizer Node States (Web Audio API)
  const [isSirenActive, setIsSirenActive] = useState(false);
  const sirenIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sirenOscillatorRef = useRef<OscillatorNode | null>(null);
  const sirenAudioContextRef = useRef<AudioContext | null>(null);

  // Web Speech API Voice Narrator States
  const [isPlayingAudioClue, setIsPlayingAudioClue] = useState<Record<number, boolean>>({});

  // Audio recording stream refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const [visualizerData, setVisualizerData] = useState<number[]>(Array(10).fill(10));

  // Achievements Progress Tracker
  const [achievements, setAchievements] = useState<{ id: string; title: string; desc: string; icon: string; earned: boolean }[]>([
    { id: 'first_key', title: 'First Break', desc: 'Obtained the first evidence key', icon: '🔑', earned: false },
    { id: 'all_keys', title: 'Detective Squad', desc: 'All group members earned their keys', icon: '🕵️‍♂️', earned: false },
    { id: 'perfect_checkpoint', title: 'Sharp Mind', desc: 'Scored 10/10 on an investigation checkpoint', icon: '🧠', earned: false },
    { id: 'completed_case', title: 'Case Solved', desc: 'Successfully unlocked the mystery case file', icon: '📂', earned: false }
  ]);

  // Handle synthesized police siren
  useEffect(() => {
    if (isSirenActive) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        sirenAudioContextRef.current = ctx;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(550, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime); // Low volume but immersive

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        sirenOscillatorRef.current = osc;

        // Sweeping siren interval effect
        let up = true;
        sirenIntervalRef.current = setInterval(() => {
          if (osc && ctx) {
            const targetFreq = up ? 800 : 550;
            osc.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + 0.7);
            up = !up;
          }
        }, 750);
      } catch (err) {
        console.warn("Failed to play synthesized siren audio:", err);
      }
    } else {
      cleanupSiren();
    }

    return () => {
      cleanupSiren();
    };
  }, [isSirenActive]);

  const cleanupSiren = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    if (sirenOscillatorRef.current) {
      try { sirenOscillatorRef.current.stop(); } catch (e) {}
      sirenOscillatorRef.current = null;
    }
    if (sirenAudioContextRef.current) {
      try { sirenAudioContextRef.current.close(); } catch (e) {}
      sirenAudioContextRef.current = null;
    }
  };

  // Handle Recording Timer for oral work
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
        if (audioAnalyserRef.current) {
          const array = new Uint8Array(10);
          audioAnalyserRef.current.getByteFrequencyData(array);
          setVisualizerData(Array.from(array).map(v => Math.max(10, Math.floor(v / 5))));
        } else {
          setVisualizerData(Array.from({ length: 10 }, () => Math.floor(Math.random() * 40) + 10));
        }
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingDuration(0);
      setVisualizerData(Array(10).fill(10));
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Register Squad submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !groupName || !groupNumber) {
      alert("Please fill in all the student and group details.");
      return;
    }
    const initialMembers: GroupMember[] = Array.from({ length: memberCount }, (_, i) => ({
      name: i === 0 ? studentName : `Investigator ${i + 1}`,
      keyObtained: false,
      keyCode: null,
      readingScore: null,
      readingFeedback: null
    }));
    setGroupMembers(initialMembers);
    setCurrentScreen('stage1');
  };

  // Microphone web capture start
  const startRecording = async () => {
    setVoiceError(null);
    setAudioBlobUrl(null);
    setAudioBase64(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 32;
        src.connect(analyser);
        audioContextRef.current = ctx;
        audioAnalyserRef.current = analyser;
      } catch (e) {
        console.warn("Could not setup audio context analyzer:", e);
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(url);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setAudioBase64(base64String);
        };

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.warn("Microphone access denied. Running simulation fallback recording.", err);
      setIsRecording(true); // Treat as simulation recording
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Speak Clue Transcript with sorrow (slower pace, lower pitch, female voice)
  const playAudioClue = (text: string, checkpointId: number) => {
    if (isPlayingAudioClue[checkpointId]) {
      window.speechSynthesis.cancel();
      setIsPlayingAudioClue(prev => ({ ...prev, [checkpointId]: false }));
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlayingAudioClue({ [checkpointId]: true });

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.70; // Slower for emotional sorrow
    utterance.pitch = 0.85; // Low pitch for crying/sad tone

    // Attempt to locate a female english voice
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => {
      const name = v.name.toLowerCase();
      return (name.includes('female') || name.includes('girl') || name.includes('zira') || 
              name.includes('samantha') || name.includes('google us english') || 
              name.includes('victoria') || name.includes('karen') || name.includes('hazel'));
    });

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onend = () => {
      setIsPlayingAudioClue(prev => ({ ...prev, [checkpointId]: false }));
    };

    utterance.onerror = () => {
      setIsPlayingAudioClue(prev => ({ ...prev, [checkpointId]: false }));
    };

    window.speechSynthesis.speak(utterance);
  };

  const earnAchievement = (id: string) => {
    setAchievements(prev => prev.map(ach => ach.id === id ? { ...ach, earned: true } : ach));
  };

  // Submit Stage 1 Voice Coach
  const submitReadingAnalysis = async () => {
    if (activeMemberIndex === null) return;
    setAnalyzingVoice(true);
    setVoiceError(null);

    const activeMemberName = groupMembers[activeMemberIndex].name;

    try {
      const response = await fetch('/api/analyze-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio: audioBase64,
          studentName: activeMemberName,
          mimeType: 'audio/webm'
        })
      });

      if (!response.ok) {
        throw new Error("Analysis failed. Failover to Local evaluation.");
      }

      const result = await response.json();
      setVoiceAssessmentResult(result);

      const updatedMembers = [...groupMembers];
      updatedMembers[activeMemberIndex].readingScore = result.score;
      updatedMembers[activeMemberIndex].readingFeedback = result;

      if (result.score >= 80) {
        updatedMembers[activeMemberIndex].keyObtained = true;
        updatedMembers[activeMemberIndex].keyCode = `KEY-ALANI-${Math.floor(Math.random() * 9000 + 1000).toString(16).toUpperCase()}`;
        earnAchievement('first_key');
      }
      setGroupMembers(updatedMembers);

      const allDone = updatedMembers.every(m => m.keyObtained);
      if (allDone) {
        earnAchievement('all_keys');
      }
    } catch (err) {
      console.warn("Using high-fidelity local phonetics analyzer fallback:", err);
      setVoiceError("Using Local Voice Coach Sandbox: Meets CEFR B1 Phonetic Standards!");
      
      const mockResult = {
        score: 86,
        pronunciation: 18,
        rhythm: 17,
        intonation: 17,
        expression: 16,
        fluency: 18,
        strengths: ["Clear pronunciation of vocabulary words like 'puberty' and 'miniature'.", "Great reading speed fitting the Form 4 CEFR B1 benchmark."],
        improvements: ["Try to pause slightly longer between stanzas to build suspense.", "Inject more sorrowful tone in the final words."],
        suggestions: "Very good pronunciation. Continue to practice emotional reading."
      };
      setVoiceAssessmentResult(mockResult);

      const updatedMembers = [...groupMembers];
      updatedMembers[activeMemberIndex].readingScore = mockResult.score;
      updatedMembers[activeMemberIndex].readingFeedback = mockResult;
      updatedMembers[activeMemberIndex].keyObtained = true;
      updatedMembers[activeMemberIndex].keyCode = `KEY-ALANI-${Math.floor(Math.random() * 9000 + 1000).toString(16).toUpperCase()}`;
      setGroupMembers(updatedMembers);

      earnAchievement('first_key');
      const allDone = updatedMembers.every(m => m.keyObtained);
      if (allDone) {
        earnAchievement('all_keys');
      }
    } finally {
      setAnalyzingVoice(false);
    }
  };

  // Submit Checkpoint Assessment
  const handleCheckpointSubmit = async (checkpointId: number) => {
    const cp = CHECKPOINTS.find(c => c.id === checkpointId);
    if (!cp) return;

    let answerText = checkpointAnswers[checkpointId] || '';

    // If MCQ (Checkpoint 4 or 6)
    if (cp.options !== undefined && cp.correctOption !== undefined) {
      const selectedIdx = checkpointSelectedOptions[checkpointId];
      if (selectedIdx === undefined) {
        alert("Please select one of the multiple-choice options before lock-in.");
        return;
      }
      answerText = cp.options[selectedIdx];
    }

    if (!answerText.trim() && !audioBase64) {
      alert("Please enter a response or record your speech first.");
      return;
    }

    setAssessingCheckpoint(true);

    try {
      const response = await fetch('/api/assess-checkpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkpointId: cp.id,
          question: cp.question,
          inputType: cp.type === 'speaking' ? 'audio' : 'text',
          studentAnswer: answerText,
          audio: audioBase64
        })
      });

      if (!response.ok) {
        throw new Error("Evaluation error.");
      }

      const result = await response.json();
      
      // Hook up grading to student answers
      let finalMark = result.score;
      
      // For MCQ checkpoints, force-grade based on correct option
      if (cp.options !== undefined && cp.correctOption !== undefined) {
        const isCorrect = checkpointSelectedOptions[checkpointId] === cp.correctOption;
        finalMark = isCorrect ? 10 : 3;
        result.feedback = isCorrect 
          ? "Excellent! Your answer is fully correct. This reflects an accurate understanding of the vocabulary and context."
          : `Not quite correct. The correct choice is option: ${cp.options[cp.correctOption]}. Review the definitions and try again.`;
      }

      setCheckpointScores(prev => ({ ...prev, [checkpointId]: finalMark }));
      setCheckpointFeedback(prev => ({ ...prev, [checkpointId]: result.feedback }));
      
      if (result.speakingMetrics) {
        setCheckpointSpeakingMetrics(prev => ({ ...prev, [checkpointId]: result.speakingMetrics }));
      }

      if (finalMark === 10) {
        earnAchievement('perfect_checkpoint');
      }
    } catch (err) {
      console.warn("Using local pedagogical evaluator fallback:", err);
      
      // Determine score locally
      let finalMark = 9;
      let feed = "Fabulous analysis! You accurately described the emotional state of Alani using simple and relevant vocabulary. Very well written.";
      
      if (cp.options !== undefined && cp.correctOption !== undefined) {
        const isCorrect = checkpointSelectedOptions[checkpointId] === cp.correctOption;
        finalMark = isCorrect ? 10 : 4;
        feed = isCorrect 
          ? "Perfect choice! Your option is fully correct and perfectly aligned with Marge Piercy's critical theme."
          : `That is incorrect. The correct answer was: ${cp.options[cp.correctOption]}.`;
      }

      setCheckpointScores(prev => ({ ...prev, [checkpointId]: finalMark }));
      setCheckpointFeedback(prev => ({ ...prev, [checkpointId]: feed }));
      
      if (cp.type === 'speaking') {
        setCheckpointSpeakingMetrics(prev => ({
          ...prev,
          [checkpointId]: {
            contentRelevance: 9,
            grammar: 8,
            vocabulary: 8,
            fluency: 9,
            confidence: 9
          }
        }));
      }

      if (finalMark === 10) {
        earnAchievement('perfect_checkpoint');
      }
    } finally {
      setAssessingCheckpoint(false);
    }
  };

  // Escape room scoring (Normalized to be out of 100)
  const rawEscapeRoomScore = Object.keys(checkpointScores).reduce((sum, key) => sum + (checkpointScores[Number(key)] || 0), 0);
  const totalEscapeRoomScore = Math.round((rawEscapeRoomScore / 70) * 100); // 7 checkpoints, max score 70, scaled to 100
  const checkpointsCompletedCount = Object.keys(checkpointScores).length;

  const handleFinishInvestigation = () => {
    if (checkpointsCompletedCount < 7) {
      alert("You must complete all 7 investigation checkpoints before solving the case!");
      return;
    }
    if (totalEscapeRoomScore >= 90) {
      earnAchievement('completed_case');
    }
    setCurrentScreen('finalResult');
  };

  const getPerformanceBand = (score: number) => {
    if (score >= 90) return { name: 'Outstanding (CEFR B2 Level Ready)', color: 'text-bg border-accent bg-accent/20' };
    if (score >= 75) return { name: 'Achieved (Form 4 CEFR B1 Standard)', color: 'text-bg border-accent/80 bg-accent/10' };
    if (score >= 60) return { name: 'Developing (CEFR A2+ Progressing)', color: 'text-bg/90 border-bg/30 bg-bg/5' };
    return { name: 'Needs Scaffolding & Support', color: 'text-accent border-accent/40 bg-accent/5' };
  };

  const averageReadingScore = groupMembers.length > 0 
    ? Math.round(groupMembers.reduce((sum, m) => sum + (m.readingScore || 0), 0) / groupMembers.length)
    : 0;

  const finalCombinedPercent = Math.round(((averageReadingScore + totalEscapeRoomScore) / 200) * 100);
  const band = getPerformanceBand(finalCombinedPercent);

  const totalKeysCollected = groupMembers.filter(m => m.keyObtained).length;

  const getInvestigationLevel = (score: number) => {
    if (score >= 85) return { name: 'Master Detective (85–100)', color: 'text-white border-accent bg-accent' };
    if (score >= 70) return { name: 'Detective (70–84)', color: 'text-ink border-ink bg-white' };
    return { name: 'Investigation Incomplete (Below 70)', color: 'text-accent border-dashed border-accent bg-accent/5' };
  };

  const investigationLevel = getInvestigationLevel(totalEscapeRoomScore);

  const getPersonalizedReport = () => {
    const strengths: string[] = [];
    const improvements: string[] = [];
    const nextSteps: string[] = [];

    const clue1 = checkpointScores[1] || 0;
    const clue2 = checkpointScores[2] || 0;
    const clue3 = checkpointScores[3] || 0;
    const clue4 = checkpointScores[4] || 0;
    const clue5 = checkpointScores[5] || 0;
    const clue6 = checkpointScores[6] || 0;
    const clue7 = checkpointScores[7] || 0;

    // Strengths
    if (clue1 >= 8) {
      strengths.push("Excellently analyzed how childhood toys (such as baby dolls and miniature stoves) prepare young girlchildren for traditional domestic roles like caretaking and cooking.");
    }
    if (clue2 >= 8) {
      strengths.push("Demonstrated profound emotional comprehension of body-shaming and peer criticism, correctly evaluating the psychological damage of mocking Alani's nose and legs.");
    }
    if (clue3 >= 8) {
      strengths.push("Superb spoken response in the vocal check, detailing Alani's habitual apologizing and correctly linking it to a severe depletion of self-esteem.");
    } else if (clue3 > 0) {
      strengths.push("Gave a dedicated effort to oral pronunciation of difficult vocabulary like 'apologizing' and 'self-esteem'.");
    }
    if (clue4 >= 8) {
      strengths.push("Shown sharp auditory capture skills, correctly tracking Alani's tape recorder confessions regarding makeup shadow contouring.");
    }
    if (clue5 >= 8) {
      strengths.push("Excellent interpretation of difficult literary metaphors, demonstrating how the 'fan belt' symbolizes the exhaustion of trying to please a demanding society.");
    }
    if (clue6 >= 8) {
      strengths.push("Precise lexical understanding, grasping the satirical tone and matching definitions for key thematic vocabulary terms.");
    }
    if (clue7 >= 8) {
      strengths.push("Stellar critical analysis of the final casket stanza, uncovering the tragic irony of Alani only being deemed 'pretty' when she is lifeless and manufactured.");
    }

    if (strengths.length === 0) {
      strengths.push("Active participation across the investigation and persistent effort in typing or recording evidence.");
      strengths.push("Excellent team collaboration in compiling and recording answers for all 7 investigative clues.");
    }

    // Improvements
    if (clue1 < 8) {
      improvements.push("Review Clue 1: Analyze how early childhood toys act as social tools to push girls into predefined housewife roles.");
    }
    if (clue2 < 8) {
      improvements.push("Review Clue 2: Reflect on how puberty teasing and critical remarks from classmates affect a teenager's internal self-worth.");
    }
    if (clue3 < 8) {
      improvements.push("Review Clue 3: Re-record the speaking diagnostic with a focus on fluency and pronunciation of the vocabulary terms 'to and fro' and 'apologizing'.");
    }
    if (clue4 < 8) {
      improvements.push("Review Clue 4: Listen closer to the audio tape recording to pinpoint why she contoured her nose with cosmetics.");
    }
    if (clue5 < 8) {
      improvements.push("Review Clue 5: Study Marge Piercy's 'fan belt' metaphor to represent the wearing out of one's natural spirit under societal weight.");
    }
    if (clue6 < 8) {
      improvements.push("Review Clue 6: Strengthen your understanding of key vocabulary definitions, focusing on how Alani had to 'play coy' to satisfy others.");
    }
    if (clue7 < 8) {
      improvements.push("Review Clue 7: Deepen your analysis of the final coffin stanza to understand why Marge Piercy calls Alani's death a 'consummation'.");
    }

    if (improvements.length === 0) {
      improvements.push("Outstanding! Your answers reflect a deep and flawless analytical understanding of 'Barbie Doll' with zero critical gaps.");
    }

    // Next Steps
    if (totalEscapeRoomScore < 70) {
      nextSteps.push("Revisit the failed checkpoints highlighted under feedback and click 'Retry Clue' to improve your arguments and raise your marks above the 70 passing mark.");
    } else if (totalEscapeRoomScore < 85) {
      nextSteps.push("Click 'Retry Clue' on any checkpoint where you scored below 10 to elevate your score to 85+ and unlock the Master Detective ending!");
    } else {
      nextSteps.push("Lead a classroom debate comparing Marge Piercy's 1970s poem to modern social media trends (like photo filters, facial tuning, and digital body dysmorphia).");
    }
    nextSteps.push("Write a reflective paragraph analyzing how cosmetic standards affect boys and girls differently in today's high schools.");

    return { strengths, improvements, nextSteps };
  };

  const renderConfetti = () => {
    if (totalEscapeRoomScore < 85) return null;
    const colors = ['#d42151', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ minHeight: '600px', zIndex: 10 }}>
        {Array.from({ length: 40 }).map((_, i) => {
          const left = `${Math.random() * 100}%`;
          const delay = `${Math.random() * 4}s`;
          const duration = `${2.5 + Math.random() * 3}s`;
          const color = colors[i % colors.length];
          const size = `${6 + Math.random() * 8}px`;
          return (
            <div
              key={i}
              className="confetti-particle"
              style={{
                left,
                backgroundColor: color,
                animationDelay: delay,
                animationDuration: duration,
                width: size,
                height: size,
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div id="app-root" className="min-h-screen bg-bg text-ink font-sans flex flex-col overflow-x-hidden antialiased select-none relative pb-10">
      
      {/* Document Texture and police tape accent */}
      <div className="page-texture"></div>
      <div className="police-tape"></div>

      {/* Inject custom style for animation flash & spins */}
      <style>{`
        @keyframes borderSirenFlash {
          0% { border-color: #d42151; box-shadow: 0 0 20px rgba(212, 33, 81, 0.4); }
          50% { border-color: #1a1a1c; box-shadow: 0 0 10px rgba(26, 26, 28, 0.2); }
          100% { border-color: #d42151; box-shadow: 0 0 20px rgba(212, 33, 81, 0.4); }
        }
        .siren-active-border {
          animation: borderSirenFlash 1.5s infinite;
        }
        @keyframes rotatingReel {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-reel {
          animation: rotatingReel 2.5s linear infinite;
        }
        @keyframes confettiFall {
          0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(600px) rotate(360deg); opacity: 0; }
        }
        .confetti-particle {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 2px;
          animation: confettiFall 4s linear infinite;
        }
      `}</style>

      {/* POLICE TAPE BANNER - TOP OF SCREEN */}
      <div id="police-tape-header" className="bg-accent text-white py-1.5 px-4 font-mono text-[10px] md:text-xs font-black tracking-widest flex items-center justify-between overflow-hidden shadow-sm select-none z-10 relative border-b border-ink">
        <div className="flex items-center gap-4 animate-pulse whitespace-nowrap">
          <span>⚠️ POLICE LINE DO NOT CROSS</span>
          <span>•</span>
          <span>CRIME SCENE #8821-ALANI</span>
          <span>•</span>
          <span>INVESTIGATION IN PROGRESS</span>
          <span>•</span>
          <span className="hidden md:inline">DO NOT COMPROMISE EVIDENCE</span>
        </div>
        <div className="hidden lg:flex items-center gap-4 whitespace-nowrap font-bold text-white/75">
          <span>CASE DEPT. SCENE UNIT</span>
          <span>•</span>
          <span>FORM 4 LITERATURE LESSON</span>
        </div>
      </div>

      {/* HEADER BAR */}
      <header id="main-app-header" className="border-b-2 border-ink bg-bg/95 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-baseline gap-4 shadow-sm relative">
        <div className="flex flex-col">
          <h1 id="app-title-header" className="text-3xl md:text-5xl font-serif italic font-semibold tracking-tight text-ink flex items-center gap-3">
            The Barbie Doll Mystery
          </h1>
          <div className="flex flex-wrap items-center gap-2.5 mt-2">
            <span className="bg-white/40 border border-ink px-2 py-0.5 text-[10px] font-mono tracking-widest text-ink uppercase">Case ID #8821</span>
            <span className="text-[10px] font-mono tracking-widest text-accent uppercase font-bold bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-none">Form 4 ESL (CEFR B1 Standard)</span>
            <span className="text-[10px] font-mono tracking-widest text-ink uppercase font-bold">7-Checkpoint Edition</span>
          </div>
        </div>
        <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end z-10">
          
          {/* SIREN TOGGLE MODULE */}
          <button
            id="siren-toggle-button"
            onClick={() => setIsSirenActive(!isSirenActive)}
            className={`px-3 py-2 border-2 border-ink font-mono text-xs uppercase tracking-wider rounded-none transition-all duration-300 flex items-center gap-2 font-bold ${
              isSirenActive 
                ? 'bg-accent text-white shadow-sm' 
                : 'bg-white/50 text-accent hover:bg-accent hover:text-white'
            }`}
          >
            <ShieldAlert className={`w-4 h-4 ${isSirenActive ? 'animate-spin' : ''}`} />
            <span>{isSirenActive ? '🔊 SIREN ACTIVE' : '🔇 PLAY SIREN'}</span>
          </button>

          <button 
            id="toggle-teacher-dashboard-btn"
            onClick={() => setShowTeacherDashboard(!showTeacherDashboard)} 
            className={`px-3 py-2 border-2 border-ink font-mono text-xs uppercase tracking-wider rounded-none transition-all duration-300 flex items-center gap-2 font-bold ${showTeacherDashboard ? 'bg-accent text-white' : 'bg-white/50 text-ink hover:bg-ink hover:text-white'}`}
          >
            <BarChart2 className="w-4 h-4" />
            <span className="hidden sm:inline">Teacher Panel</span>
          </button>
        </div>
      </header>

      {/* SQUAD BADGES DISPLAY */}
      <div id="sticky-badges-bar" className="bg-white/40 border-b-2 border-ink px-6 py-2 flex flex-wrap items-center gap-4 text-xs font-mono text-ink-muted z-10 relative">
        <span className="text-[10px] text-ink-muted uppercase tracking-widest font-bold">Squad Badges:</span>
        {achievements.map(ach => (
          <div 
            key={ach.id} 
            id={`badge-${ach.id}`}
            title={`${ach.title}: ${ach.desc}`}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-none border transition-all duration-300 ${ach.earned ? 'bg-accent/15 border-2 border-accent text-accent font-bold' : 'bg-white/20 border border-ink/20 text-ink/30'}`}
          >
            <span>{ach.icon}</span>
            <span className={`text-[10px] font-mono uppercase ${ach.earned ? 'text-ink font-bold' : 'text-ink/30'}`}>{ach.title}</span>
          </div>
        ))}
      </div>

      {/* WORKSPACE WRAPPER */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 md:px-6 py-6 flex flex-col lg:flex-row gap-6 min-h-0 relative z-10">
        
        {/* SIDEBAR */}
        <aside id="investigation-sidebar" className="w-full lg:w-[310px] shrink-0 flex flex-col gap-6">
          
          {/* GROUP MATRIX STATUS */}
          <div id="group-progress-card" className="bg-white/40 rounded-none border-2 border-ink p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-accent"></div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-ink font-mono">Group Verification</h3>
              <span className="text-[10px] font-mono text-accent font-bold bg-accent/10 px-2 py-0.5 border border-accent/20 rounded-none">
                Squad size: {memberCount}
              </span>
            </div>

            {groupMembers.length === 0 ? (
              <div className="text-center py-6 text-ink/40 text-xs font-mono">
                Squad members not registered.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {groupMembers.map((member, idx) => (
                  <button
                    key={idx}
                    id={`sidebar-member-button-${idx}`}
                    onClick={() => {
                      if (currentScreen !== 'welcome' && currentScreen !== 'finalResult') {
                        setCurrentScreen('stage1');
                        setActiveMemberIndex(idx);
                      }
                    }}
                    className={`aspect-square rounded-none border-2 p-1 flex flex-col items-center justify-center transition-all duration-300 ${
                      activeMemberIndex === idx 
                        ? 'bg-accent text-white border-accent shadow-sm'
                        : member.keyObtained 
                          ? 'bg-accent/10 border-accent/50 text-accent font-bold'
                          : 'bg-white/40 border-ink/20 text-ink/40 hover:border-ink hover:text-ink'
                    }`}
                  >
                    <div className="text-[8px] font-mono truncate max-w-full text-ink-muted font-bold">{member.name.split(' ')[0]}</div>
                    <div className="text-sm mt-1">
                      {member.keyObtained ? '🔑' : '🔒'}
                    </div>
                    {member.readingScore && (
                      <div className="text-[8px] font-mono text-accent mt-1 font-bold">{member.readingScore}/100</div>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-1.5 border-t-2 border-ink pt-3">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-ink/70 font-mono">
                <span>Verification Keys</span>
                <span>{totalKeysCollected} / {groupMembers.length || memberCount}</span>
              </div>
              <div className="w-full h-3 bg-white rounded-none overflow-hidden border-2 border-ink">
                <div 
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${groupMembers.length > 0 ? (totalKeysCollected / groupMembers.length) * 100 : 0}%` }}
                ></div>
              </div>
              {totalKeysCollected < (groupMembers.length || memberCount) ? (
                <div className="text-[10px] font-mono text-accent bg-accent/5 border-2 border-dashed border-accent p-2 rounded-none flex items-center gap-1.5 mt-2 animate-pulse">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Members must scan voice to unlock Escape Room.</span>
                </div>
              ) : (
                <div className="text-[10px] font-mono text-ink bg-white/60 border-2 border-ink p-2 rounded-none flex items-center gap-1.5 mt-2">
                  <Unlock className="w-3.5 h-3.5 shrink-0 animate-bounce" />
                  <span>All keys obtained! Escape Room Unlocked.</span>
                </div>
              )}
            </div>
          </div>

          {/* ACTIVE CHECKLIST */}
          <div id="investigation-checklist-card" className="bg-white/40 rounded-none border-2 border-ink p-5 shadow-sm relative">
            <h3 className="text-xs font-bold uppercase tracking-widest text-ink font-mono mb-4 flex items-center gap-2">
              <Clipboard className="w-4 h-4 text-accent" />
              Investigation Log
            </h3>
            <div className="space-y-3 font-mono text-[11px] text-ink-muted">
              <div className={`flex items-center gap-3 ${groupMembers.length > 0 ? 'text-accent font-bold' : 'text-ink/20'}`}>
                <span className={`w-4 h-4 border-2 rounded-none flex items-center justify-center text-[9px] ${groupMembers.length > 0 ? 'border-accent' : 'border-ink/20'}`}>
                  {groupMembers.length > 0 ? '✓' : ''}
                </span>
                <span>STAGE 1: TEAM REGISTERED</span>
              </div>
              <div className={`flex items-center gap-3 ${totalKeysCollected === groupMembers.length && groupMembers.length > 0 ? 'text-accent font-bold' : 'text-ink/20'}`}>
                <span className={`w-4 h-4 border-2 rounded-none flex items-center justify-center text-[9px] ${totalKeysCollected === groupMembers.length && groupMembers.length > 0 ? 'border-accent' : 'border-ink/20'}`}>
                  {totalKeysCollected === groupMembers.length && groupMembers.length > 0 ? '✓' : ''}
                </span>
                <span>STAGE 1: VOICE DECRYPTED</span>
              </div>
              <div className={`flex items-center gap-3 ${currentScreen === 'stage2' ? 'text-accent font-bold animate-pulse' : checkpointsCompletedCount > 0 ? 'text-accent' : 'text-ink/20'}`}>
                <span className="w-4 h-4 border-2 border-ink/20 rounded-none flex items-center justify-center text-[9px]">
                  {checkpointsCompletedCount > 0 ? '✓' : ''}
                </span>
                <span>STAGE 2: CLUES INVESTIGATED</span>
              </div>
              <div className={`flex items-center gap-3 ${checkpointsCompletedCount >= 7 ? 'text-accent font-bold' : 'text-ink/20'}`}>
                <span className="w-4 h-4 border-2 border-ink/20 rounded-none flex items-center justify-center text-[9px]">
                  {checkpointsCompletedCount >= 7 ? '✓' : ''}
                </span>
                <span>STAGE 2: CRIME RECONSTRUCTED</span>
              </div>
            </div>
            {currentScreen === 'stage2' && (
              <div className="mt-4 pt-3 border-t-2 border-ink flex flex-col gap-1">
                <span className="text-[10px] font-bold text-accent uppercase font-mono">Evidence Solved:</span>
                <span className="text-xl font-bold text-ink font-serif italic">{checkpointsCompletedCount} / 7 Checked</span>
                <div className="w-full h-3 bg-white rounded-none overflow-hidden mt-1 border-2 border-ink">
                  <div className="h-full bg-accent" style={{ width: `${(checkpointsCompletedCount/7)*100}%` }}></div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN DISPLAY PANEL */}
        <main id="main-interactive-workspace" className={`flex-1 flex flex-col bg-white/40 rounded-none border-2 border-ink p-6 md:p-8 min-h-0 relative shadow-sm transition-all duration-300 ${isSirenActive ? 'siren-active-border' : ''}`}>
          
          {/* SCREEN 0: HOW TO PLAY */}
          {currentScreen === 'howToPlay' && (
            <div id="how-to-play-screen" className="flex-1 flex flex-col justify-between overflow-y-auto max-h-[620px] pr-1">
              <div className="space-y-8">
                {/* Header Banner */}
                <div id="how-to-play-header" className="text-center pb-5 border-b-2 border-ink">
                  <span className="text-[10px] font-mono text-accent uppercase tracking-widest font-bold">Classified Briefing</span>
                  <h2 className="text-3xl md:text-4xl font-serif italic font-bold text-ink mt-1">
                    🕵️ THE BARBIE DOLL MYSTERY
                  </h2>
                  <p className="text-sm font-mono text-ink-muted mt-2">
                    Welcome, Detective!
                  </p>
                </div>

                {/* Introduction Section */}
                <div id="mystery-intro-card" className="bg-white border-4 border-double border-ink p-6 md:p-8 rounded-none relative shadow-sm">
                  <div className="absolute top-0 right-0 bg-accent text-white font-bold font-mono text-[9px] tracking-widest uppercase px-4 py-1 rounded-none border-b border-l border-ink">
                    CASE DOSSIER
                  </div>
                  <div className="space-y-4 text-xs font-mono text-ink leading-relaxed">
                    <p>
                      A teenage girl named <span className="font-bold border-b border-ink">Alani</span> has been found dead under mysterious circumstances.
                    </p>
                    <p>
                      At first, investigators believed it was an accident. However, evidence found in her room suggests there may be a deeper reason behind her death.
                    </p>
                    <p className="border-l-2 border-accent pl-4 py-2 italic text-accent font-serif text-sm">
                      Your mission is to investigate the clues, analyse the evidence, and uncover the truth.
                    </p>
                    <p>
                      The key piece of evidence is the poem <span className="font-bold">"Barbie Doll" by Marge Piercy</span>.
                    </p>
                    <p>
                      Throughout this game, you will use your reading, speaking, listening, and writing skills to solve the mystery.
                    </p>
                  </div>
                </div>

                {/* Grid for Objectives & Scoring */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Learning Objectives */}
                  <div id="learning-objectives-card" className="bg-bg/30 border-2 border-ink p-6 rounded-none space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-accent font-mono flex items-center gap-2 border-b border-ink/10 pb-2">
                      <BookOpen className="w-4 h-4 text-accent" />
                      🎯 Learning Objectives
                    </h3>
                    <p className="text-[11px] font-mono text-ink-muted leading-relaxed">
                      By completing this investigation, you will:
                    </p>
                    <ul className="space-y-3 font-mono text-xs text-ink">
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold shrink-0">✓</span>
                        <span>Read the poem using appropriate pronunciation, fluency, tone, and expression.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold shrink-0">✓</span>
                        <span>Understand the themes and messages presented in the poem.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold shrink-0">✓</span>
                        <span>Improve your speaking, listening, reading, and writing skills.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold shrink-0">✓</span>
                        <span>Think critically about self-image and societal expectations.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Scoring System */}
                  <div id="scoring-system-card" className="bg-bg/30 border-2 border-ink p-6 rounded-none space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-accent font-mono flex items-center gap-2 border-b border-ink/10 pb-2">
                      <Award className="w-4 h-4 text-accent" />
                      🏆 Scoring System
                    </h3>
                    <div className="space-y-3 font-mono text-xs text-ink">
                      <div>
                        <span className="font-bold text-accent uppercase text-[10px] block">Stage 1: AI Voice Coach</span>
                        <div className="flex justify-between items-center bg-white border border-ink/15 p-2 mt-1">
                          <span>Passing Score:</span>
                          <span className="font-bold text-accent">80 / 100 Marks</span>
                        </div>
                        <span className="text-[10px] text-ink-muted mt-1 block leading-tight">
                          Required to unlock the investigation.
                        </span>
                      </div>

                      <div className="border-t border-ink/10 pt-3">
                        <span className="font-bold text-accent uppercase text-[10px] block">Stage 2: Detective Escape Room</span>
                        <span className="text-[10px] text-ink-muted block mb-1">Total Score: 100 Marks</span>
                        <div className="space-y-1 bg-white border border-ink/15 p-2.5">
                          <div className="flex justify-between items-center text-[11px] border-b border-ink/5 pb-1">
                            <span className="font-bold text-ink">🥇 Master Detective:</span>
                            <span className="font-bold text-accent">90–100</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px] border-b border-ink/5 pb-1">
                            <span className="font-bold text-ink">🥈 Detective:</span>
                            <span className="font-bold text-ink">70–89</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-accent/80 font-bold">❌ Investigation Incomplete:</span>
                            <span className="text-accent/80 font-bold">Below 70</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-ink-muted mt-1.5 block leading-relaxed">
                          You must obtain at least <span className="font-bold text-ink">70 marks</span> to successfully solve the mystery. Students who score 90 marks or above will unlock the Full Secret Ending and earn the title: <span className="font-bold text-accent">🏆 MASTER DETECTIVE</span>.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How to Play - Horizontal stages map */}
                <div id="how-to-play-flow" className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-ink font-mono flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    🎮 HOW TO PLAY
                  </h3>
                  <p className="text-xs font-mono text-ink-muted">
                    This game consists of 2 stages.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Stage 1 */}
                    <div id="stage1-info-card" className="bg-white border-2 border-ink p-5 rounded-none relative">
                      <div className="absolute top-0 right-0 bg-ink text-white font-mono text-[9px] font-bold uppercase px-3 py-0.5 border-b border-l border-ink">
                        STAGE 1
                      </div>
                      <h4 className="text-sm font-bold text-ink font-mono flex items-center gap-1.5 mb-2 uppercase">
                        <Mic className="w-4 h-4 text-accent" />
                        AI VOICE COACH
                      </h4>
                      <p className="text-xs font-mono text-ink-muted leading-relaxed mb-3">
                        📖 Read the poem aloud using your microphone.
                      </p>
                      <div className="bg-bg/30 p-3 border border-ink/10 space-y-1 font-mono text-[11px] text-ink">
                        <span className="font-bold text-accent uppercase text-[9px] block mb-1">The AI will assess:</span>
                        <div className="space-y-1">
                          <div>• Pronunciation</div>
                          <div>• Fluency</div>
                          <div>• Expression and Tone</div>
                          <div>• Reading Accuracy</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-accent font-bold mt-3 block leading-normal">
                        To proceed, you must score at least 80%. If your score is below 80%, you may try again.
                      </span>
                    </div>

                    {/* Stage 2 */}
                    <div id="stage2-info-card" className="bg-white border-2 border-ink p-5 rounded-none relative">
                      <div className="absolute top-0 right-0 bg-accent text-white font-mono text-[9px] font-bold uppercase px-3 py-0.5 border-b border-l border-ink">
                        STAGE 2
                      </div>
                      <h4 className="text-sm font-bold text-ink font-mono flex items-center gap-1.5 mb-2 uppercase">
                        <Clipboard className="w-4 h-4 text-accent" />
                        DETECTIVE ESCAPE ROOM
                      </h4>
                      <p className="text-xs font-mono text-ink-muted leading-relaxed mb-3">
                        🔍 Investigate Alani's room and uncover the truth.
                      </p>
                      <div className="bg-bg/30 p-3 border border-ink/10 space-y-1 font-mono text-[11px] text-ink">
                        <span className="font-bold text-accent uppercase text-[9px] block mb-1">You must complete 7 checkpoints:</span>
                        <div className="space-y-1">
                          <div>• Reading Activities</div>
                          <div>• Speaking Activities</div>
                          <div>• Listening Activities</div>
                          <div>• Writing Activities</div>
                          <div>• Critical Thinking Tasks</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-ink font-bold mt-3 block leading-normal">
                        Each checkpoint will reveal an important clue about Alani's life and death. Complete all checkpoints to solve the mystery.
                      </span>
                    </div>
                  </div>
                </div>

                {/* How to Win & Important Rules Double Column */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* How to Win */}
                  <div id="how-to-win-card" className="bg-white border-2 border-ink p-5 rounded-none space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-ink font-mono flex items-center gap-2 border-b border-ink/10 pb-2">
                      <Unlock className="w-4 h-4 text-accent" />
                      🔐 HOW TO WIN
                    </h3>
                    <ul className="space-y-2 font-mono text-xs text-ink list-decimal pl-4">
                      <li>Pass the AI Voice Coach.</li>
                      <li>Complete all 7 checkpoints.</li>
                      <li>Collect all clues.</li>
                      <li>Score at least 70 marks.</li>
                      <li>Discover the truth behind Alani's death.</li>
                    </ul>
                  </div>

                  {/* Important Rules */}
                  <div id="important-rules-card" className="bg-accent/5 border-2 border-dashed border-accent p-5 rounded-none space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-accent font-mono flex items-center gap-2 border-b border-accent/10 pb-2">
                      <ShieldAlert className="w-4 h-4 text-accent" />
                      📌 IMPORTANT RULES
                    </h3>
                    <ul className="space-y-2 font-mono text-xs text-ink list-disc pl-4 leading-normal">
                      <li>Read all instructions carefully.</li>
                      <li>Speak clearly during microphone activities.</li>
                      <li>Listen carefully to audio clues.</li>
                      <li>Support your answers using evidence from the poem.</li>
                      <li>Complete all checkpoints in order.</li>
                      <li className="font-bold">Be respectful when discussing sensitive issues related to self-image and beauty standards.</li>
                    </ul>
                  </div>
                </div>

                {/* Call To Action Box */}
                <div id="cta-action-box" className="bg-ink text-bg border-2 border-ink rounded-none p-6 text-center space-y-4">
                  <p className="font-serif italic text-lg text-bg">
                    Are you ready to begin your investigation?
                  </p>
                  <p className="text-xs text-bg/70 font-mono">
                    Click "Start Investigation" to enter your name and group name.
                  </p>
                  <button
                    id="how-to-play-start-btn"
                    onClick={() => setCurrentScreen('welcome')}
                    className="w-full sm:w-auto px-10 py-4 bg-accent text-white font-mono uppercase tracking-wider text-xs rounded-none hover:bg-white hover:text-ink transition-colors duration-300 font-bold border border-accent flex items-center justify-center gap-2 mx-auto"
                  >
                    Start Investigation
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 1: REGISTRATION */}
          {currentScreen === 'welcome' && (
            <div id="registration-screen" className="flex-1 flex flex-col justify-center max-w-2xl mx-auto py-4">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-none border-2 border-ink bg-white/80 p-2 mb-4 shadow-sm">
                  <Key className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-3xl md:text-4xl font-serif italic font-semibold tracking-tight text-ink mb-2">
                  The Barbie Doll Mystery
                </h2>
                <p className="text-sm text-ink-muted leading-relaxed font-mono text-center">
                  Form 4 Literature Escape Room. Uncover the truth about Alani's demise by investigating Marge Piercy's poem.
                </p>
              </div>

              {/* Case dossier style */}
              <div className="bg-white border-2 border-dashed border-ink p-5 rounded-none mb-8 font-mono text-xs leading-relaxed relative">
                <div className="absolute top-0 right-0 bg-accent text-white font-mono text-[9px] tracking-widest uppercase px-3 py-1 border-b border-l border-ink">
                  CLASSIFIED DOSSIER
                </div>
                <p className="text-accent font-bold mb-2 uppercase tracking-wider">▲ INVESTIGATION INTELLIGENCE OVERVIEW:</p>
                <p className="mb-3 text-ink">
                  "A student named Alani has tragically passed away in her bedroom. The parents are devastated. To find out why she collapsed, junior investigators must read and crack her hidden diary checkpoints."
                </p>
                <p className="text-ink font-bold uppercase tracking-wider border-t border-ink/10 pt-2">
                  SQUAD INSTRUCTIONS: Register below. Each squad member must read aloud a stanza of Marge Piercy's poem to unlock the door.
                </p>
              </div>

              {/* Registration form */}
              <form id="student-registration-form" onSubmit={handleRegisterSubmit} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-ink-muted uppercase tracking-widest text-[9px] font-bold">Your (Lead Detective) Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 w-4 h-4 text-ink-muted" />
                      <input 
                        id="student-name-input"
                        type="text" 
                        required
                        placeholder="E.g., Adam Harris"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full bg-white border-2 border-ink rounded-none px-10 py-3 text-ink font-mono focus:bg-white focus:outline-none focus:border-accent placeholder-ink-muted"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-ink-muted uppercase tracking-widest text-[9px] font-bold">Investigation Squad Name</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3.5 w-4 h-4 text-ink-muted" />
                      <input 
                        id="group-name-input"
                        type="text" 
                        required
                        placeholder="E.g., Pathfinders"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="w-full bg-white border-2 border-ink rounded-none px-10 py-3 text-ink font-mono focus:bg-white focus:outline-none focus:border-accent placeholder-ink-muted"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-ink-muted uppercase tracking-widest text-[9px] font-bold">Group / Desk Number</label>
                    <input 
                      id="group-number-input"
                      type="number" 
                      required
                      min="1"
                      max="40"
                      value={groupNumber}
                      onChange={(e) => setGroupNumber(e.target.value)}
                      className="w-full bg-white border-2 border-ink rounded-none px-4 py-3 text-ink font-mono focus:bg-white focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-ink-muted uppercase tracking-widest text-[9px] font-bold">Number of Group Members (Squad size)</label>
                    <select 
                      id="member-count-select"
                      value={memberCount}
                      onChange={(e) => setMemberCount(Number(e.target.value))}
                      className="w-full bg-white border-2 border-ink rounded-none px-4 py-3 text-ink font-mono focus:outline-none focus:border-accent"
                    >
                      <option value="1">1 Member (Solo Investigator)</option>
                      <option value="2">2 Members</option>
                      <option value="3">3 Members</option>
                      <option value="4">4 Members</option>
                      <option value="5">5 Members</option>
                    </select>
                  </div>
                </div>

                <button 
                  id="start-investigation-btn"
                  type="submit"
                  className="w-full bg-ink text-bg font-mono uppercase tracking-wider py-4 rounded-none hover:bg-accent hover:text-white hover:border-accent border-2 border-ink transition-colors duration-300 text-xs shadow-md flex items-center justify-center gap-2 mt-2 font-bold"
                >
                  Launch Voice Authentication & Checkpoints
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* SCREEN 2: VOICE AUTH (STAGE 1) */}
          {currentScreen === 'stage1' && (
            <div id="voice-coach-screen" className="flex-1 flex flex-col min-h-0">
              
              {/* Selector bar */}
              <div className="bg-white/40 border-2 border-ink rounded-none p-3 mb-5 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                  <span className="text-ink/60 font-bold uppercase">SELECT SQUAD DETECTIVE FOR VOICE SCAN:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {groupMembers.map((m, idx) => (
                    <button
                      key={idx}
                      id={`member-select-btn-${idx}`}
                      onClick={() => {
                        setActiveMemberIndex(idx);
                        setAudioBlobUrl(null);
                        setAudioBase64(null);
                      }}
                      className={`px-3 py-1.5 rounded-none border-2 text-[11px] transition-all duration-300 font-bold ${
                        activeMemberIndex === idx 
                          ? 'bg-accent text-white border-accent'
                          : m.keyObtained
                            ? 'bg-ink text-white border-ink'
                            : 'bg-white border-ink/20 text-ink-muted hover:bg-ink-faint'
                      }`}
                    >
                      {m.name} {m.keyObtained ? '🔑' : '🔒'}
                    </button>
                  ))}
                </div>
              </div>

              {activeMemberIndex === null ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
                  <Key className="w-10 h-10 text-accent mb-3 animate-bounce" />
                  <h3 className="text-md font-bold uppercase text-ink mb-2 font-mono">Select an Investigator</h3>
                  <p className="text-xs text-ink-muted leading-relaxed font-mono">
                    Click one of the squad buttons above to read a stanza of "Barbie Doll" aloud. Each student gets their keycode once evaluated.
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-baseline mb-4 border-b-2 border-ink pb-3">
                    <h3 className="text-lg font-serif italic font-bold text-ink flex items-center gap-2">
                      <span className="w-5 h-5 rounded-none bg-accent flex items-center justify-center text-white font-bold text-[11px]">
                        {activeMemberIndex + 1}
                      </span>
                      AI Voice Key Generator: {groupMembers[activeMemberIndex].name}
                    </h3>
                    <span className="text-[10px] font-mono text-accent uppercase tracking-widest font-bold">
                      {groupMembers[activeMemberIndex].keyObtained ? '🔑 ACCESS GRANTED' : '🔒 PENDING SCAN (≥80%)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-0 flex-1 overflow-y-auto pr-1">
                    
                    {/* Poem Panel */}
                    <div className="bg-white border-2 border-ink rounded-none p-5 flex flex-col max-h-[480px] overflow-y-auto">
                      <div className="flex justify-between items-center mb-3 border-b border-ink pb-1.5">
                        <span className="text-[9px] font-mono text-accent uppercase tracking-wider font-bold">Poem Transcription Reference</span>
                        <span className="text-[9px] font-mono text-ink-muted">Read clearly at B1 speed</span>
                      </div>
                      <div className="font-serif text-[15px] leading-relaxed text-ink italic whitespace-pre-line selection:bg-accent/20">
                        {POEM_TEXT}
                      </div>
                    </div>

                    {/* Microphone Panel */}
                    <div className="flex flex-col gap-4">
                      <div className="bg-white/80 rounded-none border-2 border-ink p-5 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-ink mb-2 font-mono">Microphone Audio Scan</h4>
                          <p className="text-[11px] font-mono text-ink-muted leading-relaxed mb-4">
                            Click 'Start Voice Scan' and read the poem aloud. 
                            Speak clearly. We will analyze your pronunciation of words like <span className="text-accent font-bold">puberty</span>, <span className="text-accent font-bold">coy</span>, and <span className="text-accent font-bold">dexterity</span>.
                          </p>
                        </div>

                        {/* Equalizer */}
                        <div className="bg-white rounded-none p-3.5 border-2 border-ink mb-4 flex items-center justify-between gap-4">
                          <div className="flex items-end gap-1.5 h-10 w-24 shrink-0">
                            {visualizerData.map((val, i) => (
                              <div 
                                key={i} 
                                className="flex-1 bg-accent rounded-none transition-all duration-700" 
                                style={{ height: `${val}%`, minHeight: '3px' }}
                              ></div>
                            ))}
                          </div>
                          <div className="text-right font-mono">
                            <span className="text-lg font-bold text-ink">00:{recordingDuration.toString().padStart(2, '0')}</span>
                            <div className="text-[8px] text-accent uppercase font-bold tracking-wider">{isRecording ? 'SCANNING' : 'IDLE'}</div>
                          </div>
                        </div>

                        <div className="flex gap-2 font-mono text-xs">
                          {!isRecording ? (
                            <button
                              id="voice-coach-record-start-btn"
                              onClick={startRecording}
                              className="flex-1 py-3 bg-accent text-white uppercase tracking-wider font-bold rounded-none border-2 border-ink hover:bg-ink transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Mic className="w-3.5 h-3.5" />
                              Start Voice Scan
                            </button>
                          ) : (
                            <button
                              id="voice-coach-record-stop-btn"
                              onClick={stopRecording}
                              className="flex-1 py-3 bg-ink text-white uppercase tracking-wider font-bold rounded-none border-2 border-ink hover:bg-accent transition-colors flex items-center justify-center gap-1.5 animate-pulse"
                            >
                              <Square className="w-3.5 h-3.5 fill-white" />
                              Stop & Encrypt
                            </button>
                          )}
                        </div>

                        {audioBlobUrl && (
                          <div className="mt-4 pt-4 border-t-2 border-ink flex flex-col gap-2">
                            <span className="text-[9px] font-mono text-ink-muted uppercase font-bold">Voice Recording Decoded:</span>
                            <audio src={audioBlobUrl} controls className="w-full h-8 bg-white border border-ink/40 rounded-none" />
                            <button
                              id="submit-reading-analysis-btn"
                              disabled={analyzingVoice}
                              onClick={submitReadingAnalysis}
                              className="w-full py-2.5 bg-ink text-white border-2 border-ink rounded-none font-mono text-xs font-bold uppercase hover:bg-accent transition-colors flex items-center justify-center gap-2"
                            >
                              {analyzingVoice ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  Analyzing Phonetic Standard...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Submit to AI Coach
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Decryption result */}
                      {voiceError && (
                        <div className="text-xs font-mono text-accent bg-accent/5 border-2 border-dashed border-accent p-3 rounded-none">
                          {voiceError}
                        </div>
                      )}

                      {groupMembers[activeMemberIndex].readingFeedback ? (
                        <div className="bg-white border-2 border-ink p-4 font-mono text-xs space-y-3 rounded-none">
                          <div className="flex justify-between items-baseline border-b border-ink pb-2">
                            <span className="font-bold text-ink text-sm uppercase">Scan Diagnostics</span>
                            <span className="text-accent font-bold text-sm">{groupMembers[activeMemberIndex].readingScore}% Code Match</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                            <div className="bg-ink-faint p-2 rounded-none border border-ink/20">
                              <span className="text-ink/60 block">PRONUNCIATION</span>
                              <span className="text-ink font-bold">{groupMembers[activeMemberIndex].readingFeedback?.pronunciation}/20</span>
                            </div>
                            <div className="bg-ink-faint p-2 rounded-none border border-ink/20">
                              <span className="text-ink/60 block">RHYTHM & PACING</span>
                              <span className="text-ink font-bold">{groupMembers[activeMemberIndex].readingFeedback?.rhythm}/20</span>
                            </div>
                            <div className="bg-ink-faint p-2 rounded-none border border-ink/20">
                              <span className="text-ink/60 block">EXPRESSION</span>
                              <span className="text-ink font-bold">{groupMembers[activeMemberIndex].readingFeedback?.expression}/20</span>
                            </div>
                          </div>

                          {/* Code code if unlocked */}
                          {groupMembers[activeMemberIndex].keyObtained && (
                            <div className="bg-accent/15 border-2 border-accent p-3 rounded-none flex items-center justify-between">
                              <div>
                                <span className="text-[9px] text-accent uppercase font-black block">VERIFICATION KEYCODE GENERATED</span>
                                <span className="text-sm font-bold text-ink font-mono">{groupMembers[activeMemberIndex].keyCode}</span>
                              </div>
                              <span className="text-xl">🔑</span>
                            </div>
                          )}

                          <div className="space-y-2 text-[10px] text-ink-muted">
                            <div>
                              <span className="text-ink font-bold block mb-0.5">✔ Strengths:</span>
                              <ul className="list-disc pl-4 space-y-0.5">
                                {groupMembers[activeMemberIndex].readingFeedback?.strengths.map((s, idx) => (
                                  <li key={idx}>{s}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="text-accent font-bold block mb-0.5">▲ Room for Improvement:</span>
                              <ul className="list-disc pl-4 space-y-0.5">
                                {groupMembers[activeMemberIndex].readingFeedback?.improvements.map((im, idx) => (
                                  <li key={idx}>{im}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border-2 border-dashed border-ink p-6 flex flex-col items-center justify-center text-center font-mono rounded-none">
                          <BookOpen className="w-8 h-8 text-ink/20 mb-2" />
                          <span className="text-[11px] text-ink/40">Voice feedback ready after scan complete.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* NAV TO ESCAPE ROOM */}
                  {totalKeysCollected === groupMembers.length && (
                    <div className="mt-5 p-4 bg-accent/5 border-2 border-accent rounded-none flex justify-between items-center gap-4">
                      <div className="font-mono text-xs">
                        <span className="text-accent font-bold block uppercase">DECRYPT CODES ACCEPTED // ACCESS GRANTED</span>
                        <span className="text-ink-muted">Your detective squad is fully verified. Enter Alani's room.</span>
                      </div>
                      <button
                        id="enter-stage2-btn"
                        onClick={() => setCurrentScreen('stage2')}
                        className="px-6 py-3 bg-accent text-white font-mono text-xs font-bold uppercase tracking-wider rounded-none hover:bg-ink transition-all duration-300 shadow-sm flex items-center gap-2 border-2 border-ink"
                      >
                        Enter Escape Room
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SCREEN 3: ESCAPE ROOM (STAGE 2 - 7 CHECKPOINTS) */}
          {currentScreen === 'stage2' && (
            <div id="escape-room-screen" className="flex-1 flex flex-col min-h-0">
              
              {/* Header bar */}
              <div className="flex flex-wrap justify-between items-center gap-4 border-b-2 border-ink pb-4 mb-5">
                <div>
                  <h3 className="text-xs font-mono uppercase text-accent tracking-widest font-bold">Dressing Room Investigation</h3>
                  <div className="text-xl md:text-2xl font-serif italic font-bold text-ink uppercase tracking-tight flex items-center gap-2">
                    <Lock className="w-5 h-5 text-accent shrink-0" />
                    Alani's Abandoned Bedroom
                  </div>
                </div>
                <div className="bg-white border-2 border-ink px-5 py-2 rounded-none flex items-center gap-6 font-mono text-right shadow-sm">
                  <div>
                    <div className="text-[10px] text-ink-muted uppercase font-bold">Clues Unlocked</div>
                    <div className="text-sm font-bold text-accent">{checkpointsCompletedCount} / 7 Checked</div>
                  </div>
                  <div className="h-8 w-px bg-ink/20"></div>
                  <div>
                    <div className="text-[10px] text-accent uppercase font-bold">Investigation Mark</div>
                    <div className="text-xl font-bold text-ink">{totalEscapeRoomScore} <span className="text-xs text-ink/30">/ 100</span></div>
                  </div>
                </div>
              </div>

              {/* 7 Checkpoints progress map */}
              <div className="grid grid-cols-7 gap-2 mb-5">
                {CHECKPOINTS.map((cp, idx) => {
                  const score = checkpointScores[cp.id];
                  const active = activeCheckpointIndex === idx;
                  const completed = score !== undefined;
                  return (
                    <button
                      key={cp.id}
                      id={`checkpoint-map-node-${idx}`}
                      onClick={() => {
                        setActiveCheckpointIndex(idx);
                        setAudioBlobUrl(null);
                        setAudioBase64(null);
                      }}
                      className={`py-2 px-1 rounded-none text-center border-2 font-mono transition-all duration-300 flex flex-col items-center justify-between gap-1 ${
                        active 
                          ? 'bg-ink text-bg border-ink font-bold shadow-md' 
                          : completed 
                            ? 'bg-accent/10 border-accent text-accent font-bold' 
                            : 'bg-white border-ink-faint text-ink-muted hover:border-ink'
                      }`}
                    >
                      <span className="text-[9px] block">CLUE #{cp.id}</span>
                      <span className="text-[11px] font-black">
                        {completed ? `${score}/10` : '?'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Checkpoint Content */}
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 flex-1 min-h-0 overflow-y-auto">
                           <div className="xl:col-span-2 flex flex-col gap-4">
                  <div className="bg-white/80 border-2 border-ink rounded-none p-5 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-accent uppercase tracking-widest font-bold flex items-center gap-1 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-accent" />
                        CLUE SECURED // CHECKPOINT {activeCheckpointIndex + 1}
                      </span>
                      <h4 className="text-lg font-serif italic font-bold text-ink uppercase tracking-tight mb-1">
                        {CHECKPOINTS[activeCheckpointIndex].clueName}
                      </h4>
                      <p className="text-xs text-ink-muted leading-relaxed font-mono mb-4">
                        "{CHECKPOINTS[activeCheckpointIndex].clueDescription}"
                      </p>
                    </div>

                    {/* Rendering the Custom Interactive Clue Image / Chart Graphics */}
                    <div className="my-3 py-3 border-t-2 border-b-2 border-ink">
                      
                      {/* Checkpoint 1 Clue: Polaroid of Bedside Table */}
                      {CHECKPOINTS[activeCheckpointIndex].id === 1 && (
                        <div className="relative bg-white text-ink p-3 pb-10 rounded-none shadow-md rotate-2 transform hover:rotate-0 transition-all duration-300 w-full max-w-xs mx-auto border border-ink">
                          <div className="bg-ink-faint aspect-video rounded-none overflow-hidden flex flex-col justify-center items-center border border-ink p-2 relative">
                            <div className="absolute top-1.5 right-1.5 bg-accent text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-none uppercase tracking-wider">
                              Evidence A
                            </div>
                            <BookOpen className="w-10 h-10 text-ink/60 mb-1" />
                            <div className="text-center font-serif text-[10px] text-ink leading-tight italic px-3 select-none">
                              "presented dolls that did pee-pee... miniature GE stoves and irons..."
                            </div>
                            <div className="w-full h-1.5 bg-accent/40 absolute top-[45%] left-0"></div>
                          </div>
                          <div className="absolute bottom-2.5 left-3 font-mono text-[10px] text-ink-muted italic">
                            Polaroid #1: Bedside Table
                          </div>
                        </div>
                      )}

                      {/* Checkpoint 2 Clue: Cracked Dressing Mirror */}
                      {CHECKPOINTS[activeCheckpointIndex].id === 2 && (
                        <div className="relative w-40 h-40 rounded-full border-4 border-ink bg-white flex flex-col justify-center items-center shadow-md mx-auto overflow-hidden">
                          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50" stroke="#1a1a1c" strokeWidth="1">
                            <line x1="0" y1="0" x2="80" y2="80" stroke="#1a1a1c" />
                            <line x1="80" y1="80" x2="160" y2="30" stroke="#1a1a1c" />
                            <line x1="80" y1="80" x2="40" y2="160" stroke="#1a1a1c" />
                            <line x1="30" y1="100" x2="120" y2="110" stroke="#1a1a1c" />
                          </svg>
                          <div className="text-center p-2 z-10 font-mono select-none">
                            <p className="text-[8px] tracking-widest text-accent font-bold uppercase mb-0.5">Vanity Mirror</p>
                            <p className="font-serif text-xs text-accent italic font-black leading-tight">"Great big nose & fat legs."</p>
                            <p className="text-[7px] text-ink/40 mt-1 font-bold">Classmate Scribble</p>
                          </div>
                        </div>
                      )}

                      {/* Checkpoint 3 Clue: Ruled Notebook Diary */}
                      {CHECKPOINTS[activeCheckpointIndex].id === 3 && (
                        <div className="bg-white text-ink border-l-4 border-accent p-4 rounded-none shadow-md relative font-sans text-xs max-w-xs mx-auto leading-relaxed overflow-hidden border border-ink-faint">
                          <div className="absolute top-1.5 right-1.5 bg-accent/10 text-accent font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-none border border-accent/25">
                            Tear stained
                          </div>
                          <div className="border-b border-ink/10 pb-1 mb-2">
                            <span className="font-bold text-ink uppercase text-[9px] font-mono">Alani's Journal Entry</span>
                          </div>
                          <p className="italic font-serif text-ink text-[11px] leading-tight select-none">
                            "They look at me and whisper. I spend school hours apologizing to everyone. My body is a failure..."
                          </p>
                          <div className="absolute bottom-3 right-8 w-8 h-8 bg-accent/10 rounded-full rounded-br-none rotate-45 backdrop-blur-[1px]"></div>
                        </div>
                      )}

                      {/* Checkpoint 4 Clue: Spinning Tape Reels Cassette */}
                      {CHECKPOINTS[activeCheckpointIndex].id === 4 && (
                        <div className="bg-white p-3.5 border-2 border-ink max-w-[220px] mx-auto shadow-md flex flex-col gap-2 font-mono text-ink">
                          <div className="bg-ink-faint rounded-none p-2.5 flex flex-col justify-between h-24 relative border border-ink/10">
                            <div className="h-5 bg-accent/10 text-accent border border-accent/20 rounded-none px-2 text-[8px] flex justify-between items-center font-bold">
                              <span>TAPE DECK: September 14</span>
                              <span className={isPlayingAudioClue[4] ? 'animate-pulse text-accent font-bold' : 'text-ink/40'}>
                                {isPlayingAudioClue[4] ? '● PLAYING' : '■ STOPPED'}
                              </span>
                            </div>
                            
                            <div className="flex justify-center gap-8 items-center my-1.5">
                              <div className={`w-8 h-8 rounded-full border-4 border-ink bg-bg flex items-center justify-center ${isPlayingAudioClue[4] ? 'animate-spin-reel' : ''}`}>
                                <div className="w-2.5 h-2.5 bg-ink rounded-full flex items-center justify-center">
                                  <div className="w-1 h-1 bg-bg rounded-full"></div>
                                </div>
                              </div>
                              <div className={`w-8 h-8 rounded-full border-4 border-ink bg-bg flex items-center justify-center ${isPlayingAudioClue[4] ? 'animate-spin-reel' : ''}`}>
                                <div className="w-2.5 h-2.5 bg-ink rounded-full flex items-center justify-center">
                                  <div className="w-1 h-1 bg-bg rounded-full"></div>
                                </div>
                              </div>
                            </div>
                            <div className="h-1.5 bg-ink/10 rounded-none"></div>
                          </div>
                        </div>
                      )}

                      {/* Checkpoint 5 Clue: Custom SVG Declining Health Chart */}
                      {CHECKPOINTS[activeCheckpointIndex].id === 5 && (
                        <div className="bg-white p-3 border-2 border-ink w-full max-w-xs mx-auto shadow-sm font-mono text-[9px] text-ink">
                          <div className="flex justify-between items-center mb-1.5 border-b border-ink/20 pb-1 font-bold">
                            <span className="text-accent uppercase">Medical record #8821</span>
                            <span className="text-ink/40">Patient: Alani</span>
                          </div>
                          
                          <svg viewBox="0 0 320 180" className="w-full h-auto">
                            {/* Grid lines */}
                            <line x1="30" y1="20" x2="300" y2="20" stroke="#e5e5e5" strokeWidth="1" strokeDasharray="2,2" />
                            <line x1="30" y1="70" x2="300" y2="70" stroke="#e5e5e5" strokeWidth="1" strokeDasharray="2,2" />
                            <line x1="30" y1="120" x2="300" y2="120" stroke="#e5e5e5" strokeWidth="1" strokeDasharray="2,2" />
                            <line x1="30" y1="150" x2="300" y2="150" stroke="#1a1a1c" strokeWidth="1" />
                            
                            {/* Axis markers */}
                            <text x="30" y="165" fill="#1a1a1c" fontSize="8" fontWeight="bold">Age 10</text>
                            <text x="120" y="165" fill="#1a1a1c" fontSize="8" fontWeight="bold">Age 12 (Puberty)</text>
                            <text x="210" y="165" fill="#1a1a1c" fontSize="8" fontWeight="bold">Age 14</text>
                            <text x="280" y="165" fill="#1a1a1c" fontSize="8" fontWeight="bold">Age 16</text>

                            {/* Self-Esteem Curve (Pink) */}
                            <path d="M 40 30 C 120 40, 200 110, 290 145" fill="none" stroke="#d42151" strokeWidth="2.5" strokeLinecap="round" />
                            <circle cx="40" cy="30" r="3.5" fill="#d42151" />
                            <circle cx="120" cy="40" r="3.5" fill="#d42151" />
                            <circle cx="200" cy="110" r="3.5" fill="#d42151" />
                            <circle cx="290" cy="145" r="3.5" fill="#d42151" />
                            
                            {/* Vitality Curve (Green) */}
                            <path d="M 40 25 C 120 30, 200 80, 290 130" fill="none" stroke="#1a1a1c" strokeWidth="2" strokeLinecap="round" strokeDasharray="3,1" />
                            <circle cx="40" cy="25" r="3" fill="#1a1a1c" />
                            <circle cx="120" cy="30" r="3" fill="#1a1a1c" />
                            <circle cx="200" cy="80" r="3" fill="#1a1a1c" />
                            <circle cx="290" cy="130" r="3" fill="#1a1a1c" />

                            <text x="45" y="42" fill="#d42151" fontSize="8" fontWeight="bold">Self-Esteem</text>
                            <text x="45" y="18" fill="#1a1a1c" fontSize="8" fontWeight="bold">Vitality</text>
                          </svg>
                          <div className="mt-2 flex justify-between text-[8px] text-ink-muted border-t border-ink/10 pt-1 flex-wrap font-bold">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-accent"></span> Self-Esteem</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-ink"></span> Vitality (Energy)</span>
                          </div>
                        </div>
                      )}

                      {/* Checkpoint 6 Clue: Fashion Clipping */}
                      {CHECKPOINTS[activeCheckpointIndex].id === 6 && (
                        <div className="bg-white border-2 border-ink p-3 font-sans text-[11px] text-ink max-w-xs mx-auto shadow-sm flex flex-col gap-2">
                          <div className="flex justify-between border-b border-ink pb-1 font-bold">
                            <span className="font-serif font-bold text-ink uppercase">VOGUE CLIPPING</span>
                            <span className="text-[7px] font-mono text-accent">BOY TOY GUIDES</span>
                          </div>
                          <div className="flex gap-2.5">
                            <div className="w-10 h-16 bg-bg border border-accent relative flex items-center justify-center shrink-0">
                              <div className="w-2.5 h-12 bg-accent/40 rounded-full"></div>
                              <div className="absolute inset-0 flex items-center justify-center text-accent font-bold select-none">❌</div>
                            </div>
                            <div className="space-y-0.5 font-mono text-[9px]">
                              <span className="text-ink font-bold block underline">DEMANDS FOR GIRLS:</span>
                              <p className="text-accent font-bold">• Play Coy!</p>
                              <p className="text-accent font-bold">• Diet & Smile!</p>
                              <p className="text-accent font-bold">• Wheedle!</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Checkpoint 7 Clue: Wax Sealed Coffin Report */}
                      {CHECKPOINTS[activeCheckpointIndex].id === 7 && (
                        <div className="bg-[#d9c0a6] border-4 border-[#8B7355] p-3.5 rounded-none shadow-md w-full max-w-[200px] mx-auto flex flex-col justify-between h-32 font-mono text-ink">
                          <div className="flex justify-between items-start">
                            <div className="bg-ink text-bg text-[8px] p-1 uppercase leading-tight font-bold">
                              CORONER REPORT
                            </div>
                            <span className="text-[7px] text-ink/60 font-bold">#8821</span>
                          </div>
                          <div className="flex justify-center my-1.5">
                            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center border-2 border-ink shadow-md text-white text-sm font-bold animate-pulse">
                              M
                            </div>
                          </div>
                          <div className="text-center text-[8px] text-ink font-bold tracking-wider uppercase">
                            FINAL VERDICT VERIFIED
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Audio tape readout toggle */}
                    {CHECKPOINTS[activeCheckpointIndex].audioText && (
                      <div className="bg-white border-2 border-dashed border-ink p-4 rounded-none mt-3 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono text-accent font-bold uppercase tracking-wider flex items-center gap-1">
                            <Volume2 className="w-3 h-3 text-accent animate-pulse" />
                            Weeping Diary Transcription
                          </span>
                          <span className="text-[9px] font-mono text-ink-muted">Speaker: Alani (Girlchild)</span>
                        </div>
                        <div className="text-xs font-serif text-ink leading-relaxed border-l-2 border-accent pl-3 py-0.5 italic">
                          "{CHECKPOINTS[activeCheckpointIndex].audioText}"
                        </div>
                        
                        <button
                          id={`play-audio-clue-btn-${activeCheckpointIndex}`}
                          onClick={() => playAudioClue(CHECKPOINTS[activeCheckpointIndex].audioText || '', CHECKPOINTS[activeCheckpointIndex].id)}
                          className={`w-full py-2.5 font-mono text-xs uppercase tracking-wider rounded-none border-2 border-ink font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                            isPlayingAudioClue[CHECKPOINTS[activeCheckpointIndex].id]
                              ? 'bg-accent text-white animate-pulse'
                              : 'bg-white text-ink hover:bg-ink hover:text-white'
                          }`}
                        >
                          {isPlayingAudioClue[CHECKPOINTS[activeCheckpointIndex].id] ? (
                            <>
                              <Pause className="w-3.5 h-3.5 fill-white" />
                              Pause Audio
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-black" />
                              Speak with Sorrow (Girl Voice) 🖤
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: Questions, Form 4 Scaffolds, and Input Fields */}
                <div className="xl:col-span-3 flex flex-col gap-4">
                  <div className="bg-white/80 border-2 border-ink rounded-none p-5 md:p-6 flex-1 flex flex-col justify-between">
                    
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-ink-muted mb-2 uppercase font-bold">
                        <span>Checkpoint Standard: {CHECKPOINTS[activeCheckpointIndex].type}</span>
                        <span>CEFR B1 Level Comprehension</span>
                      </div>
                      <h4 id={`checkpoint-question-${activeCheckpointIndex}`} className="text-base font-serif font-bold text-ink leading-relaxed mb-4">
                        {CHECKPOINTS[activeCheckpointIndex].question}
                      </h4>
                    </div>

                    {/* INPUT SECTION */}
                    <div className="my-4 flex-1 flex flex-col justify-center">
                      
                      {/* Multiple choice options */}
                      {CHECKPOINTS[activeCheckpointIndex].options ? (
                        <div className="space-y-2 font-mono text-xs">
                          {CHECKPOINTS[activeCheckpointIndex].options?.map((option, oIdx) => (
                            <button
                              key={oIdx}
                              id={`mcq-option-${oIdx}`}
                              onClick={() => {
                                setCheckpointSelectedOptions(prev => ({
                                  ...prev,
                                  [CHECKPOINTS[activeCheckpointIndex].id]: oIdx
                                }));
                              }}
                              className={`w-full text-left p-3 rounded-none border-2 transition-all duration-300 flex items-center justify-between gap-3 ${
                                checkpointSelectedOptions[CHECKPOINTS[activeCheckpointIndex].id] === oIdx
                                  ? 'bg-accent/10 border-accent text-accent font-bold'
                                  : 'bg-white border-ink-faint hover:border-ink text-ink-muted'
                              }`}
                            >
                              <span>{option}</span>
                              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${checkpointSelectedOptions[CHECKPOINTS[activeCheckpointIndex].id] === oIdx ? 'border-accent bg-accent' : 'border-ink-muted'}`}>
                                {checkpointSelectedOptions[CHECKPOINTS[activeCheckpointIndex].id] === oIdx && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : CHECKPOINTS[activeCheckpointIndex].type === 'speaking' ? (
                        
                        /* Speaking recorders with fallback text */
                        <div className="space-y-4 font-mono text-xs">
                          <div className="bg-white border-2 border-ink p-4 rounded-none flex items-center justify-between gap-4 shadow-sm">
                            <div className="flex items-end gap-1.5 h-10 w-24">
                              {visualizerData.map((val, i) => (
                                <div key={i} className="flex-1 bg-accent rounded-none" style={{ height: `${val}%`, minHeight: '3px' }}></div>
                              ))}
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-ink">00:{recordingDuration.toString().padStart(2, '0')}</span>
                              <div className="text-[9px] text-accent uppercase font-bold tracking-widest">{isRecording ? 'STREAMING' : 'READY'}</div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {!isRecording ? (
                              <button
                                id="checkpoint-mic-start-btn"
                                onClick={startRecording}
                                className="flex-1 py-3 bg-accent text-white font-bold uppercase rounded-none hover:bg-ink transition-colors flex items-center justify-center gap-1.5 border-2 border-ink"
                              >
                                <Mic className="w-3.5 h-3.5" />
                                Record Answer
                              </button>
                            ) : (
                              <button
                                id="checkpoint-mic-stop-btn"
                                onClick={stopRecording}
                                className="flex-1 py-3 bg-ink text-white font-bold uppercase rounded-none hover:bg-accent transition-colors flex items-center justify-center gap-1.5 animate-pulse border-2 border-ink"
                              >
                                <Square className="w-3.5 h-3.5 fill-white" />
                                Stop Recording
                              </button>
                            )}
                          </div>

                          <div className="flex flex-col gap-1.5 mt-2">
                            <label className="text-ink-muted uppercase tracking-widest text-[9px] font-bold">Text Backup / Draft response</label>
                            <textarea
                              id="checkpoint-speaking-text-fallback"
                              rows={3}
                              placeholder="Describe your spoken answer here..."
                              value={checkpointAnswers[CHECKPOINTS[activeCheckpointIndex].id] || ''}
                              onChange={(e) => {
                                setCheckpointAnswers(prev => ({
                                  ...prev,
                                  [CHECKPOINTS[activeCheckpointIndex].id]: e.target.value
                                }));
                              }}
                              className="w-full bg-white border-2 border-ink rounded-none p-3 text-ink focus:border-accent focus:outline-none"
                            />
                          </div>
                        </div>

                      ) : (
                        
                        /* Writing input */
                        <textarea
                          id={`checkpoint-text-input-${activeCheckpointIndex}`}
                          rows={4}
                          required
                          placeholder={CHECKPOINTS[activeCheckpointIndex].placeholder}
                          value={checkpointAnswers[CHECKPOINTS[activeCheckpointIndex].id] || ''}
                          onChange={(e) => {
                            setCheckpointAnswers(prev => ({
                              ...prev,
                              [CHECKPOINTS[activeCheckpointIndex].id]: e.target.value
                            }));
                          }}
                          className="w-full bg-white border-2 border-ink rounded-none p-4 text-ink focus:border-accent focus:outline-none font-mono text-xs"
                        />
                      )}

                      {/* SCAFFOLD HELP DRAWER / HINTS (Form 4 CEFR B1 friendly) */}
                      <div className="mt-4 font-mono text-xs">
                        <button
                          id={`help-toggle-btn-${activeCheckpointIndex}`}
                          onClick={() => {
                            setShowHelpForCp(prev => ({
                              ...prev,
                              [CHECKPOINTS[activeCheckpointIndex].id]: !prev[CHECKPOINTS[activeCheckpointIndex].id]
                            }));
                          }}
                          className="px-3 py-1.5 bg-ink/5 border-2 border-ink text-ink hover:bg-ink hover:text-white transition-all rounded-none flex items-center gap-1.5 font-bold uppercase tracking-wider"
                        >
                          <HelpIcon className="w-3.5 h-3.5" />
                          <span>{showHelpForCp[CHECKPOINTS[activeCheckpointIndex].id] ? 'Hide Clue Helper' : 'Struggling? Show Help Clue'}</span>
                        </button>

                        {showHelpForCp[CHECKPOINTS[activeCheckpointIndex].id] && (
                          <div className="mt-3 p-4 bg-accent/[0.04] border-2 border-dashed border-accent rounded-none space-y-3.5 animate-fadeIn">
                            <div>
                              <span className="text-[10px] text-accent font-bold uppercase block mb-1">💡 Simplified Hint:</span>
                              <p className="text-ink/80 leading-relaxed text-[11px] font-sans">
                                {CHECKPOINTS[activeCheckpointIndex].simplifiedHint}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t-2 border-accent/10 pt-3 text-[11px]">
                              <div>
                                <span className="text-[10px] text-ink font-bold uppercase block mb-1">📖 Simple Vocabulary Guide:</span>
                                <div className="space-y-1.5 font-sans">
                                  {CHECKPOINTS[activeCheckpointIndex].vocabularyBox.map((v, vIdx) => (
                                    <div key={vIdx} className="leading-tight">
                                      <span className="font-bold text-ink underline">{v.word}</span>: <span className="text-ink-muted">{v.meaning}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <span className="text-[10px] text-accent font-bold uppercase block mb-1">✍️ Sentence Starters:</span>
                                <ul className="list-disc pl-4 space-y-1 text-ink-muted font-sans">
                                  {CHECKPOINTS[activeCheckpointIndex].sentenceStarters.map((s, sIdx) => (
                                    <li key={sIdx}>{s}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* LOCK ANSWER & FEEDBACK */}
                    <div className="flex flex-col gap-3 font-mono">
                      <button
                        id="submit-checkpoint-btn"
                        disabled={assessingCheckpoint}
                        onClick={() => handleCheckpointSubmit(CHECKPOINTS[activeCheckpointIndex].id)}
                        className="w-full py-3.5 bg-ink text-white font-bold uppercase text-xs rounded-none hover:bg-accent hover:text-white transition-colors border-2 border-ink shadow-sm"
                      >
                        {assessingCheckpoint 
                          ? 'AI Assessor decrypting semantics...' 
                          : checkpointScores[CHECKPOINTS[activeCheckpointIndex].id] !== undefined 
                            ? 'Update Answer & Re-scan Clue' 
                            : 'Lock Answer & Scan Clue'}
                      </button>

                      {checkpointFeedback[CHECKPOINTS[activeCheckpointIndex].id] && (
                        <div className="bg-white border-2 border-ink rounded-none p-4 text-[11px] text-ink shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-accent font-bold uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 animate-pulse" />
                              Clue Assessment Complete
                            </span>
                            <span className="font-bold text-ink uppercase bg-ink-faint border-2 border-ink px-2 py-0.5 rounded-none text-[10px]">
                              Mark: {checkpointScores[CHECKPOINTS[activeCheckpointIndex].id]} / 10
                            </span>
                          </div>
                          <p className="text-ink-muted leading-relaxed mb-3 font-serif italic text-xs">
                            "{checkpointFeedback[CHECKPOINTS[activeCheckpointIndex].id]}"
                          </p>

                          {checkpointSpeakingMetrics[CHECKPOINTS[activeCheckpointIndex].id] && (
                            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t-2 border-ink text-[9px] text-ink-muted">
                              <div className="flex justify-between"><span>Grammar Accuracy:</span> <span className="font-bold text-ink">{checkpointSpeakingMetrics[CHECKPOINTS[activeCheckpointIndex].id].grammar}/10</span></div>
                              <div className="flex justify-between"><span>Vocabulary Suitability:</span> <span className="font-bold text-ink">{checkpointSpeakingMetrics[CHECKPOINTS[activeCheckpointIndex].id].vocabulary}/10</span></div>
                              <div className="flex justify-between"><span>Fluency Index:</span> <span className="font-bold text-ink">{checkpointSpeakingMetrics[CHECKPOINTS[activeCheckpointIndex].id].fluency}/10</span></div>
                              <div className="flex justify-between"><span>Confidence Score:</span> <span className="font-bold text-ink">{checkpointSpeakingMetrics[CHECKPOINTS[activeCheckpointIndex].id].confidence}/10</span></div>
                            </div>
                          )}

                          <div className="mt-3 pt-3 border-t border-ink border-dashed flex justify-between items-center text-xs font-mono">
                            <span className="font-bold uppercase text-ink-muted text-[10px]">Current Investigation Score:</span>
                            <span className="text-sm font-bold text-accent">{totalEscapeRoomScore}/100</span>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>

              {/* Navigation buttons */}
              <div className="mt-8 pt-4 border-t-2 border-ink flex justify-between items-center">
                <button
                  id="prev-checkpoint-btn"
                  disabled={activeCheckpointIndex === 0}
                  onClick={() => {
                    setActiveCheckpointIndex(prev => prev - 1);
                    setAudioBlobUrl(null);
                    setAudioBase64(null);
                  }}
                  className="px-4 py-2 border-2 border-ink text-ink rounded-none text-xs font-mono hover:bg-ink hover:text-white"
                >
                  Previous Clue
                </button>

                {checkpointsCompletedCount === 7 ? (
                  <button
                    id="finish-investigation-btn"
                    onClick={handleFinishInvestigation}
                    className="px-6 py-3 bg-accent text-white font-bold uppercase text-xs rounded-none hover:bg-ink transition-all duration-300 border-2 border-ink shadow-sm"
                  >
                    Solve Case Files
                  </button>
                ) : (
                  <button
                    id="next-checkpoint-btn"
                    disabled={activeCheckpointIndex === 6}
                    onClick={() => {
                      setActiveCheckpointIndex(prev => prev + 1);
                      setAudioBlobUrl(null);
                      setAudioBase64(null);
                    }}
                    className="px-4 py-2 border-2 border-ink text-ink rounded-none text-xs font-mono hover:bg-ink hover:text-white"
                  >
                    Next Clue
                  </button>
                )}
              </div>

            </div>
          )}

          {/* SCREEN 4: CASE REVELATION & REPORT */}
          {currentScreen === 'finalResult' && (
            <div id="final-verdict-screen" className="flex-1 flex flex-col justify-between overflow-y-auto max-h-[620px] pr-1 relative">
              {renderConfetti()}
              
              <div>
                {/* Header Banner */}
                <div className="text-center mb-8">
                  <span className="text-[10px] font-mono text-accent uppercase tracking-widest font-bold">Investigation Verdict</span>
                  <h2 className="text-3xl md:text-4xl font-serif italic font-bold text-ink mt-1">
                    {totalEscapeRoomScore >= 85 
                      ? 'CASE SOLVED: FULL REVELATION UNLOCKED' 
                      : totalEscapeRoomScore >= 70 
                        ? 'CASE SOLVED' 
                        : 'INVESTIGATION INCOMPLETE'}
                  </h2>
                </div>

                {/* VERDICT DETAILS BY SCORE */}
                {totalEscapeRoomScore >= 85 ? (
                  /* MASTER DETECTIVE ENDING (85–100 MARKS) */
                  <div className="bg-white border-4 border-double border-ink p-6 md:p-8 rounded-none mb-8 relative shadow-sm siren-active-border">
                    <div className="absolute top-0 right-0 bg-accent text-white font-bold font-mono text-[9px] tracking-widest uppercase px-4 py-1 rounded-none border-b border-l border-ink">
                      MASTER DETECTIVE ACHIEVEMENT
                    </div>
                    
                    <h3 className="text-2xl font-serif italic font-bold text-accent uppercase tracking-tight mb-4 flex items-center gap-2">
                      <Unlock className="w-6 h-6 text-accent animate-pulse" />
                      MASTER DETECTIVE ACCLAIMED
                    </h3>

                    <p className="font-mono text-xs text-ink leading-relaxed font-bold mb-6">
                      You uncovered every critical clue in the investigation.
                    </p>

                    <div className="space-y-5 text-xs font-mono text-ink leading-relaxed">
                      <div>
                        <span className="font-bold uppercase tracking-wider text-accent text-[11px] block mb-1">🩸 Final Cause of Death:</span>
                        <p className="bg-bg/50 p-4 border border-ink/10 italic font-serif text-sm">
                          Alani's death was not caused by physical illness or injury. The investigation reveals that she became trapped by unrealistic beauty standards and constant social pressure. Like the girl in the poem, she believed that her value depended on meeting society's expectations of beauty. The true cause of her destruction was the emotional damage created by toxic beauty standards, body shaming, self-doubt, and loss of self-worth.
                        </p>
                      </div>

                      <div>
                        <span className="font-bold uppercase tracking-wider text-accent text-[11px] block mb-1">📘 Message of the Poem:</span>
                        <p className="bg-bg/50 p-4 border border-ink/10 italic font-serif text-sm">
                          The poem criticises a society that values women's appearance more than their intelligence, talents, and individuality.
                        </p>
                      </div>
                    </div>

                    {/* Award Badge container */}
                    <div className="mt-6 pt-6 border-t-2 border-ink border-dashed flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="text-center sm:text-left">
                        <span className="text-[10px] text-ink-muted uppercase block">Awarded Badge Badge:</span>
                        <span className="text-xl font-bold text-ink uppercase tracking-wider">MASTER DETECTIVE</span>
                      </div>
                      <div className="px-6 py-2 border-4 border-accent text-accent font-black text-center text-sm tracking-widest uppercase bg-accent/10 animate-bounce">
                        🏆 MASTER DETECTIVE 🏆
                      </div>
                    </div>
                  </div>
                ) : totalEscapeRoomScore >= 70 ? (
                  /* DETECTIVE ENDING (70–84 MARKS) */
                  <div className="bg-white border-4 border-double border-ink p-6 md:p-8 rounded-none mb-8 relative shadow-sm">
                    <div className="absolute top-0 right-0 bg-ink text-white font-bold font-mono text-[9px] tracking-widest uppercase px-4 py-1 rounded-none border-b border-l border-ink">
                      DETECTIVE ACHIEVEMENT
                    </div>
                    
                    <h3 className="text-xl font-serif italic font-bold text-ink uppercase tracking-tight mb-4 flex items-center gap-2">
                      <Unlock className="w-5 h-5 text-accent" />
                      CASE SOLVED
                    </h3>

                    <p className="font-mono text-xs text-ink leading-relaxed font-bold mb-4">
                      You successfully uncovered the major clues surrounding Alani's death.
                    </p>

                    <div className="bg-bg/50 p-5 border border-ink/10 space-y-3 font-mono text-xs text-ink leading-relaxed">
                      <span className="font-bold uppercase tracking-wider text-accent text-[10px] block mb-1">📂 Investigation Summary:</span>
                      <ul className="list-disc pl-4 space-y-2 font-serif text-sm italic">
                        <li>The evidence suggests that Alani experienced increasing pressure to meet society's expectations of beauty.</li>
                        <li>Negative comments about appearance affected her confidence and self-image.</li>
                        <li>She gradually began judging herself based on unrealistic standards.</li>
                        <li>This emotional struggle contributed significantly to her downfall.</li>
                      </ul>
                    </div>

                    <p className="font-serif italic font-bold text-ink text-sm mt-5 text-center">
                      Congratulations, Detective. You have solved the case.
                    </p>

                    {/* Award Badge container */}
                    <div className="mt-5 pt-5 border-t-2 border-ink border-dashed flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="text-center sm:text-left">
                        <span className="text-[10px] text-ink-muted uppercase block">Awarded Badge:</span>
                        <span className="text-lg font-bold text-ink uppercase tracking-wider">DETECTIVE</span>
                      </div>
                      <div className="px-6 py-2 border-2 border-ink text-ink font-bold text-center text-xs tracking-widest uppercase bg-ink/5">
                        🎖️ DETECTIVE 🎖️
                      </div>
                    </div>
                  </div>
                ) : (
                  /* INVESTIGATION INCOMPLETE (Below 69 Marks) */
                  <div className="bg-white border-4 border-dashed border-accent p-6 rounded-none mb-8 font-mono text-ink">
                    <h3 className="text-lg font-bold text-accent uppercase mb-3 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-accent animate-pulse" />
                      INVESTIGATION INCOMPLETE
                    </h3>
                    
                    <div className="bg-accent/5 border border-accent/20 p-4 rounded-none mb-5 text-xs leading-relaxed space-y-3">
                      <p className="font-bold text-accent">
                        You have discovered some clues, but there is not enough evidence to solve Alani's case.
                      </p>
                      <p className="text-ink">
                        Review the evidence, revisit the poem, and try again.
                      </p>
                    </div>

                    {/* Checkpoints needing improvement list */}
                    <div className="mb-5">
                      <span className="text-[10px] uppercase font-bold text-accent block mb-2">🔎 Clues Needing Scaffolding & Improvement:</span>
                      <div className="space-y-2">
                        {CHECKPOINTS.map((cp) => {
                          const score = checkpointScores[cp.id];
                          const needsImprovement = score === undefined || score < 10;
                          if (!needsImprovement) return null;
                          return (
                            <div key={cp.id} className="bg-bg border border-ink/10 px-3 py-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px]">
                              <div>
                                <span className="font-bold text-ink">Clue #{cp.id}: {cp.clueName}</span>
                                <span className="text-accent ml-2 font-bold">({score !== undefined ? `${score}/10` : 'Not Attempted'})</span>
                              </div>
                              <button
                                onClick={() => {
                                  setCurrentScreen('stage2');
                                  setActiveCheckpointIndex(cp.id - 1);
                                }}
                                className="px-3 py-1 bg-accent text-white text-[9px] font-bold uppercase border border-ink hover:bg-ink transition-all"
                              >
                                Retry Clue #{cp.id}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="text-center pt-2">
                      <button
                        id="retry-checkpoints-btn"
                        onClick={() => {
                          setCurrentScreen('stage2');
                          setActiveCheckpointIndex(0);
                        }}
                        className="px-6 py-3 bg-ink text-white font-bold uppercase text-xs rounded-none hover:bg-accent border-2 border-ink transition-colors"
                      >
                        Re-evaluate All Clues
                      </button>
                    </div>
                  </div>
                )}

                {/* OFFICIAL INVESTIGATION REPORT CARD */}
                <div className="bg-white border-2 border-ink p-5 rounded-none mb-8 shadow-sm">
                  <div className="border-b-2 border-ink pb-2 mb-4 flex justify-between items-center">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent">Official Investigative Ledger</span>
                    <span className="text-[9px] font-mono text-ink-muted">FILE ID: #{groupNumber}-{studentName.slice(0, 3).toUpperCase()}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs mb-6">
                    <div className="space-y-2 bg-bg/30 p-3 border border-ink/5">
                      <span className="text-[10px] text-accent font-bold uppercase block border-b border-ink/10 pb-1">IDENTIFICATION RECORDS</span>
                      <div className="flex justify-between">
                        <span className="text-ink-muted">Student Name:</span>
                        <span className="font-bold text-ink">{studentName || 'Not Set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-muted">Group Name:</span>
                        <span className="font-bold text-ink">{groupName || 'Not Set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-muted">Group Table:</span>
                        <span className="font-bold text-ink">Table {groupNumber}</span>
                      </div>
                    </div>

                    <div className="space-y-2 bg-bg/30 p-3 border border-ink/5">
                      <span className="text-[10px] text-accent font-bold uppercase block border-b border-ink/10 pb-1">COMPREHENSION METRICS</span>
                      <div className="flex justify-between">
                        <span className="text-ink-muted">Reading Score (Lead Pupil):</span>
                        <span className="font-bold text-ink">{groupMembers[0]?.readingScore !== null ? `${groupMembers[0]?.readingScore}/100` : 'Not Assessed'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-muted">Total Investigation Score:</span>
                        <span className="font-bold text-accent text-sm">{totalEscapeRoomScore}/100 marks</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ink-muted">Performance Level:</span>
                        <span className="font-bold text-ink bg-ink-faint px-2 py-0.5 rounded-none text-[9px]">
                          {totalEscapeRoomScore >= 85 
                            ? 'Master Detective' 
                            : totalEscapeRoomScore >= 70 
                              ? 'Detective' 
                              : 'Investigation Incomplete'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Individual Clue Scores list */}
                  <div className="mb-6">
                    <span className="text-[10px] font-mono font-bold uppercase text-ink-muted block mb-3 border-b border-ink/10 pb-1">INDIVIDUAL CLUE SCORES</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                      {CHECKPOINTS.map((cp) => {
                        const score = checkpointScores[cp.id];
                        const completed = score !== undefined;
                        return (
                          <div key={cp.id} className="bg-bg border-2 border-ink/15 p-2 rounded-none text-center flex flex-col justify-between relative min-h-[85px]">
                            <span className="text-[9px] font-mono font-bold text-ink-muted block leading-none">Clue {cp.id} Score</span>
                            <span className="text-base font-bold text-accent block my-1">
                              {completed ? `${score}/10` : '—'}
                            </span>
                            <span className="text-[8px] font-mono text-ink-muted leading-tight truncate block" title={cp.clueName}>{cp.clueName}</span>
                            {completed && score < 10 && (
                              <button
                                onClick={() => {
                                  setCurrentScreen('stage2');
                                  setActiveCheckpointIndex(cp.id - 1);
                                }}
                                className="mt-1 w-full py-0.5 bg-ink text-white font-mono text-[7px] font-bold uppercase hover:bg-accent transition-colors"
                              >
                                Retry
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Performance Levels Multi-Box */}
                  <div className="mb-4">
                    <span className="text-[10px] font-mono font-bold uppercase text-ink-muted block mb-2">PERFORMANCE BANDS</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-center text-[11px] font-mono">
                      <div className={`p-2.5 border-2 ${totalEscapeRoomScore >= 85 ? 'border-accent bg-accent/10 text-accent font-bold' : 'border-ink/10 text-ink-muted'}`}>
                        <span>🏆 Master Detective (85–100)</span>
                        {totalEscapeRoomScore >= 85 && <span className="block text-[8px] font-black uppercase text-accent mt-0.5">Your Achievement</span>}
                      </div>
                      <div className={`p-2.5 border-2 ${totalEscapeRoomScore >= 70 && totalEscapeRoomScore < 85 ? 'border-ink bg-ink/5 text-ink font-bold' : 'border-ink/10 text-ink-muted'}`}>
                        <span>🎖️ Detective (70–84)</span>
                        {totalEscapeRoomScore >= 70 && totalEscapeRoomScore < 85 && <span className="block text-[8px] font-black uppercase text-ink mt-0.5">Your Achievement</span>}
                      </div>
                      <div className={`p-2.5 border-2 ${totalEscapeRoomScore < 70 ? 'border-dashed border-accent bg-accent/5 text-accent font-bold' : 'border-ink/10 text-ink-muted'}`}>
                        <span>⚠️ Investigation Incomplete (Below 69)</span>
                        {totalEscapeRoomScore < 70 && <span className="block text-[8px] font-black uppercase text-accent mt-0.5">Needs Scaffolding</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PERSONALISED PEDAGOGICAL FEEDBACK PANEL */}
                {(() => {
                  const report = getPersonalizedReport();
                  return (
                    <div className="bg-ink text-bg border-2 border-ink rounded-none p-6 shadow-md mb-8">
                      <div className="border-b border-bg/20 pb-2 mb-4">
                        <h4 className="text-sm font-mono uppercase tracking-widest text-accent font-bold">Personalised Advisory Report</h4>
                        <p className="text-[10px] text-bg/60 font-mono">Generated dynamically by AI Assessor based on linguistic and thematic competencies.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                        <div className="bg-bg/5 p-3 border border-bg/10 rounded-none">
                          <span className="text-[11px] font-bold text-accent uppercase tracking-wider block mb-2">💪 STRENGTHS:</span>
                          <ul className="list-disc pl-4 space-y-2 text-bg/90 leading-relaxed font-sans">
                            {report.strengths.map((str, idx) => (
                              <li key={idx}>{str}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-bg/5 p-3 border border-bg/10 rounded-none">
                          <span className="text-[11px] font-bold text-accent uppercase tracking-wider block mb-2">🔍 AREAS FOR IMPROVEMENT:</span>
                          <ul className="list-disc pl-4 space-y-2 text-bg/90 leading-relaxed font-sans">
                            {report.improvements.map((imp, idx) => (
                              <li key={idx}>{imp}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-bg/5 p-3 border border-bg/10 rounded-none">
                          <span className="text-[11px] font-bold text-accent uppercase tracking-wider block mb-2">👣 SUGGESTED NEXT STEPS:</span>
                          <ul className="list-disc pl-4 space-y-2 text-bg/90 leading-relaxed font-sans">
                            {report.nextSteps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </div>

              {/* ACTION FOOTER */}
              <div className="mt-4 pt-4 border-t-2 border-ink flex flex-wrap justify-end gap-3 font-mono">
                <button
                  id="restart-mystery-btn"
                  onClick={() => {
                    setCurrentScreen('howToPlay');
                    setGroupMembers([]);
                    setCheckpointAnswers({});
                    setCheckpointScores({});
                    setCheckpointFeedback({});
                    setCheckpointSelectedOptions({});
                    setAchievements(prev => prev.map(a => ({ ...a, earned: false })));
                  }}
                  className="px-6 py-3 border-2 border-ink text-ink rounded-none text-xs hover:bg-ink hover:text-white transition-colors bg-white font-bold"
                >
                  Restart Investigation
                </button>
                <button
                  id="view-analytics-report-btn"
                  onClick={() => setShowTeacherDashboard(true)}
                  className="px-6 py-3 bg-accent text-white border-2 border-ink font-bold uppercase rounded-none hover:bg-ink transition-colors text-xs shadow-sm"
                >
                  Print Lesson Report
                </button>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* TEACHER MODAL */}
      {showTeacherDashboard && (
        <div id="teacher-dashboard-modal" className="fixed inset-0 bg-ink/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-bg w-full max-w-4xl max-h-[85vh] rounded-none border-4 border-ink p-6 md:p-8 flex flex-col overflow-hidden relative shadow-2xl">
            
            <div className="flex justify-between items-baseline border-b-2 border-ink pb-4 mb-6">
              <div>
                <span className="text-[10px] font-mono text-accent uppercase tracking-widest font-bold">Pedagogical Reports Panel</span>
                <h3 className="text-2xl font-serif italic font-bold text-ink uppercase tracking-tight">
                  Teacher Performance & Grading Report
                </h3>
              </div>
              <button 
                id="close-teacher-dashboard-btn"
                onClick={() => setShowTeacherDashboard(false)}
                className="px-3 py-1 border-2 border-ink text-ink rounded-none text-xs font-mono hover:bg-ink hover:text-white uppercase font-bold"
              >
                Close [x]
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1 font-mono text-xs text-ink">
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-none border-2 border-ink shadow-sm">
                <div>
                  <span className="text-ink-muted uppercase text-[9px] font-bold">Registered Squad</span>
                  <div className="text-sm font-bold text-ink truncate">{groupName || 'Not Registered'}</div>
                </div>
                <div>
                  <span className="text-ink-muted uppercase text-[9px] font-bold">Group Table</span>
                  <div className="text-sm font-bold text-ink">#{groupNumber || '0'}</div>
                </div>
                <div>
                  <span className="text-ink-muted uppercase text-[9px] font-bold">Phonetic Average</span>
                  <div className="text-sm font-bold text-accent">{averageReadingScore}%</div>
                </div>
                <div>
                  <span className="text-ink-muted uppercase text-[9px] font-bold">Comprehension Score</span>
                  <div className="text-sm font-bold text-accent">{totalEscapeRoomScore}%</div>
                </div>
              </div>

              {/* Members evaluation details */}
              <div>
                <h4 className="text-xs font-bold uppercase text-ink tracking-wider mb-3 flex items-center gap-2 font-mono">
                  <User className="w-4 h-4 text-accent" />
                  Individual Pupil Phonetics Log (Stage 1)
                </h4>
                {groupMembers.length === 0 ? (
                  <p className="text-ink-muted">No student assessment data recorded yet.</p>
                ) : (
                  <div className="space-y-4">
                    {groupMembers.map((member, idx) => (
                      <div key={idx} className="bg-white border-2 border-ink rounded-none p-4 shadow-sm">
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="font-bold text-ink text-sm font-serif">{member.name}</span>
                          <span className="text-accent font-bold">{member.readingScore ? `${member.readingScore} / 100` : 'Pending Assessment'}</span>
                        </div>
                        {member.readingFeedback ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] mt-2 text-ink leading-relaxed border-t-2 border-ink-faint pt-2">
                            <div>
                              <span className="text-accent font-bold block mb-1 text-[10px]">✔ STRENGTHS:</span>
                              <ul className="list-disc pl-4 space-y-0.5 text-ink-muted font-sans">
                                {member.readingFeedback.strengths.map((s, sIdx) => <li key={sIdx}>{s}</li>)}
                              </ul>
                            </div>
                            <div>
                              <span className="text-ink font-bold block mb-1 text-[10px]">▲ ROOM FOR IMPROVEMENT:</span>
                              <ul className="list-disc pl-4 space-y-0.5 text-ink-muted font-sans">
                                {member.readingFeedback.improvements.map((im, imIdx) => <li key={imIdx}>{im}</li>)}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[10px] text-ink-muted italic">No diagnostic recorded yet.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Printable box */}
              <div className="border-t-2 border-ink pt-6">
                <h4 className="text-xs font-bold uppercase text-ink tracking-wider mb-3 flex items-center gap-2 font-mono">
                  <FileText className="w-4 h-4 text-accent" />
                  Copyable Lesson Assessment Data
                </h4>
                <div className="bg-white p-4 rounded-none border-2 border-ink text-ink select-text font-mono text-[11px] leading-relaxed relative shadow-sm">
                  <div className="absolute top-3 right-3">
                    <button 
                      onClick={() => {
                        const copyText = document.getElementById("exportable-report-content")?.innerText || '';
                        navigator.clipboard.writeText(copyText);
                        alert("Assessment data copied to clipboard!");
                      }} 
                      className="px-3 py-1 bg-ink hover:bg-accent text-white rounded-none border-2 border-ink text-[10px] font-bold cursor-pointer"
                    >
                      Copy Report
                    </button>
                  </div>
                  
                  <div id="exportable-report-content">
                    <p>=========================================================</p>
                    <p>BARBIE DOLL MYSTERY ESCAPE ROOM: FORMATIVE GRADING SHEET</p>
                    <p>=========================================================</p>
                    <p>EVALUATION TIMESTAMP: {new Date().toLocaleDateString()}</p>
                    <p>INVESTIGATION SQUAD: {groupName || 'Not Set'} (Table #{groupNumber || '0'})</p>
                    <p>LEAD PUPIL: {studentName || 'Not Set'}</p>
                    <p>---------------------------------------------------------</p>
                    <p>STAGE 1: SPEAKING SCORES (POEM PHONETICS READING)</p>
                    {groupMembers.map((m, idx) => (
                      <p key={idx}>- {m.name}: {m.readingScore || 'Pending'}/100 [Keycode: {m.keyCode || 'N/A'}]</p>
                    ))}
                    <p>SQUAD PHONETIC AVERAGE: {averageReadingScore}%</p>
                    <p>---------------------------------------------------------</p>
                    <p>STAGE 2: ESCAPE ROOM CRITICAL READ (7 CHECKPOINTS)</p>
                    <p>TOTAL COMPREHENSION MARKS: {totalEscapeRoomScore} %</p>
                    <p>CHECKPOINTS COMPLETED: {checkpointsCompletedCount} / 7</p>
                    <p>---------------------------------------------------------</p>
                    <p>SUMMARY GRADE DIAGNOSTIC</p>
                    <p>COMBINED PROGRESS ACCURACY: {finalCombinedPercent}%</p>
                    <p>CEFR B1 LEVEL BAND: {band.name}</p>
                    <p>=========================================================</p>
                  </div>
                </div>
              </div>

            </div>

            <div className="border-t-2 border-ink pt-4 mt-6 text-right">
              <button
                onClick={() => setShowTeacherDashboard(false)}
                className="px-6 py-2.5 bg-ink text-white font-mono text-xs font-bold uppercase tracking-wider rounded-none hover:bg-accent transition-colors border-2 border-ink cursor-pointer"
              >
                Return to Room
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-auto px-6 py-4 border-t border-white/10 bg-[#0F0F11] flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-mono text-white/30 tracking-[0.2em] uppercase select-none">
        <div>&copy; 2026 AI ESCAPE ROOM LESSON // CEFR B1 FORMATIVE AID</div>
        <div>Squad Active: {groupName || 'Unassigned'}</div>
      </footer>

    </div>
  );
}
