import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Star, 
  Zap, 
  Shield, 
  Target, 
  TrendingUp, 
  Users,
  Sparkles,
  ChevronDown,
  Play,
  CheckCircle,
  Upload,
  Brain,
  FileText,
  BarChart3,
  MessageSquare,
  Rocket,
  Award,
  Globe,
  Layers,
  Cpu,
  Wand2
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

// Particle system component
const Particle = ({ index }: { index: number }) => {
  const size = Math.random() * 4 + 2;
  const duration = Math.random() * 20 + 10;
  const delay = Math.random() * 10;
  
  return (
    <motion.div
      className="absolute rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-20"
      style={{
        width: size,
        height: size,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        y: [-20, -100, -20],
        x: [0, Math.random() * 100 - 50, 0],
        opacity: [0, 0.4, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut"
      }}
    />
  );
};

// Floating 3D Card Component
const FloatingCard = ({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  return (
    <motion.div
      className={`floating-3d-card ${className}`}
      initial={{ y: 0, rotateX: 0, rotateY: 0 }}
      animate={{
        y: [-10, 10, -10],
        rotateX: [-5, 5, -5],
        rotateY: [-3, 3, -3],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut"
      }}
      whileHover={{
        scale: 1.05,
        rotateY: 10,
        rotateX: 5,
        transition: { duration: 0.3 }
      }}
    >
      {children}
    </motion.div>
  );
};

// Advanced 3D Icon Component
const Icon3D = ({ Icon, color, delay = 0 }: { Icon: any, color: string, delay?: number }) => {
  return (
    <motion.div
      className="relative"
      initial={{ y: 0, z: 0 }}
      animate={{
        y: [-15, 15, -15],
        rotateY: [0, 360],
        rotateX: [0, 15, 0],
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut"
      }}
      whileHover={{
        scale: 1.2,
        rotateY: 180,
        transition: { duration: 0.5 }
      }}
    >
      <div 
        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${color}40, ${color}80)`,
          boxShadow: `0 20px 40px ${color}30`,
        }}
      >
        <Icon size={32} color={color} />
      </div>
    </motion.div>
  );
};

const PremiumLandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  // Transform values for parallax effects
  const heroY = useTransform(scrollY, [0, 300], [0, -50]);
  const backgroundY = useTransform(scrollY, [0, 500], [0, -100]);

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setIsLoaded(true);
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }
  };

  return (
    <div ref={containerRef} className="premium-landing-page">
      {/* Advanced Mouse Follower */}
      <motion.div
        className="mouse-follower-advanced"
        style={{
          x: mousePosition.x - 25,
          y: mousePosition.y - 25,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut"
        }}
      />

      {/* Particle Background */}
      <AnimatePresence>
        {isLoaded && (
          <div className="particle-container">
            {Array.from({ length: 50 }).map((_, i) => (
              <Particle key={i} index={i} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Advanced Navigation */}
      <motion.nav
        className="premium-navigation"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="nav-container">
          <motion.div 
            className="nav-logo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Brain className="logo-icon" />
            <span className="logo-text">AI Career Pro</span>
          </motion.div>

          <div className="nav-menu">
            {['Features', 'Demo', 'Contact'].map((item, index) => (
              <motion.button
                key={item}
                onClick={() => {
                  if (item === 'Demo') {
                    setShowDemo(true);
                  } else if (item === 'Contact') {
                    const footer = document.querySelector('.premium-footer');
                    if (footer) {
                      footer.scrollIntoView({ behavior: 'smooth' });
                    }
                  } else {
                    scrollToSection(item.toLowerCase());
                  }
                }}
                className="nav-item nav-item-3d"
                whileHover={{ 
                  y: -2,
                  rotateX: 10,
                  rotateY: 5,
                  scale: 1.05
                }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <span>{item}</span>
                <motion.div 
                  className="nav-arrow-3d"
                  animate={{
                    x: [0, 5, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <ArrowRight size={16} />
                </motion.div>
              </motion.button>
            ))}
          </div>

          <motion.button
            className="nav-cta-button"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(6, 182, 212, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
          >
            Try Free Now
            <ArrowRight size={16} />
          </motion.button>
        </div>
      </motion.nav>

      {/* Ultra-Premium Hero Section */}
      <motion.section 
        className="premium-hero-section"
        style={{ y: heroY }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Background Elements */}
        <motion.div className="hero-background" style={{ y: backgroundY }}>
          <div className="gradient-orb orb-1" />
          <div className="gradient-orb orb-2" />
          <div className="gradient-orb orb-3" />
          <div className="gradient-mesh" />
        </motion.div>

        <div className="hero-container">
          {/* Floating 3D Icons */}
          <div className="floating-icons-3d">
            <Icon3D Icon={Rocket} color="#06b6d4" delay={0} />
            <Icon3D Icon={Award} color="#3b82f6" delay={1} />
            <Icon3D Icon={Target} color="#8b5cf6" delay={2} />
            <Icon3D Icon={Zap} color="#06b6d4" delay={3} />
            <Icon3D Icon={Globe} color="#3b82f6" delay={4} />
            <Icon3D Icon={Layers} color="#8b5cf6" delay={5} />
          </div>

          {/* Main Hero Content */}
          <motion.div className="hero-content" variants={itemVariants}>
            {/* Premium Badge */}
            <motion.div
              className="hero-badge"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.5 }}
            >
              <Sparkles size={16} />
              <span>Trusted Career Guidance</span>
            </motion.div>

            {/* Ultra-Premium Title */}
            <motion.h1 
              className="hero-title-premium"
              variants={itemVariants}
            >
              <motion.span
                className="title-line"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                Land Your Dream Job
              </motion.span>
              <motion.span
                className="title-line title-gradient"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.8 }}
              >
                With Smart Insights
              </motion.span>
              <motion.span
                className="title-line"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                & Personal Guidance
              </motion.span>
            </motion.h1>

            {/* Enhanced Subtitle */}
            <motion.p 
              className="hero-subtitle-premium"
              variants={itemVariants}
              transition={{ delay: 1.4 }}
            >
              Get expert career advice that actually works. Practice interviews 
              and discover opportunities that match your skills and goals. Real results from real career experts.
            </motion.p>

            {/* Premium CTA Buttons */}
            <motion.div 
              className="hero-buttons-premium"
              variants={itemVariants}
              transition={{ delay: 1.6 }}
            >
              <motion.button
                className="cta-primary-premium"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(6, 182, 212, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
              >
                <span>Get Career Help Now</span>
                <Rocket size={20} />
              </motion.button>

              <motion.button
                className="cta-secondary-premium"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDemo(true)}
              >
                <Play size={20} />
                <span>Watch Demo</span>
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              className="trust-indicators"
              variants={itemVariants}
              transition={{ delay: 1.8 }}
            >
              <div className="trust-item">
                <div className="trust-number">2,400+</div>
                <div className="trust-label">People Helped</div>
              </div>
              <div className="trust-item">
                <div className="trust-number">85%</div>
                <div className="trust-label">Get Interviews</div>
              </div>
              <div className="trust-item">
                <div className="trust-number">24/7</div>
                <div className="trust-label">Career Support</div>
              </div>
            </motion.div>
          </motion.div>


        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="scroll-indicator"
          animate={{
            y: [0, 10, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut"
          }}
        >
          <ChevronDown size={24} />
        </motion.div>
      </motion.section>

      {/* Ultra-Premium Features Section */}
      <motion.section id="features" className="premium-features-section">
        <div className="features-container">
          <motion.div 
            className="section-header-premium"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="section-badge"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              viewport={{ once: true }}
            >
              <Zap size={16} />
              <span>Revolutionary Features</span>
            </motion.div>
            
            <h2 className="section-title-premium">
              Experience the Next Generation
              <br />
              <span className="title-gradient">AI Career Platform</span>
            </h2>
            
            <p className="section-subtitle-premium">
              Discover powerful tools designed to accelerate your career growth with precision and intelligence.
            </p>
          </motion.div>

          <div className="features-grid-premium">
            {[
              {
                icon: Brain, 
                title: "AI-Powered Analysis", 
                description: "Advanced machine learning algorithms analyze your resume, skills, and career goals to provide personalized recommendations.",
                color: "#06b6d4",
                delay: 0
              },
              {
                icon: Target, 
                title: "Smart Career Mapping", 
                description: "Get customized career roadmaps with step-by-step guidance tailored to your industry and aspirations.",
                color: "#3b82f6",
                delay: 0.2
              },
              {
                icon: BarChart3, 
                title: "Performance Tracking", 
                description: "Monitor your progress with detailed analytics and insights that help you stay on track.",
                color: "#8b5cf6",
                delay: 0.4
              },
              {
                icon: MessageSquare, 
                title: "AI Interview Coach", 
                description: "Practice with our intelligent interview simulator that adapts to your industry and role.",
                color: "#06b6d4",
                delay: 0.6
              },
              {
                icon: Shield, 
                title: "ATS Optimization", 
                description: "Ensure your resume passes through Applicant Tracking Systems with our advanced optimization tools.",
                color: "#3b82f6",
                delay: 0.8
              },
              {
                icon: Sparkles, 
                title: "Real-time Feedback", 
                description: "Get instant, actionable feedback on your career materials and interview performance.",
                color: "#8b5cf6",
                delay: 1.0
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card-premium"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: feature.delay, duration: 0.6 }}
                whileHover={{ 
                  y: -10,
                  rotateY: 5,
                  rotateX: 5,
                  transition: { duration: 0.3 }
                }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="feature-icon-premium"
                  style={{ 
                    background: `linear-gradient(135deg, ${feature.color}40, ${feature.color}80)`,
                    boxShadow: `0 10px 30px ${feature.color}30`
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    rotateY: 180,
                    transition: { duration: 0.5 }
                  }}
                >
                  <feature.icon size={28} color={feature.color} />
                </motion.div>
                
                <h3 className="feature-title-premium">{feature.title}</h3>
                <p className="feature-description-premium">{feature.description}</p>
                
                <motion.div
                  className="feature-glow"
                  animate={{
                    opacity: [0, 0.3, 0],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Ultra-Premium CTA Section */}
      <motion.section id="pricing" className="premium-cta-section">
        <div className="cta-background-premium">
          <div className="cta-orb cta-orb-1" />
          <div className="cta-orb cta-orb-2" />
          <div className="cta-orb cta-orb-3" />
        </div>
        
        <motion.div 
          className="cta-container-premium"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="cta-title-premium"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to Transform Your Career?
          </motion.h2>
          
          <motion.p 
            className="cta-subtitle-premium"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Join thousands of professionals who have accelerated their careers with our AI-powered platform.
          </motion.p>
          
          <motion.button
            className="cta-button-premium"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 60px rgba(6, 182, 212, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            viewport={{ once: true }}
          >
            <span>Start Your Free Trial</span>
            <motion.div
              className="button-shimmer"
              animate={{
                x: [-100, 300],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut"
              }}
            />
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </motion.section>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            className="demo-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDemo(false)}
          >
            <motion.div
              className="demo-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="demo-header">
                <h3>AI Career Counselor Demo</h3>
                <button 
                  className="demo-close-button"
                  onClick={() => setShowDemo(false)}
                >
                  ×
                </button>
              </div>
              <div className="demo-content">
                <div className="demo-interactive-3d">
                  {/* 3D Interactive Demo Elements */}
                  <div className="demo-stage">


                    <motion.div 
                      className="demo-card-3d ai-brain"
                      animate={{
                        rotateX: [0, 20, 0],
                        scale: [1, 1.1, 1],
                        rotateZ: [0, 5, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                      }}
                    >
                      <MessageSquare size={40} />
                      <span>Interview Prep</span>
                      <div className="card-glow ai-glow"></div>
                    </motion.div>

                    <motion.div 
                      className="demo-card-3d results-card"
                      animate={{
                        rotateY: [0, -15, 0],
                        z: [0, 50, 0],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }}
                    >
                      <Award size={32} />
                      <span>Job Offers</span>
                      <div className="card-glow results-glow"></div>
                    </motion.div>
                  </div>

                  <div className="demo-flow-lines">
                    <motion.div 
                      className="flow-line line-1"
                      animate={{
                        opacity: [0, 1, 0],
                        pathLength: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div 
                      className="flow-line line-2"
                      animate={{
                        opacity: [0, 1, 0],
                        pathLength: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                      }}
                    />
                  </div>

                  <div className="demo-description">
                    <h4>See How We Help You Get Hired</h4>
                    <p>From career planning to interview prep, we guide you through every step of landing your next job.</p>
                  </div>

                  <motion.button
                    className="demo-cta-button-3d"
                    whileHover={{ 
                      scale: 1.05,
                      rotateX: 10,
                      boxShadow: "0 20px 40px rgba(6, 182, 212, 0.4)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowDemo(false);
                      onGetStarted();
                    }}
                  >
                    <span>Start My Career Review</span>
                    <Rocket size={20} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Professional Footer Section */}
      <footer className="premium-footer">
        <div className="footer-content">
          <motion.div 
            className="footer-main"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="footer-brand">
              <motion.div 
                className="footer-logo"
                whileHover={{ scale: 1.05, rotateY: 10 }}
              >
                <Brain size={32} />
                <span>AI Career Counselor</span>
              </motion.div>
              <p className="footer-tagline">
                Revolutionizing career guidance with advanced AI technology
              </p>
            </div>

            <div className="footer-social">
              <motion.div 
                className="social-links-3d"
                whileHover={{ 
                  rotateX: 10, 
                  rotateY: 10, 
                  scale: 1.02,
                  boxShadow: "0 20px 40px rgba(6, 182, 212, 0.2)"
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="social-info">
                  <h5>Connect with YUG KUNJADIYA</h5>
                  
                  <div className="social-links">
                    <motion.a
                      href="https://github.com/Yug-Kunjadiya"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link github-link"
                      whileHover={{ scale: 1.1, rotateZ: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                      <span>GitHub</span>
                    </motion.a>

                    <motion.a
                      href="https://www.linkedin.com/in/yug-kunjadiya-a8223b314/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link linkedin-link"
                      whileHover={{ scale: 1.1, rotateZ: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <span>LinkedIn</span>
                    </motion.a>
                  </div>
                </div>
                <div className="social-card-glow"></div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="footer-bottom"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="footer-divider"></div>
            <div className="footer-bottom-content">
              <p>&copy; 2025 AI Career Counselor. Powered by YUG KUNJADIYA using React & Advanced AI</p>
              <div className="footer-tech-stack">
                <span className="tech-badge">React</span>
                <span className="tech-badge">TypeScript</span>
                <span className="tech-badge">Framer Motion</span>
                <span className="tech-badge">Gemini AI</span>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>


    </div>
  );
};

export default PremiumLandingPage;