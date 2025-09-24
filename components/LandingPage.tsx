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

  // Transform values for parallax effects
  const heroY = useTransform(scrollY, [0, 300], [0, -50]);
  const backgroundY = useTransform(scrollY, [0, 500], [0, -100]);

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
            {['Features', 'Demo', 'Pricing', 'Contact'].map((item, index) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="nav-item"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                {item}
              </motion.a>
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
              <span>Powered by Advanced AI</span>
              <motion.div
                className="badge-glow"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut"
                }}
              />
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
                Transform Your Career
              </motion.span>
              <motion.span
                className="title-line title-gradient"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.8 }}
              >
                With AI Precision
              </motion.span>
              <motion.span
                className="title-line"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                & Expert Guidance
              </motion.span>
            </motion.h1>

            {/* Enhanced Subtitle */}
            <motion.p 
              className="hero-subtitle-premium"
              variants={itemVariants}
              transition={{ delay: 1.4 }}
            >
              Experience the future of career development with our revolutionary AI-powered platform. 
              Get personalized insights, real-time feedback, and strategic guidance that adapts to your unique journey.
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
                <span>Start Your Journey</span>
                <motion.div
                  className="button-glow"
                  animate={{
                    x: [-100, 200],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut"
                  }}
                />
                <Rocket size={20} />
              </motion.button>

              <motion.button
                className="cta-secondary-premium"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
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
                <div className="trust-number">50K+</div>
                <div className="trust-label">Careers Transformed</div>
              </div>
              <div className="trust-item">
                <div className="trust-number">98%</div>
                <div className="trust-label">Success Rate</div>
              </div>
              <div className="trust-item">
                <div className="trust-number">4.9/5</div>
                <div className="trust-label">User Rating</div>
              </div>
            </motion.div>
          </motion.div>

          {/* 3D Floating Cards */}
          <motion.div className="floating-cards-3d">
            <FloatingCard className="floating-card-1" delay={0}>
              <div className="card-content-3d">
                <Brain className="card-icon-3d" />
                <div className="card-text-3d">
                  <div className="card-title-3d">AI Analysis</div>
                  <div className="card-value-3d">Advanced</div>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard className="floating-card-2" delay={1}>
              <div className="card-content-3d">
                <TrendingUp className="card-icon-3d" />
                <div className="card-text-3d">
                  <div className="card-title-3d">Success Rate</div>
                  <div className="card-value-3d">98.5%</div>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard className="floating-card-3" delay={2}>
              <div className="card-content-3d">
                <Users className="card-icon-3d" />
                <div className="card-text-3d">
                  <div className="card-title-3d">Active Users</div>
                  <div className="card-value-3d">50K+</div>
                </div>
              </div>
            </FloatingCard>
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
      <motion.section className="premium-features-section">
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
      <motion.section className="premium-cta-section">
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
    </div>
  );
};

export default PremiumLandingPage;