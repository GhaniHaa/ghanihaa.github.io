"use client"

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Github, 
  ExternalLink, 
  Mail, 
  Code2, 
  Layers, 
  Cpu, 
  Database, 
  Terminal,
  Monitor,
  Smartphone,
  Globe,
  MessageSquare,
  Send,
  X,
  Sparkles,
  Loader2,
  Bot
} from 'lucide-react';

// --- TypeScript Interfaces ---
interface ProjectCardProps {
  title: string;
  desc: string;
  tags: string[];
  link: string;
  featured?: boolean;
}

interface TechSectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  color: string;
}

interface ProjectIdea {
  title: string;
  desc: string;
  stack: string[];
  cool: string;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface ChatWidgetProps {
  contextData: ProjectCardProps[];
}

interface Shape {
  mesh: THREE.LineSegments;
  speed: number;
}

// --- Gemini API Helper ---
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""; // Injected at build time

const callGemini = async (prompt: string, systemInstruction: string = ""): Promise<string> => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to my AI brain right now.";
  }
};

// --- 3D Background Component ---
const Scene3D = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    // Dark tech blue-black background
    scene.background = new THREE.Color('#0f172a'); 
    scene.fog = new THREE.FogExp2('#0f172a', 0.002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    camera.position.y = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Particles - Digital Landscape
    const particlesGeometry = new THREE.BufferGeometry();
    const count = 3000;
    const posArray = new Float32Array(count * 3);
    
    for(let i = 0; i < count * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100; // Spread
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.15,
      color: 0x60a5fa, // Tailwind blue-400
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);

    // Floating Geometries (Abstract Tech Nodes)
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.3 });
    const wireframe = new THREE.WireframeGeometry(geometry);
    
    const shapes: Shape[] = [];
    for (let i = 0; i < 5; i++) {
      const line = new THREE.LineSegments(wireframe, lineMaterial);
      line.position.x = (Math.random() - 0.5) * 60;
      line.position.y = (Math.random() - 0.5) * 40;
      line.position.z = (Math.random() - 0.5) * 40;
      line.scale.setScalar(Math.random() * 2 + 1);
      scene.add(line);
      shapes.push({ mesh: line, speed: Math.random() * 0.02 });
    }

    // Animation Loop
    let scrollY = 0;
    
    const animate = () => {
      requestAnimationFrame(animate);

      const time = Date.now() * 0.0005;

      // Rotate landscape based on scroll + time
      particlesMesh.rotation.y = time * 0.05 + (scrollY * 0.0002);
      particlesMesh.rotation.x = (scrollY * 0.0001);

      // Wave effect on particles
      const positions = particlesGeometry.attributes.position.array;
      for(let i = 0; i < count; i++) {
        const i3 = i * 3;
        const x = particlesGeometry.attributes.position.array[i3];
        // Simple sine wave distortion
        particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(time + x) * 2;
      }
      particlesGeometry.attributes.position.needsUpdate = true;

      // Rotate shapes
      shapes.forEach(shape => {
        shape.mesh.rotation.x += shape.speed;
        shape.mesh.rotation.y += shape.speed;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Handle Scroll
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
};

// --- UI Components ---

const ProjectCard: React.FC<ProjectCardProps> = ({ title, desc, tags, link, featured = false }) => (
  <div className={`group relative p-6 rounded-2xl backdrop-blur-md border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden ${featured ? 'md:col-span-2' : ''}`}>
    {/* Hover Gradient Effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500" />
    
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-white/10">
          {featured ? <Globe className="w-6 h-6 text-blue-300" /> : <Code2 className="w-6 h-6 text-purple-300" />}
        </div>
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-4 flex-grow">{desc}</p>
      
      <div className="flex flex-wrap gap-2 mt-auto">
        {tags.map((tag: string, i: number) => (
          <span key={i} className="text-xs text-blue-200/80 bg-blue-500/10 px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const TechSection: React.FC<TechSectionProps> = ({ icon: Icon, title, items, color }) => (
  <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-700/50 backdrop-blur-sm hover:border-slate-500/50 transition-colors">
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 rounded-lg bg-${color}-500/20`}>
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
    </div>
    <div className="flex flex-wrap gap-2">
      {items.map((item: string) => (
        <span key={item} className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-md text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-default">
          {item}
        </span>
      ))}
    </div>
  </div>
);

// --- AI Components ---

const AIProjectGenerator = () => {
  const [topic, setTopic] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [idea, setIdea] = useState<ProjectIdea | null>(null);

  const generateIdea = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setIdea(null);

    const systemPrompt = "You are a creative tech lead specializing in React (Next.js) and Vue (Nuxt). Your goal is to suggest unique, modern web app project ideas based on a user's topic.";
    const userPrompt = `Generate a creative web application idea based on the topic: "${topic}". 
    The tech stack MUST be chosen from: React, Next.js, Vue, Nuxt, Tailwind, Supabase, Firebase, OpenAI API.
    
    Return the response in this plain text format:
    Title: [Project Title]
    Description: [2 sentences description]
    Stack: [Comma separated list of 3-4 technologies]
    Why it's cool: [1 short sentence]`;

    const result = await callGemini(userPrompt, systemPrompt);
    
    // Simple parsing for display (robust enough for this demo)
    const lines = result.split('\n');
    const parsedIdea = {
      title: lines.find((l: string) => l.startsWith('Title:'))?.replace('Title:', '').trim() || "AI Generated Project",
      desc: lines.find((l: string) => l.startsWith('Description:'))?.replace('Description:', '').trim() || result,
      stack: lines.find((l: string) => l.startsWith('Stack:'))?.replace('Stack:', '').trim().split(',') || [],
      cool: lines.find((l: string) => l.startsWith("Why it's cool:"))?.replace("Why it's cool:", '').trim() || ""
    };

    setIdea(parsedIdea);
    setIsLoading(false);
  };

  return (
    <div className="mt-12 p-1 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
      <div className="bg-slate-900 rounded-xl p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4 text-blue-400 font-semibold">
          <Sparkles className="w-5 h-5" />
          <span>AI Project Spark</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">Stuck? Let AI build your next portfolio piece.</h3>
        <p className="text-slate-400 mb-6">Enter a topic (e.g., "Coffee", "Fitness", "Crypto") and I'll generate a tailored project idea using my preferred tech stack.</p>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && generateIdea()}
          />
          <button 
            onClick={generateIdea}
            disabled={isLoading || !topic}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-bold transition-all flex items-center justify-center gap-2 min-w-[140px]"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Generate <Sparkles className="w-4 h-4" /></>}
          </button>
        </div>

        {idea && (
          <div className="animate-fade-in bg-slate-800/50 border border-white/10 rounded-xl p-6">
            <h4 className="text-xl font-bold text-white mb-2">{idea.title}</h4>
            <p className="text-slate-300 mb-4">{idea.desc}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {idea.stack.map((tech: string, i: number) => (
                <span key={i} className="text-xs font-mono bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/30">
                  {tech.trim()}
                </span>
              ))}
            </div>
            {idea.cool && <p className="text-sm text-purple-300 italic">✨ {idea.cool}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

const ChatWidget: React.FC<ChatWidgetProps> = ({ contextData }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hi! I'm Ghanihaa's AI Twin. Ask me anything about his experience, skills, or projects." }
  ]);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const systemContext = `
      You are an AI assistant acting as Ghanihaa, a Senior Frontend Engineer with 8+ years of experience.
      Be professional, friendly, and concise.
      
      Here is your background data:
      - Experience: 8+ Years
      - Core Stack: React (Next.js, Remix), Vue (Nuxt, Quasar).
      - Projects:
      ${contextData.map((p: ProjectCardProps) => `- ${p.title}: ${p.desc} (Stack: ${p.tags.join(', ')})`).join('\n')}
      - Contact: Open to freelance and full-time.
      
      Answer as if you are Ghanihaa. If asked about something not in your stack, be honest but mention your ability to learn fast.
    `;

    const responseText = await callGemini(input, systemContext);

    setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[90vw] md:w-96 h-[500px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-slate-800/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Ghanihaa AI</h3>
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/5'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-white/5 flex gap-1">
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 bg-slate-800/30">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me about my projects..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <button 
                onClick={handleSend}
                disabled={isTyping || !input.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        <span className="font-semibold hidden md:block">{isOpen ? 'Close Chat' : 'Chat with AI'}</span>
      </button>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Active section detection
      const sections = ['hero', 'about', 'projects', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top >= -100 && rect.top < window.innerHeight / 2;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80, // Offset for fixed header
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  const projects = [
    {
      title: "Central Kitchen One",
      desc: "A comprehensive kitchen management system focusing on inventory, production, and distribution logic. Built with high attention to data integrity and user experience.",
      tags: ["React", "Next.js", "Tailwind", "Dashboard"],
      link: "https://central-kitchen-one.vercel.app/login",
      featured: true
    },
    {
      title: "Neuro-Gen AI Dashboard",
      desc: "Interactive AI analytics platform visualizing large language model outputs with real-time streaming data and vector database integration.",
      tags: ["Vue 3", "Quasar", "TensorFlow.js", "WebSockets"],
      link: "#",
      featured: false
    },
    {
      title: "E-Commerce Nuxt Starter",
      desc: "High-performance headless e-commerce template. Features server-side rendering for SEO and optimized image handling.",
      tags: ["Nuxt 3", "Pinia", "Stripe API", "TypeScript"],
      link: "#",
      featured: false
    },
    {
      title: "Remix SaaS Boilerplate",
      desc: "Authentication, subscription management, and team logic pre-configured. Designed for rapid scalability and edge deployment.",
      tags: ["Remix", "Prisma", "PostgreSQL", "Radix UI"],
      link: "#",
      featured: false
    }
  ];

  return (
    <div className="min-h-screen text-slate-200 font-sans selection:bg-blue-500/30">
      <Scene3D />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-slate-900/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="text-xl font-bold tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <span className="hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Ghanihaa</span>
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-400">
            {['about', 'projects', 'contact'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item)}
                className={`capitalize transition-colors ${
                  activeSection === item ? 'text-white font-bold' : 'hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 relative z-10">
        
        {/* Hero Section */}
        <section id="hero" className="min-h-screen flex flex-col justify-center pt-20">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Open to Work
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Crafting Digital <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Experiences
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
              Senior Frontend Engineer with <span className="text-slate-200 font-semibold">8+ years</span> of expertise. 
              Specializing in the <span className="text-blue-300">React</span> & <span className="text-green-300">Vue</span> ecosystems 
              to build scalable, high-performance applications with a touch of AI integration.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => scrollToSection('projects')}
                className="px-8 py-3 rounded-lg bg-white text-slate-900 font-bold hover:bg-blue-50 transition-all flex items-center gap-2"
              >
                View Work <Layers className="w-4 h-4" />
              </button>
              <a 
                href="https://github.com/ghanihaa" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white font-semibold hover:bg-slate-800 transition-all flex items-center gap-2 backdrop-blur-sm"
              >
                <Github className="w-4 h-4" /> GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Stats / Quick Info */}
        <section className="py-10 border-y border-white/5 bg-slate-900/30 backdrop-blur-sm -mx-6 px-6 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-1">8+</div>
              <div className="text-sm text-slate-400">Years Experience</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">50+</div>
              <div className="text-sm text-slate-400">Projects Delivered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">React/Vue</div>
              <div className="text-sm text-slate-400">Expertise</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">Full Stack</div>
              <div className="text-sm text-slate-400">Capability</div>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section id="about" className="py-20">
          <h2 className="text-3xl font-bold text-white mb-12 flex items-center gap-3">
            <Cpu className="w-8 h-8 text-purple-500" /> Technical Arsenal
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TechSection 
              icon={Monitor}
              title="React Ecosystem"
              color="blue"
              items={["React 18", "Next.js (App Router)", "Remix", "Redux Toolkit", "TanStack Query", "Tailwind CSS", "Framer Motion"]}
            />
            
            <TechSection 
              icon={Layers}
              title="Vue Ecosystem"
              color="green"
              items={["Vue 3", "Nuxt 3", "Quasar Framework", "Pinia", "Vue Router", "Vite", "Vitest"]}
            />
            
            <TechSection 
              icon={Terminal}
              title="Backend & AI"
              color="purple"
              items={["Node.js", "Python", "OpenAI/Gemini API", "LangChain", "PostgreSQL", "Firebase", "Docker"]}
            />
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-20">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Code2 className="w-8 h-8 text-blue-500" /> Featured Projects
            </h2>
            <a href="https://github.com/ghanihaa" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
              View all on GitHub <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <ProjectCard key={index} {...project} />
            ))}
          </div>

          {/* New AI Feature: Project Spark */}
          <AIProjectGenerator />
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 pb-40">
          <div className="bg-gradient-to-br from-slate-800/50 to-blue-900/20 border border-white/10 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full -z-10" />
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Let's Build Something Amazing</h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-8 text-lg">
              I'm currently available for freelance projects and full-time opportunities. 
              If you're looking for a senior engineer to bring your vision to life, let's talk.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="mailto:contact@example.com" className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center justify-center gap-2">
                <Mail className="w-5 h-5" /> Email Me
              </a>
              <a href="https://github.com/ghanihaa" target="_blank" className="px-8 py-3 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-bold transition-all flex items-center justify-center gap-2">
                <Github className="w-5 h-5" /> GitHub Profile
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-slate-500 text-sm relative z-10 bg-slate-950/50 backdrop-blur-sm">
        <p>© {new Date().getFullYear()} Ghanihaa. Built with React, Three.js & Tailwind.</p>
      </footer>

      {/* New AI Feature: Chat Widget */}
      <ChatWidget contextData={projects} />
    </div>
  );
}